import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize scroll-triggered animations
 */
export function initScrollTrigger() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return; // Respect user preferences
  }

  // Problem Statement - illuminate illustrations on scroll
  const problemCards = document.querySelectorAll('.problem-card');
  if (problemCards.length > 0) {
    problemCards.forEach((card) => {
      gsap.from(card, {
        opacity: 0.3,
        y: 50,
        scrollTrigger: {
          trigger: card,
          start: 'top 80%',
          end: 'top 50%',
          scrub: 1,
        },
      });
    });
  }

  // Solution Bento - stagger animation
  const bentoCards = document.querySelectorAll('.bento-card');
  if (bentoCards.length > 0) {
    gsap.from(bentoCards, {
      opacity: 0,
      y: 60,
      stagger: 0.2,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: bentoCards[0],
        start: 'top 75%',
      },
    });
  }

  // Technical Trust - stagger from center
  const trustCards = document.querySelectorAll('.trust-card');
  if (trustCards.length > 0) {
    gsap.from(trustCards, {
      opacity: 0,
      scale: 0.9,
      rotation: 5,
      stagger: {
        amount: 0.6,
        from: 'center',
      },
      duration: 0.7,
      ease: 'back.out(1.2)',
      scrollTrigger: {
        trigger: trustCards[0],
        start: 'top 75%',
      },
    });
  }

  // Features Accordion - fade in from right when expanded
  const accordionContents = document.querySelectorAll('.accordion-content');
  if (accordionContents.length > 0) {
    accordionContents.forEach((content) => {
      const parentDetails = content.closest('details');
      if (parentDetails) {
        parentDetails.addEventListener('toggle', () => {
          if (parentDetails.open) {
            gsap.from(content, {
              opacity: 0,
              x: 20,
              duration: 0.3,
              ease: 'power2.out',
            });
          }
        });
      }
    });
  }

  // Social Proof - infinite scroll carousel
  const carousel = document.querySelector('.social-proof-carousel');
  if (carousel) {
    // Already handled with CSS animation
    // Pause on hover is in CSS
  }

  // Interactive Demo - progress bar sync
  const demoSection = document.querySelector('.demo-section');
  const progressBar = document.querySelector('.demo-progress-bar');
  if (demoSection && progressBar) {
    ScrollTrigger.create({
      trigger: demoSection,
      start: 'top center',
      end: 'bottom center',
      scrub: 1,
      onUpdate: (self) => {
        // Update progress bar width based on scroll progress
        const progress = self.progress * 100;
        (progressBar as HTMLElement).style.width = `${progress}%`;
      },
    });
  }
}

/**
 * Initialize horizontal scroll for Interactive Demo (desktop only)
 */
export function initHorizontalScroll() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isMobile || prefersReducedMotion) {
    return; // Native horizontal scroll on mobile
  }

  const demoContainer = document.querySelector('.demo-horizontal-container');
  if (!demoContainer) return;

  const cards = demoContainer.querySelectorAll('.demo-card');
  if (cards.length === 0) return;

  const totalWidth = cards.length * (cards[0].clientWidth + 24); // card width + gap

  // Pin section and scroll horizontally
  gsap.to(demoContainer, {
    x: () => -(totalWidth - window.innerWidth),
    ease: 'none',
    scrollTrigger: {
      trigger: demoContainer.parentElement,
      pin: true,
      scrub: 1,
      start: 'top top',
      end: () => `+=${totalWidth}`,
      invalidateOnRefresh: true,
    },
  });
}
