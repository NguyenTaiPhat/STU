import { type ViewModule, type AppState } from '../types/portal.types';
import { stateStore } from '../store/stateStore';
import { icons } from '../utils/svgIcons';
import { getAcademicRank } from '../utils/formatters';
import { getCumulativeGPA4, getCumulativeCredits } from '../actions/gradeActions';
import { exportGradesExcel } from '../utils/excelExport';
import { showToast } from '../components/Toast';
import { animateCountUp, staggerEntrance } from '../utils/animationEngine';

export class GradesView implements ViewModule {
  private container: HTMLElement | null = null;
  private unsub: (() => void) | null = null;
  private activeSubTab: 'grades' | 'attendance' = 'grades';

  mount(container: HTMLElement): void {
    this.container = container;
    this.render(stateStore.getState());
    this.unsub = stateStore.subscribe(s => this.render(s));
  }

  unmount(): void {
    this.unsub?.();
    this.unsub = null;
    this.container = null;
  }

  private render(s: AppState): void {
    if (!this.container) return;

    const gpa4 = getCumulativeGPA4(s.grades);
    const credits = getCumulativeCredits(s.grades);

    this.container.innerHTML = `
      <div class="flex items-center justify-between flex-wrap gap-md" style="margin-bottom:var(--space-xl)">
        <h1 class="view-title flex items-center gap-sm" style="margin-bottom:0">
          ${icons.graduationCap(24)} XEM ĐIỂM &amp; ĐIỂM DANH
        </h1>
        <div class="flex items-center gap-sm mobile-tab-group">
          <button id="btn-tab-grades" class="neo-btn ${this.activeSubTab === 'grades' ? 'neo-btn--primary' : 'neo-btn--ghost'} neo-btn--sm">
            <span class="hide-mobile">Bảng Điểm Học Tập</span>
            <span class="hide-desktop">Bảng Điểm</span>
          </button>
          <button id="btn-tab-att" class="neo-btn ${this.activeSubTab === 'attendance' ? 'neo-btn--primary' : 'neo-btn--ghost'} neo-btn--sm">
            <span class="hide-mobile">Kết Quả Điểm Danh</span>
            <span class="hide-desktop">Điểm Danh</span>
          </button>
        </div>
      </div>

      <div class="kpi-grid" id="grades-kpi-grid">
        <div class="neo-card kpi-card">
          <div class="kpi-card__icon" style="background:var(--neo-primary);color:#FFF">${icons.award(22)}</div>
          <div class="kpi-card__value" id="grades-gpa-val">0.00</div>
          <div class="kpi-card__label">GPA Tích lũy (Hệ 4)</div>
        </div>
        <div class="neo-card kpi-card">
          <div class="kpi-card__icon" style="background:var(--neo-cyan);color:#FFF">${icons.bookOpen(22)}</div>
          <div class="kpi-card__value">${credits} / 14</div>
          <div class="kpi-card__label">Tín chỉ Đã tích lũy</div>
        </div>
        <div class="neo-card kpi-card">
          <div class="kpi-card__icon" style="background:var(--neo-lime);color:#FFF">${icons.check(22)}</div>
          <div class="kpi-card__value">100%</div>
          <div class="kpi-card__label">Tỷ lệ Chuyên cần</div>
        </div>
        <div class="neo-card kpi-card">
          <div class="kpi-card__icon" style="background:var(--neo-lavender);color:#FFF">${icons.user(22)}</div>
          <div class="kpi-card__value">${gpa4 > 0 ? getAcademicRank(gpa4) : 'Chưa xếp loại'}</div>
          <div class="kpi-card__label">Xếp loại Học lực</div>
        </div>
      </div>

      <div id="grades-sub-slot"></div>
    `;

    staggerEntrance(this.container.querySelector('#grades-kpi-grid'), '.kpi-card', 'anim-fade-in-up', 60, 30);

    const gpaEl = this.container.querySelector('#grades-gpa-val') as HTMLElement;
    if (gpaEl && gpa4 > 0) {
      animateCountUp(gpaEl, 0, gpa4, 700, val => val.toFixed(2));
    } else if (gpaEl) {
      gpaEl.textContent = '0.00';
    }

    this.container.querySelector('#btn-tab-grades')?.addEventListener('click', () => {
      this.activeSubTab = 'grades';
      this.render(s);
    });
    this.container.querySelector('#btn-tab-att')?.addEventListener('click', () => {
      this.activeSubTab = 'attendance';
      this.render(s);
    });

    const slot = this.container.querySelector('#grades-sub-slot')!;
    if (this.activeSubTab === 'grades') {
      this.renderGradesTable(slot, s);
    } else {
      this.renderAttendanceTable(slot);
    }
  }

