import { type ViewModule, type AppState } from '../types/portal.types';
import { stateStore } from '../store/stateStore';
import { icons } from '../utils/svgIcons';
import { exportCTDTExcel } from '../utils/excelExport';
import { showToast } from '../components/Toast';

export class CurriculumView implements ViewModule {
  private container: HTMLElement | null = null;
  private unsub: (() => void) | null = null;

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

    const noticeText = s.officialNotice || s.profile?.officialNotice || '[Tân sinh viên khóa 2026 không cần thực hiện đăng ký môn học; thời khóa biểu sẽ được thông báo trong thời gian từ ngày 01/09/2026 đến ngày 05/09/2026]';
    const ctdtSemesters: any[] = s.rawLiveCurriculum?.data?.ds_CTDT_hocky || [];

    let rowsHtml = '';
    let totalAllCredits = 0;

    if (ctdtSemesters.length > 0) {
      ctdtSemesters.forEach((sem: any) => {
        const courses: any[] = sem.ds_CTDT_mon_hoc || [];
        const semCredits = courses.reduce((sum, c) => sum + (Number(c.so_tin_chi) || 0), 0);
        totalAllCredits += semCredits;

        rowsHtml += `
          <tr style="background:var(--neo-bg);font-weight:700">
            <td colspan="4" style="color:var(--neo-primary);font-size:13px">
              ${icons.calendar(14, 'var(--neo-primary)')} ${sem.ten_hoc_ky || 'Học kỳ'}
            </td>
            <td style="text-align:center" class="text-mono text-bold text-coral">${semCredits} TC</td>
            <td colspan="4"></td>
          </tr>
        `;

        courses.forEach((c: any, idx: number) => {
          const isCompulsory = c.mon_bat_buoc === 'x';
          const isScheduled = c.mon_da_hoc === 'x';

          rowsHtml += `
            <tr class="ctdt-row">
              <td style="text-align:center" class="text-secondary">${idx + 1}</td>
              <td class="text-mono text-bold" style="color:var(--neo-primary)">${c.ma_mon || ''}</td>
              <td class="text-semibold">${c.ten_mon || ''}</td>
              <td style="text-align:center">
                <span class="neo-badge ${isCompulsory ? 'neo-badge--primary' : 'neo-badge--ghost'}" style="font-size:10.5px">
                  ${isCompulsory ? 'Bắt buộc' : 'Tự chọn'}
                </span>
              </td>
              <td style="text-align:center" class="text-mono text-bold">${c.so_tin_chi || 0}</td>
              <td style="text-align:center" class="text-mono">${c.tong_tiet || (Number(c.so_tin_chi || 0) * 15)}</td>
              <td style="text-align:center" class="text-mono">${c.ly_thuyet || '0'}</td>
              <td style="text-align:center" class="text-mono">${c.thuc_hanh || '0'}</td>
              <td style="text-align:center">
                <span class="neo-badge ${isScheduled ? 'neo-badge--lime' : 'neo-badge--ghost'}" style="font-size:10.5px">
                  ${isScheduled ? 'Đã xếp TKB' : 'Chưa mở'}
                </span>
              </td>
            </tr>
          `;
        });
      });
    } else {
      // Fallback chuẩn theo dữ liệu HK1 STU AMIS
      const defaultCourses = [
        { code: 'GS19007', name: 'Tiếng Anh 1', tc: 2, total: 45, lt: 15, th: 0, status: 'Đã có TKB (Nhóm 26)' },
        { code: 'GS33001', name: 'Toán A1 (Hàm 1 biến, chuỗi)', tc: 4, total: 60, lt: 45, th: 0, status: 'Đã có TKB (Nhóm 08)' },
        { code: 'GS43001', name: 'Vật lý 1', tc: 3, total: 45, lt: 30, th: 0, status: 'Đã có TKB (Nhóm 08)' },
        { code: 'GS49004', name: 'Thí nghiệm Vật lý_Phần 1', tc: 1, total: 30, lt: 0, th: 30, status: 'Đã có TKB (Nhóm 18)' },
        { code: 'GS59001', name: 'Tin học đại cương', tc: 2, total: 45, lt: 30, th: 0, status: 'Đã có TKB (Nhóm 08)' },
        { code: 'GS59002', name: 'Thực hành Tin học đại cương', tc: 2, total: 60, lt: 0, th: 60, status: 'Đã có TKB (Nhóm 19)' }
      ];

      rowsHtml = `
        <tr style="background:var(--neo-bg);font-weight:700">
          <td colspan="4" style="color:var(--neo-primary);font-size:13px">Học kỳ 1 - Năm học 2026 - 2027</td>
          <td style="text-align:center" class="text-mono text-bold text-coral">14 TC</td>
          <td colspan="4"></td>
        </tr>
      `;

      defaultCourses.forEach((c, idx) => {
        rowsHtml += `
          <tr class="ctdt-row">
            <td style="text-align:center" class="text-secondary">${idx + 1}</td>
            <td class="text-mono text-bold" style="color:var(--neo-primary)">${c.code}</td>
            <td class="text-semibold">${c.name}</td>
            <td style="text-align:center"><span class="neo-badge neo-badge--primary" style="font-size:10.5px">Bắt buộc</span></td>
            <td style="text-align:center" class="text-mono text-bold">${c.tc}</td>
            <td style="text-align:center" class="text-mono">${c.total}</td>
            <td style="text-align:center" class="text-mono">${c.lt}</td>
            <td style="text-align:center" class="text-mono">${c.th}</td>
            <td style="text-align:center"><span class="neo-badge neo-badge--lime" style="font-size:10.5px">${c.status}</span></td>
          </tr>
        `;
      });
      totalAllCredits = 14;
    }

