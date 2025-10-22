/**
 * User Store
 * Zustand store for user profile and settings
 */

import { create } from 'zustand';
import type { UserProfile, UserSettings } from '@models/User';
import {
  createUser as dbCreateUser,
  getUserById as dbGetUserById,
  getMainUser as dbGetMainUser,
  updateUser as dbUpdateUser,
  updateUserSettings as dbUpdateUserSettings,
  addXP as dbAddXP,
  deductXP as dbDeductXP,
  useMercyPass as dbUseMercyPass,
  resetMercyPasses as dbResetMercyPasses,
  updateComboStreak as dbUpdateComboStreak,
  prestigeUser as dbPrestigeUser,
} from '@database/queries/userQueries';
import { getLevelForXP, getXPForNextLevel, getLevelProgress } from '@constants/levels';

interface UserState {
  // State
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadUser: () => void;
  createUser: (username: string) => UserProfile;
  updateProfile: (updates: Partial<Omit<UserProfile, 'id' | 'settings' | 'createdDate'>>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  addXP: (xpToAdd: number) => { newXP: number; leveledUp: boolean };
  deductXP: (xpToDeduct: number) => void;
  useMercyPass: () => void;
  resetMercyPasses: () => void;
  updateComboStreak: (allHabitsCompleted: boolean) => void;
  prestigeUser: () => void;
  refreshUser: () => void;

  // Getters
  getCurrentLevel: () => number;
  getNextLevelXP: () => number;
  getLevelProgressPercent: () => number;
  canPrestige: () => boolean;
  hasMercyPassAvailable: () => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  user: null,
  isLoading: false,
  error: null,

  // Load user from database (or create if doesn't exist)
  loadUser: () => {
    set({ isLoading: true, error: null });
    try {
      let user = dbGetMainUser();

      // Create default user if none exists
      if (!user) {
        user = dbCreateUser('Habit Hero');
      }

      set({ user, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      console.error('Failed to load user:', error);
    }
  },

  // Create new user
  createUser: (username: string) => {
    try {
      const newUser = dbCreateUser(username);
      set({ user: newUser, error: null });
      return newUser;
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Failed to create user:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: (updates) => {
    const user = get().user;
    if (!user) {
      console.error('No user to update');
      return;
    }

    try {
      const updatedUser = dbUpdateUser(user.id, updates);
      set({ user: updatedUser, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  // Update user settings
  updateSettings: (settings) => {
    const user = get().user;
    if (!user) {
      console.error('No user to update');
      return;
    }

    try {
      const updatedUser = dbUpdateUserSettings(user.id, settings);
      set({ user: updatedUser, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Failed to update settings:', error);
      throw error;
    }
  },

  // Add XP to user
  addXP: (xpToAdd: number) => {
    const user = get().user;
    if (!user) {
      console.error('No user to add XP to');
      return { newXP: 0, leveledUp: false };
    }

    try {
      const result = dbAddXP(user.id, xpToAdd);

      // Refresh user to get updated XP and level
      const updatedUser = dbGetUserById(user.id);
      if (updatedUser) {
        set({ user: updatedUser, error: null });
      }

      return result;
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Failed to add XP:', error);
      throw error;
    }
  },

  // Deduct XP (for slacker moments)
  deductXP: (xpToDeduct: number) => {
    const user = get().user;
    if (!user) {
      console.error('No user to deduct XP from');
      return;
    }

    try {
      dbDeductXP(user.id, xpToDeduct);

      // Refresh user
      const updatedUser = dbGetUserById(user.id);
      if (updatedUser) {
        set({ user: updatedUser, error: null });
      }
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Failed to deduct XP:', error);
      throw error;
    }
  },

  // Use a mercy pass
  useMercyPass: () => {
    const user = get().user;
    if (!user) {
      console.error('No user to use mercy pass');
      return;
    }

    if (user.mercyPassesRemaining <= 0) {
      console.warn('No mercy passes available');
      return;
    }

    try {
      dbUseMercyPass(user.id);

      // Refresh user
      const updatedUser = dbGetUserById(user.id);
      if (updatedUser) {
        set({ user: updatedUser, error: null });
      }
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Failed to use mercy pass:', error);
      throw error;
    }
  },

  // Reset mercy passes (monthly)
  resetMercyPasses: () => {
    const user = get().user;
    if (!user) return;

    try {
      dbResetMercyPasses(user.id);

      // Refresh user
      const updatedUser = dbGetUserById(user.id);
      if (updatedUser) {
        set({ user: updatedUser, error: null });
      }
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Failed to reset mercy passes:', error);
    }
  },

  // Update combo streak
  updateComboStreak: (allHabitsCompleted: boolean) => {
    const user = get().user;
    if (!user) return;

    try {
      dbUpdateComboStreak(user.id, allHabitsCompleted);

      // Refresh user
      const updatedUser = dbGetUserById(user.id);
      if (updatedUser) {
        set({ user: updatedUser, error: null });
      }
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Failed to update combo streak:', error);
    }
  },

  // Prestige (reset to level 1)
  prestigeUser: () => {
    const user = get().user;
    if (!user) return;

    if (user.level < 20) {
      console.warn('Must be level 20 to prestige');
      return;
    }

    try {
      dbPrestigeUser(user.id);

      // Refresh user
      const updatedUser = dbGetUserById(user.id);
      if (updatedUser) {
        set({ user: updatedUser, error: null });
      }
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Failed to prestige:', error);
      throw error;
    }
  },

  // Refresh user from database
  refreshUser: () => {
    const user = get().user;
    if (!user) return;

    try {
      const updatedUser = dbGetUserById(user.id);
      if (updatedUser) {
        set({ user: updatedUser });
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  },

  // Get current level info
  getCurrentLevel: () => {
    const user = get().user;
    if (!user) return 1;
    return user.level;
  },

  // Get XP required for next level
  getNextLevelXP: () => {
    const user = get().user;
    if (!user) return 100;
    return getXPForNextLevel(user.level);
  },

  // Get level progress as percentage
  getLevelProgressPercent: () => {
    const user = get().user;
    if (!user) return 0;
    return getLevelProgress(user.totalXP);
  },

  // Check if user can prestige
  canPrestige: () => {
    const user = get().user;
    return user ? user.level >= 20 : false;
  },

  // Check if mercy pass available
  hasMercyPassAvailable: () => {
    const user = get().user;
    return user ? user.mercyPassesRemaining > 0 : false;
  },
}));

// Selectors
export const selectUser = (state: UserState) => state.user;
export const selectUserSettings = (state: UserState) => state.user?.settings || null;
export const selectUserLevel = (state: UserState) => state.user?.level || 1;
export const selectUserXP = (state: UserState) => state.user?.totalXP || 0;
export const selectComboStreak = (state: UserState) => state.user?.currentComboStreak || 0;
export const selectComboMultiplier = (state: UserState) => state.user?.comboMultiplier || 1;
export const selectMercyPassesRemaining = (state: UserState) =>
  state.user?.mercyPassesRemaining || 0;
export const selectPrestigeLevel = (state: UserState) => state.user?.prestigeLevel || 0;
