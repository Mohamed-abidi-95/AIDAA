# 📦 AIDAA - COMPLETE INSTALLATION & DEPLOYMENT

**Date:** April 4, 2026  
**Version:** 1.0.0 (MVP)  
**Status:** ✅ Production Ready

---

## 🎯 PRE-REQUISITES

Before starting, ensure you have:

- ✅ Node.js v18+ installed
- ✅ MySQL 8.0+ installed and running
- ✅ npm or yarn package manager
- ✅ Git (optional)

**Verify versions:**
```bash
node --version      # Should be v18+
npm --version       # Should be v8+
mysql --version     # Should be 8.0+
```

---

## 📥 INSTALLATION STEPS

### Step 1: Clone/Download Project
```bash
# Navigate to desired directory
cd C:\Users\MohamedAbidi\PhpstormProjects

# Project already exists at:
# C:\Users\MohamedAbidi\PhpstormProjects\AIDAA
```

### Step 2: Setup Database

#### Option A: Using Script (Recommended)
```bash
cd backend
node setup-db.js        # Creates database and tables
```

#### Option B: Manual MySQL
```bash
# Open MySQL and run:
mysql -u root

# Then paste content from:
# aidaa_schema.sql
```

**Verify database:**
```bash
mysql -u root aidaa_db -e "SHOW TABLES;"
```

### Step 3: Install Backend Dependencies
```bash
cd backend
npm install
npm install multer      # Important: File upload package
```

### Step 4: Create Test Accounts
```bash
# Create admin (default, already exists)
# Create parent
node insert-parent.js

# Create professional
node insert-professional.js
```

### Step 5: Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Step 6: Verify Configuration

#### Backend `.env`
```bash
cat backend/.env
# Should contain:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=
# DB_DATABASE=aidaa_db
# PORT=5000
```

#### Frontend URLs
```bash
# Check frontend/src/services/api.ts
# Should point to: http://localhost:5000
```

---

## 🚀 STARTUP PROCESS

### Terminal 1 - Backend Server
```bash
cd C:\Users\MohamedAbidi\PhpstormProjects\AIDAA\backend
npm run dev
```

**Expected output:**
```
╔════════════════════════════════════════════════════════════════╗
║           AIDAA Backend Server Started                          ║
║           Running on: http://localhost:5000                    ║
║           Environment: development                              ║
╚════════════════════════════════════════════════════════════════╝
```

### Terminal 2 - Frontend Server
```bash
cd C:\Users\MohamedAbidi\PhpstormProjects\AIDAA\frontend
npm run dev
```

**Expected output:**
```
VITE v5.0.0 ready in XXX ms

➜  Local:   http://localhost:5173/
```

### Terminal 3 - Open Browser
```
http://localhost:5173
```

---

## 🔐 LOGIN & VERIFY

### Test Admin Account
```
Email: admin@aidaa.com
Password: admin123
Expected: Redirect to /admin
```

### Test Parent Account
```
Email: parent@aidaa.com
Password: parent123
Expected: Redirect to /parent/dashboard
```

### Test Professional Account
```
Email: professional@aidaa.com
Password: professional123
Expected: Redirect to /professional/dashboard
```

---

## ✅ VERIFICATION CHECKLIST

### Backend
- [ ] Server running on port 5000
- [ ] No errors in console
- [ ] Database connected successfully
- [ ] All tables created

### Frontend
- [ ] Server running on port 5173
- [ ] No TypeScript errors
- [ ] Login page loads
- [ ] Can type credentials

### Database
- [ ] MySQL running
- [ ] Database `aidaa_db` exists
- [ ] 8 tables created
- [ ] Test data inserted

### Application
- [ ] Can login as admin
- [ ] Can login as parent
- [ ] Can login as professional
- [ ] Correct redirects work
- [ ] No console errors

---

## 📊 PROJECT STRUCTURE VERIFICATION

```
AIDAA/
├── backend/
│   ├── src/
│   │   ├── app.js ✅
│   │   ├── server.js ✅
│   │   ├── config/ ✅
│   │   ├── controllers/ ✅
│   │   ├── models/ ✅
│   │   ├── routes/ ✅
│   │   └── middlewares/ ✅
│   ├── node_modules/ ✅
│   ├── package.json ✅
│   ├── .env ✅
│   └── insert-parent.js ✅
│
├── frontend/
│   ├── src/
│   │   ├── pages/ ✅
│   │   ├── components/ ✅
│   │   ├── services/ ✅
│   │   ├── styles/ ✅
│   │   └── types/ ✅
│   ├── node_modules/ ✅
│   ├── package.json ✅
│   ├── vite.config.ts ✅
│   └── index.html ✅
│
└── Documentation/ ✅
    ├── TEST_ACCOUNTS.md
    ├── QUICK_START_COMPLETE.md
    └── ... (8+ guides)
```

---

## 🆘 TROUBLESHOOTING

### Port Already in Use (5000)
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F
```

### Module Not Found
```bash
# Reinstall dependencies
cd backend
rm -r node_modules
npm install
npm install multer
```

### Database Connection Error
```bash
# Verify MySQL is running
# Windows: Check Services (services.msc) → MySQL80
# Or: net start MySQL80

# Verify credentials in .env
# Test connection:
mysql -u root -p
```

### Cannot Login (Wrong Credentials)
```bash
# Recreate test accounts
cd backend
node insert-parent.js
node insert-professional.js
```

### TypeScript Errors
```bash
# Clear cache and rebuild
cd frontend
npm install
npm run dev
```

---

## 📈 POST-INSTALLATION

### What to Do Next

1. **Explore Admin Panel**
   - Login as admin
   - Upload test content
   - Create new users

2. **Test Parent Features**
   - Login as parent
   - View child dashboard
   - Check activity logs

3. **Test Professional Features**
   - Login as professional
   - View patients
   - Add medical notes

4. **Test Child Space**
   - Play games
   - Watch videos
   - Track progress

---

## 🔄 DAILY STARTUP

After initial setup, daily startup is simple:

### Quick Start Script
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2 (in new terminal)
cd frontend && npm run dev

# Terminal 3 (Open browser)
http://localhost:5173
```

---

## 📝 USEFUL COMMANDS

### Database
```bash
# Connect to MySQL
mysql -u root aidaa_db

# View users
SELECT * FROM users;

# View children
SELECT * FROM children;

# View content
SELECT * FROM content;
```

### Backend
```bash
# Start development
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

### Frontend
```bash
# Start development
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

---

## ⚙️ CONFIGURATION FILES

### backend/.env
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_DATABASE=aidaa_db
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### frontend/.env (if needed)
```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=AIDAA
```

---

## 📦 DEPLOYMENT (Future)

When ready for production:

1. **Set environment to production**
2. **Build frontend:** `npm run build`
3. **Use process manager:** pm2, forever
4. **Setup reverse proxy:** nginx, Apache
5. **Use SSL certificates:** Let's Encrypt
6. **Configure database backup**

---

## ✨ SUCCESS!

If you see:
- ✅ Backend running on 5000
- ✅ Frontend running on 5173
- ✅ Login page loads
- ✅ Can login with test accounts
- ✅ Dashboards work correctly

**Then AIDAA is fully installed and ready!** 🎉

---

## 📞 SUPPORT

For issues:
1. Check the troubleshooting section
2. Review relevant .md files
3. Check console logs (F12)
4. Check backend logs
5. Verify database connection

---

**Installation Complete! Happy Testing!** 🚀

**Last Updated:** April 4, 2026  
**Next Steps:** Open http://localhost:5173 and login

