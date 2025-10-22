/**
 * XP Service
 * Handles XP calculations, rewards, and level progression
 */

import { getLevelForXP, checkLevelUp, type LevelInfo } from '@constants/levels';

/**
 * XP calculation results
 */
export interface XPCalculation {
  baseXP: number;
  bonusXP: number;
  multiplier: number;
  totalXP: number;
  reason: string;
}

/**
 * Level up event
 */
export interface LevelUpEvent {
  oldLevel: number;
  newLevel: number;
  levelInfo: LevelInfo;
  unlocks: string[];
}

/**
 * Base XP rewards
 */
export const BASE_XP = {
  HABIT_COMPLETION: 50,
  DAILY_CHALLENGE_BASE: 100,
  ACHIEVEMENT_UNLOCK: 200,
  STREAK_MILESTONE_3: 25,
  STREAK_MILESTONE_7: 75,
  STREAK_MILESTONE_30: 200,
  STREAK_MILESTONE_100: 500,
  PRESTIGE: 1000,
};

/**
 * Combo multipliers based on consecutive days
 */
export const COMBO_MULTIPLIERS = {
  DEFAULT: 1,
  THREE_DAY: 1.5,
  SEVEN_DAY: 2,
  THIRTY_DAY: 3,
};

/**
 * Calculate combo multiplier based on streak
 */
export function getComboMultiplier(comboStreak: number): number {
  if (comboStreak >= 30) {
    return COMBO_MULTIPLIERS.THIRTY_DAY;
  } else if (comboStreak >= 7) {
    return COMBO_MULTIPLIERS.SEVEN_DAY;
  } else if (comboStreak >= 3) {
    return COMBO_MULTIPLIERS.THREE_DAY;
  }
  return COMBO_MULTIPLIERS.DEFAULT;
}

/**
 * Calculate XP for completing a habit
 */
export function calculateHabitXP(
  habitStreak: number,
  comboStreak: number,
  wasSnoozed: boolean = false
): XPCalculation {
  let baseXP = BASE_XP.HABIT_COMPLETION;
  let bonusXP = 0;
  let reason = 'Habit completed';

  // Penalty for snoozed habits
  if (wasSnoozed) {
    baseXP = Math.floor(baseXP * 0.7); // 30% penalty
    reason = 'Habit completed (snoozed)';
  }

  // Bonus XP for streak milestones
  if (habitStreak === 3) {
    bonusXP += BASE_XP.STREAK_MILESTONE_3;
    reason += ' + 3-day streak milestone!';
  } else if (habitStreak === 7) {
    bonusXP += BASE_XP.STREAK_MILESTONE_7;
    reason += ' + 7-day streak milestone!';
  } else if (habitStreak === 30) {
    bonusXP += BASE_XP.STREAK_MILESTONE_30;
    reason += ' + 30-day streak milestone!';
  } else if (habitStreak === 100) {
    bonusXP += BASE_XP.STREAK_MILESTONE_100;
    reason += ' + 100-day streak milestone!';
  }

  // Apply combo multiplier
  const multiplier = getComboMultiplier(comboStreak);
  const totalXP = Math.floor((baseXP + bonusXP) * multiplier);

  if (multiplier > 1) {
    reason += ` (${multiplier}x combo!)`;
  }

  return {
    baseXP,
    bonusXP,
    multiplier,
    totalXP,
    reason,
  };
}

/**
 * Calculate XP for completing a daily challenge
 */
export function calculateDailyChallengeXP(
  challengeType: string,
  comboStreak: number
): XPCalculation {
  const baseXP = BASE_XP.DAILY_CHALLENGE_BASE;
  const bonusXP = 0;
  const multiplier = getComboMultiplier(comboStreak);
  const totalXP = Math.floor(baseXP * multiplier);

  let reason = `Daily challenge completed: ${challengeType}`;
  if (multiplier > 1) {
    reason += ` (${multiplier}x combo!)`;
  }

  return {
    baseXP,
    bonusXP,
    multiplier,
    totalXP,
    reason,
  };
}

/**
 * Calculate XP for unlocking an achievement
 */
export function calculateAchievementXP(achievementName: string): XPCalculation {
  const baseXP = BASE_XP.ACHIEVEMENT_UNLOCK;
  const bonusXP = 0;
  const multiplier = 1; // Achievements don't get combo multiplier
  const totalXP = baseXP;

  return {
    baseXP,
    bonusXP,
    multiplier,
    totalXP,
    reason: `Achievement unlocked: ${achievementName}`,
  };
}

/**
 * Calculate XP for prestiging
 */
