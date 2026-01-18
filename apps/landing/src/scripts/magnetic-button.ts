import { gsap } from 'gsap';

/**
 * Initialize magnetic button effect
 * Button "follows" cursor with elastic easing
 */
export function initMagneticButton() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isMobile || prefersReducedMotion) {
    return; // Skip on mobile and for reduced motion preference
  }

  const button = document.getElementById('magnetic-cta');
  if (!button) return;

  let isHovering = false;

  button.addEventListener('mouseenter', () => {
    isHovering = true;
  });

  button.addEventListener('mouseleave', () => {
    isHovering = false;
    // Return to original position with elastic ease
    gsap.to(button, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)',
    });
  });

  button.addEventListener('mousemove', (e: MouseEvent) => {
    if (!isHovering) return;

    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    // Max 30% movement (as per plan)
    const maxMove = 0.3;
    const moveX = deltaX * maxMove;
    const moveY = deltaY * maxMove;

    gsap.to(button, {
      x: moveX,
      y: moveY,
      duration: 0.3,
      ease: 'power2.out',
    });
  });
}
