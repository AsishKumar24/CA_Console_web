# Backend Implementation: Archive, Edit, Restore Logic

## 🎯 **Implementation Plan**

### **Permissions Matrix**
| Action | Staff | Admin | Notes |
|--------|-------|-------|-------|
| **Edit Task** | ❌ | ✅ | Admin only, not if completed/archived |
| **Archive Task** | ❌ | ✅ | Admin only, all tasks |
| **Restore Task** | ❌ | ✅ | Admin only |
| **Auto-Archive** | ✅ | ✅ | System auto-archives completed tasks after 7 days |

---

## 📝 **Step 1: Update Task Model**

**File:** `models/Task.js`

```javascript
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  serviceType: String,
  priority: {
    type: String,
    enum: ['LOW', 'NORMAL', 'HIGH'],
    default: 'NORMAL'
  },
  status: {
    type: String,
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
    default: 'NOT_STARTED'
  },
  dueDate: Date,
  assessmentYear: String,
  period: String,
  
  // Relationships
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Archive fields
  isArchived: {
    type: Boolean,
    default: false,
    index: true  // Index for faster queries
  },
  archivedAt: Date,
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  autoArchived: {
    type: Boolean,
    default: false
  },
  
  // Completion tracking
  completedAt: Date,  // Added for auto-archive
  
  // Notes
  notes: [{
    message: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status History
  statusHistory: [{
    status: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    note: String
  }]
}, { 
  timestamps: true  // Adds createdAt and updatedAt
});

// Indexes for performance
taskSchema.index({ status: 1, isArchived: 1 });
taskSchema.index({ assignedTo: 1, isArchived: 1 });
taskSchema.index({ completedAt: 1, isArchived: 1 });

module.exports = mongoose.model('Task', taskSchema);
```

---

## 🔧 **Step 2: Task Controller - Complete Implementation**

**File:** `controllers/taskController.js`

