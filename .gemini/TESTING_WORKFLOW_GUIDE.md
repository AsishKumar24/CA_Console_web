# Complete Testing Workflow - Task Management System

## 🎯 **Testing Objective**
Test the complete task workflow: Create → Assign → Progress → Complete → Archive → Restore

---

## 📋 **Prerequisites**

### **1. Create Test Users** (if not already created)

You need:
- ✅ **Admin User** (your current login)
- ✅ **Staff User** (to test assignment)

**Staff User Details:**
```
Email: staff@test.com
Password: stafftest123
First Name: John
Last Name: Doe
Role: STAFF
```

### **2. Create Test Client** (if not already created)

**Client Details:**
```
Name: ABC Corporation Pvt Ltd
Code: ABC001
Email: finance@abccorp.com
Phone: +91 9876543210
PAN: ABCDE1234F
GST: 27ABCDE1234F1Z5
Address: 123 MG Road, Mumbai, Maharashtra 400001
```

---

## 🚀 **Complete Testing Workflow**

### **TASK 1: Admin Assigned to Self**

#### **Step 1: Login as Admin**
```
Navigate to: http://localhost:5173/login
Email: your-admin-email
Password: your-admin-password
```

#### **Step 2: Create Task (Assigned to Admin)**
```
Navigate to: /tasks (Create Task page)

Fill in the form:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Title: GST Return Filing - Q3 FY 2024-25
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Client: ABC Corporation Pvt Ltd  [Select from dropdown]

📊 Service Type: GST Return Filing

⚠️ Priority: HIGH

📅 Due Date: 2025-01-31

📈 Status: NOT_STARTED

👤 Assign To: [Select yourself - Admin]

📝 Assessment Year: 2024-25

📅 Period: Q3 (Oct-Dec 2024)

Description/Notes:
"Quarterly GST return for ABC Corporation. Documents received. Need to file Form GSTR-3B and GSTR-1 by month end."
```

**Click: "Create Task" button**

✅ **Expected Result**: Redirected to task list, task appears in "Not Started" column

---

### **TASK 2: Assigned to Staff**

#### **Step 3: Create Another Task (Assigned to Staff)**
```
Navigate to: /tasks (Create Task page again)

Fill in the form:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Title: Income Tax Return - AY 2024-25
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Client: ABC Corporation Pvt Ltd

📊 Service Type: Income Tax Return

⚠️ Priority: NORMAL

📅 Due Date: 2025-02-15

📈 Status: NOT_STARTED

👤 Assign To: John Doe (STAFF)  [Select staff user]

📝 Assessment Year: 2024-25

📅 Period: Annual

Description/Notes:
"Annual ITR filing for ABC Corp. All audit reports ready. Assign to John for verification and filing."
```

**Click: "Create Task" button**

✅ **Expected Result**: Task created and assigned to staff

---

## 🎨 **Testing Drag & Drop (Admin Board)**

### **Step 4: View Admin Task Board**
```
Navigate to: /my-task-board
```

You should see:
```
┌─────────────┬─────────────┬─────────────┐
│ Not Started │ In Progress │  Completed  │
├─────────────┼─────────────┼─────────────┤
│ 2 tasks     │   Empty     │   Empty     │
│             │             │             │
│ • GST Return│             │             │
│ • ITR Filing│             │             │
└─────────────┴─────────────┴─────────────┘
```

### **Step 5: Move GST Return to In Progress**
```
Action: Drag "GST Return Filing" card
From: Not Started column
To: In Progress column
```

✅ **Expected**: 
- Task moves smoothly
- Appears in "In Progress" column
- Network request: PATCH /api/tasks/:taskId/status
- Status updated to "IN_PROGRESS"

---

### **Step 6: Add a Note**
```
Click: "View Details" on GST Return task
Scroll to: Notes section
Type: "Called client - all documents verified. Starting filing process."
Click: "Add Note" button
```

✅ **Expected**: Note appears with your name and timestamp

---

### **Step 7: Move ITR to In Progress**
```
Action: Drag "Income Tax Return" card
From: Not Started
To: In Progress
```

Current Board State:
```
┌─────────────┬─────────────┬─────────────┐
│ Not Started │ In Progress │  Completed  │
├─────────────┼─────────────┼─────────────┤
│   Empty     │ 2 tasks     │   Empty     │
│             │             │             │
│             │ • GST Return│             │
│             │ • ITR Filing│             │
└─────────────┴─────────────┴─────────────┘
```

---

### **Step 8: Complete GST Return Task**
```
Action: Drag "GST Return Filing" card
From: In Progress
To: Completed
```

✅ **Expected**:
- Task moves to Completed column
- Shows "✓ Completed" badge (green)
- completedAt timestamp is set on backend
- Task will auto-archive after 7 days (when cron is active)

---

