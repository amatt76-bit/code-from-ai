/**
 * Achievement Service
 * Handles achievement detection, unlocking, and progress tracking
 */

import type { Achievement, AchievementCategory } from '@models/Achievement';
import type { Habit } from '@models/Habit';
import type { UserProfile } from '@models/User';
import type { WeeklyStats } from '@models/Stats';

/**
 * Achievement unlock event
 */
export interface AchievementUnlock {
  achievementId: string;
  name: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  xpReward: number;
  message: string;
}

/**
 * Achievement check result
 */
export interface AchievementCheck {
  shouldUnlock: boolean;
  progress: number;
  target: number;
}

/**
 * Check if "First Win" achievement should unlock
 */
export function checkFirstWin(totalCompletions: number): AchievementCheck {
  return {
    shouldUnlock: totalCompletions >= 1,
    progress: Math.min(1, totalCompletions),
    target: 1,
  };
}

/**
 * Check streak-based achievements
 */
export function checkStreakAchievement(currentStreak: number, target: number): AchievementCheck {
  return {
    shouldUnlock: currentStreak >= target,
    progress: currentStreak,
    target,
  };
}

/**
 * Check "Perfect Week" achievement (all habits completed for 7 days)
 */
export function checkPerfectWeek(comboStreak: number): AchievementCheck {
  return {
    shouldUnlock: comboStreak >= 7,
    progress: Math.min(7, comboStreak),
    target: 7,
  };
}

/**
 * Check "Juggler" achievement (5+ habits active simultaneously)
 */
export function checkJuggler(habits: Habit[]): AchievementCheck {
  const activeHabits = habits.filter(h => h.currentStreak > 0).length;
  return {
    shouldUnlock: activeHabits >= 5,
    progress: activeHabits,
    target: 5,
  };
}

/**
 * Check "Snooze Master" achievement (100 snoozes)
 */
export function checkSnoozeMaster(totalSnoozes: number): AchievementCheck {
  return {
    shouldUnlock: totalSnoozes >= 100,
    progress: totalSnoozes,
    target: 100,
  };
}

/**
 * Check "Professional Slacker" achievement (50 slacker moments)
 */
export function checkProfessionalSlacker(slackerCount: number): AchievementCheck {
  return {
    shouldUnlock: slackerCount >= 50,
    progress: slackerCount,
    target: 50,
  };
}

/**
 * Check "Prestige" achievement
 */
export function checkPrestige(user: UserProfile): AchievementCheck {
  return {
    shouldUnlock: user.prestigeLevel >= 1,
    progress: user.prestigeLevel,
    target: 1,
  };
}

/**
 * Check "Sharpshooter" achievement (30 perfect days)
 */
export function checkSharpshooter(comboStreak: number): AchievementCheck {
  return {
    shouldUnlock: comboStreak >= 30,
    progress: comboStreak,
    target: 30,
  };
}

/**
 * Check "Diamond" achievement (10+ habits for 90 days)
 * This requires tracking history, so we check if user currently has 10+ habits
 * with all having 90+ day streaks
 */
export function checkDiamond(habits: Habit[]): AchievementCheck {
  const habitsOver90Days = habits.filter(h => h.currentStreak >= 90).length;
  const hasEnoughHabits = habitsOver90Days >= 10;

  return {
    shouldUnlock: hasEnoughHabits,
    progress: habitsOver90Days,
    target: 10,
  };
}

/**
 * Check "Comeback Kid" achievement (rebuild 30-day streak after breaking one)
 * Requires tracking previous streak breaks - simplified version checks if user
 * has broken a streak before and now has a 30+ day streak
 */
export function checkComebackKid(
  currentStreak: number,
  bestStreak: number
): AchievementCheck {
  const hadPreviousStreak = bestStreak > currentStreak && bestStreak >= 30;
  const rebuiltStreak = currentStreak >= 30;

  return {
    shouldUnlock: hadPreviousStreak && rebuiltStreak,
    progress: rebuiltStreak ? 30 : currentStreak,
    target: 30,
  };
}

/**
 * Check "Mercy Addict" achievement (used 12 mercy passes in a year)
 */
export function checkMercyAddict(mercyPassesUsedTotal: number): AchievementCheck {
  return {
    shouldUnlock: mercyPassesUsedTotal >= 12,
    progress: mercyPassesUsedTotal,
    target: 12,
  };
}

