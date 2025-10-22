/**
 * Database Migration System
 * Manages schema versioning and upgrades
 */

import type { DB } from '@op-engineering/op-sqlite';

export interface Migration {
  version: number;
  name: string;
  up: (db: DB) => void;
  down: (db: DB) => void;
}

/**
 * Initialize schema_version table
 */
function initializeVersionTable(db: DB): void {
  db.execute(`
    CREATE TABLE IF NOT EXISTS schema_version (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      version INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Insert initial version if not exists
  const result = db.execute('SELECT version FROM schema_version WHERE id = 1');
  if (!result.rows || result.rows.length === 0) {
    db.execute(
      'INSERT INTO schema_version (id, version, updated_at) VALUES (1, 0, ?)',
      [new Date().toISOString()]
    );
  }
}

/**
 * Get current database schema version
 */
export function getCurrentVersion(db: DB): number {
  initializeVersionTable(db);

  const result = db.execute('SELECT version FROM schema_version WHERE id = 1');
  if (!result.rows || result.rows.length === 0) {
    return 0;
  }

  return result.rows.item(0).version;
}

/**
 * Set database schema version
 */
function setVersion(db: DB, version: number): void {
  db.execute('UPDATE schema_version SET version = ?, updated_at = ? WHERE id = 1', [
    version,
    new Date().toISOString(),
  ]);
}

/**
 * Migration v1: Initial schema
 * Creates all base tables for Habit Hero app
 */
const migration_v1: Migration = {
  version: 1,
  name: 'initial_schema',
  up: (db: DB) => {
    // Users table
    db.execute(`
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
    db.execute(`
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
    db.execute(`
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

    db.execute(`
      CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
    `);

    // Completion history table
    db.execute(`
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

    db.execute(`
      CREATE INDEX IF NOT EXISTS idx_completion_habit_date
      ON completion_history(habit_id, date);
    `);

    // Achievements table
    db.execute(`
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

    db.execute(`
      CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
    `);

    // Daily challenges table
    db.execute(`
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

    db.execute(`
      CREATE INDEX IF NOT EXISTS idx_challenges_user_date
      ON daily_challenges(user_id, date);
    `);

    // Power-ups table
    db.execute(`
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

    db.execute(`
      CREATE INDEX IF NOT EXISTS idx_powerups_user_id ON power_ups(user_id);
    `);

    // Weekly stats table
    db.execute(`
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

    // Slacker moments table
    db.execute(`
      CREATE TABLE IF NOT EXISTS slacker_moments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
      );
    `);

    db.execute(`
      CREATE INDEX IF NOT EXISTS idx_slacker_habit_id ON slacker_moments(habit_id);
    `);

    // Snooze history table
    db.execute(`
      CREATE TABLE IF NOT EXISTS snooze_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
      );
    `);

    db.execute(`
      CREATE INDEX IF NOT EXISTS idx_snooze_habit_id ON snooze_history(habit_id);
    `);
  },
  down: (db: DB) => {
    // Drop all tables in reverse order (respecting foreign keys)
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
      db.execute(`DROP TABLE IF EXISTS ${table};`);
    }
  },
};

/**
 * All migrations in order
 * Add new migrations to the end of this array
 */
export const migrations: Migration[] = [
  migration_v1,
  // Future migrations go here
  // migration_v2,
  // migration_v3,
  // etc.
];

/**
 * Run pending migrations
 */
export function runMigrations(db: DB): void {
  // Enable foreign keys
  db.execute('PRAGMA foreign_keys = ON;');

  const currentVersion = getCurrentVersion(db);
  const targetVersion = migrations.length;

  if (currentVersion === targetVersion) {
    console.log(`✓ Database already at latest version (v${currentVersion})`);
    return;
  }

  console.log(`📊 Current database version: v${currentVersion}`);
  console.log(`🎯 Target database version: v${targetVersion}`);

  // Run migrations sequentially
  for (let i = currentVersion; i < targetVersion; i++) {
    const migration = migrations[i];
    console.log(`⬆️  Running migration v${migration.version}: ${migration.name}`);

    try {
      db.execute('BEGIN TRANSACTION');
      migration.up(db);
      setVersion(db, migration.version);
      db.execute('COMMIT');
      console.log(`✅ Migration v${migration.version} completed`);
    } catch (error) {
      db.execute('ROLLBACK');
      console.error(`❌ Migration v${migration.version} failed:`, error);
      throw new Error(`Migration v${migration.version} failed: ${error}`);
    }
  }

  console.log(`✅ All migrations completed. Database now at v${targetVersion}`);
}

/**
 * Rollback to a specific version
 * WARNING: This will destroy data!
 */
export function rollbackToVersion(db: DB, targetVersion: number): void {
  const currentVersion = getCurrentVersion(db);

  if (targetVersion >= currentVersion) {
    console.log('Target version is same or higher than current version. Nothing to do.');
    return;
  }

  if (targetVersion < 0 || targetVersion > migrations.length) {
    throw new Error(`Invalid target version: ${targetVersion}`);
  }

  console.log(`⬇️  Rolling back from v${currentVersion} to v${targetVersion}`);

  // Run down migrations in reverse order
  for (let i = currentVersion - 1; i >= targetVersion; i--) {
    const migration = migrations[i];
    console.log(`⬇️  Rolling back migration v${migration.version}: ${migration.name}`);

    try {
      db.execute('BEGIN TRANSACTION');
      migration.down(db);
      setVersion(db, i);
      db.execute('COMMIT');
      console.log(`✅ Rollback v${migration.version} completed`);
    } catch (error) {
      db.execute('ROLLBACK');
      console.error(`❌ Rollback v${migration.version} failed:`, error);
      throw new Error(`Rollback v${migration.version} failed: ${error}`);
    }
  }

  console.log(`✅ Rollback completed. Database now at v${targetVersion}`);
}

/**
 * Get migration info
 */
export function getMigrationInfo(db: DB): {
  currentVersion: number;
  latestVersion: number;
  pendingMigrations: string[];
} {
  const currentVersion = getCurrentVersion(db);
  const latestVersion = migrations.length;
  const pendingMigrations: string[] = [];

  for (let i = currentVersion; i < latestVersion; i++) {
    pendingMigrations.push(`v${migrations[i].version}: ${migrations[i].name}`);
  }

  return {
    currentVersion,
    latestVersion,
    pendingMigrations,
  };
}
