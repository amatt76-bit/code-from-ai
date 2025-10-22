/**
 * Stats Screen
 * Analytics and statistics dashboard
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useHabitStore } from '@store/habitStore';
import { useUserStore } from '@store/userStore';
import { useStatsStore } from '@store/statsStore';
import { calculateStreakStats } from '@services/StreakService';
import { Card, StreakBadge, ProgressBar, Badge } from '@components';
import { colors, typography, spacing } from '@theme';

export function StatsScreen() {
  const { habits } = useHabitStore();
  const { user } = useUserStore();
  const { weeklyStats, allTimeStats, loadStats } = useStatsStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    if (user) {
      loadStats(user.id);
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await loadStats(user.id);
    }
    setRefreshing(false);
  };

  const streakStats = calculateStreakStats(habits);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Statistics</Text>

      {/* Streak Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Streak Overview</Text>

        <Card style={styles.statsGrid}>
          <View style={styles.gridRow}>
            <StatBox
              label="Active Streaks"
              value={streakStats.totalActiveStreaks}
              emoji="🔥"
            />
            <StatBox
              label="Longest Streak"
              value={streakStats.longestCurrentStreak}
              emoji="⭐"
              subtitle={streakStats.longestHabitName}
            />
          </View>

          <View style={styles.gridRow}>
            <StatBox
              label="Average Streak"
              value={streakStats.averageStreak}
              emoji="📊"
            />
            <StatBox
              label="At Risk"
              value={streakStats.habitsAtRisk}
              emoji="⚠️"
              variant="warning"
            />
          </View>
        </Card>
      </View>

      {/* This Week */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 This Week</Text>

        <Card>
          <StatRow
            label="Completions"
            value={weeklyStats?.completions || 0}
            icon="✅"
          />
          <StatRow
            label="XP Earned"
            value={weeklyStats?.xpEarned || 0}
            icon="⭐"
          />
          <StatRow
            label="Snoozes"
            value={weeklyStats?.snoozes || 0}
            icon="💤"
          />
          <StatRow
            label="Slacker Moments"
            value={weeklyStats?.slackerMoments || 0}
            icon="😅"
            isLast
          />
        </Card>
      </View>

      {/* All Time */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 All Time</Text>

        <Card>
          <StatRow
            label="Total Completions"
            value={allTimeStats?.completions || 0}
            icon="✅"
          />
          <StatRow
            label="Total XP"
            value={(allTimeStats?.xpEarned || 0).toLocaleString()}
            icon="⭐"
          />
          <StatRow
            label="Total Snoozes"
            value={allTimeStats?.snoozes || 0}
            icon="💤"
          />
          <StatRow
            label="Total Slacker Moments"
            value={allTimeStats?.slackerMoments || 0}
            icon="😅"
            isLast
          />
        </Card>
      </View>

      {/* Completion Rate */}
      {habits.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Today's Progress</Text>

          <Card>
            {habits.map((habit, index) => {
              const isCompleted = habit.todayStatus === 'completed';
              return (
                <View
                  key={habit.id}
                  style={[
                    styles.habitProgress,
                    index === habits.length - 1 && styles.habitProgressLast,
                  ]}
                >
                  <View style={styles.habitProgressHeader}>
                    <View style={styles.habitProgressTitle}>
                      {habit.emoji && (
                        <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                      )}
                      <Text style={styles.habitName}>
                        {habit.nickname || habit.name}
                      </Text>
                    </View>
                    <StreakBadge
                      streak={habit.currentStreak}
                      size="small"
                      showLabel={false}
                    />
                  </View>

                  <ProgressBar
                    progress={isCompleted ? 100 : 0}
                    height={6}
                    color={isCompleted ? colors.success : colors.backgroundSecondary}
                    animated={false}
                  />
                </View>
              );
            })}
          </Card>
        </View>
      )}

      {/* Fun Facts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Fun Facts</Text>

        <Card>
          <FunFact
            text={`You've completed ${(allTimeStats?.completions || 0).toLocaleString()} habits!`}
          />
          <FunFact
            text={`Your longest streak is ${streakStats.longestCurrentStreak} days on "${streakStats.longestHabitName}"`}
          />
          {user && user.mercyPassesUsedTotal > 0 && (
            <FunFact
              text={`You've used ${user.mercyPassesUsedTotal} mercy ${user.mercyPassesUsedTotal === 1 ? 'pass' : 'passes'}`}
              isLast
            />
          )}
        </Card>
      </View>
    </ScrollView>
  );
}

function StatBox({
  label,
  value,
  emoji,
  subtitle,
  variant,
}: {
  label: string;
  value: number | string;
  emoji: string;
  subtitle?: string;
  variant?: 'default' | 'warning';
}) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text
        style={[
          styles.statBoxValue,
          variant === 'warning' && styles.statBoxValueWarning,
        ]}
      >
        {value}
      </Text>
      <Text style={styles.statBoxLabel}>{label}</Text>
      {subtitle && <Text style={styles.statBoxSubtitle}>{subtitle}</Text>}
    </View>
  );
}

function StatRow({
  label,
  value,
  icon,
  isLast,
}: {
  label: string;
  value: number | string;
  icon: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.statRow, !isLast && styles.statRowBorder]}>
      <View style={styles.statRowLeft}>
        <Text style={styles.statRowIcon}>{icon}</Text>
        <Text style={styles.statRowLabel}>{label}</Text>
      </View>
      <Text style={styles.statRowValue}>{value}</Text>
    </View>
  );
}

function FunFact({ text, isLast }: { text: string; isLast?: boolean }) {
  return (
    <View style={[styles.funFact, !isLast && styles.funFactBorder]}>
      <Text style={styles.funFactBullet}>•</Text>
      <Text style={styles.funFactText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },

  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },

  section: {
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  statsGrid: {
    padding: spacing.md,
    gap: spacing.md,
  },

  gridRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.borderRadius.md,
  },

  statEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },

  statBoxValue: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },

  statBoxValueWarning: {
    color: colors.warning,
  },

  statBoxLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  statBoxSubtitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 2,
  },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },

  statRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  statRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statRowIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },

  statRowLabel: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
  },

  statRowValue: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },

  habitProgress: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  habitProgressLast: {
    borderBottomWidth: 0,
  },

  habitProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  habitProgressTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  habitEmoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },

  habitName: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },

  funFact: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  funFactBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  funFactBullet: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
    marginRight: spacing.sm,
  },

  funFactText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