/**
 * Check "Nice" achievement (69-day streak)
 */
export function checkNice(currentStreak: number): AchievementCheck {
  return {
    shouldUnlock: currentStreak === 69,
    progress: currentStreak,
    target: 69,
  };
}

/**
 * Check all achievements for a user
 * Returns list of newly unlocked achievements
 */
export function checkAllAchievements(
  user: UserProfile,
  habits: Habit[],
  unlockedAchievements: Achievement[],
  stats: WeeklyStats
): AchievementUnlock[] {
  const newlyUnlocked: AchievementUnlock[] = [];
  const unlockedIds = new Set(
    unlockedAchievements.filter(a => a.unlockedDate).map(a => a.id)
  );

  // Helper to check and add achievement
  const checkAndAdd = (
    id: string,
    name: string,
    description: string,
    emoji: string,
    category: AchievementCategory,
    check: AchievementCheck
  ) => {
    if (check.shouldUnlock && !unlockedIds.has(id)) {
      newlyUnlocked.push({
        achievementId: id,
        name,
        description,
        emoji,
        category,
        xpReward: 200, // Base achievement XP
        message: `Achievement Unlocked: ${name} ${emoji}`,
      });
    }
  };

  // Get max streak from all habits
  const maxStreak = Math.max(...habits.map(h => h.currentStreak), 0);
  const totalCompletions = stats.completions;
  const totalSnoozes = stats.snoozes;
  const totalSlackerMoments = stats.slackerMoments;

  // Starter achievements
  checkAndAdd(
    'first_win',
    'First Win',
    'Complete any habit for the first time',
    '🎯',
    'starter',
    checkFirstWin(totalCompletions)
  );

  checkAndAdd(
    'getting_warm',
    'Getting Warm',
    'Achieve a 3-day streak',
    '🔥',
    'starter',
    checkStreakAchievement(maxStreak, 3)
  );

  checkAndAdd(
    'week_warrior',
    'Week Warrior',
    'Maintain a 7-day streak',
    '💪',
    'starter',
    checkStreakAchievement(maxStreak, 7)
  );

  checkAndAdd(
    'fortnight_fighter',
    'Fortnight Fighter',
    'Keep going for 14 days straight',
    '🚀',
    'starter',
    checkStreakAchievement(maxStreak, 14)
  );

  checkAndAdd(
    'monthly_master',
    'Monthly Master',
    'Dominate with a 30-day streak',
    '👑',
    'starter',
    checkStreakAchievement(maxStreak, 30)
  );

  // Consistency achievements
  checkAndAdd(
    'perfect_week',
    'Perfect Week',
    'Complete all habits for 7 days straight',
    '💯',
    'consistency',
    checkPerfectWeek(user.currentComboStreak)
  );

  checkAndAdd(
    'juggler',
    'Juggler',
    'Maintain 5+ habits simultaneously',
    '🎪',
    'consistency',
    checkJuggler(habits)
  );

  checkAndAdd(
    'centurion',
    'Centurion',
    'Reach a 100-day streak',
    '🏆',
    'consistency',
    checkStreakAchievement(maxStreak, 100)
  );

  checkAndAdd(
    'hall_of_fame',
    'Hall of Fame',
    'Achieve a legendary 365-day streak',
    '🎉',
    'consistency',
    checkStreakAchievement(maxStreak, 365)
  );

  // Shame badges
  checkAndAdd(
    'snooze_master',
    'Snooze Master',
    'Snoozed 100 times (not proud, but honest)',
    '😴',
    'shame',
    checkSnoozeMaster(totalSnoozes)
  );

  checkAndAdd(
    'professional_slacker',
    'Professional Slacker',
    'Hit the slacker button 50 times',
    '😅',
    'shame',
    checkProfessionalSlacker(totalSlackerMoments)
  );

  checkAndAdd(
    'mercy_addict',
    'Mercy Addict',
    'Used all 12 yearly mercy passes',
    '💎',
    'shame',
    checkMercyAddict(user.mercyPassesUsedTotal)
  );

  // Special achievements
  checkAndAdd(
    'sharpshooter',
    'Sharpshooter',
    'Never miss a single habit in 30 days',
    '🎯',
    'special',
    checkSharpshooter(user.currentComboStreak)
  );

  checkAndAdd(
    'prestige',
    'Prestige',
    'Reset at Level 20 and earn prestige status',
    '🌟',
    'special',
    checkPrestige(user)
  );

  checkAndAdd(
    'diamond',
    'Diamond',
    'Maintain 10+ habits for 90 days',
    '💎',
    'special',
    checkDiamond(habits)
  );

  checkAndAdd(
    'nice',
    'Nice',
    'Reach a 69-day streak (nice)',
    '😏',
    'special',
    checkNice(maxStreak)
  );

  return newlyUnlocked;
}

