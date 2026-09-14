import { type ViewModule, type AppState, type Course, CourseType } from '../types/portal.types';
import { stateStore } from '../store/stateStore';
import { icons } from '../utils/svgIcons';
import { getDayName } from '../utils/formatters';
import { exportCTDTExcel } from '../utils/excelExport';
import { printCTDTSheet } from '../utils/printHelper';
import { registerCourse, hasScheduleConflict } from '../actions/courseActions';
import { showToast } from '../components/Toast';
import { staggerEntrance, attachRipple } from '../utils/animationEngine';

export class RegistrationView implements ViewModule {
  private container: HTMLElement | null = null;
  private unsub: (() => void) | null = null;
  private activeSubTab: 'ctdt' | 'register' = 'ctdt';
  private isSimulationMode = false;
  private searchQuery = '';

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
        <h1 class="view-title" style="margin-bottom:0">
          ${icons.bookOpen(22, 'var(--neo-primary)')}
          <span>CHƯƠNG TRÌNH ĐÀO TẠO &amp; ĐĂNG KÝ MÔN HỌC</span>
        </h1>
        <div class="flex items-center gap-sm mobile-tab-group">
          <button id="tab-btn-ctdt" class="neo-btn ${this.activeSubTab === 'ctdt' ? 'neo-btn--primary' : 'neo-btn--ghost'} neo-btn--sm">
            <span class="hide-mobile">Xem Chương trình đào tạo</span>
            <span class="hide-desktop">Xem CTĐT</span>
          </button>
          <button id="tab-btn-reg" class="neo-btn ${this.activeSubTab === 'register' ? 'neo-btn--primary' : 'neo-btn--ghost'} neo-btn--sm">
            <span class="hide-mobile">Cổng Đăng ký Môn học</span>
            <span class="hide-desktop">Đăng ký Môn</span>
          </button>
        </div>
      </div>

      <div id="subtab-content"></div>
    `;

    this.container.querySelector('#tab-btn-ctdt')?.addEventListener('click', () => {
      this.activeSubTab = 'ctdt';
      this.render(s);
    });
    this.container.querySelector('#tab-btn-reg')?.addEventListener('click', () => {
      this.activeSubTab = 'register';
      this.render(s);
    });

    const slot = this.container.querySelector('#subtab-content')!;
    if (this.activeSubTab === 'ctdt') {
      this.renderCTDT(slot, s);
    } else {
      this.renderRegistration(slot, s);
    }
  }

  private renderCTDT(slot: Element, s: AppState): void {
    slot.innerHTML = `
      <div class="neo-card anim-fade-in-up" style="margin-bottom:var(--space-xl);padding:var(--space-lg)">
        <div class="flex items-center justify-between flex-wrap gap-md mobile-filter-stack" style="margin-bottom:var(--space-md)">
          <div class="flex items-center gap-md flex-wrap w-full mobile-filter-stack">
            <span class="text-heading text-bold flex items-center gap-xs" style="white-space:nowrap;font-size:14px;color:var(--neo-text)">
              ${icons.settings(16, 'var(--neo-primary)')} CHƯƠNG TRÌNH ĐÀO TẠO
            </span>
            <select class="neo-select mobile-select" style="min-width:180px;padding:6px 12px;font-size:12.5px">
              <option>CTĐT kế hoạch</option>
              <option>CTĐT tiến độ</option>
            </select>
          </div>
          <div class="flex items-center gap-sm mobile-actions-stack">
            <button id="btn-print-ctdt" class="neo-btn neo-btn--ghost neo-btn--sm">${icons.printer(14)} <span class="hide-mobile">In</span></button>
            <button id="btn-excel-ctdt" class="neo-btn neo-btn--success neo-btn--sm">${icons.download(14)} Xuất Excel</button>
          </div>
        </div>

