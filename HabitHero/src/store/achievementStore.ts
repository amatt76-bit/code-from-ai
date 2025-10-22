/**
 * Achievement Store
 * Zustand store for achievement tracking
 */

import { create } from 'zustand';
import type { Achievement, AchievementCategory } from '@models/Achievement';
import {
  getAllAchievements as dbGetAllAchievements,
  getUnlockedAchievements as dbGetUnlockedAchievements,
  getLockedAchievements as dbGetLockedAchievements,
  getAchievementsByCategory as dbGetAchievementsByCategory,
  updateAchievementProgress as dbUpdateAchievementProgress,
  unlockAchievement as dbUnlockAchievement,
  getUnlockedCount as dbGetUnlockedCount,
} from '@database/queries/achievementQueries';

interface AchievementState {
  // State
  achievements: Achievement[];
  recentlyUnlocked: Achievement | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadAchievements: (userId: string) => void;
  updateProgress: (userId: string, achievementId: string, progress: number) => void;
  unlockAchievement: (userId: string, achievementId: string) => Achievement | null;
  clearRecentlyUnlocked: () => void;
  refreshAchievements: (userId: string) => void;

  // Getters
  getAllAchievements: () => Achievement[];
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
  getAchievementsByCategory: (category: AchievementCategory) => Achievement[];
  getUnlockedCount: () => number;
  getTotalCount: () => number;
  getUnlockPercentage: () => number;
}

export const useAchievementStore = create<AchievementState>((set, get) => ({
  // Initial state
  achievements: [],
  recentlyUnlocked: null,
  isLoading: false,
  error: null,

  // Load all achievements from database
  loadAchievements: (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const achievements = dbGetAllAchievements(userId);
      set({ achievements, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      console.error('Failed to load achievements:', error);
    }
  },

  // Update achievement progress
  updateProgress: (userId: string, achievementId: string, progress: number) => {
    try {
      dbUpdateAchievementProgress(userId, achievementId, progress);

      // Update in state
      set(state => ({
        achievements: state.achievements.map(a =>
          a.id === achievementId ? { ...a, progress } : a
        ),
        error: null,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Failed to update achievement progress:', error);
    }
  },

  // Unlock achievement
  unlockAchievement: (userId: string, achievementId: string) => {
    try {
      const unlockedAchievement = dbUnlockAchievement(userId, achievementId);

      if (unlockedAchievement) {
        // Update in state
        set(state => ({
          achievements: state.achievements.map(a =>
            a.id === achievementId ? unlockedAchievement : a
          ),
          recentlyUnlocked: unlockedAchievement,
          error: null,
        }));

        return unlockedAchievement;
      }

      return null;
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Failed to unlock achievement:', error);
      return null;
    }
  },

  // Clear recently unlocked (after showing modal)
  clearRecentlyUnlocked: () => {
    set({ recentlyUnlocked: null });
  },

  // Refresh achievements from database
  refreshAchievements: (userId: string) => {
    try {
      const achievements = dbGetAllAchievements(userId);
      set({ achievements });
    } catch (error) {
      console.error('Failed to refresh achievements:', error);
    }
  },

  // Get all achievements
  getAllAchievements: () => {
    return get().achievements;
  },

  // Get unlocked achievements
  getUnlockedAchievements: () => {
    return get().achievements.filter(a => a.unlockedDate !== undefined);
  },

  // Get locked achievements
  getLockedAchievements: () => {
    return get().achievements.filter(a => a.unlockedDate === undefined);
  },

  // Get achievements by category
  getAchievementsByCategory: (category: AchievementCategory) => {
    return get().achievements.filter(a => a.category === category);
  },

  // Get count of unlocked achievements
  getUnlockedCount: () => {
    return get().achievements.filter(a => a.unlockedDate !== undefined).length;
  },

  // Get total achievement count
  getTotalCount: () => {
    return get().achievements.length;
  },

  // Get unlock percentage
  getUnlockPercentage: () => {
    const total = get().achievements.length;
    if (total === 0) return 0;

    const unlocked = get().achievements.filter(a => a.unlockedDate !== undefined).length;
    return Math.round((unlocked / total) * 100);
  },
}));

// Selectors
export const selectAchievements = (state: AchievementState) => state.achievements;
export const selectRecentlyUnlocked = (state: AchievementState) => state.recentlyUnlocked;
export const selectUnlockedAchievements = (state: AchievementState) =>
  state.achievements.filter(a => a.unlockedDate !== undefined);
export const selectLockedAchievements = (state: AchievementState) =>
  state.achievements.filter(a => a.unlockedDate === undefined);

// Helper: Check if specific achievement is unlocked
export const isAchievementUnlocked = (achievementId: string, achievements: Achievement[]) => {
  const achievement = achievements.find(a => a.id === achievementId);
  return achievement ? achievement.unlockedDate !== undefined : false;
};
