# 🎯 EXACT Lines to Change - BillingDashboard.tsx

## **File:** `src/pages/billing/BillingDashboard.tsx`

---

## **Step 1: Add Import (Line ~6)**

**ADD THIS LINE** after other imports:
```tsx
import { SensitiveData } from '../../components/common/SensitiveData';
```

---

## **Step 2: Replace Line 145**

**FIND Line 145:**
```tsx
{formatCurrency(stats.totalAmount)}
```

**REPLACE WITH:**
```tsx
<SensitiveData value={stats.totalAmount} className="inline" />
```

---

## **Step 3: Replace Line 159**

**FIND Line 159:**
```tsx
{formatCurrency(stats.totalPaid)}
```

**REPLACE WITH:**
```tsx
<SensitiveData value={stats.totalPaid} className="inline" />
```

---

## **Step 4: Replace Line 174**

**FIND Line 174:**
```tsx
{formatCurrency(stats.totalAmount - stats.totalPaid)}
```

**REPLACE WITH:**
```tsx
<SensitiveData value={stats.totalAmount - stats.totalPaid} className="inline" />
```

---

## **Step 5: Table Amounts (around line ~273)**

Let me find the exact line for table amounts...

**Search for:** `{formatCurrency(task.billing.amount)}`

**REPLACE WITH:**
```tsx
<SensitiveData value={task.billing.amount} className="inline font-medium" />
```

---

## ✅ **That's it for Billing Dashboard!**

**Test:**
1. Save file
2. Refresh page
3. All money amounts should be blurred
4. Hover to reveal with 3D tilt effect
5. Shake mouse 3x to lock all

---

**Next: Do you want me to find the exact lines for Dashboard (Home.tsx) too?** 📝
