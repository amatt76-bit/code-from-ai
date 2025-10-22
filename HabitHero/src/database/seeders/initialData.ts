/**
 * Database Seeders
 * Initialize database with default data
 */

import { createUser, getMainUser } from '../queries/userQueries';
import { seedAchievements } from '../queries/achievementQueries';
import { createDailyChallenge, getRandomChallengeType } from '../queries/challengeQueries';

/**
 * Seed initial data on first app launch
 */
export async function seedInitialData(): Promise<void> {
  try {
    // Check if user already exists
    let user = getMainUser();

    if (!user) {
      console.log('📝 Creating default user...');
      user = createUser('Habit Hero');
      console.log('✅ Default user created');
    }

    // Seed achievements if none exist
    const userId = user.id;
    seedAchievements(userId);
    console.log('✅ Achievements seeded');

    // Create today's challenge if it doesn't exist
    const todayChallenge = await import('../queries/challengeQueries').then(mod =>
      mod.getTodayChallenge(userId)
    );

    if (!todayChallenge) {
      const randomType = getRandomChallengeType();
      createDailyChallenge(userId, randomType);
      console.log('✅ Daily challenge created');
    }

    console.log('✅ Initial data seeded successfully');
  } catch (error) {
    console.error('❌ Failed to seed initial data:', error);
    throw error;
  }
}

/**
 * Reset all user data (for testing/debugging)
 */
export async function resetAllData(): Promise<void> {
  const { resetDatabase } = await import('../schema');
  await resetDatabase();
  await seedInitialData();
  console.log('✅ All data reset and reseeded');
}
