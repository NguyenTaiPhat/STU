import { type ViewModule, type AppState, type InvoiceItem, InvoiceStatus } from '../types/portal.types';
import { stateStore } from '../store/stateStore';
import { icons } from '../utils/svgIcons';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { generateVietQRUrl, renderVietQRFallback, STU_BANK_ACCOUNTS } from '../utils/vietQr';
import { exportTuitionExcel } from '../utils/excelExport';
import { printTuitionSheet } from '../utils/printHelper';
import { openModal, closeModal } from '../components/Modal';
import { showToast } from '../components/Toast';
import { attachRipple } from '../utils/animationEngine';

export class FinanceView implements ViewModule {
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
      <div class="flex items-center justify-between flex-wrap gap-md anim-fade-in-up mobile-filter-stack" style="margin-bottom:var(--space-xl)">
        <h1 class="view-title flex items-center gap-sm" style="margin-bottom:0">
          ${icons.creditCard(22, 'var(--neo-primary)')} XEM HỌC PHÍ &amp; HÓA ĐƠN ĐIỆN TỬ
        </h1>
        <div class="flex items-center gap-md flex-wrap w-full mobile-filter-stack">
          <select class="neo-select mobile-select" style="min-width:260px">
            <option>Tổng hợp học phí tất cả học kỳ</option>
            <option>Học kỳ 1 - Năm học 2026 - 2027</option>
          </select>
          <div class="flex items-center gap-sm mobile-actions-stack">
            <button id="btn-print" class="neo-btn neo-btn--ghost neo-btn--sm">
              ${icons.printer(14)} <span class="hide-mobile">In</span>
            </button>
            <button id="btn-excel" class="neo-btn neo-btn--success neo-btn--sm">
              ${icons.download(14)} Xuất Excel
            </button>
          </div>
        </div>
      </div>

      <div class="neo-card anim-fade-in-scale anim-delay-1" style="margin-bottom:var(--space-xl);padding:0;overflow:hidden">
        <div class="neo-table-wrap" style="border:none;box-shadow:none;border-radius:0">
          <table class="neo-table">
            <thead>
              <tr>
                <th style="width:40px;text-align:center">Stt</th>
                <th>Niên học học kỳ</th>
                <th class="text-right">HP chưa giảm</th>
                <th class="text-right">Miễn giảm</th>
                <th class="text-right">Phải thu</th>
                <th class="text-right">Đã thu</th>
                <th class="text-right">Còn nợ</th>
              </tr>
            </thead>
            <tbody>
              <tr class="group-header">
                <td colspan="7">Thu Học Phí</td>
              </tr>
              <tr>
                <td style="text-align:center">1</td>
                <td>Học kỳ 1 - Năm học 2026 - 2027</td>
                <td class="text-right text-mono">21,535,000</td>
                <td class="text-right text-mono">0</td>
                <td class="text-right text-mono text-bold">21,535,000</td>
                <td class="text-right text-mono text-bold" style="color:var(--neo-lime-text)">21,535,000</td>
                <td class="text-right text-mono text-bold" style="color:var(--neo-lime-text)">0</td>
              </tr>
              <tr class="group-header text-bold">
                <td colspan="2" style="text-align:center">TỔNG</td>
                <td class="text-right text-mono">21,535,000</td>
                <td class="text-right text-mono">0</td>
                <td class="text-right text-mono text-bold">21,535,000</td>
                <td class="text-right text-mono text-bold" style="color:var(--neo-lime-text)">21,535,000</td>
                <td class="text-right text-mono text-bold" style="color:var(--neo-lime-text)">0</td>
              </tr>
              <tr class="text-bold" style="background:var(--neo-bg-secondary)">
                <td colspan="2" style="text-align:center">TỔNG CỘNG</td>
                <td class="text-right text-mono">21,535,000</td>
                <td class="text-right text-mono">0</td>
                <td class="text-right text-mono text-bold">21,535,000</td>
                <td class="text-right text-mono text-bold" style="color:var(--neo-lime-text)">21,535,000</td>
                <td class="text-right text-mono text-bold" style="color:var(--neo-lime-text)">0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <h2 class="view-subtitle flex items-center gap-sm anim-fade-in-up anim-delay-2" style="margin-top:0">
        ${icons.fileText(18, 'var(--neo-primary)')} HÓA ĐƠN ĐIỆN TỬ
      </h2>

