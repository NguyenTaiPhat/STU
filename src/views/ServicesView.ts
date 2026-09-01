import { type ViewModule, type AppState } from '../types/portal.types';
import { stateStore } from '../store/stateStore';
import { icons } from '../utils/svgIcons';
import { showToast } from '../components/Toast';

export class ServicesView implements ViewModule {
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

    this.container.innerHTML = `
      <div class="flex items-center justify-between flex-wrap gap-md" style="margin-bottom:var(--space-lg)">
        <h1 class="view-title flex items-center gap-sm" style="margin-bottom:0">
          ${icons.fileText(22, 'var(--neo-primary)')}
          <span>DỊCH VỤ HÀNH CHÍNH SINH VIÊN - STU</span>
        </h1>
        <span class="neo-badge neo-badge--emerald">Cổng dịch vụ 24/7</span>
      </div>

      <div class="grid grid-cols-3 gap-md mobile-card-stack" style="margin-bottom:var(--space-xl)">
        <div class="neo-card anim-fade-in-up">
          <div class="flex items-center gap-md" style="margin-bottom:var(--space-md)">
            <div style="width:40px;height:40px;border-radius:10px;background:var(--neo-primary-light);color:var(--neo-primary);display:flex;align-items:center;justify-content:center">
              ${icons.fileText(20)}
            </div>
            <div>
              <div class="text-bold" style="font-size:14px">Giấy xác nhận Sinh viên</div>
              <div class="text-xs text-secondary">Tạm hoãn NVQS, làm thẻ xe bus, bổ sung hồ sơ</div>
            </div>
          </div>
          <button class="neo-btn neo-btn--primary neo-btn--sm w-full btn-req-service" data-title="Giấy xác nhận Sinh viên">Đăng ký dịch vụ</button>
        </div>

        <div class="neo-card anim-fade-in-up anim-delay-1">
          <div class="flex items-center gap-md" style="margin-bottom:var(--space-md)">
            <div style="width:40px;height:40px;border-radius:10px;background:var(--neo-cyan-light);color:var(--neo-cyan);display:flex;align-items:center;justify-content:center">
              ${icons.creditCard(20)}
            </div>
            <div>
              <div class="text-bold" style="font-size:14px">Giấy xác nhận Vay vốn</div>
              <div class="text-xs text-secondary">Vay vốn Ngân hàng Chính sách Xã hội</div>
            </div>
          </div>
          <button class="neo-btn neo-btn--primary neo-btn--sm w-full btn-req-service" data-title="Giấy xác nhận Vay vốn">Đăng ký dịch vụ</button>
        </div>

        <div class="neo-card anim-fade-in-up anim-delay-2">
          <div class="flex items-center gap-md" style="margin-bottom:var(--space-md)">
            <div style="width:40px;height:40px;border-radius:10px;background:var(--neo-emerald-light);color:var(--neo-emerald);display:flex;align-items:center;justify-content:center">
              ${icons.graduationCap(20)}
            </div>
            <div>
              <div class="text-bold" style="font-size:14px">Bảng điểm tạm thời</div>
              <div class="text-xs text-secondary">Cấp bảng điểm quá trình học tập</div>
            </div>
          </div>
          <button class="neo-btn neo-btn--primary neo-btn--sm w-full btn-req-service" data-title="Bảng điểm tạm thời">Đăng ký dịch vụ</button>
        </div>
      </div>

      <h2 class="view-subtitle flex items-center gap-sm">
        ${icons.clock(18, 'var(--neo-primary)')} LỊCH SỬ ĐĂNG KÝ DỊCH VỤ
      </h2>

      <div class="neo-card" style="padding:0;overflow:hidden">
        <div class="neo-table-wrap" style="border:none;box-shadow:none;border-radius:0">
          <table class="neo-table">
            <thead>
              <tr>
                <th>Mã Yêu Cầu</th>
                <th>Tên Dịch Vụ</th>
                <th>Ngày Đăng Ký</th>
                <th style="text-align:center">Số Lượng</th>
                <th style="text-align:center">Lệ Phí</th>
                <th style="text-align:center">Trạng Thái Processing</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>SRV-2026-001</strong></td>
                <td>Giấy xác nhận Sinh viên (Tân sinh viên K2026)</td>
                <td>01/09/2026</td>
                <td style="text-align:center">1 bản</td>
                <td style="text-align:center">Miễn phí</td>
                <td style="text-align:center"><span class="neo-badge neo-badge--emerald">Đã tiếp nhận</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.container.querySelectorAll('.btn-req-service').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const title = (e.currentTarget as HTMLElement).dataset.title || 'Dịch vụ';
        showToast(`Đã ghi nhận yêu cầu: ${title}. Phòng Công tác Sinh viên STU sẽ xử lý trong 24h.`, 'success');
      });
    });
  }
}
