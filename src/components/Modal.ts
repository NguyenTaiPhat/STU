import { icons } from '../utils/svgIcons';

let overlayEl: HTMLElement | null = null;
let onCloseCallback: (() => void) | null = null;

function handleKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Escape') closeModal();
}

function handleBackdropClick(e: MouseEvent): void {
  if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
    closeModal();
  }
}

export function openModal(
  title: string,
  content: HTMLElement,
  options?: { wide?: boolean; onClose?: () => void }
): void {
  closeModal();
  onCloseCallback = options?.onClose ?? null;

  overlayEl = document.createElement('div');
  overlayEl.className = 'modal-overlay';
  overlayEl.addEventListener('click', handleBackdropClick);

  const card = document.createElement('div');
  card.className = 'modal-card';
  if (options?.wide) card.style.maxWidth = '720px';

  const header = document.createElement('div');
  header.className = 'modal-card__header';

  const titleEl = document.createElement('h2');
  titleEl.className = 'modal-card__title';
  titleEl.textContent = title;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'neo-btn neo-btn--ghost neo-btn--sm';
  closeBtn.innerHTML = icons.x(20);
  closeBtn.addEventListener('click', closeModal);

  header.append(titleEl, closeBtn);

  const body = document.createElement('div');
  body.className = 'modal-card__body';
  body.appendChild(content);

  card.append(header, body);
  overlayEl.appendChild(card);
  document.body.appendChild(overlayEl);
  document.addEventListener('keydown', handleKeyDown);

  const focusable = card.querySelector<HTMLElement>('button, input, select, [tabindex]');
  focusable?.focus();
}

export function closeModal(): void {
  if (!overlayEl) return;
  const currentOverlay = overlayEl;
  overlayEl = null;

  document.removeEventListener('keydown', handleKeyDown);

  const card = currentOverlay.querySelector('.modal-card');
  if (card) {
    card.classList.add('anim-fade-out');
  }
  currentOverlay.classList.add('anim-fade-out');

  setTimeout(() => {
    currentOverlay.remove();
    if (onCloseCallback) {
      onCloseCallback();
      onCloseCallback = null;
    }
  }, 160);
}
