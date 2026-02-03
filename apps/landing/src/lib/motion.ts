/**
 * Motion System - Tally Design System
 *
 * Centralized animation configurations for consistent, premium micro-interactions.
 * Uses framer-motion spring physics for natural, organic feel.
 */

import { type Transition, type Variants } from 'motion/react';

// ============================================
// SPRING CONFIGURATIONS
// ============================================

/** Snappy, responsive feel - buttons, toggles */
export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

/** Smooth, elegant feel - modals, cards */
export const springSmooth: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
};

/** Gentle, soft feel - page transitions */
export const springGentle: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
};

/** Bouncy, playful feel - success states, celebrations */
export const springBouncy: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 15,
};

// ============================================
// DURATION PRESETS
// ============================================

export const duration = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
} as const;

// ============================================
// EASING PRESETS
// ============================================

export const easing = {
  /** Apple-like smooth easing */
  smooth: [0.25, 0.1, 0.25, 1],
  /** Quick start, smooth end */
  out: [0, 0, 0.2, 1],
  /** Slow start, quick end */
  in: [0.4, 0, 1, 1],
  /** Material Design standard */
  standard: [0.4, 0, 0.2, 1],
  /** Emphasized movement */
  emphasized: [0.2, 0, 0, 1],
  /** Overshoot for playful feel */
  overshoot: [0.34, 1.56, 0.64, 1],
} as const;

// ============================================
// STAGGER UTILITIES
// ============================================

export const stagger = {
  fast: 0.03,
  normal: 0.05,
  slow: 0.08,
  slower: 0.12,
} as const;

/** Create staggered children animation */
export const staggerContainer = (
  staggerChildren = stagger.normal,
  delayChildren = 0
): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

// ============================================
// COMMON ANIMATION VARIANTS
// ============================================

/** Fade in from below - default entry */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springSmooth,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: duration.fast },
  },
};

/** Fade in from above */
export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springSmooth,
  },
};

/** Scale in - for modals, cards */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springSmooth,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: duration.fast },
  },
};

/** Slide in from right */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springSmooth,
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: duration.fast },
  },
};

/** Slide in from left */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springSmooth,
  },
};

/** Pop in - bouncy entry for success states */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springBouncy,
  },
};

/** Blur in - premium reveal effect */
export const blurIn: Variants = {
  hidden: { opacity: 0, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: duration.slow, ease: easing.smooth },
  },
};

// ============================================
// MICRO-INTERACTION VARIANTS
// ============================================

/** Button press effect */
export const buttonPress = {
  tap: { scale: 0.97 },
  hover: { scale: 1.02 },
};

/** Card hover effect */
export const cardHover = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  hover: {
    scale: 1.01,
    y: -2,
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
    transition: springSnappy,
  },
  tap: {
    scale: 0.99,
    y: 0,
  },
};

/** List item hover */
export const listItemHover = {
  rest: { x: 0, backgroundColor: 'transparent' },
  hover: {
    x: 4,
    backgroundColor: 'var(--accent)',
    transition: springSnappy,
  },
};

/** Icon spin on hover */
export const iconSpin = {
  rest: { rotate: 0 },
  hover: { rotate: 180, transition: { duration: duration.slow } },
};

/** Pulse animation for attention */
export const pulse: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/** Shimmer effect for loading states */
export const shimmer: Variants = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ============================================
// NUMBER ANIMATIONS
// ============================================

/** Animated counter configuration */
export const counterSpring: Transition = {
  type: 'spring',
  stiffness: 100,
  damping: 15,
};

// ============================================
// PAGE TRANSITIONS
// ============================================

export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.normal,
      ease: easing.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: duration.fast,
      ease: easing.in,
    },
  },
};

// ============================================
// SUCCESS/CELEBRATION ANIMATIONS
// ============================================

/** Checkmark draw animation */
export const checkmarkDraw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, ease: 'easeOut' },
      opacity: { duration: 0.1 },
    },
  },
};

/** Confetti-like scale burst */
export const celebrationBurst: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      delay: i * 0.05,
      type: 'spring',
      stiffness: 500,
      damping: 10,
    },
  }),
};

// ============================================
// GESTURE CONFIGS
// ============================================

export const dragConstraints = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

export const swipeConfig = {
  power: 0.3,
  timeConstant: 200,
};

// ============================================
// ACCESSIBILITY
// ============================================

/** Returns reduced motion safe variants */
export function getReducedMotionVariants(_variants: Variants): Variants {
  return {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.01 } },
    exit: { opacity: 0, transition: { duration: 0.01 } },
  };
}

/** Hook-friendly motion preferences */
export const motionPreferences = {
  reduced: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.01 },
  },
};
