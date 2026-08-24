import { type ViewModule, type AppState } from '../types/portal.types';
import { stateStore } from '../store/stateStore';
import { icons } from '../utils/svgIcons';
import { getAcademicRank } from '../utils/formatters';
import { getCumulativeGPA4 } from '../actions/gradeActions';
import { updateContactInfo, exportStateAsJSON } from '../actions/profileActions';
import { openModal, closeModal } from '../components/Modal';
import { showToast } from '../components/Toast';
import { attachRipple } from '../utils/animationEngine';

export class ProfileView implements ViewModule {
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
      <h1 class="view-title flex items-center gap-sm">
        ${icons.user(22, 'var(--neo-primary)')} HỒ SƠ SINH VIÊN
      </h1>
      <div id="profile-card"></div>
      
      <h2 class="view-subtitle flex items-center gap-sm" style="margin-top:var(--space-xl)">
        ${icons.bookOpen(18, 'var(--neo-primary)')} THÔNG TIN ĐÀO TẠO
      </h2>
      <div id="course-info-card"></div>
      
      <h2 class="view-subtitle flex items-center gap-sm" style="margin-top:var(--space-xl)">
        ${icons.award(18, 'var(--neo-primary)')} ĐIỂM RÈN LUYỆN
      </h2>
      <div id="training-table"></div>

      <div class="grid grid-2 gap-xl" style="margin-top:var(--space-xl)">
        <div>
          <h2 class="view-subtitle flex items-center gap-sm" style="margin-top:0">
            ${icons.mail(18, 'var(--neo-primary)')} THÔNG TIN LIÊN HỆ
          </h2>
          <div id="contact-form"></div>
        </div>

        <div>
          <h2 class="view-subtitle flex items-center gap-sm" style="margin-top:0">
            ${icons.lock(18, 'var(--neo-primary)')} ĐỔI MẬT KHẨU
          </h2>
          <div id="password-form"></div>
        </div>
      </div>
      
