/**
 * Challenge Queries
 * CRUD operations for daily challenges
 */

import { getDatabase } from '../schema';
import type { DailyChallenge, ChallengeType } from '@models/Challenge';
import { CHALLENGE_DEFINITIONS } from '@models/Challenge';
import { v4 as uuidv4 } from 'react-native-uuid';

/**
 * Create daily challenge for today
 */
export function createDailyChallenge(userId: string, challengeType: ChallengeType): DailyChallenge {
  const db = getDatabase();
  const challengeId = uuidv4() as string;
  const today = new Date().toISOString().split('T')[0];
  const definition = CHALLENGE_DEFINITIONS[challengeType];

  db.execute(
    `INSERT OR REPLACE INTO daily_challenges
    (id, user_id, date, challenge_type, description, xp_reward, completed, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [challengeId, userId, today, challengeType, definition.description, definition.xpReward, 0, null]
  );

  return {
    id: challengeId,
    date: today,
    challengeType,
    description: definition.description,
    xpReward: definition.xpReward,
    completed: false,
    completedAt: undefined,
  };
}

/**
 * Get today's challenge
 */
export function getTodayChallenge(userId: string): DailyChallenge | null {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];

  const result = db.execute(
    'SELECT * FROM daily_challenges WHERE user_id = ? AND date = ?',
    [userId, today]
  );

  if (!result.rows || result.rows.length === 0) {
    return null;
  }

  return mapRowToChallenge(result.rows.item(0));
}

/**
 * Complete today's challenge
 */
export function completeChallenge(userId: string): DailyChallenge | null {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  db.execute(
    'UPDATE daily_challenges SET completed = 1, completed_at = ? WHERE user_id = ? AND date = ?',
    [now, userId, today]
  );

  return getTodayChallenge(userId);
}

/**
 * Get all challenges (history)
 */
export function getAllChallenges(userId: string, limit = 30): DailyChallenge[] {
  const db = getDatabase();

  const result = db.execute(
    'SELECT * FROM daily_challenges WHERE user_id = ? ORDER BY date DESC LIMIT ?',
    [userId, limit]
  );

  if (!result.rows || result.rows.length === 0) {
    return [];
  }

  const challenges: DailyChallenge[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    challenges.push(mapRowToChallenge(result.rows.item(i)));
  }

  return challenges;
}

/**
 * Get challenge completion rate
 */
export function getChallengeCompletionRate(userId: string): number {
  const db = getDatabase();

  const result = db.execute(
    `SELECT
      COUNT(*) as total,
      SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed
    FROM daily_challenges
    WHERE user_id = ?`,
    [userId]
  );

  if (!result.rows || result.rows.length === 0) {
    return 0;
  }

  const row = result.rows.item(0);
  if (row.total === 0) return 0;

  return Math.round((row.completed / row.total) * 100);
}

/**
 * Helper: Map database row to DailyChallenge
 */
function mapRowToChallenge(row: any): DailyChallenge {
  return {
    id: row.id,
    date: row.date,
    challengeType: row.challenge_type,
    description: row.description,
    xpReward: row.xp_reward,
    completed: row.completed === 1,
    completedAt: row.completed_at || undefined,
  };
}

/**
 * Generate random challenge type
 */
export function getRandomChallengeType(): ChallengeType {
  const types: ChallengeType[] = [
    'complete_before_noon',
    'no_snooze',
    'perfect_first_reminder',
    'early_bird',
    'speed_run',
  ];

  return types[Math.floor(Math.random() * types.length)];
}
