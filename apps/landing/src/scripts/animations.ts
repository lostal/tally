import { initParallax } from './parallax';
import { initScrollTrigger, initHorizontalScroll } from './scroll-trigger';
import { initMagneticButton } from './magnetic-button';

/**
 * Initialize all GSAP animations
 * Called on page load and after View Transitions
 */
export function initAnimations() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

function init() {
  initParallax();
  initScrollTrigger();
  initHorizontalScroll();
  initMagneticButton();
}

// Auto-initialize on script load
initAnimations();

// Re-initialize after Astro View Transitions
document.addEventListener('astro:after-swap', () => {
  initAnimations();
});
