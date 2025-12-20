# Backend Updates Required for Staff Archive Access

## Current Backend Issue

The backend currently restricts archive and restore operations to **admin users only**:

```javascript
// Current backend routes (RESTRICTIVE)
router.patch('/:taskId/archive', auth, requireAdmin, taskCtrl.archiveTask)
router.patch('/:taskId/restore', auth, requireAdmin, taskCtrl.restoreTask)
```

## Frontend Implementation

The frontend has been updated to allow **both staff and admin** to:
- Archive completed tasks
- View archived tasks
- Restore archived tasks

## Required Backend Changes

### Option 1: Allow All Authenticated Users (Simplest)

Remove the `requireAdmin` middleware:

```javascript
// Updated routes - All authenticated users can archive/restore
router.patch('/:taskId/archive', auth, taskCtrl.archiveTask)
router.patch('/:taskId/restore', auth, requireAdmin, taskCtrl.restoreTask)
```

### Option 2: Staff Can Only Archive Their Own Tasks (Recommended)

Keep the middleware but update the controller logic:

```javascript
// In taskController.js

exports.archiveTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check permissions
    const isAdmin = req.user.role === 'ADMIN';
    const isTaskOwner = task.owner.toString() === req.user.id;
    const isAssignedUser = task.assignedTo?.toString() === req.user.id;

    // Allow if: admin OR task owner OR assigned to this user
    if (!isAdmin && !isTaskOwner && !isAssignedUser) {
      return res.status(403).json({ 
        error: 'You can only archive tasks assigned to you or created by you' 
      });
    }

    task.isArchived = true;
    task.archivedAt = new Date();
    task.archivedBy = req.user.id;
    await task.save();

    res.json({ 
      message: 'Task archived successfully',
      task 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to archive task' });
  }
};

exports.restoreTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check permissions (same logic as archive)
    const isAdmin = req.user.role === 'ADMIN';
    const isTaskOwner = task.owner.toString() === req.user.id;
    const isAssignedUser = task.assignedTo?.toString() === req.user.id;

    if (!isAdmin && !isTaskOwner && !isAssignedUser) {
      return res.status(403).json({ 
        error: 'You can only restore tasks assigned to you or created by you' 
      });
    }

    task.isArchived = false;
    task.archivedAt = undefined;
    task.archivedBy = undefined;
    await task.save();

    res.json({ 
      message: 'Task restored successfully',
      task 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to restore task' });
  }
};
```

### Option 3: Update Task Model

Add fields to track who archived the task:

```javascript
// In Task model
const taskSchema = new mongoose.Schema({
  // ... existing fields ...
  
  isArchived: {
    type: Boolean,
    default: false,
  },
  archivedAt: {
    type: Date,
  },
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});
```

### Update GET /api/tasks Endpoint

Ensure the endpoint filters archived tasks correctly:

```javascript
exports.getAdminTasks = async (req, res) => {
  try {
    const { archived, status, assignedTo } = req.query;
    
    let filter = {};
    
    // Filter archived tasks
    if (archived === 'true') {
      filter.isArchived = true;
    } else {
      filter.isArchived = { $ne: true }; // Exclude archived by default
    }
    
    // Additional filters
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    
    // If user is staff, only show their tasks
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

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Also update getMyTasks to exclude archived by default
exports.getMyTasks = async (req, res) => {
  try {
    const { archived } = req.query;
    
    let filter = {
      $or: [
        { assignedTo: req.user.id },
        { owner: req.user.id }
      ]
    };
    
    // Include or exclude archived
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
    res.status(500).json({ error: 'Failed to fetch my tasks' });
  }
};
```

## Testing The Changes

After making backend changes, test:

1. **Staff User Archive**:
   ```bash
   # Should succeed - staff archiving their own task
   PATCH /api/tasks/:taskId/archive
   Headers: { Cookie: staff_session }
   ```

2. **Staff User Archive Others' Task**:
   ```bash
   # Should fail with 403 - staff archiving someone else's task
   PATCH /api/tasks/:taskId/archive
   Headers: { Cookie: staff_session }
   ```

3. **Admin Archive Any Task**:
   ```bash
   # Should succeed - admin archiving any task
   PATCH /api/tasks/:taskId/archive
   Headers: { Cookie: admin_session }
   ```

4. **Fetch Archived Tasks**:
   ```bash
   # Should return only archived tasks
   GET /api/tasks?archived=true
   ```

5. **Restore Task**:
   ```bash
   # Should restore the task
   PATCH /api/tasks/:taskId/restore
   ```

## Migration Notes

If you already have existing tasks, you may need to run a migration:

```javascript
// migration.js
const Task = require('./models/Task');

async function addArchiveFields() {
  try {
    await Task.updateMany(
      { isArchived: { $exists: false } },
      { 
        $set: { 
          isArchived: false 
        } 
      }
    );
    console.log('Migration complete');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

addArchiveFields();
```

## Summary

Choose the option that best fits your requirements:

- **Option 1**: Quickest, but allows any user to archive any task
- **Option 2**: ✅ **Recommended** - Proper permissions, staff can only archive their own tasks
- **Option 3**: Most complete, adds audit trail for who archived what

After implementing the backend changes, the frontend will work seamlessly for both staff and admin users!
