import { stateStore } from '../store/stateStore';
import { icons } from '../utils/svgIcons';
import { fetchAndApplyLiveSTUData } from '../services/stuLiveService';
import { showToast } from '../components/Toast';
import { attachRipple, shakeElement } from '../utils/animationEngine';

export class LoginView {
  private container: HTMLElement | null = null;
  private isSubmitting = false;
  private videoElement: HTMLVideoElement | null = null;

  mount(container: HTMLElement): void {
    this.container = container;
    this.render();
  }

  unmount(): void {
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.src = '';
      this.videoElement = null;
    }
    this.container = null;
  }

  private render(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div id="login-screen-wrap" class="login-wrapper" style="position:relative;overflow:hidden;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:var(--space-xl)">
        
        <!-- Video nền nước water.mp4 chuyển động êm dịu, được làm mờ nghệ thuật -->
        <video 
          id="login-bg-video" 
          src="/water.mp4" 
          autoplay 
          loop 
          muted 
          playsinline 
          webkit-playsinline
          style="position:fixed;inset:0;width:100vw;height:100vh;object-fit:cover;z-index:0;filter:blur(16px) brightness(0.92) contrast(1.08);transform:scale(1.08);pointer-events:none;user-select:none"
        ></video>

        <!-- Lớp kính mờ toàn màn hình (Fullscreen Frosted Glass Veil) -->
        <div style="position:fixed;inset:0;backdrop-filter:blur(18px) saturate(160%);-webkit-backdrop-filter:blur(18px) saturate(160%);background:radial-gradient(circle at 50% 40%, rgba(255,255,255,0.25) 0%, rgba(2,132,199,0.12) 60%, rgba(15,23,42,0.28) 100%);z-index:1;pointer-events:none"></div>

        <!-- Khung Đăng nhập Glassmorphism Kính mờ siêu thực nổi bật trên mặt nước -->
        <div id="login-card" class="anim-fade-in-scale login-card-responsive" style="
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 440px;
          padding: var(--space-2xl);
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(28px) saturate(190%);
          -webkit-backdrop-filter: blur(28px) saturate(190%);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 30px 60px -15px rgba(2, 44, 90, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.6) inset;
          border-radius: var(--neo-radius-xl);
        ">
          
          <div class="flex flex-col items-center text-center" style="margin-bottom:var(--space-xl)">
            <img src="/Logo_STU.png" alt="STU Logo" style="height:56px;width:auto;object-fit:contain;margin-bottom:var(--space-md);display:block;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.08))">
            <h1 class="text-heading text-bold" style="font-size:15px;color:var(--neo-text);letter-spacing:-0.2px;line-height:1.3">
              TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN
            </h1>
            <div class="text-semibold" style="font-size:12.5px;color:var(--neo-primary);margin-top:4px;letter-spacing:0.5px">
              CỔNG THÔNG TIN SINH VIÊN (AMIS)
            </div>
          </div>

          <form id="login-form" class="flex flex-col gap-lg">
            <div>
              <label class="neo-label flex items-center gap-xs" style="margin-bottom:6px;font-size:12.5px;font-weight:600">
                ${icons.user(14, 'var(--neo-text-secondary)')} Mã sinh viên (MSSV)
              </label>
              <input 
                id="login-username" 
                type="text" 
                placeholder="Nhập mã sinh viên của bạn" 
                required 
                autocomplete="username"
                style="width:100%;padding:12px 14px;font-size:14px;border-radius:var(--neo-radius);border:1px solid rgba(255,255,255,0.7);background:rgba(255,255,255,0.65);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);outline:none;color:var(--neo-text);box-shadow:0 2px 5px rgba(0,0,0,0.02) inset;transition:border-color 0.2s, background 0.2s;"
              >
            </div>

            <div>
              <label class="neo-label flex items-center gap-xs" style="margin-bottom:6px;font-size:12.5px;font-weight:600">
                ${icons.lock(14, 'var(--neo-text-secondary)')} Mật khẩu
              </label>
              <div style="position:relative">
                <input 
                  id="login-password" 
                  type="password" 
                  placeholder="Nhập mật khẩu tài khoản STU" 
                  required 
                  autocomplete="current-password"
                  style="width:100%;padding:12px 42px 12px 14px;font-size:14px;border-radius:var(--neo-radius);border:1px solid rgba(255,255,255,0.7);background:rgba(255,255,255,0.65);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);outline:none;color:var(--neo-text);box-shadow:0 2px 5px rgba(0,0,0,0.02) inset;transition:border-color 0.2s, background 0.2s;"
                >
                <button 
                  type="button" 
                  id="btn-toggle-pwd" 
                  class="neo-btn neo-btn--ghost neo-btn--sm" 
                  style="position:absolute;right:6px;top:50%;transform:translateY(-50%);padding:6px;border:none;box-shadow:none;background:transparent;border-radius:50%"
                  title="Hiện/ẩn mật khẩu"
                >
                  ${icons.eye(16)}
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between" style="font-size:12.5px;color:var(--neo-text-secondary)">
              <label class="flex items-center gap-xs" style="cursor:pointer">
                <input type="checkbox" id="remember-me" checked style="accent-color:var(--neo-primary);cursor:pointer">
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <a href="http://amis01.stu.edu.vn" target="_blank" style="color:var(--neo-primary);text-decoration:none;font-weight:600">
                Quên mật khẩu?
              </a>
            </div>

            <button 
              id="btn-submit-login" 
              type="submit" 
              class="neo-btn neo-btn--primary" 
              style="padding:13px;font-size:14.5px;font-weight:700;width:100%;letter-spacing:0.3px;margin-top:var(--space-xs);border-radius:var(--neo-radius);background:linear-gradient(135deg,#0284C7 0%,#0369A1 100%);box-shadow:0 8px 20px -4px rgba(2,132,199,0.45);border:1px solid rgba(255,255,255,0.25);cursor:pointer"
            >
              ${icons.refreshCw(16)} ĐĂNG NHẬP STU AMIS
            </button>
          </form>

          <div style="margin-top:var(--space-xl);padding-top:var(--space-lg);border-top:1px solid rgba(255,255,255,0.5);font-size:11.5px;color:var(--neo-text-secondary);line-height:1.5;text-align:center">
            <div>Cổng Thông tin Sinh viên - Trường Đại học Công nghệ Sài Gòn</div>
            <div style="opacity:0.8;margin-top:2px">180 Cao Lỗ, P. Chánh Hưng, TP.HCM | CNSG-V 2026.08</div>
          </div>
        </div>
      </div>
    `;

    this.videoElement = this.container.querySelector('#login-bg-video') as HTMLVideoElement;
    this.bindEvents();
  }

  private bindEvents(): void {
    if (!this.container) return;

    const form = this.container.querySelector('#login-form') as HTMLFormElement;
    const userInput = this.container.querySelector('#login-username') as HTMLInputElement;
    const pwdInput = this.container.querySelector('#login-password') as HTMLInputElement;
    const togglePwdBtn = this.container.querySelector('#btn-toggle-pwd') as HTMLButtonElement;
    const submitBtn = this.container.querySelector('#btn-submit-login') as HTMLButtonElement;

    togglePwdBtn?.addEventListener('click', () => {
      const isPwd = pwdInput.type === 'password';
      pwdInput.type = isPwd ? 'text' : 'password';
      togglePwdBtn.innerHTML = isPwd ? icons.eyeOff(16) : icons.eye(16);
    });

    submitBtn?.addEventListener('click', (e) => attachRipple(submitBtn, e));

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (this.isSubmitting) return;

      const card = this.container?.querySelector('#login-card') as HTMLElement;
      const u = userInput.value.trim();
      const p = pwdInput.value.trim();

      if (!u || !p) {
        shakeElement(card);
        showToast('Vui lòng nhập đầy đủ Mã sinh viên và Mật khẩu', 'warning');
        return;
      }

      this.isSubmitting = true;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="anim-spin" style="display:inline-flex">${icons.refreshCw(16)}</span> Đang xác thực...`;
      showToast('Đang kết nối máy chủ STU AMIS...', 'info');

      try {
        const ok = await fetchAndApplyLiveSTUData(u, p);
        if (ok) {
          localStorage.setItem('stu_amis_auth_user', u);
          localStorage.setItem('stu_user_password', p);
          stateStore.setState({ isAuthenticated: true });
          showToast(`Đăng nhập thành công! Chào mừng sinh viên ${u}`, 'success');
        } else {
          shakeElement(card);
          showToast('Mã sinh viên hoặc mật khẩu không chính xác trên hệ thống STU AMIS.', 'error');
        }
      } catch (err: any) {
        shakeElement(card);
        showToast('Lỗi kết nối máy chủ STU. Vui lòng thử lại.', 'error');
      } finally {
        this.isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `${icons.refreshCw(16)} ĐĂNG NHẬP STU AMIS`;
        }
      }
    });
  }
}
