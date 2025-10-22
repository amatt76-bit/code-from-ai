/**
 * Habit Store
 * Zustand store for habit state management
 */

import { create } from 'zustand';
import type { Habit, CreateHabitInput, UpdateHabitInput } from '@models/Habit';
import {
  createHabit as dbCreateHabit,
  getAllHabits as dbGetAllHabits,
  getHabitById as dbGetHabitById,
  updateHabit as dbUpdateHabit,
  deleteHabit as dbDeleteHabit,
  completeHabit as dbCompleteHabit,
  snoozeHabit as dbSnoozeHabit,
  recordSlackerMoment as dbRecordSlackerMoment,
  getCompletionHistory,
  getTotalSnoozes,
  getTotalSlackerMoments,
} from '@database/queries/habitQueries';

interface HabitState {
  // State
  habits: Habit[];
  selectedHabitId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadHabits: (userId: string) => void;
  createHabit: (userId: string, input: CreateHabitInput) => Habit;
  updateHabit: (input: UpdateHabitInput) => void;
  deleteHabit: (habitId: string) => void;
  completeHabit: (habitId: string, xpEarned: number) => void;
  snoozeHabit: (habitId: string, durationMinutes: number) => void;
  recordSlackerMoment: (habitId: string) => void;
  selectHabit: (habitId: string | null) => void;
  refreshHabit: (habitId: string) => void;
  refreshAllHabits: (userId: string) => void;

  // Getters
  getHabitById: (habitId: string) => Habit | undefined;
  getTodayHabits: () => Habit[];
  getCompletedTodayCount: () => number;
  getPendingTodayCount: () => number;
  getAllCompletedToday: () => boolean;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  // Initial state
  habits: [],
  selectedHabitId: null,
  isLoading: false,
  error: null,

  // Load all habits from database
  loadHabits: (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const habits = dbGetAllHabits(userId);
      set({ habits, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      console.error('Failed to load habits:', error);
    }
  },

  // Create new habit
  createHabit: (userId: string, input: CreateHabitInput) => {
    try {
      const newHabit = dbCreateHabit(userId, input);
      set(state => ({
        habits: [...state.habits, newHabit],
        error: null,
      }));
      return newHabit;
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Failed to create habit:', error);
      throw error;
    }
  },

  // Update existing habit
  updateHabit: (input: UpdateHabitInput) => {
    try {
      const updatedHabit = dbUpdateHabit(input);
      set(state => ({
        habits: state.habits.map(h => (h.id === input.id ? updatedHabit : h)),
        error: null,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Failed to update habit:', error);
      throw error;
    }
  },

  // Delete habit
  deleteHabit: (habitId: string) => {
    try {
      dbDeleteHabit(habitId);
      set(state => ({
        habits: state.habits.filter(h => h.id !== habitId),
        selectedHabitId: state.selectedHabitId === habitId ? null : state.selectedHabitId,
        error: null,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Failed to delete habit:', error);
      throw error;
    }
  },

  // Complete habit
  completeHabit: (habitId: string, xpEarned: number) => {
    try {
      dbCompleteHabit(habitId, xpEarned);

      // Refresh habit from database to get updated streak
      const updatedHabit = dbGetHabitById(habitId);
      if (updatedHabit) {
        set(state => ({
          habits: state.habits.map(h => (h.id === habitId ? updatedHabit : h)),
          error: null,
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Failed to complete habit:', error);
      throw error;
    }
  },

  // Snooze habit
  snoozeHabit: (habitId: string, durationMinutes: number) => {
    try {
      dbSnoozeHabit(habitId, durationMinutes);

      // Refresh habit to get updated snooze state
      const updatedHabit = dbGetHabitById(habitId);
      if (updatedHabit) {
        set(state => ({
          habits: state.habits.map(h => (h.id === habitId ? updatedHabit : h)),
          error: null,
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Failed to snooze habit:', error);
      throw error;
    }
  },

  // Record slacker moment
  recordSlackerMoment: (habitId: string) => {
    try {
      dbRecordSlackerMoment(habitId);
      set({ error: null });
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Failed to record slacker moment:', error);
      throw error;
    }
  },

  // Select a habit (for detail view)
  selectHabit: (habitId: string | null) => {
    set({ selectedHabitId: habitId });
  },

  // Refresh single habit from database
  refreshHabit: (habitId: string) => {
    try {
      const updatedHabit = dbGetHabitById(habitId);
      if (updatedHabit) {
        set(state => ({
          habits: state.habits.map(h => (h.id === habitId ? updatedHabit : h)),
        }));
      }
    } catch (error) {
      console.error('Failed to refresh habit:', error);
    }
  },

  // Refresh all habits
  refreshAllHabits: (userId: string) => {
    try {
      const habits = dbGetAllHabits(userId);
      set({ habits });
    } catch (error) {
      console.error('Failed to refresh habits:', error);
    }
  },

  // Get habit by ID from state
  getHabitById: (habitId: string) => {
    return get().habits.find(h => h.id === habitId);
  },

  // Get today's habits
  getTodayHabits: () => {
    return get().habits;
  },

  // Get count of completed habits today
  getCompletedTodayCount: () => {
    return get().habits.filter(h => h.todayStatus === 'completed').length;
  },

  // Get count of pending habits today
  getPendingTodayCount: () => {
    return get().habits.filter(h => h.todayStatus === 'not_done').length;
  },

  // Check if all habits completed today
  getAllCompletedToday: () => {
    const habits = get().habits;
    if (habits.length === 0) return false;
    return habits.every(h => h.todayStatus === 'completed');
  },
}));

// Selectors for common use cases
export const selectHabits = (state: HabitState) => state.habits;
export const selectSelectedHabit = (state: HabitState) => {
  if (!state.selectedHabitId) return null;
  return state.habits.find(h => h.id === state.selectedHabitId) || null;
};
export const selectHabitsByStatus = (status: 'not_done' | 'snoozed' | 'completed') =>
  (state: HabitState) => state.habits.filter(h => h.todayStatus === status);

// Helper to get completion history for a habit
export const getHabitCompletionHistory = (habitId: string, limit = 30) => {
  return getCompletionHistory(habitId, limit);
};

// Helper to get habit statistics
export const getHabitStats = (habitId: string) => {
  return {
    totalSnoozes: getTotalSnoozes(habitId),
    totalSlackerMoments: getTotalSlackerMoments(habitId),
    completionHistory: getCompletionHistory(habitId, 30),
  };
};
