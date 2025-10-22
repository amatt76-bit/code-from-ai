/**
 * Unit Tests for Habit Queries
 * Tests critical fixes: NULL conversion, JSON parsing, date validation, transactions
 */

import { getDatabase } from '@database/schema';
import type { Habit } from '@models/Habit';

// Mock the database module
jest.mock('@database/schema', () => ({
  getDatabase: jest.fn(),
}));

// Mock UUID
jest.mock('react-native-uuid', () => ({
  v4: jest.fn(() => 'test-habit-id-1234'),
}));

// Import functions to test (after mocks)
const mockExecute = jest.fn();
const mockDb = {
  execute: mockExecute,
  executeAsync: jest.fn(),
  executeBatch: jest.fn(),
  close: jest.fn(),
};

(getDatabase as jest.Mock).mockReturnValue(mockDb);

// Now import the module under test
import {
  getHabitById,
  getAllHabits,
  createHabit,
  updateHabit,
  completeHabit,
  deleteHabit,
} from '@database/queries/habitQueries';

describe('habitQueries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('NULL to undefined conversion in mapRowToHabit()', () => {
    it('should convert NULL nickname to undefined', () => {
      const mockRow = {
        id: 'habit-1',
        name: 'Exercise',
        nickname: null, // NULL from database
        emoji: '💪',
        reminder_times: JSON.stringify(['08:00', '18:00']),
        current_streak: 5,
        best_streak: 10,
        last_completed_date: '2025-10-21',
        created_date: '2025-10-01',
        today_status: 'not_done',
        snoozed_until: null,
        snoozes_count: 0,
        personality: 'supportive',
      };

      mockExecute.mockReturnValue({
        rows: {
          length: 1,
          item: (index: number) => mockRow,
        },
      });

      const habit = getHabitById('habit-1');

      expect(habit).not.toBeNull();
      expect(habit?.nickname).toBeUndefined(); // Should be undefined, not null
    });

    it('should convert NULL emoji to undefined', () => {
      const mockRow = {
        id: 'habit-1',
        name: 'Exercise',
        nickname: 'Morning workout',
        emoji: null, // NULL from database
        reminder_times: JSON.stringify(['08:00']),
        current_streak: 0,
        best_streak: 0,
        last_completed_date: null,
        created_date: '2025-10-22',
        today_status: 'not_done',
        snoozed_until: null,
        snoozes_count: 0,
        personality: 'drill',
      };

      mockExecute.mockReturnValue({
        rows: {
          length: 1,
          item: (index: number) => mockRow,
        },
      });

      const habit = getHabitById('habit-1');

      expect(habit).not.toBeNull();
      expect(habit?.emoji).toBeUndefined(); // Should be undefined, not null
    });

    it('should convert NULL lastCompletedDate to undefined', () => {
      const mockRow = {
        id: 'habit-1',
        name: 'New Habit',
        nickname: null,
        emoji: '🌟',
        reminder_times: JSON.stringify(['09:00']),
        current_streak: 0,
        best_streak: 0,
        last_completed_date: null, // NULL from database
        created_date: '2025-10-22',
        today_status: 'not_done',
        snoozed_until: null,
        snoozes_count: 0,
        personality: 'zen',
      };

      mockExecute.mockReturnValue({
        rows: {
          length: 1,
          item: (index: number) => mockRow,
        },
      });

      const habit = getHabitById('habit-1');

      expect(habit).not.toBeNull();
      expect(habit?.lastCompletedDate).toBeUndefined(); // Should be undefined, not null
    });

    it('should convert NULL snoozedUntil to undefined', () => {
      const mockRow = {
        id: 'habit-1',
        name: 'Meditation',
        nickname: null,
        emoji: '🧘',
        reminder_times: JSON.stringify(['07:00']),
        current_streak: 3,
        best_streak: 5,
        last_completed_date: '2025-10-21',
        created_date: '2025-10-15',
        today_status: 'not_done',
        snoozed_until: null, // NULL from database
        snoozes_count: 0,
        personality: 'supportive',
      };

      mockExecute.mockReturnValue({
        rows: {
          length: 1,
          item: (index: number) => mockRow,
        },
      });

      const habit = getHabitById('habit-1');

      expect(habit).not.toBeNull();
      expect(habit?.snoozedUntil).toBeUndefined(); // Should be undefined, not null
    });

    it('should preserve defined values (not convert them to undefined)', () => {
      const mockRow = {
        id: 'habit-1',
        name: 'Reading',
        nickname: 'Book time',
        emoji: '📚',
        reminder_times: JSON.stringify(['20:00']),
        current_streak: 7,
        best_streak: 10,
        last_completed_date: '2025-10-21',
        created_date: '2025-10-01',
        today_status: 'completed',
        snoozed_until: 1729612800000,
        snoozes_count: 2,
        personality: 'sarcastic',
      };

      mockExecute.mockReturnValue({
        rows: {
          length: 1,
          item: (index: number) => mockRow,
        },
      });

      const habit = getHabitById('habit-1');

      expect(habit).not.toBeNull();
      expect(habit?.nickname).toBe('Book time');
      expect(habit?.emoji).toBe('📚');
      expect(habit?.lastCompletedDate).toBe('2025-10-21');
      expect(habit?.snoozedUntil).toBe(1729612800000);
    });
  });

  describe('JSON.parse error handling in mapRowToHabit()', () => {
    it('should handle invalid JSON in reminder_times gracefully', () => {
      const mockRow = {
        id: 'habit-1',
        name: 'Exercise',
        nickname: null,
        emoji: '💪',
        reminder_times: 'INVALID_JSON{{{', // Corrupted JSON
        current_streak: 5,
        best_streak: 10,
        last_completed_date: '2025-10-21',
        created_date: '2025-10-01',
        today_status: 'not_done',
        snoozed_until: null,
        snoozes_count: 0,
        personality: 'supportive',
      };

      mockExecute.mockReturnValue({
        rows: {
          length: 1,
          item: (index: number) => mockRow,
        },
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const habit = getHabitById('habit-1');

      expect(habit).not.toBeNull();
      expect(habit?.reminderTimes).toEqual([]); // Should fallback to empty array
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse reminder_times'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle non-array JSON in reminder_times', () => {
      const mockRow = {
        id: 'habit-1',
        name: 'Exercise',
        nickname: null,
        emoji: '💪',
        reminder_times: JSON.stringify({ invalid: 'object' }), // Valid JSON but not array
        current_streak: 5,
        best_streak: 10,
        last_completed_date: '2025-10-21',
        created_date: '2025-10-01',
        today_status: 'not_done',
        snoozed_until: null,
        snoozes_count: 0,
        personality: 'supportive',
      };

      mockExecute.mockReturnValue({
        rows: {
          length: 1,
          item: (index: number) => mockRow,
        },
      });

      const habit = getHabitById('habit-1');

      expect(habit).not.toBeNull();
      expect(habit?.reminderTimes).toEqual([]); // Should fallback to empty array
    });

    it('should parse valid JSON reminder_times correctly', () => {
      const mockRow = {
        id: 'habit-1',
        name: 'Exercise',
        nickname: null,
        emoji: '💪',
        reminder_times: JSON.stringify(['08:00', '12:00', '18:00']),
        current_streak: 5,
        best_streak: 10,
        last_completed_date: '2025-10-21',
        created_date: '2025-10-01',
        today_status: 'not_done',
        snoozed_until: null,
        snoozes_count: 0,
        personality: 'supportive',
      };

      mockExecute.mockReturnValue({
        rows: {
          length: 1,
          item: (index: number) => mockRow,
        },
      });

      const habit = getHabitById('habit-1');

      expect(habit).not.toBeNull();
      expect(habit?.reminderTimes).toEqual(['08:00', '12:00', '18:00']);
    });
  });

  describe('Date validation in calculateNewStreak()', () => {
    it('should handle invalid lastCompletedDate gracefully', () => {
      // First call: getHabitById returns habit with invalid date
      const mockHabitRow = {
        id: 'habit-1',
        name: 'Exercise',
        nickname: null,
        emoji: '💪',
        reminder_times: JSON.stringify(['08:00']),
        current_streak: 5,
        best_streak: 10,
        last_completed_date: 'INVALID_DATE', // Invalid date string
        created_date: '2025-10-01',
        today_status: 'not_done',
        snoozed_until: null,
        snoozes_count: 0,
        personality: 'supportive',
      };

      mockExecute.mockReturnValue({
        rows: {
          length: 1,
          item: (index: number) => mockHabitRow,
        },
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Call completeHabit which internally calls calculateNewStreak
      completeHabit('habit-1', 50);

      // Should log error about invalid date
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid date in streak calculation'),
      );

      // Should still execute BEGIN TRANSACTION
      expect(mockExecute).toHaveBeenCalledWith('BEGIN TRANSACTION');

      consoleErrorSpy.mockRestore();
    });

    it('should calculate streak correctly for consecutive days', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const mockHabitRow = {
        id: 'habit-1',
        name: 'Exercise',
        nickname: null,
        emoji: '💪',
        reminder_times: JSON.stringify(['08:00']),
        current_streak: 5,
        best_streak: 10,
        last_completed_date: yesterdayStr, // Yesterday
        created_date: '2025-10-01',
        today_status: 'not_done',
        snoozed_until: null,
        snoozes_count: 0,
        personality: 'supportive',
      };

      mockExecute.mockReturnValue({
        rows: {
          length: 1,
          item: (index: number) => mockHabitRow,
        },
      });

      completeHabit('habit-1', 50);

      // Should update streak to current + 1 (5 + 1 = 6)
      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('current_streak = ?'),
        expect.arrayContaining([6, 6, 'habit-1'])
      );
    });

    it('should reset streak to 1 when broken (more than 1 day gap)', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];

      const mockHabitRow = {
        id: 'habit-1',
        name: 'Exercise',
        nickname: null,
        emoji: '💪',
        reminder_times: JSON.stringify(['08:00']),
        current_streak: 5,
        best_streak: 10,
        last_completed_date: threeDaysAgoStr, // 3 days ago
        created_date: '2025-10-01',
        today_status: 'not_done',
        snoozed_until: null,
        snoozes_count: 0,
        personality: 'supportive',
      };

      mockExecute.mockReturnValue({
        rows: {
          length: 1,
          item: (index: number) => mockHabitRow,
        },
      });

      completeHabit('habit-1', 50);

      // Should reset streak to 1
      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('current_streak = ?'),
        expect.arrayContaining([1, 1, 'habit-1'])
      );
    });
  });

  describe('Transaction rollback in completeHabit()', () => {
    it('should rollback transaction on database error', () => {
      const mockHabitRow = {
        id: 'habit-1',
        name: 'Exercise',
        nickname: null,
        emoji: '💪',
        reminder_times: JSON.stringify(['08:00']),
        current_streak: 5,
        best_streak: 10,
        last_completed_date: '2025-10-21',
        created_date: '2025-10-01',
        today_status: 'not_done',
        snoozed_until: null,
        snoozes_count: 0,
        personality: 'supportive',
      };

      // First call: getHabitById succeeds
      // Subsequent calls: simulate database error
      mockExecute
        .mockReturnValueOnce({
          rows: {
            length: 1,
            item: (index: number) => mockHabitRow,
          },
        })
        .mockReturnValueOnce(undefined) // BEGIN TRANSACTION
        .mockImplementationOnce(() => {
          throw new Error('Database constraint violation');
        });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => completeHabit('habit-1', 50)).toThrow('Database constraint violation');

      // Should have called ROLLBACK
      expect(mockExecute).toHaveBeenCalledWith('ROLLBACK');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to complete habit, transaction rolled back'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should commit transaction on success', () => {
      const mockHabitRow = {
        id: 'habit-1',
        name: 'Exercise',
        nickname: null,
        emoji: '💪',
        reminder_times: JSON.stringify(['08:00']),
        current_streak: 5,
        best_streak: 10,
        last_completed_date: '2025-10-21',
        created_date: '2025-10-01',
        today_status: 'not_done',
        snoozed_until: null,
        snoozes_count: 0,
        personality: 'supportive',
      };

      mockExecute.mockReturnValue({
        rows: {
          length: 1,
          item: (index: number) => mockHabitRow,
        },
      });

      completeHabit('habit-1', 50);

      // Should have called BEGIN, then COMMIT (not ROLLBACK)
      expect(mockExecute).toHaveBeenCalledWith('BEGIN TRANSACTION');
      expect(mockExecute).toHaveBeenCalledWith('COMMIT');
      expect(mockExecute).not.toHaveBeenCalledWith('ROLLBACK');
    });

    it('should execute all operations in correct order within transaction', () => {
      const mockHabitRow = {
        id: 'habit-1',
        name: 'Exercise',
        nickname: null,
        emoji: '💪',
        reminder_times: JSON.stringify(['08:00']),
        current_streak: 5,
        best_streak: 10,
        last_completed_date: '2025-10-21',
        created_date: '2025-10-01',
        today_status: 'not_done',
        snoozed_until: null,
        snoozes_count: 0,
        personality: 'supportive',
      };

      mockExecute.mockReturnValue({
        rows: {
          length: 1,
          item: (index: number) => mockHabitRow,
        },
      });

      completeHabit('habit-1', 50);

      const calls = mockExecute.mock.calls;

      // Find transaction-related calls
      const beginIndex = calls.findIndex(call => call[0] === 'BEGIN TRANSACTION');
      const commitIndex = calls.findIndex(call => call[0] === 'COMMIT');

      expect(beginIndex).toBeGreaterThan(-1);
      expect(commitIndex).toBeGreaterThan(beginIndex);

      // Verify all UPDATE/INSERT calls are between BEGIN and COMMIT
      for (let i = beginIndex + 1; i < commitIndex; i++) {
        const query = calls[i][0] as string;
        expect(query).toMatch(/UPDATE|INSERT/);
      }
    });
  });

  describe('Additional functionality tests', () => {
    it('should return null when habit not found', () => {
      mockExecute.mockReturnValue({
        rows: {
          length: 0,
          item: (index: number) => null,
        },
      });

      const habit = getHabitById('non-existent-id');

      expect(habit).toBeNull();
    });

    it('should return empty array when user has no habits', () => {
      mockExecute.mockReturnValue({
        rows: {
          length: 0,
          item: (index: number) => null,
        },
      });

      const habits = getAllHabits('user-1');

      expect(habits).toEqual([]);
    });

    it('should throw error when completing non-existent habit', () => {
      mockExecute.mockReturnValue({
        rows: {
          length: 0,
          item: (index: number) => null,
        },
      });

      expect(() => completeHabit('non-existent-id', 50)).toThrow('Habit not found');
    });
  });
});
