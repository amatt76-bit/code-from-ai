/**
 * Streak Service
 * Handles streak tracking, milestones, and statistics
 */

import type { Habit } from '@models/Habit';

/**
 * Streak milestone levels
 */
export const STREAK_MILESTONES = [3, 7, 14, 21, 30, 60, 90, 100, 180, 365];

/**
 * Combo streak milestones (all habits completed for X days)
 */
export const COMBO_MILESTONES = [3, 7, 14, 30, 60, 90, 100];

/**
 * Streak milestone event
 */
export interface StreakMilestone {
  habitId: string;
  habitName: string;
  milestone: number;
  currentStreak: number;
  nextMilestone: number | null;
  achievementType: 'streak' | 'combo';
  message: string;
}

/**
 * Streak statistics
 */
export interface StreakStats {
  totalActiveStreaks: number;
  longestCurrentStreak: number;
  longestHabitName: string;
  averageStreak: number;
  habitsAtRisk: number; // Habits that haven't been completed today
  perfectDays: number; // Days all habits were completed
}

/**
 * Check if a streak just hit a milestone
 */
export function checkStreakMilestone(
  previousStreak: number,
  currentStreak: number,
  habitName: string,
  habitId: string
): StreakMilestone | null {
  // Find the milestone that was just crossed
  for (const milestone of STREAK_MILESTONES) {
    if (currentStreak === milestone && previousStreak < milestone) {
      const nextMilestone = getNextMilestone(currentStreak);

      return {
        habitId,
        habitName,
        milestone,
        currentStreak,
        nextMilestone,
        achievementType: 'streak',
        message: getMilestoneMessage(milestone, habitName),
      };
    }
  }

  return null;
}

/**
 * Check if combo streak hit a milestone
 */
export function checkComboMilestone(
  previousComboStreak: number,
  currentComboStreak: number
): StreakMilestone | null {
  for (const milestone of COMBO_MILESTONES) {
    if (currentComboStreak === milestone && previousComboStreak < milestone) {
      const nextMilestone = getNextComboMilestone(currentComboStreak);

      return {
        habitId: 'combo',
        habitName: 'All Habits',
        milestone,
        currentStreak: currentComboStreak,
        nextMilestone,
        achievementType: 'combo',
        message: getComboMilestoneMessage(milestone),
      };
    }
  }

  return null;
}

/**
 * Get next milestone for a streak
 */
export function getNextMilestone(currentStreak: number): number | null {
  for (const milestone of STREAK_MILESTONES) {
    if (milestone > currentStreak) {
      return milestone;
    }
  }
  return null; // No more milestones
}

/**
 * Get next combo milestone
 */
export function getNextComboMilestone(currentComboStreak: number): number | null {
  for (const milestone of COMBO_MILESTONES) {
    if (milestone > currentComboStreak) {
      return milestone;
    }
  }
  return null;
}

/**
 * Get motivational message for streak milestone
 */
export function getMilestoneMessage(milestone: number, habitName: string): string {
  switch (milestone) {
    case 3:
      return `🔥 3-day streak for ${habitName}! You're building momentum!`;
    case 7:
      return `⭐ 7-day streak for ${habitName}! One week strong!`;
    case 14:
      return `💪 14-day streak for ${habitName}! Two weeks of dedication!`;
    case 21:
      return `🌟 21-day streak for ${habitName}! They say it takes 21 days to form a habit!`;
    case 30:
      return `🏆 30-day streak for ${habitName}! A full month! Unstoppable!`;
    case 60:
      return `💎 60-day streak for ${habitName}! Two months! You're a legend!`;
    case 90:
      return `👑 90-day streak for ${habitName}! Three months! Absolutely incredible!`;
    case 100:
      return `🎉 100-DAY STREAK for ${habitName}! You're in the elite club now!`;
    case 180:
      return `🌈 180-day streak for ${habitName}! Half a year! Mind-blowing!`;
    case 365:
      return `🏅 365-DAY STREAK for ${habitName}! A FULL YEAR! You are a MASTER!`;
    default:
      return `🔥 ${milestone}-day streak for ${habitName}! Amazing work!`;
  }
}

