/**
 * STU AMIS - MOTION & ANIMATION ENGINE
 * Hệ thống điều phối hiệu ứng chuyển động tối ưu GPU
 */

/**
 * Hiệu ứng đếm số tiến (Count-up) mượt mà với hàm Easing chuẩn Exponential Decay
 */
export function animateCountUp(
  targetElement: HTMLElement | null,
  startVal: number,
  endVal: number,
  duration = 600,
  formatter: (val: number) => string = (val) => val.toFixed(2)
): () => void {
  if (!targetElement) return () => {};

  // Nếu người dùng bật cấu hình giảm chuyển động, gán thẳng giá trị đích
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targetElement.textContent = formatter(endVal);
    return () => {};
  }

  let startTime: number | null = null;
  let animFrameId: number;

  const easeOutExpo = (t: number): number => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  const frame = (timestamp: number) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const easedProgress = easeOutExpo(progress);
    const current = startVal + (endVal - startVal) * easedProgress;

    targetElement.textContent = formatter(current);

    if (progress < 1) {
      animFrameId = requestAnimationFrame(frame);
    } else {
      targetElement.textContent = formatter(endVal);
    }
  };

  animFrameId = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(animFrameId);
  };
}

/**
 * Gán hiệu ứng xuất hiện tuần tự (Stagger Entrance) cho danh sách phần tử con
 */
export function staggerEntrance(
  container: HTMLElement | null,
  selector: string,
  baseClass = 'anim-fade-in-up',
  stepMs = 45,
  initialDelayMs = 0
): void {
  if (!container) return;
  const elements = container.querySelectorAll<HTMLElement>(selector);

  elements.forEach((el, index) => {
    el.classList.add(baseClass);
    el.style.animationDelay = `${initialDelayMs + index * stepMs}ms`;
  });
}

/**
 * Tạo hiệu ứng gợn sóng (Ripple Effect) khi tương tác chuột / chạm trên nút bấm
 */
export function attachRipple(element: HTMLElement, event: MouseEvent): void {
  const rect = element.getBoundingClientRect();
  const diameter = Math.max(rect.width, rect.height);
  const radius = diameter / 2;

  const ripple = document.createElement('span');
  ripple.className = 'ripple-effect';
  ripple.style.width = ripple.style.height = `${diameter}px`;
  ripple.style.left = `${event.clientX - rect.left - radius}px`;
  ripple.style.top = `${event.clientY - rect.top - radius}px`;

  // Đảm bảo phần tử cha có position phù hợp
  if (!element.classList.contains('ripple-container')) {
    element.classList.add('ripple-container');
  }

  const existingRipple = element.querySelector('.ripple-effect');
  if (existingRipple) {
    existingRipple.remove();
  }

  element.appendChild(ripple);

  ripple.addEventListener('animationend', () => {
    ripple.remove();
  });
}

/**
 * Kích hoạt hiệu ứng rung lắc (Shake) phản hồi lỗi trực quan
 */
export function shakeElement(element: HTMLElement | null): void {
  if (!element) return;
  element.classList.remove('anim-shake');
  // Trigger reflow to restart CSS animation
  void element.offsetWidth;
  element.classList.add('anim-shake');

  element.addEventListener(
    'animationend',
    () => {
      element.classList.remove('anim-shake');
    },
    { once: true }
  );
}

/**
 * Kích hoạt hiệu ứng chuyển màu giao diện mượt mà (Theme Transition)
 */
export function triggerThemeTransition(): void {
  document.documentElement.classList.add('theme-transitioning');
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transitioning');
  }, 260);
}
