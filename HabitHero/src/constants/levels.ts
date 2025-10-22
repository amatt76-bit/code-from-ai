/**
 * Level Definitions
 * XP requirements and level names
 */

export interface LevelInfo {
  level: number;
  name: string;
  emoji: string;
  minXP: number;
  maxXP: number;
  color: string;
}

export const LEVELS: LevelInfo[] = [
  // Beginner (Levels 1-4)
  { level: 1, name: 'Beginner', emoji: '🥉', minXP: 0, maxXP: 99, color: '#95A5A6' },
  { level: 2, name: 'Starter', emoji: '🥉', minXP: 100, maxXP: 249, color: '#95A5A6' },
  { level: 3, name: 'Novice', emoji: '🥉', minXP: 250, maxXP: 499, color: '#3498DB' },
  { level: 4, name: 'Learner', emoji: '🥉', minXP: 500, maxXP: 799, color: '#3498DB' },

  // Committed (Levels 5-9)
  { level: 5, name: 'Committed', emoji: '🥈', minXP: 800, maxXP: 1199, color: '#9B59B6' },
  { level: 6, name: 'Dedicated', emoji: '🥈', minXP: 1200, maxXP: 1799, color: '#9B59B6' },
  { level: 7, name: 'Focused', emoji: '🥈', minXP: 1800, maxXP: 2499, color: '#E67E22' },
  { level: 8, name: 'Driven', emoji: '🥈', minXP: 2500, maxXP: 3299, color: '#E67E22' },
  { level: 9, name: 'Determined', emoji: '🥈', minXP: 3300, maxXP: 4199, color: '#E74C3C' },

  // Unstoppable (Levels 10-14)
  { level: 10, name: 'Unstoppable', emoji: '🥇', minXP: 4200, maxXP: 5199, color: '#E74C3C' },
  { level: 11, name: 'Relentless', emoji: '🥇', minXP: 5200, maxXP: 6299, color: '#E74C3C' },
  { level: 12, name: 'Fierce', emoji: '🥇', minXP: 6300, maxXP: 7499, color: '#E74C3C' },
  { level: 13, name: 'Powerful', emoji: '🥇', minXP: 7500, maxXP: 8799, color: '#F39C12' },
  { level: 14, name: 'Mighty', emoji: '🥇', minXP: 8800, maxXP: 10199, color: '#F39C12' },

  // Master (Levels 15-19)
  { level: 15, name: 'Master', emoji: '💫', minXP: 10200, maxXP: 11699, color: '#F39C12' },
  { level: 16, name: 'Guru', emoji: '💫', minXP: 11700, maxXP: 13299, color: '#F39C12' },
  { level: 17, name: 'Virtuoso', emoji: '💫', minXP: 13300, maxXP: 14999, color: '#FFD700' },
  { level: 18, name: 'Champion', emoji: '💫', minXP: 15000, maxXP: 16799, color: '#FFD700' },
  { level: 19, name: 'Elite', emoji: '💫', minXP: 16800, maxXP: 18699, color: '#FFD700' },

  // Legend (Level 20+)
  { level: 20, name: 'LEGEND', emoji: '💎', minXP: 18700, maxXP: 999999, color: '#FFD700' },
];

/**
 * Get level info for a given XP amount
 */
export function getLevelForXP(xp: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

/**
 * Get XP required for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= LEVELS.length) {
    return LEVELS[LEVELS.length - 1].maxXP;
  }
  return LEVELS[currentLevel].minXP;
}

/**
 * Get XP progress percentage for current level
 */
export function getLevelProgress(xp: number): number {
  const currentLevel = getLevelForXP(xp);
  const levelXP = xp - currentLevel.minXP;
  const levelRange = currentLevel.maxXP - currentLevel.minXP;
  return Math.min(100, (levelXP / levelRange) * 100);
}

/**
 * Check if XP crosses into a new level
 */
export function checkLevelUp(oldXP: number, newXP: number): boolean {
  const oldLevel = getLevelForXP(oldXP);
  const newLevel = getLevelForXP(newXP);
  return newLevel.level > oldLevel.level;
}

/**
 * Get level benefits/unlocks
 */
export const LEVEL_UNLOCKS: Record<number, string[]> = {
  5: ['Custom themes', 'Extra Snooze power-up'],
  7: ['Stealth Mode power-up'],
  10: ['Streak Shield power-up'],
  12: ['Double XP Day power-up'],
  15: ['Bonus Mercy Pass (2 per month)'],
  18: ['Combo Extender power-up'],
  20: ['Prestige option unlocked'],
};

/**
 * Get unlocks for a specific level
 */
export function getUnlocksForLevel(level: number): string[] {
  return LEVEL_UNLOCKS[level] || [];
}
