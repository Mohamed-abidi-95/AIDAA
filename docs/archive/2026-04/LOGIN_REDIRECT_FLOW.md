# Login Redirect Logic - Complete Flow

## Overview
The login redirect system is fully implemented with role-based routing. After successful authentication, users are automatically redirected to their role-specific dashboard.

---

## Complete Data Flow

### 1. User Submits Login Form
**Location**: LoginPage.tsx (handleSubmit)
```
Email: admin@aidaa.com
Password: admin123
  ↓
Calls: useAuth.login(email, password)
```

---

### 2. Frontend Auth Service
**Location**: auth.service.ts (login function)
```typescript
POST /api/auth/login → {email, password}
  ↓
Response: {
  success: true,
  data: {
    token: "eyJhbGc...",
    user: {
      id: 14,
      name: "Admin User",
      email: "admin@aidaa.com",
      role: "admin"
    }
  }
}
  ↓
Save to localStorage:
  - aidaa_token = "eyJhbGc..."
  - aidaa_user = JSON.stringify(user)
```

---

### 3. Backend Response Structure
**Location**: auth.controller.js (login function)

**Success Response:**
```javascript
{
  success: true,
  message: 'Login successful',
  data: {
    token: jwt.sign({ id, name, email, role }, JWT_SECRET, { expiresIn: '7d' }),
    user: { id, name, email, role }
  }
}
```

**JWT Payload (inside token):**
```javascript
{
  id: 14,
  name: "Admin User",
  email: "admin@aidaa.com",
  role: "admin"
  // + JWT standard claims: iat, exp
}
```

---

### 4. Frontend Redirect Logic
**Location**: LoginPage.tsx (handleSubmit)

```typescript
// After successful login response:
if (response.mustSetPassword) {
  navigate('/set-password', { state: { userId: response.userId } });
  return;
}

const storedUserJson = localStorage.getItem('aidaa_user');
const user = JSON.parse(storedUserJson);

// Small delay to ensure React state updates are applied
await new Promise(resolve => setTimeout(resolve, 300));

switch (user.role) {
  case 'parent':       → navigate('/role-selection')
  case 'admin':        → navigate('/admin/dashboard')
  case 'professional': → navigate('/professional/dashboard')
}
```

**Console Output:**
```
[Login] Attempting login with email: admin@aidaa.com
[auth.service] User role: admin
[Login] Login successful for user: admin@aidaa.com Role: admin
[Login] Waiting for state update...
[Login] Redirecting admin to /admin/dashboard
```

---

### 5. Route Protection
**Location**: App.tsx + ProtectedRoute.tsx + RoleRoute.tsx

```
GET /admin/dashboard
  ↓
ProtectedRoute checks:
  - Is token in localStorage? YES
  - Is user authenticated? YES
  ↓
RoleRoute checks (allowedRoles: ['admin']):
  - Is user.role === 'admin'? YES
  ↓
AdminPanel component renders ✓
```

---

## Key Files and Their Roles

| File | Purpose | Key Function |
|------|---------|--------------|
| **Backend** |
| `auth.controller.js` | Login validation | Returns JWT + user with role |
| **Frontend** |
| `auth.service.ts` | API calls + localStorage | Saves token and user data |
| `LoginPage.tsx` | Login form + redirect | Routes based on user.role |
| `useAuth.ts` | Auth state management | Manages user/token state |
| `ProtectedRoute.tsx` | Guards protected routes | Checks if user is authenticated |
| `RoleRoute.tsx` | Guards role-specific routes | Checks if user has correct role |
| `App.tsx` | Route configuration | Defines /admin/dashboard, /parent/dashboard, /professional/dashboard |

---

## Test Credentials

| Email | Password | Role | Expected Redirect |
|-------|----------|------|-------------------|
| admin@aidaa.com | admin123 | admin | /admin/dashboard |
| parent@aidaa.com | parent123 | parent | /role-selection |
| professional@aidaa.com | professional123 | professional | /professional/dashboard |