      <div class="neo-card anim-fade-in-scale anim-delay-3" style="margin-bottom:var(--space-xl);padding:0;overflow:hidden">
        <div class="neo-table-wrap" style="border:none;box-shadow:none;border-radius:0">
          <table class="neo-table">
            <thead>
              <tr>
                <th>Stt</th>
                <th>Mã SV</th>
                <th>Tên sinh viên</th>
                <th>Số hóa đơn</th>
                <th style="text-align:right">Số tiền</th>
                <th>Ngày đóng</th>
                <th>Ghi chú</th>
                <th style="text-align:center">Tải hóa đơn</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td class="text-mono text-bold" style="color:var(--neo-primary)">${s.profile.id}</td>
                <td class="text-semibold">${s.profile.fullName}</td>
                <td class="text-mono text-bold">12941</td>
                <td class="text-mono text-bold" style="text-align:right">21,535,000</td>
                <td>20/08/2026</td>
                <td>Học phí</td>
                <td style="text-align:center">
                  <button id="btn-view-inv-12941" class="neo-btn neo-btn--ghost neo-btn--sm">
                    ${icons.download(14)} PDF
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="flex gap-md flex-wrap anim-fade-in-up anim-delay-4 mobile-actions-stack" style="margin-bottom:var(--space-xl)">
        <button id="btn-show-receipt" class="neo-btn neo-btn--ghost">
          ${icons.fileText(16)} Xem Biên lai (21.535.000 VNĐ)
        </button>
        <button id="btn-show-qr" class="neo-btn neo-btn--cyan anim-pulse-primary">
          ${icons.qrCode(16)} Cổng VietQR STU
        </button>
      </div>

      <div class="neo-card anim-fade-in-up anim-delay-5" style="line-height:1.6;padding:var(--space-xl)">
        <h3 class="text-heading text-bold" style="margin-bottom:var(--space-md);font-size:15px;color:var(--neo-text)">
          NHỮNG VẤN ĐỀ CẦN LƯU Ý:
        </h3>
        
        <div style="margin-bottom:var(--space-lg)">
          <div class="text-bold" style="color:var(--neo-coral)">I. ĐIỂM DANH VÀ CẤM THI CUỐI KỲ:</div>
          <div style="padding-left:var(--space-md);margin-top:var(--space-xs);font-size:13.5px">
            <div>- Vào mỗi buổi học, sinh viên phải ký tên vào danh sách điểm danh.</div>
            <div>- Sinh viên bị cấm thi nếu: (1) vắng &gt;40% số buổi học; (2) vắng &gt;50% số bài kiểm tra; (3) vắng &gt;30% số buổi thực hành/thí nghiệm/thực tập.</div>
            <div>- Cuối kỳ, giảng viên gửi danh sách sinh viên bị cấm thi về Phòng Đào tạo để xử lý.</div>
          </div>
        </div>

        <div style="margin-bottom:var(--space-lg)">
          <div class="text-bold" style="color:var(--neo-coral)">II. HỌC PHÍ:</div>
          <div style="padding-left:var(--space-md);margin-top:var(--space-xs);font-size:13.5px">
            <div>- Thời gian đóng học phí:</div>
            <div style="margin-left:var(--space-lg);margin-top:2px">
              <div>+ Môn Thực tập cơ sở: <strong>trước 19/06/2026</strong></div>
              <div>+ Môn Giáo dục quốc phòng: <strong>03/06/2026 – 03/07/2026</strong></div>
              <div>+ Học kỳ 3 (2025 – 2026): <strong>29/06/2026 – 03/07/2026</strong></div>
            </div>
            <div style="margin-top:4px">- Sinh viên phải đóng học phí trong thời gian quy định để xác lập việc đăng ký và tham gia lớp - môn học.</div>
            <div style="margin-top:4px">- Các trường hợp sinh viên không đóng học phí sẽ bị xóa tên khỏi danh sách lớp - môn học, ghi nợ học phí, không có tên trong danh sách kiểm tra giữa kỳ và không được tiếp tục theo học các lớp này.</div>
          </div>
        </div>