```javascript
const Task = require('../models/Task');

// ==========================================
// GET SINGLE TASK BY ID
// ==========================================
exports.getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    console.log('📋 Fetching task:', taskId);
    
    const task = await Task.findById(taskId)
      .populate('client', 'name code email phone')
      .populate('assignedTo', 'firstName email role')
      .populate('owner', 'firstName email role')
      .populate('notes.createdBy', 'firstName')
      .populate('statusHistory.changedBy', 'firstName');
    
    if (!task) {
      console.log('❌ Task not found:', taskId);
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Permission check: Admin OR Owner OR Assigned User
    const isAdmin = req.user.role === 'ADMIN';
    const isOwner = task.owner._id.toString() === req.user.id;
    const isAssigned = task.assignedTo?._id.toString() === req.user.id;
    
    if (!isAdmin && !isOwner && !isAssigned) {
      console.log('❌ Permission denied for user:', req.user.id);
      return res.status(403).json({ 
        error: 'You do not have permission to view this task' 
      });
    }
    
    console.log('✅ Task fetched successfully');
    res.json({ task });
    
  } catch (error) {
    console.error('❌ Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task details' });
  }
};

// ==========================================
// EDIT TASK (Admin Only)
// ==========================================
exports.editTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, serviceType, priority, dueDate, assessmentYear, period } = req.body;
    
    console.log('✏️ Editing task:', taskId);
    
    // Check admin permission
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Only administrators can edit tasks' 
      });
    }
    
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Prevent editing completed or archived tasks
    if (task.status === 'COMPLETED') {
      return res.status(400).json({ 
        error: 'Cannot edit completed tasks. Please restore first if needed.' 
      });
    }
    
    if (task.isArchived) {
      return res.status(400).json({ 
        error: 'Cannot edit archived tasks. Please restore first.' 
      });
    }
    
    // Update fields
    if (title) task.title = title;
    if (serviceType !== undefined) task.serviceType = serviceType;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assessmentYear !== undefined) task.assessmentYear = assessmentYear;
    if (period !== undefined) task.period = period;
    
    await task.save();
    
    console.log('✅ Task updated successfully');
    
    // Return populated task
    const updatedTask = await Task.findById(taskId)
      .populate('client', 'name code')
      .populate('assignedTo', 'firstName email')
      .populate('owner', 'firstName');
    
    res.json({ 
      message: 'Task updated successfully',
      task: updatedTask 
    });
    
  } catch (error) {
    console.error('❌ Error editing task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// ==========================================
// UPDATE TASK STATUS
// ==========================================
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, note } = req.body;
    
    console.log('🔄 Updating task status:', taskId, '→', status);
    
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Permission check
    const isAdmin = req.user.role === 'ADMIN';
    const isAssigned = task.assignedTo?.toString() === req.user.id;
    
    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ 
        error: 'You do not have permission to update this task' 
      });
    }
    
    // Cannot update archived tasks
    if (task.isArchived) {
      return res.status(400).json({ 
        error: 'Cannot update status of archived tasks' 
      });
    }
    
    // Store old status
    const oldStatus = task.status;
    
    // Update status
    task.status = status;
    
    // Track completion time
    if (status === 'COMPLETED' && oldStatus !== 'COMPLETED') {
      task.completedAt = new Date();
      console.log('✅ Task marked as completed, will auto-archive in 7 days');
    }
    
    // Add to status history
    task.statusHistory.push({
      status: status,
      changedBy: req.user.id,
      changedAt: new Date(),
      note: note || `Status changed from ${oldStatus} to ${status}`
    });
    
    await task.save();
    
    console.log('✅ Status updated successfully');
    
    const updatedTask = await Task.findById(taskId)
      .populate('client', 'name code')
      .populate('assignedTo', 'firstName email')
      .populate('statusHistory.changedBy', 'firstName');
    
    res.json({ 
      message: 'Status updated successfully',
      task: updatedTask 
    });
    
  } catch (error) {
    console.error('❌ Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

// ==========================================
// ARCHIVE TASK (Admin Only - Manual)
// ==========================================
exports.archiveTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    console.log('📦 Archiving task:', taskId);
    
    // Check admin permission
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Only administrators can archive tasks' 
      });
    }
    
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Already archived?
    if (task.isArchived) {
      return res.status(400).json({ error: 'Task is already archived' });
    }
    
    // ⭐ CRITICAL: Update fields
    task.isArchived = true;
    task.archivedAt = new Date();
    task.archivedBy = req.user.id;
    task.autoArchived = false;  // Manual archive
    
    // ⭐ CRITICAL: Save to database
    await task.save();
    
    console.log('✅ Task archived successfully (manual)');
    
    res.json({ 
      message: 'Task archived successfully',
      task: {
        _id: task._id,
        isArchived: task.isArchived,
        archivedAt: task.archivedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error archiving task:', error);
    res.status(500).json({ error: 'Failed to archive task' });
  }
};

// ==========================================
// RESTORE TASK (Admin Only)
// ==========================================
exports.restoreTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    console.log('🔄 Restoring task:', taskId);
    
    // Check admin permission
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Only administrators can restore tasks' 
      });
    }
    
    const task = await Task.findById(taskId);
    
    if (!task) {
      console.log('❌ Task not found:', taskId);
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Not archived?
    if (!task.isArchived) {
      return res.status(400).json({ error: 'Task is not archived' });
    }
    
    console.log('📋 Task before restore:', {
      id: task._id,
      isArchived: task.isArchived,
      archivedAt: task.archivedAt,
      autoArchived: task.autoArchived
    });
    
    // ⭐ CRITICAL: Update fields
    task.isArchived = false;
    task.archivedAt = undefined;  // or null
    task.archivedBy = undefined;   // or null
    task.autoArchived = false;
    
    // ⭐ CRITICAL: Save to database
    await task.save();
    
    console.log('✅ Task restored successfully:', {
      id: task._id,
      isArchived: task.isArchived,
      archivedAt: task.archivedAt
    });
    
    // Return populated task
    const restoredTask = await Task.findById(taskId)
      .populate('client', 'name code')
      .populate('assignedTo', 'firstName email')
      .populate('owner', 'firstName');
    
    res.json({ 
      message: 'Task restored successfully',
      task: restoredTask
    });
    
  } catch (error) {
    console.error('❌ Error restoring task:', error);
    res.status(500).json({ error: 'Failed to restore task' });
  }
};

// ==========================================
// GET ADMIN TASKS (with filtering)
// ==========================================
exports.getAdminTasks = async (req, res) => {
  try {
    const { archived, status, assignedTo, client } = req.query;
    
    let filter = {};
    
    // ⭐ Filter by archived status
    if (archived === 'true') {
      filter.isArchived = true;
    } else {
      filter.isArchived = { $ne: true };  // Exclude archived by default
    }
    
    // Additional filters
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (client) filter.client = client;
    
    // If staff user, only show their tasks
    if (req.user.role !== 'ADMIN') {
      filter.$or = [
        { assignedTo: req.user.id },
        { owner: req.user.id }
      ];
    }
    
    const tasks = await Task.find(filter)
      .populate('client', 'name code')
      .populate('assignedTo', 'firstName email')
      .populate('owner', 'firstName')
      .sort({ createdAt: -1 });
    
    console.log(`📊 Found ${tasks.length} tasks (archived: ${archived || 'false'})`);
    
    res.json({ tasks });
  } catch (error) {
    console.error('❌ Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// ==========================================
// GET MY TASKS
// ==========================================
exports.getMyTasks = async (req, res) => {
  try {
    const { archived } = req.query;
    
    let filter = {
      $or: [
        { assignedTo: req.user.id },
        { owner: req.user.id }
      ]
    };
    
    // ⭐ Filter by archived status
    if (archived === 'true') {
      filter.isArchived = true;
    } else {
      filter.isArchived = { $ne: true };
    }
    
    const tasks = await Task.find(filter)
      .populate('client', 'name code')
      .populate('assignedTo', 'firstName email')
      .populate('owner', 'firstName')
      .sort({ createdAt: -1 });
    
    res.json({ tasks });
  } catch (error) {
    console.error('❌ Error fetching my tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};
```

---

## 🛣️ **Step 3: Routes Configuration**

