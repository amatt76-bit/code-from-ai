/**
 * Theme Index
 * Central export for all theme values
 */

export { colors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { animations } from './animations';

export type { ColorTheme } from './colors';
export type { Typography } from './typography';
export type { Spacing } from './spacing';
export type { Animations } from './animations';

// Combined theme object
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { animations } from './animations';

export const theme = {
  colors,
  typography,
  spacing,
  animations,
};

export type Theme = typeof theme;
