document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('config-form');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const autoLoginCheckbox = document.getElementById('auto-login');
  const togglePwdBtn = document.getElementById('btn-toggle-pwd');
  const openPortalBtn = document.getElementById('btn-open-portal');
  const toast = document.getElementById('toast');

  const DEFAULT_CONFIG = {
    username: 'DH05260789',
    password: '23122008',
    autoLogin: true
  };

  function showToast(msg, isError = false) {
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    toast.style.background = isError ? '#FEE2E2' : '#DCFCE7';
    toast.style.color = isError ? '#991B1B' : '#166534';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 2500);
  }

  // Load existing credentials
  chrome.storage.local.get(DEFAULT_CONFIG, (cfg) => {
    usernameInput.value = cfg.username || DEFAULT_CONFIG.username;
    passwordInput.value = cfg.password || DEFAULT_CONFIG.password;
    autoLoginCheckbox.checked = typeof cfg.autoLogin === 'boolean' ? cfg.autoLogin : true;
  });

  // Toggle password visibility
  togglePwdBtn.addEventListener('click', () => {
    const isPwd = passwordInput.type === 'password';
    passwordInput.type = isPwd ? 'text' : 'password';
    togglePwdBtn.innerHTML = isPwd
      ? `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>`
      : `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>`;
  });

  // Save credentials
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = usernameInput.value.trim();
    const p = passwordInput.value.trim();
    const auto = autoLoginCheckbox.checked;

    if (!u || !p) {
      showToast('Vui lòng nhập đầy đủ MSSV và mật khẩu', true);
      return;
    }

    chrome.storage.local.set({
      username: u,
      password: p,
      autoLogin: auto
    }, () => {
      showToast('Đã lưu cấu hình tài khoản thành công!');
    });
  });

  // Open STU portal
  openPortalBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://amis01.stu.edu.vn/#/home' });
  });
});
