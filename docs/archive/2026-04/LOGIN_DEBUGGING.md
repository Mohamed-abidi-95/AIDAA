## 🧪 LOGIN DEBUGGING GUIDE

### Quick Checklist

✅ **Backend Status**
- Running on: http://localhost:5000
- Health check: /health endpoint returns success
- Login endpoint: /api/auth/login working
- CORS: Enabled for all origins

✅ **Frontend Status**  
- Running on: http://localhost:5174
- Auto-reload enabled with Vite
- Console logs enabled for debugging

### What Should Happen When You Login

1. **Enter Credentials**
   - Email: admin@aidaa.com
   - Password: admin123

2. **Click Login Button**
   - Button should show "Logging in..." state
   - Console should show: `[API Request] POST /api/auth/login`

3. **Backend Processes Request**
   - Checks email exists in database
   - Validates password with bcryptjs
   - Returns JWT token

4. **Frontend Receives Response**
   - Console shows: `[API Response] 200 /api/auth/login`
   - Saves token to localStorage
   - Saves user to localStorage
   - Redirects to /admin (for admin role)

5. **You See Admin Panel**
   - Header says "Admin Panel"
   - Welcome message shows your name
   - Logout button available

### If Login Fails - Check Console (F12)

Look for these logs:

**Good signs:**
```
[API Request] POST /api/auth/login
[auth.service] Login response: {success: true, ...}
[Login] Login successful for user: admin@aidaa.com Role: admin
```

**Bad signs:**
```
[API Error] Network error...
[API Error] 401 Invalid email or password
[Login] Error occurred: ...
```

### Test Credentials

**Admin (Password already set):**
- Email: admin@aidaa.com
- Password: admin123
- Expects: Redirect to /admin

**Parent (First-time - password not set):**
- Email: sarah.johnson@example.com
- Password: (any value - will be ignored)
- Expects: Redirect to /set-password page

**Professional (First-time - password not set):**
- Email: emily.brown@aidaa.com
- Password: (any value - will be ignored)
- Expects: Redirect to /set-password page

### How to Debug

1. **Clear Cache**
   - Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
   - This loads the latest compiled code from Vite

2. **Open Browser Console**
   - Press F12 or Ctrl+Shift+J
   - Go to Console tab
   - Watch for logs as you login

3. **Check Network Tab**
   - Press F12, go to Network tab
   - Try login
   - Look for POST request to /api/auth/login
   - Check Response tab to see what backend returned

4. **Common Issues**

   **Issue: "Network Error"**
   - Backend not running
   - Solution: `cd backend && yarn dev`

   **Issue: "Invalid email or password"**
   - Credentials are wrong
   - Solution: Try admin@aidaa.com / admin123

   **Issue: Button doesn't respond**
   - Code not reloaded
   - Solution: Hard refresh (Ctrl+Shift+R)

   **Issue: Redirects but page doesn't load**
   - Dashboard page might have errors
   - Solution: Check console for JavaScript errors

### Still Not Working?

1. **Stop everything**
   ```powershell
   # Kill port 5000 (backend)
   Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
   
   # Kill port 5174 (frontend)
   Get-Process -Id (Get-NetTCPConnection -LocalPort 5174).OwningProcess | Stop-Process -Force
   ```

2. **Restart backend**
   ```powershell
   cd c:\Users\sbaih\Desktop\projet aidaa\backend
   yarn dev
   ```

3. **Restart frontend**
   ```powershell
   cd c:\Users\sbaih\Desktop\projet aidaa\frontend
   npm run dev
   ```

4. **Clear browser cache**
   - Press Ctrl+Shift+Delete
   - Select "All time"
   - Clear cache

5. **Try login again**

### File Locations

**Frontend Files:**
- Login page: `frontend/src/pages/LoginPage.tsx`
- Auth service: `frontend/src/services/auth.service.ts`
- API client: `frontend/src/services/api.ts`
- Auth hook: `frontend/src/hooks/useAuth.ts`

**Backend Files:**
- Server: `backend/src/server.js`
- App: `backend/src/app.js`
- Auth routes: `backend/src/routes/auth.routes.js`
- Auth controller: `backend/src/controllers/auth.controller.js`
- Database: `backend/src/config/db.js`

