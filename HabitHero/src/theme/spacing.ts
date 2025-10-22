/**
 * Spacing Theme
 * Consistent spacing values throughout the app
 */

export const spacing = {
  // Base spacing units (in pixels)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,

  // Specific use cases
  tight: 4,
  normal: 16,
  loose: 24,

  // Card and Container Padding
  cardPadding: 16,
  screenMargin: 16,
  screenPadding: 16,

  // Component-specific spacing
  buttonPadding: {
    horizontal: 24,
    vertical: 12,
  },

  buttonPaddingSmall: {
    horizontal: 16,
    vertical: 8,
  },

  inputPadding: {
    horizontal: 16,
    vertical: 12,
  },

  // List and Grid spacing
  listItemGap: 12,
  gridGap: 16,

  // Border Radius
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },

  // Icon Sizes
  iconSize: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
    '2xl': 64,
  },

  // Touch Target (minimum 44x44 for accessibility)
  touchTarget: 44,
};

export type Spacing = typeof spacing;
