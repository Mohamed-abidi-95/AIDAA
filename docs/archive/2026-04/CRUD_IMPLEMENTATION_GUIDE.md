# 🔧 CRUD Implementation Guide - Missing Features

**Date:** April 4, 2026  
**Purpose:** Detailed guide to complete missing CRUD operations  
**Audience:** Development Team

---

## 📋 What's Missing

### Summary Table

| Feature | Status | Priority | Estimated Time |
|---------|--------|----------|-----------------|
| User UPDATE | ❌ | HIGH | 1-2 hours |
| User DELETE | ❌ | HIGH | 1-2 hours |
| Activity Log UPDATE | ⚠️ | HIGH | 1 hour |
| Activity Log DELETE | ❌ | HIGH | 1 hour |
| Note UPDATE | ❌ | MEDIUM | 1-2 hours |
| Note DELETE | ❌ | MEDIUM | 1-2 hours |
| Teleconsult UPDATE | ❌ | MEDIUM | 1-2 hours |
| Teleconsult DELETE | ❌ | MEDIUM | 1-2 hours |
| Content DELETE | ⚠️ | LOW | 30 min |
| Admin full CRUD | ❌ | MEDIUM | 4-6 hours |

---

## 🎯 Implementation Priority

### Phase 1: HIGH PRIORITY (Do First)
1. User UPDATE & DELETE
2. Activity Log UPDATE & DELETE
3. Improve error handling

### Phase 2: MEDIUM PRIORITY (Do Next)
1. Notes full CRUD
2. Teleconsultations full CRUD
3. Admin full user management

### Phase 3: LOW PRIORITY (Polish)
1. Content DELETE verification
2. Pagination for list endpoints
3. Advanced filtering

---

## 🔨 Detailed Implementation Instructions

### 1️⃣ USER UPDATE Operation

#### File: `backend/src/models/user.model.js`

Add this function at the end of the file:

```javascript
// ============================================================================
// UPDATE USER INFORMATION
// ============================================================================
// Function: updateUser(userId, { name, email, role, is_active })
// Purpose: Update user details by ID
// Returns: boolean indicating success
const updateUser = async (userId, updateData) => {
  try {
    // Build dynamic UPDATE query based on provided fields
    let updateFields = [];
    let params = [];

    // Add fields to update if provided
    if (updateData.name !== undefined) {
      updateFields.push('name = ?');
      params.push(updateData.name);
    }
    if (updateData.email !== undefined) {
      updateFields.push('email = ?');
      params.push(updateData.email);
    }
    if (updateData.role !== undefined) {
      updateFields.push('role = ?');
      params.push(updateData.role);
    }
    if (updateData.is_active !== undefined) {
      updateFields.push('is_active = ?');
      params.push(updateData.is_active);
    }

    // No fields to update
    if (updateFields.length === 0) {
      return false;
    }

    // Add user ID as WHERE clause
    params.push(userId);

    // Execute UPDATE
    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    const results = await query(sql, params);
    
    return results.affectedRows > 0;
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};

// Export at bottom of file
module.exports = {
  // ...existing exports...
  updateUser,
};
```

#### File: `backend/src/controllers/user.controller.js`

Add this function (around line 200):

```javascript
// ============================================================================
// UPDATE USER
// ============================================================================
// Endpoint: PUT /api/users/:id
// Access: Admin only
// Purpose: Update user information
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, is_active } = req.body;

    // Validate at least one field is provided
    if (!name && !email && role === undefined && is_active === undefined) {
      return res.status(400).json({
        success: false,
        message: 'At least one field must be provided to update',
      });
    }

    // Find user to verify exists
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Validate name if provided
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Name cannot be empty',
        });
      }
      if (name.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Name must be less than 100 characters',
        });
      }
    }

    // Validate email if provided
    if (email !== undefined && email !== user.email) {
      const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format',
        });
      }
      // Check if email already exists
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use',
        });
      }
    }

    // Validate role if provided
    if (role !== undefined && !['admin', 'parent', 'professional'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be admin, parent, or professional',
      });
    }

    // Validate is_active if provided
    if (is_active !== undefined && ![0, 1].includes(is_active)) {
      return res.status(400).json({
        success: false,
        message: 'is_active must be 0 or 1',
      });
    }

    // Update user
    const success = await userModel.updateUser(id, {
      name,
      email,
      role,
      is_active,
    });

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update user',
      });
    }

    // Fetch updated user
    const updatedUser = await userModel.findById(id);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        is_active: updatedUser.is_active,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
};

// Export - add to existing exports
module.exports = {
  // ...existing exports...
  updateUser,
};
```

#### File: `backend/src/routes/user.routes.js`

Add this route (after GET route):

```javascript
// ============================================================================
// PUT /api/users/:id
// ============================================================================
// Update user by ID
// Access: Admin only (verified by middlewares above)
//
// Request body:
// {
//   "name": "Updated Name",
//   "email": "updated@example.com",
//   "role": "professional",
//   "is_active": 1
// }
//
// Response (200 on success):
// { "success": true, "data": {...updated user...} }

router.put(
  '/:id',
  userController.updateUser
);
```

---

### 2️⃣ USER DELETE Operation

#### File: `backend/src/models/user.model.js`

Add this function:

```javascript
// ============================================================================
// DELETE USER (Soft Delete - Sets is_active to 0)
// ============================================================================
// Function: deleteUser(userId)
// Purpose: Deactivate user account (soft delete)
// Note: Does NOT remove from database, just sets is_active = 0
// Returns: boolean indicating success
const deleteUser = async (userId) => {
  try {
    // Soft delete: set is_active to 0 instead of hard delete
    // This preserves referential integrity and audit trail
    const results = await query(
      'UPDATE users SET is_active = 0 WHERE id = ?',
      [userId]
    );
    return results.affectedRows > 0;
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
};

// Export
module.exports = {
  // ...existing exports...
  deleteUser,
};
```

