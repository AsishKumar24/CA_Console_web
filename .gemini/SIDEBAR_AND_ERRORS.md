# Sidebar Updates & Error Troubleshooting

## ✅ Sidebar Updates Completed

### What Was Added

I've updated the AppSidebar.tsx to include "Archived Tasks" in both Admin and Staff menus:

**Admin Tasks Menu:**
- Create Task → `/tasks`
- My Task Board → `/my-task-board`
- All Tasks → `/tasks/list`
- ✨ **Archived Tasks** → `/tasks/archived` (NEW)

**Staff My Tasks Menu:**
- Assigned to Me → `/my-tasks`
- ✨ **Archived Tasks** → `/tasks/archived` (NEW)

## Navigation Structure

### Edit Task Functionality

**There is NO separate "Edit Task" page.** Task editing happens **inline** in the TaskDetails page:

1. Navigate to any task via "View Details" button
2. In TaskDetails page → Click "Edit Task" button (admin only)
3. Form appears inline in the same page
4. Make changes and click "Save Changes"

**Routes:**
- View/Edit Task: `/tasks/:taskId` (shows TaskDetails.tsx)
- Uses backend: `PATCH /api/tasks/:taskId/edit`

### Complete Navigation Map

```
📂 ADMIN NAVIGATION
├── Clients
│   ├── Create Client (/clients/create)
│   ├── Client List (/clients)
│   └── Search Client (/clients/search)
│
└── Tasks
    ├── Create Task (/tasks) ← Create new tasks
    ├── My Task Board (/my-task-board) ← Your Kanban board
    ├── All Tasks (/tasks/list) ← Table view of all tasks
    └── Archived Tasks (/tasks/archived) ← NEW! View archived tasks

📂 STAFF NAVIGATION
└── My Tasks
    ├── Assigned to Me (/my-tasks) ← Your Kanban board
    └── Archived Tasks (/tasks/archived) ← NEW! View archived tasks
```

## Potential "View Details" Errors

### Error 1: 404 Not Found

**Symptom**: Clicking "View Details" gives 404 error

**Cause**: TaskDetails route might not be accessible

**Solution**: ✅ Already fixed! The route `/tasks/:taskId` was moved to ProtectedRoute in App.tsx (Step Id: 93)

**Verify in App.tsx:**
```typescript
// Should be under ProtectedRoute, NOT AdminRoute
<Route element={<ProtectedRoute />}>
  <Route element={<AppLayout />}>
    <Route path="/my-tasks" element={<MyTasks />} />
    <Route path="/tasks/archived" element={<ArchivedTasks />} />
    <Route path="/tasks/:taskId" element={<TaskDetails />}/> ✓ HERE
  </Route>
</Route>
```

### Error 2: Cannot Read Properties of Undefined

**Symptom**: Error like "Cannot read property 'name' of undefined"

**Cause**: Task data not loaded or missing fields

**Check**: Open browser console (F12) and look for the actual error

**Potential fixes:**
```typescript
// In TaskDetails.tsx, ensure safe access:
{task?.client?.name}  // Instead of: {task.client.name}
{task?.assignedTo?.firstName}  // Instead of: {task.assignedTo.firstName}
```

### Error 3: 403 Forbidden

**Symptom**: "Not authorized" or 403 error when viewing task details

**Cause**: Backend permission issue

**Solution**: Ensure backend allows viewing:
```javascript
// Backend should allow both staff and admin to view tasks
router.get('/:taskId', auth, taskCtrl.getTaskById)  // No requireAdmin here!
```

### Error 4: Route Parameter Not Matching

**Symptom**: Task ID shows as "undefined" or route doesn't work

**Cause**: Wrong parameter name in App.tsx vs TaskDetails.tsx

**Check both match:**
```typescript
// App.tsx
<Route path="/tasks/:taskId" element={<TaskDetails />}/>

// TaskDetails.tsx
const { taskId } = useParams();  // Must match ":taskId"
```

## How to Debug "View Details" Errors

1. **Open Browser Console** (F12 → Console tab)
2. **Click "View Details"** on a task
3. **Look for errors** - you should see:
   - ❌ Red error messages
   - Stack trace showing which file/line failed
   
4. **Check Network Tab**:
   - Look for failed requests (red)
   - Check status codes:
     - 404 = route not found
     - 403 = permission denied
     - 500 = server error

5. **Common fixes:**
   - Clear browser cache (Ctrl+Shift+Delete)
   - Restart dev server (`npm run dev`)
   - Check backend is running
   - Verify database connection

## Backend Routes Status

### ✅ All Used Routes
- `GET /api/tasks` - Fetch all tasks ✓
- `GET /api/tasks/my` - Fetch my tasks ✓  
- `GET /api/tasks/:taskId` - View task details ✓
- `POST /api/tasks` - Create task ✓
- `PATCH /api/tasks/:taskId/edit` - **Edit task ✓** (Used in TaskDetails!)
- `PATCH /api/tasks/:taskId/status` - Update status ✓
- `POST /api/tasks/:taskId/notes` - Add notes ✓
- `PATCH /api/tasks/:taskId/assign` - Assign task ✓
- `PATCH /api/tasks/:taskId/archive` - Archive task ✓
- `PATCH /api/tasks/:taskId/restore` - Restore task ✓

### ❌ Unused Routes (Optional Analytics)
- `GET /api/tasks/summary/staff` - Staff summary stats
- `GET /api/tasks/summary/admin` - Admin summary stats

These could be used for dashboard widgets showing:
- Total tasks count
- Tasks by status breakdown
- Completion rates
- Tasks per staff member

## Route Access Matrix

| Route | Staff | Admin | Purpose |
|-------|-------|-------|---------|
| `/tasks` | ❌ | ✅ | Create new task |
| `/my-tasks` | ✅ | ✅ | View your tasks (Kanban) |
| `/my-task-board` | ❌ | ✅ | Admin's task board |
| `/tasks/list` | ❌ | ✅ | View all tasks (Table) |
| `/tasks/archived` | ✅ | ✅ | View archived tasks |
| `/tasks/:taskId` | ✅ | ✅ | View/edit task details |

## Testing Checklist

After these updates, test:

1. **Sidebar Navigation:**
   - [ ] Admin can see "Archived Tasks" under Tasks menu
   - [ ] Staff can see "Archived Tasks" under My Tasks menu
   - [ ] Clicking opens `/tasks/archived` page correctly

2. **View Details Button:**
   - [ ] Click "View Details" from My Tasks
   - [ ] Click "View Details" from All Tasks
   - [ ] Click "View Details" from Archived Tasks
   - [ ] All should open TaskDetails page without errors

3. **Task Editing:**
   - [ ] Admin can click "Edit Task" in TaskDetails
   - [ ] Form appears inline
   - [ ] Can save changes successfully
   - [ ] Staff cannot see edit button (if not owner)

4. **Console Errors:**
   - [ ] Open browser console (F12)
   - [ ] Navigate through all task pages
   - [ ] No red errors should appear

## Quick Fixes

If you still see errors, try:

```bash
# 1. Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# 2. Clear browser cache
# In browser: Ctrl+Shift+Delete → Clear everything

# 3. Restart dev server
# Stop current server (Ctrl+C)
npm run dev

# 4. Check backend is running
# Verify backend server is accessible at BASE_URL
```

## Need More Help?

If errors persist:
1. Share the exact error message from browser console
2. Share the URL where error occurs
3. Share whether you're logged in as STAFF or ADMIN
4. Check if backend server is running and accessible
