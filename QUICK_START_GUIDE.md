# 🎯 AIDAA Project - Quick Reference Guide

**Last Updated:** April 4, 2026  
**Project Phase:** Authentication System Complete - Ready for Dashboard Development  
**Overall Status:** 60% Complete

---

## 📌 Most Important URLs & Files

### 🔌 Live Services
```
Frontend:   http://localhost:5173          (Vite dev server)
Backend:    http://localhost:5000          (Express API)
Health:     http://localhost:5000/health   (API status)
Database:   localhost:3306                 (MySQL)
```

### 📂 Key Project Files
```
Documentation:
  COMPREHENSIVE_PROJECT_UNDERSTANDING.md   ← READ THIS FIRST
  PROJECT_PROGRESS.md                      ← Phase tracking
  AUTHENTICATION_TEST_REPORT.md            ← Test guide

Database:
  aidaa_schema.sql                         ← Schema definition

Backend Setup:
  backend/setup-db.js                      ← Initialize DB
  backend/fix-admin-password.js            ← Fix password issues
  backend/test-login.js                    ← Test API

Frontend:
  frontend/src/App.tsx                     ← Main app
  frontend/src/pages/LoginPage.tsx         ← Login UI
```

---

## ⚡ Quick Commands

### Setup Database (First Time Only)
```bash
cd backend
npm install
node setup-db.js
```

### Start Everything (3 Terminals)
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev

# Terminal 3 - Browser
# Open: http://localhost:5173
```

### Fix Issues
```bash
# Fix admin password if "Invalid email or password"
node backend/fix-admin-password.js

# Reinitialize database (CAUTION: Deletes all data)
node backend/setup-db.js

# Test authentication API
node backend/test-login.js
```

---

## 🔐 Test Credentials

```
Admin Account (✅ Works):
  Email:    admin@aidaa.com
  Password: admin123
  
Parent Accounts (⚠️ Require Setup):
  Email:    sarah.johnson@example.com
  Email:    michael.smith@example.com
  
Professional Account (⚠️ Requires Setup):
  Email:    emily.brown@aidaa.com
```

---

## 📊 Project Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│ Browser (Frontend - React/Vite)                     │
│ http://localhost:5173                               │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/JSON
                       ↓
┌─────────────────────────────────────────────────────┐
│ Express Server (Backend - Node.js)                  │
│ http://localhost:5000                               │
│ • Auth endpoints                                    │
│ • User management                                   │
│ • Content management                                │
│ • Activity tracking                                 │
└──────────────────────┬──────────────────────────────┘
                       │ MySQL Queries
                       ↓
┌─────────────────────────────────────────────────────┐
│ MySQL Database                                      │
│ aidaa_db (6 tables)                                 │
│ • users, children, content                         │
│ • activity_logs, notes, teleconsultations          │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Authentication Flow (30 seconds)

```
1. User enters email + password → LoginPage
2. Clicks "Login" → auth.service.login()
3. POST /api/auth/login
4. Backend validates credentials
5. Returns JWT token
6. Frontend stores token in localStorage
7. Redirects to dashboard based on role
```

---

## 📁 Backend Structure at a Glance

```
routes/         → Define endpoints (auth.routes.js, user.routes.js, etc.)
controllers/    → Business logic (auth.controller.js, user.controller.js, etc.)
models/         → Database queries (user.model.js, child.model.js, etc.)
middlewares/    → auth.js, roleCheck.js, errorHandler.js
config/         → db.js (MySQL connection pool)
app.js          → Express setup, middleware, route mounting
server.js       → Start server on port 5000
```

---

## 📁 Frontend Structure at a Glance

```
pages/          → LoginPage.tsx, SetPasswordPage.tsx, Dashboards
components/     → ProtectedRoute.tsx, RoleRoute.tsx (route guards)
services/       → auth.service.ts (API calls), api.ts (axios setup)
hooks/          → useAuth.ts (auth state management)
types/          → TypeScript interfaces (User, Child, Content, etc.)
styles/         → CSS files for pages
App.tsx         → React Router setup
main.tsx        → ReactDOM entry point
```

---

## 🔑 Environment Variables

### Backend (.env)
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_DATABASE=aidaa_db
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

### Frontend (.env or vite.config.ts)
```
VITE_API_URL=http://localhost:5000
```

---

## 🧪 Testing Checklist

- [ ] Backend running: `http://localhost:5000/health` returns 200 OK
- [ ] Frontend running: `http://localhost:5173` loads without errors
- [ ] Database setup: `node backend/setup-db.js` completes
- [ ] Admin login works: `admin@aidaa.com` / `admin123`
- [ ] Token stored: Check browser DevTools → localStorage → `aidaa_token`
- [ ] Redirect works: Login redirects to `/admin/dashboard`
- [ ] Protected route works: Try accessing `/parent/dashboard` without login (redirects to `/login`)

---

## 🐛 Troubleshooting

### ❌ "Invalid email or password" (even with admin123)
```bash
# Solution:
node backend/fix-admin-password.js
```

