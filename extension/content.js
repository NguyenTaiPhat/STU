(function () {
  'use strict';

  console.log('[STU Auto Login] Content script khởi chạy trên:', window.location.href);

  const DEFAULT_CONFIG = {
    username: 'DH05260789',
    password: '23122008',
    autoLogin: true
  };

  const SESSION_FLAG = 'stu_auto_login_done';
  const MAX_ATTEMPTS = 3;
  const ATTEMPT_KEY = 'stu_auto_login_attempts';

  function showStatusBanner(text, isError = false) {
    let banner = document.getElementById('stu-autologin-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'stu-autologin-banner';
      banner.style.cssText = `
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 999999;
        padding: 10px 16px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        font-weight: 600;
        color: #ffffff;
        background: ${isError ? '#DC2626' : '#0284C7'};
        border: 2px solid #000000;
        box-shadow: 3px 3px 0px #000000;
        border-radius: 6px;
        transition: opacity 0.3s ease;
        pointer-events: none;
      `;
      document.body.appendChild(banner);
    }
    banner.textContent = text;
    banner.style.background = isError ? '#DC2626' : '#0284C7';
    banner.style.opacity = '1';

    setTimeout(() => {
      if (banner) banner.style.opacity = '0';
    }, 4000);
  }

  function setAngularInputValue(el, value) {
    if (!el) return;
    el.focus();
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;

    if (nativeSetter) {
      nativeSetter.call(el, value);
    } else {
      el.value = value;
    }

    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  function isAlreadyLoggedIn() {
    const links = Array.from(document.querySelectorAll('a, span, li, button'));
    const hasStudentFeatures = links.some(el => {
      const txt = (el.textContent || '').trim();
      return txt.includes('Xem học phí') || txt.includes('Thời khóa biểu dạng tuần') || txt.includes('Đăng xuất');
    });
    return hasStudentFeatures;
  }

  function getConfig(cb) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(DEFAULT_CONFIG, (res) => {
        cb(res && res.username ? res : DEFAULT_CONFIG);
      });
    } else {
      cb(DEFAULT_CONFIG);
    }
  }

  let isExecuting = false;

  async function performLogin() {
    if (isExecuting) return;
    if (isAlreadyLoggedIn()) {
      console.log('[STU Auto Login] Sinh viên đã đăng nhập, bỏ qua.');
      return;
    }

    const attempts = Number(sessionStorage.getItem(ATTEMPT_KEY) || 0);
    if (attempts >= MAX_ATTEMPTS) {
      console.warn('[STU Auto Login] Đã đạt giới hạn số lần thử trong phiên.');
      return;
    }

    const userInput = document.querySelector('input[name="username"], input[formcontrolname="username"]');
    const pwdInput = document.querySelector('input[name="password"], input[formcontrolname="password"]');

    if (!userInput || !pwdInput) {
      return;
    }

    const buttons = Array.from(document.querySelectorAll('button'));
    const loginBtn = buttons.find(b => {
      const txt = (b.textContent || '').trim();
      return txt.includes('Đăng nhập') && !b.classList.contains('btn-close');
    });

    if (!loginBtn) {
      return;
    }

    isExecuting = true;

    getConfig((cfg) => {
      if (!cfg.autoLogin) {
        console.log('[STU Auto Login] Tính năng tự động đăng nhập đang tắt trong cấu hình.');
        isExecuting = false;
        return;
      }

      sessionStorage.setItem(ATTEMPT_KEY, String(attempts + 1));
      console.log(`[STU Auto Login] Điền thông tin cho tài khoản: ${cfg.username}`);
      showStatusBanner(`STU Auto Login: Đang tự động điền tài khoản ${cfg.username}...`);

      setAngularInputValue(userInput, cfg.username);
      setAngularInputValue(pwdInput, cfg.password);

      setTimeout(() => {
        console.log('[STU Auto Login] Kích hoạt click nút Đăng nhập.');
        showStatusBanner(`STU Auto Login: Đang tiến hành đăng nhập...`);
        loginBtn.click();
        sessionStorage.setItem(SESSION_FLAG, 'true');
        isExecuting = false;
      }, 350);
    });
  }

  // Observer đón đầu khi Angular render form
  const observer = new MutationObserver(() => {
    const userInput = document.querySelector('input[name="username"], input[formcontrolname="username"]');
    const pwdInput = document.querySelector('input[name="password"], input[formcontrolname="password"]');

    if (userInput && pwdInput && !isAlreadyLoggedIn() && !isExecuting) {
      observer.disconnect();
      setTimeout(performLogin, 300);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Fallback định kỳ kiểm tra sau khi tải trang
  setTimeout(performLogin, 600);
  setTimeout(performLogin, 1500);
})();
