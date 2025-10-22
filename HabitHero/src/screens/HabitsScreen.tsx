/**
 * Habits Screen
 * List and manage all habits
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useHabitStore } from '@store/habitStore';
import { useUserStore } from '@store/userStore';
import { calculateHabitXP } from '@services/XPService';
import { getHabitsSortedByStreak } from '@services/StreakService';
import { HabitCard, EmptyState, Button, Badge } from '@components';
import { colors, typography, spacing } from '@theme';
import type { HabitStatus } from '@models/Habit';

type FilterType = 'all' | 'active' | 'completed' | 'pending';

export function HabitsScreen({ navigation }: any) {
  const { habits, loadHabits, completeHabit, snoozeHabit, deleteHabit } =
    useHabitStore();
  const { user, addXP } = useUserStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadHabits(user.id);
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await loadHabits(user.id);
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
    snoozeHabit(habitId, 60);
  };

  const handleDeleteHabit = (habitId: string) => {
    // In a real app, show confirmation dialog
    deleteHabit(habitId);
  };

  const getFilteredHabits = () => {
    switch (filter) {
      case 'active':
        return habits.filter(h => h.currentStreak > 0);
      case 'completed':
        return habits.filter(h => h.todayStatus === 'completed');
      case 'pending':
        return habits.filter(h => h.todayStatus !== 'completed');
      default:
        return habits;
    }
  };

  const filteredHabits = getFilteredHabits();
  const sortedHabits = getHabitsSortedByStreak(filteredHabits);

  const stats = {
    total: habits.length,
    active: habits.filter(h => h.currentStreak > 0).length,
    completed: habits.filter(h => h.todayStatus === 'completed').length,
    pending: habits.filter(h => h.todayStatus !== 'completed').length,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Habits</Text>
        <Button
          title="+ New"
          onPress={() => navigation.navigate('AddHabit')}
          variant="primary"
          size="small"
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <FilterButton
          label="All"
          count={stats.total}
          active={filter === 'all'}
          onPress={() => setFilter('all')}
        />
        <FilterButton
          label="Active Streaks"
          count={stats.active}
          active={filter === 'active'}
          onPress={() => setFilter('active')}
        />
        <FilterButton
          label="Completed"
          count={stats.completed}
          active={filter === 'completed'}
          onPress={() => setFilter('completed')}
        />
        <FilterButton
          label="Pending"
          count={stats.pending}
          active={filter === 'pending'}
          onPress={() => setFilter('pending')}
        />
      </ScrollView>

      {/* Habits List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {sortedHabits.length === 0 ? (
          <EmptyState
            emoji={filter === 'all' ? '🎯' : '📭'}
            title={
              filter === 'all'
                ? 'No Habits Yet'
                : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Habits`
            }
            description={
              filter === 'all'
                ? 'Create your first habit to get started!'
                : `You don't have any ${filter} habits right now.`
            }
            actionLabel={filter === 'all' ? 'Create Habit' : undefined}
            onAction={
              filter === 'all'
                ? () => navigation.navigate('AddHabit')
                : undefined
            }
          />
        ) : (
          sortedHabits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onPress={() =>
                navigation.navigate('HabitDetail', { habitId: habit.id })
              }
              onComplete={() => handleCompleteHabit(habit.id)}
              onSnooze={() => handleSnoozeHabit(habit.id)}
              showActions={habit.todayStatus !== 'completed'}
            />
          ))
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {sortedHabits.length} {sortedHabits.length === 1 ? 'habit' : 'habits'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function FilterButton({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>
        {label}
      </Text>
      <Badge
        label={count}
        variant={active ? 'primary' : 'secondary'}
        size="small"
        style={styles.filterBadge}
      />
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

  filtersContainer: {
    maxHeight: 50,
  },

  filtersContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },

  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  filterButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },

  filterLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },

  filterLabelActive: {
    color: colors.primary,
  },

  filterBadge: {
    minWidth: 24,
  },

  content: {
    flex: 1,
    padding: spacing.lg,
  },

  footer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },

  footerText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
});