/**
 * Calculate progress for a specific achievement
 */
export function getAchievementProgress(
  achievementId: string,
  user: UserProfile,
  habits: Habit[],
  stats: WeeklyStats
): number {
  const maxStreak = Math.max(...habits.map(h => h.currentStreak), 0);

  switch (achievementId) {
    case 'first_win':
      return Math.min(100, (stats.completions / 1) * 100);
    case 'getting_warm':
      return Math.min(100, (maxStreak / 3) * 100);
    case 'week_warrior':
      return Math.min(100, (maxStreak / 7) * 100);
    case 'fortnight_fighter':
      return Math.min(100, (maxStreak / 14) * 100);
    case 'monthly_master':
      return Math.min(100, (maxStreak / 30) * 100);
    case 'perfect_week':
      return Math.min(100, (user.currentComboStreak / 7) * 100);
    case 'juggler':
      const activeHabits = habits.filter(h => h.currentStreak > 0).length;
      return Math.min(100, (activeHabits / 5) * 100);
    case 'centurion':
      return Math.min(100, (maxStreak / 100) * 100);
    case 'hall_of_fame':
      return Math.min(100, (maxStreak / 365) * 100);
    case 'snooze_master':
      return Math.min(100, (stats.snoozes / 100) * 100);
    case 'professional_slacker':
      return Math.min(100, (stats.slackerMoments / 50) * 100);
    case 'mercy_addict':
      return Math.min(100, (user.mercyPassesUsedTotal / 12) * 100);
    case 'sharpshooter':
      return Math.min(100, (user.currentComboStreak / 30) * 100);
    case 'diamond':
      const habitsOver90 = habits.filter(h => h.currentStreak >= 90).length;
      return Math.min(100, (habitsOver90 / 10) * 100);
    case 'nice':
      return Math.min(100, (maxStreak / 69) * 100);
    default:
      return 0;
  }
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(
  achievements: Achievement[],
  category: AchievementCategory
): Achievement[] {
  return achievements.filter(a => a.category === category);
}

/**
 * Get unlocked achievements
 */
export function getUnlockedAchievements(achievements: Achievement[]): Achievement[] {
  return achievements.filter(a => a.unlockedDate !== undefined);
}

/**
 * Get locked achievements
 */
export function getLockedAchievements(achievements: Achievement[]): Achievement[] {
  return achievements.filter(a => a.unlockedDate === undefined);
}

/**
 * Get achievements close to unlocking (> 75% progress)
 */
export function getAchievementsNearUnlock(
  achievements: Achievement[],
  user: UserProfile,
  habits: Habit[],
  stats: WeeklyStats
): Achievement[] {
  return achievements.filter(achievement => {
    if (achievement.unlockedDate) return false;
    const progress = getAchievementProgress(achievement.id, user, habits, stats);
    return progress >= 75;
  });
}

/**
 * Get achievement completion percentage (overall)
 */
export function getAchievementCompletionPercentage(achievements: Achievement[]): number {
  if (achievements.length === 0) return 0;
  const unlocked = achievements.filter(a => a.unlockedDate).length;
  return Math.floor((unlocked / achievements.length) * 100);
}

/**
 * Get motivational message for achievement unlock
 */
export function getAchievementMessage(achievement: AchievementUnlock): string {
  const categoryMessages: Record<AchievementCategory, string> = {
    starter: 'Great start! Keep building those habits! 🚀',
    consistency: 'Your consistency is inspiring! 💪',
    speed: 'Lightning fast! You\'re unstoppable! ⚡',
    comeback: 'Amazing comeback! Resilience at its finest! 🦸',
    shame: 'Well... at least you\'re honest! 😅',
    special: 'WOW! That\'s truly special! 🌟',
  };

  return `${achievement.message}\n\n${categoryMessages[achievement.category]}`;
}
