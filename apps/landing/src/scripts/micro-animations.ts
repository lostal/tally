/**
 * Premium micro-interactions and animations
 * - Magnetic buttons
 * - Smooth hover effects
 * - Interactive elements
 */

/**
 * Magnetic button effect
 * Buttons follow cursor with smooth magnetic pull
 */
export function initMagneticButtons() {
  // Only enable on non-touch devices
  if ('ontouchstart' in window) return;

  const magneticElements = document.querySelectorAll('[data-magnetic]');

  magneticElements.forEach((element) => {
    const el = element as HTMLElement;
    let boundingRect = el.getBoundingClientRect();
    let rafId: number;

    // Update bounding rect on resize
    const updateBounds = () => {
      boundingRect = el.getBoundingClientRect();
    };
    window.addEventListener('resize', updateBounds, { passive: true });

    el.addEventListener('mouseenter', () => {
      boundingRect = el.getBoundingClientRect();
    });

    el.addEventListener('mousemove', (e) => {
      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        const strength = parseFloat(el.getAttribute('data-magnetic') || '0.15');
        const centerX = boundingRect.left + boundingRect.width / 2;
        const centerY = boundingRect.top + boundingRect.height / 2;

        const deltaX = (e.clientX - centerX) * strength;
        const deltaY = (e.clientY - centerY) * strength;

        el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      });
    });

    el.addEventListener('mouseleave', () => {
      if (rafId) cancelAnimationFrame(rafId);
      el.style.transform = 'translate(0px, 0px)';
    });
  });
}

/**
 * Smooth cursor follower
 * Creates a custom cursor that follows mouse with lag
 */
export function initCursorFollower() {
  const cursor = document.querySelector('[data-cursor]') as HTMLElement;
  if (!cursor) return;

  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    const speed = 0.15;
    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;

    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
    requestAnimationFrame(animateCursor);
  }

  animateCursor();
}

/**
 * Tilt effect on cards
 * Cards tilt slightly based on mouse position
 */
export function initTiltEffect() {
  // Only enable on non-touch devices
  if ('ontouchstart' in window) return;

  const tiltElements = document.querySelectorAll('[data-tilt]');

  tiltElements.forEach((element) => {
    const el = element as HTMLElement;
    let boundingRect = el.getBoundingClientRect();
    let rafId: number;

    const updateBounds = () => {
      boundingRect = el.getBoundingClientRect();
    };
    window.addEventListener('resize', updateBounds, { passive: true });

    el.addEventListener('mouseenter', () => {
      boundingRect = el.getBoundingClientRect();
    });

    el.addEventListener('mousemove', (e) => {
      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        const strength = parseFloat(el.getAttribute('data-tilt') || '5');
        const xPos = (e.clientX - boundingRect.left) / boundingRect.width;
        const yPos = (e.clientY - boundingRect.top) / boundingRect.height;

        const tiltX = (yPos - 0.5) * strength;
        const tiltY = -(xPos - 0.5) * strength;

        el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      });
    });

    el.addEventListener('mouseleave', () => {
      if (rafId) cancelAnimationFrame(rafId);
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  });
}

/**
 * Ripple effect on click
 * Creates material design-style ripple on buttons
 */
export function initRippleEffect() {
  const rippleElements = document.querySelectorAll('[data-ripple]');

  rippleElements.forEach((element) => {
    element.addEventListener('click', function (e) {
      const el = this as HTMLElement;
      const rect = el.getBoundingClientRect();
      const ripple = document.createElement('span');

      const size = Math.max(rect.width, rect.height);
      const x = (e as MouseEvent).clientX - rect.left - size / 2;
      const y = (e as MouseEvent).clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.classList.add('ripple-effect');

      el.style.position = 'relative';
      el.style.overflow = 'hidden';
      el.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
}

/**
 * Text reveal animation
 * Reveals text character by character or word by word
 */
export function initTextReveal() {
  const textElements = document.querySelectorAll('[data-text-reveal]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.classList.contains('revealed')) {
          const el = entry.target as HTMLElement;
          const mode = el.getAttribute('data-text-reveal') || 'word'; // 'word' or 'char'
          const text = el.textContent || '';

          if (mode === 'word') {
            const words = text.split(' ');
            el.innerHTML = words
              .map(
                (word, i) =>
                  `<span class="inline-block opacity-0 animate-fade-in-up" style="animation-delay: ${i * 50}ms">${word}</span>`
              )
              .join(' ');
          } else {
            const chars = text.split('');
            el.innerHTML = chars
              .map(
                (char, i) =>
                  `<span class="inline-block opacity-0 animate-fade-in-up" style="animation-delay: ${i * 20}ms">${char === ' ' ? '&nbsp;' : char}</span>`
              )
              .join('');
          }

          el.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  textElements.forEach((el) => observer.observe(el));
}

/**
 * Smooth scale on scroll
 * Elements scale up/down based on scroll position
 */
export function initScrollScale() {
  const scaleElements = document.querySelectorAll('[data-scroll-scale]');
  if (scaleElements.length === 0) return;

  const handleScroll = () => {
    scaleElements.forEach((el) => {
      const element = el as HTMLElement;
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate how much of the element is visible
      const visibleRatio = Math.max(
        0,
        Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height))
      );

      const minScale = parseFloat(element.getAttribute('data-scroll-scale') || '0.95');
      const scale = minScale + (1 - minScale) * visibleRatio;

      element.style.transform = `scale(${scale})`;
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial call
}

// Auto-initialize all micro-animations
export function initAllMicroAnimations() {
  initMagneticButtons();
  initTiltEffect();
  initRippleEffect();
  initTextReveal();
  initScrollScale();
  // initCursorFollower(); // Optional, uncomment if you add a cursor element
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllMicroAnimations);
} else {
  initAllMicroAnimations();
}

// Re-initialize after Astro View Transitions
document.addEventListener('astro:after-swap', () => {
  initAllMicroAnimations();
});
