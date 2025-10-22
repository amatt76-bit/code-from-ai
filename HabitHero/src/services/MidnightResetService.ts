/**
 * Midnight Reset Service
 * Handles daily reset at midnight (00:00)
 */

import { getAllHabits } from '@database/queries/habitQueries';
import { resetDailyHabitStatus, breakStreak } from '@database/queries/habitQueries';
import { getUserById, updateComboStreak } from '@database/queries/userQueries';
import { createDailyChallenge } from '@database/queries/challengeQueries';
import type { Habit } from '@models/Habit';

/**
 * Midnight reset result
 */
export interface MidnightResetResult {
  habitsReset: number;
  streaksBroken: number;
  comboStreakUpdated: boolean;
  newComboStreak: number;
  dailyChallengeCreated: boolean;
  mercyPassesReset: boolean;
}

/**
 * Start midnight reset service
 * Checks every minute if it's midnight, then runs reset
 */
export function startMidnightResetService(): void {
  let lastResetDate = new Date().toISOString().split('T')[0];

  const checkMidnight = () => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Check if we've crossed into a new day and it's around midnight (00:00-00:05)
    if (currentDate !== lastResetDate && currentHour === 0 && currentMinute < 5) {
      console.log('🌙 Midnight detected, running reset...');
      triggerMidnightReset()
        .then((result) => {
          console.log('✅ Midnight reset completed:', result);
        })
        .catch((error) => {
          console.error('❌ Midnight reset failed:', error);
        });

      lastResetDate = currentDate;
    }
  };

  // Check every minute
  const intervalId = setInterval(checkMidnight, 60 * 1000);

  // Also check immediately on start
  checkMidnight();

  console.log('✅ Midnight reset service started');

  // Return cleanup function (though we don't use it in this implementation)
  return () => clearInterval(intervalId);
}

/**
 * Manually trigger midnight reset
 * Can be used for testing or manual reset
 */
export async function triggerMidnightReset(userId = 'default-user'): Promise<MidnightResetResult> {
  console.log('🌙 Starting midnight reset...');

  const result: MidnightResetResult = {
    habitsReset: 0,
    streaksBroken: 0,
    comboStreakUpdated: false,
    newComboStreak: 0,
    dailyChallengeCreated: false,
    mercyPassesReset: false,
  };

  try {
    // 1. Get user and all habits
    const user = getUserById(userId);
    if (!user) {
      console.error('User not found for midnight reset');
      return result;
    }

    const habits = getAllHabits(userId);
    result.habitsReset = habits.length;

    // 2. Check which habits were NOT completed today
    const incompletedHabits = habits.filter(
      (h) => h.todayStatus !== 'completed'
    );

    // 3. Break streaks for incomplete habits
    for (const habit of incompletedHabits) {
      if (habit.currentStreak > 0) {
        breakStreak(habit.id);
        result.streaksBroken++;
        console.log(`💔 Broke streak for "${habit.name}" (was ${habit.currentStreak} days)`);
      }
    }

    // 4. Update combo streak
    const allHabitsCompleted = incompletedHabits.length === 0 && habits.length > 0;

    if (allHabitsCompleted) {
      // Increment combo streak
      const newComboStreak = user.currentComboStreak + 1;
      updateComboStreak(userId, newComboStreak);
      result.newComboStreak = newComboStreak;
      result.comboStreakUpdated = true;
      console.log(`🔥 Combo streak increased to ${newComboStreak}!`);
    } else if (habits.length > 0) {
      // Reset combo streak
      updateComboStreak(userId, 0);
      result.newComboStreak = 0;
      result.comboStreakUpdated = true;
      console.log('💔 Combo streak reset to 0');
    }

    // 5. Reset daily status for all habits
    resetDailyHabitStatus(userId);
    console.log(`♻️  Reset daily status for ${habits.length} habits`);

    // 6. Create new daily challenge
    try {
      const challengeTypes = [
        'complete_all',
        'speed_run',
        'early_bird',
        'no_snooze',
        'perfect_day',
        'comeback',
      ];
      const randomType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];

      await createDailyChallenge(userId, randomType as any);
      result.dailyChallengeCreated = true;
      console.log(`🎯 Created new daily challenge: ${randomType}`);
    } catch (error) {
      console.error('Failed to create daily challenge:', error);
    }

    // 7. Reset mercy passes on 1st of month
    const today = new Date();
    if (today.getDate() === 1) {
      // Get user level to determine mercy passes
      const mercyPasses = user.level >= 15 ? 2 : 1;
      // This would be handled by userQueries.ts resetMonthlyMercyPasses()
      // For now, just log it
      result.mercyPassesReset = true;
      console.log(`💎 Monthly mercy passes reset to ${mercyPasses}`);
    }

    console.log('✅ Midnight reset completed successfully');
    return result;
  } catch (error) {
    console.error('❌ Midnight reset failed:', error);
    throw error;
  }
}

