/**
 * Store Index
 * Central export for all Zustand stores
 */

// Export stores
export { useHabitStore } from './habitStore';
export { useUserStore } from './userStore';
export { useAchievementStore } from './achievementStore';
export { useStatsStore } from './statsStore';

// Export selectors
export {
  selectHabits,
  selectSelectedHabit,
  selectHabitsByStatus,
  getHabitCompletionHistory,
  getHabitStats,
} from './habitStore';

export {
  selectUser,
  selectUserSettings,
  selectUserLevel,
  selectUserXP,
  selectComboStreak,
  selectComboMultiplier,
  selectMercyPassesRemaining,
  selectPrestigeLevel,
} from './userStore';

export {
  selectAchievements,
  selectRecentlyUnlocked,
  selectUnlockedAchievements,
  selectLockedAchievements,
  isAchievementUnlocked,
} from './achievementStore';

export {
  selectWeeklyStats,
  selectAllTimeStats,
  selectTodayChallenge,
  selectChallengeCompletionRate,
} from './statsStore';

/**
 * Initialize all stores with data from database
 */
export async function initializeStores(): Promise<void> {
  const { useUserStore } = await import('./userStore');
  const { useHabitStore } = await import('./habitStore');
  const { useAchievementStore } = await import('./achievementStore');
  const { useStatsStore } = await import('./statsStore');

  try {
    // Load user first (create if doesn't exist)
    useUserStore.getState().loadUser();
    const user = useUserStore.getState().user;

    if (!user) {
      console.error('Failed to load/create user');
      return;
    }

    const userId = user.id;

    // Load all other stores in parallel
    await Promise.all([
      Promise.resolve(useHabitStore.getState().loadHabits(userId)),
      Promise.resolve(useAchievementStore.getState().loadAchievements(userId)),
      Promise.resolve(useStatsStore.getState().loadStats(userId)),
    ]);

    console.log('✅ All stores initialized');
  } catch (error) {
    console.error('❌ Failed to initialize stores:', error);
    throw error;
  }
}

/**
 * Refresh all store data from database
 */
export function refreshAllStores(): void {
  const { useUserStore } = require('./userStore');
  const { useHabitStore } = require('./habitStore');
  const { useAchievementStore } = require('./achievementStore');
  const { useStatsStore } = require('./statsStore');

  const user = useUserStore.getState().user;
  if (!user) return;

  const userId = user.id;

  useUserStore.getState().refreshUser();
  useHabitStore.getState().refreshAllHabits(userId);
  useAchievementStore.getState().refreshAchievements(userId);
  useStatsStore.getState().refreshStats(userId);
}
