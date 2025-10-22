/**
 * Notification Service
 * Handles all notifications using Notifee for Android
 */

import notifee, {
  AndroidImportance,
  AndroidStyle,
  TriggerType,
  TimestampTriggerType,
  EventType,
  Event,
} from '@notifee/react-native';
import type { Habit, PersonalityType } from '@models/Habit';
import { PERSONALITY_MESSAGES } from '@constants/messages';

/**
 * Notification channels
 */
export const NOTIFICATION_CHANNELS = {
  HABIT_REMINDERS: 'habit_reminders',
  ACHIEVEMENTS: 'achievements',
  STREAKS: 'streaks',
  LEVEL_UPS: 'level_ups',
};

/**
 * Notification actions
 */
export const NOTIFICATION_ACTIONS = {
  COMPLETE: 'complete',
  SNOOZE: 'snooze',
  SLACKER: 'slacker',
  DISMISS: 'dismiss',
};

/**
 * Initialize notification service
 */
export async function initializeNotifications(): Promise<void> {
  try {
    // Request permission
    const permission = await notifee.requestPermission();

    if (permission.authorizationStatus < 1) {
      console.warn('⚠️ Notification permission denied');
      return;
    }

    // Create notification channels
    await createNotificationChannels();

    // Set up background event handler
    setupBackgroundEventHandler();

    console.log('✅ Notifications initialized');
  } catch (error) {
    console.error('❌ Failed to initialize notifications:', error);
  }
}

/**
 * Create Android notification channels
 */
async function createNotificationChannels(): Promise<void> {
  // Habit reminders channel (high importance)
  await notifee.createChannel({
    id: NOTIFICATION_CHANNELS.HABIT_REMINDERS,
    name: 'Habit Reminders',
    description: 'Notifications for your daily habit reminders',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });

  // Achievements channel (default importance)
  await notifee.createChannel({
    id: NOTIFICATION_CHANNELS.ACHIEVEMENTS,
    name: 'Achievements',
    description: 'Notifications when you unlock achievements',
    importance: AndroidImportance.DEFAULT,
    sound: 'default',
    vibration: true,
  });

  // Streak milestones channel
  await notifee.createChannel({
    id: NOTIFICATION_CHANNELS.STREAKS,
    name: 'Streak Milestones',
    description: 'Notifications for streak milestones',
    importance: AndroidImportance.DEFAULT,
    sound: 'default',
    vibration: true,
  });

  // Level ups channel
  await notifee.createChannel({
    id: NOTIFICATION_CHANNELS.LEVEL_UPS,
    name: 'Level Ups',
    description: 'Notifications when you level up',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });
}

/**
 * Schedule habit reminder notification
 */
