/**
 * Achievement Model
 * Represents badges and achievements users can unlock
 */

export type AchievementCategory =
  | 'starter'
  | 'consistency'
  | 'speed'
  | 'comeback'
  | 'shame'
  | 'special';

export type AchievementRequirementType =
  | 'streak'
  | 'count'
  | 'perfect_week'
  | 'snoozes'
  | 'custom';

export interface AchievementRequirement {
  type: AchievementRequirementType;
  target: number;
  habitId?: string; // For habit-specific achievements
  customCheck?: string; // Custom logic identifier
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  requirement: AchievementRequirement;
  unlockedDate?: string; // ISO date string, null if locked
  progress: number; // Current progress towards target
}

export interface AchievementUnlockEvent {
  achievementId: string;
  timestamp: string; // ISO timestamp
  habitId?: string; // If related to specific habit
}
