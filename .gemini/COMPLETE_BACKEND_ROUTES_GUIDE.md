# Complete Backend Routes Explanation & Future Features

## 📋 **Current Backend Routes Explained**

### **TASK ROUTES** (routes/tasks.js)

#### **1. GET /api/tasks/summary/staff**
```javascript
router.get('/summary/staff', auth, taskCtrl.staffSummary)
```
**What it does:**
- Returns summary statistics for the logged-in staff user
- Shows: Total tasks, by status, overdue count, completion rate
- **Used by:** Dashboard widgets (currently NOT used in frontend)
- **Access:** Staff + Admin

**Example Response:**
```json
{
  "total": 25,
  "notStarted": 5,
  "inProgress": 12,
  "completed": 8,
  "overdue": 2,
  "completionRate": 0.32
}
```

---

#### **2. GET /api/tasks/summary/admin**
```javascript
router.get('/summary/admin', auth, requireAdmin, taskCtrl.adminSummary)
```
**What it does:**
- Returns organization-wide task statistics
- Shows: Total, by status, by staff, unassigned, overdue
- **Used by:** Admin dashboard (currently NOT used in frontend)
- **Access:** Admin only

**Example Response:**
```json
{
  "total": 150,
  "byStatus": { "NOT_STARTED": 30, "IN_PROGRESS": 75, "COMPLETED": 45 },
  "byStaff": [
    { "staffId": "123", "name": "John", "count": 25 },
    { "staffId": "456", "name": "Jane", "count": 30 }
  ],
  "unassigned": 10,
  "overdue": 15
}
```

---

#### **3. GET /api/tasks**
```javascript
router.get('/', auth, requireAdmin, taskCtrl.getAdminTasks)
```
**What it does:**
- Fetches all tasks in the system
- Supports filtering: status, assignedTo, archived, client
- **Used by:** AllTasks.tsx, ArchivedTasks.tsx
- **Access:** Admin only

**Query Parameters:**
```javascript
?archived=true          // Get archived tasks
?status=COMPLETED       // Filter by status
?assignedTo=userId      // Filter by assigned user
?client=clientId        // Filter by client
```

**Example Response:**
```json
{
  "tasks": [
    {
      "_id": "...",
      "title": "Tax Filing",
      "status": "IN_PROGRESS",
      "client": { "name": "ABC Corp", "code": "CL001" },
      "assignedTo": { "firstName": "John" },
      "dueDate": "2025-01-15",
      "isArchived": false
    }
  ]
}
```

---

#### **4. GET /api/tasks/my**
```javascript
router.get('/my', auth, taskCtrl.getMyTasks)
```
**What it does:**
- Fetches tasks assigned to or owned by the logged-in user
- **Used by:** MyTasks.tsx, AdminTaskBoard.tsx
- **Access:** Staff + Admin

**Example Response:**
```json
{
  "tasks": [
    { "_id": "...", "title": "GST Return", "status": "IN_PROGRESS" }
  ]
}
```

---

#### **5. GET /api/tasks/:taskId** ⚠️ MISSING
```javascript
router.get('/:taskId', auth, taskCtrl.getTaskById)
```
**What it does:**
- Fetches single task with full details
- Includes: client, assignedTo, owner, notes, statusHistory
- **Used by:** TaskDetails.tsx
- **Access:** Staff (own tasks) + Admin (all tasks)

**⚠️ IMPORTANT:** This route is currently **MISSING** in your backend!

**You need to add this controller:**
```javascript
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('client', 'name code email phone')
      .populate('assignedTo', 'firstName email')
      .populate('owner', 'firstName email')
      .populate('notes.createdBy', 'firstName')
      .populate('statusHistory.changedBy', 'firstName');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Permission check
    const isAdmin = req.user.role === 'ADMIN';
    const isOwner = task.owner._id.toString() === req.user.id;
    const isAssigned = task.assignedTo?._id.toString() === req.user.id;
    
    if (!isAdmin && !isOwner && !isAssigned) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    res.json({ task });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};
```

---