---

## Test Steps

1. **Hard Refresh Browser**
   ```
   Ctrl+Shift+R (Clear cache)
   ```

2. **Open Developer Console**
   ```
   F12 → Console tab
   ```

3. **Test Admin Login**
   ```
   URL: http://localhost:5173
   Email: admin@aidaa.com
   Password: admin123
   Click: Login button
   ```

4. **Watch Console for Flow**
   ```
   [Login] Attempting login with email: admin@aidaa.com
   [auth.service] User role: admin
   [Login] Login successful for user: admin@aidaa.com Role: admin
   [Login] Redirecting admin to /admin/dashboard
   ```

5. **Verify Redirect**
   ```
   Current URL: http://localhost:5173/admin/dashboard
   Component: AdminPanel rendered
   ```

---

## Error Handling

### Backend Errors
| Scenario | Response | Status |
|----------|----------|--------|
| Email not provided | { success: false, message: 'Email is required' } | 400 |
| Password not provided | { success: false, message: 'Password is required' } | 400 |
| User not found | { success: false, message: 'Invalid email or password' } | 401 |
| Password mismatch | { success: false, message: 'Invalid email or password' } | 401 |
| Account inactive | { success: false, message: 'Account is inactive' } | 403 |
| First-time setup needed | { success: true, mustSetPassword: true, userId: X } | 200 |

### Frontend Error Display
**LoginPage.tsx** shows error messages:
- "Invalid email or password" → 401 response
- "Network error: Cannot connect to backend server" → Connection failed
- "Request timeout: Backend is not responding" → Timeout
- Custom error message from server

---

## Security Features

✓ **Backend:**
- Passwords hashed with bcryptjs (saltRounds: 12)
- JWT tokens expire in 7 days
- Sensitive user info not leaked in error messages
- Account deactivation support

✓ **Frontend:**
- Tokens stored in localStorage (httpOnly cookie recommended for production)
- User data never includes password
- Protected routes verify token exists
- Role-based routes verify user role matches

---

## localStorage Structure

After successful login:
```javascript
// Token (38KB typical)
localStorage.aidaa_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// User object (150 bytes)
localStorage.aidaa_user = '{"id":14,"name":"Admin User","email":"admin@aidaa.com","role":"admin"}'
```

---

## Console Logging for Debugging

### When Everything Works
```
[auth.service] Login response: {success: true, data: {token: "...", user: {id, name, email, role}}}
[auth.service] User role: admin
[auth.service] User saved to localStorage: {id, name, email, role}
[Login] Attempting login with email: admin@aidaa.com
[Login] Login successful for user: admin@aidaa.com Role: admin
[Login] Redirecting admin to /admin/dashboard
```

### When Something Fails
```
[auth.service] Login error: Error: Network error...
[Login] Error occurred: Error: Network error...
[Login] Unexpected response format: ...
```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Login button does nothing | Component not re-rendering | Hard refresh (Ctrl+Shift+R) |
| "Network error" message | Backend not running | Start backend: `yarn dev` in backend folder |
| Stays on login page after clicking login | Wrong email/password | Check credentials in test credentials table |
| Redirects to /login instead of dashboard | Role mismatch in RoleRoute | Check user.role in console logs |
| 404 error | Wrong route path | Verify path is /admin/dashboard (not /admin) |
| Token not in localStorage | Auth response failed to parse | Check browser console for parse errors |

---

## Next Steps (Optional Enhancements)

- [ ] Add "Remember me" functionality
- [ ] Implement refresh token rotation
- [ ] Add 2FA (Two-Factor Authentication)
- [ ] Store token in httpOnly cookie (backend sets cookie instead of frontend localStorage)
- [ ] Add logout and token cleanup
- [ ] Add password reset flow
- [ ] Add role-based navigation menu

