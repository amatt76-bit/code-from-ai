/**
 * Personality Messages
 * Messages for different personality types and events
 */

import { PersonalityType } from '@models/Habit';

export interface PersonalityMessages {
  onCompletion: string[];
  onStreakBreak: string[];
  onSnooze: string[];
  onThirdSnooze: string[];
}

export const PERSONALITY_MESSAGES: Record<PersonalityType, PersonalityMessages> = {
  supportive: {
    onCompletion: [
      'You did it! So proud of you! 🌟',
      'Look at you being all responsible!',
      'Another one bites the dust! ✓',
      "You're literally better than yesterday's you!",
      'Keep this energy going! 💙',
      'Crushing it! Keep going!',
      'You showed up! That matters! 💪',
      'Every step counts. Well done!',
      'You deserve all the good vibes!',
      'Consistency is key, and you have it!',
    ],
    onStreakBreak: [
      "It's okay! Tomorrow's a fresh start 💙",
      'Life happens. Let's bounce back together!',
      "You've got this. One bad day doesn't define you.",
      'Tomorrow is a new opportunity!',
      'We all stumble. What matters is getting back up!',
      "You're still amazing. Let's try again!",
    ],
    onSnooze: [
      'Taking a breather? That's okay!',
      'No rush, you'll get to it!',
      'Self-care is important too!',
      "I believe in you, whenever you're ready!",
    ],
    onThirdSnooze: [
      'Hey, still here for you when you're ready 💙',
      'Third time... maybe now? No pressure!',
      "You've got a few more minutes. You can do it!",
    ],
  },

  sarcastic: {
    onCompletion: [
      'Look at you being all responsible for once 😏',
      'Finally decided to show up, huh?',
      'Wow, you actually did it. Shocking.',
      "Crushing it like it's your job... oh wait.",
      'Nice work, try not to break this streak like the last one',
      'Well, well, well. Someone's feeling productive',
      'You did a thing! Alert the media!',
      'Fancy seeing you here, being productive',
      'Oh, so we're trying today? Interesting...',
      'Someone woke up on the productive side of the bed',
    ],
    onStreakBreak: [
      '47 days? Gone. Hope it was worth it 🙄',
      'And just like that, back to square one',
      "Well, at least you're consistent at being inconsistent",
      'Oops. That was quite the streak you had...',
      'Another one bites the dust. Literally.',
      'Starting over is fun, right? Right?!',
    ],
    onSnooze: [
      'Oh, just 5 more minutes? Classic.',
      'Sure, why do it now when you can do it later?',
      'Procrastination is an art, and you're Picasso',
      'Snoozing again? Bold strategy.',
    ],
    onThirdSnooze: [
      "Third snooze? Living dangerously I see...",
      "This habit isn't going to do itself 👀",
      'Still finding excuses, huh?',
      'At this point just admit you forgot',
    ],
  },

  drill: {
    onCompletion: [
      'OUTSTANDING! NOW DROP AND GIVE ME 20!',
      "THAT'S WHAT I'M TALKING ABOUT!",
      'NO EXCUSES! YOU SHOWED UP!',
      'WARRIOR MENTALITY! KEEP PUSHING!',
      'EXCELLENCE! MAINTAIN THAT DISCIPLINE!',
      'SOLID WORK, SOLDIER! KEEP MARCHING!',
      'VICTORY! NOW ONTO THE NEXT ONE!',
      'DISCIPLINE EQUALS FREEDOM! HOORAH!',
      'THAT'S HOW CHAMPIONS DO IT!',
      'NO RETREAT, NO SURRENDER! WELL DONE!',
    ],
    onStreakBreak: [
      'UNACCEPTABLE! GET BACK OUT THERE!',
      'FAILURE IS NOT AN OPTION! RECOVER NOW!',
      'NO WEAKNESS! START AGAIN, SOLDIER!',
      'THIS IS A SETBACK, NOT A DEFEAT! MOVE!',
      'GET UP! WINNERS NEVER QUIT!',
      'PAIN IS TEMPORARY! GLORY IS FOREVER!',
    ],
    onSnooze: [
      'NO SNOOZING! MOVE IT, MOVE IT, MOVE IT!',
      'PAIN IS TEMPORARY! GLORY IS FOREVER!',
      'EXCUSES ARE FOR THE WEAK!',
      'DO IT NOW! TIME IS WASTING!',
    ],
    onThirdSnooze: [
      'THIRD SNOOZE?! ARE YOU KIDDING ME?!',
      'NO MORE EXCUSES! DO IT NOW!',
      'THIS IS EMBARRASSING! GET TO WORK!',
      'I EXPECTED MORE FROM YOU! MOVE!',
    ],
  },

  zen: {
    onCompletion: [
      'The journey of a thousand miles begins with a single step 🧘',
      'In this moment, you are enough',
      'Peace comes from consistent action',
      'You honor yourself with discipline',
      'Like water shaping stone, small actions create great change',
      'The present moment is all we have. You used it wisely.',
      'Balance comes from within. Well done.',
      'Mindfulness leads to progress. Namaste.',
      'The path reveals itself to those who walk it',
      'Inner peace, outer success',
    ],
    onStreakBreak: [
      'Every ending is a new beginning, grasshopper 🌸',
      'The river flows forward, not backward',
      'One moment of rest does not stop the journey',
      'From stillness comes movement. Begin again.',
      'The lotus grows from mud. Your next chapter awaits.',
      'Impermanence is the nature of all things',
    ],
    onSnooze: [
      'Patience is a virtue. Take your time.',
      'The right moment will come',
      'Listen to your body. Rest if needed.',
      'There is wisdom in waiting',
    ],
    onThirdSnooze: [
      'The universe whispers: perhaps now?',
      'Balance requires action and rest. Choose wisely.',
      'Three times you've paused. What is your heart saying?',
    ],
  },
};

// Streak Milestone Messages
export const STREAK_MILESTONES: Record<number, { emoji: string; message: string }> = {
  3: { emoji: '🔥', message: 'Hot streak!' },
  7: { emoji: '💪', message: '1 week!' },
  14: { emoji: '🚀', message: '2 weeks!' },
  30: { emoji: '👑', message: '30 days!' },
  50: { emoji: '⭐', message: 'Halfway to 100!' },
  69: { emoji: '😏', message: 'Nice.' },
  100: { emoji: '🏆', message: 'LEGEND!' },
  365: { emoji: '🎉', message: 'YEARLY CHAMP!' },
};

// Level Up Messages
export const LEVEL_UP_MESSAGES = [
  'LEVEL UP! You're unstoppable! 🎉',
  'NEW LEVEL UNLOCKED! Keep crushing it! 💪',
  'LEVEL UP! Your dedication is paying off! ⭐',
  'BOOM! Level up! You're on fire! 🔥',
  'NEXT LEVEL! This is just the beginning! 🚀',
];

// XP Bonus Messages
export const XP_BONUS_MESSAGES = {
  earlyCompletion: 'Early bird bonus! 🌅',
  firstOfDay: 'First win of the day! 🏆',
  allCompleted: 'ALL HABITS DONE! Beast mode! 💪',
  perfectWeek: 'PERFECT WEEK! You're a legend! 👑',
  comboMultiplier: 'Combo multiplier active! 🔥',
};

export function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}
