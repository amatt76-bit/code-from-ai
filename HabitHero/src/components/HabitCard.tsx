/**
 * Habit Card Component
 * Displays habit with streak, status, and quick actions
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { Habit, HabitStatus } from '@models/Habit';
import { colors, typography, spacing } from '@theme';
import { Card } from './Card';
import { Badge } from './Badge';

interface HabitCardProps {
  habit: Habit;
  onPress?: () => void;
  onComplete?: () => void;
  onSnooze?: () => void;
  showActions?: boolean;
}

export function HabitCard({
  habit,
  onPress,
  onComplete,
  onSnooze,
  showActions = true,
}: HabitCardProps) {
  const statusColor = getStatusColor(habit.todayStatus);
  const statusText = getStatusText(habit.todayStatus);

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {habit.emoji && <Text style={styles.emoji}>{habit.emoji}</Text>}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{habit.nickname || habit.name}</Text>
            {habit.nickname && (
              <Text style={styles.subtitle}>{habit.name}</Text>
            )}
          </View>
        </View>

        <Badge
          label={statusText}
          variant={statusColor}
          size="small"
        />
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>🔥 {habit.currentStreak}</Text>
          <Text style={styles.statLabel}>Current</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statValue}>⭐ {habit.bestStreak}</Text>
          <Text style={styles.statLabel}>Best</Text>
        </View>

        {habit.snoozesCount > 0 && (
          <>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>💤 {habit.snoozesCount}</Text>
              <Text style={styles.statLabel}>Snoozed</Text>
            </View>
          </>
        )}
      </View>

      {habit.reminderTimes.length > 0 && (
        <View style={styles.reminders}>
          <Text style={styles.remindersLabel}>Reminders:</Text>
          <Text style={styles.remindersText}>
            {habit.reminderTimes.join(', ')}
          </Text>
        </View>
      )}

      {showActions && habit.todayStatus !== 'completed' && (
        <View style={styles.actions}>
          {onComplete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={onComplete}
            >
              <Text style={styles.actionButtonText}>✅ Complete</Text>
            </TouchableOpacity>
          )}

          {onSnooze && habit.todayStatus !== 'snoozed' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.snoozeButton]}
              onPress={onSnooze}
            >
              <Text style={styles.actionButtonText}>💤 Snooze</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {habit.todayStatus === 'snoozed' && habit.snoozedUntil && (
        <View style={styles.snoozeInfo}>
          <Text style={styles.snoozeText}>
            💤 Snoozed until {new Date(habit.snoozedUntil).toLocaleTimeString()}
          </Text>
        </View>
      )}
    </Card>
  );
}

function getStatusColor(status: HabitStatus): 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'snoozed':
      return 'warning';
    case 'failed':
      return 'error';
    default:
      return 'info';
  }
}

function getStatusText(status: HabitStatus): string {
  switch (status) {
    case 'completed':
      return '✅ Done';
    case 'snoozed':
      return '💤 Snoozed';
    case 'failed':
      return '❌ Failed';
    default:
      return '⏳ Pending';
  }
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  emoji: {
    fontSize: 32,
    marginRight: spacing.sm,
  },

  titleContainer: {
    flex: 1,
  },

  title: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },

  subtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },

  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statValue: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },

  statLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },

  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },

  reminders: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },

  remindersLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },

  remindersText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
  },

  actions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },

  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
  },

  completeButton: {
    backgroundColor: colors.success,
  },

  snoozeButton: {
    backgroundColor: colors.warning,
  },

  actionButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
  },

  snoozeInfo: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.warningLight,
    borderRadius: spacing.borderRadius.sm,
  },

  snoozeText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