export async function scheduleHabitReminder(
  habit: Habit,
  reminderTime: string // Format: "HH:MM"
): Promise<string> {
  const [hours, minutes] = reminderTime.split(':').map(Number);

  // Create trigger for today at specified time
  const now = new Date();
  const triggerDate = new Date();
  triggerDate.setHours(hours, minutes, 0, 0);

  // If time has passed today, schedule for tomorrow
  if (triggerDate <= now) {
    triggerDate.setDate(triggerDate.getDate() + 1);
  }

  const notificationId = `habit_${habit.id}_${reminderTime.replace(':', '')}`;

  try {
    await notifee.createTriggerNotification(
      {
        id: notificationId,
        title: habit.nickname || habit.name,
        body: getPersonalityMessage(habit.personality, 'onReminder'),
        android: {
          channelId: NOTIFICATION_CHANNELS.HABIT_REMINDERS,
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
          actions: [
            {
              title: '✅ Complete',
              pressAction: {
                id: NOTIFICATION_ACTIONS.COMPLETE,
                launchActivity: 'default',
              },
            },
            {
              title: '💤 Snooze',
              pressAction: {
                id: NOTIFICATION_ACTIONS.SNOOZE,
                launchActivity: 'default',
              },
            },
            {
              title: '😅 Slacker',
              pressAction: {
                id: NOTIFICATION_ACTIONS.SLACKER,
                launchActivity: 'default',
              },
            },
            {
              title: '❌ Dismiss',
              pressAction: {
                id: NOTIFICATION_ACTIONS.DISMISS,
              },
            },
          ],
          smallIcon: 'ic_notification',
          largeIcon: habit.emoji ? undefined : 'ic_launcher',
          color: '#FF6B35',
          showTimestamp: true,
          tag: habit.id, // Group notifications for same habit
        },
        data: {
          habitId: habit.id,
          habitName: habit.name,
          reminderTime,
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerDate.getTime(),
        repeatFrequency: TimestampTriggerType.DAILY,
      }
    );

    return notificationId;
  } catch (error) {
    console.error(`Failed to schedule reminder for ${habit.name}:`, error);
    throw error;
  }
}

/**
 * Schedule all reminders for a habit
 */
export async function scheduleAllHabitReminders(habit: Habit): Promise<string[]> {
  const notificationIds: string[] = [];

  for (const reminderTime of habit.reminderTimes) {
    try {
      const id = await scheduleHabitReminder(habit, reminderTime);
      notificationIds.push(id);
    } catch (error) {
      console.error(`Failed to schedule ${reminderTime} reminder:`, error);
    }
  }

  return notificationIds;
}

/**
 * Cancel all notifications for a habit
 */
export async function cancelHabitNotifications(habitId: string): Promise<void> {
  try {
    // Get all scheduled notifications
    const notifications = await notifee.getTriggerNotifications();

    // Cancel all notifications for this habit
    for (const notification of notifications) {
      if (notification.notification.data?.habitId === habitId) {
        await notifee.cancelNotification(notification.notification.id!);
      }
    }

    // Also cancel displayed notifications with this tag
    await notifee.cancelNotification(habitId);
  } catch (error) {
    console.error(`Failed to cancel notifications for habit ${habitId}:`, error);
  }
}

/**
 * Cancel a specific reminder for a habit
 */
export async function cancelHabitReminder(
  habitId: string,
  reminderTime: string
): Promise<void> {
  const notificationId = `habit_${habitId}_${reminderTime.replace(':', '')}`;
  try {
    await notifee.cancelNotification(notificationId);
  } catch (error) {
    console.error(`Failed to cancel reminder ${notificationId}:`, error);
  }
}

/**
 * Display achievement unlock notification
 */
export async function displayAchievementNotification(
  achievementName: string,
  achievementEmoji: string,
  xpEarned: number
): Promise<void> {
  try {
    await notifee.displayNotification({
      title: `🎉 Achievement Unlocked!`,
      body: `${achievementEmoji} ${achievementName}\n+${xpEarned} XP`,
      android: {
        channelId: NOTIFICATION_CHANNELS.ACHIEVEMENTS,
        importance: AndroidImportance.DEFAULT,
        style: {
          type: AndroidStyle.BIGTEXT,
          text: `You unlocked: ${achievementName}\n\n${achievementEmoji} Keep up the great work!\n\n+${xpEarned} XP earned`,
        },
        color: '#FFD23F',
        smallIcon: 'ic_notification',
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
      },
    });
  } catch (error) {
    console.error('Failed to display achievement notification:', error);
  }
}

/**
 * Display level up notification
 */
export async function displayLevelUpNotification(
  newLevel: number,
  levelName: string,
  levelEmoji: string,
  unlocks: string[]
): Promise<void> {
  try {
    const unlocksText =
      unlocks.length > 0 ? `\n\nUnlocked: ${unlocks.join(', ')}` : '';

    await notifee.displayNotification({
      title: `🎊 LEVEL UP!`,
      body: `You reached Level ${newLevel}: ${levelName} ${levelEmoji}${unlocksText}`,
      android: {
        channelId: NOTIFICATION_CHANNELS.LEVEL_UPS,
        importance: AndroidImportance.HIGH,
        style: {
          type: AndroidStyle.BIGTEXT,
          text: `Congratulations! You've reached:\n\nLevel ${newLevel}: ${levelName} ${levelEmoji}${unlocksText}\n\nKeep crushing those habits!`,
        },
        color: '#4ECDC4',
        smallIcon: 'ic_notification',
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
      },
    });
  } catch (error) {
    console.error('Failed to display level up notification:', error);
  }
}

/**
 * Display streak milestone notification
 */
export async function displayStreakMilestoneNotification(
  habitName: string,
  milestone: number,
  message: string
): Promise<void> {
  try {
    await notifee.displayNotification({
      title: `🔥 ${milestone}-Day Streak!`,
      body: `${habitName}: ${message}`,
      android: {
        channelId: NOTIFICATION_CHANNELS.STREAKS,
        importance: AndroidImportance.DEFAULT,
        style: {
          type: AndroidStyle.BIGTEXT,
          text: message,
        },
        color: '#FF6B35',
        smallIcon: 'ic_notification',
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
      },
    });
  } catch (error) {
    console.error('Failed to display streak milestone notification:', error);
  }
}

/**
 * Display habit completion confirmation
 */
export async function displayCompletionNotification(
  habit: Habit,
  xpEarned: number,
  newStreak: number
): Promise<void> {
  try {
    const message = getPersonalityMessage(habit.personality, 'onCompletion');

    await notifee.displayNotification({
      title: `✅ ${habit.nickname || habit.name} completed!`,
      body: `${message}\n+${xpEarned} XP | ${newStreak}-day streak 🔥`,
      android: {
        channelId: NOTIFICATION_CHANNELS.HABIT_REMINDERS,
        importance: AndroidImportance.LOW,
        color: '#4ECDC4',
        smallIcon: 'ic_notification',
        timeoutAfter: 5000, // Auto-dismiss after 5 seconds
      },
    });
  } catch (error) {
    console.error('Failed to display completion notification:', error);
  }
}

/**
 * Display late-day reminder (for habits not completed)
 */
export async function displayLateDayReminder(
  habitsAtRisk: Habit[]
): Promise<void> {
  if (habitsAtRisk.length === 0) return;

  try {
    const habitNames = habitsAtRisk.map(h => h.nickname || h.name).join(', ');
    const streaksAtRisk = habitsAtRisk.filter(h => h.currentStreak > 0);

    const body =
      streaksAtRisk.length > 0
        ? `Don't lose your streak! ${habitNames}`
        : `You haven't completed: ${habitNames}`;

    await notifee.displayNotification({
      title: '⏰ Habit Reminder',
      body,
      android: {
        channelId: NOTIFICATION_CHANNELS.HABIT_REMINDERS,
        importance: AndroidImportance.HIGH,
        color: '#E74C3C',
        smallIcon: 'ic_notification',
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
      },
    });
  } catch (error) {
    console.error('Failed to display late-day reminder:', error);
  }
}

/**
 * Get personality-based message
 */
function getPersonalityMessage(
  personality: PersonalityType,
  type: keyof typeof PERSONALITY_MESSAGES.supportive
): string {
  const messages = PERSONALITY_MESSAGES[personality][type];
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Setup background event handler for notification actions
 */
function setupBackgroundEventHandler(): void {
  notifee.onBackgroundEvent(async ({ type, detail }: Event) => {
    const { notification, pressAction } = detail;

    if (!notification || !pressAction) return;

    const habitId = notification.data?.habitId as string;
    const habitName = notification.data?.habitName as string;

    switch (pressAction.id) {
      case NOTIFICATION_ACTIONS.COMPLETE:
        // Handle completion (should trigger store action)
        console.log(`Background: Complete habit ${habitName}`);
        // This will be handled by the app when it registers the handler
        break;

      case NOTIFICATION_ACTIONS.SNOOZE:
        // Handle snooze (should trigger store action)
        console.log(`Background: Snooze habit ${habitName}`);
        break;

      case NOTIFICATION_ACTIONS.SLACKER:
        // Handle slacker moment (should trigger store action)
        console.log(`Background: Slacker moment for ${habitName}`);
        break;

      case NOTIFICATION_ACTIONS.DISMISS:
        // Just dismiss
        console.log(`Background: Dismiss habit ${habitName}`);
        break;
    }

    // Remove the notification after action
    if (notification.id) {
      await notifee.cancelNotification(notification.id);
    }
  });
}

/**
 * Setup foreground event handler (to be called in App.tsx)
 */
export function setupForegroundEventHandler(
  onComplete: (habitId: string) => void,
  onSnooze: (habitId: string) => void,
  onSlacker: (habitId: string) => void
): () => void {
  return notifee.onForegroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;

    if (type === EventType.PRESS && notification && pressAction) {
      const habitId = notification.data?.habitId as string;

      switch (pressAction.id) {
        case NOTIFICATION_ACTIONS.COMPLETE:
          onComplete(habitId);
          break;
        case NOTIFICATION_ACTIONS.SNOOZE:
          onSnooze(habitId);
          break;
        case NOTIFICATION_ACTIONS.SLACKER:
          onSlacker(habitId);
          break;
      }

      // Remove the notification
      if (notification.id) {
        await notifee.cancelNotification(notification.id);
      }
    }
  });
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getAllScheduledNotifications(): Promise<any[]> {
  try {
    const notifications = await notifee.getTriggerNotifications();
    return notifications;
  } catch (error) {
    console.error('Failed to get scheduled notifications:', error);
    return [];
  }
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await notifee.cancelAllNotifications();
    console.log('✅ All notifications cancelled');
  } catch (error) {
    console.error('Failed to cancel all notifications:', error);
  }
}

/**
 * Reschedule all habit reminders (useful after app restart)
 */
export async function rescheduleAllHabitReminders(habits: Habit[]): Promise<void> {
  console.log(`📅 Rescheduling reminders for ${habits.length} habits...`);

  // Cancel all existing habit reminders first
  const existing = await notifee.getTriggerNotifications();
  for (const notification of existing) {
    if (notification.notification.android?.channelId === NOTIFICATION_CHANNELS.HABIT_REMINDERS) {
      await notifee.cancelNotification(notification.notification.id!);
    }
  }

  // Schedule new reminders
  for (const habit of habits) {
    try {
      await scheduleAllHabitReminders(habit);
    } catch (error) {
      console.error(`Failed to reschedule reminders for ${habit.name}:`, error);
    }
  }

  console.log('✅ All reminders rescheduled');
}
