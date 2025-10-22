# 🏆 Habit Hero - Gamified Habit Tracker

A gamified habit tracking app with personality, XP system, achievements, and playful accountability. Built with React Native for Android.

## 📱 Features

### Core Features
- ✅ **Multiple Habits** - Track unlimited habits with custom reminders
- 🔥 **Streak Tracking** - Build and maintain daily streaks
- 💪 **XP & Leveling System** - Earn points and level up
- 🏆 **Achievements** - Unlock badges and milestones
- 🎯 **Daily Challenges** - Bonus XP for completing challenges
- 😊 **Personality Modes** - Choose your coaching style (Supportive, Sarcastic, Drill Sergeant, Zen)

### Gamification
- 🎮 Combo multipliers (3-day, 7-day, 30-day streaks)
- 🎉 Milestone celebrations with confetti
- 💎 Mercy Pass system (save broken streaks)
- ⚡ Power-ups (unlock with levels)
- 🌟 Prestige system (reset at Level 20 for 2x XP forever)
- 🥊 Weekend Battles (habit vs habit challenges)

### Smart Notifications
- ⏰ Multiple daily reminders per habit
- 🏆 Quick action buttons: Winner / Snooze / Reschedule / Slacker
- 📊 Intelligent scheduling
- 🔕 Customizable notification preferences

### Analytics & Stats
- 📈 Weekly and all-time statistics
- 📅 30-day calendar visualization
- 🎯 Completion rates and trends
- 🏅 Achievement progress tracking
- 📊 Habit-specific insights

## 🛠️ Tech Stack

### Framework & Language
- **React Native** 0.76.2
- **TypeScript** 5.6.2

### State Management
- **Zustand** - Lightweight state management with persistence

### Database
- **@op-engineering/op-sqlite** - High-performance SQLite for complex data

### Notifications
- **@notifee/react-native** - Advanced Android notifications with action buttons

### Navigation
- **React Navigation** 6.x - Bottom tabs + stack navigation

### Animations
- **React Native Reanimated** 3.x - Smooth 60fps animations
- **Lottie** - Complex celebration animations
- **Confetti Cannon** - Milestone celebrations
- **React Native Animatable** - Simple entrance/exit animations

### UI & Charts
- **React Native Gifted Charts** - Performance-optimized charts
- **React Native Vector Icons** - Icon library
- **React Native Calendars** - Calendar visualization
- **React Native Linear Gradient** - Gradient backgrounds

### Utilities
- **date-fns** - Date manipulation and formatting
- **MMKV** - Ultra-fast key-value storage
- **React Native Haptic Feedback** - Tactile feedback
- **React Native Sound** - Sound effects

## 📁 Project Structure

```
HabitHero/
├── android/                 # Android native code
├── ios/                     # iOS native code (future)
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Button, Card, Input, etc.
│   │   ├── habit/           # HabitCard, HabitForm, etc.
│   │   ├── gamification/    # XPBar, LevelBadge, AchievementCard
│   │   └── animations/      # Confetti, Celebration, etc.
│   ├── screens/             # App screens
│   │   ├── HomeScreen/      # Main habit dashboard
│   │   ├── StatsScreen/     # Statistics and analytics
│   │   ├── AchievementsScreen/
│   │   ├── SettingsScreen/
│   │   └── onboarding/      # First-time user flow
│   ├── navigation/          # Navigation configuration
│   │   ├── RootNavigator.tsx
│   │   ├── TabNavigator.tsx
│   │   └── types.ts
│   ├── store/               # Zustand stores
│   │   ├── habitStore.ts
│   │   ├── userStore.ts
│   │   ├── achievementStore.ts
│   │   └── settingsStore.ts
│   ├── database/            # SQLite database
│   │   ├── schema.ts
│   │   ├── migrations.ts
│   │   ├── queries/
│   │   └── seeders/
│   ├── models/              # TypeScript types and interfaces
│   │   ├── Habit.ts
│   │   ├── User.ts
│   │   ├── Achievement.ts
│   │   ├── Stats.ts
│   │   └── Challenge.ts
│   ├── services/            # Business logic
│   │   ├── NotificationService.ts
│   │   ├── XPService.ts
│   │   ├── StreakService.ts
│   │   ├── AchievementService.ts
│   │   └── MidnightResetService.ts
│   ├── utils/               # Helper functions
│   │   ├── xpCalculator.ts
│   │   ├── streakCalculator.ts
│   │   ├── dateHelpers.ts
│   │   └── validators.ts
│   ├── hooks/               # Custom React hooks
│   │   ├── useHabits.ts
│   │   ├── useNotifications.ts
│   │   └── useAnimations.ts
│   ├── theme/               # Theme configuration
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── animations.ts
│   ├── constants/           # App constants
│   │   ├── messages.ts      # Personality messages
│   │   ├── achievements.ts
│   │   ├── levels.ts
│   │   └── challenges.ts
│   └── App.tsx              # Root component
├── assets/                  # Images, fonts, sounds
│   ├── images/
│   ├── fonts/
│   ├── sounds/
│   └── animations/
├── __tests__/               # Test files
├── .env.example             # Environment variables template
├── babel.config.js
├── metro.config.js
├── tsconfig.json
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm or yarn
- Android Studio (for Android development)
- JDK 17
- React Native CLI

### Installation

1. **Clone the repository**
```bash
cd HabitHero
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