#### File: `backend/src/controllers/user.controller.js`

Add this function:

```javascript
// ============================================================================
// DELETE USER
// ============================================================================
// Endpoint: DELETE /api/users/:id
// Access: Admin only
// Purpose: Deactivate user account
// Note: Performs soft delete (sets is_active = 0)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user to verify exists
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deleting self
    if (id == req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account',
      });
    }

    // Delete user (soft delete)
    const success = await userModel.deleteUser(id);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete user',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: { id, is_active: 0 },
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};

// Export
module.exports = {
  // ...existing exports...
  deleteUser,
};
```

#### File: `backend/src/routes/user.routes.js`

Add this route:

```javascript
// ============================================================================
// DELETE /api/users/:id
// ============================================================================
// Deactivate/delete user by ID
// Access: Admin only

router.delete(
  '/:id',
  userController.deleteUser
);
```

---

### 3️⃣ ACTIVITY LOG UPDATE Operation

#### File: `backend/src/models/activityLog.model.js`

Add/Fix this function:

```javascript
// ============================================================================
// UPDATE ACTIVITY LOG STATUS
// ============================================================================
const update = async (logId, status) => {
  // Validate status
  if (!['started', 'completed'].includes(status)) {
    throw new Error('Status must be "started" or "completed"');
  }

  const results = await query(
    'UPDATE activity_logs SET status = ? WHERE id = ?',
    [status, logId]
  );
  
  return results.affectedRows > 0;
};

// Export
module.exports = {
  // ...existing exports...
  update,
};
```

#### File: `backend/src/controllers/activityLog.controller.js`

Complete the update function:

```javascript
// ============================================================================
// UPDATE ACTIVITY LOG STATUS
// ============================================================================
// Endpoint: PUT /api/activity-log/:id
// Access: Parent (own children) or Professional or Admin
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !['started', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be "started" or "completed"',
      });
    }

    // Get the activity log
    const log = await activityLogModel.getById(id);
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Activity log not found',
      });
    }

    // Get the child to verify ownership (parent only)
    const child = await childModel.getById(log.child_id);
    if (child.parent_id !== req.user.id && req.user.role === 'parent') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Update status
    const success = await activityLogModel.update(id, status);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update activity log',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Activity log updated successfully',
      data: {
        id,
        child_id: log.child_id,
        content_id: log.content_id,
        status,
        date: log.date,
      },
    });
  } catch (error) {
    console.error('Update activity log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update activity log',
      error: error.message,
    });
  }
};
```

#### File: `backend/src/routes/activityLog.routes.js`

Ensure route exists:

```javascript
router.put('/:id', auth, activityLogController.update);
```

---

### 4️⃣ ACTIVITY LOG DELETE Operation

#### File: `backend/src/models/activityLog.model.js`

Add this function:

```javascript
// ============================================================================
// DELETE ACTIVITY LOG
// ============================================================================
const deleteLog = async (logId) => {
  const results = await query(
    'DELETE FROM activity_logs WHERE id = ?',
    [logId]
  );
  return results.affectedRows > 0;
};

// Export
module.exports = {
  // ...existing exports...
  deleteLog,
};
```

#### File: `backend/src/controllers/activityLog.controller.js`

Add this function:

```javascript
// ============================================================================
// DELETE ACTIVITY LOG
// ============================================================================
const deleteLog = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the activity log
    const log = await activityLogModel.getById(id);
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Activity log not found',
      });
    }

    // Verify ownership (parent only)
    const child = await childModel.getById(log.child_id);
    if (child.parent_id !== req.user.id && req.user.role === 'parent') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Delete
    const success = await activityLogModel.deleteLog(id);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete activity log',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Activity log deleted successfully',
    });
  } catch (error) {
    console.error('Delete activity log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete activity log',
      error: error.message,
    });
  }
};

// Export
module.exports = {
  // ...existing exports...
  deleteLog,
};
```

#### File: `backend/src/routes/activityLog.routes.js`

Add this route:

```javascript
router.delete('/:id', auth, activityLogController.deleteLog);
```

---

## 🧪 Testing These Implementations

### Test User UPDATE

```bash
# Update user name
curl -X PUT http://localhost:5000/api/users/2 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name"
  }'

# Update multiple fields
curl -X PUT http://localhost:5000/api/users/2 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Name",
    "role": "professional",
    "is_active": 0
  }'
```

### Test User DELETE

```bash
curl -X DELETE http://localhost:5000/api/users/3 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Activity Log UPDATE

```bash
curl -X PUT http://localhost:5000/api/activity-log/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

### Test Activity Log DELETE

```bash
curl -X DELETE http://localhost:5000/api/activity-log/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ⏱️ Implementation Timeline

### Day 1 (2-3 hours)
- [ ] Implement User UPDATE
- [ ] Implement User DELETE
- [ ] Test both operations

### Day 2 (1-2 hours)
- [ ] Implement Activity Log UPDATE
- [ ] Implement Activity Log DELETE
- [ ] Test both operations

### Day 3 (3-4 hours)
- [ ] Implement Notes CRUD
- [ ] Implement Teleconsultations CRUD
- [ ] Comprehensive testing

---

## ✅ Checklist for Implementation

For each operation, verify:
- [ ] Function added to model file
- [ ] Function added to controller file
- [ ] Route added to routes file
- [ ] Input validation implemented
- [ ] Authorization checks in place
- [ ] Error handling complete
- [ ] Response format consistent
- [ ] Function exported properly
- [ ] Tested with curl/Postman
- [ ] Code commented for clarity

---

**Next Steps:** Follow this guide to complete the missing CRUD operations!

