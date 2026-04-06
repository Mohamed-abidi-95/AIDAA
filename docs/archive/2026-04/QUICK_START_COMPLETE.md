# 🚀 AIDAA - QUICK START GUIDE

**Last Updated:** April 4, 2026  
**Status:** ✅ Production Ready

---

## 🔐 TEST ACCOUNTS (Created & Verified)

### 1️⃣ Admin Account
```
Email:    admin@aidaa.com
Password: admin123
Role:     admin
Dashboard: Admin Panel
```

### 2️⃣ Parent Account
```
Email:    parent@aidaa.com
Password: parent123
Role:     parent
Dashboard: Parent Dashboard
Child:    Test Child 1 (age 5)
```

### 3️⃣ Professional/Doctor Account
```
Email:    professional@aidaa.com
Password: professional123
Role:     professional
Dashboard: Professional Portal
```

---

## ⚡ STARTUP (3 TERMINALS)

### Terminal 1 - Backend
```bash
cd C:\Users\MohamedAbidi\PhpstormProjects\AIDAA\backend
npm run dev
```
Expected: `Server running on port 5000`

### Terminal 2 - Frontend
```bash
cd C:\Users\MohamedAbidi\PhpstormProjects\AIDAA\frontend
npm run dev
```
Expected: `Local: http://localhost:5173`

### Terminal 3 - Browser
```
Open: http://localhost:5173
```

---

## 🎯 TEST EACH ROLE

### Admin Login
1. Go to http://localhost:5173
2. Email: `admin@aidaa.com`
3. Password: `admin123`
4. ✅ Should redirect to `/admin` (Admin Panel)

### Parent Login
1. Go to http://localhost:5173
2. Email: `parent@aidaa.com`
3. Password: `parent123`
4. ✅ Should redirect to `/parent/dashboard`

### Professional Login
1. Go to http://localhost:5173
2. Email: `professional@aidaa.com`
3. Password: `professional123`
4. ✅ Should redirect to `/professional/dashboard`

---

## 📊 API ENDPOINTS (Test with Postman/cURL)

### Health Check
```bash
curl http://localhost:5000/health
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@aidaa.com",
    "password": "admin123"
  }'
```

### Get All Content
```bash
curl http://localhost:5000/api/content
```

### Get Parent's Children
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/child/mychildren
```

---

## 🔄 DATABASE OPERATIONS

### Create Test Users
```bash
# Create parent
cd backend && node insert-parent.js

# Create professional
cd backend && node insert-professional.js
```

### View Database
```bash
# Connect to MySQL
mysql -u root aidaa_db

# Common queries
SELECT * FROM users;
SELECT * FROM children;
SELECT * FROM content;
```

---

## 📁 PROJECT STRUCTURE

```
AIDAA/
├── backend/
│   ├── src/
│   │   ├── app.js                 (Express config)
│   │   ├── server.js              (Port 5000)
│   │   ├── controllers/           (Business logic)
│   │   ├── models/                (Database queries)
│   │   ├── routes/                (API endpoints)
│   │   ├── middlewares/           (Auth, upload, etc)
│   │   └── config/                (Database config)
│   ├── insert-parent.js           (Create parent user)
│   ├── insert-professional.js     (Create professional user)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/                 (Login, Dashboards)
│   │   ├── components/            (Games, UI)
│   │   ├── services/              (API calls)
│   │   ├── hooks/                 (useAuth, etc)
│   │   └── styles/                (CSS)
│   ├── index.html
│   └── package.json
│
└── Documentation/
    ├── COMPREHENSIVE_PROJECT_UNDERSTANDING.md
    ├── DEPLOYMENT_GUIDE.md
    ├── PHASE2_COMPLETION.md
    └── ... (8+ guides)
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] MySQL running and connected
- [ ] Backend starts on port 5000
- [ ] Frontend starts on port 5173
- [ ] Can access http://localhost:5173
- [ ] Login page displays
- [ ] Admin login works
- [ ] Parent login works
- [ ] Professional login works
- [ ] Redirects work correctly
- [ ] Database has all test data

---

## 🆘 TROUBLESHOOTING

### Port 5000 Already in Use
```bash
# Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Database Connection Error
```bash
# Check credentials in backend/.env
# Default: root, no password
# Verify MySQL is running
```

### Module Not Found: multer
```bash
cd backend
npm install multer
```

### Frontend won't start
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 IMPORTANT URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:5173 | 5173 |
| Backend | http://localhost:5000 | 5000 |
| Health | http://localhost:5000/health | 5000 |
| MySQL | localhost:3306 | 3306 |

---

## 📝 NEXT STEPS

1. ✅ Start backend & frontend
2. ✅ Test all 3 accounts
3. ✅ Explore each dashboard
4. ✅ Play the games
5. ✅ Upload content
6. ✅ View activity logs

---

## 🎉 YOU'RE READY!

**The AIDAA application is fully functional and ready to use!**

Questions? Check the documentation files or API logs.

---

**Happy Testing!** 🚀

