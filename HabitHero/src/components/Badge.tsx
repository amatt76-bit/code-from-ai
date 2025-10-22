/**
 * Badge Component
 * Small label for counts, statuses, and highlights
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, spacing } from '@theme';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  label: string | number;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({
  label,
  variant = 'primary',
  size = 'medium',
  icon,
  style,
  textStyle,
}: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant], styles[`${size}Size`], style]}>
      {icon}
      <Text style={[styles.text, styles[`${size}Text`], textStyle]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },

  // Variants
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  success: {
    backgroundColor: colors.success,
  },
  warning: {
    backgroundColor: colors.warning,
  },
  error: {
    backgroundColor: colors.error,
  },
  info: {
    backgroundColor: colors.info,
  },

  // Sizes
  smallSize: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  mediumSize: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  largeSize: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  // Text styles
  text: {
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
  },
  smallText: {
    fontSize: typography.fontSize.xs,
  },
  mediumText: {
    fontSize: typography.fontSize.sm,
  },
  largeText: {
    fontSize: typography.fontSize.md,
  },
});
