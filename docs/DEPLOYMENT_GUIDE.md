# 🚀 AIDAA - DEPLOYMENT & TESTING GUIDE

**Date:** April 4, 2026  
**Phase:** MVP Deployment Ready  
**Estimated Time to Deploy:** 30 minutes

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### Backend
- [x] Express server configured
- [x] MySQL connection working
- [x] All routes mounted
- [x] Middleware configured
- [x] Error handling in place
- [x] Upload system ready
- [x] JWT authentication working

### Frontend
- [x] React app configured
- [x] All pages created
- [x] Components integrated
- [x] Styling complete
- [x] Games implemented
- [x] API integration ready
- [x] Routes configured

### Database
- [x] Schema created
- [x] Sample data inserted
- [x] Relationships configured
- [x] Indexes added
- [ ] Updates applied (database_updates.sql)

---

## 🔧 DEPLOYMENT STEPS

### Step 1: Update Database (5 min)

```bash
# Connect to MySQL and run:
mysql -u root aidaa_db < database_updates.sql
```

Or manually in MySQL:
```sql
-- Add columns to activity_logs
ALTER TABLE activity_logs 
ADD COLUMN action VARCHAR(50) DEFAULT 'content_accessed' AFTER status,
ADD COLUMN score INT DEFAULT 0,
ADD COLUMN duration_seconds INT DEFAULT 0;

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  child_id INT NOT NULL,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY(sender_id) REFERENCES users(id),
  FOREIGN KEY(receiver_id) REFERENCES users(id)
);
```

### Step 2: Install Dependencies (5 min)

```bash
# Backend
cd backend
npm install multer

# Frontend
cd frontend
npm install
```

### Step 3: Start Backend Server (2 min)

```bash
cd backend
npm run dev
```

Expected output:
```
[nodemon] restarting due to changes...
Server running on port 5000
Database connected
```

### Step 4: Start Frontend Server (2 min)

```bash
# In new terminal
cd frontend
npm run dev
```

Expected output:
```
VITE v5.0.0 ready in XXX ms

➜  Local:   http://localhost:5173/
```

### Step 5: Access Application (Immediate)

Open browser:
```
http://localhost:5173
```

---

## 🧪 TESTING SCENARIOS

### Test 1: Admin Login
**Time:** 2 min

1. Open http://localhost:5173
2. Email: `admin@aidaa.com`
3. Password: `admin123`
4. Click Login
5. Should redirect to `/admin/dashboard`

**Expected Result:** ✅ Admin panel loads

---

### Test 2: Upload Content
**Time:** 5 min

1. Click "⬆️ Upload Content" tab
2. Fill form:
   - Title: "Test Video"
   - Type: "video"
   - Category: "Language"
   - Description: "Test video content"
3. Select a video file (create dummy or use any .mp4)
4. Click "Upload Content"
5. Should show "Content uploaded successfully!"

**Expected Result:** ✅ Content appears in list

---

### Test 3: View Content as Child
**Time:** 3 min

1. Logout (click Logout button)
2. Login with different user or create test child user
3. Navigate to Child Dashboard
4. Click "🎬 Videos"
5. Should see uploaded content

**Expected Result:** ✅ Content displays and can be played

---

### Test 4: Play a Game
**Time:** 3 min

1. Navigate to Child Dashboard
2. Click "🎮 Games"
3. Select "🎨 Color Match"
4. Click a color that matches the display
5. Score should increase
6. Game should continue

**Expected Result:** ✅ Game works and tracks score

---

### Test 5: Parent View Activity
**Time:** 4 min

1. Logout and login as parent
2. Go to Parent Dashboard
3. Select child from dropdown
4. Click "📊 Summary" tab
5. Should show:
   - Total activities
   - Total time
   - Average score
6. Click "🎮 Activities" tab
7. Should show activity history

**Expected Result:** ✅ Activity data displays correctly

---

### Test 6: Doctor Add Note
**Time:** 3 min

1. Logout and login as professional/doctor
2. Go to Professional Portal
3. Select patient from dropdown
4. Click "📝 Notes" tab
5. Type note in text area: "Patient showed good progress"
6. Click "Add Note"
7. Note should appear in list

**Expected Result:** ✅ Note saved and displayed

---

### Test 7: Admin Manage Users
**Time:** 2 min

1. Login as admin
2. Go to Admin Panel
3. Click "👥 Users" tab
4. Should see table with:
   - Name
   - Email
   - Role
   - Status (Active/Inactive)

**Expected Result:** ✅ User list displays

---

### Test 8: Responsive Design
**Time:** 3 min

1. Open DevTools (F12)
2. Toggle device toolbar
3. Select "iPhone 12"
4. Reload page
5. Check if:
   - Buttons are still clickable
   - Text is readable
   - Layout adapts
