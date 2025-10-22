/**
 * Streak Badge Component
 * Visual indicator for habit streaks with fire animation
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '@theme';

interface StreakBadgeProps {
  streak: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  style?: ViewStyle;
}

export function StreakBadge({
  streak,
  size = 'medium',
  showLabel = true,
  style,
}: StreakBadgeProps) {
  const sizeStyles = getSizeStyles(size);
  const fireEmoji = getFireEmoji(streak);

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.badge, sizeStyles.badge]}>
        <Text style={[styles.fire, sizeStyles.fire]}>{fireEmoji}</Text>
        <Text style={[styles.number, sizeStyles.number]}>{streak}</Text>
      </View>
      {showLabel && (
        <Text style={[styles.label, sizeStyles.label]}>
          {streak === 1 ? 'day' : 'days'}
        </Text>
      )}
    </View>
  );
}

function getFireEmoji(streak: number): string {
  if (streak >= 100) return '🔥🔥🔥'; // Triple fire for 100+
  if (streak >= 30) return '🔥🔥'; // Double fire for 30+
  if (streak >= 7) return '🔥'; // Single fire for 7+
  if (streak >= 3) return '🔥'; // Starting fire for 3+
  return '🌱'; // Seedling for < 3
}

function getSizeStyles(size: 'small' | 'medium' | 'large') {
  switch (size) {
    case 'small':
      return {
        badge: styles.smallBadge,
        fire: styles.smallFire,
        number: styles.smallNumber,
        label: styles.smallLabel,
      };
    case 'large':
      return {
        badge: styles.largeBadge,
        fire: styles.largeFire,
        number: styles.largeNumber,
        label: styles.largeLabel,
      };
    default:
      return {
        badge: styles.mediumBadge,
        fire: styles.mediumFire,
        number: styles.mediumNumber,
        label: styles.mediumLabel,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },

  // Sizes - Badge
  smallBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  mediumBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  largeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  // Fire emoji
  fire: {
    marginRight: 4,
  },
  smallFire: {
    fontSize: 12,
  },
  mediumFire: {
    fontSize: 16,
  },
  largeFire: {
    fontSize: 24,
  },

  // Number
  number: {
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
  },
  smallNumber: {
    fontSize: typography.fontSize.xs,
  },
  mediumNumber: {
    fontSize: typography.fontSize.md,
  },
  largeNumber: {
    fontSize: typography.fontSize.xl,
  },

  // Label
  label: {
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  smallLabel: {
    fontSize: typography.fontSize.xs,
  },
  mediumLabel: {
    fontSize: typography.fontSize.sm,
  },
  largeLabel: {
    fontSize: typography.fontSize.md,
  },
});
