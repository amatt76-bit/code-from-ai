/**
 * Database Schema
 * SQLite table definitions using OP-SQLite
 */

import { open } from '@op-engineering/op-sqlite';
import type { DB } from '@op-engineering/op-sqlite';

const DB_NAME = 'habit_hero.db';
let db: DB | null = null;

/**
 * Get database instance
 */
export function getDatabase(): DB {
  if (!db) {
    db = open({ name: DB_NAME });
  }
  return db;
}

/**
 * Initialize database - create all tables
 */
export async function initializeDatabase(): Promise<void> {
  const database = getDatabase();

  try {
    // Enable foreign keys
    database.execute('PRAGMA foreign_keys = ON;');

    // Create tables
    await createTables(database);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Create all database tables
 */
async function createTables(database: DB): Promise<void> {
  // Users table
  database.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      level INTEGER NOT NULL DEFAULT 1,
      total_xp INTEGER NOT NULL DEFAULT 0,
      current_combo_streak INTEGER NOT NULL DEFAULT 0,
      combo_multiplier REAL NOT NULL DEFAULT 1.0,
      mercy_passes_remaining INTEGER NOT NULL DEFAULT 1,
      mercy_passes_used_total INTEGER NOT NULL DEFAULT 0,
      prestige_level INTEGER NOT NULL DEFAULT 0,
      created_date TEXT NOT NULL,
      last_active_date TEXT NOT NULL
    );
  `);

  // User settings table
  database.execute(`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY,
      global_personality TEXT NOT NULL DEFAULT 'supportive',
      notifications_enabled INTEGER NOT NULL DEFAULT 1,
      sound_enabled INTEGER NOT NULL DEFAULT 1,
      confetti_enabled INTEGER NOT NULL DEFAULT 1,
      haptic_enabled INTEGER NOT NULL DEFAULT 1,
      dark_mode INTEGER NOT NULL DEFAULT 0,
      theme_color TEXT NOT NULL DEFAULT '#FF6B35',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Habits table
  database.execute(`
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      nickname TEXT,
      emoji TEXT,
      reminder_times TEXT NOT NULL,
      current_streak INTEGER NOT NULL DEFAULT 0,
      best_streak INTEGER NOT NULL DEFAULT 0,
      last_completed_date TEXT,
      created_date TEXT NOT NULL,
      today_status TEXT NOT NULL DEFAULT 'not_done',
      snoozed_until INTEGER,
      snoozes_count INTEGER NOT NULL DEFAULT 0,
      personality TEXT NOT NULL DEFAULT 'supportive',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Create index on user_id for faster queries
  database.execute(`
    CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
  `);

  // Completion history table
  database.execute(`
    CREATE TABLE IF NOT EXISTS completion_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id TEXT NOT NULL,
      date TEXT NOT NULL,
      completed_at TEXT NOT NULL,
      xp_earned INTEGER NOT NULL,
      was_snoozed INTEGER NOT NULL DEFAULT 0,
      mercy_used INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
      UNIQUE(habit_id, date)
    );
  `);

  // Create index for faster date queries
  database.execute(`
    CREATE INDEX IF NOT EXISTS idx_completion_habit_date
    ON completion_history(habit_id, date);
  `);

  // Achievements table
  database.execute(`
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      emoji TEXT NOT NULL,
      category TEXT NOT NULL,
      requirement_type TEXT NOT NULL,
      requirement_target INTEGER NOT NULL,
      requirement_custom_check TEXT,
      unlocked_date TEXT,
      progress INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  database.execute(`
    CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
  `);

  // Daily challenges table
  database.execute(`
    CREATE TABLE IF NOT EXISTS daily_challenges (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      challenge_type TEXT NOT NULL,
      description TEXT NOT NULL,
      xp_reward INTEGER NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, date)
    );
  `);

  database.execute(`
    CREATE INDEX IF NOT EXISTS idx_challenges_user_date
    ON daily_challenges(user_id, date);
  `);

  // Power-ups table
  database.execute(`
    CREATE TABLE IF NOT EXISTS power_ups (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      emoji TEXT NOT NULL,
      unlock_level INTEGER NOT NULL,
      cost_to_activate INTEGER NOT NULL,
      is_unlocked INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 0,
      is_permanent INTEGER NOT NULL DEFAULT 0,
      activated_at TEXT,
      cooldown_ends TEXT,
      uses_remaining INTEGER,
      max_uses INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  database.execute(`
    CREATE INDEX IF NOT EXISTS idx_powerups_user_id ON power_ups(user_id);
  `);

  // Stats tracking table (for weekly stats)
  database.execute(`
    CREATE TABLE IF NOT EXISTS weekly_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      week_start_date TEXT NOT NULL,
      week_end_date TEXT NOT NULL,
      completions INTEGER NOT NULL DEFAULT 0,
      slacker_moments INTEGER NOT NULL DEFAULT 0,
      snoozes INTEGER NOT NULL DEFAULT 0,
      xp_earned INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, week_start_date)
    );
  `);

  // Slacker moments table (track when user hits slacker button)
  database.execute(`
    CREATE TABLE IF NOT EXISTS slacker_moments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
    );
  `);

  database.execute(`
    CREATE INDEX IF NOT EXISTS idx_slacker_habit_id ON slacker_moments(habit_id);
  `);

  // Snooze tracking table
  database.execute(`
    CREATE TABLE IF NOT EXISTS snooze_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
    );
  `);

  database.execute(`
    CREATE INDEX IF NOT EXISTS idx_snooze_habit_id ON snooze_history(habit_id);
  `);
}

/**
 * Drop all tables (for testing/reset)
 */
export async function dropAllTables(): Promise<void> {
  const database = getDatabase();

  const tables = [
    'snooze_history',
    'slacker_moments',
    'weekly_stats',
    'power_ups',
    'daily_challenges',
    'achievements',
    'completion_history',
    'habits',
    'user_settings',
    'users',
  ];

  for (const table of tables) {
    database.execute(`DROP TABLE IF EXISTS ${table};`);
  }

  console.log('✅ All tables dropped');
}

/**
 * Reset database (drop and recreate)
 */
export async function resetDatabase(): Promise<void> {
  await dropAllTables();
  await initializeDatabase();
  console.log('✅ Database reset complete');
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log('✅ Database connection closed');
  }
}
