/**
 * User Queries
 * CRUD operations for user profile
 */

import { getDatabase } from '../schema';
import type { UserProfile, UserSettings } from '@models/User';
import { DEFAULT_USER_SETTINGS } from '@models/User';
import { v4 as uuidv4 } from 'react-native-uuid';

/**
 * Create a new user profile
 */
export function createUser(username: string): UserProfile {
  const db = getDatabase();
  const userId = uuidv4() as string;
  const now = new Date().toISOString();

  // Create user
  db.execute(
    `INSERT INTO users (
      id, username, level, total_xp, current_combo_streak,
      combo_multiplier, mercy_passes_remaining, mercy_passes_used_total,
      prestige_level, created_date, last_active_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, username, 1, 0, 0, 1.0, 1, 0, 0, now, now]
  );

  // Create user settings
  db.execute(
    `INSERT INTO user_settings (
      user_id, global_personality, notifications_enabled, sound_enabled,
      confetti_enabled, haptic_enabled, dark_mode, theme_color
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      DEFAULT_USER_SETTINGS.globalPersonality,
      DEFAULT_USER_SETTINGS.notificationsEnabled ? 1 : 0,
      DEFAULT_USER_SETTINGS.soundEnabled ? 1 : 0,
      DEFAULT_USER_SETTINGS.confettiEnabled ? 1 : 0,
      DEFAULT_USER_SETTINGS.hapticEnabled ? 1 : 0,
      DEFAULT_USER_SETTINGS.darkMode ? 1 : 0,
      DEFAULT_USER_SETTINGS.themeColor,
    ]
  );

  const user = getUserById(userId);
  if (!user) {
    throw new Error('Failed to create user');
  }

  return user;
}

/**
 * Get user by ID
 */
export function getUserById(userId: string): UserProfile | null {
  const db = getDatabase();

  const result = db.execute(
    `SELECT u.*, s.*
    FROM users u
    LEFT JOIN user_settings s ON u.id = s.user_id
    WHERE u.id = ?`,
    [userId]
  );

  if (!result.rows || result.rows.length === 0) {
    return null;
  }

  return mapRowToUserProfile(result.rows.item(0));
}

/**
 * Get the first user (for single-user app)
 */
export function getMainUser(): UserProfile | null {
  const db = getDatabase();

  const result = db.execute(
    `SELECT u.*, s.*
    FROM users u
    LEFT JOIN user_settings s ON u.id = s.user_id
    LIMIT 1`
  );

  if (!result.rows || result.rows.length === 0) {
    return null;
  }

  return mapRowToUserProfile(result.rows.item(0));
}

/**
 * Update user profile
 */
export function updateUser(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'settings' | 'createdDate'>>
): UserProfile {
  const db = getDatabase();

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.username !== undefined) {
    fields.push('username = ?');
    values.push(updates.username);
  }
  if (updates.level !== undefined) {
    fields.push('level = ?');
    values.push(updates.level);
  }
  if (updates.totalXP !== undefined) {
    fields.push('total_xp = ?');
    values.push(updates.totalXP);
  }
  if (updates.currentComboStreak !== undefined) {
    fields.push('current_combo_streak = ?');
    values.push(updates.currentComboStreak);
  }
  if (updates.comboMultiplier !== undefined) {
    fields.push('combo_multiplier = ?');
    values.push(updates.comboMultiplier);
  }
  if (updates.mercyPassesRemaining !== undefined) {
    fields.push('mercy_passes_remaining = ?');
    values.push(updates.mercyPassesRemaining);
  }
  if (updates.mercyPassesUsedTotal !== undefined) {
    fields.push('mercy_passes_used_total = ?');
    values.push(updates.mercyPassesUsedTotal);
  }
  if (updates.prestigeLevel !== undefined) {
    fields.push('prestige_level = ?');
    values.push(updates.prestigeLevel);
  }

  // Always update last active date
  fields.push('last_active_date = ?');
  values.push(new Date().toISOString());

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(userId);

  db.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

  const user = getUserById(userId);
  if (!user) {
    throw new Error('User not found after update');
  }

  return user;
}

/**
 * Update user settings
 */
export function updateUserSettings(userId: string, settings: Partial<UserSettings>): UserProfile {
  const db = getDatabase();

  const fields: string[] = [];
  const values: any[] = [];

  if (settings.globalPersonality !== undefined) {
    fields.push('global_personality = ?');
    values.push(settings.globalPersonality);
  }
  if (settings.notificationsEnabled !== undefined) {
    fields.push('notifications_enabled = ?');
    values.push(settings.notificationsEnabled ? 1 : 0);
  }
  if (settings.soundEnabled !== undefined) {
    fields.push('sound_enabled = ?');
    values.push(settings.soundEnabled ? 1 : 0);
  }
  if (settings.confettiEnabled !== undefined) {
    fields.push('confetti_enabled = ?');
    values.push(settings.confettiEnabled ? 1 : 0);
  }
  if (settings.hapticEnabled !== undefined) {
    fields.push('haptic_enabled = ?');
    values.push(settings.hapticEnabled ? 1 : 0);
  }
  if (settings.darkMode !== undefined) {
    fields.push('dark_mode = ?');
    values.push(settings.darkMode ? 1 : 0);
  }
  if (settings.themeColor !== undefined) {
    fields.push('theme_color = ?');
    values.push(settings.themeColor);
  }

  if (fields.length === 0) {
    throw new Error('No settings to update');
  }

  values.push(userId);

  db.execute(`UPDATE user_settings SET ${fields.join(', ')} WHERE user_id = ?`, values);

  const user = getUserById(userId);
  if (!user) {
    throw new Error('User not found after settings update');
  }

  return user;
}

