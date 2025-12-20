# Fix: Admin Board Showing All Tasks

## 🐛 **Problem**

Admin Task Board shows ALL tasks (including tasks assigned to staff) because:
- Admin creates all tasks → Admin is "owner"
- Backend `/api/tasks/my` returns tasks where user is owner OR assignedTo  
- So tasks assigned to staff still show on admin's board

## ✅ **Solution**

### **Option 1: Backend Fix (Recommended)**

Update the backend `getMyTasks` controller to accept a query parameter:

```javascript
// controllers/taskController.js

exports.getMyTasks = async (req, res) => {
  try {
    const { archived, assignedOnly } = req.query;
    
    let filter = {};
    
    // If assignedOnly=true, only show tasks assigned to user
    // Otherwise show tasks where user is owner OR assignedTo
    if (assignedOnly === 'true') {
      filter.assignedTo = req.user.id;
    } else {
      filter.$or = [
        { assignedTo: req.user.id },
        { owner: req.user.id }
      ];
    }
    
    // Filter by archived status
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
    console.error('Error fetching my tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};
```

### **Frontend Update:**

```typescript
// AdminTaskBoard.tsx

const fetchMyTasks = async () => {
  try {
    setLoading(true);
    // Add assignedOnly=true to get only tasks assigned to admin
    const res = await axios.get(`${BASE_URL}/api/tasks/my?assignedOnly=true`, {
      withCredentials: true,
    });
    setTasks(res.data.tasks);
  } catch (err) {
    console.error("Failed to fetch tasks", err);
  } finally {
    setLoading(false);
  }
};
```

---

### **Option 2: Frontend-Only Fix (Temporary)**

Filter on the frontend using user info:

```typescript
// AdminTaskBoard.tsx
import { useAuth } from "../../api/useAuth";

export default function AdminTaskBoard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/tasks/my`, {
        withCredentials: true,
      });
      
      // Filter to show ONLY tasks assigned to current user
      const assignedToMe = res.data.tasks.filter((task: Task) => {
        // Task must be assigned to someone AND that someone must be current user
        if (!task.assignedTo) return false;
        
        // Compare assignedTo with current user
        // assignedTo is populated object with _id, firstName, email
        return task.assignedTo._id === user?.id || 
               task.assignedTo.email === user?.email;
      });
      
      setTasks(assignedToMe);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };
  
  // ... rest of component
}
```

---

## 🎯 **Recommended Implementation**

Use **Option 1** (backend fix) because:
- ✅ More efficient (filters in database)
- ✅ Reduces data transfer
- ✅ Cleaner frontend code
- ✅ Works for all future features

---

## 📊 **Expected Behavior After Fix**

### **Admin Creates Tasks:**
```
Task 1: Assigned to Admin
Task 2: Assigned to Staff
```

### **Admin Task Board Shows:**
```
✅ Task 1 (assigned to admin)
❌ Task 2 (NOT shown - assigned to staff)
```

### **AllTasks Page Shows:**
```
✅ Task 1
✅ Task 2 (admin can see all tasks here)
```

### **Staff Task Board Shows:**
```
❌ Task 1 (NOT shown - assigned to admin)
✅ Task 2 (assigned to staff)
```

---

## 🔍 **Testing**

1. **Create 2 tasks as Admin:**
   - Task A → Assign to Admin (yourself)
   - Task B → Assign to Staff
   
2. **Check Admin Task Board:**
   - Should show ONLY Task A
   
3. **Check AllTasks:**
   - Should show both Task A and Task B
   
4. **Login as Staff:**
   - Staff board should show ONLY Task B

---

## 💡 **Why This Happens**

The original design of `/api/tasks/my` was:
```
Show me all tasks I'm involved with
= tasks I own (created) OR tasks assigned to me
```

But for the Kanban board, we want:
```
Show me only MY tasks
= tasks assigned to me (not tasks I created for others)
```

This is why we need the `assignedOnly=true` parameter!

---

## 🚀 **Implementation Status**

- ❌ Backend: Needs update to support `assignedOnly` parameter
- ⚠️ Frontend: Temporary filter added (not ideal)
- 📝 Recommended: Implement Option 1 (backend fix)

Once backend is updated, the frontend just needs:
```typescript
const res = await axios.get(`${BASE_URL}/api/tasks/my?assignedOnly=true`, {
  withCredentials: true,
});
```

Simple fix, big impact! 🎯
