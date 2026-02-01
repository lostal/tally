import Lenis from 'lenis';

/**
 * Initialize Lenis Smooth Scroll (Desktop only)
 * Disabled on touch devices to prevent conflicts with native scrolling
 */

let lenis: Lenis | null = null;

export function initAnimations() {
  // Skip on touch devices
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmoothScrolling);
  } else {
    initSmoothScrolling();
  }
}

function initSmoothScrolling() {
  // Destroy previous instance if exists
  if (lenis) {
    lenis.destroy();
  }

  lenis = new Lenis({
    lerp: 0.1,
    duration: 1.2,
    smoothWheel: true,
  });

  function raf(time: number) {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
}

// Auto-initialize on script load
initAnimations();

// Re-initialize after Astro View Transitions
document.addEventListener('astro:after-swap', () => {
  initAnimations();
});
