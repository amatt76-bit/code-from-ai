# ElderCompanion - Quick Start Guide

## 🚀 Run the Backend Server on Your Computer

Follow these steps to run the server locally:

### Step 1: Navigate to the Backend Directory

```bash
cd eldercompanion/backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages (~341 packages, takes ~30 seconds).

### Step 3: Build the TypeScript Code

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

### Step 4: Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

You should see:

```
==================================================
🚀 ElderCompanion API Server
📡 Port: 3000
🌍 Environment: development
⏰ Started at: ...
==================================================

Available endpoints:
  GET  /health
  POST /api/auth/signup
  POST /api/auth/login
  POST /api/openai/token
  GET  /api/openai/status
  GET  /api/conversations/:userId
  POST /api/conversations
  PATCH /api/conversations/:conversationId

==================================================
```

### Step 5: Test It!

Open a **new terminal** and run:

```bash
curl http://localhost:3000/health
```

Or open in your browser:
**http://localhost:3000/health**

You should see:
```json
{"status":"healthy","timestamp":"...","service":"ElderCompanion API"}
```

---

## 📱 Run the Mobile App on Your Computer

### Step 1: Navigate to Mobile Directory

```bash
cd eldercompanion/mobile
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start Expo Dev Server

```bash
npm start
```

This will open Expo DevTools in your browser with a QR code.

### Step 4: Test on Device/Simulator

**Option A: Physical Device**
1. Install "Expo Go" app from App Store (iOS) or Play Store (Android)
2. Scan the QR code with your camera (iOS) or Expo Go app (Android)

**Option B: iOS Simulator** (macOS only)
- Press `i` in the terminal

**Option C: Android Emulator**
- Press `a` in the terminal

**Option D: Web Browser**
- Press `w` in the terminal

---

## ⚡ Quick One-Command Setup

Run everything at once:

```bash
# From the eldercompanion directory
cd backend && npm install && npm run build && npm start
```

---

## 🔧 Troubleshooting

### "Port 3000 already in use"

```bash
# Find what's using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use a different port in backend/.env
PORT=3001
```

### "npm: command not found"

Install Node.js first:
- **macOS**: `brew install node`
- **Windows**: Download from https://nodejs.org
- **Linux**: `sudo apt install nodejs npm` or `sudo yum install nodejs npm`

### TypeScript errors

```bash
cd backend
npm run build
```

If errors persist, check the TEST_REPORT.md for solutions.

### Mobile app won't connect to backend

Update `mobile/.env`:
```bash
# For iOS Simulator
API_BASE_URL=http://localhost:3000

# For Android Emulator
API_BASE_URL=http://10.0.2.2:3000

# For Physical Device
API_BASE_URL=http://YOUR_COMPUTER_IP:3000
```

Find your computer's IP:
- **macOS/Linux**: `ifconfig | grep "inet "`
- **Windows**: `ipconfig`

---

## 🎯 What You Can Test Right Now

Without any credentials, you can test:

✅ **Backend Server**
- Health check endpoint
- OpenAI status endpoint
- API error handling
- Request/response structure

✅ **Mobile App UI**
- Home screen
- Voice chat screen
- Navigation
- Component rendering

---

## 🔑 To Test Full Features

To test authentication, database, and AI features:

### 1. Get Supabase Credentials

1. Go to https://supabase.com
2. Create a free account
3. Create a new project
4. Go to Project Settings → API
5. Copy:
   - Project URL
   - `anon` public key

### 2. Run the Database Schema

1. In Supabase dashboard, go to SQL Editor
2. Copy contents of `../supabase-schema.sql`
3. Paste and run the SQL

### 3. Get OpenAI API Key

1. Go to https://platform.openai.com
2. Sign up/login
3. Go to API Keys
4. Create new secret key
5. Copy the key (starts with `sk-`)

### 4. Update Backend .env

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
NODE_ENV=development

OPENAI_API_KEY=sk-your-real-key-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-real-anon-key
JWT_SECRET=your-super-secret-jwt-key
```

### 5. Restart the Server

```bash
npm run dev
```

Now all features will work! 🎉

---

## 📚 Additional Documentation

- **README.md** - Complete project documentation
- **TEST_REPORT.md** - Testing results and metrics
- **TESTING_GUIDE.md** - Detailed testing instructions

---

## 🎉 You're Ready!

Once the server is running on your machine:

```bash
curl http://localhost:3000/health
```

Should return:
```json
{"status":"healthy","timestamp":"...","service":"ElderCompanion API"}
```

Happy testing! 🚀
