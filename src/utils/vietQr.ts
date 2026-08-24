import { formatCurrency } from './formatters';

export interface StuBankAccount {
  id: string;
  bankName: string;
  shortName: string;
  bin: string;
  accountNo: string;
  accountName: string;
  branch: string;
}

export const STU_BANK_ACCOUNTS: StuBankAccount[] = [
  {
    id: 'vcb',
    bankName: 'Ngân hàng TMCP Ngoại thương VN (Vietcombank)',
    shortName: 'Vietcombank',
    bin: '970436',
    accountNo: '1013884753',
    accountName: 'TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN',
    branch: 'Chi nhánh Tân Bình',
  },
  {
    id: 'acb',
    bankName: 'Ngân hàng Á Châu (ACB)',
    shortName: 'ACB',
    bin: '970416',
    accountNo: '8770199',
    accountName: 'TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN',
    branch: 'Sở Giao dịch TP.HCM',
  },
  {
    id: 'mb',
    bankName: 'Ngân hàng Quân đội (MB)',
    shortName: 'MB Bank',
    bin: '970422',
    accountNo: '1031100405004',
    accountName: 'TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN',
    branch: 'Sở Giao dịch 2 - TP.HCM',
  },
  {
    id: 'bidv',
    bankName: 'Ngân hàng Đầu tư và Phát triển VN (BIDV)',
    shortName: 'BIDV',
    bin: '970418',
    accountNo: '1176687988',
    accountName: 'TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN',
    branch: 'Chi nhánh Bình Điền Sài Gòn',
  },
];

const TEMPLATE = 'compact2';

export function generateVietQRUrl(
  amount: number,
  studentId: string,
  semester: string,
  bankId = 'vcb'
): string {
  const bank = STU_BANK_ACCOUNTS.find(b => b.id === bankId) || STU_BANK_ACCOUNTS[0];
  const memo = encodeURIComponent(`${studentId} ${semester}`);
  const name = encodeURIComponent(bank.accountName);
  return `https://img.vietqr.io/image/${bank.bin}-${bank.accountNo}-${TEMPLATE}.png?amount=${amount}&addInfo=${memo}&accountName=${name}`;
}

export function renderVietQRFallback(
  amount: number,
  studentId: string,
  semester: string,
  bankId = 'vcb'
): HTMLElement {
  const bank = STU_BANK_ACCOUNTS.find(b => b.id === bankId) || STU_BANK_ACCOUNTS[0];
  const el = document.createElement('div');
  el.className = 'neo-card';
  el.style.textAlign = 'center';
  el.innerHTML = `
    <p class="text-heading text-bold" style="margin-bottom:var(--space-lg)">Thông tin Chuyển khoản STU</p>
    <div style="display:grid;grid-template-columns:140px 1fr;gap:var(--space-sm);text-align:left;font-size:13.5px">
      <span class="text-secondary">Ngân hàng</span><span class="text-bold">${bank.bankName}</span>
      <span class="text-secondary">Chi nhánh</span><span>${bank.branch}</span>
      <span class="text-secondary">Số Tài khoản</span><span class="text-mono text-bold text-primary">${bank.accountNo}</span>
      <span class="text-secondary">Tên thụ hưởng</span><span class="text-bold">${bank.accountName}</span>
      <span class="text-secondary">Số tiền</span><span class="text-mono text-bold">${formatCurrency(amount)}</span>
      <span class="text-secondary">Nội dung CK</span><span class="text-mono text-bold">${studentId} ${semester}</span>
    </div>
  `;
  return el;
}
