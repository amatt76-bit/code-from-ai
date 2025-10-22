/**
 * Achievement Card Component
 * Displays achievement with progress and unlock status
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Achievement } from '@models/Achievement';
import { colors, typography, spacing } from '@theme';
import { Card } from './Card';
import { ProgressBar } from './ProgressBar';

interface AchievementCardProps {
  achievement: Achievement;
  progress?: number; // 0-100
  onPress?: () => void;
}

export function AchievementCard({
  achievement,
  progress = 0,
  onPress,
}: AchievementCardProps) {
  const isUnlocked = achievement.unlockedDate !== undefined;

  return (
    <Card
      onPress={onPress}
      style={[styles.card, !isUnlocked && styles.lockedCard]}
      elevation="low"
    >
      <View style={styles.header}>
        <Text style={[styles.emoji, !isUnlocked && styles.lockedEmoji]}>
          {achievement.emoji}
        </Text>

        {isUnlocked && (
          <View style={styles.unlockedBadge}>
            <Text style={styles.unlockedText}>✓</Text>
          </View>
        )}
      </View>

      <Text style={[styles.name, !isUnlocked && styles.lockedText]}>
        {achievement.name}
      </Text>

      <Text style={[styles.description, !isUnlocked && styles.lockedText]}>
        {achievement.description}
      </Text>

      {!isUnlocked && progress > 0 && (
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={progress}
            height={6}
            color={colors.primary}
            showPercentage
          />
        </View>
      )}

      {isUnlocked && achievement.unlockedDate && (
        <Text style={styles.unlockedDate}>
          Unlocked {new Date(achievement.unlockedDate).toLocaleDateString()}
        </Text>
      )}

      <View style={styles.footer}>
        <Text style={styles.category}>{getCategoryLabel(achievement.category)}</Text>
      </View>
    </Card>
  );
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    starter: '🎯 Starter',
    consistency: '💪 Consistency',
    speed: '⚡ Speed',
    comeback: '🦸 Comeback',
    shame: '😅 Shame',
    special: '🌟 Special',
  };
  return labels[category] || category;
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
  },

  lockedCard: {
    opacity: 0.7,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },

  emoji: {
    fontSize: 48,
  },

  lockedEmoji: {
    opacity: 0.3,
  },

  unlockedBadge: {
    backgroundColor: colors.success,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  unlockedText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
  },

  name: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  description: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },

  lockedText: {
    color: colors.textSecondary,
  },

  progressContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },

  unlockedDate: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.success,
    marginTop: spacing.xs,
  },

  footer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  category: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
});