      <h2 class="view-subtitle flex items-center gap-sm" style="margin-top:var(--space-xl)">
        ${icons.settings(18, 'var(--neo-primary)')} TIỆN ÍCH HỆ THỐNG
      </h2>
      <div id="utility-buttons"></div>
    `;

    this.renderProfileCard(s);
    this.renderCourseInfoCard(s);
    this.renderTrainingTable(s);
    this.renderContactForm(s);
    this.renderPasswordForm();
    this.renderUtilities();
  }

  private renderProfileCard(s: AppState): void {
    const slot = this.container!.querySelector('#profile-card')!;
    const gpa4 = getCumulativeGPA4(s.grades);
    const card = document.createElement('div');
    card.className = 'neo-card anim-fade-in-up';

    card.innerHTML = `
      <div class="profile-header">
        <div class="profile-avatar" style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg, #0284C7, #38BDF8);display:flex;align-items:center;justify-content:center;color:#FFFFFF;box-shadow:0 8px 20px -4px rgba(2,132,199,0.4)">
          ${icons.user(32, '#FFFFFF')}
        </div>
        <div style="flex:1;width:100%">
          <div class="flex items-center gap-md flex-wrap" style="margin-bottom:var(--space-md)">
            <span class="text-heading text-xl text-bold">${s.profile.fullName}</span>
            <span class="neo-badge neo-badge--lime anim-pulse-live">${s.profile.status || 'Đang học'}</span>
            ${gpa4 > 0 ? `<span class="neo-badge neo-badge--cyan">${getAcademicRank(gpa4)}</span>` : '<span class="neo-badge neo-badge--ghost">Tân sinh viên</span>'}
          </div>
          <div class="profile-info-grid">
            ${this.infoItem('Mã SV', s.profile.id, true)}
            ${this.infoItem('Tên sinh viên', s.profile.fullName)}
            ${this.infoItem('Ngày sinh', s.profile.dob)}
            ${this.infoItem('Giới tính', s.profile.gender === 'Nam' ? 'Nam' : 'Nữ')}
            ${this.infoItem('Số CMND/ CCCD', s.profile.citizenId || 'Chưa cập nhật', !!s.profile.citizenId)}
            ${this.infoItem('Trạng thái', s.profile.status || 'Đang học')}
            ${this.infoItem('Số điện thoại', s.profile.phone || 'Chưa cập nhật', !!s.profile.phone)}
            ${this.infoItem('Email', s.profile.email)}
          </div>
        </div>
      </div>
    `;
    slot.appendChild(card);
  }

  private renderCourseInfoCard(s: AppState): void {
    const slot = this.container!.querySelector('#course-info-card')!;
    const card = document.createElement('div');
    card.className = 'neo-card anim-fade-in-up anim-delay-1';

    card.innerHTML = `
      <div class="profile-info-grid">
        ${this.infoItem('Lớp sinh hoạt', s.profile.classCode, true)}
        ${this.infoItem('Ngành học', s.profile.major)}
        ${this.infoItem('Khoa chuyên môn', s.profile.faculty)}
        ${this.infoItem('Bậc hệ đào tạo', s.profile.degreeLevel || 'Đại học chính quy')}
        ${this.infoItem('Khóa học', s.profile.academicYear, true)}
        ${this.infoItem('Cố vấn học tập', s.profile.advisor || 'Đang cập nhật')}
      </div>
    `;
    slot.appendChild(card);
  }

  private infoItem(label: string, value: string, mono = false): string {
    return `<div class="profile-info-item">
      <span class="profile-info-item__label">${label}</span>
      <span class="profile-info-item__value ${mono ? 'text-mono' : ''}">${value}</span>
    </div>`;
  }

  private renderTrainingTable(s: AppState): void {
    const slot = this.container!.querySelector('#training-table')!;
    const entries = Object.entries(s.profile.trainingPoints);

    const wrap = document.createElement('div');
    wrap.className = 'neo-table-wrap';

    let rows = '';
    if (entries.length === 0) {
      rows = `<tr><td colspan="4" style="text-align:center;padding:var(--space-lg);color:var(--neo-text-secondary)">Tân sinh viên Khóa 2026 - 2030 chưa có dữ liệu điểm rèn luyện</td></tr>`;
    } else {
      entries.forEach(([sem, points], i) => {
        const rank = points >= 90 ? 'Xuất sắc' : points >= 80 ? 'Tốt' : points >= 65 ? 'Khá' : points >= 50 ? 'Trung bình' : 'Yếu';
        const badgeClass = points >= 90 ? 'lime' : points >= 80 ? 'cyan' : points >= 65 ? 'ghost' : 'coral';
        rows += `<tr>
          <td>${i + 1}</td>
          <td class="text-semibold">${sem}</td>
          <td class="mono text-bold">${points}</td>
          <td><span class="neo-badge neo-badge--${badgeClass}">${rank}</span></td>
        </tr>`;
      });
    }

    wrap.innerHTML = `<table class="neo-table"><thead><tr>
      <th>STT</th><th>Học kỳ</th><th>Điểm</th><th>Xếp loại</th>
    </tr></thead><tbody>${rows}</tbody></table>`;

    slot.appendChild(wrap);
  }

  private renderContactForm(s: AppState): void {
    const slot = this.container!.querySelector('#contact-form')!;
    const card = document.createElement('div');
    card.className = 'neo-card';

    card.innerHTML = `
      <div class="flex flex-col gap-md" style="margin-bottom:var(--space-lg)">
        <div>
          <label class="neo-label">${icons.mail(13)} Email liên hệ</label>
          <input id="email-input" class="neo-input" type="email" value="${s.profile.email}">
        </div>
        <div>
          <label class="neo-label">${icons.phone(13)} Số điện thoại</label>
          <input id="phone-input" class="neo-input" type="tel" value="${s.profile.phone || ''}" placeholder="Nhập số điện thoại...">
        </div>
      </div>
      <button id="save-contact" class="neo-btn neo-btn--primary w-full">${icons.check(15)} Lưu thay đổi</button>
    `;

    card.querySelector('#save-contact')!.addEventListener('click', () => {
      const email = (card.querySelector('#email-input') as HTMLInputElement).value;
      const phone = (card.querySelector('#phone-input') as HTMLInputElement).value;
      const result = updateContactInfo(email, phone);
      if (result.ok) {
        showToast('Cập nhật thông tin thành công!', 'success');
      } else {
        showToast(result.error ?? 'Lỗi xác thực', 'error');
      }
    });

    slot.appendChild(card);
  }

  private renderPasswordForm(): void {
    const slot = this.container!.querySelector('#password-form')!;
    const card = document.createElement('div');
    card.className = 'neo-card';

    card.innerHTML = `
      <div class="flex flex-col gap-md" style="margin-bottom:var(--space-lg)">
        <div>
          <label class="neo-label">${icons.lock(13)} Mật khẩu hiện tại</label>
          <input id="current-pass-input" class="neo-input" type="password" placeholder="Nhập mật khẩu hiện tại (mặc định: 23122008)">
        </div>
        <div>
          <label class="neo-label">${icons.lock(13)} Mật khẩu mới</label>
          <input id="new-pass-input" class="neo-input" type="password" placeholder="Tối thiểu 6 ký tự">
        </div>
        <div>
          <label class="neo-label">${icons.lock(13)} Xác nhận mật khẩu mới</label>
          <input id="confirm-pass-input" class="neo-input" type="password" placeholder="Nhập lại mật khẩu mới">
        </div>
      </div>
      <button id="btn-change-pass" class="neo-btn neo-btn--primary w-full">
        ${icons.check(15)} Cập nhật Mật khẩu
      </button>
    `;

    card.querySelector('#btn-change-pass')!.addEventListener('click', () => {
      const curPass = (card.querySelector('#current-pass-input') as HTMLInputElement).value.trim();
      const newPass = (card.querySelector('#new-pass-input') as HTMLInputElement).value.trim();
      const confirmPass = (card.querySelector('#confirm-pass-input') as HTMLInputElement).value.trim();

      const savedPass = localStorage.getItem('stu_user_password') || '23122008';

      if (!curPass) {
        showToast('Vui lòng nhập mật khẩu hiện tại', 'warning');
        return;
      }
      if (curPass !== savedPass) {
        showToast('Mật khẩu hiện tại không chính xác', 'error');
        return;
      }
      if (newPass.length < 6) {
        showToast('Mật khẩu mới phải có tối thiểu 6 ký tự', 'warning');
        return;
      }
      if (newPass === curPass) {
        showToast('Mật khẩu mới không được trùng với mật khẩu cũ', 'warning');
        return;
      }
      if (newPass !== confirmPass) {
        showToast('Xác nhận mật khẩu mới không trùng khớp', 'error');
        return;
      }

      localStorage.setItem('stu_user_password', newPass);
      showToast('Đổi mật khẩu thành công!', 'success');

      (card.querySelector('#current-pass-input') as HTMLInputElement).value = '';
      (card.querySelector('#new-pass-input') as HTMLInputElement).value = '';
      (card.querySelector('#confirm-pass-input') as HTMLInputElement).value = '';
    });

    slot.appendChild(card);
  }

  private renderUtilities(): void {
    const slot = this.container!.querySelector('#utility-buttons')!;
    const card = document.createElement('div');
    card.className = 'neo-card flex gap-md flex-wrap';

    const exportBtn = document.createElement('button');
    exportBtn.className = 'neo-btn neo-btn--ghost neo-btn--sm';
    exportBtn.innerHTML = `${icons.download(14)} Xuất Dữ liệu JSON`;
    exportBtn.addEventListener('click', () => {
      exportStateAsJSON();
      showToast('Đã xuất file dữ liệu', 'success');
    });

    const resetBtn = document.createElement('button');
    resetBtn.className = 'neo-btn neo-btn--danger neo-btn--sm';
    resetBtn.innerHTML = `${icons.refreshCw(14)} Khôi phục Mặc định`;
    resetBtn.addEventListener('click', () => this.confirmReset());

    card.append(exportBtn, resetBtn);
    slot.appendChild(card);
  }

  private confirmReset(): void {
    const el = document.createElement('div');
    el.innerHTML = `
      <p style="margin-bottom:var(--space-xl);font-size:13.5px;line-height:1.5">Toàn bộ dữ liệu bộ nhớ sẽ được thiết lập lại về mặc định ban đầu.</p>
    `;
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'neo-btn neo-btn--danger w-full';
    confirmBtn.innerHTML = `${icons.alertTriangle(15)} Xác nhận Khôi phục`;
    confirmBtn.addEventListener('click', () => {
      stateStore.resetToDefault();
      localStorage.removeItem('stu_user_password');
      showToast('Đã khôi phục dữ liệu mặc định', 'info');
      closeModal();
    });
    el.appendChild(confirmBtn);
    openModal('Xác nhận Khôi phục', el);
  }
}
