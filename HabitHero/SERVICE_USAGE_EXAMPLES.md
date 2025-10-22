# Service Usage Examples

Complete guide for using all services in the Habit Hero app.

## Table of Contents

1. [XPService](#xpservice)
2. [StreakService](#streakservice)
3. [AchievementService](#achievementservice)
4. [NotificationService](#notificationservice)
5. [MidnightResetService](#midnightresetservice)
6. [Complete Workflows](#complete-workflows)

---

## XPService

Handles XP calculations, level-ups, and combo multipliers.

### Basic XP Calculation

```typescript
import {
  calculateHabitXP,
  checkForLevelUp,
  getXPSummary,
} from '@services/XPService';
import { useUserStore } from '@store/userStore';

// When user completes a habit
function handleHabitCompletion(habitStreak: number) {
  const { user, addXP } = useUserStore.getState();

  // Calculate XP earned
  const xpCalc = calculateHabitXP(
    habitStreak,           // Current streak
    user.currentComboStreak, // Combo streak
    false                  // Was snoozed?
  );

  console.log(`Earned ${xpCalc.totalXP} XP!`);
  console.log(`Reason: ${xpCalc.reason}`);
  // Example: "Habit completed + 7-day streak milestone! (2x combo!)"

  // Add XP to user
  const oldXP = user.totalXP;
  addXP(xpCalc.totalXP);

  // Check for level up
  const levelUp = checkForLevelUp(oldXP, oldXP + xpCalc.totalXP);
  if (levelUp) {
    console.log(`🎊 LEVEL UP! Now level ${levelUp.newLevel}: ${levelUp.levelInfo.name}`);
    console.log(`Unlocks: ${levelUp.unlocks.join(', ')}`);

    // Show level up notification
    displayLevelUpNotification(
      levelUp.newLevel,
      levelUp.levelInfo.name,
      levelUp.levelInfo.emoji,
      levelUp.unlocks
    );
  }
}
```

### Daily Challenge XP

```typescript
import { calculateDailyChallengeXP } from '@services/XPService';

function completeDailyChallenge(challengeType: string) {
  const { user, addXP } = useUserStore.getState();

  const xpCalc = calculateDailyChallengeXP(
    challengeType,
    user.currentComboStreak
  );

  console.log(`Challenge completed! +${xpCalc.totalXP} XP`);
  addXP(xpCalc.totalXP);
}
```

### XP Display Summary

```typescript
import { getXPSummary } from '@services/XPService';

function XPProgressBar() {
  const { user } = useUserStore();
  const summary = getXPSummary(user.totalXP, user.currentComboStreak);

  return (
    <View>
      <Text>Level {summary.level}: {summary.levelName} {summary.emoji}</Text>
      <ProgressBar progress={summary.progressPercent} />
      <Text>{summary.currentLevelXP} / {summary.nextLevelXP} XP</Text>
      <Text>Combo: {summary.comboMultiplier}x</Text>
      <Text>{summary.habitsToNextLevel} habits to next level</Text>
    </View>
  );
}
```

---

## StreakService

Tracks streaks, milestones, and provides streak statistics.

### Check for Streak Milestones

```typescript
import {
  checkStreakMilestone,
  checkComboMilestone,
} from '@services/StreakService';
import { displayStreakMilestoneNotification } from '@services/NotificationService';

function onHabitCompleted(habit: Habit, previousStreak: number, newStreak: number) {
  // Check individual habit streak milestone
  const milestone = checkStreakMilestone(
    previousStreak,
    newStreak,
    habit.name,
    habit.id
  );

  if (milestone) {
    console.log(milestone.message);
    // Example: "🔥 7-day streak for Morning Run! One week strong!"

    // Show notification
    displayStreakMilestoneNotification(
      habit.name,
      milestone.milestone,
      milestone.message
    );

    // Award bonus XP (already handled by XPService)
  }
}

function onAllHabitsCompleted(previousComboStreak: number, newComboStreak: number) {
  // Check combo streak milestone
  const comboMilestone = checkComboMilestone(previousComboStreak, newComboStreak);

  if (comboMilestone) {
    console.log(comboMilestone.message);
    // Example: "⭐ 7-day combo! Perfect week! You're on fire!"

    displayStreakMilestoneNotification(
      'All Habits',
      comboMilestone.milestone,
      comboMilestone.message
    );
  }
}
```

### Streak Statistics

```typescript
import { calculateStreakStats, getHabitsAtRisk } from '@services/StreakService';

function StreakDashboard() {
  const { habits } = useHabitStore();
  const stats = calculateStreakStats(habits);

  return (
    <View>
      <Text>Active Streaks: {stats.totalActiveStreaks}</Text>
      <Text>Longest: {stats.longestCurrentStreak} days ({stats.longestHabitName})</Text>
      <Text>Average: {stats.averageStreak} days</Text>
      <Text>Habits at Risk: {stats.habitsAtRisk}</Text>
      <Text>Perfect Days: {stats.perfectDays}</Text>
    </View>
  );
}

function StreakWarnings() {
  const { habits } = useHabitStore();
  const habitsAtRisk = getHabitsAtRisk(habits);

  if (habitsAtRisk.length === 0) return null;

  return (
    <View>
      <Text>⚠️ Streaks at Risk:</Text>
      {habitsAtRisk.map(habit => (
        <Text key={habit.id}>
          {habit.name}: {habit.currentStreak}-day streak
        </Text>
      ))}
    </View>
  );
}
```

### Progress to Next Milestone

```typescript
import {
  getNextMilestone,
  getDaysToNextMilestone,
  getMilestoneProgress,
} from '@services/StreakService';

function StreakProgress({ currentStreak }: { currentStreak: number }) {
  const nextMilestone = getNextMilestone(currentStreak);
  const daysRemaining = getDaysToNextMilestone(currentStreak);
  const progress = getMilestoneProgress(currentStreak);

  return (
    <View>
      <Text>Current: {currentStreak} days</Text>
      {nextMilestone && (
        <>
          <Text>Next Milestone: {nextMilestone} days</Text>
          <Text>{daysRemaining} days to go!</Text>
          <ProgressBar progress={progress} />
        </>
      )}
    </View>
  );
}
```

---

## AchievementService

Detects and unlocks achievements automatically.

### Check for Achievement Unlocks

```typescript
import {
  checkAllAchievements,
  getAchievementProgress,
} from '@services/AchievementService';
import { displayAchievementNotification } from '@services/NotificationService';
import { calculateAchievementXP } from '@services/XPService';

function checkAndUnlockAchievements() {
  const { user, addXP } = useUserStore.getState();
  const { habits } = useHabitStore.getState();
  const { achievements, unlockAchievement } = useAchievementStore.getState();
  const { weeklyStats, allTimeStats } = useStatsStore.getState();

  // Check all achievements
  const newlyUnlocked = checkAllAchievements(
    user,
    habits,
    achievements,
    allTimeStats
  );

  // Process each newly unlocked achievement
  for (const achievement of newlyUnlocked) {
    console.log(`🎉 Achievement Unlocked: ${achievement.name}!`);

    // Unlock in database
    unlockAchievement(achievement.achievementId);

    // Award XP
    const xpCalc = calculateAchievementXP(achievement.name);
    addXP(xpCalc.totalXP);

    // Show notification
    displayAchievementNotification(
      achievement.name,
      achievement.emoji,
      achievement.xpReward
    );
  }

  return newlyUnlocked;
}

// Call this after significant events
function onHabitCompleted() {
  // ... complete habit logic
  checkAndUnlockAchievements();
}

function onStreakBroken() {
  // ... break streak logic
  checkAndUnlockAchievements(); // Might unlock "Comeback Kid" later
}
```

### Achievement Progress Display

```typescript
import {
  getAchievementProgress,
  getAchievementsByCategory,
  getAchievementsNearUnlock,
} from '@services/AchievementService';

function AchievementList() {
  const { user } = useUserStore();
  const { habits } = useHabitStore();
  const { achievements } = useAchievementStore();
  const { allTimeStats } = useStatsStore();

  return (
    <View>
      {achievements.map(achievement => {
        const progress = getAchievementProgress(
          achievement.id,
          user,
          habits,
          allTimeStats
        );

        const isUnlocked = achievement.unlockedDate !== undefined;

        return (
          <View key={achievement.id}>
            <Text>{achievement.emoji} {achievement.name}</Text>
            <Text>{achievement.description}</Text>
            {!isUnlocked && (
              <ProgressBar progress={progress} />
            )}
            {isUnlocked && (
              <Text>✅ Unlocked {achievement.unlockedDate}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

function AlmostThereAchievements() {
  const { user } = useUserStore();
  const { habits } = useHabitStore();
  const { achievements } = useAchievementStore();
  const { allTimeStats } = useStatsStore();

  const nearUnlock = getAchievementsNearUnlock(
    achievements,
    user,
    habits,
    allTimeStats
  );

  return (
    <View>
      <Text>Almost There! (75%+ progress)</Text>
      {nearUnlock.map(achievement => (
        <Text key={achievement.id}>
          {achievement.emoji} {achievement.name}
        </Text>
      ))}
    </View>
  );
}
```

---

## NotificationService

Handles all notifications using Notifee.

### Schedule Habit Reminders

```typescript
import {
  scheduleAllHabitReminders,
  cancelHabitNotifications,
  setupForegroundEventHandler,
} from '@services/NotificationService';

// When creating a habit
async function createNewHabit(habitData) {
  const { createHabit } = useHabitStore.getState();

  // Create habit in database
  const habit = createHabit('user-id', habitData);

  // Schedule notifications
  await scheduleAllHabitReminders(habit);

  console.log(`Scheduled ${habit.reminderTimes.length} reminders for ${habit.name}`);
}

// When deleting a habit
async function deleteHabit(habitId: string) {
  const { deleteHabit } = useHabitStore.getState();

  // Cancel all notifications first
  await cancelHabitNotifications(habitId);

  // Delete habit
  deleteHabit(habitId);
}

// When updating reminder times
async function updateReminderTimes(habitId: string, newTimes: string[]) {
  const { updateHabit, getHabitById } = useHabitStore.getState();

  // Cancel old notifications
  await cancelHabitNotifications(habitId);

  // Update habit
  updateHabit({ id: habitId, reminderTimes: newTimes });

  // Schedule new notifications
  const habit = getHabitById(habitId);
  await scheduleAllHabitReminders(habit!);
}
```

### Handle Notification Actions

```typescript
import { setupForegroundEventHandler } from '@services/NotificationService';

// In App.tsx
function App() {
  const { completeHabit, snoozeHabit, recordSlackerMoment } = useHabitStore.getState();

  useEffect(() => {
    // Set up notification action handlers
    const unsubscribe = setupForegroundEventHandler(
      // On Complete
      (habitId) => {
        console.log(`Complete habit ${habitId} from notification`);
        const user = useUserStore.getState().user;
        const xpCalc = calculateHabitXP(1, user.currentComboStreak, false);
        completeHabit(habitId, xpCalc.totalXP);
      },

      // On Snooze
      (habitId) => {
        console.log(`Snooze habit ${habitId}`);
        snoozeHabit(habitId, 60); // Snooze for 60 minutes
      },

      // On Slacker
      (habitId) => {
        console.log(`Slacker moment for habit ${habitId}`);
        recordSlackerMoment(habitId);
      }
    );

    return () => unsubscribe();
  }, []);

  return <YourAppContent />;
}
```

### Display Various Notifications

```typescript
import {
  displayAchievementNotification,
  displayLevelUpNotification,
  displayStreakMilestoneNotification,
  displayCompletionNotification,
} from '@services/NotificationService';

// After completing a habit
await displayCompletionNotification(habit, xpEarned, newStreak);

// After unlocking achievement
await displayAchievementNotification('Week Warrior', '💪', 200);

// After leveling up
await displayLevelUpNotification(
  5,
  'Committed',
  '🥈',
  ['Custom themes', 'Extra Snooze power-up']
);

// After hitting streak milestone
await displayStreakMilestoneNotification(
  'Morning Run',
  7,
  '⭐ 7-day streak for Morning Run! One week strong!'
);
```

---

## MidnightResetService

Handles daily resets and late-day reminders.

### Start Midnight Reset

```typescript
import {
  startMidnightResetService,
  scheduleLateDayReminderCheck,
} from '@services/MidnightResetService';
import { displayLateDayReminder } from '@services/NotificationService';

// In App.tsx
function App() {
  useEffect(() => {
    // Start midnight reset service
    const cleanupMidnight = startMidnightResetService();

    // Start late-day reminder check
    const cleanupReminder = scheduleLateDayReminderCheck(
      (habitsAtRisk) => {
        // Show notification for incomplete habits
        displayLateDayReminder(habitsAtRisk);
      },
      'user-id'
    );

    return () => {
      cleanupMidnight();
      cleanupReminder();
    };
  }, []);

  return <YourAppContent />;
}
```

### Manual Reset (for Testing)

```typescript
import { triggerMidnightReset, getDailyResetSummary } from '@services/MidnightResetService';

async function testMidnightReset() {
  const result = await triggerMidnightReset('user-id');

  console.log(getDailyResetSummary(result));
  // Output:
  // 🌙 Daily Reset Summary:
  //   • 5 habits reset
  //   • 2 streaks broken 💔
  //   • Combo streak reset
  //   • New daily challenge created 🎯
}
```

### Time-Based Features

```typescript
import {
  getTimeUntilMidnight,
  formatTimeUntilMidnight,
  isLateInDay,
  getTimeBasedMessage,
} from '@services/MidnightResetService';

function DashboardHeader() {
  const timeUntil = formatTimeUntilMidnight();
  const message = getTimeBasedMessage();
  const isLate = isLateInDay();

  return (
    <View>
      <Text>{message}</Text>
      {isLate && (
        <Text style={{ color: 'red' }}>
          ⏰ {timeUntil} until midnight!
        </Text>
      )}
    </View>
  );
}
```

---

## Complete Workflows

### Workflow 1: Complete a Habit

Complete workflow showing all services working together.

```typescript
import { calculateHabitXP, checkForLevelUp } from '@services/XPService';
import { checkStreakMilestone } from '@services/StreakService';
import { checkAllAchievements } from '@services/AchievementService';
import {
  displayCompletionNotification,
  displayLevelUpNotification,
  displayStreakMilestoneNotification,
  displayAchievementNotification,
} from '@services/NotificationService';

async function completeHabitWorkflow(habitId: string) {
  const { user, addXP } = useUserStore.getState();
  const { habits, getHabitById, completeHabit: dbCompleteHabit } = useHabitStore.getState();
  const { achievements, unlockAchievement } = useAchievementStore.getState();
  const { allTimeStats } = useStatsStore.getState();

  // 1. Get habit
  const habit = getHabitById(habitId);
  if (!habit) return;

  const previousStreak = habit.currentStreak;

  // 2. Calculate XP
  const xpCalc = calculateHabitXP(
    habit.currentStreak + 1,
    user.currentComboStreak,
    false
  );

  // 3. Complete habit in database
  dbCompleteHabit(habitId, xpCalc.totalXP);

  // 4. Get updated habit
  const updatedHabit = getHabitById(habitId);
  if (!updatedHabit) return;

  // 5. Show completion notification
  await displayCompletionNotification(updatedHabit, xpCalc.totalXP, updatedHabit.currentStreak);

  // 6. Check for streak milestone
  const streakMilestone = checkStreakMilestone(
    previousStreak,
    updatedHabit.currentStreak,
    updatedHabit.name,
    updatedHabit.id
  );

  if (streakMilestone) {
    await displayStreakMilestoneNotification(
      updatedHabit.name,
      streakMilestone.milestone,
      streakMilestone.message
    );
  }

  // 7. Add XP and check for level up
  const oldXP = user.totalXP;
  addXP(xpCalc.totalXP);

  const levelUp = checkForLevelUp(oldXP, oldXP + xpCalc.totalXP);
  if (levelUp) {
    await displayLevelUpNotification(
      levelUp.newLevel,
      levelUp.levelInfo.name,
      levelUp.levelInfo.emoji,
      levelUp.unlocks
    );
  }

  // 8. Check for achievement unlocks
  const newlyUnlocked = checkAllAchievements(
    user,
    habits,
    achievements,
    allTimeStats
  );

  for (const achievement of newlyUnlocked) {
    unlockAchievement(achievement.achievementId);
    await displayAchievementNotification(
      achievement.name,
      achievement.emoji,
      achievement.xpReward
    );
  }

  console.log('✅ Habit completion workflow finished');
}
```

### Workflow 2: App Initialization

Complete initialization sequence.

```typescript
import { initializeDatabase } from '@database/schema';
import { seedInitialData } from '@database/seeders/initialData';
import { initializeStores } from '@store';
import {
  initializeNotifications,
  rescheduleAllHabitReminders,
} from '@services/NotificationService';
import {
  startMidnightResetService,
  scheduleLateDayReminderCheck,
} from '@services/MidnightResetService';

async function initializeApp() {
  try {
    // 1. Initialize database
    await initializeDatabase();
    console.log('✓ Database initialized');

    // 2. Seed initial data (if needed)
    await seedInitialData();
    console.log('✓ Initial data seeded');

    // 3. Initialize Zustand stores
    await initializeStores();
    console.log('✓ Stores initialized');

    // 4. Initialize notifications
    await initializeNotifications();
    console.log('✓ Notifications initialized');

    // 5. Reschedule all habit reminders
    const { habits } = useHabitStore.getState();
    await rescheduleAllHabitReminders(habits);
    console.log('✓ Habit reminders rescheduled');

    // 6. Start midnight reset service
    startMidnightResetService();
    console.log('✓ Midnight reset service started');

    // 7. Schedule late-day reminders
    scheduleLateDayReminderCheck(
      (habitsAtRisk) => {
        displayLateDayReminder(habitsAtRisk);
      },
      'default-user'
    );
    console.log('✓ Late-day reminder check scheduled');

    console.log('🎉 App initialization complete!');
  } catch (error) {
    console.error('❌ App initialization failed:', error);
    throw error;
  }
}
```

### Workflow 3: Create New Habit

Complete workflow for creating a habit with notifications.

```typescript
import { scheduleAllHabitReminders } from '@services/NotificationService';
import { checkAllAchievements } from '@services/AchievementService';

async function createNewHabitWorkflow(habitData: CreateHabitInput) {
  const { user } = useUserStore.getState();
  const { createHabit } = useHabitStore.getState();

  // 1. Create habit in database
  const habit = createHabit(user.id, habitData);
  console.log(`Created habit: ${habit.name}`);

  // 2. Schedule notifications for all reminder times
  const notificationIds = await scheduleAllHabitReminders(habit);
  console.log(`Scheduled ${notificationIds.length} notifications`);

  // 3. Check if "Juggler" achievement unlocked (5+ habits)
  const { habits } = useHabitStore.getState();
  if (habits.length >= 5) {
    const { achievements } = useAchievementStore.getState();
    const { allTimeStats } = useStatsStore.getState();

    const newlyUnlocked = checkAllAchievements(
      user,
      habits,
      achievements,
      allTimeStats
    );

    for (const achievement of newlyUnlocked) {
      if (achievement.achievementId === 'juggler') {
        await displayAchievementNotification(
          achievement.name,
          achievement.emoji,
          achievement.xpReward
        );
      }
    }
  }

  return habit;
}
```

---

## Tips & Best Practices

### Performance

- Call `checkAllAchievements()` only after significant events (habit completion, streak breaks)
- Use `getAchievementsNearUnlock()` to show progress, not full `checkAllAchievements()`
- Cache XP calculations when displaying lists

### Error Handling

```typescript
try {
  await completeHabitWorkflow(habitId);
} catch (error) {
  console.error('Failed to complete habit:', error);
  // Show user-friendly error message
  Alert.alert('Error', 'Failed to complete habit. Please try again.');
}
```

### Testing

```typescript
// Manual midnight reset for testing
await triggerMidnightReset('test-user-id');

// Get all scheduled notifications
const notifications = await getAllScheduledNotifications();
console.log(`${notifications.length} notifications scheduled`);
```

### Debugging

```typescript
// Log XP calculation details
const xpCalc = calculateHabitXP(streak, comboStreak, wasSnoozed);
console.log('XP Calculation:', {
  base: xpCalc.baseXP,
  bonus: xpCalc.bonusXP,
  multiplier: xpCalc.multiplier,
  total: xpCalc.totalXP,
  reason: xpCalc.reason,
});

// Log achievement progress
const progress = getAchievementProgress('week_warrior', user, habits, stats);
console.log('Week Warrior progress:', `${progress}%`);
```
