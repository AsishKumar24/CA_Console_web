# 📝 Exact Lines to Change - Manual Guide

## ✅ Error Fixed!
`SensitiveData.tsx` is now working without errors.

---

## 🎯 **Dashboard - Home.tsx**

### **Find these lines and replace:**

**Location 1: Revenue Card**

**FIND (around line ~100-120):**
```tsx
<p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
  ₹{stats.totalRevenue?.toLocaleString() || '0'}
</p>
```

**REPLACE WITH:**
```tsx
import { SensitiveData } from '../../components/common/SensitiveData';

<SensitiveData 
  value={stats.totalRevenue || 0} 
  className="text-2xl font-semibold text-gray-900 dark:text-white mt-1"
/>
```

---

**Location 2: Pending Amount (if exists)**

**FIND:**
```tsx
<p className="text-2xl font-semibold">
  ₹{stats.pendingAmount?.toLocaleString()}
</p>
```

**REPLACE WITH:**
```tsx
<SensitiveData 
  value={stats.pendingAmount || 0} 
  className="text-2xl font-semibold text-gray-900 dark:text-white"
/>
```

---

## 🎯 **Billing Dashboard - BillingDashboard.tsx**

### **Step 1: Add Import (at top of file)**

**ADD THIS LINE:**
```tsx
import { SensitiveData } from '../../components/common/SensitiveData';
```

---

### **Step 2: Replace Amount Displays**

**Location 1: Total Amount Card**

**FIND (around line ~145):**
```tsx
<p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
  {formatCurrency(stats.totalAmount)}
</p>
```

**REPLACE WITH:**
```tsx
<SensitiveData 
  value={stats.totalAmount} 
  className="text-2xl font-semibold text-gray-900 dark:text-white mt-1"
/>
```

---

**Location 2: Paid Amount Card**

**FIND (around line ~158):**
```tsx
<p className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-1">
  {formatCurrency(stats.totalPaid)}
</p>
```

**REPLACE WITH:**
```tsx
<SensitiveData 
  value={stats.totalPaid} 
  className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-1"
/>
```

---

**Location 3: Pending Amount Card**

**FIND (around line ~173):**
```tsx
<p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400 mt-1">
  {formatCurrency(stats.totalAmount - stats.totalPaid)}
</p>
```

**REPLACE WITH:**
```tsx
<SensitiveData 
  value={stats.totalAmount - stats.totalPaid} 
  className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400 mt-1"
/>
```

---

**Location 4: Bill Amounts in Table**

**FIND (around line ~273):**
```tsx
<div className="font-medium text-gray-900 dark:text-white">
  {formatCurrency(task.billing.amount)}
</div>
```

**REPLACE WITH:**
```tsx
<SensitiveData 
  value={task.billing.amount} 
  className="font-medium text-gray-900 dark:text-white"
/>
```

---

**Location 5: Paid Amount in Table (if showing)**

**FIND:**
```tsx
<div className="text-xs text-green-600 dark:text-green-400 mt-0.5">
  Paid: {formatCurrency(task.billing.paidAmount)}
</div>
```

**REPLACE WITH:**
```tsx
<div className="text-xs text-green-600 dark:text-green-400 mt-0.5">
  Paid: <SensitiveData 
    value={task.billing.paidAmount} 
    className="inline"
    blurLevel="light"
  />
</div>
```

---

## 🔍 **How to Find These Lines:**

1. **Open the file** (Home.tsx or BillingDashboard.tsx)
2. **Press Ctrl+F** (Find)
3. **Search for:** `formatCurrency` or `toLocaleString`
4. **Replace** with `<SensitiveData ... />`

---

## ✅ **Quick Checklist:**

**Dashboard (Home.tsx):**
- [ ] Add import for SensitiveData
- [ ] Replace revenue amount
- [ ] Replace any other money displays

**Billing Dashboard:**
- [ ] Add import for SensitiveData
- [ ] Replace Total Amount card
- [ ] Replace Paid Amount card
- [ ] Replace Pending Amount card
- [ ] Replace table bill amounts
- [ ] Replace table paid amounts

---

## 🎬 **Test After Changes:**

1. **Refresh page**
2. **Money amounts should be blurred**
3. **Hover over any amount** → Should tilt in 3D and reveal
4. **Move mouse away** → Should blur again after 8 seconds
5. **Shake mouse rapidly 3 times** → Should lock all amounts with 🔒
6. **Click locked amount** → Should unlock and reveal

---

**Need help finding specific lines? Let me know which file and I'll give you the exact line numbers!** 🚀