export function calculatePrestigeXP(currentLevel: number): XPCalculation {
  const baseXP = BASE_XP.PRESTIGE;
  const bonusXP = currentLevel * 50; // Bonus based on level reached
  const multiplier = 1;
  const totalXP = baseXP + bonusXP;

  return {
    baseXP,
    bonusXP,
    multiplier,
    totalXP,
    reason: `Prestige bonus (reached level ${currentLevel})`,
  };
}

/**
 * Check if user leveled up and return event
 */
export function checkForLevelUp(oldXP: number, newXP: number): LevelUpEvent | null {
  const didLevelUp = checkLevelUp(oldXP, newXP);

  if (!didLevelUp) {
    return null;
  }

  const oldLevelInfo = getLevelForXP(oldXP);
  const newLevelInfo = getLevelForXP(newXP);

  // Gather all unlocks for levels in between
  const unlocks: string[] = [];
  for (let level = oldLevelInfo.level + 1; level <= newLevelInfo.level; level++) {
    const levelUnlocks = getLevelUnlocksForLevel(level);
    unlocks.push(...levelUnlocks);
  }

  return {
    oldLevel: oldLevelInfo.level,
    newLevel: newLevelInfo.level,
    levelInfo: newLevelInfo,
    unlocks,
  };
}

/**
 * Get unlocks for a specific level
 */
function getLevelUnlocksForLevel(level: number): string[] {
  const LEVEL_UNLOCKS: Record<number, string[]> = {
    5: ['Custom themes', 'Extra Snooze power-up'],
    7: ['Stealth Mode power-up'],
    10: ['Streak Shield power-up'],
    12: ['Double XP Day power-up'],
    15: ['Bonus Mercy Pass (2 per month)'],
    18: ['Combo Extender power-up'],
    20: ['Prestige option unlocked'],
  };

  return LEVEL_UNLOCKS[level] || [];
}

/**
 * Calculate how many habits need to be completed to reach next level
 */
export function calculateHabitsToNextLevel(
  currentXP: number,
  comboStreak: number
): number {
  const currentLevelInfo = getLevelForXP(currentXP);
  const xpNeeded = currentLevelInfo.maxXP - currentXP + 1;
  const xpPerHabit = calculateHabitXP(1, comboStreak, false).totalXP;

  return Math.ceil(xpNeeded / xpPerHabit);
}

/**
 * Get XP summary for display
 */
export function getXPSummary(
  totalXP: number,
  comboStreak: number
): {
  level: number;
  levelName: string;
  emoji: string;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercent: number;
  comboMultiplier: number;
  habitsToNextLevel: number;
} {
  const levelInfo = getLevelForXP(totalXP);
  const currentLevelXP = totalXP - levelInfo.minXP;
  const nextLevelXP = levelInfo.maxXP - levelInfo.minXP + 1;
  const progressPercent = Math.min(100, (currentLevelXP / nextLevelXP) * 100);
  const comboMultiplier = getComboMultiplier(comboStreak);
  const habitsToNextLevel = calculateHabitsToNextLevel(totalXP, comboStreak);

  return {
    level: levelInfo.level,
    levelName: levelInfo.name,
    emoji: levelInfo.emoji,
    currentLevelXP,
    nextLevelXP,
    progressPercent,
    comboMultiplier,
    habitsToNextLevel,
  };
}

/**
 * Validate XP amount (prevent negative or excessive XP)
 */
export function validateXP(xp: number): number {
  if (xp < 0) return 0;
  if (xp > 999999) return 999999;
  return Math.floor(xp);
}

/**
 * Calculate XP decay for missed days (optional feature)
 * Not used in current spec, but useful for future
 */
export function calculateXPDecay(daysMissed: number, currentXP: number): number {
  if (daysMissed <= 0) return 0;

  // 1% decay per day missed, max 10%
  const decayPercent = Math.min(10, daysMissed * 1);
  return Math.floor(currentXP * (decayPercent / 100));
}

/**
 * Format XP amount with suffix (1.2k, 15.5k, etc.)
 */
export function formatXP(xp: number): string {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}k`;
  }
  return xp.toString();
}

/**
 * Get motivational message based on XP earned
 */
export function getXPMotivationalMessage(xpEarned: number): string {
  if (xpEarned >= 300) {
    return 'INCREDIBLE! You\'re on fire! 🔥';
  } else if (xpEarned >= 200) {
    return 'Amazing work! Keep it up! 💪';
  } else if (xpEarned >= 100) {
    return 'Great job! XP earned! 🌟';
  } else if (xpEarned >= 50) {
    return 'Nice! Progress made! ✨';
  }
  return 'XP earned! 💫';
}