#### **6. POST /api/tasks**
```javascript
router.post('/', auth, requireAdmin, taskCtrl.createTask)
```
**What it does:**
- Creates a new task
- **Used by:** TaskPage.tsx (Create Task form)
- **Access:** Admin only

**Request Body:**
```json
{
  "title": "GST Return Filing",
  "serviceType": "GST",
  "priority": "HIGH",
  "status": "NOT_STARTED",
  "client": "clientId",
  "assignedTo": "staffId",
  "dueDate": "2025-01-31",
  "assessmentYear": "2024-25",
  "period": "Q3"
}
```

---

#### **7. PATCH /api/tasks/:taskId/edit**
```javascript
router.patch('/:taskId/edit', auth, requireAdmin, taskCtrl.editTask)
```
**What it does:**
- Updates task details (title, priority, dates, etc.)
- **Used by:** TaskDetails.tsx (Edit mode)
- **Access:** Admin only

**Request Body:**
```json
{
  "title": "Updated Title",
  "priority": "HIGH",
  "dueDate": "2025-02-01"
}
```

---

#### **8. PATCH /api/tasks/:taskId/status**
```javascript
router.patch('/:taskId/status', auth, taskCtrl.updateTaskStatus)
```
**What it does:**
- Changes task status (NOT_STARTED → IN_PROGRESS → COMPLETED)
- Records in statusHistory with timestamp and note
- **Used by:** TaskDetails.tsx, MyTasks.tsx (drag & drop), AdminTaskBoard.tsx
- **Access:** Staff (own tasks) + Admin (all tasks)

**Request Body:**
```json
{
  "status": "COMPLETED",
  "note": "Client documents received and filed"
}
```

**What happens internally:**
```javascript
1. Update task.status
2. Add to statusHistory:
   {
     status: "COMPLETED",
     changedBy: userId,
     changedAt: now,
     note: "Client documents received..."
   }
3. If status = COMPLETED → set completedAt = now
4. Save task
```

**⚠️ ENHANCEMENT NEEDED:**
```javascript
// Add this to updateTaskStatus controller
if (status === 'COMPLETED' && task.status !== 'COMPLETED') {
  task.completedAt = new Date();  // Track completion time
}
```

---

#### **9. POST /api/tasks/:taskId/notes**
```javascript
router.post('/:taskId/notes', auth, taskCtrl.addNote)
```
**What it does:**
- Adds a note/comment to the task
- **Used by:** TaskDetails.tsx (Notes section)
- **Access:** Staff (own tasks) + Admin (all tasks)

**Request Body:**
```json
{
  "message": "Called client, documents ready by Friday"
}
```

**What happens:**
```javascript
task.notes.push({
  message: "Called client...",
  createdBy: userId,
  createdAt: now
});
await task.save();
```

---

#### **10. PATCH /api/tasks/:taskId/assign**
```javascript
router.patch('/:taskId/assign', auth, requireAdmin, taskCtrl.assignTask)
```
**What it does:**
- Assigns task to a staff member
- **Used by:** TaskDetails.tsx (Assignment section)
- **Access:** Admin only ✅ (Correct)

**Request Body:**
```json
{
  "staffId": "userId123"
}
```

---

#### **11. PATCH /api/tasks/:taskId/archive**
```javascript
router.patch('/:taskId/archive', auth, requireAdmin, taskCtrl.archiveTask)
```
**What it does:**
- Archives a task (hides from main views)
- **Used by:** TaskDetails.tsx, MyTasks.tsx, AdminTaskBoard.tsx
- **Access:** Currently Admin only

**What happens:**
```javascript
task.isArchived = true;
task.archivedAt = new Date();
task.archivedBy = userId;
await task.save();
```

