# Backend Routes - Usage Analysis

## Backend Routes Available vs Frontend Usage

Based on the routes you provided and the frontend codebase analysis:

```javascript
// From your backend routes
router.get('/summary/staff', auth, taskCtrl.staffSummary)
router.get('/summary/admin', auth, requireAdmin, taskCtrl.adminSummary)
router.get('/', auth, requireAdmin, taskCtrl.getAdminTasks)
router.get('/my', auth, taskCtrl.getMyTasks)
router.post('/:taskId/notes', auth, taskCtrl.addNote)
router.patch('/:taskId/status', auth, taskCtrl.updateTaskStatus)
router.patch('/:taskId/restore', auth, requireAdmin, taskCtrl.restoreTask)
router.patch('/:taskId/archive', auth, requireAdmin, taskCtrl.archiveTask)
router.patch('/:taskId/assign', auth, requireAdmin, taskCtrl.assignTask)
router.patch('/:taskId/edit', auth, requireAdmin, taskCtrl.editTask)
router.post('/', auth, requireAdmin, taskCtrl.createTask)
```

## ✅ Routes Currently Used by Frontend

### 1. **GET /api/tasks** (getAdminTasks)
- **Used in**: `AllTasks.tsx`, `ArchivedTasks.tsx`
- **Purpose**: Fetch all tasks with filters (status, assigned user, archived)
- **Usage**:
```typescript
// AllTasks.tsx - Line 66
const res = await axios.get(`${BASE_URL}/api/tasks`, {
  params: { page, limit, status, assignedTo }
});

// ArchivedTasks.tsx - Line 54
const res = await axios.get(`${BASE_URL}/api/tasks`, {
  params: { archived: true }
});
```

### 2. **GET /api/tasks/my** (getMyTasks)
- **Used in**: `MyTasks.tsx`, `AdminTaskBoard.tsx`
- **Purpose**: Fetch tasks assigned to current user
- **Usage**:
```typescript
// MyTasks.tsx - Line 201
const res = await axios.get(`${BASE_URL}/api/tasks/my`, {
  withCredentials: true
});

// AdminTaskBoard.tsx - Line 201
const res = await axios.get(`${BASE_URL}/api/tasks/my`, {
  withCredentials: true
});
```

### 3. **GET /api/tasks/:taskId** (getTaskById - implied)
- **Used in**: `TaskDetails.tsx`
- **Purpose**: Fetch single task details
- **Usage**:
```typescript
// TaskDetails.tsx - Line 107
const res = await axios.get(`${BASE_URL}/api/tasks/${taskId}`, {
  withCredentials: true
});
```

### 4. **POST /api/tasks** (createTask)
- **Used in**: `TaskPage.tsx`
- **Purpose**: Create a new task
- **Usage**:
```typescript
// TaskPage.tsx - Line 130
await axios.post(
  BASE_URL + "/api/tasks",
  taskPayload,
  { withCredentials: true }
);
```

### 5. **PATCH /api/tasks/:taskId/edit** (editTask)
- **Used in**: `TaskDetails.tsx`
- **Purpose**: Edit task details
- **Usage**:
```typescript
// TaskDetails.tsx - Line 154
await axios.patch(
  `${BASE_URL}/api/tasks/${taskId}/edit`,
  editData,
  { withCredentials: true }
);
```
✅ **This route IS being used!**

### 6. **PATCH /api/tasks/:taskId/status** (updateTaskStatus)
- **Used in**: `TaskDetails.tsx`, `MyTasks.tsx`, `AdminTaskBoard.tsx`
- **Purpose**: Update task status (NOT_STARTED, IN_PROGRESS, COMPLETED)
- **Usage**:
```typescript
// TaskDetails.tsx - Line 172
await axios.patch(
  `${BASE_URL}/api/tasks/${taskId}/status`,
  { status: newStatus, note: statusNote },
  { withCredentials: true }
);

// MyTasks.tsx - Line 227 (drag & drop)
await axios.patch(
  `${BASE_URL}/api/tasks/${taskId}/status`,
  { status: newStatus },
  { withCredentials: true }
);

// AdminTaskBoard.tsx - Line 227 (drag & drop)
await axios.patch(
  `${BASE_URL}/api/tasks/${taskId}/status`,
  { status: newStatus },
  { withCredentials: true }
);
```

### 7. **POST /api/tasks/:taskId/notes** (addNote)
- **Used in**: `TaskDetails.tsx`
- **Purpose**: Add a note to a task
- **Usage**:
```typescript
// TaskDetails.tsx - Line 192
await axios.post(
  `${BASE_URL}/api/tasks/${taskId}/notes`,
  { message: noteMessage },
  { withCredentials: true }
);
```

### 8. **PATCH /api/tasks/:taskId/assign** (assignTask)
- **Used in**: `TaskDetails.tsx`
- **Purpose**: Assign task to a staff member
- **Usage**:
```typescript
// TaskDetails.tsx - Line 212
await axios.patch(
  `${BASE_URL}/api/tasks/${taskId}/assign`,
  { staffId: assignToId },
  { withCredentials: true }
);
```

