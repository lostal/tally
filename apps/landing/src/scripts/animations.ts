import Lenis from 'lenis';

/**
 * Initialize animations (Only Lenis Smooth Scroll)
 */
export function initAnimations() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmoothScrolling);
  } else {
    initSmoothScrolling();
  }
}

function initSmoothScrolling() {
  const lenis = new Lenis({
    lerp: 0.1,
    duration: 1.2,
    smoothWheel: true,
  });

  function raf(time: number) {
    lenis.raf(time);
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
