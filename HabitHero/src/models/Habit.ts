/**
 * Habit Model
 * Represents a single habit with all its tracking data
 */

export type PersonalityType = 'supportive' | 'sarcastic' | 'drill' | 'zen';
export type HabitStatus = 'not_done' | 'snoozed' | 'completed';

export interface CompletionRecord {
  date: string; // ISO date string (YYYY-MM-DD)
  completedAt: string; // ISO timestamp
  xpEarned: number;
  wasSnoozed: boolean;
  mercyUsed: boolean;
}

export interface Habit {
  id: string; // UUID
  name: string;
  nickname?: string;
  emoji?: string;
  reminderTimes: string[]; // Array of time strings ["08:00", "14:00", "20:00"]
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate?: string; // ISO date string
  createdDate: string; // ISO date string
  todayStatus: HabitStatus;
  snoozedUntil?: number; // Timestamp if snoozed
  snoozesCount: number; // Count for today
  personality: PersonalityType;
  completionHistory: CompletionRecord[];
}

export interface CreateHabitInput {
  name: string;
  nickname?: string;
  emoji?: string;
  reminderTimes: string[];
  personality?: PersonalityType;
}

export interface UpdateHabitInput extends Partial<CreateHabitInput> {
  id: string;
}
