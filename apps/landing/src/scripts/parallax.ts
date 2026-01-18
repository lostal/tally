import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize parallax animations
 * Only runs on desktop and if user hasn't enabled reduced motion
 */
export function initParallax() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isMobile || prefersReducedMotion) {
    return; // Skip parallax on mobile and for users who prefer reduced motion
  }

  // Hero parallax (3 layers)
  const heroBackgroundLayers = document.querySelectorAll('.hero-parallax-layer');
  if (heroBackgroundLayers.length > 0) {
    heroBackgroundLayers.forEach((layer, index) => {
      const speed = (index + 1) * 0.3; // Different speed per layer

      gsap.to(layer, {
        y: () => window.innerHeight * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: layer,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    });
  }

  // Philosophy section - horizontal parallax (inverse)
  const philosophyVisual = document.querySelector('.philosophy-visual');
  if (philosophyVisual) {
    gsap.to(philosophyVisual, {
      x: -100,
      ease: 'none',
      scrollTrigger: {
        trigger: philosophyVisual,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });
  }

  // Final CTA - background parallax
  const ctaBackground = document.querySelector('.cta-background-parallax');
  if (ctaBackground) {
    gsap.to(ctaBackground, {
      y: () => window.innerHeight * 0.2,
      ease: 'none',
      scrollTrigger: {
        trigger: ctaBackground,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });
  }
}
