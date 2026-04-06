# 🚀 AIDAA PFE - 48H IMPLEMENTATION PLAN

**Date:** April 4, 2026  
**Deadline:** April 6, 2026 (48 hours)  
**Project Type:** PFE - Autism-focused Application  
**Status:** Code Review Complete - Ready to Implement

---

## 📊 PROJECT STATUS ANALYSIS

### ✅ WHAT'S ALREADY IMPLEMENTED

#### Backend (80% Done)
- ✅ Authentication system (login, JWT, roles)
- ✅ Children CRUD (100% complete)
- ✅ Content CRUD (create, read, update, delete)
- ✅ Activity Logs (create, read, update status)
- ✅ Notes (create, read, update, delete)
- ✅ All database models and connections
- ✅ All middleware (auth, roleCheck, error handling)

#### Frontend (30% Done)
- ✅ Login page
- ✅ Set password page
- ✅ Router setup with role-based guards
- ✅ Authentication service
- ✅ useAuth hook
- ✅ Page skeletons (ParentDashboard, AdminPanel, ProfessionalPage)

#### Database (100% Done)
- ✅ 6 tables (users, children, content, activity_logs, notes, teleconsultations)
- ✅ All relationships and indexes
- ✅ Sample data

---

### ❌ WHAT'S MISSING

#### Backend (20% Missing)
1. **File Upload System** - No multer, no file handling
2. **Activity Logs Enhancement** - Track time & score (not status only)
3. **Messages/Teleconsult** - Text messages not implemented
4. **Serve static files** - `/uploads` folder not served

#### Frontend (70% Missing)
1. **Child Space** - Games and content player
2. **Parent Dashboard** - Activity tracking, analytics
3. **Doctor Dashboard** - Notes management, activity view
4. **Admin Panel** - User management, content upload
5. **Responsive Design** - Mobile-friendly layout
6. **Real Games** - 3 simple games needed

---

## 🎯 48H IMPLEMENTATION STRATEGY

### PHASE 1: Backend Enhancement (8h)

#### 1.1 File Upload System (2h)
```bash
npm install multer
```

**Files to create:**
- `backend/src/middlewares/upload.js` - Multer configuration

**Files to modify:**
- `backend/src/app.js` - Add multer middleware
- `backend/src/routes/content.routes.js` - Add upload endpoint

#### 1.2 Activity Logs Enhancement (2h)
**Modify:**
- `backend/src/models/activityLog.model.js` - Add score & duration
- `backend/src/controllers/activityLog.controller.js` - Handle new fields

```javascript
// New fields in activity_logs:
{
  id, child_id, action, score, duration_seconds, timestamp
}
```

#### 1.3 Messages System (2h)
**Create:**
- `backend/src/models/message.model.js`
- `backend/src/controllers/message.controller.js`
- `backend/src/routes/message.routes.js`

#### 1.4 Serve Static Files (1h)
**Modify:**
- `backend/src/app.js` - Add `express.static('/uploads')`

#### 1.5 Test all endpoints (1h)

---

### PHASE 2: Frontend Dashboards (18h)

#### 2.1 Child Space (6h)
**Create components:**
- `ChildDashboard.tsx` - Main child page
- `GamesList.tsx` - List available games
- `GamePlayer.tsx` - Game container
- Simple games component

**Features:**
- List all games/videos/audios
- Play content
- Track time & score

#### 2.2 Parent Dashboard (6h)
**Create:**
- `ParentDashboard.tsx` - Complete
- `ChildActivity.tsx` - Activity chart
- `MedicalNotes.tsx` - View doctor notes
- `Messages.tsx` - Chat with doctor

**Features:**
- View children activities
- See medical notes
- Message doctor

#### 2.3 Doctor Dashboard (4h)
**Create:**
- `DoctorDashboard.tsx` - Main page
- `PatientNotes.tsx` - Manage notes
- `PatientActivity.tsx` - View activity logs

**Features:**
- Add/edit notes
- View child activity
- Message parents

#### 2.4 Admin Panel (2h)
**Update existing:**
- `AdminPanel.tsx` - Add content upload

---

### PHASE 3: Games Implementation (8h)

#### 3.1 Game 1: Color Match (2h)
- Click the correct color name
- Track score
- Simple timer

#### 3.2 Game 2: Memory Game (3h)
- Match pairs of cards
- Track score & time
- Progressive difficulty

#### 3.3 Game 3: Sound Recognition (3h)
- Play sound, click correct icon
- Track score

---

### PHASE 4: Polish & Testing (6h)

#### 4.1 Frontend Styling (2h)
- CSS responsive design
- Mobile-friendly

#### 4.2 Error Handling (1h)
- Add error messages
- Validation

#### 4.3 Testing (2h)
- Test all flows
- Fix bugs
- Final tweaks

#### 4.4 Documentation (1h)
- User guide
- Admin guide

---

## 📋 DETAILED TASK BREAKDOWN

### TASK 1: Install Multer (30 min)

```bash
cd backend
npm install multer
```

