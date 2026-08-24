import { type ViewModule, type AppState } from '../types/portal.types';
import { stateStore } from '../store/stateStore';
import { icons } from '../utils/svgIcons';
import { fetchAndApplyLiveSTUData } from '../services/stuLiveService';
import { showToast } from '../components/Toast';

export class NotificationsView implements ViewModule {
  private container: HTMLElement | null = null;
  private unsub: (() => void) | null = null;
  private activeCategory: 'all' | 'unread' | 'academic' | 'finance' = 'all';

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
      <div class="flex items-center justify-between flex-wrap gap-md" style="margin-bottom:var(--space-xl)">
        <div>
          <h1 class="view-title flex items-center gap-sm" style="margin-bottom:4px">
            ${icons.bell(22, 'var(--neo-primary)')} THÔNG BÁO TỪ BAN QUẢN TRỊ
          </h1>
          <p class="text-sm text-secondary">
            Kênh tiếp nhận các thông báo học vụ, lịch thi, học phí và hướng dẫn từ Nhà trường.
          </p>
        </div>
        <div class="flex items-center gap-sm">
          <button id="btn-sync-notices" class="neo-btn neo-btn--ghost neo-btn--sm">
            ${icons.refreshCw(14)} Làm mới
          </button>
        </div>
      </div>

      <div class="neo-card anim-fade-in-scale anim-delay-1" style="margin-bottom:var(--space-xl);padding:var(--space-lg) var(--space-xl);overflow:hidden;max-width:100%">
        <div class="flex items-center justify-between flex-wrap gap-md mobile-filter-stack" style="border-bottom:1px solid var(--neo-border-color);padding-bottom:var(--space-md);margin-bottom:var(--space-xl)">
          <div class="flex items-center gap-sm mobile-tab-group" style="width:100%;max-width:100%;overflow-x:auto;padding-bottom:4px">
            <button id="tab-cat-all" class="neo-btn ${this.activeCategory === 'all' ? 'neo-btn--primary' : 'neo-btn--ghost'} neo-btn--sm" style="border-radius:999px;padding:6px 14px;white-space:nowrap;flex-shrink:0">
              Tất cả (0)
            </button>
            <button id="tab-cat-unread" class="neo-btn ${this.activeCategory === 'unread' ? 'neo-btn--primary' : 'neo-btn--ghost'} neo-btn--sm" style="border-radius:999px;padding:6px 14px;white-space:nowrap;flex-shrink:0">
              Chưa đọc (0)
            </button>
            <button id="tab-cat-academic" class="neo-btn ${this.activeCategory === 'academic' ? 'neo-btn--primary' : 'neo-btn--ghost'} neo-btn--sm" style="border-radius:999px;padding:6px 14px;white-space:nowrap;flex-shrink:0">
              Học vụ &amp; Đào tạo
            </button>
            <button id="tab-cat-finance" class="neo-btn ${this.activeCategory === 'finance' ? 'neo-btn--primary' : 'neo-btn--ghost'} neo-btn--sm" style="border-radius:999px;padding:6px 14px;white-space:nowrap;flex-shrink:0">
              Học phí &amp; Học bổng
            </button>
          </div>
          <div class="flex items-center gap-xs text-xs text-secondary">
            <span class="neo-badge neo-badge--lime anim-pulse-live" style="font-size:11px">
              ${icons.check(11)} Đã đồng bộ trực tiếp STU
            </span>
          </div>
        </div>

