/**
 * XP Progress Bar Component
 * Shows current level, XP progress to next level, and combo multiplier
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@theme';
import { ProgressBar } from './ProgressBar';
import type { LevelInfo } from '@constants/levels';

interface XPProgressBarProps {
  levelInfo: LevelInfo;
  currentLevelXP: number;
  nextLevelXP: number;
  totalXP: number;
  comboMultiplier: number;
  showCombo?: boolean;
}

export function XPProgressBar({
  levelInfo,
  currentLevelXP,
  nextLevelXP,
  totalXP,
  comboMultiplier,
  showCombo = true,
}: XPProgressBarProps) {
  const progress = (currentLevelXP / nextLevelXP) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.levelInfo}>
          <Text style={styles.levelEmoji}>{levelInfo.emoji}</Text>
          <View>
            <Text style={styles.levelNumber}>Level {levelInfo.level}</Text>
            <Text style={styles.levelName}>{levelInfo.name}</Text>
          </View>
        </View>

        {showCombo && comboMultiplier > 1 && (
          <View style={styles.combo}>
            <Text style={styles.comboText}>{comboMultiplier}x</Text>
            <Text style={styles.comboLabel}>COMBO</Text>
          </View>
        )}
      </View>

      <View style={styles.progressContainer}>
        <ProgressBar
          progress={progress}
          height={12}
          color={levelInfo.color}
          animated
        />
        <View style={styles.xpInfo}>
          <Text style={styles.xpText}>
            {currentLevelXP} / {nextLevelXP} XP
          </Text>
          <Text style={styles.totalXP}>Total: {totalXP.toLocaleString()} XP</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  levelEmoji: {
    fontSize: 40,
    marginRight: spacing.sm,
  },

  levelNumber: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },

  levelName: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },

  combo: {
    backgroundColor: colors.accent,
    borderRadius: spacing.borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },

  comboText: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
  },

  comboLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
    letterSpacing: 1,
  },

  progressContainer: {
    width: '100%',
  },

  xpInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },

  xpText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },

  totalXP: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
});
