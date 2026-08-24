import { icons } from '../utils/svgIcons';
import { stateStore } from '../store/stateStore';
import { TabId } from '../types/portal.types';

type NavItem = { id: TabId; label: string; icon: (sz?: number, c?: string) => string };

const NAV_ITEMS: NavItem[] = [
  { id: TabId.Dashboard, label: 'Tổng quan & Bảng tin', icon: icons.dashboard },
  { id: TabId.Notifications, label: 'Thông báo ban quản trị', icon: icons.bell },
  { id: TabId.Registration, label: 'Chương trình & ĐK Môn', icon: icons.bookOpen },
  { id: TabId.Finance, label: 'Học phí & Hóa đơn', icon: icons.creditCard },
  { id: TabId.Schedule, label: 'Thời khóa biểu', icon: icons.calendar },
  { id: TabId.Grades, label: 'Kết quả học tập', icon: icons.graduationCap },
  { id: TabId.Profile, label: 'Hồ sơ sinh viên', icon: icons.user },
];

let sidebarEl: HTMLElement | null = null;
let unsub: (() => void) | null = null;
let overlayEl: HTMLElement | null = null;

function createNavItem(item: NavItem): HTMLElement {
  const btn = document.createElement('a');
  btn.className = 'sidebar__item';
  btn.href = `#${item.id}`;
  btn.dataset.tab = item.id;
  btn.title = item.label;
  btn.innerHTML = `
    <span class="sidebar__icon">${item.icon(18)}</span>
    <span class="sidebar__label">${item.label}</span>
  `;
  btn.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
  });
  return btn;
}

function updateActive(el: HTMLElement): void {
  const current = stateStore.getState().currentTab;
  el.querySelectorAll('.sidebar__item').forEach(item => {
    const isActive = (item as HTMLElement).dataset.tab === current;
    item.classList.toggle('sidebar__item--active', isActive);
  });
}

function updateToggleIcon(el: HTMLElement): void {
  const isCollapsed = document.body.classList.contains('sidebar--collapsed');
  const btn = el.querySelector('#sidebar-toggle-btn');
  if (btn) {
    btn.innerHTML = isCollapsed ? icons.chevronRight(14) : icons.chevronLeft(14);
    btn.setAttribute('title', isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu');
  }
}

export function renderSidebar(): HTMLElement {
  const el = document.createElement('aside');
  el.className = 'app__sidebar';
  sidebarEl = el;

  const logoWrap = document.createElement('div');
  logoWrap.className = 'sidebar__logo';
  logoWrap.innerHTML = `
    <div class="sidebar__logo-brand">
      <div class="sidebar__logo-icon">
        <img src="/Logo_STU.png" alt="STU Logo" class="sidebar__logo-img">
      </div>
      <div class="sidebar__logo-info">
        <span class="sidebar__logo-text text-heading text-bold" style="display:block;line-height:1.2;font-size:15px;color:var(--neo-text)">STU AMIS</span>
        <span class="sidebar__logo-sub text-xs text-secondary" style="font-size:11px">Cổng Thông tin Sinh viên</span>
      </div>
    </div>
  `;
  el.appendChild(logoWrap);

  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'sidebar-toggle-btn';
  toggleBtn.className = 'sidebar__edge-toggle';
  toggleBtn.title = 'Thu gọn menu';
  toggleBtn.innerHTML = icons.chevronLeft(14);
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSidebarCollapse();
  });
  el.appendChild(toggleBtn);

  const nav = document.createElement('nav');
  nav.className = 'sidebar__nav';
  nav.style.flex = '1';
  nav.style.overflowY = 'auto';
  NAV_ITEMS.forEach(item => nav.appendChild(createNavItem(item)));
  el.appendChild(nav);

  const footer = document.createElement('div');
  footer.className = 'sidebar__footer';
  footer.style.cssText = 'padding:var(--space-md) var(--space-md);border-top:1px solid var(--neo-border-color);font-size:11.5px;color:var(--neo-text-secondary);background:var(--neo-card-bg);';
  footer.innerHTML = `
    <div class="text-semibold" style="color:var(--neo-text);font-size:10px;line-height:1.3;white-space:nowrap;letter-spacing:-0.2px">STU - TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN</div>
    <div style="font-size:11px;margin-top:2px">180 Cao Lỗ, P. Chánh Hưng, TP.HCM</div>
    <div style="font-size:10.5px;opacity:0.75;margin-top:2px">CNSG-V 2026.08G.07</div>
  `;
  el.appendChild(footer);

  updateActive(el);
  updateToggleIcon(el);
  unsub = stateStore.subscribe(() => {
    updateActive(el);
    updateToggleIcon(el);
  });

  injectSidebarStyles();
  return el;
}