        <div class="neo-table-wrap" style="border:1px solid var(--neo-border-color);box-shadow:none">
          <table class="neo-table">
            <thead>
              <tr>
                <th style="width:50px;text-align:center">STT</th>
                <th style="width:120px">MÃ MH</th>
                <th>TÊN MÔN HỌC</th>
                <th style="text-align:center;width:80px">SỐ TC</th>
                <th style="text-align:center;width:110px">MÔN BẮT BUỘC</th>
                <th style="text-align:center;width:90px">TỔNG TIẾT</th>
                <th style="text-align:center;width:90px">LÝ THUYẾT</th>
                <th style="text-align:center;width:90px">THỰC HÀNH</th>
              </tr>
            </thead>
            <tbody id="ctdt-rows-body">
              ${(function() {
                const liveSemesters: any[] = s.rawLiveCurriculum?.data?.ds_CTDT_hocky || [];
                if (liveSemesters.length > 0) {
                  let html = '';
                  liveSemesters.forEach((sem: any) => {
                    const courses: any[] = sem.ds_CTDT_mon_hoc || [];
                    const semTc = courses.reduce((sum, c) => sum + (Number(c.so_tin_chi) || 0), 0);
                    html += `
                      <tr style="background:var(--neo-bg);font-weight:600">
                        <td colspan="3" style="color:var(--neo-text);font-weight:600">${sem.ten_hoc_ky || 'Học kỳ'}</td>
                        <td style="text-align:center" class="text-mono text-bold text-coral">${semTc} TC</td>
                        <td colspan="4"></td>
                      </tr>
                    `;
                    courses.forEach((c: any, idx: number) => {
                      html += `
                        <tr class="ctdt-row">
                          <td style="text-align:center">${idx + 1}</td>
                          <td class="text-mono text-bold" style="color:var(--neo-primary)">${c.ma_mon || ''}</td>
                          <td class="text-semibold">${c.ten_mon || ''}</td>
                          <td style="text-align:center" class="text-mono">${c.so_tin_chi || 0}</td>
                          <td style="text-align:center" class="text-bold">${c.mon_bat_buoc || 'x'}</td>
                          <td style="text-align:center" class="text-mono">${c.tong_tiet || (Number(c.so_tin_chi || 0) * 15)}</td>
                          <td style="text-align:center" class="text-mono">${c.ly_thuyet || '0'}</td>
                          <td style="text-align:center" class="text-mono">${c.thuc_hanh || '0'}</td>
                        </tr>
                      `;
                    });
                  });
                  return html;
                }
                return `
                  <tr style="background:var(--neo-bg);font-weight:600">
                    <td colspan="3" style="color:var(--neo-text);font-weight:600">Học kỳ 1 - Năm học 2026 - 2027</td>
                    <td style="text-align:center" class="text-mono text-bold text-coral">14 TC</td>
                    <td colspan="4"></td>
                  </tr>
                  <tr class="ctdt-row">
                    <td style="text-align:center">1</td>
                    <td class="text-mono text-bold" style="color:var(--neo-primary)">GS19007</td>
                    <td class="text-semibold">Tiếng Anh 1</td>
                    <td style="text-align:center" class="text-mono">2</td>
                    <td style="text-align:center" class="text-bold">x</td>
                    <td style="text-align:center" class="text-mono">45</td>
                    <td style="text-align:center" class="text-mono">15</td>
                    <td style="text-align:center" class="text-mono">0</td>
                  </tr>
                  <tr class="ctdt-row">
                    <td style="text-align:center">2</td>
                    <td class="text-mono text-bold" style="color:var(--neo-primary)">GS33001</td>
                    <td class="text-semibold">Toán A1 (Hàm 1 biến, chuỗi)</td>
                    <td style="text-align:center" class="text-mono">4</td>
                    <td style="text-align:center" class="text-bold">x</td>
                    <td style="text-align:center" class="text-mono">60</td>
                    <td style="text-align:center" class="text-mono">45</td>
                    <td style="text-align:center" class="text-mono">0</td>
                  </tr>
                  <tr class="ctdt-row">
                    <td style="text-align:center">3</td>
                    <td class="text-mono text-bold" style="color:var(--neo-primary)">GS43001</td>
                    <td class="text-semibold">Vật lý 1</td>
                    <td style="text-align:center" class="text-mono">3</td>
                    <td style="text-align:center" class="text-bold">x</td>
                    <td style="text-align:center" class="text-mono">45</td>
                    <td style="text-align:center" class="text-mono">30</td>
                    <td style="text-align:center" class="text-mono">0</td>
                  </tr>
                  <tr class="ctdt-row">
                    <td style="text-align:center">4</td>
                    <td class="text-mono text-bold" style="color:var(--neo-primary)">GS49004</td>
                    <td class="text-semibold">Thí nghiệm Vật lý_Phần 1</td>
                    <td style="text-align:center" class="text-mono">1</td>
                    <td style="text-align:center" class="text-bold">x</td>
                    <td style="text-align:center" class="text-mono">15</td>
                    <td style="text-align:center" class="text-mono">0</td>
                    <td style="text-align:center" class="text-mono">15</td>
                  </tr>
                  <tr class="ctdt-row">
                    <td style="text-align:center">5</td>
                    <td class="text-mono text-bold" style="color:var(--neo-primary)">GS59001</td>
                    <td class="text-semibold">Tin học đại cương</td>
                    <td style="text-align:center" class="text-mono">2</td>
                    <td style="text-align:center" class="text-bold">x</td>
                    <td style="text-align:center" class="text-mono">30</td>
                    <td style="text-align:center" class="text-mono">30</td>
                    <td style="text-align:center" class="text-mono">0</td>
                  </tr>
                  <tr class="ctdt-row">
                    <td style="text-align:center">6</td>
                    <td class="text-mono text-bold" style="color:var(--neo-primary)">GS59002</td>
                    <td class="text-semibold">Thực hành Tin học đại cương</td>
                    <td style="text-align:center" class="text-mono">2</td>
                    <td style="text-align:center" class="text-bold">x</td>
                    <td style="text-align:center" class="text-mono">45</td>
                    <td style="text-align:center" class="text-mono">0</td>
                    <td style="text-align:center" class="text-mono">30</td>
                  </tr>
                `;
              })()}
            </tbody>
          </table>
        </div>
      </div>
    `;

    staggerEntrance(slot.querySelector('#ctdt-rows-body'), '.ctdt-row', 'anim-fade-in-left', 40, 20);

    slot.querySelector('#btn-print-ctdt')?.addEventListener('click', () => {
      printCTDTSheet();
    });
    slot.querySelector('#btn-excel-ctdt')?.addEventListener('click', () => {
      exportCTDTExcel();
      showToast('Đã xuất file Chương trình đào tạo thành công!', 'success');
    });
  }

  private renderRegistration(slot: Element, s: AppState): void {
    if (!this.isSimulationMode) {
      slot.innerHTML = `
        <div class="neo-card anim-fade-in-up" style="margin-bottom:var(--space-lg);border-color:rgba(239, 68, 68, 0.3);background:var(--neo-coral-light);padding:var(--space-md) var(--space-lg)">
          <div class="flex items-center justify-between flex-wrap gap-sm">
            <div>
              <div class="text-bold text-coral flex items-center gap-xs" style="margin-bottom:4px;font-size:13.5px">
                ${icons.alertTriangle(15)} THÔNG BÁO ĐĂNG KÝ HỌC PHẦN BỔ SUNG HK HÈ (2025 - 2026):
              </div>
              <div class="text-sm" style="color:var(--neo-text)">
                Thời gian: <strong>29/06/2026 – 02/07/2026 (07:00 – 19:00)</strong>. Khóa cổng TTĐT: <strong>02/07/2026 (19:00)</strong>.<br>
                Môn mở đăng ký: <strong>(1) Lập trình cho thiết bị di động (MSMH: CS03038)</strong>; <strong>(2) Thực hành Lập trình cho thiết bị di động (MSMH: CS0304)</strong>.
              </div>
            </div>
            <button id="btn-toggle-sim" class="neo-btn neo-btn--ghost neo-btn--sm anim-pulse-primary" style="border:1px solid var(--neo-border-color)">
              ${icons.settings(13)} Chế độ Mô phỏng ĐKMH
            </button>
          </div>
        </div>