**⚠️ CHANGE NEEDED:** For 7-day auto-archive feature:
- Keep `requireAdmin` for manual archiving
- Add cron job for auto-archiving (doesn't use this route)

---

#### **12. PATCH /api/tasks/:taskId/restore**
```javascript
router.patch('/:taskId/restore', auth, requireAdmin, taskCtrl.restoreTask)
```
**What it does:**
- Restores an archived task back to active state
- **Used by:** TaskDetails.tsx, ArchivedTasks.tsx
- **Access:** Admin only ✅ (Correct - keep requireAdmin)

**What happens:**
```javascript
task.isArchived = false;
task.archivedAt = null;
await task.save();
```

**⚠️ FIX NEEDED:** Ensure you call `await task.save()`!

---

## 🆕 **NEW FEATURES TO ADD**

### **A. Billing & Payment System**

#### **Task Model - Add Billing Fields**
```javascript
const taskSchema = new mongoose.Schema({
  // ... existing fields ...
  
  billing: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['UNBILLED', 'PENDING', 'PAID', 'PARTIALLY_PAID', 'CANCELLED'],
      default: 'UNBILLED'
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    billedAt: Date,        // When invoice was generated
    paidAt: Date,          // When payment was received
    invoiceNumber: String,
    paymentMethod: {
      type: String,
      enum: ['CASH', 'BANK_TRANSFER', 'UPI', 'RAZORPAY', 'CHEQUE', 'OTHER']
    },
    transactionId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    notes: String
  },
  
  // Auto-Archive Fields
  completedAt: Date,
  autoArchived: {
    type: Boolean,
    default: false
  },
  
  // Future: Reminder Fields
  reminders: [{
    type: {
      type: String,
      enum: ['DUE_DATE', 'FOLLOW_UP', 'PAYMENT']
    },
    sentAt: Date,
    method: String,
    status: String
  }]
});
```

---

#### **NEW ROUTE 1: GET /api/tasks/:taskId/billing**
```javascript
router.get('/:taskId/billing', auth, requireAdmin, taskCtrl.getBilling);

// Controller
exports.getBilling = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .select('billing title client')
      .populate('client', 'name code');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ billing: task.billing, task });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch billing' });
  }
};
```
**Purpose:** Fetch billing details for displaying in UI
**Access:** Admin only
**Used by:** Future billing modal/page

---

#### **NEW ROUTE 2: PATCH /api/tasks/:taskId/billing**
```javascript
router.patch('/:taskId/billing', auth, requireAdmin, taskCtrl.updateBilling);

// Controller
exports.updateBilling = async (req, res) => {
  try {
    const { amount, invoiceNumber, notes } = req.body;
    
    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    task.billing.amount = amount;
    task.billing.invoiceNumber = invoiceNumber;
    task.billing.notes = notes;
    task.billing.status = 'PENDING';
    task.billing.billedAt = new Date();
    
    await task.save();
    
    res.json({ message: 'Billing updated', billing: task.billing });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update billing' });
  }
};
```
**Purpose:** Set billing amount and generate invoice
**Access:** Admin only
**Request:**
```json
{
  "amount": 5000,
  "invoiceNumber": "INV-2025-001",
  "notes": "GST Return Filing - AY 2024-25"
}
```

---

#### **NEW ROUTE 3: POST /api/tasks/:taskId/payment**
```javascript
router.post('/:taskId/payment', auth, requireAdmin, taskCtrl.recordPayment);

// Controller
exports.recordPayment = async (req, res) => {
  try {
    const { amount, paymentMethod, transactionId, notes } = req.body;
    
    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Add to paid amount
    task.billing.paidAmount += amount;
    task.billing.paymentMethod = paymentMethod;
    task.billing.transactionId = transactionId;
    task.billing.paidAt = new Date();
    
    if (task.billing.notes) {
      task.billing.notes += `\n${notes}`;
    } else {
      task.billing.notes = notes;
    }
    
    // Update status
    if (task.billing.paidAmount >= task.billing.amount) {
      task.billing.status = 'PAID';
    } else if (task.billing.paidAmount > 0) {
      task.billing.status = 'PARTIALLY_PAID';
    }
    
    await task.save();
    
    res.json({ 
      message: 'Payment recorded',
      billing: task.billing
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record payment' });
  }
};
```
**Purpose:** Record payment (cash, UPI, bank transfer)
**Access:** Admin only
**Request:**
```json
{
  "amount": 5000,
  "paymentMethod": "UPI",
  "transactionId": "TXN123456",
  "notes": "Received via Google Pay"
}
```

---

### **B. Auto-Archive Cron Job** (Future)

Create file: `jobs/autoArchive.js`
```javascript
const cron = require('node-cron');
const Task = require('../models/Task');

// Run daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const result = await Task.updateMany(
      {
        status: 'COMPLETED',
        isArchived: false,
        completedAt: { $lt: sevenDaysAgo }
      },
      {
        isArchived: true,
        archivedAt: new Date(),
        autoArchived: true
      }
    );
    
    console.log(`✅ Auto-archived ${result.modifiedCount} tasks`);
  } catch (error) {
    console.error('❌ Auto-archive failed:', error);
  }
});

module.exports = { startAutoArchive: () => console.log('Auto-archive cron started') };
```

Add to `server.js`:
```javascript
const { startAutoArchive } = require('./jobs/autoArchive');
startAutoArchive();
```

---

### **C. Due Date Reminders** (Future)

Create file: `jobs/reminders.js`
```javascript
const cron = require('node-cron');
const Task = require('../models/Task');
const { sendEmail } = require('../utils/email');

// Run daily at 9 AM
cron.schedule('0 9 * * *', async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    
    const tasks = await Task.find({
      status: 'IN_PROGRESS',
      isArchived: false,
      dueDate: { $lte: tomorrow }
    })
    .populate('assignedTo', 'email firstName')
    .populate('client', 'name');
    
    for (const task of tasks) {
      if (task.assignedTo?.email) {
        await sendEmail({
          to: task.assignedTo.email,
          subject: `Reminder: ${task.title} due tomorrow`,
          text: `Task for ${task.client.name} is due tomorrow!`
        });
        
        task.reminders.push({
          type: 'DUE_DATE',
          sentAt: new Date(),
          method: 'EMAIL',
          status: 'SENT'
        });
        
        await task.save();
      }
    }
    
    console.log(`✅ Sent ${tasks.length} due date reminders`);
  } catch (error) {
    console.error('❌ Reminder sending failed:', error);
  }
});
```

---

## 🎯 **Summary of Changes**

### **Immediate (Required Now):**
1. ✅ Add `GET /api/tasks/:taskId` route + controller
2. ✅ Add `completedAt` field to Task model
3. ✅ Update `updateTaskStatus` to set `completedAt` when marking COMPLETED
4. ✅ Fix `restoreTask` to call `await task.save()`
5. ✅ Add billing fields to Task model
6. ✅ Add 3 billing routes (GET, PATCH, POST)

### **Future (Can add later):**
1. 🔮 Auto-archive cron job (7 days after completion)
2. 🔮 Due date reminder cron job
3. 🔮 Razorpay integration for online payments
4. 🔮 Summary endpoint implementations
5. 🔮 Email/SMS notification system

---

## 📊 **Complete Route List**

| Route | Method | Access | Status | Purpose |
|-------|--------|--------|--------|---------|
| `/summary/staff` | GET | Staff/Admin | ⚠️ Unused | Staff statistics |
| `/summary/admin` | GET | Admin | ⚠️ Unused | Admin dashboard stats |
| `/` | GET | Admin | ✅ Used | Get all tasks |
| `/my` | GET | Staff/Admin | ✅ Used | Get my tasks |
| `/:taskId` | GET | Staff/Admin | ❌ **Missing** | Get single task |
| `/` | POST | Admin | ✅ Used | Create task |
| `/:taskId/edit` | PATCH | Admin | ✅ Used | Edit task |
| `/:taskId/status` | PATCH | Staff/Admin | ✅ Used | Update status |
| `/:taskId/notes` | POST | Staff/Admin | ✅ Used | Add note |
| `/:taskId/assign` | PATCH | Admin | ✅ Used | Assign task |
| `/:taskId/archive` | PATCH | Admin | ✅ Used | Archive task |
| `/:taskId/restore` | PATCH | Admin | ✅ Used | Restore task |
| `/:taskId/billing` | GET | Admin | 🆕 **New** | Get billing |
| `/:taskId/billing` | PATCH | Admin | 🆕 **New** | Update billing |
| `/:taskId/payment` | POST | Admin | 🆕 **New** | Record payment |

Would you like me to create the complete backend code files for these new features? 🚀
