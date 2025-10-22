/**
 * Daily Challenge Model
 * Represents daily bonus challenges for extra XP
 */

export type ChallengeType =
  | 'complete_before_noon'
  | 'no_snooze'
  | 'perfect_first_reminder'
  | 'early_bird'
  | 'speed_run'
  | 'weekend_warrior';

export interface DailyChallenge {
  id: string;
  date: string; // ISO date string
  challengeType: ChallengeType;
  description: string;
  xpReward: number;
  completed: boolean;
  completedAt?: string; // ISO timestamp if completed
}

export const CHALLENGE_DEFINITIONS: Record<
  ChallengeType,
  { description: string; xpReward: number }
> = {
  complete_before_noon: {
    description: 'Complete all habits before noon',
    xpReward: 100,
  },
  no_snooze: {
    description: "Don't snooze anything today",
    xpReward: 50,
  },
  perfect_first_reminder: {
    description: 'Complete all habits on first reminder',
    xpReward: 150,
  },
  early_bird: {
    description: 'Complete 3 habits before 9 AM',
    xpReward: 75,
  },
  speed_run: {
    description: 'Complete all habits within 1 hour',
    xpReward: 125,
  },
  weekend_warrior: {
    description: 'Complete Saturday & Sunday perfectly',
    xpReward: 75,
  },
};