        <div style="text-align:center;padding:var(--space-3xl) var(--space-xl)">
          <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 100%);border:1px solid rgba(2, 132, 199, 0.2);display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-lg);box-shadow:0 10px 25px -5px rgba(2, 132, 199, 0.15)">
            ${icons.bell(28, 'var(--neo-primary)')}
          </div>
          <h3 class="text-heading text-bold" style="font-size:17px;color:var(--neo-text);margin-bottom:6px">
            Hiện chưa có thông báo mới
          </h3>
          <p class="text-sm text-secondary" style="max-width:520px;margin:0 auto var(--space-xl);line-height:1.6">
            Hộp thư thông báo học vụ của sinh viên <strong>${s.profile.fullName}</strong> (${s.profile.id}) đang hoàn toàn trống. Các quyết định, thông báo lịch thi, thời khóa biểu và học phí từ Phòng Đào tạo STU sẽ tự động hiển thị tại đây khi có cập nhật mới.
          </p>
          <button id="btn-recheck" class="neo-btn neo-btn--ghost neo-btn--sm" style="border:1px solid var(--neo-border-color)">
            ${icons.refreshCw(13)} Kiểm tra cập nhật từ máy chủ STU
          </button>
        </div>
      </div>

      <div class="grid grid-3 gap-lg anim-fade-in-up anim-delay-2">
        <div class="neo-card" style="padding:var(--space-lg)">
          <div class="flex items-center gap-sm" style="margin-bottom:var(--space-xs)">
            <div style="width:32px;height:32px;border-radius:8px;background:var(--neo-primary-light);color:var(--neo-primary);display:flex;align-items:center;justify-content:center">
              ${icons.building(16)}
            </div>
            <div class="text-bold text-sm" style="color:var(--neo-text)">Phòng Đào tạo (A101)</div>
          </div>
          <div class="text-xs text-secondary" style="line-height:1.5">
            Giải quyết các thủ tục đăng ký môn học, điểm thi, thời khóa biểu và xét tốt nghiệp.
          </div>
        </div>

        <div class="neo-card" style="padding:var(--space-lg)">
          <div class="flex items-center gap-sm" style="margin-bottom:var(--space-xs)">
            <div style="width:32px;height:32px;border-radius:8px;background:var(--neo-lime-light);color:var(--neo-lime);display:flex;align-items:center;justify-content:center">
              ${icons.creditCard(16)}
            </div>
            <div class="text-bold text-sm" style="color:var(--neo-text)">Phòng Kế hoạch - Tài chính</div>
          </div>
          <div class="text-xs text-secondary" style="line-height:1.5">
            Hướng dẫn đóng học phí, xuất hóa đơn điện tử và các chính sách miễn giảm học phí.
          </div>
        </div>

        <div class="neo-card" style="padding:var(--space-lg)">
          <div class="flex items-center gap-sm" style="margin-bottom:var(--space-xs)">
            <div style="width:32px;height:32px;border-radius:8px;background:var(--neo-lavender-light);color:var(--neo-lavender);display:flex;align-items:center;justify-content:center">
              ${icons.user(16)}
            </div>
            <div class="text-bold text-sm" style="color:var(--neo-text)">Phòng Công tác Sinh viên</div>
          </div>
          <div class="text-xs text-secondary" style="line-height:1.5">
            Tiếp nhận điểm rèn luyện, cấp giấy xác nhận sinh viên, học bổng và bảo hiểm y tế.
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    const handleSync = async () => {
      showToast('Đang kết nối kiểm tra thông báo mới từ STU AMIS...', 'info');
      const ok = await fetchAndApplyLiveSTUData();
      if (ok) {
        showToast('Đã đồng bộ thông báo thời gian thực thành công!', 'success');
      } else {
        showToast('Không có thông báo mới trên máy chủ STU', 'info');
      }
    };

    this.container?.querySelector('#btn-sync-notices')?.addEventListener('click', handleSync);
    this.container?.querySelector('#btn-recheck')?.addEventListener('click', handleSync);

    this.container?.querySelector('#tab-cat-all')?.addEventListener('click', () => {
      this.activeCategory = 'all';
      this.render(stateStore.getState());
    });
    this.container?.querySelector('#tab-cat-unread')?.addEventListener('click', () => {
      this.activeCategory = 'unread';
      this.render(stateStore.getState());
    });
    this.container?.querySelector('#tab-cat-academic')?.addEventListener('click', () => {
      this.activeCategory = 'academic';
      this.render(stateStore.getState());
    });
    this.container?.querySelector('#tab-cat-finance')?.addEventListener('click', () => {
      this.activeCategory = 'finance';
      this.render(stateStore.getState());
    });
  }
}
