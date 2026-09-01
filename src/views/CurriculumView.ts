import { type ViewModule, type AppState } from '../types/portal.types';
import { stateStore } from '../store/stateStore';
import { icons } from '../utils/svgIcons';

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

    this.container.innerHTML = `
      <div class="flex items-center justify-between flex-wrap gap-md" style="margin-bottom:var(--space-lg)">
        <h1 class="view-title flex items-center gap-sm" style="margin-bottom:0">
          ${icons.folder(22, 'var(--neo-primary)')}
          <span>CHƯƠNG TRÌNH ĐÀO TẠO & TIẾN TRÌNH HỌC TẬP</span>
        </h1>
        <span class="neo-badge neo-badge--cyan">Ngành Công Nghệ Thông Tin (145 Tín Chỉ)</span>
      </div>

      <div class="neo-card anim-fade-in-up mobile-compact-card" style="margin-bottom:var(--space-md);background:var(--neo-bg-secondary);border-left:3px solid var(--neo-amber);padding:10px 14px">
        <div class="flex flex-col items-start gap-xs">
          <span class="neo-badge neo-badge--warning" style="font-size:9.5px;padding:2px 8px;margin-bottom:2px">THÔNG BÁO TỪ TRƯỜNG STU</span>
          <div class="text-secondary" style="font-size:11.5px;line-height:1.45;color:var(--neo-text-primary)">
            <strong>${noticeText}</strong>
            <div style="margin-top:2px;font-size:11px;color:var(--neo-text-secondary)">
              Khóa 2026 - 2030 (Lớp D26_TH03). Chương trình đào tạo chuẩn Đại học chính quy gồm 8 học kỳ chính.
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
            <div class="text-xs text-secondary">Tổng số tín chỉ tích lũy</div>
            <div class="text-heading text-bold" style="font-size:20px">0 / 145 TC</div>
          </div>
        </div>

        <div class="neo-card flex items-center gap-md">
          <div style="width:44px;height:44px;border-radius:12px;background:var(--neo-emerald-light);color:var(--neo-emerald);display:flex;align-items:center;justify-content:center;flex-shrink:0">
            ${icons.award(22)}
          </div>
          <div>
            <div class="text-xs text-secondary">Khối kiến thức Chuyên ngành</div>
            <div class="text-heading text-bold" style="font-size:20px">68 Tín chỉ</div>
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
                <th style="width:100px">Mã Môn</th>
                <th>Tên Môn Học</th>
                <th style="text-align:center">Số TC</th>
                <th style="text-align:center">Loại Môn</th>
                <th style="text-align:center">Học Kỳ Dự Kiến</th>
                <th style="text-align:center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>INT101</strong></td>
                <td>Nhập Môn Công Nghệ Thông Tin</td>
                <td style="text-align:center">3</td>
                <td style="text-align:center"><span class="neo-badge neo-badge--primary">Bắt buộc</span></td>
                <td style="text-align:center">HK1 (2026-2027)</td>
                <td style="text-align:center"><span class="neo-badge neo-badge--warning">Chờ công bố TKB</span></td>
              </tr>
              <tr>
                <td><strong>INT102</strong></td>
                <td>Kỹ Thuật Lập Trình Nâng Cao</td>
                <td style="text-align:center">4</td>
                <td style="text-align:center"><span class="neo-badge neo-badge--primary">Bắt buộc</span></td>
                <td style="text-align:center">HK1 (2026-2027)</td>
                <td style="text-align:center"><span class="neo-badge neo-badge--warning">Chờ công bố TKB</span></td>
              </tr>
              <tr>
                <td><strong>MTH101</strong></td>
                <td>Toán Cao Cấp A1</td>
                <td style="text-align:center">3</td>
                <td style="text-align:center"><span class="neo-badge neo-badge--primary">Bắt buộc</span></td>
                <td style="text-align:center">HK1 (2026-2027)</td>
                <td style="text-align:center"><span class="neo-badge neo-badge--warning">Chờ công bố TKB</span></td>
              </tr>
              <tr>
                <td><strong>ENG101</strong></td>
                <td>Tiếng Anh Chuyên Ngành 1</td>
                <td style="text-align:center">3</td>
                <td style="text-align:center"><span class="neo-badge neo-badge--ghost">Tự chọn</span></td>
                <td style="text-align:center">HK1 (2026-2027)</td>
                <td style="text-align:center"><span class="neo-badge neo-badge--warning">Chờ công bố TKB</span></td>
              </tr>
              <tr>
                <td><strong>INT201</strong></td>
                <td>Cấu Trúc Dữ Liệu & Giải Thuật</td>
                <td style="text-align:center">4</td>
                <td style="text-align:center"><span class="neo-badge neo-badge--primary">Bắt buộc</span></td>
                <td style="text-align:center">HK2 (2026-2027)</td>
                <td style="text-align:center"><span class="neo-badge neo-badge--ghost">Chưa học</span></td>
              </tr>
              <tr>
                <td><strong>INT202</strong></td>
                <td>Cơ Sở Dữ Liệu & SQL</td>
                <td style="text-align:center">3</td>
                <td style="text-align:center"><span class="neo-badge neo-badge--primary">Bắt buộc</span></td>
                <td style="text-align:center">HK2 (2026-2027)</td>
                <td style="text-align:center"><span class="neo-badge neo-badge--ghost">Chưa học</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}