/**
 * Get motivational message for combo milestone
 */
export function getComboMilestoneMessage(milestone: number): string {
  switch (milestone) {
    case 3:
      return `🔥 3-day combo! All habits completed for 3 days straight!`;
    case 7:
      return `⭐ 7-day combo! Perfect week! You're on fire!`;
    case 14:
      return `💪 14-day combo! Two weeks of perfection!`;
    case 30:
      return `🏆 30-day combo! A FULL MONTH of completing everything! Legendary!`;
    case 60:
      return `💎 60-day combo! Two months of perfection! Unbelievable!`;
    case 90:
      return `👑 90-day combo! Three months! You're a HABIT HERO!`;
    case 100:
      return `🎉 100-DAY COMBO! You're in the Hall of Fame!`;
    default:
      return `🔥 ${milestone}-day combo! All habits completed! Incredible!`;
  }
}

/**
 * Calculate streak statistics for all habits
 */
export function calculateStreakStats(habits: Habit[]): StreakStats {
  if (habits.length === 0) {
    return {
      totalActiveStreaks: 0,
      longestCurrentStreak: 0,
      longestHabitName: '',
      averageStreak: 0,
      habitsAtRisk: 0,
      perfectDays: 0,
    };
  }

  const activeStreaks = habits.filter(h => h.currentStreak > 0);
  const longestHabit = habits.reduce((prev, current) =>
    current.currentStreak > prev.currentStreak ? current : prev
  );

  const totalStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);
  const averageStreak = Math.floor(totalStreak / habits.length);

  const habitsAtRisk = habits.filter(
    h => h.todayStatus === 'not_done' && h.currentStreak > 0
  ).length;

  // Calculate perfect days (estimate based on best streaks)
  const perfectDays = Math.min(...habits.map(h => h.bestStreak));

  return {
    totalActiveStreaks: activeStreaks.length,
    longestCurrentStreak: longestHabit.currentStreak,
    longestHabitName: longestHabit.name,
    averageStreak,
    habitsAtRisk,
    perfectDays,
  };
}

/**
 * Get habits at risk of losing streak
 */
export function getHabitsAtRisk(habits: Habit[]): Habit[] {
  return habits.filter(
    h =>
      h.currentStreak > 0 &&
      h.todayStatus === 'not_done' &&
      h.todayStatus !== 'snoozed'
  );
}

/**
 * Get habits with active streaks
 */
export function getHabitsWithActiveStreaks(habits: Habit[]): Habit[] {
  return habits.filter(h => h.currentStreak > 0);
}

/**
 * Get habits sorted by streak (highest first)
 */
export function getHabitsSortedByStreak(habits: Habit[]): Habit[] {
  return [...habits].sort((a, b) => b.currentStreak - a.currentStreak);
}

/**
 * Calculate days until next milestone
 */
export function getDaysToNextMilestone(currentStreak: number): number | null {
  const nextMilestone = getNextMilestone(currentStreak);
  if (!nextMilestone) return null;
  return nextMilestone - currentStreak;
}

/**
 * Get progress to next milestone (percentage)
 */
export function getMilestoneProgress(currentStreak: number): number {
  if (currentStreak === 0) return 0;

  const nextMilestone = getNextMilestone(currentStreak);
  if (!nextMilestone) return 100; // All milestones reached

  // Find the previous milestone
  let previousMilestone = 0;
  for (const milestone of STREAK_MILESTONES) {
    if (milestone < currentStreak) {
      previousMilestone = milestone;
    } else {
      break;
    }
  }

  const range = nextMilestone - previousMilestone;
  const progress = currentStreak - previousMilestone;

  return Math.min(100, (progress / range) * 100);
}