    this.container.innerHTML = `
      <div class="flex items-center justify-between flex-wrap gap-md" style="margin-bottom:var(--space-lg)">
        <h1 class="view-title flex items-center gap-sm" style="margin-bottom:0">
          ${icons.folder(22, 'var(--neo-primary)')}
          <span>CHƯƠNG TRÌNH ĐÀO TẠO & TIẾN TRÌNH HỌC TẬP</span>
        </h1>
        <div class="flex items-center gap-sm">
          <span class="neo-badge neo-badge--cyan">${s.profile.major || 'Công nghệ Thông tin'} (145 Tín Chỉ)</span>
          <button id="btn-excel-ctdt-view" class="neo-btn neo-btn--success neo-btn--sm">
            ${icons.download(14)} Xuất Excel
          </button>
        </div>
      </div>

      <div class="neo-card anim-fade-in-up mobile-compact-card" style="margin-bottom:var(--space-md);background:var(--neo-bg-secondary);border-left:3px solid var(--neo-amber);padding:10px 14px">
        <div class="flex flex-col items-start gap-xs">
          <span class="neo-badge neo-badge--warning" style="font-size:9.5px;padding:2px 8px;margin-bottom:2px">THÔNG BÁO TỪ TRƯỜNG STU</span>
          <div class="text-secondary" style="font-size:11.5px;line-height:1.45;color:var(--neo-text-primary)">
            <strong>${noticeText}</strong>
            <div style="margin-top:2px;font-size:11px;color:var(--neo-text-secondary)">
              Khóa 2026 - 2030 (Lớp ${s.profile.classCode || 'D26_TH03'}). Chương trình đào tạo chuẩn Đại học chính quy gồm 8 học kỳ.
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-md mobile-card-stack" style="margin-bottom:var(--space-xl)">
        <div class="neo-card flex items-center gap-md">
          <div style="width:44px;height:44px;border-radius:12px;background:var(--neo-primary-light);color:var(--neo-primary);display:flex;align-items:center;justify-content:center;flex-shrink:0">
            ${icons.bookOpen(22)}
          </div>
          <div>
            <div class="text-xs text-secondary">Tín chỉ đăng ký HK1</div>
            <div class="text-heading text-bold" style="font-size:20px">${totalAllCredits} / 145 TC</div>
          </div>
        </div>

        <div class="neo-card flex items-center gap-md">
          <div style="width:44px;height:44px;border-radius:12px;background:var(--neo-emerald-light);color:var(--neo-emerald);display:flex;align-items:center;justify-content:center;flex-shrink:0">
            ${icons.award(22)}
          </div>
          <div>
            <div class="text-xs text-secondary">Trạng thái học vụ</div>
            <div class="text-heading text-bold" style="font-size:20px">${s.profile.status || 'Đang học'}</div>
          </div>
        </div>

        <div class="neo-card flex items-center gap-md">
          <div style="width:44px;height:44px;border-radius:12px;background:var(--neo-cyan-light);color:var(--neo-cyan);display:flex;align-items:center;justify-content:center;flex-shrink:0">
            ${icons.target(22)}
          </div>
          <div>
            <div class="text-xs text-secondary">Tiến độ đào tạo</div>
            <div class="text-heading text-bold" style="font-size:20px">HK 1 / 8</div>
          </div>
        </div>
      </div>

      <div class="neo-card" style="padding:0;overflow:hidden">
        <div class="neo-table-wrap" style="border:none;box-shadow:none;border-radius:0">
          <table class="neo-table">
            <thead>
              <tr>
                <th style="width:50px;text-align:center">STT</th>
                <th style="width:110px">MÃ MÔN</th>
                <th>TÊN MÔN HỌC</th>
                <th style="text-align:center;width:110px">LOẠI MÔN</th>
                <th style="text-align:center;width:80px">SỐ TC</th>
                <th style="text-align:center;width:90px">TỔNG TIẾT</th>
                <th style="text-align:center;width:90px">LÝ THUYẾT</th>
                <th style="text-align:center;width:90px">THỰC HÀNH</th>
                <th style="text-align:center;width:130px">TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.container.querySelector('#btn-excel-ctdt-view')?.addEventListener('click', () => {
      exportCTDTExcel(s.profile.id);
      showToast('Đã xuất file Chương trình đào tạo (.xlsx) thành công!', 'success');
    });
  }
}
