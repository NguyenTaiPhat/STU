import { icons } from '../utils/svgIcons';
import { stateStore } from '../store/stateStore';
import { ThemeMode } from '../types/portal.types';
import { fetchAndApplyLiveSTUData } from '../services/stuLiveService';
import { openModal, closeModal } from './Modal';
import { showToast } from './Toast';
import { triggerThemeTransition } from '../utils/animationEngine';

let headerEl: HTMLElement | null = null;
let unsub: (() => void) | null = null;
let onMenuClick: (() => void) | null = null;

function createHeader(menuCallback: () => void): HTMLElement {
  onMenuClick = menuCallback;
  const el = document.createElement('header');
  el.className = 'app__header';

  const left = document.createElement('div');
  left.className = 'flex items-center gap-md';

  const mobileMenuBtn = document.createElement('button');
  mobileMenuBtn.className = 'neo-btn neo-btn--ghost neo-btn--sm hide-desktop';
  mobileMenuBtn.id = 'mobile-menu-btn';
  mobileMenuBtn.style.display = 'none';
  mobileMenuBtn.title = 'Mở Menu';
  mobileMenuBtn.innerHTML = icons.menu(18);
  mobileMenuBtn.addEventListener('click', () => onMenuClick?.());

  left.append(mobileMenuBtn);

  const right = document.createElement('div');
  right.className = 'flex items-center gap-md';

  const liveBadge = document.createElement('button');
  liveBadge.className = 'neo-badge neo-badge--lime';
  liveBadge.id = 'live-status-badge';
  liveBadge.style.cursor = 'pointer';
  liveBadge.title = 'Bấm để đồng bộ dữ liệu trực tiếp từ máy chủ STU';
  liveBadge.innerHTML = `${icons.refreshCw(12)} LIVE AMIS`;
  liveBadge.addEventListener('click', handleManualSync);

  const accountChip = document.createElement('div');
  accountChip.className = 'flex items-center gap-sm';
  accountChip.style.cssText = 'padding:4px 10px;border-radius:999px;background:var(--neo-bg-secondary);cursor:pointer;border:1px solid var(--neo-border-color);';
  accountChip.title = 'Thông tin tài khoản STU';
  accountChip.innerHTML = `
    <div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#0284C7,#38BDF8);display:flex;align-items:center;justify-content:center;color:#FFF">
      ${icons.user(13, '#FFF')}
    </div>
    <span class="user-chip-name text-semibold text-sm hide-mobile" style="color:var(--neo-text)">Tài khoản</span>
  `;
  accountChip.addEventListener('click', openAccountModal);

  const themeBtn = document.createElement('button');
  themeBtn.className = 'neo-btn neo-btn--ghost neo-btn--sm';
  themeBtn.id = 'theme-toggle';
  themeBtn.title = 'Chuyển chế độ sáng/tối';
  themeBtn.addEventListener('click', toggleTheme);

  right.append(liveBadge, accountChip, themeBtn);
  el.append(left, right);

  updateHeaderState(el);
  unsub = stateStore.subscribe(() => updateHeaderState(el));

  setupResponsiveMenu(mobileMenuBtn);
  headerEl = el;
  return el;
}

async function handleManualSync(): Promise<void> {
  showToast('Đang kết nối và lấy dữ liệu trực tiếp từ STU AMIS...', 'info');
  const ok = await fetchAndApplyLiveSTUData();
  if (ok) {
    showToast('Đã đồng bộ dữ liệu thời gian thực từ STU AMIS!', 'success');
  } else {
    showToast('Lỗi đồng bộ trực tiếp máy chủ STU', 'error');
  }
}