### **Step 9: Check Completed Badge**
Look at the GST Return task card in Completed column:
```
┌──────────────────────────────┐
│ GST Return Filing - Q3       │
│ ABC Corporation Pvt Ltd      │
│ HIGH | Due: Jan 31           │
├──────────────────────────────┤
│ View Details  [✓ Completed] │
└──────────────────────────────┘
```

✅ **Note**: No "Archive" button on the card!

---

## 👁️ **Testing Task Details View**

### **Step 10: View Completed Task Details**
```
Click: "View Details" on GST Return task
```

You should see:
```
┌────────────────────────────────────────┐
│ Task Details                           │
│                           ✓ View Only │
│                          (Completed)   │
├────────────────────────────────────────┤
│ Title: GST Return Filing - Q3          │
│ Client: ABC Corporation Pvt Ltd        │
│ Priority: HIGH                         │
│ Status: COMPLETED                      │
│ Assigned To: [Your Name]               │
│                                        │
│ ❌ NO Edit Button                      │
│ ❌ NO Archive Button                   │
│ ✅ Can View All Details                │
│ ✅ Can See Notes                       │
│ ✅ Can See Status History              │
└────────────────────────────────────────┘
```

✅ **Expected**: Read-only mode, no editing allowed

---

### **Step 11: Complete ITR Task**
```
Go Back: to Admin Task Board
Action: Drag "Income Tax Return" to Completed
```

Current Board State:
```
┌─────────────┬─────────────┬─────────────┐
│ Not Started │ In Progress │  Completed  │
├─────────────┼─────────────┼─────────────┤
│   Empty     │   Empty     │ 2 tasks     │
│             │             │             │
│             │             │ • GST Return│
│             │             │ • ITR Filing│
└─────────────┴─────────────┴─────────────┘
```

---

## 🗃️ **Testing Manual Archive (Admin Only)**

### **Step 12: View All Tasks Page**
```
Navigate to: /tasks/list (All Tasks)
```

You should see both completed tasks in the table.

### **Step 13: Open Task Details for Archiving**
```
Click: "View" on any completed task (e.g., GST Return)
```

⚠️ **Wait!** The task is completed, so you should see:
- "✓ View Only (Completed)" badge
- NO Edit button
- NO Archive button

But since you're testing, let's create a NOT completed task to test archiving...

---

## 🧪 **Testing Manual Archive Flow**

### **Step 14: Create a Test Task (for archiving)**
```
Create New Task:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title: Test Archive Task - Delete Me
Client: ABC Corporation
Service Type: Consultation
Priority: LOW
Status: NOT_STARTED
Assign To: Yourself
Due Date: 2025-03-01
```

### **Step 15: View Task Details**
```
Click: "View Details" on this new task
```

You should see:
```
┌────────────────────────────────────────┐
│ Task Details                           │
│                    [Edit] [📦 Archive] │
├────────────────────────────────────────┤
│ Title: Test Archive Task               │
│ Status: NOT_STARTED                    │
│                                        │
│ ✅ Edit Task button visible            │
│ ✅ Archive button visible              │
└────────────────────────────────────────┘
```

### **Step 16: Test Manual Archive**
```
Click: "📦 Archive" button
```

✅ **Expected**:
- Task disappears from main board
- Moved to archived tasks
- archivedAt timestamp set
- autoArchived = false (manual archive)

---

## 📦 **Testing Archived Tasks View**

### **Step 17: View Archived Tasks**
```
Navigate to: /tasks/archived
```

You should see:
```
┌─────────────────────────────────────────┐
│ Archived Tasks                          │
│                                         │
│ Total Archived Tasks: 1                 │
├─────────────────────────────────────────┤
│ Task             │ Client │ Actions     │
├─────────────────────────────────────────┤
│ Test Archive Task│ ABC    │ View Restore│
└─────────────────────────────────────────┘
```

### **Step 18: Test Restore**
```
Click: "Restore" button
```

✅ **Expected**:
- Task disappears from archived list
- Returns to main task list
- isArchived = false
- Can see it in All Tasks or Task Boards again

---

## 👨‍💼 **Testing Staff View**

### **Step 19: Logout and Login as Staff**
```
Logout: Click profile menu → Logout
Login as Staff:
  Email: staff@test.com
  Password: stafftest123
```

### **Step 20: View Staff Dashboard**
```
Navigate to: /my-tasks (Staff Task Board)
```

You should see ONLY tasks assigned to staff:
```
┌─────────────┬─────────────┬─────────────┐
│ Not Started │ In Progress │  Completed  │
├─────────────┼─────────────┼─────────────┤
│   Empty     │  1 task     │   Empty     │
│             │             │             │
│             │ • ITR Filing│             │
└─────────────┴─────────────┴─────────────┘
```

✅ **Note**: Staff only sees their assigned tasks, not admin's tasks

### **Step 21: Test Staff Permissions**
```
Click: "View Details" on ITR Filing task
```

