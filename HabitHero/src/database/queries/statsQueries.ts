/**
 * Stats Queries
 * Queries for user statistics and analytics
 */

import { getDatabase } from '../schema';
import type { WeeklyStats, AllTimeStats } from '@models/Stats';

/**
 * Get weekly stats for current week
 */
export function getCurrentWeekStats(userId: string): WeeklyStats {
  const db = getDatabase();
  const { weekStart, weekEnd } = getCurrentWeekDates();

  const result = db.execute(
    `SELECT * FROM weekly_stats
    WHERE user_id = ? AND week_start_date = ?`,
    [userId, weekStart]
  );

  if (!result.rows || result.rows.length === 0) {
    // Create new week entry
    return createWeeklyStats(userId, weekStart, weekEnd);
  }

  const row = result.rows.item(0);
  return {
    weeklyCompletions: row.completions,
    weeklySlackerMoments: row.slacker_moments,
    weeklySnoozes: row.snoozes,
    weeklyXP: row.xp_earned,
    weekStartDate: row.week_start_date,
    weekEndDate: row.week_end_date,
  };
}

/**
 * Update weekly stats
 */
export function updateWeeklyStats(userId: string, updates: Partial<WeeklyStats>): void {
  const db = getDatabase();
  const { weekStart } = getCurrentWeekDates();

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.weeklyCompletions !== undefined) {
    fields.push('completions = completions + ?');
    values.push(updates.weeklyCompletions);
  }
  if (updates.weeklySlackerMoments !== undefined) {
    fields.push('slacker_moments = slacker_moments + ?');
    values.push(updates.weeklySlackerMoments);
  }
  if (updates.weeklySnoozes !== undefined) {
    fields.push('snoozes = snoozes + ?');
    values.push(updates.weeklySnoozes);
  }
  if (updates.weeklyXP !== undefined) {
    fields.push('xp_earned = xp_earned + ?');
    values.push(updates.weeklyXP);
  }

  if (fields.length > 0) {
    values.push(userId, weekStart);
    db.execute(
      `UPDATE weekly_stats SET ${fields.join(', ')}
      WHERE user_id = ? AND week_start_date = ?`,
      values
    );
  }
}

/**
 * Get all-time stats
 */
export function getAllTimeStats(userId: string): AllTimeStats {
  const db = getDatabase();

  // Total completions
  const completions = db.execute(
    'SELECT COUNT(*) as count FROM completion_history ch JOIN habits h ON ch.habit_id = h.id WHERE h.user_id = ?',
    [userId]
  );
  const totalCompletions = completions.rows?.item(0).count || 0;

  // Total slacker moments
  const slacker = db.execute(
    'SELECT COUNT(*) as count FROM slacker_moments sm JOIN habits h ON sm.habit_id = h.id WHERE h.user_id = ?',
    [userId]
  );
  const totalSlackerMoments = slacker.rows?.item(0).count || 0;

  // Total snoozes
  const snoozes = db.execute(
    'SELECT COUNT(*) as count FROM snooze_history sh JOIN habits h ON sh.habit_id = h.id WHERE h.user_id = ?',
    [userId]
  );
  const totalSnoozes = snoozes.rows?.item(0).count || 0;

  // Total XP from completion history
  const xp = db.execute(
    'SELECT SUM(xp_earned) as total FROM completion_history ch JOIN habits h ON ch.habit_id = h.id WHERE h.user_id = ?',
    [userId]
  );
  const totalXP = xp.rows?.item(0).total || 0;

  // Longest streak
  const streak = db.execute(
    'SELECT MAX(best_streak) as max FROM habits WHERE user_id = ?',
    [userId]
  );
  const longestStreakOverall = streak.rows?.item(0).max || 0;

  // Total mercy used
  const mercy = db.execute(
    'SELECT mercy_passes_used_total FROM users WHERE id = ?',
    [userId]
  );
  const totalMercyUsed = mercy.rows?.item(0).mercy_passes_used_total || 0;

  // Achievements unlocked
  const achievements = db.execute(
    'SELECT COUNT(*) as count FROM achievements WHERE user_id = ? AND unlocked_date IS NOT NULL',
    [userId]
  );
  const achievementsUnlocked = achievements.rows?.item(0).count || 0;

  // Days using app
  const user = db.execute('SELECT created_date FROM users WHERE id = ?', [userId]);
  const createdDate = user.rows?.item(0).created_date || new Date().toISOString();
  const daysUsingApp = Math.floor(
    (Date.now() - new Date(createdDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    totalCompletions,
    totalSlackerMoments,
    totalSnoozes,
    totalXP,
    longestStreakOverall,
    totalMercyUsed,
    achievementsUnlocked,
    daysUsingApp,
    firstUseDate: createdDate,
  };
}

/**
 * Helper: Create new weekly stats entry
 */
function createWeeklyStats(userId: string, weekStart: string, weekEnd: string): WeeklyStats {
  const db = getDatabase();

  db.execute(
    `INSERT INTO weekly_stats (user_id, week_start_date, week_end_date, completions, slacker_moments, snoozes, xp_earned)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, weekStart, weekEnd, 0, 0, 0, 0]
  );

  return {
    weeklyCompletions: 0,
    weeklySlackerMoments: 0,
    weeklySnoozes: 0,
    weeklyXP: 0,
    weekStartDate: weekStart,
    weekEndDate: weekEnd,
  };
}

/**
 * Helper: Get current week start and end dates
 */
function getCurrentWeekDates(): { weekStart: string; weekEnd: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday as first day

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return {
    weekStart: weekStart.toISOString().split('T')[0],
    weekEnd: weekEnd.toISOString().split('T')[0],
  };
}
