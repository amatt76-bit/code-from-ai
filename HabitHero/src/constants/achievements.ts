/**
 * Achievement Definitions
 * All available achievements in the app
 */

import { Achievement } from '@models/Achievement';

export const ACHIEVEMENTS: Omit<
  Achievement,
  'unlockedDate' | 'progress'
>[] = [
  // Starter Achievements
  {
    id: 'first_win',
    name: 'First Win',
    description: 'Complete any habit for the first time',
    emoji: '🎯',
    category: 'starter',
    requirement: { type: 'count', target: 1 },
  },
  {
    id: 'getting_warm',
    name: 'Getting Warm',
    description: 'Achieve a 3-day streak',
    emoji: '🔥',
    category: 'starter',
    requirement: { type: 'streak', target: 3 },
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    emoji: '💪',
    category: 'starter',
    requirement: { type: 'streak', target: 7 },
  },
  {
    id: 'fortnight_fighter',
    name: 'Fortnight Fighter',
    description: 'Keep going for 14 days straight',
    emoji: '🚀',
    category: 'starter',
    requirement: { type: 'streak', target: 14 },
  },
  {
    id: 'monthly_master',
    name: 'Monthly Master',
    description: 'Dominate with a 30-day streak',
    emoji: '👑',
    category: 'starter',
    requirement: { type: 'streak', target: 30 },
  },

  // Consistency Achievements
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Complete all habits for 7 days straight',
    emoji: '💯',
    category: 'consistency',
    requirement: { type: 'perfect_week', target: 1 },
  },
  {
    id: 'juggler',
    name: 'Juggler',
    description: 'Maintain 5+ habits simultaneously',
    emoji: '🎪',
    category: 'consistency',
    requirement: { type: 'custom', target: 5, customCheck: 'active_habits' },
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Reach a 100-day streak',
    emoji: '🏆',
    category: 'consistency',
    requirement: { type: 'streak', target: 100 },
  },
  {
    id: 'hall_of_fame',
    name: 'Hall of Fame',
    description: 'Achieve a legendary 365-day streak',
    emoji: '🎉',
    category: 'consistency',
    requirement: { type: 'streak', target: 365 },
  },

  // Speed Achievements
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete within 5 minutes of reminder 10 times',
    emoji: '⚡',
    category: 'speed',
    requirement: { type: 'count', target: 10, customCheck: 'fast_completion' },
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete before 8 AM twenty times',
    emoji: '🌅',
    category: 'speed',
    requirement: { type: 'count', target: 20, customCheck: 'early_morning' },
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete after 10 PM twenty times',
    emoji: '🌙',
    category: 'speed',
    requirement: { type: 'count', target: 20, customCheck: 'late_night' },
  },

  // Comeback Achievements
  {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Rebuild a 30-day streak after breaking one',
    emoji: '🦸',
    category: 'comeback',
    requirement: { type: 'custom', target: 30, customCheck: 'rebuild_streak' },
  },
  {
    id: 'phoenix_rising',
    name: 'Phoenix Rising',
    description: 'Complete Phoenix Mode challenge',
    emoji: '🔥',
    category: 'comeback',
    requirement: { type: 'custom', target: 1, customCheck: 'phoenix_mode' },
  },
  {
    id: 'resilient',
    name: 'Resilient',
    description: 'Use 3 mercy passes in a single month',
    emoji: '💎',
    category: 'comeback',
    requirement: { type: 'custom', target: 3, customCheck: 'mercy_usage' },
  },

  // Shame Badges (Funny)
  {
    id: 'snooze_master',
    name: 'Snooze Master',
    description: 'Snoozed 100 times (not proud, but honest)',
    emoji: '😴',
    category: 'shame',
    requirement: { type: 'snoozes', target: 100 },
  },
  {
    id: 'professional_slacker',
    name: 'Professional Slacker',
    description: 'Hit the slacker button 50 times',
    emoji: '😅',
    category: 'shame',
    requirement: { type: 'custom', target: 50, customCheck: 'slacker_count' },
  },
  {
    id: 'oops',
    name: 'Oops',
    description: 'Broke a 50+ day streak (it happens)',
    emoji: '🤦',
    category: 'shame',
    requirement: { type: 'custom', target: 1, customCheck: 'long_streak_break' },
  },
  {
    id: 'mercy_addict',
    name: 'Mercy Addict',
    description: 'Used all 12 yearly mercy passes',
    emoji: '💎',
    category: 'shame',
    requirement: { type: 'custom', target: 12, customCheck: 'yearly_mercy' },
  },

  // Special Achievements
  {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    description: 'Never miss a single habit in 30 days',
    emoji: '🎯',
    category: 'special',
    requirement: { type: 'custom', target: 30, customCheck: 'perfect_month' },
  },
  {
    id: 'prestige',
    name: 'Prestige',
    description: 'Reset at Level 20 and earn prestige status',
    emoji: '🌟',
    category: 'special',
    requirement: { type: 'custom', target: 1, customCheck: 'prestige' },
  },
  {
    id: 'diamond',
    name: 'Diamond',
    description: 'Maintain 10+ habits for 90 days',
    emoji: '💎',
    category: 'special',
    requirement: { type: 'custom', target: 90, customCheck: 'ten_habits' },
  },
  {
    id: 'nice',
    name: 'Nice',
    description: 'Reach a 69-day streak (nice)',
    emoji: '😏',
    category: 'special',
    requirement: { type: 'streak', target: 69 },
  },
];

export function getAchievementById(id: string): Achievement | undefined {
  const achievement = ACHIEVEMENTS.find(a => a.id === id);
  if (!achievement) return undefined;

  return {
    ...achievement,
    unlockedDate: undefined,
    progress: 0,
  };
}

export function getAllAchievements(): Achievement[] {
  return ACHIEVEMENTS.map(a => ({
    ...a,
    unlockedDate: undefined,
    progress: 0,
  }));
}