        <div class="neo-card anim-fade-in-scale anim-delay-1" style="margin-bottom:var(--space-xl);padding:var(--space-lg)">
          <div class="flex items-center justify-between flex-wrap gap-md" style="margin-bottom:var(--space-md)">
            <div class="flex items-center gap-md">
              <span class="text-heading text-bold" style="font-size:14.5px;color:var(--neo-text)">
                DANH SÁCH MÔN HỌC MỞ CHO ĐĂNG KÝ
              </span>
              <span class="neo-badge neo-badge--coral">Cổng đã khóa</span>
            </div>
          </div>

          <div class="neo-table-wrap" style="border:1px solid var(--neo-border-color);box-shadow:none;margin-bottom:var(--space-xl)">
            <table class="neo-table">
              <thead>
                <tr>
                  <th>Mã MH</th>
                  <th>Tên môn học</th>
                  <th>Số TC</th>
                  <th>Nhóm tổ</th>
                  <th>Lớp</th>
                  <th>Thứ</th>
                  <th>Tiết</th>
                  <th>Phòng</th>
                  <th>Giảng viên</th>
                  <th>Sĩ số</th>
                  <th>Còn lại</th>
                  <th>Học phí</th>
                  <th style="text-align:center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="13" style="text-align:center;padding:var(--space-2xl) var(--space-xl);color:var(--neo-text-secondary)">
                    <div style="font-size:13.5px;font-weight:600;margin-bottom:2px">Cổng đăng ký đợt học kỳ 1 đang tạm khóa</div>
                    <div class="text-xs">Sinh viên có thể bấm "Chế độ Mô phỏng ĐKMH" phía trên để trải nghiệm.</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="text-heading text-bold" style="font-size:13.5px;margin-bottom:var(--space-md);color:var(--neo-text)">
            DANH SÁCH MÔN HỌC ĐÃ ĐĂNG KÝ
          </div>