### TASK 2: Create Upload Middleware (1h)

**File: `backend/src/middlewares/upload.js`**

```javascript
const multer = require('multer');
const path = require('path');

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mp3|wav|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: fileFilter
});

module.exports = upload;
```

### TASK 3: Modify Content Routes for Upload (1h)

**File: `backend/src/routes/content.routes.js`**

Add upload endpoint:

```javascript
const upload = require('../middlewares/upload');

router.post('/upload', auth, roleCheck('admin'), upload.single('file'), contentController.uploadContent);
```

### TASK 4: Enhance Activity Logs Model (1h)

**Modify table structure in `aidaa_schema.sql`:**

```sql
ALTER TABLE activity_logs 
ADD COLUMN action VARCHAR(50),
ADD COLUMN score INT DEFAULT 0,
ADD COLUMN duration_seconds INT DEFAULT 0;
```

### TASK 5: Create Message System (2h)

**New table:**

```sql
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  child_id INT NOT NULL,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(child_id) REFERENCES children(id),
  FOREIGN KEY(sender_id) REFERENCES users(id),
  FOREIGN KEY(receiver_id) REFERENCES users(id)
);
```

---

## 🎮 GAME SPECIFICATIONS

### Game 1: Color Match (Simple Clicker)
- 5 random colors displayed
- Show color name, user clicks correct button
- Score per correct answer
- 30 second rounds

### Game 2: Memory Game
- 8-16 cards face down
- Click to reveal, match pairs
- Score = pairs matched
- Time tracking

### Game 3: Sound Recognition
- Play audio file
- Show 4 options with icons
- User selects correct
- Score per correct

---

## 📱 FRONTEND ROUTES

```
/login                           - Public
/set-password                    - Public
/child/dashboard                 - Child only
  /games                         - Game list
  /game/:id                      - Play game
/parent/dashboard                - Parent only
  /children                      - View children
  /activity/:childId             - Activity logs
  /notes/:childId                - Medical notes
  /messages                      - Chat
/doctor/dashboard                - Doctor only
  /patients                      - List patients
  /patient/:childId              - Patient detail
  /notes/:childId                - Add/edit notes
  /messages                      - Chat
/admin/dashboard                 - Admin only
  /users                         - User management
  /content                       - Content management
  /upload                        - Upload content
```

---

## 🔧 DATABASE UPDATES NEEDED

```sql
-- Update activity_logs
ALTER TABLE activity_logs 
ADD COLUMN action VARCHAR(50),
ADD COLUMN score INT DEFAULT 0,
ADD COLUMN duration_seconds INT DEFAULT 0;

-- Create messages table
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  child_id INT NOT NULL,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(child_id) REFERENCES children(id),
  FOREIGN KEY(sender_id) REFERENCES users(id),
  FOREIGN KEY(receiver_id) REFERENCES users(id)
);

-- Create games table (optional)
CREATE TABLE games (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100),
  description TEXT,
  type VARCHAR(50),  -- 'color_match', 'memory', 'sound'
  created_at TIMESTAMP
);
```

---

## ⏱️ HOUR-BY-HOUR TIMELINE

### Day 1 (Hours 0-12)

**Hour 0-1:** Multer setup & upload middleware
**Hour 1-2:** Content upload endpoint
**Hour 2-3:** Activity logs enhancement
**Hour 3-4:** Message system (model & controller)
**Hour 4-5:** Static file serving
**Hour 5-7:** Child Dashboard + Game List
**Hour 7-9:** Game 1 (Color Match)
**Hour 9-12:** Game 2 (Memory Game)

### Day 2 (Hours 12-24)

**Hour 12-14:** Game 3 (Sound Recognition)
**Hour 14-18:** Parent Dashboard
**Hour 18-21:** Doctor Dashboard
**Hour 21-23:** Admin Panel update
**Hour 23-24:** Testing & bug fixes

---

## ✅ COMPLETION CHECKLIST

- [ ] Multer installed
- [ ] Upload middleware created
- [ ] File serving working
- [ ] Activity logs updated
- [ ] Message system created
- [ ] Child dashboard done
- [ ] 3 games working
- [ ] Parent dashboard done
- [ ] Doctor dashboard done
- [ ] Admin panel updated
- [ ] Styling responsive
- [ ] All tests passing
- [ ] No console errors

---

## 🚨 CRITICAL NOTES

1. **No security needed** - It's a PFE
2. **Focus on features** - Not polish
3. **Simple games** - Don't overcomplicate
4. **Test frequently** - Find bugs early
5. **Commit regularly** - Don't lose work

---

## 📞 SUPPORT NEEDED

**Questions to verify:**
1. ✅ Where to store uploads? (`/backend/uploads/`)
2. ✅ File types to accept? (`mp4, mp3, jpg, png`)
3. ✅ Max file size? (100MB)
4. ✅ Game difficulty? (Simple only)
5. ✅ Analytics? (Basic time & score)

---

**Ready to start implementing!** 🚀

This plan is realistic for 48 hours with 1-2 developers focused and pushing hard.

