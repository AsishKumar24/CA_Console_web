# 📅 Tomorrow's Implementation Roadmap

## 🎯 **Features to Implement (Dec 20, 2025)**

### **1. Auto-Archive Cron Job** ⏰
### **2. Task Summary/Analytics** 📊
### **3. Due Date Reminders** 🔔
### **4. Billing System** 💰

---

## 1️⃣ **Auto-Archive Cron Job**

### **What It Does:**
Automatically archives completed tasks after 7 days to keep boards clean.

### **Backend Implementation:**

#### **Step 1: Install Dependencies**
```bash
npm install node-cron
```

#### **Step 2: Create Cron Job File**
**File:** `backend/jobs/autoArchive.js`

```javascript
const cron = require('node-cron');
const Task = require('../models/Task');

// Run daily at midnight (00:00)
function startAutoArchiveCron() {
  cron.schedule('0 0 * * *', async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      console.log('🤖 Running auto-archive job...');
      console.log('📅 Archiving tasks completed before:', sevenDaysAgo);
      
      const result = await Task.updateMany(
        {
          status: 'COMPLETED',
          isArchived: false,
          completedAt: { $lt: sevenDaysAgo }
        },
        {
          $set: {
            isArchived: true,
            archivedAt: new Date(),
            autoArchived: true
          }
        }
      );
      
      console.log(`✅ Auto-archived ${result.modifiedCount} completed tasks`);
      
    } catch (error) {
      console.error('❌ Auto-archive cron failed:', error);
    }
  });
  
  console.log('🤖 Auto-archive cron job started (runs daily at midnight)');
}

module.exports = { startAutoArchiveCron };
```

#### **Step 3: Update server.js**
```javascript
const { startAutoArchiveCron } = require('./jobs/autoArchive');

// Start cron jobs
startAutoArchiveCron();

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log('🤖 Auto-archive cron job active');
});
```

---

## 2️⃣ **Task Summary/Analytics**

### **Backend Routes (Already Exist!):**
```javascript
GET /api/tasks/summary/staff  ← Staff summary
GET /api/tasks/summary/admin  ← Admin summary
```

### **Implementation Code:**

See `COMPLETE_BACKEND_ROUTES_GUIDE.md` for complete controller implementation.

### **Frontend Dashboard Widget:**
Create `src/components/dashboard/TaskSummaryWidget.tsx` with stats cards.

---

## 3️⃣ **Due Date Reminders**

### **Cron Job:**
Runs daily at 9 AM, sends email reminders for due/overdue tasks.

**File:** `backend/jobs/reminders.js`

---

## 4️⃣ **Billing System**

### **Backend:**
- Add billing fields to Task model
- Create billing routes
- Implement payment tracking

### **Frontend:**
- Create TaskBilling page
- Add billing button in TaskDetails
- Payment recording UI

---

## ✅ **Implementation Checklist**

### **Morning:**
- [ ] Auto-archive cron
- [ ] Summary endpoints
- [ ] Dashboard widgets

### **Afternoon:**
- [ ] Reminder cron
- [ ] Billing backend
- [ ] Billing frontend

### **Evening:**
- [ ] Testing
- [ ] Documentation

---

**Ready to implement tomorrow! 🚀**

Check `.gemini/` folder for all detailed implementation guides created today.
