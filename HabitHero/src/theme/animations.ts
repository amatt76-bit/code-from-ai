/**
 * Animation Theme
 * Consistent animation timings and configurations
 */

export const animations = {
  // Duration (in milliseconds)
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    verySlow: 800,
    confetti: 2000,
    levelUp: 1000,
  },

  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'spring',
  },

  // Animation configurations for specific use cases
  buttonPress: {
    duration: 150,
    scale: 0.95,
  },

  cardEnter: {
    duration: 300,
    translateY: 20,
  },

  confetti: {
    duration: 2000,
    count: 50,
  },

  levelUp: {
    duration: 1000,
    scale: 1.5,
  },

  streakMilestone: {
    duration: 500,
    scale: 1.2,
    shake: true,
  },

  xpCounter: {
    duration: 800,
  },

  checkmark: {
    duration: 400,
  },

  fadeIn: {
    duration: 300,
    opacity: { from: 0, to: 1 },
  },

  fadeOut: {
    duration: 300,
    opacity: { from: 1, to: 0 },
  },

  slideUp: {
    duration: 300,
    translateY: { from: 50, to: 0 },
  },

  slideDown: {
    duration: 300,
    translateY: { from: -50, to: 0 },
  },

  scaleIn: {
    duration: 300,
    scale: { from: 0.8, to: 1 },
  },

  scaleOut: {
    duration: 300,
    scale: { from: 1, to: 0.8 },
  },
};

export type Animations = typeof animations;
