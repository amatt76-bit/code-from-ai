/**
 * Color Theme
 * Based on the app specification color scheme
 */

export const colors = {
  // Primary Colors
  primary: '#FF6B35', // Orange - Energy/Fire
  primaryDark: '#E55A2B',
  primaryLight: '#FF8A5C',

  // Secondary Colors
  secondary: '#4ECDC4', // Teal - Success
  secondaryDark: '#3DB8AF',
  secondaryLight: '#71D7CF',

  // Accent Colors
  accent: '#FFD23F', // Yellow - Rewards
  accentDark: '#E5BC2B',
  accentLight: '#FFE06B',

  // Status Colors
  success: '#06D6A0', // Green
  warning: '#FFA07A', // Light Orange
  danger: '#E63946', // Red
  info: '#4ECDC4',

  // Neutral Colors
  neutral: '#2C3E50', // Dark Gray
  neutralLight: '#7F8C8D',
  neutralDark: '#1A252F',

  // Background Colors
  background: {
    light: '#F8F9FA',
    dark: '#1A1A2E',
    card: '#FFFFFF',
    cardDark: '#2C2C3E',
  },

  // Text Colors
  text: {
    primary: '#2C3E50',
    secondary: '#7F8C8D',
    disabled: '#BDC3C7',
    inverse: '#FFFFFF',
    light: '#FFFFFF',
    dark: '#2C3E50',
  },

  // Streak Fire Colors (progressive)
  streak: {
    base: '#FF6B35',
    medium: '#FF8A00',
    high: '#FF5500',
    legendary: '#FF0000',
  },

  // XP and Gamification
  xp: {
    bar: '#FFD23F',
    barBackground: '#E5E5E5',
    glow: '#FFE06B',
  },

  // Level Badge Colors
  level: {
    beginner: '#95A5A6', // Gray
    starter: '#95A5A6',
    novice: '#3498DB', // Blue
    committed: '#9B59B6', // Purple
    dedicated: '#E67E22', // Orange
    unstoppable: '#E74C3C', // Red
    master: '#F39C12', // Gold
    legend: '#FFD700', // Bright Gold
  },

  // Border Colors
  border: {
    light: '#E5E5E5',
    medium: '#D1D1D1',
    dark: '#7F8C8D',
  },

  // Shadow
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.2)',
    dark: 'rgba(0, 0, 0, 0.3)',
  },

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Achievement Categories
  achievement: {
    starter: '#3498DB',
    consistency: '#2ECC71',
    speed: '#F39C12',
    comeback: '#9B59B6',
    shame: '#95A5A6',
    special: '#FFD700',
  },

  // Calendar Day Status
  calendar: {
    completed: '#06D6A0',
    missed: '#E63946',
    snoozed: '#FFA07A',
    mercy: '#FFD23F',
    perfect: '#FFD700',
    future: '#E5E5E5',
    today: '#4ECDC4',
  },

  // Personality Mode Colors
  personality: {
    supportive: '#4ECDC4',
    sarcastic: '#FF6B35',
    drill: '#E63946',
    zen: '#9B59B6',
  },

  // Transparent
  transparent: 'transparent',
};

export type ColorTheme = typeof colors;
