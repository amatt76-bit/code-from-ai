/**
 * Habit Queries
 * CRUD operations for habits
 */

import { getDatabase } from '../schema';
import type { Habit, CreateHabitInput, UpdateHabitInput, CompletionRecord } from '@models/Habit';
import { v4 as uuidv4 } from 'react-native-uuid';

/**
 * Create a new habit
 */
export function createHabit(userId: string, input: CreateHabitInput): Habit {
  const db = getDatabase();
  const habitId = uuidv4() as string;
  const now = new Date().toISOString();

  db.execute(
    `INSERT INTO habits (
      id, user_id, name, nickname, emoji, reminder_times,
      current_streak, best_streak, created_date, today_status, personality
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      habitId,
      userId,
      input.name,
      input.nickname || null,
      input.emoji || null,
      JSON.stringify(input.reminderTimes),
      0,
      0,
      now,
      'not_done',
      input.personality || 'supportive',
    ]
  );

  const habit = getHabitById(habitId);
  if (!habit) {
    throw new Error('Failed to create habit');
  }

  return habit;
}

/**
 * Get habit by ID
 */
export function getHabitById(habitId: string): Habit | null {
  const db = getDatabase();

  const result = db.execute('SELECT * FROM habits WHERE id = ?', [habitId]);

  if (!result.rows || result.rows.length === 0) {
    return null;
  }

  const row = result.rows.item(0);
  return mapRowToHabit(row);
}

/**
 * Get all habits for a user
 */
export function getAllHabits(userId: string): Habit[] {
  const db = getDatabase();

  const result = db.execute(
    'SELECT * FROM habits WHERE user_id = ? ORDER BY created_date ASC',
    [userId]
  );

  if (!result.rows || result.rows.length === 0) {
    return [];
  }

  const habits: Habit[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    habits.push(mapRowToHabit(result.rows.item(i)));
  }

  return habits;
}

/**
 * Update habit
 */
export function updateHabit(input: UpdateHabitInput): Habit {
  const db = getDatabase();

  const updates: string[] = [];
  const values: any[] = [];

  if (input.name !== undefined) {
    updates.push('name = ?');
    values.push(input.name);
  }
  if (input.nickname !== undefined) {
    updates.push('nickname = ?');
    values.push(input.nickname);
  }
  if (input.emoji !== undefined) {
    updates.push('emoji = ?');
    values.push(input.emoji);
  }
  if (input.reminderTimes !== undefined) {
    updates.push('reminder_times = ?');
    values.push(JSON.stringify(input.reminderTimes));
  }
  if (input.personality !== undefined) {
    updates.push('personality = ?');
    values.push(input.personality);
  }

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(input.id);

  db.execute(`UPDATE habits SET ${updates.join(', ')} WHERE id = ?`, values);

  const habit = getHabitById(input.id);
  if (!habit) {
    throw new Error('Habit not found after update');
  }

  return habit;
}

/**
 * Delete habit
 */
export function deleteHabit(habitId: string): void {
  const db = getDatabase();
  db.execute('DELETE FROM habits WHERE id = ?', [habitId]);
}

/**
 * Mark habit as completed
 */
export function completeHabit(habitId: string, xpEarned: number): void {
  const db = getDatabase();
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timestampStr = now.toISOString();

  const habit = getHabitById(habitId);
  if (!habit) {
    throw new Error('Habit not found');
  }

  // Update habit status
  db.execute(
    `UPDATE habits SET
      today_status = 'completed',
      last_completed_date = ?,
      snoozed_until = NULL,
      snoozes_count = 0
    WHERE id = ?`,
    [dateStr, habitId]
  );

  // Calculate new streak
  const newStreak = calculateNewStreak(habit, dateStr);

  db.execute(
    `UPDATE habits SET
      current_streak = ?,
      best_streak = MAX(best_streak, ?)
    WHERE id = ?`,
    [newStreak, newStreak, habitId]
  );

  // Add to completion history
  db.execute(
    `INSERT OR REPLACE INTO completion_history
    (habit_id, date, completed_at, xp_earned, was_snoozed, mercy_used)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [habitId, dateStr, timestampStr, xpEarned, habit.snoozesCount > 0 ? 1 : 0, 0]
  );
}

/**
 * Snooze habit
 */
