# Database Migration System

The Habit Hero app uses a migration-based database schema management system to ensure safe and versioned database upgrades.

## Overview

- **Migration Version Tracking**: A `schema_version` table tracks the current database version
- **Sequential Migrations**: Migrations run in order from current version to latest
- **Transaction Safety**: Each migration runs in a transaction with rollback on error
- **Rollback Support**: Migrations can be rolled back to previous versions (destroys data!)

## Current Schema Version

- **v1**: Initial schema with all base tables (users, habits, achievements, etc.)

## How It Works

### Automatic Migration on App Start

When the app starts, `initializeDatabase()` automatically:

1. Checks the current database version
2. Runs any pending migrations sequentially
3. Updates the version number after each successful migration

```typescript
// In App.tsx
await initializeDatabase(); // Automatically runs migrations
```

### Migration Structure

Each migration has:

```typescript
interface Migration {
  version: number;        // Sequential version number (1, 2, 3, ...)
  name: string;           // Descriptive name (e.g., 'add_habit_tags')
  up: (db: DB) => void;   // Apply the migration
  down: (db: DB) => void; // Rollback the migration
}
```

## Creating a New Migration

### Step 1: Define the Migration

Add a new migration to `src/database/migrations.ts`:

```typescript
const migration_v2: Migration = {
  version: 2,
  name: 'add_habit_tags',
  up: (db: DB) => {
    // Create new table
    db.execute(`
      CREATE TABLE habit_tags (
        id TEXT PRIMARY KEY,
        habit_id TEXT NOT NULL,
        tag_name TEXT NOT NULL,
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
      );
    `);

    // Add index
    db.execute(`
      CREATE INDEX idx_tags_habit_id ON habit_tags(habit_id);
    `);
  },
  down: (db: DB) => {
    // Rollback: drop the table
    db.execute('DROP TABLE IF EXISTS habit_tags;');
  },
};
```

### Step 2: Add to Migrations Array

Add your migration to the `migrations` array:

```typescript
export const migrations: Migration[] = [
  migration_v1,
  migration_v2,  // Add new migration here
  // Future migrations...
];
```

### Step 3: Test Migration

Test your migration:

```typescript
import { getDatabaseInfo } from '@database/schema';

// Check current version
const info = getDatabaseInfo();
console.log(`Current: v${info.currentVersion}`);
console.log(`Latest: v${info.latestVersion}`);
console.log('Pending:', info.pendingMigrations);

// Migration runs automatically on next app start
```

## Migration Best Practices

### DO:

✅ **Always add migrations sequentially** (v1, v2, v3, ...)
✅ **Test both `up` and `down` functions**
✅ **Use transactions for complex changes**
✅ **Add descriptive names** ('add_user_avatar', not 'update_schema')
✅ **Include indexes in migrations**
✅ **Keep migrations small and focused**

### DON'T:

❌ **Skip version numbers** (don't jump from v2 to v5)
❌ **Modify existing migrations** (create a new one instead)
❌ **Delete old migrations** (they're part of the upgrade path)
❌ **Use `down()` in production** (data loss!)
❌ **Forget foreign keys and constraints**

## Common Migration Patterns

### Adding a Column

```typescript
up: (db: DB) => {
  db.execute('ALTER TABLE habits ADD COLUMN color TEXT DEFAULT "#FF6B35"');
},
down: (db: DB) => {
  // SQLite doesn't support DROP COLUMN easily
  // May need to recreate table
}
```

### Creating a Table

```typescript
up: (db: DB) => {
  db.execute(`
    CREATE TABLE habit_notes (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      note TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
    );
  `);
},
down: (db: DB) => {
  db.execute('DROP TABLE IF EXISTS habit_notes;');
}
```

### Adding an Index

```typescript
up: (db: DB) => {
  db.execute('CREATE INDEX idx_habits_status ON habits(today_status);');
},
down: (db: DB) => {
  db.execute('DROP INDEX IF EXISTS idx_habits_status;');
}
```

### Data Migration

```typescript
up: (db: DB) => {
  // Add column
  db.execute('ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT "UTC"');

  // Migrate existing data
  db.execute(`
    UPDATE users
    SET timezone = 'America/New_York'
    WHERE timezone IS NULL
  `);
},
down: (db: DB) => {
  // Requires table recreation in SQLite
}
```

## Rollback (Development Only)

⚠️ **WARNING**: Rollback destroys data! Only use in development.

```typescript
import { getDatabase } from '@database/schema';
import { rollbackToVersion } from '@database/migrations';

const db = getDatabase();
rollbackToVersion(db, 1); // Rollback to version 1
```

## Migration Logs

Migrations output detailed logs:

```
📊 Current database version: v1
🎯 Target database version: v3
⬆️  Running migration v2: add_habit_tags
✅ Migration v2 completed
⬆️  Running migration v3: add_user_preferences
✅ Migration v3 completed
✅ All migrations completed. Database now at v3
```

## Troubleshooting

### Migration Failed

If a migration fails:

1. **Check the error logs** - transaction rolled back automatically
2. **Fix the migration code** in `migrations.ts`
3. **Restart the app** - migration will retry

### Database Corruption

If database is corrupted:

```typescript
import { resetDatabase } from '@database/schema';

// ⚠️ WARNING: Destroys all data!
await resetDatabase();
```

### Check Version Manually

```typescript
import { getDatabase } from '@database/schema';
import { getCurrentVersion } from '@database/migrations';

const db = getDatabase();
const version = getCurrentVersion(db);
console.log(`Database is at v${version}`);
```

## Production Deployment

### Pre-Deployment Checklist

- [ ] All migrations tested locally
- [ ] Both `up` and `down` functions work
- [ ] Migrations handle existing data safely
- [ ] No data loss scenarios
- [ ] Migration logs reviewed
- [ ] Database backup available (if possible)

### Deployment Process

1. **App update released** with new migrations
2. **User opens app** for first time
3. **Migrations run automatically** on startup
4. **User data preserved** throughout upgrade

### Handling Large Migrations

For migrations affecting millions of rows:

```typescript
up: (db: DB) => {
  // Process in batches to avoid blocking
  db.execute('CREATE INDEX CONCURRENTLY ...'); // If supported

  // Or use background processing after migration
}
```

## Example: Full Migration Lifecycle

```typescript
// migrations.ts

const migration_v2: Migration = {
  version: 2,
  name: 'add_habit_categories',
  up: (db: DB) => {
    // 1. Create new table
    db.execute(`
      CREATE TABLE habit_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL,
        emoji TEXT
      );
    `);

    // 2. Add foreign key to habits
    db.execute('ALTER TABLE habits ADD COLUMN category_id TEXT');

    // 3. Add index
    db.execute('CREATE INDEX idx_habits_category ON habits(category_id);');

    // 4. Create default categories
    db.execute(`
      INSERT INTO habit_categories (id, name, color, emoji) VALUES
      ('cat-1', 'Health', '#4ECDC4', '💪'),
      ('cat-2', 'Learning', '#FFD23F', '📚'),
      ('cat-3', 'Productivity', '#FF6B35', '⚡')
    `);
  },
  down: (db: DB) => {
    db.execute('DROP TABLE IF EXISTS habit_categories;');
    // Note: Can't easily remove column in SQLite
    // Would need to recreate habits table
  },
};

export const migrations: Migration[] = [
  migration_v1,
  migration_v2,
];
```

## Additional Resources

- **SQLite Documentation**: https://www.sqlite.org/lang_altertable.html
- **OP-SQLite Docs**: https://github.com/OP-Engineering/op-sqlite
- **Migration Patterns**: https://martinfowler.com/articles/evodb.html
