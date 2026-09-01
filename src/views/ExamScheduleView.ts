import { type ViewModule, type AppState } from '../types/portal.types';
import { stateStore } from '../store/stateStore';
import { icons } from '../utils/svgIcons';

export class ExamScheduleView implements ViewModule {
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
          ${icons.clock(22, 'var(--neo-primary)')}
          <span>LỊCH THI CÁ NHÂN - STU</span>
        </h1>
        <span class="neo-badge neo-badge--lime">Học kỳ 1 (2026 - 2027)</span>
      </div>

      <div class="neo-card anim-fade-in-up" style="margin-bottom:var(--space-md);background:var(--neo-bg-secondary);border-left:4px solid var(--neo-amber);padding:var(--space-md)">
        <div class="flex items-start gap-sm">
          <span class="neo-badge neo-badge--warning" style="font-size:10px;padding:3px 8px;flex-shrink:0;margin-top:2px">THÔNG BÁO TỪ TRƯỜNG STU</span>
          <div class="text-secondary" style="font-size:12px;line-height:1.5;color:var(--neo-text-primary)">
            <strong>${noticeText}</strong>
            <div style="margin-top:4px;font-size:11.5px;color:var(--neo-text-secondary)">
              Lịch thi kết thúc học kỳ 1 sẽ được Phòng Khảo thí & Đảm bảo chất lượng công bố trước đợt thi 2 tuần.
            </div>
          </div>
        </div>
      </div>

      <div class="neo-card" style="padding:0;overflow:hidden">
        <div class="neo-table-wrap" style="border:none;box-shadow:none;border-radius:0">
          <table class="neo-table">
            <thead>
              <tr>
                <th style="width:90px">STT</th>
                <th>Mã Môn</th>
                <th>Tên Môn Học Thi</th>
                <th style="text-align:center">SBD</th>
                <th style="text-align:center">Ngày Thi</th>
                <th style="text-align:center">Ca Thi / Tiết BĐ</th>
                <th style="text-align:center">Phòng Thi</th>
                <th style="text-align:center">Hình Thức Thi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="8" style="text-align:center;padding:var(--space-3xl) var(--space-xl);color:var(--neo-text-secondary)">
                  <div style="font-size:14px;font-weight:600;margin-bottom:4px">Chưa có lịch thi học kỳ</div>
                  <div class="text-xs">Lịch thi cá nhân sẽ được đồng bộ tự động khi Phòng Đào tạo & Khảo thí xếp lịch.</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}