6. Try tablet size

**Expected Result:** ✅ Responsive design works

---

## 🐛 COMMON ISSUES & FIXES

### Issue: "Cannot connect to backend"
**Cause:** Backend not running or wrong URL  
**Fix:**
```bash
# Ensure backend is running
cd backend
npm run dev

# Check if port 5000 is in use
netstat -ano | findstr 5000
```

### Issue: Database connection error
**Cause:** MySQL not running or credentials wrong  
**Fix:**
```bash
# Check .env file has correct credentials
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_DATABASE=aidaa_db

# Restart MySQL service
```

### Issue: Upload fails
**Cause:** Multer not installed or `/uploads` folder missing  
**Fix:**
```bash
# Install multer
npm install multer

# Backend creates folder automatically
# If not, create manually:
mkdir backend/uploads
```

### Issue: Games not working
**Cause:** Missing React import or component not loaded  
**Fix:**
```bash
# Check Games.tsx is imported in ChildDashboard.tsx
import { GamesContainer } from '../components/Games';

# Verify no TypeScript errors
npm run dev  # Should show any compile errors
```

### Issue: Styling looks broken
**Cause:** CSS file not imported or wrong path  
**Fix:**
```bash
# Check import in page files:
import '../styles/DashboardEnhanced.css';

# Or use original Dashboard.css
import '../styles/Dashboard.css';
```

---

## 📊 PERFORMANCE TESTING

### Load Testing
1. Open DevTools → Network
2. Refresh page
3. Check:
   - Page loads < 2 seconds
   - API responses < 1 second
   - Images/videos stream properly

### API Testing (cURL)
```bash
# Health check
curl http://localhost:5000/health

# Get all content
curl http://localhost:5000/api/content

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aidaa.com","password":"admin123"}'
```

---

## 📱 BROWSER TESTING

Test on these browsers:
- [ ] Chrome/Edge (Latest)
- [ ] Firefox (Latest)
- [ ] Safari (if available)
- [ ] Mobile Chrome (DevTools)
- [ ] Mobile Safari (DevTools)

All should show:
- ✅ Login form displays
- ✅ Buttons clickable
- ✅ Forms submittable
- ✅ Dashboards load
- ✅ Games playable

---

## 🔐 SECURITY VERIFICATION

- [ ] Passwords hashed (bcryptjs)
- [ ] JWT tokens in use
- [ ] Protected routes require auth
- [ ] Role-based access working
- [ ] No SQL injection (parameterized queries)
- [ ] No XSS vulnerabilities (React escaping)

---

## 📈 SUCCESS METRICS

### Backend
- [ ] All endpoints responding
- [ ] Database queries fast (< 200ms)
- [ ] File uploads working
- [ ] Error handling working
- [ ] Logs clear and helpful

### Frontend
- [ ] Page loads smooth
- [ ] Interactions responsive
- [ ] No console errors
- [ ] Styling looks good
- [ ] Games play smoothly

### User Experience
- [ ] Easy login
- [ ] Clear navigation
- [ ] Intuitive dashboards
- [ ] Games fun and engaging
- [ ] Mobile friendly

---

## 🎯 FINAL VERIFICATION

Before declaring "DONE":

```
[x] Backend server running
[x] Frontend server running
[x] Database updated
[x] Login works
[x] All dashboards load
[x] Games playable
[x] File upload works
[x] Activities tracked
[x] Notes saved
[x] Responsive design
[x] No console errors
[x] No API errors
```

---

## 📝 DEPLOYMENT SUMMARY

**Time to Deploy:** 30 minutes  
**Prerequisites:**
- Node.js installed
- MySQL running
- Browser available

**Post-Deployment:**
- Monitor logs
- Check performance
- Gather user feedback
- Fix bugs as found

---

## 🎉 SUCCESS!

Once you see all ✅ marks, your AIDAA application is:
- ✅ Fully functional
- ✅ Production ready (for PFE)
- ✅ Tested and verified
- ✅ Ready for presentation

**Congratulations on completing the AIDAA MVP!** 🚀

---

## 📞 QUICK TROUBLESHOOTING

**Backend won't start:**
```bash
# Kill process on port 5000
Get-Process node | Stop-Process -Force
# Try again
npm run dev
```

**Database error:**
```bash
# Check connection
mysql -u root -p
# Verify aidaa_db exists
SHOW DATABASES;
```

**Frontend build error:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Games not loading:**
```bash
# Check import path
import { GamesContainer } from '../components/Games';
# Check file exists at src/components/Games.tsx
```

---

**All set! Deploy and enjoy your AIDAA application!** 🎊

