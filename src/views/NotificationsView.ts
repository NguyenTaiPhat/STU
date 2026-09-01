import { type ViewModule, type AppState, type Notification } from '../types/portal.types';
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

    const notifs = s.notifications || [];
    const unreadCount = notifs.filter(n => !n.isRead).length;

    let filtered = notifs;
    if (this.activeCategory === 'unread') {
      filtered = notifs.filter(n => !n.isRead);
    } else if (this.activeCategory === 'academic') {
      filtered = notifs.filter(n => n.type === 'warning' || n.type === 'info');
    } else if (this.activeCategory === 'finance') {
      filtered = notifs.filter(n => n.type === 'success');
    }

    const now = new Date();
    const hour = now.getHours();
    const isOutsideHours = hour < 7 || hour >= 19;

    let noticesHtml = '';
    if (filtered.length === 0) {
      noticesHtml = `
        <div style="text-align:center;padding:var(--space-3xl) var(--space-xl)">
          <div style="width:64px;height:64px;border-radius:50%;background:var(--neo-primary-light);color:var(--neo-primary);display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-md)">
            ${icons.bell(24)}
          </div>
          <h3 class="text-heading text-bold" style="font-size:16px;color:var(--neo-text);margin-bottom:4px">Không có thông báo nào</h3>
          <p class="text-sm text-secondary">Hộp thư thông báo danh mục này hiện đang trống.</p>
        </div>
      `;
    } else {
      noticesHtml = filtered.map(n => {
        const typeBadge = n.type === 'warning'
          ? '<span class="neo-badge neo-badge--coral">Học vụ</span>'
          : n.type === 'success'
          ? '<span class="neo-badge neo-badge--lime">Học phí</span>'
          : '<span class="neo-badge neo-badge--cyan">Thông báo</span>';

        return `
          <div class="neo-card anim-fade-in-up ${!n.isRead ? 'neo-card--unread' : ''}" style="margin-bottom:var(--space-sm);padding:12px 14px;border-left:3px solid ${n.type === 'warning' ? 'var(--neo-coral)' : n.type === 'success' ? 'var(--neo-lime)' : 'var(--neo-primary)'}">
            <div class="flex items-start justify-between gap-sm flex-wrap">
              <div class="flex items-start gap-sm" style="flex:1;min-width:0">
                <div style="width:30px;height:30px;border-radius:8px;background:${n.type === 'warning' ? 'var(--neo-coral-light)' : n.type === 'success' ? 'var(--neo-lime-light)' : 'var(--neo-primary-light)'};color:${n.type === 'warning' ? 'var(--neo-coral)' : n.type === 'success' ? 'var(--neo-lime)' : 'var(--neo-primary)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px">
                  ${n.type === 'warning' ? icons.alertTriangle(15) : n.type === 'success' ? icons.creditCard(15) : icons.info(15)}
                </div>
                <div style="min-width:0;flex:1">
                  <div class="flex items-center gap-xs flex-wrap" style="margin-bottom:2px">
                    ${typeBadge}
                    <span class="text-bold" style="font-size:13px;color:var(--neo-text)">${n.title}</span>
                    ${!n.isRead ? '<span class="neo-badge neo-badge--coral" style="font-size:9px;padding:1px 5px">Mới</span>' : ''}
                  </div>
                  <div class="text-xs text-secondary" style="font-size:12px;line-height:1.45;margin-bottom:4px">
                    ${n.message}
                  </div>
                  <div class="text-xs text-secondary flex items-center gap-xs" style="font-size:11px">
                    ${icons.clock(11)} <span>${n.date}</span>
                  </div>
                </div>
              </div>
              ${!n.isRead ? `<button class="neo-btn neo-btn--ghost neo-btn--sm btn-mark-read" data-id="${n.id}" style="padding:3px 8px;font-size:11px;flex-shrink:0">Đánh dấu đã đọc</button>` : ''}
            </div>
          </div>
        `;
      }).join('');
    }

    this.container.innerHTML = `
      <div class="flex items-center justify-between flex-wrap gap-md" style="margin-bottom:var(--space-xl)">
        <div>
          <h1 class="view-title flex items-center gap-sm" style="margin-bottom:4px">
            ${icons.bell(22, 'var(--neo-primary)')} THÔNG BÁO TỪ BAN QUẢN TRỊ STU
          </h1>
          <p class="text-sm text-secondary">
            Kênh tiếp nhận các thông báo học vụ, lịch thi, học phí và hướng dẫn từ Nhà trường STU.
          </p>
        </div>
        <div class="flex items-center gap-sm">
          <button id="btn-sync-notices" class="neo-btn neo-btn--ghost neo-btn--sm">
            ${icons.refreshCw(14)} Làm mới dữ liệu
          </button>
        </div>
      </div>

      ${isOutsideHours ? `
        <div class="neo-card anim-fade-in-up mobile-compact-card" style="margin-bottom:var(--space-md);background:var(--neo-bg-secondary);border-left:3px solid var(--neo-coral);padding:10px 14px">
          <div class="flex flex-col items-start gap-xs">
            <span class="neo-badge neo-badge--coral" style="font-size:9.5px;padding:2px 8px;margin-bottom:2px;letter-spacing:0.2px">KHUNG GIỜ KHÓA CỔNG MÁY CHỦ STU (07:00 - 19:00)</span>
            <div class="text-xs text-secondary" style="font-size:11.5px;line-height:1.45;color:var(--neo-text-primary)">
              Máy chủ STU quy định cổng ĐKMH &amp; Thông báo chỉ hoạt động từ <strong>07:00 đến 19:00</strong> hàng ngày. Dữ liệu đang được đồng bộ trực tiếp cho sinh viên <strong>${s.profile.fullName}</strong> (${s.profile.id}).
            </div>
          </div>
        </div>
      ` : ''}

      <div class="neo-card anim-fade-in-scale anim-delay-1" style="margin-bottom:var(--space-xl);padding:var(--space-lg);overflow:hidden">
        <div class="flex items-center justify-between flex-wrap gap-md" style="border-bottom:1px solid var(--neo-border-color);padding-bottom:var(--space-md);margin-bottom:var(--space-lg)">
          <div class="flex items-center gap-sm mobile-tab-group" style="overflow-x:auto;padding-bottom:4px;width:100%">
            <button id="tab-cat-all" class="neo-btn ${this.activeCategory === 'all' ? 'neo-btn--primary' : 'neo-btn--ghost'} neo-btn--sm" style="border-radius:999px;padding:6px 14px;white-space:nowrap">
              Tất cả (${notifs.length})
            </button>
            <button id="tab-cat-unread" class="neo-btn ${this.activeCategory === 'unread' ? 'neo-btn--primary' : 'neo-btn--ghost'} neo-btn--sm" style="border-radius:999px;padding:6px 14px;white-space:nowrap">
              Chưa đọc (${unreadCount})
            </button>
            <button id="tab-cat-academic" class="neo-btn ${this.activeCategory === 'academic' ? 'neo-btn--primary' : 'neo-btn--ghost'} neo-btn--sm" style="border-radius:999px;padding:6px 14px;white-space:nowrap">
              Học vụ &amp; Đào tạo
            </button>
            <button id="tab-cat-finance" class="neo-btn ${this.activeCategory === 'finance' ? 'neo-btn--primary' : 'neo-btn--ghost'} neo-btn--sm" style="border-radius:999px;padding:6px 14px;white-space:nowrap">
              Học phí &amp; Học bổng
            </button>
          </div>
        </div>

        <div id="notices-list-container">
          ${noticesHtml}
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
      await fetchAndApplyLiveSTUData();
      showToast('Đã đồng bộ thông báo thời gian thực thành công!', 'success');
    };

    this.container?.querySelector('#btn-sync-notices')?.addEventListener('click', handleSync);

    this.container?.querySelectorAll('.btn-mark-read').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        if (!id) return;
        const currentNotifs = stateStore.getState().notifications || [];
        const updated = currentNotifs.map(n => n.id === id ? { ...n, isRead: true } : n);
        stateStore.setState({ notifications: updated });
        showToast('Đã đánh dấu thông báo là đã đọc', 'success');
      });
    });

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
