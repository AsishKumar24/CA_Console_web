# 🐛 Client List - Inactive Filter Fix

## **Problem:**
Frontend is sending `isActive: true/false` but backend expects `statusFilter: 'active'/'inactive'/'all'`

## **Fix:**

**File:** `src/pages/clients/ClientList.tsx` (Line ~41-49)

**CHANGE FROM:**
```typescript
const res = await axios.get(endpoint, {
  params: isAdmin ? { 
    page, 
    limit, 
    search,
    isActive: statusFilter === "all" ? undefined : statusFilter === "active"
  } : undefined,
  withCredentials: true
});
```

**CHANGE TO:**
```typescript
const res = await axios.get(endpoint, {
  params: isAdmin ? { 
    page, 
    limit, 
    search,
    statusFilter  // ✅ Just pass statusFilter directly!
  } : undefined,
  withCredentials: true
});
```

---

## ✅ **This will work because:**
- Frontend already has: `statusFilter` state with values: `'all'`, `'active'`, `'inactive'`
- Backend expects: parameter `statusFilter` with values: `'all'`, `'active'`, `'inactive'`
- They match perfectly! Just pass it through!

---

**Make this ONE change and the inactive filter will work!** 🚀
