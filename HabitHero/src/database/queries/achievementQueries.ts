/**
 * Achievement Queries
 * CRUD operations for achievements
 */

import { getDatabase } from '../schema';
import type { Achievement } from '@models/Achievement';
import { ACHIEVEMENTS } from '@constants/achievements';

/**
 * Seed achievements for a user
 */
export function seedAchievements(userId: string): void {
  const db = getDatabase();

  for (const achievement of ACHIEVEMENTS) {
    db.execute(
      `INSERT OR IGNORE INTO achievements (
        id, user_id, name, description, emoji, category,
        requirement_type, requirement_target, requirement_custom_check,
        unlocked_date, progress
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        achievement.id,
        userId,
        achievement.name,
        achievement.description,
        achievement.emoji,
        achievement.category,
        achievement.requirement.type,
        achievement.requirement.target,
        achievement.requirement.customCheck || null,
        null,
        0,
      ]
    );
  }
}

/**
 * Get all achievements for a user
 */
export function getAllAchievements(userId: string): Achievement[] {
  const db = getDatabase();

  const result = db.execute(
    'SELECT * FROM achievements WHERE user_id = ? ORDER BY category, id',
    [userId]
  );

  if (!result.rows || result.rows.length === 0) {
    return [];
  }

  const achievements: Achievement[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    achievements.push(mapRowToAchievement(result.rows.item(i)));
  }

  return achievements;
}

/**
 * Get unlocked achievements
 */
export function getUnlockedAchievements(userId: string): Achievement[] {
  const db = getDatabase();

  const result = db.execute(
    'SELECT * FROM achievements WHERE user_id = ? AND unlocked_date IS NOT NULL ORDER BY unlocked_date DESC',
    [userId]
  );

  if (!result.rows || result.rows.length === 0) {
    return [];
  }

  const achievements: Achievement[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    achievements.push(mapRowToAchievement(result.rows.item(i)));
  }

  return achievements;
}

/**
 * Get locked achievements
 */
export function getLockedAchievements(userId: string): Achievement[] {
  const db = getDatabase();

  const result = db.execute(
    'SELECT * FROM achievements WHERE user_id = ? AND unlocked_date IS NULL ORDER BY category, id',
    [userId]
  );

  if (!result.rows || result.rows.length === 0) {
    return [];
  }

  const achievements: Achievement[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    achievements.push(mapRowToAchievement(result.rows.item(i)));
  }

  return achievements;
}

/**
 * Get achievement by ID
 */
export function getAchievementById(userId: string, achievementId: string): Achievement | null {
  const db = getDatabase();

  const result = db.execute(
    'SELECT * FROM achievements WHERE user_id = ? AND id = ?',
    [userId, achievementId]
  );

  if (!result.rows || result.rows.length === 0) {
    return null;
  }

  return mapRowToAchievement(result.rows.item(0));
}

/**
 * Update achievement progress
 */
export function updateAchievementProgress(
  userId: string,
  achievementId: string,
  progress: number
): void {
  const db = getDatabase();

  db.execute(
    'UPDATE achievements SET progress = ? WHERE user_id = ? AND id = ?',
    [progress, userId, achievementId]
  );
}

/**
 * Unlock achievement
 */
export function unlockAchievement(userId: string, achievementId: string): Achievement | null {
  const db = getDatabase();

  db.execute(
    'UPDATE achievements SET unlocked_date = ?, progress = requirement_target WHERE user_id = ? AND id = ?',
    [new Date().toISOString(), userId, achievementId]
  );

  return getAchievementById(userId, achievementId);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(
  userId: string,
  category: string
): Achievement[] {
  const db = getDatabase();

  const result = db.execute(
    'SELECT * FROM achievements WHERE user_id = ? AND category = ? ORDER BY id',
    [userId, category]
  );

  if (!result.rows || result.rows.length === 0) {
    return [];
  }

  const achievements: Achievement[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    achievements.push(mapRowToAchievement(result.rows.item(i)));
  }

  return achievements;
}

/**
 * Get total unlocked achievements count
 */
export function getUnlockedCount(userId: string): number {
  const db = getDatabase();

  const result = db.execute(
    'SELECT COUNT(*) as count FROM achievements WHERE user_id = ? AND unlocked_date IS NOT NULL',
    [userId]
  );

  if (!result.rows || result.rows.length === 0) {
    return 0;
  }

  return result.rows.item(0).count;
}

/**
 * Helper: Map database row to Achievement
 */
function mapRowToAchievement(row: any): Achievement {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    emoji: row.emoji,
    category: row.category,
    requirement: {
      type: row.requirement_type,
      target: row.requirement_target,
      customCheck: row.requirement_custom_check,
    },
    unlockedDate: row.unlocked_date,
    progress: row.progress,
  };
}
