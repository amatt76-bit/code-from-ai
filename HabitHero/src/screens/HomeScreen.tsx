/**
 * Home Screen
 * Main dashboard showing today's habits, XP progress, and quick stats
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useHabitStore } from '@store/habitStore';
import { useUserStore } from '@store/userStore';
import { useStatsStore } from '@store/statsStore';
import { calculateHabitXP } from '@services/XPService';
import { getXPSummary } from '@services/XPService';
import { getLevelForXP } from '@constants/levels';
import { getTimeBasedMessage, formatTimeUntilMidnight } from '@services/MidnightResetService';
import { HabitCard, XPProgressBar, StreakBadge, EmptyState, Badge } from '@components';
import { colors, typography, spacing } from '@theme';

export function HomeScreen({ navigation }: any) {
  const { habits, loadHabits, completeHabit, snoozeHabit } = useHabitStore();
  const { user, addXP } = useUserStore();
  const { weeklyStats, loadStats } = useStatsStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    if (user) {
      loadHabits(user.id);
      loadStats(user.id);
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await loadHabits(user.id);
      await loadStats(user.id);
    }
    setRefreshing(false);
  };

  const handleCompleteHabit = (habitId: string) => {
    if (!user) return;

    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const xpCalc = calculateHabitXP(
      habit.currentStreak + 1,
      user.currentComboStreak,
      false
    );

    completeHabit(habitId, xpCalc.totalXP);
    addXP(xpCalc.totalXP);
  };

  const handleSnoozeHabit = (habitId: string) => {
    snoozeHabit(habitId, 60); // Snooze for 60 minutes
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const levelInfo = getLevelForXP(user.totalXP);
  const xpSummary = getXPSummary(user.totalXP, user.currentComboStreak);

  const todayHabits = habits.filter(h => h.todayStatus !== 'completed');
  const completedToday = habits.filter(h => h.todayStatus === 'completed');
  const habitsAtRisk = habits.filter(
    h => h.currentStreak > 0 && h.todayStatus !== 'completed'
  );

  const completionRate =
    habits.length > 0 ? (completedToday.length / habits.length) * 100 : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getTimeBasedMessage()}</Text>
          <Text style={styles.username}>{user.username}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelEmoji}>{levelInfo.emoji}</Text>
            <Text style={styles.levelNumber}>{levelInfo.level}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* XP Progress */}
      <View style={styles.section}>
        <XPProgressBar
          levelInfo={levelInfo}
          currentLevelXP={xpSummary.currentLevelXP}
          nextLevelXP={xpSummary.nextLevelXP}
          totalXP={user.totalXP}
          comboMultiplier={user.comboMultiplier}
        />
      </View>

      {/* Daily Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{completedToday.length}/{habits.length}</Text>
          <Text style={styles.statLabel}>Completed Today</Text>
          <View style={styles.progressIndicator}>
            <View
              style={[
                styles.progressFill,
                { width: `${completionRate}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statValueRow}>
            <StreakBadge streak={user.currentComboStreak} size="small" showLabel={false} />
          </View>
          <Text style={styles.statLabel}>Combo Streak</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{weeklyStats?.completions || 0}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
      </View>

      {/* Habits at Risk */}
      {habitsAtRisk.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚠️ Streaks at Risk</Text>
            <Badge label={habitsAtRisk.length} variant="warning" size="small" />
          </View>
          <Text style={styles.sectionSubtitle}>
            Complete these before midnight ({formatTimeUntilMidnight()} left)
          </Text>
          {habitsAtRisk.slice(0, 3).map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onComplete={() => handleCompleteHabit(habit.id)}
              onSnooze={() => handleSnoozeHabit(habit.id)}
              showActions
            />
          ))}
          {habitsAtRisk.length > 3 && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Habits')}
            >
              <Text style={styles.viewAllText}>
                View all {habitsAtRisk.length} habits →
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Today's Habits */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Habits</Text>
          <Badge
            label={`${completedToday.length}/${habits.length}`}
            variant="primary"
            size="small"
          />
        </View>

        {todayHabits.length === 0 ? (
          <EmptyState
            emoji="🎉"
            title="All Done!"
            description="You've completed all your habits for today. Great work!"
            actionLabel="View Stats"
            onAction={() => navigation.navigate('Stats')}
          />
        ) : (
          todayHabits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onPress={() =>
                navigation.navigate('HabitDetail', { habitId: habit.id })
              }
              onComplete={() => handleCompleteHabit(habit.id)}
              onSnooze={() => handleSnoozeHabit(habit.id)}
              showActions
            />
          ))
        )}
      </View>

      {/* Completed Today */}
      {completedToday.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Completed Today</Text>
          {completedToday.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onPress={() =>
                navigation.navigate('HabitDetail', { habitId: habit.id })
              }
              showActions={false}
            />
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('AddHabit')}
        >
          <Text style={styles.quickActionEmoji}>➕</Text>
          <Text style={styles.quickActionText}>New Habit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Achievements')}
        >
          <Text style={styles.quickActionEmoji}>🏆</Text>
          <Text style={styles.quickActionText}>Achievements</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  greeting: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },

  username: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },

  levelBadge: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.full,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },

  levelEmoji: {
    fontSize: 20,
  },

  levelNumber: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
    marginTop: -4,
  },

  section: {
    marginBottom: spacing.xl,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },

  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },

  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },

  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  statValue: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },

  statValueRow: {
    marginBottom: spacing.xs,
  },

  statLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  progressIndicator: {
    width: '100%',
    height: 4,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.borderRadius.full,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: spacing.borderRadius.full,
  },

  viewAllButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },

  viewAllText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },

  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  quickActionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  quickActionEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },

  quickActionText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
});