export function snoozeHabit(habitId: string, durationMinutes: number): void {
  const db = getDatabase();
  const snoozedUntil = Date.now() + durationMinutes * 60 * 1000;

  db.execute(
    `UPDATE habits SET
      today_status = 'snoozed',
      snoozed_until = ?,
      snoozes_count = snoozes_count + 1
    WHERE id = ?`,
    [snoozedUntil, habitId]
  );

  // Track snooze
  db.execute(
    'INSERT INTO snooze_history (habit_id, timestamp, duration_minutes) VALUES (?, ?, ?)',
    [habitId, new Date().toISOString(), durationMinutes]
  );
}

/**
 * Record slacker moment
 */
export function recordSlackerMoment(habitId: string): void {
  const db = getDatabase();
  db.execute('INSERT INTO slacker_moments (habit_id, timestamp) VALUES (?, ?)', [
    habitId,
    new Date().toISOString(),
  ]);
}

/**
 * Get completion history for a habit
 */
export function getCompletionHistory(habitId: string, limit = 30): CompletionRecord[] {
  const db = getDatabase();

  const result = db.execute(
    `SELECT * FROM completion_history
    WHERE habit_id = ?
    ORDER BY date DESC
    LIMIT ?`,
    [habitId, limit]
  );

  if (!result.rows || result.rows.length === 0) {
    return [];
  }

  const history: CompletionRecord[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    const row = result.rows.item(i);
    history.push({
      date: row.date,
      completedAt: row.completed_at,
      xpEarned: row.xp_earned,
      wasSnoozed: row.was_snoozed === 1,
      mercyUsed: row.mercy_used === 1,
    });
  }

  return history;
}

/**
 * Reset daily status for all habits (called at midnight)
 */
export function resetDailyHabitStatus(userId: string): void {
  const db = getDatabase();

  db.execute(
    `UPDATE habits SET
      today_status = 'not_done',
      snoozed_until = NULL,
      snoozes_count = 0
    WHERE user_id = ?`,
    [userId]
  );
}

/**
 * Break streak for habit (when not completed by midnight)
 */
export function breakStreak(habitId: string): void {
  const db = getDatabase();

  db.execute('UPDATE habits SET current_streak = 0 WHERE id = ?', [habitId]);
}

/**
 * Use mercy pass to save a streak
 */
export function useMercyPass(habitId: string): void {
  const db = getDatabase();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];

  // Add mercy pass entry to completion history
  db.execute(
    `INSERT INTO completion_history
    (habit_id, date, completed_at, xp_earned, was_snoozed, mercy_used)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [habitId, dateStr, new Date().toISOString(), 0, 0, 1]
  );

  // Streak is already intact, no need to update
}

/**
 * Get total snoozes for a habit
 */
export function getTotalSnoozes(habitId: string): number {
  const db = getDatabase();

  const result = db.execute(
    'SELECT COUNT(*) as count FROM snooze_history WHERE habit_id = ?',
    [habitId]
  );

  if (!result.rows || result.rows.length === 0) {
    return 0;
  }

  return result.rows.item(0).count;
}

/**
 * Get total slacker moments for a habit
 */
export function getTotalSlackerMoments(habitId: string): number {
  const db = getDatabase();

  const result = db.execute(
    'SELECT COUNT(*) as count FROM slacker_moments WHERE habit_id = ?',
    [habitId]
  );

  if (!result.rows || result.rows.length === 0) {
    return 0;
  }

  return result.rows.item(0).count;
}

/**
 * Helper: Calculate new streak based on last completion date
 */
function calculateNewStreak(habit: Habit, todayDateStr: string): number {
  if (!habit.lastCompletedDate) {
    return 1; // First completion
  }

  const lastDate = new Date(habit.lastCompletedDate);
  const today = new Date(todayDateStr);

  const diffTime = today.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Consecutive day
    return habit.currentStreak + 1;
  } else if (diffDays === 0) {
    // Same day (already completed)
    return habit.currentStreak;
  } else {
    // Streak broken
    return 1;
  }
}

/**
 * Helper: Map database row to Habit model
 */
function mapRowToHabit(row: any): Habit {
  return {
    id: row.id,
    name: row.name,
    nickname: row.nickname,
    emoji: row.emoji,
    reminderTimes: JSON.parse(row.reminder_times),
    currentStreak: row.current_streak,
    bestStreak: row.best_streak,
    lastCompletedDate: row.last_completed_date,
    createdDate: row.created_date,
    todayStatus: row.today_status,
    snoozedUntil: row.snoozed_until,
    snoozesCount: row.snoozes_count,
    personality: row.personality,
    completionHistory: [], // Lazy load when needed
  };
}
