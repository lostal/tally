/**
 * Scroll-triggered animations using Intersection Observer
 * Adds 'in-view' class to elements with [data-animate] when they enter viewport
 */

export function initScrollAnimations() {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          // Optional: unobserve after first trigger for performance
          // observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1, // Trigger when 10% of element is visible
      rootMargin: '0px 0px -50px 0px', // Trigger slightly before element enters viewport
    }
  );

  // Observe all elements with data-animate attribute
  const animatedElements = document.querySelectorAll('[data-animate]');
  animatedElements.forEach((el) => observer.observe(el));

  return observer;
}

/**
 * Number count-up animation
 * Animates numbers from 0 to target value
 */
export function initCountUpAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          const target = entry.target as HTMLElement;
          const targetValue = parseFloat(target.getAttribute('data-count') || '0');
          const duration = parseInt(target.getAttribute('data-duration') || '2000');
          const suffix = target.getAttribute('data-suffix') || '';

          animateCountUp(target, targetValue, duration, suffix);
          target.classList.add('counted');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('[data-count]').forEach((el) => observer.observe(el));

  return observer;
}

function animateCountUp(element: HTMLElement, target: number, duration: number, suffix: string) {
  const start = 0;
  const increment = target / (duration / 16); // 60fps
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = `${Math.round(target)}${suffix}`;
      clearInterval(timer);
    } else {
      element.textContent = `${Math.round(current)}${suffix}`;
    }
  }, 16);
}

/**
 * Parallax scroll effect
 * Moves elements at different speeds based on scroll position
 */
export function initParallaxEffects() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  if (parallaxElements.length === 0) return;

  let rafId: number;
  let ticking = false;

  const handleScroll = () => {
    if (!ticking) {
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;

        parallaxElements.forEach((el) => {
          const speed = parseFloat((el as HTMLElement).getAttribute('data-parallax') || '0.5');
          const yPos = -(scrollY * speed);
          (el as HTMLElement).style.transform = `translateY(${yPos}px)`;
        });

        ticking = false;
      });

      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => {
    if (rafId) cancelAnimationFrame(rafId);
  };
}

/**
 * Stagger animation delays
 * Automatically adds staggered delays to child elements
 */
export function initStaggerAnimations() {
  const staggerContainers = document.querySelectorAll('[data-stagger]');

  staggerContainers.forEach((container) => {
    const delay = parseInt((container as HTMLElement).getAttribute('data-stagger') || '100');
    const children = container.querySelectorAll('[data-stagger-item]');

    children.forEach((child, index) => {
      (child as HTMLElement).style.animationDelay = `${index * delay}ms`;
    });
  });
}

// Auto-initialize
export function initAllScrollAnimations() {
  initScrollAnimations();
  initCountUpAnimations();
  initParallaxEffects();
  initStaggerAnimations();
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllScrollAnimations);
} else {
  initAllScrollAnimations();
}

// Re-initialize after Astro View Transitions
document.addEventListener('astro:after-swap', () => {
  initAllScrollAnimations();
});
