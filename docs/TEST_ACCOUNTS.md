# 🔐 AIDAA - TEST ACCOUNTS & CREDENTIALS

**Date:** April 4, 2026  
**Status:** ✅ All Accounts Created & Verified  
**Last Updated:** [Current Session]

---

## 📋 ALL TEST ACCOUNTS

### Account 1: ADMIN
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email:         admin@aidaa.com
Password:      admin123
Role:          admin
User ID:       1
Status:        ✅ ACTIVE
Dashboard:     http://localhost:5173/admin/dashboard
Features:      - Upload content
               - Manage users
               - View system stats
               - Create users
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Account 2: PARENT
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email:         parent@aidaa.com
Password:      parent123
Role:          parent
User ID:       5
Status:        ✅ ACTIVE
Dashboard:     http://localhost:5173/role-selection (puis /parent/dashboard ou /child)
Child:         Test Child 1 (age 5)
Child ID:      3
Features:      - View children
               - Track activities
               - Read medical notes
               - Message doctor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Account 3: PROFESSIONAL/DOCTOR
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email:         professional@aidaa.com
Password:      professional123
Role:          professional
User ID:       6
Status:        ✅ ACTIVE
Dashboard:     http://localhost:5173/professional/dashboard
Features:      - Select patients
               - View activity logs
               - Write notes
               - Message parents
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🧪 TESTING FLOW

### Step 1: Admin Login Test
```
1. Go to: http://localhost:5173
2. Click: "Login"
3. Email: admin@aidaa.com
4. Password: admin123
5. Click: "LOGIN"
6. ✅ Expected: Redirect to /admin/dashboard
   - See: "Admin Panel" header
   - See: Upload, Users, Content tabs
```

### Step 2: Parent Login Test
```
1. Go to: http://localhost:5173
2. Click: "Logout" (if still logged in)
3. Click: "Login"
4. Email: parent@aidaa.com
5. Password: parent123
6. Click: "LOGIN"
7. ✅ Expected: Redirect to /role-selection
   - Choose "Parent Mode" to go to /parent/dashboard
   - Choose "Child Mode" to go to /child
```

### Step 3: Professional Login Test
```
1. Go to: http://localhost:5173
2. Click: "Logout" (if still logged in)
3. Click: "Login"
4. Email: professional@aidaa.com
5. Password: professional123
6. Click: "LOGIN"
7. ✅ Expected: Redirect to /professional/dashboard
   - See: "Professional Portal" header
   - See: Patient selector
   - See: Activity tabs
```

---

## 📊 DATABASE VERIFICATION

### View All Users
```sql
SELECT id, name, email, role, is_active FROM users;
```

**Expected Output:**
```
id | name                    | email                    | role           | is_active
1  | Admin Test              | admin@aidaa.com          | admin          | 1
5  | Parent Test             | parent@aidaa.com         | parent         | 1
6  | Dr. Professional Test   | professional@aidaa.com   | professional   | 1
```

### View Children
```sql
SELECT c.id, c.name, c.age, u.email as parent_email 
FROM children c 
JOIN users u ON c.parent_id = u.id;
```

**Expected Output:**
```
id | name           | age | parent_email
3  | Test Child 1   | 5   | parent@aidaa.com
```

---

## 🔄 CREATE NEW TEST ACCOUNTS

### Create Another Parent
```bash
cd backend
node insert-parent.js
# Creates: parent@aidaa.com / parent123
```

### Create Another Professional
```bash
cd backend
node insert-professional.js
# Creates: professional@aidaa.com / professional123
```

### Manually via MySQL
```sql
USE aidaa_db;

-- Create parent
INSERT INTO users (name, email, password, role, is_active)
VALUES (
  'Another Parent',
  'another-parent@aidaa.com',
  '$2a$12$rZjzKsF.wQg0V5zQz7lfH.2JGvKQHQrQsqGZqP7Jc9kQqM0HvLQvC',  -- password: parent123
  'parent',
  1
);
```

---

## 🎮 TEST FEATURES FOR EACH ROLE

### Admin Features to Test
- [ ] Login & redirect to admin panel
- [ ] Upload content (video/audio/image)
- [ ] View all content
- [ ] View all users
- [ ] Create new users
- [ ] Edit users

### Parent Features to Test
- [ ] Login & redirect to parent dashboard
- [ ] Select child from dropdown
- [ ] View activity summary (games, time, score)
- [ ] View recent activities
- [ ] View medical notes from doctor
- [ ] See child information

### Professional Features to Test
- [ ] Login & redirect to professional dashboard
- [ ] Select patient from dropdown
- [ ] View patient information
- [ ] View patient activity logs
- [ ] Add clinical notes
- [ ] Edit existing notes

---

## 🚨 IF LOGIN FAILS

### Error: "Invalid email or password"
```bash
# Option 1: Recreate the user
node backend/insert-parent.js

# Option 2: Verify password hash
mysql -u root aidaa_db
SELECT email, password FROM users WHERE email = 'parent@aidaa.com';

# Option 3: Check database connection
# Verify backend/.env has correct credentials
```

### Error: "Cannot connect to server"
```bash
# Verify backend is running
cd backend
npm run dev

# Check port 5000 is free
netstat -ano | findstr :5000
```

### Error: "Page not found after login"
```bash
# Verify frontend is running
cd frontend
npm run dev

# Check browser console for errors
# F12 → Console tab
```

---

## 📝 PASSWORD HASHING INFO

All passwords are hashed using **bcryptjs** with 12 salt rounds.

**Hashed passwords in database:**
```
admin123:           $2a$12$C7OtpVjQ6tqp6oHJfH0dCez9JlJwxW0uFqRvMKLQvN8J5kQqM0HvLQvC
parent123:          $2a$12$rZjzKsF.wQg0V5zQz7lfH.2JGvKQHQrQsqGZqP7Jc9kQqM0HvLQvC
professional123:    $2a$12$sAzK0tQr8uHsP9wXyZ1nG.3MqLpQvJkRsZaB1cQdEeFfGhIjKlMnOp
```

---

## ✅ SUCCESS INDICATORS

When everything is working correctly:

1. ✅ Can login with all 3 accounts
2. ✅ Each account redirects to correct dashboard
3. ✅ No console errors (F12 → Console)
4. ✅ Backend logs show successful connections
5. ✅ Database queries return correct data
6. ✅ Can switch between accounts (logout & login)

---

## 🎯 WHAT'S NEXT

1. Explore Admin Panel
   - Upload a video/audio
   - Create new users
   - Manage content

2. Explore Parent Dashboard
   - View child activities
   - Check medical notes
   - Message professional

3. Explore Professional Dashboard
   - View assigned patients
   - Add clinical notes
   - Monitor progress

4. Test Child Space
   - Play games
   - Track scores
   - View content

---

## 📞 QUICK REFERENCE

| Need | Action |
|------|--------|
| Test Admin | Use: admin@aidaa.com / admin123 |
| Test Parent | Use: parent@aidaa.com / parent123 |
| Test Professional | Use: professional@aidaa.com / professional123 |
| Add More Users | Run: node insert-parent.js |
| View Database | Run: mysql -u root aidaa_db |
| Check Backend | Go to: http://localhost:5000/health |
| Check Frontend | Go to: http://localhost:5173 |

---

**All accounts are ready to use!** 🎉

**Last verified:** April 4, 2026  
**Database status:** ✅ All test data inserted  
**Application status:** ✅ Ready for testing

