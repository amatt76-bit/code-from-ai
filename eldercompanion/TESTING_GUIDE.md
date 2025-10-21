# ElderCompanion - Testing Guide

The backend server is currently running and ready for testing! Here's how you can test different components.

## 🚀 Quick Test Commands

### 1. Test Health Endpoint
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-21T20:50:00.024Z",
  "service": "ElderCompanion API"
}
```

### 2. Test OpenAI Status
```bash
curl http://localhost:3000/api/openai/status
```

**Expected Response:**
```json
{
  "configured": true,
  "message": "OpenAI API is configured"
}
```

### 3. Test User Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "role": "parent",
    "full_name": "Test User"
  }'
```

**Note:** This will fail without real Supabase credentials, but tests the endpoint structure.

### 4. Test Error Handling (404)
```bash
curl http://localhost:3000/api/invalid-endpoint
```

**Expected Response:**
```json
{
  "error": "Not found",
  "message": "Route GET /api/invalid-endpoint not found"
}
```

---

## 🧪 Interactive Testing with curl

### Test All Endpoints at Once
```bash
# Health check
echo "Testing /health..."
curl -s http://localhost:3000/health | json_pp

# OpenAI status
echo -e "\nTesting /api/openai/status..."
curl -s http://localhost:3000/api/openai/status | json_pp

# 404 error
echo -e "\nTesting 404 error handling..."
curl -s http://localhost:3000/api/nonexistent | json_pp
```

---

## 🌐 Browser Testing

You can also test in your browser by visiting these URLs:

1. **Health Check**
   ```
   http://localhost:3000/health
   ```

2. **OpenAI Status**
   ```
   http://localhost:3000/api/openai/status
   ```

3. **404 Error Test**
   ```
   http://localhost:3000/api/invalid
   ```

---

## 📱 Testing with Postman or Insomnia

### Import these requests:

#### 1. Health Check
- **Method:** GET
- **URL:** `http://localhost:3000/health`

#### 2. OpenAI Status
- **Method:** GET
- **URL:** `http://localhost:3000/api/openai/status`

#### 3. User Signup
- **Method:** POST
- **URL:** `http://localhost:3000/api/auth/signup`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "email": "parent@example.com",
    "password": "securepass123",
    "role": "parent",
    "full_name": "Jane Doe",
    "phone": "+1-555-0100"
  }
  ```

#### 4. User Login
- **Method:** POST
- **URL:** `http://localhost:3000/api/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "email": "parent@example.com",
    "password": "securepass123"
  }
  ```

#### 5. Get OpenAI Token (Requires Auth)
- **Method:** POST
- **URL:** `http://localhost:3000/api/openai/token`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_JWT_TOKEN`

---

## 📂 Testing Mobile App Configuration

The mobile app files are ready to test. Here's how:

### Prerequisites
```bash
# Install Node.js dependencies
cd eldercompanion/mobile
npm install

# Make sure Expo CLI is installed
npm install -g expo-cli
```

### Start Development Server
```bash
npm start
# or
expo start
```

### Run on Simulators/Emulators
```bash
# iOS (macOS only)
npm run ios

# Android
npm run android

# Web browser
npm run web
```

---

## 🔍 View Server Logs

The server logs all requests. You can see them in real-time:

```bash
# View logs (server is running in background)
# You'll see entries like:
# 2025-10-21T20:45:19.017Z - GET /health
# 2025-10-21T20:45:30.087Z - GET /api/openai/status
```

---

## ⚙️ Full Integration Test (With Real Credentials)

To test the complete system with real API keys:

### Step 1: Set Up Supabase
1. Go to https://supabase.com
2. Create a new project
3. Copy your project URL and anon key
4. Run the SQL schema from `supabase-schema.sql` in the SQL Editor

### Step 2: Get OpenAI API Key
1. Go to https://platform.openai.com
2. Create an API key
3. Copy the key

### Step 3: Configure Environment
```bash
cd eldercompanion/backend

# Edit .env file
cat > .env << EOF
PORT=3000
NODE_ENV=development
OPENAI_API_KEY=sk-your-real-key-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-real-anon-key
JWT_SECRET=$(openssl rand -base64 32)
EOF
```

### Step 4: Restart Server
```bash
npm run dev
```

### Step 5: Test Full Flow
```bash
# 1. Sign up a new user
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent@example.com",
    "password": "securepass123",
    "role": "parent",
    "full_name": "Jane Doe"
  }'

# 2. Save the token from the response
# 3. Use the token to get an OpenAI ephemeral token
curl -X POST http://localhost:3000/api/openai/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# 4. Create a conversation
curl -X POST http://localhost:3000/api/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# 5. Get user's conversations
curl http://localhost:3000/api/conversations/USER_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## 🎯 What You Can Test Right Now (Without Setup)

✅ **Currently Working:**
- Backend server startup
- Health check endpoint
- OpenAI status endpoint
- API error handling (404s)
- Request logging
- TypeScript compilation
- Code structure

⚠️ **Requires Real Credentials:**
- User authentication (Supabase)
- Database operations (Supabase)
- OpenAI token generation (OpenAI API)
- Conversation storage (Supabase)
- Mobile app API calls (need backend URL)

---

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 PID
```

### Server Not Responding
```bash
# Check if server is running
curl http://localhost:3000/health

# If not, start it
cd eldercompanion/backend
npm run dev
```

### TypeScript Errors
```bash
# Rebuild
npm run build

# Check for errors
npm run type-check
```

---

## 📊 Test Checklist

- [x] ✅ Backend compiles without errors
- [x] ✅ Server starts on port 3000
- [x] ✅ Health endpoint responds
- [x] ✅ OpenAI status endpoint responds
- [x] ✅ 404 errors handled correctly
- [x] ✅ Request logging works
- [x] ✅ Mobile app files present
- [ ] ⏳ User signup (needs Supabase)
- [ ] ⏳ User login (needs Supabase)
- [ ] ⏳ OpenAI token generation (needs API key)
- [ ] ⏳ Conversation storage (needs Supabase)
- [ ] ⏳ Mobile app running (needs npm install)
- [ ] ⏳ End-to-end voice chat (needs full setup)

---

## 🎉 Quick Win Tests

Try these commands right now to see the system working:

```bash
# Test 1: Health check
curl http://localhost:3000/health

# Test 2: OpenAI status
curl http://localhost:3000/api/openai/status

# Test 3: Error handling
curl http://localhost:3000/api/test-404

# Test 4: View all endpoints (in browser)
# Open: http://localhost:3000/health
```

All of these should work immediately! 🚀
