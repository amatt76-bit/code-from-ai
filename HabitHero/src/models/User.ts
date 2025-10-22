/**
 * User Profile Model
 * Represents the user's profile, progress, and settings
 */

import { PersonalityType } from './Habit';

export interface UserSettings {
  globalPersonality: PersonalityType;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  confettiEnabled: boolean;
  hapticEnabled: boolean;
  darkMode: boolean;
  themeColor: string;
}

export interface UserProfile {
  id: string;
  username: string;
  level: number;
  totalXP: number;
  currentComboStreak: number; // Consecutive days all habits completed
  comboMultiplier: number; // 1, 1.5, 2, or 3
  mercyPassesRemaining: number; // Resets monthly
  mercyPassesUsedTotal: number;
  prestigeLevel: number; // 0, 1, 2, 3
  createdDate: string; // ISO date string
  lastActiveDate: string; // ISO date string
  settings: UserSettings;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  globalPersonality: 'supportive',
  notificationsEnabled: true,
  soundEnabled: true,
  confettiEnabled: true,
  hapticEnabled: true,
  darkMode: false,
  themeColor: '#FF6B35',
};

export const DEFAULT_USER_PROFILE: Omit<UserProfile, 'id' | 'createdDate' | 'lastActiveDate'> = {
  username: 'Habit Hero',
  level: 1,
  totalXP: 0,
  currentComboStreak: 0,
  comboMultiplier: 1,
  mercyPassesRemaining: 1,
  mercyPassesUsedTotal: 0,
  prestigeLevel: 0,
  settings: DEFAULT_USER_SETTINGS,
};
