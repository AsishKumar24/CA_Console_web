# Backend Route Missing - Task Details Fix

## Problem
Getting "failed to fetch task" error when clicking "View Details" or "View" buttons.

## Root Cause
The backend likely doesn't have a route to fetch a single task by ID, or it's restricted to admins only.

## Required Backend Route

You need to add this route to your backend task routes:

```javascript
// In your backend routes file (e.g., routes/tasks.js)

// GET single task by ID - MUST come BEFORE the archived route
router.get('/:taskId', auth, taskCtrl.getTaskById);

// Complete route order should be:
router.get('/summary/staff', auth, taskCtrl.staffSummary)
router.get('/summary/admin', auth, requireAdmin, taskCtrl.adminSummary)
router.get('/', auth, requireAdmin, taskCtrl.getAdminTasks)
router.get('/my', auth, taskCtrl.getMyTasks)
router.get('/:taskId', auth, taskCtrl.getTaskById)  // <-- ADD THIS LINE (no requireAdmin!)
router.post('/:taskId/notes', auth, taskCtrl.addNote)
router.patch('/:taskId/status', auth, taskCtrl.updateTaskStatus)
router.patch('/:taskId/restore', auth, taskCtrl.restoreTask)  // Update: remove requireAdmin
router.patch('/:taskId/archive', auth, taskCtrl.archiveTask)  // Update: remove requireAdmin
router.patch('/:taskId/assign', auth, requireAdmin, taskCtrl.assignTask)
router.patch('/:taskId/edit', auth, requireAdmin, taskCtrl.editTask)
router.post('/', auth, requireAdmin, taskCtrl.createTask)
```

## Backend Controller Implementation

Add this to your task controller (e.g., `controllers/taskController.js`):

```javascript
// Get single task by ID
exports.getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = await Task.findById(taskId)
      .populate('client', 'name code email phone')
      .populate('assignedTo', 'firstName email role')
      .populate('owner', 'firstName email')
      .populate('notes.createdBy', 'firstName')
      .populate('statusHistory.changedBy', 'firstName');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Authorization check: Allow if admin OR owner OR assigned user
    const isAdmin = req.user.role === 'ADMIN';
    const isOwner = task.owner._id.toString() === req.user.id;
    const isAssignedUser = task.assignedTo?._id.toString() === req.user.id;

    if (!isAdmin && !isOwner && !isAssignedUser) {
      return res.status(403).json({ 
        error: 'You do not have permission to view this task' 
      });
    }

    res.json({ task });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};
```

## Quick Fix (If You Can't Update Backend Now)

If you can't update the backend immediately, you can temporarily modify the frontend to handle the error gracefully:

### Update TaskDetails.tsx

Find the fetchTask function and update error handling:

```typescript
const fetchTask = async () => {
  try {
    setLoading(true);
    setError(null);  // Clear previous errors
    
    const res = await axios.get(`${BASE_URL}/api/tasks/${taskId}`, {
      withCredentials: true,
    });
    
    setTask(res.data.task);
    setNewStatus(res.data.task.status);
  } catch (err: any) {
    console.error('Fetch task error:', err);
    
    // More detailed error message
    if (err.response?.status === 404) {
      setError('Task not found. It may have been deleted.');
    } else if (err.response?.status === 403) {
      setError('You do not have permission to view this task.');
    } else if (err.response?.status === 500) {
      setError('Server error. The backend route may be missing. Please contact admin.');
    } else {
      setError(err?.response?.data?.error || 'Failed to fetch task. Check backend routes.');
    }
  } finally {
    setLoading(false);
  }
};
```

## Debugging Steps

### 1. Check Browser Console
Open browser console (F12) and look for the actual error:
```
Network tab → Click "View Details" → Look for the failed request
```

You should see something like:
- `GET http://localhost:5000/api/tasks/[taskId]` - Status: 404 or 500

### 2. Check Backend Logs
Look at your backend terminal for errors when clicking "View Details"

### 3. Test Backend Route Directly

Use a tool like Postman or curl to test:
```bash
# Replace with your actual task ID
curl http://localhost:5000/api/tasks/[TASK_ID_HERE] \
  -H "Cookie: your-session-cookie"
```

## Expected Backend Response

The route should return:
```json
{
  "task": {
    "_id": "...",
    "title": "Task title",
    "status": "NOT_STARTED",
    "priority": "HIGH",
    "client": {
      "_id": "...",
      "name": "Client Name",
      "code": "CL001"
    },
    "assignedTo": {
      "_id": "...",
      "firstName": "John",
      "email": "john@example.com"
    },
    "owner": {
      "_id": "...",
      "firstName": "Admin"
    },
    "notes": [],
    "statusHistory": [],
    "isArchived": false,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

## Common Issues & Solutions

### Issue 1: Route Not Found (404)
**Cause**: Backend doesn't have `GET /:taskId` route
**Solution**: Add the route as shown above

### Issue 2: Permission Denied (403)
**Cause**: Route has `requireAdmin` middleware
**Solution**: Remove `requireAdmin` from the `getTaskById` route, handle permissions in controller

### Issue 3: Route Order Wrong
**Cause**: Dynamic route `/:taskId` is before specific routes like `/my`
**Solution**: Ensure specific routes come BEFORE dynamic routes

### Issue 4: Task Model Missing Fields
**Cause**: Task in database doesn't have required fields
**Solution**: Update Task model to include all required fields:
```javascript
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'], default: 'NOT_STARTED' },
  priority: { type: String, enum: ['LOW', 'NORMAL', 'HIGH'], default: 'NORMAL' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes: [{
    message: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  statusHistory: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    note: String
  }],
  isArchived: { type: Boolean, default: false },
  archivedAt: Date,
  dueDate: Date,
  serviceType: String,
  assessmentYear: String,
  period: String,
}, { timestamps: true });
```

## Summary

**The most likely issue**: Your backend is missing the `GET /api/tasks/:taskId` route.

**Quick fix**:
1. Add the route in your backend
2. Remove `requireAdmin` middleware (both staff and admin need to view tasks)
3. Handle permissions in the controller logic
4. Restart your backend server

**Test it**:
```bash
# After adding the route, test with:
curl http://localhost:5000/api/tasks/[SOME_TASK_ID] \
  -H "Cookie: [your-session-cookie]"
```

Once you add this route to your backend, the "View Details" buttons will work for both staff and admin users!