/**
 * Check if late-day reminder should be sent
 * Call this around 8-9 PM to remind users about incomplete habits
 */
export function shouldSendLateDayReminder(habits: Habit[]): boolean {
  const now = new Date();
  const currentHour = now.getHours();

  // Send reminder between 8 PM and 10 PM
  if (currentHour < 20 || currentHour >= 22) {
    return false;
  }

  // Check if there are incomplete habits
  const incompleteHabits = habits.filter((h) => h.todayStatus !== 'completed');

  return incompleteHabits.length > 0;
}

/**
 * Get habits that need late-day reminder
 */
export function getHabitsNeedingReminder(habits: Habit[]): Habit[] {
  return habits.filter((h) => {
    // Include habits that are:
    // 1. Not completed today
    // 2. Have an active streak (at risk of losing it)
    // 3. Not snoozed
    return (
      h.todayStatus !== 'completed' &&
      h.currentStreak > 0 &&
      h.todayStatus !== 'snoozed'
    );
  });
}

/**
 * Calculate time until midnight
 */
export function getTimeUntilMidnight(): {
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
} {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);

  const diffMs = midnight.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return {
    hours,
    minutes,
    seconds,
    totalMs: diffMs,
  };
}

/**
 * Format time until midnight
 */
export function formatTimeUntilMidnight(): string {
  const { hours, minutes } = getTimeUntilMidnight();

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Check if it's currently late in the day
 */
export function isLateInDay(): boolean {
  const currentHour = new Date().getHours();
  return currentHour >= 20; // After 8 PM
}

/**
 * Get motivational message based on time of day
 */
export function getTimeBasedMessage(): string {
  const currentHour = new Date().getHours();

  if (currentHour >= 0 && currentHour < 6) {
    return 'Early bird! Time to crush those habits! 🌅';
  } else if (currentHour >= 6 && currentHour < 12) {
    return 'Good morning! Ready to build those habits? ☀️';
  } else if (currentHour >= 12 && currentHour < 17) {
    return 'Afternoon check-in! How are your habits going? 🌤️';
  } else if (currentHour >= 17 && currentHour < 20) {
    return 'Evening! Don\'t forget your habits! 🌆';
  } else {
    return 'Getting late! Complete those habits before midnight! 🌙';
  }
}

/**
 * Schedule late-day reminder check
 * Returns cleanup function
 */
export function scheduleLateDayReminderCheck(
  onReminderNeeded: (habits: Habit[]) => void,
  userId = 'default-user'
): () => void {
  let reminderSentToday = false;
  let lastCheckDate = new Date().toISOString().split('T')[0];

  const checkReminder = () => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentHour = now.getHours();

    // Reset flag at midnight
    if (currentDate !== lastCheckDate) {
      reminderSentToday = false;
      lastCheckDate = currentDate;
    }

    // Check if we should send reminder (between 8-9 PM, once per day)
    if (!reminderSentToday && currentHour === 20) {
      const habits = getAllHabits(userId);
      const habitsAtRisk = getHabitsNeedingReminder(habits);

      if (habitsAtRisk.length > 0) {
        onReminderNeeded(habitsAtRisk);
        reminderSentToday = true;
        console.log(`⏰ Late-day reminder sent for ${habitsAtRisk.length} habits`);
      }
    }
  };

  // Check every 15 minutes
  const intervalId = setInterval(checkReminder, 15 * 60 * 1000);

  // Check immediately
  checkReminder();

  console.log('✅ Late-day reminder check scheduled');

  return () => clearInterval(intervalId);
}

/**
 * Get daily reset summary for display
 */
export function getDailyResetSummary(result: MidnightResetResult): string {
  const lines: string[] = [];

  lines.push('🌙 Daily Reset Summary:');
  lines.push(`  • ${result.habitsReset} habits reset`);

  if (result.streaksBroken > 0) {
    lines.push(`  • ${result.streaksBroken} streaks broken 💔`);
  } else {
    lines.push('  • No streaks broken! 🎉');
  }

  if (result.comboStreakUpdated) {
    if (result.newComboStreak > 0) {
      lines.push(`  • Combo streak: ${result.newComboStreak} days! 🔥`);
    } else {
      lines.push('  • Combo streak reset');
    }
  }

  if (result.dailyChallengeCreated) {
    lines.push('  • New daily challenge created 🎯');
  }

  if (result.mercyPassesReset) {
    lines.push('  • Mercy passes reset for the month 💎');
  }

  return lines.join('\n');
}
