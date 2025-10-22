/**
 * Progress Bar Component
 * Animated progress indicator
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, typography } from '@theme';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  animated?: boolean;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  height = 8,
  color = colors.primary,
  backgroundColor = colors.backgroundSecondary,
  showPercentage = false,
  animated = true,
  style,
}: ProgressBarProps) {
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      animatedWidth.value = withTiming(progress, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      animatedWidth.value = progress;
    }
  }, [progress, animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              height,
              backgroundColor: color,
            },
            animatedStyle,
          ]}
        />
      </View>

      {showPercentage && (
        <Text style={styles.percentage}>{Math.round(clampedProgress)}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  track: {
    flex: 1,
    borderRadius: spacing.borderRadius.full,
    overflow: 'hidden',
  },

  fill: {
    borderRadius: spacing.borderRadius.full,
  },

  percentage: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    minWidth: 40,
    textAlign: 'right',
  },
});