export function toggleSidebarCollapse(): void {
  document.body.classList.toggle('sidebar--collapsed');
  const isCollapsed = document.body.classList.contains('sidebar--collapsed');
  stateStore.setState({ isSidebarCollapsed: isCollapsed });
  if (sidebarEl) {
    updateToggleIcon(sidebarEl);
  }
}

export function toggleSidebar(): void {
  if (!sidebarEl) return;
  const isOpen = sidebarEl.classList.toggle('app__sidebar--open');

  if (isOpen) {
    if (!overlayEl) {
      overlayEl = document.createElement('div');
      overlayEl.className = 'app__overlay app__overlay--visible';
      overlayEl.addEventListener('click', () => closeSidebar());
      document.body.appendChild(overlayEl);
    }
  } else {
    closeSidebar();
  }
}

function closeSidebar(): void {
  sidebarEl?.classList.remove('app__sidebar--open');
  overlayEl?.remove();
  overlayEl = null;
}

export function destroySidebar(): void {
  unsub?.();
  unsub = null;
  sidebarEl?.remove();
  sidebarEl = null;
  overlayEl?.remove();
  overlayEl = null;
}

function injectSidebarStyles(): void {
  if (document.getElementById('sidebar-styles')) return;
  const style = document.createElement('style');
  style.id = 'sidebar-styles';
  style.textContent = `
    .sidebar__logo {
      display: flex; align-items: center;
      padding: 0 var(--space-lg); border-bottom: 1px solid var(--neo-border-color);
      height: var(--header-height); overflow: hidden;
    }
    .sidebar__logo-brand {
      display: flex; align-items: center; gap: var(--space-md);
      overflow: hidden; flex: 1;
    }
    .sidebar__logo-icon {
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; background: transparent; border: none; box-shadow: none;
    }
    .sidebar__logo-img {
      max-width: 100%; max-height: 100%; object-fit: contain; display: block;
    }
    .sidebar__logo-info {
      display: flex; flex-direction: column; overflow: hidden; white-space: nowrap;
    }
    .sidebar__edge-toggle {
      position: absolute;
      top: 22px;
      right: -11px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--neo-card-bg);
      border: 1px solid var(--neo-border-color);
      color: var(--neo-text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      z-index: 110;
      transition: all var(--transition-fast);
      padding: 0;
    }
    .sidebar__edge-toggle:hover {
      background: var(--neo-primary);
      color: #FFFFFF;
      border-color: var(--neo-primary);
      transform: scale(1.15);
      box-shadow: 0 4px 10px rgba(2, 132, 199, 0.3);
    }
    @media (max-width: 768px) {
      .sidebar__edge-toggle {
        display: none !important;
      }
    }
    .sidebar__nav {
      display: flex; flex-direction: column; gap: 4px;
      padding: var(--space-md) var(--space-md);
    }
    .sidebar__item {
      display: flex; align-items: center; gap: var(--space-md);
      padding: 10px 14px; border-radius: 10px; text-decoration: none;
      color: var(--neo-text-secondary); font-family: var(--font-heading);
      font-weight: 500; font-size: 13.5px;
      transition: all var(--transition-fast);
    }
    .sidebar__item:hover {
      background: var(--neo-bg-secondary);
      color: var(--neo-text);
    }
    .sidebar__item--active {
      background: var(--neo-primary-light);
      color: var(--neo-primary-text);
      font-weight: 600;
    }
    .sidebar__item--active .sidebar__icon {
      color: var(--neo-primary);
    }
    .sidebar__icon { display: flex; align-items: center; flex-shrink: 0; color: var(--neo-text-secondary); }
    .sidebar__label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* Collapsed Sidebar */
    body.sidebar--collapsed .sidebar__logo {
      padding: 0;
      justify-content: center;
      height: var(--header-height);
    }
    body.sidebar--collapsed .sidebar__logo-brand {
      justify-content: center;
      flex: none;
    }
    body.sidebar--collapsed .sidebar__logo-info {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}