/**
 * Check if today is a "perfect day" (all habits completed)
 */
export function isPerfectDay(habits: Habit[]): boolean {
  if (habits.length === 0) return false;
  return habits.every(h => h.todayStatus === 'completed');
}

/**
 * Check if any habit streak is at risk (not done and it's late in day)
 */
export function hasStreaksAtRisk(habits: Habit[], currentHour: number): boolean {
  // After 8 PM (20:00), consider streaks at risk
  if (currentHour < 20) return false;

  return habits.some(
    h =>
      h.currentStreak > 0 &&
      h.todayStatus === 'not_done' &&
      h.todayStatus !== 'snoozed'
  );
}

/**
 * Get encouraging message based on streak status
 */
export function getStreakEncouragement(currentStreak: number): string {
  if (currentStreak >= 100) {
    return 'You\'re a LEGEND! Keep that fire burning! 🔥';
  } else if (currentStreak >= 30) {
    return 'Incredible consistency! You\'re unstoppable! 💪';
  } else if (currentStreak >= 7) {
    return 'One week strong! Keep the momentum! ⭐';
  } else if (currentStreak >= 3) {
    return 'Great start! You\'re building a habit! 🌱';
  } else if (currentStreak === 1) {
    return 'Every journey starts with a single step! 🚀';
  } else {
    return 'Ready to start your streak? Let\'s go! 💫';
  }
}

/**
 * Calculate streak health score (0-100)
 */
export function calculateStreakHealth(habits: Habit[]): number {
  if (habits.length === 0) return 0;

  const completedToday = habits.filter(h => h.todayStatus === 'completed').length;
  const withActiveStreaks = habits.filter(h => h.currentStreak > 0).length;

  const completionScore = (completedToday / habits.length) * 60; // 60% weight
  const streakScore = (withActiveStreaks / habits.length) * 40; // 40% weight

  return Math.floor(completionScore + streakScore);
}

/**
 * Get streak recovery message (when streak breaks)
 */
export function getStreakRecoveryMessage(brokenStreak: number): string {
  if (brokenStreak >= 100) {
    return 'That was an incredible run! Time to build an even bigger streak! 💪';
  } else if (brokenStreak >= 30) {
    return 'You had an amazing streak! Learn from it and start fresh! 🌟';
  } else if (brokenStreak >= 7) {
    return 'A solid week! Now you know you can do it again! 🔥';
  } else if (brokenStreak >= 3) {
    return 'Good effort! Consistency is a journey, not a destination! 🚀';
  } else {
    return 'Tomorrow is a new opportunity! Let\'s get back on track! 💫';
  }
}

/**
 * Predict if user is likely to complete all habits today
 */
export function predictPerfectDay(
  habits: Habit[],
  currentHour: number
): { likelihood: number; reasoning: string } {
  if (habits.length === 0) {
    return { likelihood: 0, reasoning: 'No habits to complete' };
  }

  const completedCount = habits.filter(h => h.todayStatus === 'completed').length;
  const completionRate = completedCount / habits.length;

  // After 8 PM, likelihood is mostly based on current completion
  if (currentHour >= 20) {
    return {
      likelihood: Math.floor(completionRate * 100),
      reasoning:
        completionRate === 1
          ? 'All habits completed! 🎉'
          : 'Getting late, but you can still do it!',
    };
  }

  // Earlier in day, factor in typical completion patterns
  // Assume most habits are completed by end of day
  const timeProgress = currentHour / 24;
  const expectedCompletion = timeProgress * 0.8; // Expect 80% done by end of day

  if (completionRate >= expectedCompletion) {
    return {
      likelihood: 85,
      reasoning: 'On track! Looking good for a perfect day! ⭐',
    };
  } else {
    return {
      likelihood: 60,
      reasoning: 'Still time left! Keep going! 💪',
    };
  }
}