          <div class="neo-table-wrap" style="border:1px solid var(--neo-border-color);box-shadow:none">
            <table class="neo-table">
              <thead>
                <tr>
                  <th style="width:60px;text-align:center">Xóa</th>
                  <th>Mã MH</th>
                  <th>Tên môn học</th>
                  <th style="text-align:center">Nhóm tổ</th>
                  <th style="text-align:center">Số TC</th>
                  <th>Lớp</th>
                  <th>Ngày đăng ký</th>
                  <th style="text-align:center">Trạng thái</th>
                  <th>Thời khóa biểu</th>
                </tr>
              </thead>
              <tbody>
                ${(function() {
                  const rawKq: any[] = s.rawLiveRegisteredCourses?.data?.ds_kqdkmh || [];
                  if (rawKq.length === 0) {
                    return `
                      <tr>
                        <td colspan="9" style="text-align:center;padding:var(--space-xl);color:var(--neo-text-secondary)">
                          <div style="font-size:13.5px;font-weight:600">Không tìm thấy dữ liệu</div>
                        </td>
                      </tr>
                    `;
                  }
                  let totalTC = 0;
                  let rows = rawKq.map((item: any) => {
                    const toHoc = item.to_hoc || {};
                    const tc = Number(toHoc.so_tc || 0);
                    totalTC += tc;
                    const regDateStr = item.ngay_dang_ky ? item.ngay_dang_ky.replace('T', ' ').slice(0, 16) : '07/09/2026';
                    return `
                      <tr>
                        <td style="text-align:center"><span class="neo-badge neo-badge--warning" style="font-size:10px;padding:2px 6px" title="${item.dien_giai_enable_xoa || 'Ngoài thời gian cho phép'}">Khóa</span></td>
                        <td class="text-mono text-bold" style="color:var(--neo-primary)">${toHoc.ma_mon}</td>
                        <td class="text-bold" style="color:var(--neo-text)">${toHoc.ten_mon}</td>
                        <td style="text-align:center" class="text-mono">${toHoc.nhom_to}</td>
                        <td style="text-align:center" class="text-mono text-bold text-coral">${toHoc.so_tc}</td>
                        <td class="text-mono">${toHoc.lop}</td>
                        <td class="text-xs text-secondary">${regDateStr}</td>
                        <td style="text-align:center"><span class="neo-badge neo-badge--lime">Chính thức</span></td>
                        <td class="text-xs text-secondary">${toHoc.tkb}</td>
                      </tr>
                    `;
                  }).join('');

                  rows += `
                    <tr style="background:var(--neo-bg-secondary);font-weight:700">
                      <td colspan="4" style="text-align:right">TỔNG CỘNG TÍN CHỈ ĐÃ ĐĂNG KÝ:</td>
                      <td style="text-align:center" class="text-mono text-coral">${totalTC} TC</td>
                      <td colspan="4" class="text-secondary" style="font-size:12px">Đã xác nhận đăng ký thành công ${rawKq.length} môn học</td>
                    </tr>
                  `;
                  return rows;
                })()}
              </tbody>
            </table>
          </div>
        </div>
      `;

      slot.querySelector('#btn-toggle-sim')?.addEventListener('click', () => {
        this.isSimulationMode = true;
        this.renderRegistration(slot, s);
      });
      return;
    }

    // Chế độ mô phỏng tương tác
    const registered = s.allCourses.filter(c => s.registeredCourseIds.includes(c.id));
    const totalCredits = registered.reduce((sum, c) => sum + c.credits, 0);

    slot.innerHTML = `
      <div class="neo-card anim-fade-in-up" style="margin-bottom:var(--space-lg);border-color:var(--neo-primary);background:var(--neo-primary-light);padding:var(--space-md) var(--space-lg)">
        <div class="flex items-center justify-between flex-wrap gap-sm">
          <div>
            <div class="text-bold text-primary flex items-center gap-xs" style="margin-bottom:4px;font-size:13.5px">
              ${icons.settings(15)} CHẾ ĐỘ MÔ PHỎNG ĐĂNG KÝ HỌC PHẦN (TESTING SUITE):
            </div>
            <div class="text-sm" style="color:var(--neo-text)">
              Chế độ kiểm thử xung đột lịch học và tính toán học phí theo thời gian thực.
            </div>
          </div>
          <button id="btn-exit-sim" class="neo-btn neo-btn--ghost neo-btn--sm" style="background:#FFFFFF;border:1px solid var(--neo-border-color)">
            ${icons.x(13)} Về giao diện thực tế STU
          </button>
        </div>
      </div>