4. **Install iOS dependencies** (if developing for iOS)
```bash
cd ios && pod install && cd ..
```

### Running the App

#### Android
```bash
npm run android
# or
yarn android
```

#### iOS (future)
```bash
npm run ios
# or
yarn ios
```

### Development

**Start Metro bundler**
```bash
npm start
# or
yarn start
```

**Run linter**
```bash
npm run lint
# or
yarn lint
```

**Run tests**
```bash
npm test
# or
yarn test
```

## 📊 Data Models

### Habit
```typescript
{
  id: string;
  name: string;
  nickname?: string;
  emoji?: string;
  reminderTimes: string[];
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate?: string;
  createdDate: string;
  todayStatus: 'not_done' | 'snoozed' | 'completed';
  personality: 'supportive' | 'sarcastic' | 'drill' | 'zen';
  completionHistory: CompletionRecord[];
}
```

### User Profile
```typescript
{
  id: string;
  username: string;
  level: number;
  totalXP: number;
  currentComboStreak: number;
  comboMultiplier: number;
  mercyPassesRemaining: number;
  prestigeLevel: number;
  settings: UserSettings;
}
```

## 🎮 Gamification System

### XP Earning
- Complete on time: **+10 XP**
- Early completion: **+15 XP**
- Complete all habits in a day: **+50 BONUS**
- Perfect week: **+200 BONUS**

### Combo Multipliers
- 3-day streak: **1.5x XP**
- 7-day streak: **2x XP**
- 30-day streak: **3x XP**

### Levels
- Level 1-4: Beginner (0-800 XP)
- Level 5-9: Committed (800-4200 XP)
- Level 10-14: Unstoppable (4200-10200 XP)
- Level 15-19: Master (10200-18700 XP)
- Level 20+: LEGEND (18700+ XP)

### Power-Ups
- **Extra Snooze** (Level 5) - 90-minute snooze option
- **Streak Shield** (Level 10) - Auto-use mercy pass
- **Double XP Day** (Level 12) - 2x points for chosen day
- **Bonus Mercy Pass** (Level 15) - 2 passes per month
- **Combo Extender** (Level 18) - Preserve combo for 1 missed day

## 🏆 Achievements

### Categories
- **Starter**: First Win, Getting Warm, Week Warrior
- **Consistency**: Perfect Week, Juggler, Centurion, Hall of Fame
- **Speed**: Speed Demon, Early Bird, Night Owl
- **Comeback**: Comeback Kid, Phoenix Rising, Resilient
- **Shame** (Funny): Snooze Master, Professional Slacker, Oops
- **Special**: Sharpshooter, Prestige, Diamond

## 🔔 Notification Actions

When a habit reminder fires, users get 4 action buttons:

1. **🏆 I'm a Winner** - Mark complete, cancel reminders, earn XP
2. **😴 5 More Min** - Snooze (10/30/60 min options)
3. **🔄 Move It** - Reschedule to different time
4. **😅 I'm a slacker** - Dismiss (-5 XP, tracked)

## 🎨 Personality Modes

### 😊 Supportive Friend
*Encouraging and positive*
- "You did it! So proud of you! 🌟"
- "Another one bites the dust! ✓"

### 😏 Sarcastic Coach
*Playfully sarcastic*
- "Look at you being all responsible for once 😏"
- "Finally decided to show up, huh?"

### 💪 Drill Sergeant
*Intense motivation*
- "OUTSTANDING! NOW DROP AND GIVE ME 20!"
- "NO EXCUSES! YOU SHOWED UP!"

### 😌 Zen Master
*Calm and philosophical*
- "The journey of a thousand miles begins with a single step 🧘"
- "In this moment, you are enough"

## 🛣️ Development Roadmap

### Phase 1 - MVP (Weeks 1-2) ✅
- [x] Project setup and configuration
- [ ] Basic habit CRUD
- [ ] Simple streak tracking
- [ ] Local notifications
- [ ] Basic stats

### Phase 2 - Core Gamification (Weeks 3-4)
- [ ] XP system
- [ ] Levels
- [ ] Streak milestones
- [ ] Personality messages
- [ ] Notification actions (4 buttons)

### Phase 3 - Advanced Features (Weeks 5-6)
- [ ] Achievements
- [ ] Daily challenges
- [ ] Mercy pass system
- [ ] Power-ups
- [ ] Combo multipliers

### Phase 4 - Polish (Weeks 7-8)
- [ ] Animations
- [ ] Confetti
- [ ] Haptics
- [ ] Sound effects
- [ ] Dark mode
- [ ] Calendar visualizer

### Phase 5 - Final (Weeks 9-10)
- [ ] Prestige system
- [ ] Habit battles
- [ ] Stats refinement
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] Beta testing

### Future (v2.0)
- [ ] Social features (friend challenges, leaderboards)
- [ ] Habit templates and bundles
- [ ] Smart suggestions (AI)
- [ ] Integrations (Health apps, smartwatches)
- [ ] Advanced stats and reports

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please read CONTRIBUTING.md for guidelines.

## 💬 Support

For questions or issues, please open an issue on GitHub.

---

**Built with ❤️ using React Native and TypeScript**