function openAccountModal(): void {
  const s = stateStore.getState();
  const el = document.createElement('div');
  el.className = 'flex flex-col gap-lg';
  el.innerHTML = `
    <div>
      <label class="neo-label">Tài khoản STU (MSSV)</label>
      <input id="modal-user" class="neo-input" type="text" value="${s.profile.id}">
    </div>
    <div>
      <label class="neo-label">Mật khẩu</label>
      <input id="modal-pass" class="neo-input" type="password" placeholder="Nhập mật khẩu STU">
    </div>
    <button id="modal-sync-btn" class="neo-btn neo-btn--primary w-full">
      ${icons.refreshCw(16)} Đồng bộ Trực tiếp từ STU
    </button>
    <button id="modal-logout-btn" class="neo-btn neo-btn--ghost w-full" style="color:var(--neo-coral);border-color:rgba(239,68,68,0.3)">
      ${icons.logOut(16)} Đăng xuất khỏi Cổng thông tin
    </button>
  `;

  el.querySelector('#modal-sync-btn')!.addEventListener('click', async () => {
    const u = (el.querySelector('#modal-user') as HTMLInputElement).value.trim();
    const p = (el.querySelector('#modal-pass') as HTMLInputElement).value.trim();
    if (!u || !p) {
      showToast('Vui lòng nhập tài khoản và mật khẩu', 'warning');
      return;
    }
    showToast('Đang kết nối trực tiếp STU AMIS...', 'info');
    const ok = await fetchAndApplyLiveSTUData(u, p);
    if (ok) {
      localStorage.setItem('stu_amis_auth_user', u);
      localStorage.setItem('stu_user_password', p);
      stateStore.setState({ isAuthenticated: true });
      showToast(`Đã đồng bộ tài khoản ${u} thành công!`, 'success');
      closeModal();
    } else {
      showToast('Đăng nhập trực tiếp thất bại. Kiểm tra lại thông tin.', 'error');
    }
  });

  el.querySelector('#modal-logout-btn')!.addEventListener('click', () => {
    localStorage.removeItem('stu_amis_auth_user');
    localStorage.removeItem('stu_user_password');
    stateStore.setState({ isAuthenticated: false });
    closeModal();
    showToast('Đã đăng xuất khỏi hệ thống', 'info');
  });

  openModal('Tài khoản STU AMIS', el);
}

function updateHeaderState(el: HTMLElement): void {
  const s = stateStore.getState();
  const themeBtn = el.querySelector('#theme-toggle');
  if (themeBtn) {
    themeBtn.innerHTML = s.theme === ThemeMode.Light
      ? icons.moon(18) : icons.sun(18);
  }

  const badge = el.querySelector('#live-status-badge') as HTMLElement;
  if (badge) {
    if (s.isLiveSyncing) {
      badge.className = 'neo-badge neo-badge--cyan';
      badge.innerHTML = `<span class="anim-spin" style="display:inline-flex">${icons.refreshCw(12)}</span> <span class="hide-mobile">Đang đồng bộ...</span><span class="hide-desktop">Đồng bộ...</span>`;
    } else if (s.isLiveConnected) {
      badge.className = 'neo-badge neo-badge--lime anim-pulse-live';
      badge.innerHTML = `${icons.check(12)} LIVE<span class="hide-mobile"> AMIS</span>`;
    } else {
      badge.className = 'neo-badge neo-badge--ghost';
      badge.innerHTML = `${icons.refreshCw(12)} <span class="hide-mobile">Đồng bộ STU</span><span class="hide-desktop">Đồng bộ</span>`;
    }
  }

  const nameEl = el.querySelector('.user-chip-name');
  if (nameEl) nameEl.textContent = s.profile.fullName || s.profile.id || 'Tài khoản';
}

function toggleTheme(): void {
  triggerThemeTransition();
  const s = stateStore.getState();
  const next = s.theme === ThemeMode.Light ? ThemeMode.Dark : ThemeMode.Light;
  document.documentElement.dataset.theme = next;
  stateStore.setState({ theme: next });
}

function setupResponsiveMenu(btn: HTMLElement): void {
  const mq = window.matchMedia('(max-width: 768px)');
  const handler = (e: MediaQueryList | MediaQueryListEvent) => {
    btn.style.display = ('matches' in e ? e.matches : (e as MediaQueryListEvent).matches) ? 'flex' : 'none';
  };
  handler(mq);
  mq.addEventListener('change', handler);
}

export function renderHeader(menuCallback: () => void): HTMLElement {
  return createHeader(menuCallback);
}

export function destroyHeader(): void {
  unsub?.();
  unsub = null;
  headerEl?.remove();
  headerEl = null;
}