        <div>
          <div class="text-bold" style="color:var(--neo-coral)">III. ĐÓNG HỌC PHÍ BẰNG CHUYỂN KHOẢN:</div>
          <div style="padding-left:var(--space-md);margin-top:var(--space-xs);font-size:13.5px">
            <div>- Tên tài khoản: <strong>TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN</strong>.</div>
            <div>- Sinh viên chuyển khoản đúng số tiền theo phiếu Kết quả đăng ký môn học và học phí.</div>
            <div style="margin-top:2px">- Nội dung: Họ tên sinh viên, MSSV, học kỳ, năm học <span style="background:#FEF08A;color:#854D0E;padding:2px 6px;border-radius:4px;font-weight:600">(VD: NGUYEN VAN A, MSSV..., HỌC KỲ 3 2025-2026)</span></div>
          </div>

          <div class="grid grid-2 gap-lg" style="margin-top:var(--space-md)">
            <div class="neo-table-wrap scroll-hint-wrap" style="border:1px solid var(--neo-border-color);box-shadow:none">
              <table class="neo-table">
                <thead>
                  <tr>
                    <th>Ngân hàng</th>
                    <th>STK</th>
                    <th>Chi nhánh</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="text-semibold">1. Ngân hàng Á Châu (ACB)</td>
                    <td class="text-mono text-bold" style="color:var(--neo-primary)">8770199</td>
                    <td>Sở Giao dịch TP.HCM</td>
                  </tr>
                  <tr>
                    <td class="text-semibold">2. Ngân hàng Quân đội (MB)</td>
                    <td class="text-mono text-bold" style="color:var(--neo-primary)">1031100405004</td>
                    <td>Sở Giao dịch 2 - TP.HCM</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="neo-table-wrap scroll-hint-wrap" style="border:1px solid var(--neo-border-color);box-shadow:none">
              <table class="neo-table">
                <thead>
                  <tr>
                    <th>Ngân hàng</th>
                    <th>STK</th>
                    <th>Chi nhánh</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="text-semibold">3. Ngân hàng Đầu tư và Phát triển VN (BIDV)</td>
                    <td class="text-mono text-bold" style="color:var(--neo-primary)">1176687988</td>
                    <td>Chi nhánh Bình Điền Sài Gòn</td>
                  </tr>
                  <tr>
                    <td class="text-semibold">4. Ngân hàng TMCP Ngoại thương VN (Vietcombank)</td>
                    <td class="text-mono text-bold" style="color:var(--neo-primary)">1013884753</td>
                    <td>Chi nhánh Tân Bình</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(s);
  }

  private bindEvents(s: AppState): void {
    this.container?.querySelector('#btn-print')?.addEventListener('click', () => {
      printTuitionSheet(s.profile.fullName, s.profile.classCode);
    });
    this.container?.querySelector('#btn-excel')?.addEventListener('click', () => {
      exportTuitionExcel(s.profile.id);
      showToast(`Đã xuất file BangTongHopHocPhi_${s.profile.id}.xls thành công!`, 'success');
    });
    this.container?.querySelector('#btn-view-inv-12941')?.addEventListener('click', () => {
      this.showReceiptModal(s);
    });
    this.container?.querySelector('#btn-show-receipt')?.addEventListener('click', () => {
      this.showReceiptModal(s);
    });
    this.container?.querySelector('#btn-show-qr')?.addEventListener('click', () => {
      this.showQRModal(s);
    });
  }

  private showReceiptModal(s: AppState): void {
    const el = document.createElement('div');
    el.className = 'receipt';
    el.innerHTML = `
      <div class="receipt__header">
        <div class="text-heading text-2xl text-bold">TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN</div>
        <div class="text-heading text-lg text-bold" style="margin-top:var(--space-sm)">HÓA ĐƠN HỌC PHÍ ĐIỆN TỬ</div>
      </div>
      <div class="receipt__row"><span>Mã sinh viên</span><span class="text-mono text-bold">${s.profile.id}</span></div>
      <div class="receipt__row"><span>Họ tên</span><span class="text-bold">${s.profile.fullName}</span></div>
      <div class="receipt__row"><span>Lớp</span><span>${s.profile.classCode}</span></div>
      <div class="receipt__row"><span>Khoản thu</span><span>Học phí Học kỳ 1 (14 Tín chỉ)</span></div>
      <div class="receipt__row"><span>Học kỳ</span><span>Học kỳ 1 (2026 - 2027)</span></div>
      <div class="receipt__row"><span>Ngày thanh toán</span><span>20/08/2026 10:00:00</span></div>
      <div class="receipt__row"><span>Số hóa đơn</span><span class="text-mono text-bold">12941</span></div>
      <div class="receipt__row receipt__total"><span>Tổng tiền đã thu</span><span class="text-mono">21,535,000 VNĐ</span></div>
    `;

    const printBtn = document.createElement('button');
    printBtn.className = 'neo-btn neo-btn--primary w-full';
    printBtn.style.marginTop = 'var(--space-xl)';
    printBtn.innerHTML = `${icons.printer(16)} In Hóa đơn`;
    printBtn.addEventListener('click', () => window.print());
    el.appendChild(printBtn);

    openModal('Hóa đơn Điện tử số 12941', el, { wide: true });
  }

  private showQRModal(s: AppState): void {
    const el = document.createElement('div');
    el.className = 'flex flex-col items-center gap-md';

    let selectedBankId = 'vcb';

    const renderQRContent = () => {
      const bank = STU_BANK_ACCOUNTS.find(b => b.id === selectedBankId) || STU_BANK_ACCOUNTS[0];
      const qrUrl = generateVietQRUrl(21535000, s.profile.id, 'HK1 2026-2027', selectedBankId);

      el.innerHTML = `
        <div class="w-full">
          <label class="neo-label" style="font-size:12.5px;margin-bottom:4px">Chọn ngân hàng thụ hưởng của STU:</label>
          <select id="qr-bank-select" class="neo-select" style="padding:8px 12px;font-size:13px">
            ${STU_BANK_ACCOUNTS.map(b => `
              <option value="${b.id}" ${b.id === selectedBankId ? 'selected' : ''}>
                ${b.shortName} - STK: ${b.accountNo} (${b.branch})
              </option>
            `).join('')}
          </select>
        </div>

        <div style="background:#FFFFFF;padding:12px;border-radius:var(--neo-radius);border:var(--neo-border);box-shadow:var(--neo-shadow)">
          <img id="qr-image" src="${qrUrl}" alt="Mã VietQR STU" style="width:260px;height:260px;display:block;border-radius:8px">
        </div>

        <div style="text-align:center;width:100%;font-size:13px;line-height:1.5">
          <div class="text-secondary">Chủ tài khoản: <strong style="color:var(--neo-text)">${bank.accountName}</strong></div>
          <div class="text-secondary">Số tài khoản: <strong class="text-mono" style="color:var(--neo-primary);font-size:15px">${bank.accountNo}</strong> (${bank.shortName})</div>
          <div class="text-mono text-xl text-bold" style="margin:4px 0;color:var(--neo-primary)">21,535,000 VNĐ</div>
          <div class="text-xs text-secondary">Nội dung CK: <strong class="text-mono">${s.profile.id} HK1 2026-2027</strong></div>
          <div class="neo-badge neo-badge--lime" style="margin-top:8px;font-size:11.5px">Trạng thái: Đã thanh toán đầy đủ</div>
        </div>
      `;

      el.querySelector('#qr-bank-select')?.addEventListener('change', (e) => {
        selectedBankId = (e.target as HTMLSelectElement).value;
        renderQRContent();
      });
    };

    renderQRContent();
    openModal('Cổng Thanh toán VietQR STU', el);
  }
}
