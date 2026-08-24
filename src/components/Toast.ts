import { type ToastType } from '../types/portal.types';
import { icons } from '../utils/svgIcons';

const MAX_TOASTS = 3;
const AUTO_DISMISS_MS = 4000;
let container: HTMLElement | null = null;

function ensureContainer(): HTMLElement {
  if (container && document.body.contains(container)) return container;
  container = document.createElement('div');
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

function getIcon(type: ToastType): string {
  const map: Record<ToastType, string> = {
    success: icons.check(18),
    error: icons.alertTriangle(18),
    warning: icons.alertTriangle(18),
    info: icons.info(18),
  };
  return map[type];
}

export function showToast(message: string, type: ToastType = 'info'): void {
  const wrap = ensureContainer();

  while (wrap.children.length >= MAX_TOASTS) {
    wrap.removeChild(wrap.firstChild!);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast--${type} anim-fade-in-up`;
  toast.style.cursor = 'pointer';
  toast.title = 'Nhấn để đóng';
  toast.innerHTML = `
    <div class="toast__bar"></div>
    <span>${getIcon(type)}</span>
    <span style="flex:1">${message}</span>
  `;

  const dismiss = () => {
    toast.classList.remove('anim-fade-in-up');
    toast.classList.add('toast--exit');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };

  toast.addEventListener('click', dismiss);

  wrap.appendChild(toast);

  setTimeout(dismiss, AUTO_DISMISS_MS);
}
