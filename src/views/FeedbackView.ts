import { type ViewModule, type AppState } from '../types/portal.types';
import { stateStore } from '../store/stateStore';
import { icons } from '../utils/svgIcons';
import { showToast } from '../components/Toast';
import { attachRipple } from '../utils/animationEngine';

export class FeedbackView implements ViewModule {
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

  private render(_s: AppState): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <h1 class="view-title flex items-center gap-sm anim-fade-in-up">
        ${icons.mail(24, 'var(--neo-primary)')} GỬI GÓP Ý &amp; PHẢN HỒI
      </h1>

      <div class="neo-card anim-fade-in-scale anim-delay-1" style="margin-bottom:var(--space-xl)">
        <div class="flex flex-col gap-lg">
          <div>
            <label class="neo-label">Phân loại</label>
            <select id="feedback-cat" class="neo-select">
              <option>Đào tạo &amp; Học vụ</option>
              <option>Học phí &amp; Tài chính</option>
              <option>Cơ sở vật chất &amp; Phòng máy</option>
              <option>Khác</option>
            </select>
          </div>

          <div>
            <label class="neo-label">Chủ đề (*)</label>
            <input id="feedback-subject" class="neo-input" placeholder="Nhập chủ đề góp ý...">
          </div>

          <div>
            <label class="neo-label">Nội dung (*)</label>
            <textarea id="feedback-content" class="neo-input" rows="5" style="resize:vertical" placeholder="Nhập chi tiết nội dung cần phản ánh tới nhà trường..."></textarea>
          </div>

          <div>
            <button id="feedback-submit" class="neo-btn neo-btn--primary">
              ${icons.check(16)} Gửi góp ý
            </button>
          </div>
        </div>
      </div>

      <h2 class="view-subtitle anim-fade-in-up anim-delay-2">NỘI DUNG ĐÃ GÓP Ý</h2>
      <div class="neo-card text-center text-secondary anim-fade-in-up anim-delay-3">
        Không tìm thấy dữ liệu đã góp ý trước đây.
      </div>
    `;

    const submitBtn = this.container.querySelector('#feedback-submit') as HTMLElement;
    submitBtn?.addEventListener('click', (e) => {
      attachRipple(submitBtn, e);
      const subject = (this.container?.querySelector('#feedback-subject') as HTMLInputElement)?.value.trim();
      const content = (this.container?.querySelector('#feedback-content') as HTMLTextAreaElement)?.value.trim();

      if (!subject || !content) {
        showToast('Vui lòng điền đầy đủ Chủ đề và Nội dung góp ý', 'warning');
        return;
      }

      showToast('Đã gửi góp ý thành công tới Phòng Đào tạo STU!', 'success');
      (this.container?.querySelector('#feedback-subject') as HTMLInputElement).value = '';
      (this.container?.querySelector('#feedback-content') as HTMLTextAreaElement).value = '';
    });
  }
}
