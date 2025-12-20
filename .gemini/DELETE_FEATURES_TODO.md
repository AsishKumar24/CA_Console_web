# 📋 Future Features - Delete Functionality

## 🎯 Features to Implement:

### **1. Delete User (Staff)**
**Endpoint:** `DELETE /api/users/:userId`

**Requirements:**
- Admin only
- Cannot delete self
- Cannot delete last admin
- Soft delete (set isActive: false) or hard delete?
- Confirmation modal in UI
- Check if user has assigned tasks

**UI Location:** Staff Management page (`/profile`)

---

### **2. Delete Client**
**Endpoint:** `DELETE /api/clients/:clientId`

**Requirements:**
- Admin only
- Check if client has active tasks
- Option to:
  - Block if tasks exist
  - OR cascade delete all client's tasks
  - OR reassign tasks to another client
- Confirmation modal with warning
- Show task count before deleting

**UI Location:** Client Details page

---

### **3. Delete Task**
**Endpoint:** `DELETE /api/tasks/:taskId`

**Requirements:**
- Admin only (or task owner)
- Alternative: Archive instead of delete?
- Check if task has billing records
- Confirmation modal
- Option to:
  - Soft delete (set isDeleted flag)
  - Hard delete (permanent)

**UI Location:** Task Details page, Task List

---

## 🔒 **Safety Measures:**

### **For All Delete Operations:**

1. **Confirmation Modals:**
   ```tsx
   - Double confirmation for destructive actions
   - Show what will be affected
   - "Are you sure?" dialog
   ```

2. **Soft Delete vs Hard Delete:**
   ```
   Soft Delete: Set isDeleted: true, keep in database
   Hard Delete: Permanently remove from database
   
   Recommendation: Use soft delete for audit trail
   ```

3. **Cascade Handling:**
   ```
   When deleting:
   - User → Check assigned tasks
   - Client → Check client tasks
   - Task → Check billing records
   
   Options:
   - Block delete if dependencies exist
   - Cascade delete all related data
   - Reassign to another entity
   ```

4. **Activity Logging:**
   ```
   Log all delete operations:
   - Who deleted
   - What was deleted
   - When it was deleted
   - Why (optional note)
   ```

---

## 📝 **Implementation Plan:**

### **Phase 1: Backend API**
```javascript
// Delete User
router.delete('/:userId', auth, requireAdmin, async (req, res) => {
  // Check if user has active tasks
  // Prevent self-delete
  // Prevent deleting last admin
  // Soft delete or hard delete
});

// Delete Client
router.delete('/:clientId', auth, requireAdmin, async (req, res) => {
  // Check for active tasks
  // Handle cascade or block
  // Soft delete recommended
});

// Delete Task
router.delete('/:taskId', auth, requireAdmin, async (req, res) => {
  // Check billing records
  // Soft delete recommended
  // Log deletion
});
```

### **Phase 2: Frontend UI**
```tsx
// Confirmation Modal Component
<DeleteConfirmationModal
  title="Delete Staff Member?"
  message="This will permanently delete the user and may affect tasks."
  onConfirm={handleDelete}
  onCancel={handleCancel}
/>

// Delete Button with Icon
<button
  onClick={() => setShowDeleteModal(true)}
  className="text-red-600 hover:text-red-700"
>
  <TrashIcon /> Delete
</button>
```

### **Phase 3: Database Schema Updates**
```javascript
// Add soft delete fields to models
{
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  deletedBy: { type: ObjectId, ref: 'User' },
  deletionReason: String
}

// Update queries to filter out deleted items
Model.find({ isDeleted: { $ne: true } })
```

---

## ⚠️ **Important Notes:**

1. **Reversibility:**
   - Use soft delete for reversible deletions
   - Admins can restore soft-deleted items
   - Hard delete should be rare and well-logged

2. **Data Integrity:**
   - Always check for dependencies before deleting
   - Provide clear warnings to users
   - Consider cascade effects

3. **User Experience:**
   - Clear confirmation dialogs
   - Show what will be affected
   - Provide undo option if possible
   - Success/error feedback

4. **Audit Trail:**
   - Log all deletions
   - Who, what, when, why
   - Keep for compliance/debugging

---

## 🚀 **When to Implement:**

Implement in this order:
1. **Task Deletion** (most common, least risky)
2. **Client Deletion** (moderate risk, check dependencies)
3. **User Deletion** (highest risk, most checks needed)

---

**Current Status:** Documented, not implemented yet
**Priority:** Medium
**Complexity:** Medium-High
**Estimated Time:** 2-3 hours total