/**
 * Add XP to user
 */
export function addXP(userId: string, xpToAdd: number): { newXP: number; leveledUp: boolean } {
  const db = getDatabase();

  const user = getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const newXP = user.totalXP + xpToAdd;

  // Calculate new level (simple formula for now)
  const oldLevel = user.level;
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel > oldLevel;

  db.execute(
    'UPDATE users SET total_xp = ?, level = ? WHERE id = ?',
    [newXP, newLevel, userId]
  );

  return { newXP, leveledUp };
}

/**
 * Deduct XP from user (for slacker moments)
 */
export function deductXP(userId: string, xpToDeduct: number): number {
  const db = getDatabase();

  const user = getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const newXP = Math.max(0, user.totalXP - xpToDeduct);

  db.execute('UPDATE users SET total_xp = ? WHERE id = ?', [newXP, userId]);

  return newXP;
}

/**
 * Use a mercy pass
 */
export function useMercyPass(userId: string): void {
  const db = getDatabase();

  db.execute(
    `UPDATE users SET
      mercy_passes_remaining = mercy_passes_remaining - 1,
      mercy_passes_used_total = mercy_passes_used_total + 1
    WHERE id = ? AND mercy_passes_remaining > 0`,
    [userId]
  );
}

/**
 * Reset monthly mercy passes (called on 1st of each month)
 */
export function resetMercyPasses(userId: string): void {
  const db = getDatabase();

  const user = getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Check if user has bonus mercy pass power-up (Level 15+)
  const passCount = user.level >= 15 ? 2 : 1;

  db.execute('UPDATE users SET mercy_passes_remaining = ? WHERE id = ?', [passCount, userId]);
}

/**
 * Update combo streak and multiplier
 */
export function updateComboStreak(userId: string, allHabitsCompleted: boolean): void {
  const db = getDatabase();

  const user = getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  let newStreak = 0;
  let newMultiplier = 1.0;

  if (allHabitsCompleted) {
    newStreak = user.currentComboStreak + 1;

    // Calculate multiplier
    if (newStreak >= 30) {
      newMultiplier = 3.0;
    } else if (newStreak >= 7) {
      newMultiplier = 2.0;
    } else if (newStreak >= 3) {
      newMultiplier = 1.5;
    } else {
      newMultiplier = 1.0;
    }
  } else {
    newStreak = 0;
    newMultiplier = 1.0;
  }

  db.execute(
    'UPDATE users SET current_combo_streak = ?, combo_multiplier = ? WHERE id = ?',
    [newStreak, newMultiplier, userId]
  );
}

/**
 * Prestige (reset to level 1 but keep bonuses)
 */
export function prestigeUser(userId: string): void {
  const db = getDatabase();

  const user = getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.level < 20) {
    throw new Error('Must be level 20 to prestige');
  }

  db.execute(
    `UPDATE users SET
      level = 1,
      total_xp = 0,
      prestige_level = prestige_level + 1
    WHERE id = ?`,
    [userId]
  );
}

/**
 * Helper: Calculate level from XP
 */
function calculateLevel(xp: number): number {
  const levels = [
    0, 100, 250, 500, 800, 1200, 1800, 2500, 3300, 4200, 5200, 6300, 7500, 8800, 10200, 11700,
    13300, 15000, 16800, 18700,
  ];

  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i]) {
      return i + 1;
    }
  }

  return 1;
}

/**
 * Helper: Map database row to UserProfile
 */
function mapRowToUserProfile(row: any): UserProfile {
  return {
    id: row.id,
    username: row.username,
    level: row.level,
    totalXP: row.total_xp,
    currentComboStreak: row.current_combo_streak,
    comboMultiplier: row.combo_multiplier,
    mercyPassesRemaining: row.mercy_passes_remaining,
    mercyPassesUsedTotal: row.mercy_passes_used_total,
    prestigeLevel: row.prestige_level,
    createdDate: row.created_date,
    lastActiveDate: row.last_active_date,
    settings: {
      globalPersonality: row.global_personality,
      notificationsEnabled: row.notifications_enabled === 1,
      soundEnabled: row.sound_enabled === 1,
      confettiEnabled: row.confetti_enabled === 1,
      hapticEnabled: row.haptic_enabled === 1,
      darkMode: row.dark_mode === 1,
      themeColor: row.theme_color,
    },
  };
}