      <div class="registration-layout">
        <div>
          <div class="toolbar anim-fade-in-up anim-delay-1" style="margin-bottom:var(--space-md)">
            <input id="reg-search" class="neo-input mobile-select" placeholder="Tìm kiếm mã hoặc tên môn học..." value="${this.searchQuery}" style="max-width:280px;padding:6px 12px;font-size:13px">
            <span class="neo-badge neo-badge--cyan">${s.availableCourses.length} môn học mở</span>
          </div>

          <div class="course-grid" id="reg-course-grid">
            ${s.availableCourses.map(course => {
              const isReg = s.registeredCourseIds.includes(course.id);
              const conflict = isReg ? null : hasScheduleConflict(course, registered);

              return `
                <div class="neo-card ${conflict ? 'conflict-border' : ''} reg-course-card" style="padding:var(--space-md)">
                  <div class="flex items-center justify-between" style="margin-bottom:var(--space-xs)">
                    <span class="text-mono text-bold" style="color:var(--neo-primary);font-size:12.5px">${course.code}</span>
                    <span class="neo-badge neo-badge--${course.type === CourseType.Theory ? 'lavender' : 'cyan'}">
                      ${course.type === CourseType.Theory ? 'Lý thuyết' : 'Thực hành'}
                    </span>
                  </div>
                  <div class="text-bold" style="margin-bottom:4px;font-size:13.5px">${course.name}</div>
                  <div class="text-xs text-secondary" style="margin-bottom:4px">
                    ${icons.user(12)} ${course.lecturer} | <strong>${course.credits} TC</strong>
                  </div>
                  <div class="text-xs text-secondary" style="margin-bottom:var(--space-sm)">
                    ${icons.calendar(12)} ${getDayName(course.dayOfWeek)} | Tiết ${course.startPeriod}-${course.endPeriod} | ${course.room}
                  </div>
                  ${conflict ? `<div class="text-xs text-coral text-bold flex items-center gap-xs" style="margin-bottom:var(--space-xs)">${icons.alertTriangle(12)} Trùng: ${conflict.name}</div>` : ''}
                  <button class="neo-btn neo-btn--sm ${isReg ? 'neo-btn--success' : 'neo-btn--primary'} w-full btn-reg-act" data-id="${course.id}" ${isReg || !!conflict ? 'disabled' : ''}>
                    ${isReg ? `${icons.check(13)} Đã đăng ký` : `${icons.plus(13)} Đăng ký`}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="neo-card anim-fade-in-right" style="position:sticky;top:calc(var(--header-height) + var(--space-lg));padding:var(--space-lg)">
          <h3 class="text-heading text-bold flex items-center gap-xs" style="margin-bottom:var(--space-md);font-size:14.5px">
            ${icons.bookOpen(16, 'var(--neo-primary)')} Môn học Đã Đăng Ký (${registered.length})
          </h3>
          <div class="flex flex-col gap-xs" style="margin-bottom:var(--space-md)">
            ${registered.length > 0 ? registered.map(c => `
              <div class="flex items-center justify-between anim-fade-in-up" style="padding:6px 0;border-bottom:1px solid var(--neo-bg-secondary)">
                <div class="flex-1 truncate">
                  <div class="text-xs text-semibold truncate">${c.code} - ${c.name}</div>
                  <div class="text-xs text-secondary">${c.credits} TC | ${getDayName(c.dayOfWeek)} (Tiết ${c.startPeriod}-${c.endPeriod})</div>
                </div>
              </div>
            `).join('') : '<div class="text-secondary text-xs" style="padding:var(--space-sm) 0">Chưa đăng ký môn nào</div>'}
          </div>
          <div style="border-top:1px solid var(--neo-border-color);padding-top:var(--space-sm)">
            <div class="flex justify-between" style="font-size:13px">
              <span class="text-secondary">Tổng số tín chỉ:</span>
              <span class="text-mono text-bold text-coral">${totalCredits} TC</span>
            </div>
          </div>
        </div>
      </div>
    `;

    staggerEntrance(slot.querySelector('#reg-course-grid'), '.reg-course-card', 'anim-fade-in-scale', 40, 20);

    slot.querySelector('#btn-exit-sim')?.addEventListener('click', () => {
      this.isSimulationMode = false;
      this.renderRegistration(slot, s);
    });

    slot.querySelectorAll('.btn-reg-act').forEach(btn => {
      btn.addEventListener('click', (e) => {
        attachRipple(btn as HTMLElement, e as MouseEvent);
        const id = (e.currentTarget as HTMLElement).dataset.id!;
        const res = registerCourse(id);
        if (res.ok) {
          showToast('Đăng ký môn học thành công!', 'success');
        } else if (res.conflict) {
          showToast(`Trùng lịch với ${res.conflict.name}`, 'error');
        }
      });
    });
  }
}
