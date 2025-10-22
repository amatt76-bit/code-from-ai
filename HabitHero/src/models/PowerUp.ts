/**
 * Power-Up Model
 * Represents unlockable power-ups that enhance the experience
 */

export type PowerUpType =
  | 'extra_snooze'
  | 'bonus_mercy_pass'
  | 'stealth_mode'
  | 'streak_shield'
  | 'double_xp_day'
  | 'combo_extender';

export interface PowerUp {
  id: string;
  type: PowerUpType;
  name: string;
  description: string;
  emoji: string;
  unlockLevel: number;
  costToActivate: number; // XP cost
  isUnlocked: boolean;
  isActive: boolean;
  isPermanent: boolean; // Some power-ups are permanent once unlocked
  activatedAt?: string; // ISO timestamp if active
  cooldownEnds?: string; // ISO timestamp if on cooldown
  usesRemaining?: number; // For limited-use power-ups
  maxUses?: number; // Maximum uses per period (if applicable)
}

export const POWER_UP_DEFINITIONS: Record<
  PowerUpType,
  Omit<PowerUp, 'id' | 'isUnlocked' | 'isActive' | 'activatedAt' | 'cooldownEnds' | 'usesRemaining'>
> = {
  extra_snooze: {
    type: 'extra_snooze',
    name: 'Extra Snooze',
    description: 'Adds 90-minute snooze option for 1 day',
    emoji: '⏰',
    unlockLevel: 5,
    costToActivate: 100,
    isPermanent: false,
    maxUses: undefined,
  },
  bonus_mercy_pass: {
    type: 'bonus_mercy_pass',
    name: 'Bonus Mercy Pass',
    description: 'Get 2 mercy passes per month instead of 1',
    emoji: '💎',
    unlockLevel: 15,
    costToActivate: 0,
    isPermanent: true,
    maxUses: undefined,
  },
  stealth_mode: {
    type: 'stealth_mode',
    name: 'Stealth Mode',
    description: 'Silent notifications for 1 day',
    emoji: '🔇',
    unlockLevel: 7,
    costToActivate: 50,
    isPermanent: false,
    maxUses: undefined,
  },
  streak_shield: {
    type: 'streak_shield',
    name: 'Streak Shield',
    description: 'Auto-uses mercy pass if you forget (1x per month)',
    emoji: '🛡️',
    unlockLevel: 10,
    costToActivate: 0,
    isPermanent: true,
    maxUses: 1,
  },
  double_xp_day: {
    type: 'double_xp_day',
    name: 'Double XP Day',
    description: 'Pick any day for 2x points (1x per week)',
    emoji: '🎯',
    unlockLevel: 12,
    costToActivate: 200,
    isPermanent: false,
    maxUses: 1,
  },
  combo_extender: {
    type: 'combo_extender',
    name: 'Combo Extender',
    description: 'Preserves combo multiplier for 1 missed day',
    emoji: '🔥',
    unlockLevel: 18,
    costToActivate: 300,
    isPermanent: false,
    maxUses: undefined,
  },
};