### ❌ "Cannot connect to database"
```bash
# Check MySQL is running:
# Windows: MySQL service should be in Services
# Check .env has correct DB credentials
```

### ❌ "CORS error"
```
Check: backend/src/app.js has cors({ origin: '*' })
```

### ❌ Port already in use
```bash
# Find process using port 5000
netstat -ano | findstr 5000

# Kill process
Get-Process node | Stop-Process -Force
```

---

## 🚀 Next Development Steps

### Priority 1: Complete Dashboards (Current Phase)
- [ ] ParentDashboard - Children list, activity tracking
- [ ] AdminPanel - User management, statistics
- [ ] ProfessionalPage - Notes, consultations

### Priority 2: Complete API Endpoints
- [ ] Children CRUD operations
- [ ] Content CRUD operations
- [ ] Activity log operations
- [ ] Notes management
- [ ] Teleconsultation booking

### Priority 3: Advanced Features
- [ ] File uploads (profile pictures, content)
- [ ] Real-time notifications
- [ ] Email alerts
- [ ] Reporting & analytics

### Priority 4: Testing & Deployment
- [ ] Unit tests (backend & frontend)
- [ ] Integration tests
- [ ] E2E tests
- [ ] Docker deployment
- [ ] Production build

---

## 📞 Useful Files to Edit

When you need to:

| Task | File | Line |
|------|------|------|
| Add new API endpoint | `backend/src/routes/*.routes.js` | - |
| Add authentication logic | `backend/src/controllers/auth.controller.js` | - |
| Add database query | `backend/src/models/*.model.js` | - |
| Create new page | `frontend/src/pages/NewPage.tsx` | - |
| Add component | `frontend/src/components/NewComponent.tsx` | - |
| Modify API URL | `frontend/src/services/api.ts` | baseURL |
| Add new type | `frontend/src/types/index.ts` | - |
| Configure Vite | `frontend/vite.config.ts` | - |

---

## 📚 Learning Resources Embedded

Every file in the project contains:
- ✅ Detailed comments explaining the code
- ✅ Function signatures with parameter descriptions
- ✅ Example usage in comments
- ✅ Console logs for debugging (search for `console.log`)

### Search for patterns:
```bash
# Find all database queries
grep -r "SELECT\|INSERT\|UPDATE\|DELETE" backend/src/

# Find all API endpoints
grep -r "router.get\|router.post\|router.put\|router.delete" backend/src/

# Find all components
grep -r "export const.*=" frontend/src/
```

---

## 🎓 Key Concepts

### Authentication Flow (5 min read)
→ See `COMPREHENSIVE_PROJECT_UNDERSTANDING.md` → "🔐 Système d'Authentification"

### Database Schema (5 min read)
→ See `COMPREHENSIVE_PROJECT_UNDERSTANDING.md` → "📊 Base de Données"

### API Routes (10 min read)
→ See `COMPREHENSIVE_PROJECT_UNDERSTANDING.md` → "🔌 API Routes Complètes"

### Type Safety (TypeScript)
→ See `frontend/src/types/index.ts` - All interfaces defined here

### State Management (React)
→ See `frontend/src/hooks/useAuth.ts` - Auth state management

---

## ✅ Verification Checklist

Run these commands to verify everything works:

```bash
# 1. Check backend connectivity
curl http://localhost:5000/health

# 2. Test admin login via API
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aidaa.com","password":"admin123"}'

# 3. Check frontend bundle
npm run build --prefix frontend

# 4. Check database
node -e "require('./backend/src/config/db').query('SELECT COUNT(*) FROM users')"

# All should return success responses ✅
```

---

## 🎯 Success Criteria

Your project is **successfully set up** when:

✅ Backend server starts on port 5000  
✅ Frontend dev server starts on port 5173  
✅ Database contains 4 users (1 admin, 2 parents, 1 professional)  
✅ Admin login works: `admin@aidaa.com` / `admin123`  
✅ After login, redirects to `/admin/dashboard`  
✅ Browser DevTools shows token in localStorage  
✅ Accessing protected routes without auth redirects to `/login`

---

## 📞 When You Get Stuck

1. **Check the console logs** (F12 in browser → Console tab)
2. **Check backend logs** (Terminal running `npm run dev`)
3. **Check DATABASE** (Use `node backend/test-login.js`)
4. **Search documentation** (COMPREHENSIVE_PROJECT_UNDERSTANDING.md)
5. **Check middleware** (backend/src/middlewares/)
6. **Verify .env files** (backend/.env and frontend/.env)

---

## 🏁 You Are Here

**Current Phase:** Authentication Complete ✅  
**Next Phase:** Dashboard Development  
**Overall Progress:** 60% Complete

**Get started by reading:** `COMPREHENSIVE_PROJECT_UNDERSTANDING.md`

---

**Need Help?** Check the full documentation in COMPREHENSIVE_PROJECT_UNDERSTANDING.md