### 9. **PATCH /api/tasks/:taskId/archive** (archiveTask)
- **Used in**: `TaskDetails.tsx`, `MyTasks.tsx`, `AdminTaskBoard.tsx`
- **Purpose**: Archive a completed task
- **Usage**:
```typescript
// TaskDetails.tsx - Line 228
await axios.patch(
  `${BASE_URL}/api/tasks/${taskId}/archive`,
  {},
  { withCredentials: true }
);

// MyTasks.tsx - Line 245
await axios.patch(
  `${BASE_URL}/api/tasks/${taskId}/archive`,
  {},
  { withCredentials: true }
);

// AdminTaskBoard.tsx - Line 245
await axios.patch(
  `${BASE_URL}/api/tasks/${taskId}/archive`,
  {},
  { withCredentials: true }
);
```

### 10. **PATCH /api/tasks/:taskId/restore** (restoreTask)
- **Used in**: `TaskDetails.tsx`, `ArchivedTasks.tsx`
- **Purpose**: Restore an archived task
- **Usage**:
```typescript
// TaskDetails.tsx - Line 241
await axios.patch(
  `${BASE_URL}/api/tasks/${taskId}/restore`,
  {},
  { withCredentials: true }
);

// ArchivedTasks.tsx - Line 77
await axios.patch(
  `${BASE_URL}/api/tasks/${taskId}/restore`,
  {},
  { withCredentials: true }
);
```

## ❌ Routes NOT Used by Frontend

### 1. **GET /api/tasks/summary/staff** (staffSummary)
- **Status**: ❌ NOT USED
- **Purpose**: Likely returns summary/statistics for staff user
- **Potential Use**: Dashboard widgets, task statistics

### 2. **GET /api/tasks/summary/admin** (adminSummary)
- **Status**: ❌ NOT USED
- **Purpose**: Likely returns summary/statistics for admin
- **Potential Use**: Dashboard widgets, admin analytics

## Summary Table

| Route | Method | Used? | Where Used | Purpose |
|-------|--------|-------|------------|---------|
| `/` | GET | ✅ | AllTasks, ArchivedTasks | Fetch all tasks |
| `/my` | GET | ✅ | MyTasks, AdminTaskBoard | Fetch my tasks |
| `/:taskId` | GET | ✅ | TaskDetails | Fetch single task |
| `/` | POST | ✅ | TaskPage | Create task |
| `/:taskId/edit` | PATCH | ✅ | TaskDetails | Edit task |
| `/:taskId/status` | PATCH | ✅ | TaskDetails, MyTasks, AdminTaskBoard | Update status |
| `/:taskId/notes` | POST | ✅ | TaskDetails | Add note |
| `/:taskId/assign` | PATCH | ✅ | TaskDetails | Assign task |
| `/:taskId/archive` | PATCH | ✅ | TaskDetails, MyTasks, AdminTaskBoard | Archive task |
| `/:taskId/restore` | PATCH | ✅ | TaskDetails, ArchivedTasks | Restore task |
| `/summary/staff` | GET | ❌ | **NOT USED** | Staff summary |
| `/summary/admin` | GET | ❌ | **NOT USED** | Admin summary |

## Recommendations

### 1. Implement Summary Endpoints (Optional)

The summary endpoints could be very useful for dashboard analytics. Consider implementing:

#### Staff Summary
Could show on the dashboard or My Tasks page:
- Total tasks assigned
- Tasks by status (NOT_STARTED, IN_PROGRESS, COMPLETED)
- Overdue tasks count
- Tasks completed this week/month

```typescript
// Example implementation in Home.tsx or MyTasks.tsx
const [summary, setSummary] = useState({
  total: 0,
  notStarted: 0,
  inProgress: 0,
  completed: 0,
  overdue: 0,
});

useEffect(() => {
  const fetchSummary = async () => {
    const res = await axios.get(`${BASE_URL}/api/tasks/summary/staff`, {
      withCredentials: true,
    });
    setSummary(res.data);
  };
  fetchSummary();
}, []);
```

#### Admin Summary
Could show on admin dashboard:
- Total tasks in system
- Tasks by status
- Tasks by assigned user
- Unassigned tasks count
- Completion rate
- Average completion time

### 2. Create Dashboard Widgets

Consider creating:
- `src/components/tasks/TaskSummaryCard.tsx` - Summary statistics card
- `src/components/tasks/TaskChart.tsx` - Visual charts for task data
- Add these to the Dashboard/Home page

### 3. Backend Updates Needed for Summary

If you want to implement the summary endpoints on frontend, your backend should return something like:

```javascript
// staffSummary response
{
  total: 25,
  notStarted: 5,
  inProgress: 12,
  completed: 8,
  overdue: 2,
  thisWeek: {
    assigned: 3,
    completed: 5
  },
  priorityBreakdown: {
    high: 4,
    normal: 15,
    low: 6
  }
}

// adminSummary response
{
  total: 150,
  notStarted: 30,
  inProgress: 75,
  completed: 45,
  archived: 20,
  unassigned: 10,
  byStaff: [
    { staffId: "123", name: "John", count: 25 },
    { staffId: "456", name: "Jane", count: 30 }
  ],
  completionRate: 0.75,
  avgCompletionDays: 5.2
}
```

## Conclusion

✅ **All CRUD operations are being used** - create, read, update, delete (archive)
✅ **Task management is fully functional** - edit, assign, status updates, notes
❌ **Summary/analytics endpoints are NOT used** - opportunity for enhancement

The edit task route (`/:taskId/edit`) **IS being used** in TaskDetails.tsx, so all core task management features are implemented on the frontend!