  private renderGradesTable(slot: Element, s: AppState): void {
    const sem = s.grades[0];
    const courses = sem ? sem.courses : [];

    slot.innerHTML = `
      <div class="neo-card" style="margin-bottom:var(--space-xl);padding:0;overflow:hidden">
        <div class="flex items-center justify-between flex-wrap gap-md mobile-filter-stack" style="padding:var(--space-md) var(--space-lg);border-bottom:var(--neo-border);background:var(--neo-bg-secondary)">
          <span class="text-heading text-bold" style="font-size:13px;white-space:nowrap;overflow-x:auto;scrollbar-width:none">XEM ĐIỂM HỌC KỲ 1 - NĂM HỌC 2026 - 2027</span>
          <div class="flex items-center gap-sm mobile-actions-stack">
            <button id="btn-print-gr" class="neo-btn neo-btn--ghost neo-btn--sm" style="padding:4px 10px;font-size:11.5px">${icons.printer(13)} <span class="hide-mobile">In</span></button>
            <button id="btn-excel-gr" class="neo-btn neo-btn--success neo-btn--sm" style="padding:4px 10px;font-size:11.5px">${icons.download(13)} Xuất Excel</button>
          </div>
        </div>

        <div class="neo-table-wrap" style="border:none;box-shadow:none;border-radius:0">
          <table class="neo-table">
            <thead>
              <tr>
                <th>Stt</th>
                <th>Mã MH</th>
                <th>Nhóm/tổ môn học</th>
                <th>Tên môn học</th>
                <th style="text-align:center">Số tín chỉ</th>
                <th style="text-align:center">Điểm quá trình</th>
                <th style="text-align:center">Điểm kiểm tra giữa kỳ</th>
                <th style="text-align:center">Điểm thi</th>
                <th style="text-align:center">Điểm TK (Thi lần 2)</th>
                <th style="text-align:center">Điểm TK (Thi lần 3)</th>
                <th style="text-align:center">Điểm TK (10)</th>
                <th style="text-align:center">Kết quả</th>
                <th style="text-align:center">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              ${courses.length > 0 ? courses.map((c, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td class="text-mono text-bold" style="color:var(--neo-primary-text, #2563eb)">${c.courseCode}</td>
                  <td>01</td>
                  <td class="text-semibold">${c.courseName}</td>
                  <td style="text-align:center" class="text-mono">${c.credits}</td>
                  <td style="text-align:center" class="text-mono">${c.attendance ?? '-'}</td>
                  <td style="text-align:center" class="text-mono">${c.midterm ?? '-'}</td>
                  <td style="text-align:center" class="text-mono">${c.final ?? '-'}</td>
                  <td style="text-align:center" class="text-mono">-</td>
                  <td style="text-align:center" class="text-mono">-</td>
                  <td style="text-align:center" class="text-mono text-bold text-coral">${c.total10 ?? '-'}</td>
                  <td style="text-align:center"><span class="neo-badge neo-badge--lime">Đạt</span></td>
                  <td style="text-align:center"><button class="neo-btn neo-btn--ghost neo-btn--sm">Xem</button></td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="13" class="text-center text-secondary" style="padding:var(--space-2xl);font-style:italic">
                    Không tìm thấy dữ liệu (Sinh viên Khóa 2026 - 2030 chưa bước vào kỳ thi).
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;

    slot.querySelector('#btn-print-gr')?.addEventListener('click', () => window.print());
    slot.querySelector('#btn-excel-gr')?.addEventListener('click', () => {
      exportGradesExcel(s.profile.id, s.profile.fullName);
      showToast('Đã xuất file Bảng điểm học tập thành công!', 'success');
    });
  }

  private renderAttendanceTable(slot: Element): void {
    slot.innerHTML = `
      <div class="neo-card" style="margin-bottom:var(--space-xl);padding:0;overflow:hidden">
        <div class="flex items-center justify-between flex-wrap gap-md mobile-filter-stack" style="padding:var(--space-md) var(--space-lg);border-bottom:var(--neo-border);background:var(--neo-bg-secondary)">
          <div class="flex items-center gap-md w-full mobile-filter-stack">
            <span class="text-heading text-bold" style="font-size:13px;white-space:nowrap">XEM KẾT QUẢ ĐIỂM DANH</span>
            <select class="neo-select mobile-select" style="min-width:240px">
              <option>Học kỳ 1 - Năm học 2026 - 2027</option>
            </select>
          </div>
        </div>

        <div class="neo-table-wrap" style="border:none;box-shadow:none;border-radius:0">
          <table class="neo-table">
            <thead>
              <tr>
                <th>Ngày học</th>
                <th>Mã MH</th>
                <th>Tên môn học</th>
                <th>Phòng</th>
                <th>Tiết BĐ</th>
                <th>Số tiết</th>
                <th>Điểm danh</th>
                <th>Giảng viên</th>
                <th>Số điện thoại</th>
                <th>Email</th>
                <th>Tóm tắt nội dung buổi dạy, kiểm tra</th>
                <th>Xem</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="12" class="text-center text-secondary" style="padding:var(--space-2xl);font-style:italic">
                  Không tìm thấy dữ liệu (Học kỳ 1 chính thức bắt đầu từ ngày 14/09/2026).
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}
