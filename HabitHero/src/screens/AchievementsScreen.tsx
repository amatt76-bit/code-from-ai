/**
 * Achievements Screen
 * Display all achievements with progress
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAchievementStore } from '@store/achievementStore';
import { useHabitStore } from '@store/habitStore';
import { useUserStore } from '@store/userStore';
import { useStatsStore } from '@store/statsStore';
import {
  getAchievementProgress,
  getAchievementsByCategory,
  getAchievementCompletionPercentage,
} from '@services/AchievementService';
import { AchievementCard, ProgressBar, Badge } from '@components';
import { colors, typography, spacing } from '@theme';
import type { AchievementCategory } from '@models/Achievement';

const CATEGORIES: AchievementCategory[] = [
  'starter',
  'consistency',
  'speed',
  'comeback',
  'shame',
  'special',
];

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  starter: '🎯 Starter',
  consistency: '💪 Consistency',
  speed: '⚡ Speed',
  comeback: '🦸 Comeback',
  shame: '😅 Shame',
  special: '🌟 Special',
};

export function AchievementsScreen() {
  const { achievements, loadAchievements } = useAchievementStore();
  const { habits } = useHabitStore();
  const { user } = useUserStore();
  const { allTimeStats } = useStatsStore();
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadAchievements(user.id);
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await loadAchievements(user.id);
    }
    setRefreshing(false);
  };

  const displayedAchievements =
    selectedCategory === 'all'
      ? achievements
      : getAchievementsByCategory(achievements, selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlockedDate).length;
  const completionPercentage = getAchievementCompletionPercentage(achievements);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
        <View style={styles.stats}>
          <Badge
            label={`${unlockedCount}/${achievements.length}`}
            variant="primary"
            size="medium"
          />
        </View>
      </View>

      {/* Overall Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Overall Completion</Text>
          <Text style={styles.progressValue}>{Math.round(completionPercentage)}%</Text>
        </View>
        <ProgressBar
          progress={completionPercentage}
          height={12}
          color={colors.primary}
          animated
        />
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        <CategoryButton
          label="All"
          active={selectedCategory === 'all'}
          onPress={() => setSelectedCategory('all')}
        />
        {CATEGORIES.map(category => (
          <CategoryButton
            key={category}
            label={CATEGORY_LABELS[category]}
            active={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
          />
        ))}
      </ScrollView>

      {/* Achievements Grid */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.grid}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {displayedAchievements.map(achievement => {
          const progress = user
            ? getAchievementProgress(
                achievement.id,
                user,
                habits,
                allTimeStats || {
                  completions: 0,
                  snoozes: 0,
                  slackerMoments: 0,
                  xpEarned: 0,
                }
              )
            : 0;

          return (
            <View key={achievement.id} style={styles.gridItem}>
              <AchievementCard achievement={achievement} progress={progress} />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function CategoryButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.categoryButton, active && styles.categoryButtonActive]}
      onPress={onPress}
    >
      <Text
        style={[styles.categoryLabel, active && styles.categoryLabelActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },

  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },

  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  progressSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  progressLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },

  progressValue: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },

  categoriesContainer: {
    maxHeight: 50,
  },

  categoriesContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },

  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  categoryButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },

  categoryLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },

  categoryLabelActive: {
    color: colors.primary,
  },

  content: {
    flex: 1,
  },

  grid: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },

  gridItem: {
    width: '100%',
    marginBottom: spacing.md,
  },
});
