# Fix: Archive Restore Not Working

## Problem
When you click "Restore" on an archived task:
- ✅ Task disappears from archived list (frontend removes it)
- ❌ Task reappears when you refresh (backend didn't save the change)
- **Root Cause**: Backend restore route is NOT updating the database

## The Fix - Backend Code

### 1. **Backend Route** (routes/tasks.js)

Make sure this route exists and does NOT have `requireAdmin`:

```javascript
// Allow both staff and admin to restore tasks
router.patch('/:taskId/restore', auth, taskCtrl.restoreTask);
```

### 2. **Backend Controller** (controllers/taskController.js)

Replace or update your `restoreTask` function with this:

```javascript
exports.restoreTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    console.log('🔄 Restoring task:', taskId);
    
    // Find the task
    const task = await Task.findById(taskId);
    
    if (!task) {
      console.error('❌ Task not found:', taskId);
      return res.status(404).json({ error: 'Task not found' });
    }
    
    console.log('📋 Task before restore:', {
      id: task._id,
      isArchived: task.isArchived,
      archivedAt: task.archivedAt
    });
    
    // Authorization check (admin OR owner OR assigned user)
    const isAdmin = req.user.role === 'ADMIN';
    const isOwner = task.owner?.toString() === req.user.id;
    const isAssignedUser = task.assignedTo?.toString() === req.user.id;
    
    if (!isAdmin && !isOwner && !isAssignedUser) {
      console.error('❌ Permission denied for user:', req.user.id);
      return res.status(403).json({ 
        error: 'You do not have permission to restore this task' 
      });
    }
    
    // ⭐ CRITICAL: Update the fields
    task.isArchived = false;
    task.archivedAt = undefined;  // or null
    task.archivedBy = undefined;   // if you have this field
    
    // ⭐ CRITICAL: Save to database
    await task.save();
    
    console.log('✅ Task restored successfully:', {
      id: task._id,
      isArchived: task.isArchived,
      archivedAt: task.archivedAt
    });
    
    res.json({ 
      message: 'Task restored successfully',
      task 
    });
    
  } catch (error) {
    console.error('❌ Error restoring task:', error);
    res.status(500).json({ error: 'Failed to restore task' });
  }
};
```

### 3. **Backend Controller - Archive Function** (Same file)

Also update your archive function to be consistent:

```javascript
exports.archiveTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    console.log('📦 Archiving task:', taskId);
    
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Authorization check
    const isAdmin = req.user.role === 'ADMIN';
    const isOwner = task.owner?.toString() === req.user.id;
    const isAssignedUser = task.assignedTo?.toString() === req.user.id;
    
    if (!isAdmin && !isOwner && !isAssignedUser) {
      return res.status(403).json({ 
        error: 'You do not have permission to archive this task' 
      });
    }
    
    // ⭐ Update fields
    task.isArchived = true;
    task.archivedAt = new Date();
    task.archivedBy = req.user.id;  // Track who archived it
    
    // ⭐ Save to database
    await task.save();
    
    console.log('✅ Task archived successfully');
    
    res.json({ 
      message: 'Task archived successfully',
      task 
    });
    
  } catch (error) {
    console.error('❌ Error archiving task:', error);
    res.status(500).json({ error: 'Failed to archive task' });
  }
};
```

### 4. **Task Model** (models/Task.js)

Ensure your Task schema has these fields:

```javascript
const taskSchema = new mongoose.Schema({
  // ... other fields ...
  
  isArchived: {
    type: Boolean,
    default: false,
    index: true  // Index for faster queries
  },
  
  archivedAt: {
    type: Date,
    default: null
  },
  
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // ... rest of schema ...
}, { 
  timestamps: true 
});

// Index for filtering archived/non-archived tasks
taskSchema.index({ isArchived: 1, createdAt: -1 });
```

### 5. **Get Tasks Route** (Ensure filtering works)

Make sure your `getAdminTasks` and `getMyTasks` properly filter archived tasks:

```javascript
exports.getAdminTasks = async (req, res) => {
  try {
    const { archived, status, assignedTo } = req.query;
    
    let filter = {};
    
    // ⭐ Filter by archived status
    if (archived === 'true') {
      filter.isArchived = true;
    } else {
      // By default, exclude archived tasks
      filter.isArchived = { $ne: true };  // or filter.isArchived = false;
    }
    
    // Additional filters
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    
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
    
    console.log(`📊 Found ${tasks.length} tasks (archived: ${archived})`);
    
    res.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

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
      .sort({ createdAt: -1 });
    
    res.json({ tasks });
  } catch (error) {
    console.error('Error fetching my tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};
```

## Testing the Fix

### 1. **Add Console Logging**
The code above includes console.log statements. Watch your backend terminal when:
- Archiving a task
- Restoring a task
- Fetching archived tasks

You should see:
```
📦 Archiving task: 507f1f77bcf86cd799439011
✅ Task archived successfully

🔄 Restoring task: 507f1f77bcf86cd799439011
📋 Task before restore: { isArchived: true, archivedAt: ... }
✅ Task restored successfully: { isArchived: false, archivedAt: undefined }

📊 Found 0 tasks (archived: true)  ← After restore, archived list should be empty
```

### 2. **Test in Frontend**
1. Archive a task from MyTasks or AdminTaskBoard
2. Go to Archived Tasks page
3. Click "Restore"
4. Refresh the page (Ctrl+R)
5. ✅ Task should NOT reappear

### 3. **Test in Database**
Check MongoDB directly:

```bash
# In MongoDB shell or Compass
db.tasks.findOne({ _id: ObjectId("your-task-id") })

# Should show:
# { isArchived: false, archivedAt: null }  ← After restore
# { isArchived: true, archivedAt: ISODate(...) }  ← After archive
```

## Common Mistakes to Avoid

### ❌ **Mistake 1: Not calling .save()**
```javascript
// WRONG - Changes won't persist
task.isArchived = false;
res.json({ task });  // ❌ No save!
```

```javascript
// CORRECT
task.isArchived = false;
await task.save();  // ✅ Saves to database
res.json({ task });
```

### ❌ **Mistake 2: Using findByIdAndUpdate incorrectly**
```javascript
// WRONG - Might not trigger validation
await Task.findByIdAndUpdate(taskId, { isArchived: false });
```

```javascript
// CORRECT - Fetch, modify, save
const task = await Task.findById(taskId);
task.isArchived = false;
task.archivedAt = undefined;
await task.save();
```

### ❌ **Mistake 3: Not handling undefined vs null**
```javascript
// WRONG - undefined might not remove field
task.archivedAt = undefined;

// BETTER - explicitly set to null
task.archivedAt = null;

// OR - Use $unset in update
await Task.findByIdAndUpdate(taskId, { 
  isArchived: false,
  $unset: { archivedAt: 1 }
});
```

## Quick Verification Checklist

After updating your backend:

- [ ] Route exists: `PATCH /api/tasks/:taskId/restore`
- [ ] Route does NOT have `requireAdmin` middleware
- [ ] Controller fetches task from database
- [ ] Controller sets `isArchived = false`
- [ ] Controller clears `archivedAt` field
- [ ] Controller calls `await task.save()`
- [ ] Controller returns success response
- [ ] GET tasks route filters by `isArchived` properly
- [ ] Restart backend server
- [ ] Test restore in frontend
- [ ] Refresh page - task should stay restored

## Summary

**The issue**: Your backend restore function is NOT calling `task.save()`, so changes don't persist to the database.

**The fix**: 
1. Update `restoreTask` controller to call `await task.save()`
2. Ensure proper field updates (`isArchived = false`, `archivedAt = null`)
3. Remove `requireAdmin` middleware from restore route
4. Restart backend server

After this fix, restored tasks will stay restored! 🎉
