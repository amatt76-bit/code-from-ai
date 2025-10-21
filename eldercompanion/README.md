# ElderCompanion

An AI-powered elder care companion app that enables natural voice conversations between elderly users (parents) and an empathetic AI assistant using OpenAI's Realtime API.

## Overview

ElderCompanion provides:
- **Natural Voice Conversations**: Real-time AI conversations using OpenAI's Realtime API
- **Activity Suggestions**: Context-aware activity recommendations based on user preferences
- **Emotional Support**: Warm, empathetic AI companion for elderly individuals
- **Family Dashboard**: Children can monitor their parent's engagement (future feature)

## Architecture

```
eldercompanion/
├── backend/          # Node.js + Express API server
├── mobile/           # React Native mobile app (iOS/Android)
└── supabase-schema.sql  # Database schema
```

## Tech Stack

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI Realtime API (gpt-4o-realtime-preview)
- **Authentication**: JWT

### Mobile
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **Audio**: Expo AV
- **State Management**: React Hooks

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Expo CLI**: `npm install -g expo-cli`
- **OpenAI API Key**: [Get one here](https://platform.openai.com/api-keys)
- **Supabase Account**: [Sign up here](https://supabase.com)

### For iOS Development
- macOS with Xcode installed
- iOS Simulator or physical iOS device

### For Android Development
- Android Studio with Android SDK
- Android Emulator or physical Android device

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd eldercompanion
```

### 2. Set Up Supabase Database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy the contents of `supabase-schema.sql` and run it in the SQL Editor
4. This will create all necessary tables, indexes, and relationships

#### Tables Created:
- `users` - User accounts (parents and children)
- `parent_profiles` - Extended profile for parent users
- `conversations` - Voice conversation records
- `activities` - Suggested and scheduled activities

### 3. Set Up Backend Server

```bash
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env and add your credentials
nano .env
```

#### Backend Environment Variables

Edit `backend/.env` with your credentials:

```env
PORT=3000
NODE_ENV=development

# OpenAI API Key (REQUIRED)
OPENAI_API_KEY=sk-proj-your-key-here

# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# JWT Secret (IMPORTANT: Change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**Getting Supabase Credentials:**
1. Go to your Supabase project settings
2. Navigate to API settings
3. Copy the "Project URL" → `SUPABASE_URL`
4. Copy the "anon/public" key → `SUPABASE_ANON_KEY`

#### Start the Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm run build
npm start
```

The server will start on `http://localhost:3000`

#### Test the Backend

```bash
# Health check
curl http://localhost:3000/health

# Expected response:
# {"status":"healthy","timestamp":"...","service":"ElderCompanion API"}
```

### 4. Set Up Mobile App

```bash
cd mobile

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env with your backend URL
nano .env
```

#### Mobile Environment Variables

Edit `mobile/.env`:

```env
# For iOS Simulator
API_BASE_URL=http://localhost:3000

# For Android Emulator
# API_BASE_URL=http://10.0.2.2:3000

# For Physical Device (use your computer's IP)
# API_BASE_URL=http://192.168.1.XXX:3000
```

**Finding Your Computer's IP:**
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

#### Start the Mobile App

```bash
# Start Expo development server
npm start

# Or run directly on a platform
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web browser
```

## Testing the Complete Flow

### Testing Checklist

1. **Backend Health Check**
   - [ ] Backend server is running on port 3000
   - [ ] GET `/health` returns success
   - [ ] GET `/api/openai/status` shows OpenAI is configured

2. **Database Setup**
   - [ ] All tables created in Supabase
   - [ ] Can view tables in Supabase Table Editor

3. **Mobile App Launch**
   - [ ] App loads without errors
   - [ ] ParentHomeScreen displays
   - [ ] "Start Conversation" button is visible

4. **User Authentication (Manual Test)**
   ```bash
   # Test signup
   curl -X POST http://localhost:3000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "testpass123",
       "role": "parent",
       "full_name": "Test User"
     }'
   ```

5. **Voice Conversation Flow**
   - [ ] Tap "Start Conversation" button
   - [ ] Microphone permission requested
   - [ ] VoiceChatScreen loads
   - [ ] "Tap to Talk" button appears
   - [ ] Conversation starts when tapped
   - [ ] Real-time transcript appears
   - [ ] Can end conversation successfully

## Project Structure

### Backend Structure

```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.ts              # Authentication routes
│   │   ├── openai.ts            # OpenAI token generation
│   │   └── conversations.ts     # Conversation management
│   ├── services/
│   │   ├── supabase.ts          # Database operations
│   │   └── openai-service.ts    # OpenAI integration
│   ├── middleware/
│   │   └── auth.ts              # JWT authentication
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   └── server.ts                # Express server entry point
├── package.json
├── tsconfig.json
└── .env.example
```

### Mobile Structure

```
mobile/
├── src/
│   ├── screens/
│   │   ├── ParentHomeScreen.tsx     # Home screen
│   │   └── VoiceChatScreen.tsx      # Voice chat interface
│   ├── services/
│   │   ├── api.ts                   # Backend API client
│   │   └── openai-realtime.ts       # OpenAI Realtime service
│   ├── components/
│   │   └── VoiceButton.tsx          # Animated voice button
│   ├── types/
│   │   └── index.ts                 # TypeScript types
│   └── App.tsx                      # Navigation setup
├── package.json
├── tsconfig.json
├── app.json
└── .env.example
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Create new user | No |
| POST | `/api/auth/login` | Login user | No |

### OpenAI

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/openai/token` | Generate ephemeral token | Yes |
| GET | `/api/openai/status` | Check OpenAI configuration | No |

### Conversations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/conversations/:userId` | Get user conversations | Yes |
| POST | `/api/conversations` | Create conversation | Yes |
| PATCH | `/api/conversations/:conversationId` | Update conversation | Yes |

## Development Workflow

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Run in development mode (auto-reload)
npm run dev

# Type checking
npm run lint

# Build for production
npm run build
```

### Mobile Development

```bash
cd mobile

# Install dependencies
npm install

# Start development server
npm start

# Type checking
npm run type-check

# Lint code
npm run lint
```

## Troubleshooting

### Backend Issues

**Issue: "Missing OpenAI API key"**
- Solution: Add `OPENAI_API_KEY` to `backend/.env`

**Issue: "Cannot connect to Supabase"**
- Solution: Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `backend/.env`
- Check your Supabase project is active

**Issue: Port 3000 already in use**
- Solution: Change `PORT` in `backend/.env` or kill the process:
  ```bash
  # Find process using port 3000
  lsof -i :3000
  # Kill it
  kill -9 <PID>
  ```

### Mobile Issues

**Issue: "Network request failed"**
- Solution: Check `API_BASE_URL` in `mobile/.env`
- For Android emulator: Use `http://10.0.2.2:3000`
- For physical device: Use your computer's IP address
- Ensure backend server is running

**Issue: Microphone permission denied**
- Solution:
  - iOS: Go to Settings → Privacy → Microphone → Enable for ElderCompanion
  - Android: Go to Settings → Apps → ElderCompanion → Permissions → Enable Microphone

**Issue: "Expo Go" app crashes**
- Solution: Try running on a simulator/emulator instead
- Or build a development build: `expo build:ios` / `expo build:android`

### Database Issues

**Issue: Tables not created**
- Solution: Run the SQL from `supabase-schema.sql` in Supabase SQL Editor
- Check for error messages in the SQL Editor

**Issue: "Authentication required" errors**
- Solution: Check JWT token is being sent in Authorization header
- Try logging in again to get a fresh token

## Production Deployment

### Backend Deployment

Recommended platforms:
- **Heroku**: Easy deployment with PostgreSQL add-on
- **Railway**: Modern platform with good TypeScript support
- **AWS EC2**: Full control and scalability
- **DigitalOcean**: Simple and cost-effective

### Mobile App Deployment

```bash
cd mobile

# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Or use EAS Build (recommended)
eas build --platform ios
eas build --platform android
```

## Security Considerations

### Important Security Notes:

1. **Never expose OpenAI API key in mobile app**
   - ✅ Generate ephemeral tokens server-side
   - ❌ Never put API key in mobile code or environment variables

2. **Change JWT_SECRET in production**
   - Use a strong, random secret (32+ characters)
   - Never commit real secrets to version control

3. **Enable Supabase Row Level Security (RLS)**
   - Users should only access their own data
   - Set up RLS policies in Supabase

4. **Use HTTPS in production**
   - Never use HTTP for production API
   - Enable SSL/TLS on your server

5. **Validate all inputs**
   - Backend validates all user inputs
   - Sanitize data before database insertion

## Future Enhancements

- [ ] Child/caregiver dashboard
- [ ] Push notifications for important conversations
- [ ] Medication reminders
- [ ] Emergency contact integration
- [ ] Activity tracking and analytics
- [ ] Multi-language support
- [ ] Customizable AI personality
- [ ] Offline mode support

## License

MIT

## Support

For issues or questions:
- Open an issue on GitHub
- Email: support@eldercompanion.com

---

**Built with ❤️ for improving elder care through AI**
