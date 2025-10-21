# Installing Node.js on macOS

## 🍎 Quick Start for macOS

### Method 1: Direct Download (Easiest - 2 minutes)

1. **Go to Node.js website:**
   - Open your browser
   - Visit: **https://nodejs.org**

2. **Download the LTS version:**
   - Click the **green button** that says "LTS" (Long Term Support)
   - This downloads a `.pkg` file (around 80MB)

3. **Run the installer:**
   - Open the downloaded `.pkg` file
   - Click "Continue" through the installation wizard
   - Enter your password when prompted
   - Click "Install"

4. **Verify installation:**
   - Open **Terminal** (Applications → Utilities → Terminal)
   - Type these commands:
   ```bash
   node --version
   npm --version
   ```
   - You should see version numbers like:
   ```
   v18.17.0
   9.6.7
   ```

5. **You're done!** ✅

---

### Method 2: Using Homebrew (For Advanced Users)

If you already have Homebrew installed:

```bash
# Install Node.js
brew install node

# Verify installation
node --version
npm --version
```

**Don't have Homebrew?** Install it first:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

---

## 🚀 After Installing Node.js

Once Node.js is installed, here's how to run ElderCompanion:

### Step 1: Open Terminal
- Press `Cmd + Space` (Spotlight)
- Type "Terminal"
- Press Enter

### Step 2: Navigate to the Project
```bash
# Go to where you cloned the repository
cd ~/Desktop/code-from-ai/eldercompanion/backend
# (Adjust the path to wherever you put the code)
```

### Step 3: Install Dependencies
```bash
npm install
```
This takes about 30 seconds and installs 341 packages.

### Step 4: Build the Project
```bash
npm run build
```
This compiles TypeScript to JavaScript.

### Step 5: Start the Server
```bash
npm start
```

You should see:
```
==================================================
🚀 ElderCompanion API Server
📡 Port: 3000
🌍 Environment: development
==================================================
```

### Step 6: Test It!
Open a **new Terminal window** (Cmd+N) and run:
```bash
curl http://localhost:3000/health
```

Or open Safari/Chrome to: **http://localhost:3000/health**

Expected response:
```json
{"status":"healthy","timestamp":"...","service":"ElderCompanion API"}
```

---

## 🎯 Complete Setup Checklist

- [ ] Download Node.js LTS from https://nodejs.org
- [ ] Run the `.pkg` installer
- [ ] Open Terminal
- [ ] Verify with `node --version` and `npm --version`
- [ ] Navigate to `eldercompanion/backend`
- [ ] Run `npm install`
- [ ] Run `npm run build`
- [ ] Run `npm start`
- [ ] Test with `curl http://localhost:3000/health`

---

## 🔧 Troubleshooting

### "node: command not found" after installation

**Solution:** Close Terminal completely and open a new one.

```bash
# Quit Terminal (Cmd+Q)
# Open Terminal again
# Try again:
node --version
```

### "permission denied" errors

**Solution:** Don't use `sudo` with npm. If you get permission errors:

```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

### Port 3000 already in use

**Solution:** Find and kill the process using port 3000:

```bash
# Find what's using port 3000
lsof -i :3000

# Kill it (replace PID with the number shown)
kill -9 <PID>
```

Or use a different port:
```bash
# In backend/.env
PORT=3001
```

### Can't find the eldercompanion folder

**Solution:** First clone the repository:

```bash
# Navigate to where you want the code
cd ~/Desktop

# Clone the repository
git clone https://github.com/amatt76-bit/code-from-ai.git

# Navigate into it
cd code-from-ai

# Switch to the ElderCompanion branch
git checkout claude/eldercompanion-project-setup-011CULySBbDjcTBGWFDfojGT

# Now you can see the eldercompanion folder
ls eldercompanion/
```

---

## 🎓 Terminal Tips for macOS

**Open Terminal:**
- Cmd+Space → type "Terminal" → Enter
- Or: Applications → Utilities → Terminal

**Navigate folders:**
```bash
cd Desktop          # Go to Desktop
cd ..              # Go up one folder
pwd                # Show current location
ls                 # List files in current folder
```

**Copy/Paste in Terminal:**
- Copy: Cmd+C
- Paste: Cmd+V

**Clear Terminal:**
- Cmd+K or type `clear`

---

## 📹 Video Tutorial

If you prefer video instructions, search YouTube for:
- "Install Node.js on Mac"
- "Node.js macOS installation"

---

## ✅ Quick Command Summary

Once Node.js is installed, run these in order:

```bash
# 1. Navigate to project
cd ~/Desktop/code-from-ai/eldercompanion/backend

# 2. Install dependencies
npm install

# 3. Build project
npm run build

# 4. Start server
npm start

# 5. Test (in a new terminal window)
curl http://localhost:3000/health
```

---

## 🎉 You're All Set!

After following these steps, you'll have:
- ✅ Node.js installed
- ✅ ElderCompanion backend running
- ✅ API responding to requests
- ✅ Ready to develop!

**Next Steps:**
- Check out `README.md` for full documentation
- Read `QUICKSTART.md` for more details
- See `TESTING_GUIDE.md` for testing instructions

---

## 🆘 Need More Help?

If you get stuck:
1. Make sure Terminal is completely closed and reopened after installing Node.js
2. Check that you're in the correct folder: `pwd` should show `.../eldercompanion/backend`
3. Verify Node.js: `node --version` should show a version number

**Common mistakes:**
- Forgetting to close/reopen Terminal after installing Node.js
- Being in the wrong folder (use `cd` to navigate)
- Typing commands incorrectly (copy/paste to be safe)

Good luck! 🚀
