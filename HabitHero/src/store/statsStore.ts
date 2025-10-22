/**
 * Stats Store
 * Zustand store for statistics and analytics
 */

import { create } from 'zustand';
import type { WeeklyStats, AllTimeStats } from '@models/Stats';
import type { DailyChallenge } from '@models/Challenge';
import {
  getCurrentWeekStats as dbGetCurrentWeekStats,
  updateWeeklyStats as dbUpdateWeeklyStats,
  getAllTimeStats as dbGetAllTimeStats,
} from '@database/queries/statsQueries';
import {
  getTodayChallenge as dbGetTodayChallenge,
  completeChallenge as dbCompleteChallenge,
  getChallengeCompletionRate as dbGetChallengeCompletionRate,
  createDailyChallenge,
  getRandomChallengeType,
} from '@database/queries/challengeQueries';

interface StatsState {
  // State
  weeklyStats: WeeklyStats | null;
  allTimeStats: AllTimeStats | null;
  todayChallenge: DailyChallenge | null;
  challengeCompletionRate: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadStats: (userId: string) => void;
  loadWeeklyStats: (userId: string) => void;
  loadAllTimeStats: (userId: string) => void;
  loadTodayChallenge: (userId: string) => void;
  updateWeeklyStats: (userId: string, updates: Partial<WeeklyStats>) => void;
  completeChallenge: (userId: string) => void;
  generateNewChallenge: (userId: string) => void;
  refreshStats: (userId: string) => void;

  // Getters
  getWeeklyStats: () => WeeklyStats | null;
  getAllTimeStats: () => AllTimeStats | null;
  getTodayChallenge: () => DailyChallenge | null;
  isChallengeCompleted: () => boolean;
}

export const useStatsStore = create<StatsState>((set, get) => ({
  // Initial state
  weeklyStats: null,
  allTimeStats: null,
  todayChallenge: null,
  challengeCompletionRate: 0,
  isLoading: false,
  error: null,

  // Load all stats
  loadStats: (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const weeklyStats = dbGetCurrentWeekStats(userId);
      const allTimeStats = dbGetAllTimeStats(userId);
      const todayChallenge = dbGetTodayChallenge(userId);
      const challengeCompletionRate = dbGetChallengeCompletionRate(userId);

      set({
        weeklyStats,
        allTimeStats,
        todayChallenge,
        challengeCompletionRate,
        isLoading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      console.error('Failed to load stats:', error);
    }
  },

  // Load weekly stats only
  loadWeeklyStats: (userId: string) => {
    try {
      const weeklyStats = dbGetCurrentWeekStats(userId);
      set({ weeklyStats, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Failed to load weekly stats:', error);
    }
  },

  // Load all-time stats only
  loadAllTimeStats: (userId: string) => {
    try {
      const allTimeStats = dbGetAllTimeStats(userId);
      set({ allTimeStats, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Failed to load all-time stats:', error);
    }
  },

  // Load today's challenge
  loadTodayChallenge: (userId: string) => {
    try {
      const todayChallenge = dbGetTodayChallenge(userId);
      set({ todayChallenge, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Failed to load today challenge:', error);
    }
  },

  // Update weekly stats
  updateWeeklyStats: (userId: string, updates: Partial<WeeklyStats>) => {
    try {
      dbUpdateWeeklyStats(userId, updates);

      // Refresh weekly stats
      const weeklyStats = dbGetCurrentWeekStats(userId);
      set({ weeklyStats, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Failed to update weekly stats:', error);
    }
  },

  // Complete today's challenge
  completeChallenge: (userId: string) => {
    try {
      const completedChallenge = dbCompleteChallenge(userId);
      set({ todayChallenge: completedChallenge, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Failed to complete challenge:', error);
    }
  },

  // Generate new daily challenge
  generateNewChallenge: (userId: string) => {
    try {
      const randomType = getRandomChallengeType();
      const newChallenge = createDailyChallenge(userId, randomType);
      set({ todayChallenge: newChallenge, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Failed to generate challenge:', error);
    }
  },

  // Refresh all stats
  refreshStats: (userId: string) => {
    try {
      const weeklyStats = dbGetCurrentWeekStats(userId);
      const allTimeStats = dbGetAllTimeStats(userId);
      const todayChallenge = dbGetTodayChallenge(userId);
      const challengeCompletionRate = dbGetChallengeCompletionRate(userId);

      set({
        weeklyStats,
        allTimeStats,
        todayChallenge,
        challengeCompletionRate,
      });
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  },

  // Get weekly stats
  getWeeklyStats: () => {
    return get().weeklyStats;
  },

  // Get all-time stats
  getAllTimeStats: () => {
    return get().allTimeStats;
  },

  // Get today's challenge
  getTodayChallenge: () => {
    return get().todayChallenge;
  },

  // Check if challenge is completed
  isChallengeCompleted: () => {
    const challenge = get().todayChallenge;
    return challenge ? challenge.completed : false;
  },
}));

// Selectors
export const selectWeeklyStats = (state: StatsState) => state.weeklyStats;
export const selectAllTimeStats = (state: StatsState) => state.allTimeStats;
export const selectTodayChallenge = (state: StatsState) => state.todayChallenge;
export const selectChallengeCompletionRate = (state: StatsState) =>
  state.challengeCompletionRate;