You should see:
```
┌────────────────────────────────────────┐
│ Task Details                           │
│                     👁️ View Only      │
├────────────────────────────────────────┤
│ Title: Income Tax Return               │
│ Status: IN_PROGRESS                    │
│                                        │
│ ❌ NO Edit Button                      │
│ ❌ NO Archive Button                   │
│ ❌ NO Assign Button                    │
│ ✅ Can View Details                    │
│ ❌ Cannot see Update Status section    │
└────────────────────────────────────────┘
```

✅ **Expected**: Staff has read-only access, cannot edit or archive

---

## 📊 **Complete Workflow Summary**

```
┌─────────────────────────────────────────────────────────┐
│             TASK LIFECYCLE WORKFLOW                     │
└─────────────────────────────────────────────────────────┘

ADMIN CREATES TASK
       ↓
ASSIGNS TO STAFF/SELF
       ↓
┌──────────────┐
│ NOT_STARTED  │ ← Initial state
└──────┬───────┘
       ↓ Drag & Drop
┌──────────────┐
│ IN_PROGRESS  │ ← Working on it
└──────┬───────┘
       ↓ Drag & Drop
┌──────────────┐
│  COMPLETED   │ ← ✓ Completed badge shown
└──────┬───────┘
       ↓
   ┌───┴────┐
   │        │
   ↓        ↓
7 DAYS    MANUAL
AUTO      ARCHIVE
ARCHIVE   (Admin)
   │        │
   └───┬────┘
       ↓
┌──────────────┐
│   ARCHIVED   │ ← 📦 Archived badge shown
└──────┬───────┘
       ↓ Admin can restore
┌──────────────┐
│   RESTORED   │ → Back to active state
└──────────────┘
```

---

## ✅ **Verification Checklist**

### **Basic Functionality:**
- [ ] Admin can create tasks
- [ ] Admin can assign to self
- [ ] Admin can assign to staff
- [ ] Tasks appear in correct columns
- [ ] Drag & drop works smoothly

### **Status Updates:**
- [ ] NOT_STARTED → IN_PROGRESS works
- [ ] IN_PROGRESS → COMPLETED works
- [ ] Status history is recorded
- [ ] completedAt timestamp is set

### **Completed Task Behavior:**
- [ ] Shows "✓ Completed" badge
- [ ] NO archive button on card
- [ ] Task details show "View Only" badge
- [ ] Cannot edit completed task

### **Manual Archive (Admin):**
- [ ] Archive button visible on NOT completed tasks
- [ ] Archive button works
- [ ] Task appears in Archived Tasks
- [ ] Restore button works
- [ ] Restored task is active again

### **Permissions (Staff):**
- [ ] Staff sees only assigned tasks
- [ ] Staff has "View Only" badge
- [ ] Staff cannot edit tasks
- [ ] Staff cannot archive tasks
- [ ] Staff cannot restore tasks

### **UI Elements:**
- [ ] Proper badges displayed
- [ ] Colors are correct (green for completed)
- [ ] Icons render properly (✓, 📦, 👁️, 🔄)
- [ ] Dark mode works (if enabled)

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: "Failed to fetch task"**
**Solution**: Backend missing `GET /api/tasks/:taskId` route
→ Check `.gemini/BACKEND_ARCHIVE_EDIT_RESTORE_IMPLEMENTATION.md`

### **Issue 2: Restore doesn't persist**
**Solution**: Backend not calling `await task.save()`
→ Update restore controller

### **Issue 3: Staff can't see tasks**
**Solution**: Check backend permissions on `GET /api/tasks/my`

### **Issue 4: Drag & drop not working**
**Solution**: Check react-dnd setup, ensure DndProvider wraps component

---

## 📝 **Test Data Summary**

Copy this for quick testing:

```javascript
// TASK 1
{
  title: "GST Return Filing - Q3 FY 2024-25",
  client: "ABC Corporation",
  serviceType: "GST Return Filing",
  priority: "HIGH",
  dueDate: "2025-01-31",
  assignedTo: "Admin (yourself)",
  assessmentYear: "2024-25",
  period: "Q3"
}

// TASK 2
{
  title: "Income Tax Return - AY 2024-25",
  client: "ABC Corporation",
  serviceType: "Income Tax Return",
  priority: "NORMAL",
  dueDate: "2025-02-15",
  assignedTo: "John Doe (STAFF)",
  assessmentYear: "2024-25",
  period: "Annual"
}

// TEST TASK (for archive/restore)
{
  title: "Test Archive Task - Delete Me",
  client: "ABC Corporation",
  serviceType: "Consultation",
  priority: "LOW",
  dueDate: "2025-03-01",
  assignedTo: "Admin (yourself)"
}
```

---

## 🎯 **Success Criteria**

Your system is working correctly if:

✅ Admin can create, edit, assign, drag, complete, archive, restore  
✅ Staff can view, drag to complete (their tasks only)  
✅ Completed tasks show proper badges  
✅ Manual archive/restore works  
✅ Permissions are enforced  
✅ UI is clean and intuitive  

**Have fun testing!** 🚀