**File:** `routes/tasks.js`

```javascript
const express = require('express');
const router = express.Router();
const taskCtrl = require('../controllers/taskController');
const { auth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/requireAdmin');

// ⚠️ IMPORTANT: Route order matters!
// Specific routes MUST come before dynamic /:taskId routes

// Summary routes (unused but available)
router.get('/summary/staff', auth, taskCtrl.staffSummary);
router.get('/summary/admin', auth, requireAdmin, taskCtrl.adminSummary);

// Get all tasks (admin) or my tasks
router.get('/', auth, requireAdmin, taskCtrl.getAdminTasks);
router.get('/my', auth, taskCtrl.getMyTasks);

// ⭐ ADD THIS ROUTE - Get single task by ID
router.get('/:taskId', auth, taskCtrl.getTaskById);

// Create task
router.post('/', auth, requireAdmin, taskCtrl.createTask);

// Task operations (specific routes before /:taskId)
router.post('/:taskId/notes', auth, taskCtrl.addNote);
router.patch('/:taskId/status', auth, taskCtrl.updateTaskStatus);
router.patch('/:taskId/assign', auth, requireAdmin, taskCtrl.assignTask);
router.patch('/:taskId/edit', auth, requireAdmin, taskCtrl.editTask);

// Archive & Restore (Admin only)
router.patch('/:taskId/archive', auth, requireAdmin, taskCtrl.archiveTask);
router.patch('/:taskId/restore', auth, requireAdmin, taskCtrl.restoreTask);

module.exports = router;
```

---

## ⏰ **Step 4: Auto-Archive Cron Job** (Future Implementation)

**File:** `jobs/autoArchive.js`

```javascript
const cron = require('node-cron');
const Task = require('../models/Task');

// Run daily at midnight (00:00)
function startAutoArchiveCron() {
  cron.schedule('0 0 * * *', async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      console.log('🤖 Running auto-archive job...');
      console.log('📅 Archiving tasks completed before:', sevenDaysAgo);
      
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
          // archivedBy is not set for auto-archive
        }
      );
      
      console.log(`✅ Auto-archived ${result.modifiedCount} completed tasks`);
      
    } catch (error) {
      console.error('❌ Auto-archive cron failed:', error);
    }
  });
  
  console.log('🤖 Auto-archive cron job started (runs daily at midnight)');
}

module.exports = { startAutoArchiveCron };
```

**Add to `server.js`:**
```javascript
const { startAutoArchiveCron } = require('./jobs/autoArchive');

// Start cron jobs
startAutoArchiveCron();
```

---

## ✅ **Testing Checklist**

### **1. Test GET Task by ID**
```bash
# Should work for staff (own task) and admin (any task)
curl http://localhost:5000/api/tasks/TASK_ID \
  -H "Cookie: your-session-cookie"
```

### **2. Test Edit Task**
```bash
# Admin can edit, Staff cannot
curl -X PATCH http://localhost:5000/api/tasks/TASK_ID/edit \
  -H "Cookie: admin-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title", "priority": "HIGH"}'
```

### **3. Test Archive Task**
```bash
# Admin can archive
curl -X PATCH http://localhost:5000/api/tasks/TASK_ID/archive \
  -H "Cookie: admin-session-cookie"
```

### **4. Test Restore Task**
```bash
# Admin can restore
curl -X PATCH http://localhost:5000/api/tasks/TASK_ID/restore \
  -H "Cookie: admin-session-cookie"
```

### **5. Test Get Archived Tasks**
```bash
# Should return only archived tasks
curl http://localhost:5000/api/tasks?archived=true \
  -H "Cookie: admin-session-cookie"
```

### **6. Test Status Update Sets completedAt**
```bash
curl -X PATCH http://localhost:5000/api/tasks/TASK_ID/status \
  -H "Cookie: session-cookie" \
  -H "Content-Type: application/json" \
  -d '{"status": "COMPLETED", "note": "All done!"}'

# Check DB to verify completedAt is set
```

---

## 🚀 **Deployment Steps**

1. ✅ Update Task model (add completedAt, autoArchived fields)
2. ✅ Add/update controller functions
3. ✅ Update routes (ensure /:taskId route exists)
4. ✅ Restart backend server
5. ✅ Test with Postman or curl
6. 🔮 (Future) Add auto-archive cron job
7. 🔮 (Future) Add due date reminders

---

## 🎯 **Summary**

### **What This Implements:**
- ✅ View task details (staff own, admin all)
- ✅ Edit tasks (admin only, not completed/archived)
- ✅ Archive tasks (admin only, manual)
- ✅ Restore tasks (admin only)
- ✅ Track completion time for auto-archive
- ✅ Prevent editing completed/archived tasks
- ✅ Proper permission checks everywhere

### **Key Features:**
- 🔒 Admin-only edit/archive/restore
- 📊 Completion tracking for analytics
- 🤖 Ready for auto-archive (after adding cron)
- ✅ Proper error handling & logging
- 🚫 Prevents invalid operations

This is **production-ready code** with proper validation, permissions, and logging! 🎉
