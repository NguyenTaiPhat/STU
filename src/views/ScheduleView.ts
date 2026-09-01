import { type ViewModule, type AppState, type Course, CourseType } from '../types/portal.types';
import { stateStore } from '../store/stateStore';
import { icons } from '../utils/svgIcons';
import { getDayName, periodToTime, getPeriodStartTime } from '../utils/formatters';
import { exportScheduleExcel } from '../utils/excelExport';
import { showToast } from '../components/Toast';

const DAYS = [2, 3, 4, 5, 6, 7, 1];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

function generateMonthlyCalendar(serverTimeStr?: string): string {
  let now = new Date();
  if (serverTimeStr) {
    const parts = serverTimeStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (parts) {
      now = new Date(Number(parts[3]), Number(parts[2]) - 1, Number(parts[1]));
    }
  }

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();

  const monthTitle = `Tháng ${currentMonth + 1} / ${currentYear}`;

  const firstDay = new Date(currentYear, currentMonth, 1);
  const startDayOfWeek = firstDay.getDay();
  const vnStartOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  let daysHtml = '';

  for (let i = vnStartOffset - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    daysHtml += `<div style="opacity:0.3;padding:4px 0">${d}</div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = day === currentDate;
    const dayOfWeek = (vnStartOffset + day - 1) % 7;
    const isSunday = dayOfWeek === 6;

    if (isToday) {
      daysHtml += `<div style="color:var(--neo-primary);font-weight:800;font-size:13.5px;background:var(--neo-primary-light);border-radius:6px;padding:4px 0">${day}</div>`;
    } else if (isSunday) {
      daysHtml += `<div style="color:var(--neo-coral);padding:4px 0">${day}</div>`;
    } else {
      daysHtml += `<div style="padding:4px 0">${day}</div>`;
    }
  }

  const totalSlots = vnStartOffset + daysInMonth;
  const remainingSlots = (7 - (totalSlots % 7)) % 7;
  for (let nextDay = 1; nextDay <= remainingSlots; nextDay++) {
    const dayOfWeek = (totalSlots + nextDay - 1) % 7;
    const isSunday = dayOfWeek === 6;
    daysHtml += `<div style="opacity:0.3;padding:4px 0;${isSunday ? 'color:var(--neo-coral)' : ''}">${nextDay}</div>`;
  }

  return `
    <div class="text-bold text-heading" style="margin-bottom:var(--space-md);font-size:14px">${monthTitle}</div>
    <div style="display:grid;grid-template-columns:repeat(7, 1fr);gap:4px;font-size:12px;font-weight:600">
      <div style="color:var(--neo-text-secondary);padding-bottom:4px">T2</div>
      <div style="color:var(--neo-text-secondary);padding-bottom:4px">T3</div>
      <div style="color:var(--neo-text-secondary);padding-bottom:4px">T4</div>
      <div style="color:var(--neo-text-secondary);padding-bottom:4px">T5</div>
      <div style="color:var(--neo-text-secondary);padding-bottom:4px">T6</div>
      <div style="color:var(--neo-text-secondary);padding-bottom:4px">T7</div>
      <div style="color:var(--neo-coral);padding-bottom:4px">CN</div>
      ${daysHtml}
    </div>
  `;
}

export class ScheduleView implements ViewModule {
  private container: HTMLElement | null = null;
  private unsub: (() => void) | null = null;
  private activeTab: 'week' | 'semester' = 'week';
  private selectedWeekNumber: number = 1;

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

    this.container.innerHTML = `
      <div class="flex items-center justify-between flex-wrap gap-md" style="margin-bottom:var(--space-lg)">
        <h1 class="view-title flex items-center gap-sm" style="margin-bottom:0">
          ${icons.calendar(22, 'var(--neo-primary)')}
          <span>${this.activeTab === 'week' ? 'THỜI KHÓA BIỂU DẠNG TUẦN' : 'THỜI KHÓA BIỂU DẠNG HỌC KỲ'}</span>
        </h1>
        <div class="flex items-center gap-sm mobile-tab-group">
          <button id="tab-btn-week" class="neo-btn ${this.activeTab === 'week' ? 'neo-btn--primary' : 'neo-btn--ghost'} neo-btn--sm">
            <span class="hide-mobile">Thời khóa biểu dạng tuần</span>
            <span class="hide-desktop">TKB Tuần</span>
          </button>
          <button id="tab-btn-semester" class="neo-btn ${this.activeTab === 'semester' ? 'neo-btn--primary' : 'neo-btn--ghost'} neo-btn--sm">
            <span class="hide-mobile">Thời khóa biểu dạng học kỳ</span>
            <span class="hide-desktop">TKB Học kỳ</span>
          </button>
        </div>
      </div>

      <div id="schedule-tab-content"></div>
    `;

    this.container.querySelector('#tab-btn-week')?.addEventListener('click', () => {
      this.activeTab = 'week';
      this.render(s);
    });
    this.container.querySelector('#tab-btn-semester')?.addEventListener('click', () => {
      this.activeTab = 'semester';
      this.render(s);
    });

    const slot = this.container.querySelector('#schedule-tab-content')!;
    if (this.activeTab === 'week') {
      this.renderWeekSchedule(slot, s);
    } else {
      this.renderSemesterSchedule(slot, s);
    }
  }

  private renderWeekSchedule(slot: Element, s: AppState): void {
    const rawWeeks: any[] = s.rawLiveSchedule?.data?.ds_tuan_tkb || [];
    const noticeText = s.officialNotice || s.profile?.officialNotice || '[Tân sinh viên khóa 2026 không cần thực hiện đăng ký môn học; thời khóa biểu sẽ được thông báo trong thời gian từ ngày 01/09/2026 đến ngày 05/09/2026]';

    let weekOptions = '';
    if (rawWeeks.length > 0) {
      weekOptions = rawWeeks.map(w => `
        <option value="${w.tuan_hoc_ky}" ${w.tuan_hoc_ky === this.selectedWeekNumber ? 'selected' : ''}>
          ${w.thong_tin_tuan}
        </option>
      `).join('');
    } else {
      weekOptions = `<option value="1">Tuần 1 [từ 14/09/2026 đến 20/09/2026]</option>`;
    }

    slot.innerHTML = `
      <div class="neo-card anim-fade-in-up" style="margin-bottom:var(--space-lg);padding:var(--space-md) var(--space-lg)">
        <div class="flex items-center justify-between flex-wrap gap-md mobile-filter-stack">
          <div class="flex items-center gap-sm flex-wrap w-full mobile-filter-stack">
            <select class="neo-select mobile-select" style="min-width:210px;padding:6px 12px;font-size:12.5px">
              <option>Học kỳ 1 - Năm học 2026 - 2027</option>
            </select>
            <select class="neo-select mobile-select" style="min-width:170px;padding:6px 12px;font-size:12.5px">
              <option>Thời khóa biểu cá nhân</option>
            </select>
            <select id="select-week" class="neo-select mobile-select" style="min-width:270px;padding:6px 12px;font-size:12.5px">
              ${weekOptions}
            </select>
          </div>
          <div class="flex items-center gap-sm mobile-actions-stack">
            <button id="btn-print-sch" class="neo-btn neo-btn--ghost neo-btn--sm">${icons.printer(14)} <span class="hide-mobile">In</span></button>
            <button id="btn-excel-sch" class="neo-btn neo-btn--success neo-btn--sm">${icons.download(14)} Xuất Excel</button>
          </div>
        </div>
      </div>

      <div class="neo-card anim-fade-in-up anim-delay-1" style="margin-bottom:var(--space-md);background:var(--neo-bg-secondary);border-left:4px solid var(--neo-amber);padding:var(--space-md)">
        <div class="flex items-start gap-sm">
          <span class="neo-badge neo-badge--warning" style="font-size:10px;padding:3px 8px;flex-shrink:0;margin-top:2px">THÔNG BÁO TỪ TRƯỜNG STU</span>
          <div class="text-secondary" style="font-size:12px;line-height:1.5;color:var(--neo-text-primary)">
            <strong>${noticeText}</strong>
            <div style="margin-top:4px;font-size:11.5px;color:var(--neo-text-secondary)">
              Tân sinh viên Khóa 2026 - 2030 bắt đầu học kỳ 1 từ ngày <strong>14/09/2026</strong>. Lịch phân phòng và ca học chi tiết đang được Nhà trường cập nhật trực tiếp trên hệ thống AMIS STU.
            </div>
          </div>
        </div>
      </div>

      <div class="neo-card anim-fade-in-scale anim-delay-2" style="margin-bottom:var(--space-xl);padding:0;overflow:hidden">
        <div id="schedule-grid-wrap" class="overflow-auto"></div>
      </div>

      <h2 class="view-subtitle flex items-center gap-sm anim-fade-in-up anim-delay-3" style="margin-top:0">
        ${icons.settings(18, 'var(--neo-primary)')} TIẾN TRÌNH HỌC TẬP
      </h2>

      <div class="neo-card anim-fade-in-up anim-delay-4" style="padding:var(--space-xl)">
        <div class="flex items-center justify-between" style="margin-bottom:var(--space-md)">
          <div>
            <span class="text-bold" style="font-size:14.5px">Học kỳ 1 - Năm học 2026 - 2027</span>
            <div class="text-xs text-secondary" style="margin-top:2px">Ngày BĐ: 14/09/2026 | Ngày KT: 13/09/2027</div>
          </div>
          <span class="neo-badge neo-badge--lime">HK 1-2026</span>
        </div>
        <div class="neo-progress" style="margin-bottom:var(--space-xl)">
          <div class="neo-progress__fill" style="width:3%"></div>
        </div>

        <div style="max-width:340px;margin:0 auto;text-align:center">
          ${generateMonthlyCalendar(s.serverTime)}
        </div>
      </div>
    `;

    const weekSelect = slot.querySelector('#select-week') as HTMLSelectElement;
    weekSelect?.addEventListener('change', (e) => {
      this.selectedWeekNumber = Number((e.target as HTMLSelectElement).value) || 1;
      this.renderWeekGrid(slot, s.allCourses, rawWeeks);
    });

    this.renderWeekGrid(slot, s.allCourses, rawWeeks);
    slot.querySelector('#btn-print-sch')?.addEventListener('click', () => window.print());
    slot.querySelector('#btn-excel-sch')?.addEventListener('click', () => {
      exportScheduleExcel();
      showToast('Đã xuất file Thời khóa biểu tuần thành công!', 'success');
    });
  }

  private renderSemesterSchedule(slot: Element, _s: AppState): void {
    slot.innerHTML = `
      <div class="neo-card" style="margin-bottom:var(--space-lg);padding:var(--space-md) var(--space-lg)">
        <div class="flex items-center justify-between flex-wrap gap-md mobile-filter-stack">
          <div class="flex items-center gap-sm flex-wrap w-full mobile-filter-stack">
            <select class="neo-select mobile-select" style="min-width:210px;padding:6px 12px;font-size:12.5px">
              <option>Học kỳ 1 - Năm học 2026 - 2027</option>
            </select>
            <select class="neo-select mobile-select" style="min-width:170px;padding:6px 12px;font-size:12.5px">
              <option>Thời khóa biểu cá nhân</option>
            </select>
          </div>
          <div class="flex items-center gap-sm mobile-actions-stack">
            <button id="btn-print-sem" class="neo-btn neo-btn--ghost neo-btn--sm">${icons.printer(14)} <span class="hide-mobile">In</span></button>
            <button id="btn-excel-sem" class="neo-btn neo-btn--success neo-btn--sm">${icons.download(14)} Xuất Excel</button>
          </div>
        </div>
      </div>

      <div class="neo-card" style="padding:0;overflow:hidden">
        <div class="neo-table-wrap" style="border:none;box-shadow:none;border-radius:0">
          <table class="neo-table">
            <thead>
              <tr>
                <th style="width:100px">Mã MH</th>
                <th>Tên môn học</th>
                <th>Ghi chú</th>
                <th style="text-align:center">Nhóm tổ</th>
                <th style="text-align:center">Số TC</th>
                <th>Lớp</th>
                <th style="text-align:center">Thứ</th>
                <th style="text-align:center">Tiết BĐ</th>
                <th style="text-align:center">Số tiết</th>
                <th style="text-align:center">Phòng</th>
                <th>Giảng viên</th>
                <th>Thời gian học</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="12" style="text-align:center;padding:var(--space-3xl) var(--space-xl);color:var(--neo-text-secondary)">
                  <div style="font-size:14px;font-weight:600;margin-bottom:4px">Không tìm thấy dữ liệu</div>
                  <div class="text-xs">Chưa có lịch học được phân bổ trong học kỳ này.</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    slot.querySelector('#btn-print-sem')?.addEventListener('click', () => window.print());
    slot.querySelector('#btn-excel-sem')?.addEventListener('click', () => {
      exportScheduleExcel();
      showToast('Đã xuất file Thời khóa biểu học kỳ thành công!', 'success');
    });
  }

  private renderWeekGrid(slot: Element, _courses: Course[], rawWeeks: any[] = []): void {
    const wrap = slot.querySelector('#schedule-grid-wrap');
    if (!wrap) return;
    wrap.innerHTML = '';

    const currentWeekObj = rawWeeks.find(w => w.tuan_hoc_ky === this.selectedWeekNumber);

    const grid = document.createElement('div');
    grid.className = 'schedule-week-grid';
    grid.style.minWidth = '860px';

    const dayLabels: Record<number, string> = {
      2: 'Thứ 2',
      3: 'Thứ 3',
      4: 'Thứ 4',
      5: 'Thứ 5',
      6: 'Thứ 6',
      7: 'Thứ 7',
      1: 'Chủ Nhật'
    };

    grid.innerHTML = '<div class="schedule-week-grid__header">Tiết</div>';
    DAYS.forEach(d => {
      const h = document.createElement('div');
      h.className = 'schedule-week-grid__header';
      let dateInfo = '';
      if (currentWeekObj?.ngay_bat_dau) {
        dateInfo = ` (${currentWeekObj.ngay_bat_dau.slice(0, 5)})`;
      }
      h.textContent = `${dayLabels[d]}${d === 2 && currentWeekObj ? dateInfo : ''}`;
      grid.appendChild(h);
    });

    PERIODS.forEach(p => {
      const period = document.createElement('div');
      period.className = 'schedule-week-grid__period';
      period.innerHTML = `<div>Tiết ${p}</div><div style="font-size:9px;opacity:0.6">${getPeriodStartTime(p)}</div>`;
      grid.appendChild(period);

      DAYS.forEach(d => {
        const cell = document.createElement('div');
        cell.className = 'schedule-week-grid__cell';
        grid.appendChild(cell);
      });
    });

    wrap.appendChild(grid);
  }
}
