# Archive Task Feature - Quick Guide

## For All Users (Staff & Admin)

### How to Archive a Completed Task

1. **Navigate to Your Tasks**
   - Go to "My Tasks" (staff and admin)
   - Or "My Task Board" (admin)
   
2. **Find Completed Tasks**
   - Look for tasks in the "Completed" column
   - Completed tasks will have a green status badge
   
3. **Archive the Task**
   - Click the "📦 Archive" button on the task card
   - Confirm the action when prompted
   - Task will be removed from the active view

### How to View Archived Tasks

1. **Click "📦 Archived Tasks" button**
   - Available in:
     - My Tasks page (top right) - **All Users**
     - My Task Board page (top right) - **Admin Only**
     - All Tasks page (top right) - **Admin Only**

2. **Browse Archived Tasks**
   - See all archived tasks in a table
   - Use search to find specific tasks
   - View when each task was archived

### How to Restore an Archived Task

1. **Navigate to Archived Tasks**
   - Click "📦 Archived Tasks" button

2. **Find the Task**
   - Use search if needed
   - Click "View" to see details
   
3. **Restore the Task**
   - Click "Restore" button
   - Task returns to active view with its original status
   - No longer appears in archived list

## User Permissions

### 👥 Staff Users Can:
- ✅ Archive their own completed tasks
- ✅ View all archived tasks
- ✅ Restore archived tasks
- ✅ Search archived tasks
- ✅ Access `/tasks/archived` page

### 👑 Admin Users Can:
- ✅ Everything staff can do, PLUS:
- ✅ Create new tasks
- ✅ Archive ANY task (not just their own)
- ✅ Assign tasks to staff members
- ✅ Edit task details
- ✅ View all tasks in organization

## Button Locations

### My Tasks (Staff & Admin)
```
┌─────────────────────────────────────────────┐
│ My Tasks                📦 Archived Tasks   │
│ Drag and drop tasks...                      │
└─────────────────────────────────────────────┘

Completed Task Card:
┌──────────────────────────────┐
│ Task Title                   │
│ Client: ABC Corp             │
│ ──────────────────────────   │
│ View Details  | 📦 Archive   │ ← Archive button (ALL USERS)
└──────────────────────────────┘
```

### Admin Task Board (Admin Only)
```
┌─────────────────────────────────────────────┐
│ My Task Board           📦 Archived Tasks   │
│ Drag and drop tasks...                      │
└─────────────────────────────────────────────┘
```

### All Tasks (Admin Only)
```
┌─────────────────────────────────────────────┐
│ All Tasks                                   │
│ Manage all tasks...                         │
│                   📦 Archived  + Create     │
│                      Tasks      Task        │
└─────────────────────────────────────────────┘
```

### Archived Tasks Page (ALL USERS)
```
┌─────────────────────────────────────────────┐
│ ← Back                                      │
│ Archived Tasks                              │
│ View and restore archived tasks             │
└─────────────────────────────────────────────┘

│ Task       │ Client │ Status │ Actions      │
├────────────┼────────┼────────┼──────────────┤
│ Tax Filing │ ABC    │ Done   │ View Restore │
└────────────┴────────┴────────┴──────────────┘
```

## Important Notes

👥 **Access for All**
- Both staff and admin can archive and restore tasks
- All authenticated users can view archived tasks
- Staff primarily manage their own tasks

💾 **Data Preservation**
- Archived tasks retain all their data
- Status, notes, history are all preserved
- Tasks can be restored at any time

🔒 **Reversible Actions**
- Archiving requires confirmation
- Restoring is instant (no confirmation needed)
- Both actions are logged in task history

⚠️ **Backend Note**
- If you get permission errors when archiving, contact your administrator
- The backend may need to be updated to allow staff archiving
- Currently backend routes have admin-only restriction

## Tips

✨ **When to Archive**
- After task completion and review
- When task is no longer actively needed
- To clean up the task board
- For historical record keeping

✨ **Search in Archives**
- Use client name, task title, or code
- Filter by typing in the search box
- Results update automatically

✨ **Task Organization**
- Archive old completed tasks regularly
- Keep active board focused
- Use archived view for historical reference
- Restore if you need to work on a task again

## Common Use Cases

### For Staff:
1. **Completed My Work** → Archive the task to clear your board
2. **Need to Reference** → Go to Archived Tasks to find old work
3. **Made a Mistake** → Restore the task and continue working

### For Admin:
1. **Project Complete** → Archive all related completed tasks
2. **Quarter End** → Archive all Q4 completed tasks
3. **Audit** → Search archived tasks for specific period
4. **Reopen Work** → Restore tasks that need additional attention

## Quick Links

- **My Tasks**: `/my-tasks`
- **Archived Tasks**: `/tasks/archived`
- **Task Details**: `/tasks/:taskId`

## Need Help?

If you encounter issues:
1. **Cannot archive**: Contact admin - backend permissions may need update
2. **Cannot find task**: Use search in archived tasks
3. **Task not restoring**: Check your permissions or contact admin
4. **Cannot access page**: Ensure you're logged in
