/**
 * Level Badge Component
 * Compact display of user's level
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '@theme';
import type { LevelInfo } from '@constants/levels';

interface LevelBadgeProps {
  levelInfo: LevelInfo;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  style?: ViewStyle;
}

export function LevelBadge({
  levelInfo,
  size = 'medium',
  showName = false,
  style,
}: LevelBadgeProps) {
  const sizeStyles = getSizeStyles(size);

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.badge,
          sizeStyles.badge,
          { backgroundColor: levelInfo.color },
        ]}
      >
        <Text style={[styles.emoji, sizeStyles.emoji]}>{levelInfo.emoji}</Text>
        <Text style={[styles.level, sizeStyles.level]}>{levelInfo.level}</Text>
      </View>
      {showName && (
        <Text style={[styles.name, sizeStyles.name]}>{levelInfo.name}</Text>
      )}
    </View>
  );
}

function getSizeStyles(size: 'small' | 'medium' | 'large') {
  switch (size) {
    case 'small':
      return {
        badge: styles.smallBadge,
        emoji: styles.smallEmoji,
        level: styles.smallLevel,
        name: styles.smallName,
      };
    case 'large':
      return {
        badge: styles.largeBadge,
        emoji: styles.largeEmoji,
        level: styles.largeLevel,
        name: styles.largeName,
      };
    default:
      return {
        badge: styles.mediumBadge,
        emoji: styles.mediumEmoji,
        level: styles.mediumLevel,
        name: styles.mediumName,
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
    borderRadius: spacing.borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 60,
  },

  // Sizes - Badge
  smallBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    minWidth: 40,
  },
  mediumBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 60,
  },
  largeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 80,
  },

  // Emoji
  emoji: {
    marginRight: 4,
  },
  smallEmoji: {
    fontSize: 12,
  },
  mediumEmoji: {
    fontSize: 18,
  },
  largeEmoji: {
    fontSize: 28,
  },

  // Level number
  level: {
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
  },
  smallLevel: {
    fontSize: typography.fontSize.xs,
  },
  mediumLevel: {
    fontSize: typography.fontSize.md,
  },
  largeLevel: {
    fontSize: typography.fontSize.xl,
  },

  // Name
  name: {
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  smallName: {
    fontSize: typography.fontSize.xs,
  },
  mediumName: {
    fontSize: typography.fontSize.sm,
  },
  largeName: {
    fontSize: typography.fontSize.md,
  },
});
