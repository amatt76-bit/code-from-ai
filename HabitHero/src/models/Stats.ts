/**
 * Stats Model
 * Represents user statistics and analytics
 */

export interface WeeklyStats {
  weeklyCompletions: number;
  weeklySlackerMoments: number;
  weeklySnoozes: number;
  weeklyXP: number;
  weekStartDate: string; // ISO date string
  weekEndDate: string; // ISO date string
}

export interface AllTimeStats {
  totalCompletions: number;
  totalSlackerMoments: number;
  totalSnoozes: number;
  totalXP: number;
  longestStreakOverall: number;
  totalMercyUsed: number;
  achievementsUnlocked: number;
  daysUsingApp: number;
  firstUseDate: string; // ISO date string
}

export interface HabitStats {
  habitId: string;
  habitName: string;
  completionRate: number; // Percentage (0-100)
  averageCompletionTime?: string; // Time of day (HH:MM)
  mostProductiveDay: string; // Day of week
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  last30Days: DayStatus[]; // For calendar visualization
}

export interface DayStatus {
  date: string; // ISO date string
  status: 'completed' | 'missed' | 'snoozed' | 'mercy' | 'perfect' | 'future';
  xpEarned?: number;
  completedAt?: string; // ISO timestamp
}
