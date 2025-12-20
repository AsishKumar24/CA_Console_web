# 💰 Billing System - Backend Implementation Complete!

## 📋 What Was Created

### **1. Models**

#### **Task.js** (Updated)
Added comprehensive `billing` section with:
- Amount, currency, due date
- Payment mode (UPI, Bank Transfer, Cash, Cheque)
- Selected QR code details
- Payment status tracking
- Transaction details
- Invoice information
- Tax and discount fields

#### **PaymentSettings.js** (New)
Created for managing:
- Multiple QR codes (name, UPI ID, image URL)
- Multiple bank accounts
- Invoice numbering system
- Tax configuration

---

### **2. Controller** - `billingController.js`

#### **Payment Settings APIs:**
| Function | Description |
|----------|-------------|
| `getPaymentSettings` | Get all QR codes & bank accounts |
| `addQRCode` | Add new QR code |
| `updateQRCode` | Update existing QR code |
| `deleteQRCode` | Remove QR code |
| `addBankAccount` | Add bank account details |

#### **Billing Operations APIs:**
| Function | Description |
|----------|-------------|
| `issueBill` | Issue bill for a task |
| `markAsPaid` | Record payment received |
| `getBillingDashboard` | Get all bills with stats |
| `getTaskBilling` | Get billing for specific task |

---

### **3. Routes** - `billingRoutes.js`

All routes require **authentication** and most require **admin** role.

---

## 🚀 API Endpoints

### **Base URL:** `/api/billing`

### **Payment Settings**

#### 1. Get Payment Settings
```http
GET /api/billing/settings
Headers: { Cookie: auth_token }
Access: Admin only
```

**Response:**
```json
{
  "success": true,
  "settings": {
    "qrCodes": [
      {
        "_id": "...",
        "name": "HDFC Business Account",
        "upiId": "business@hdfc",
        "qrImageUrl": "/uploads/qr/hdfc.png",
        "isActive": true
      }
    ],
    "bankAccounts": [...],
    "invoicePrefix": "INV",
    "nextInvoiceNumber": 1
  }
}
```

#### 2. Add QR Code
```http
POST /api/billing/settings/qr
Headers: { Cookie: auth_token }
Access: Admin only

Body:
{
  "name": "HDFC Business UPI",
  "upiId": "business@hdfc",
  "qrImageUrl": "/uploads/qr-codes/hdfc-qr.png"
}
```

#### 3. Update QR Code
```http
PATCH /api/billing/settings/qr/:qrId
Headers: { Cookie: auth_token }
Access: Admin only

Body:
{
  "name": "Updated Name",
  "isActive": false
}
```

#### 4. Delete QR Code
```http
DELETE /api/billing/settings/qr/:qrId
Headers: { Cookie: auth_token }
Access: Admin only
```

#### 5. Add Bank Account
```http
POST /api/billing/settings/bank
Headers: { Cookie: auth_token }
Access: Admin only

Body:
{
  "name": "HDFC Current Account",
  "accountNumber": "123456789",
  "ifscCode": "HDFC0001234",
  "accountHolderName": "CA Firm Name",
  "bankName": "HDFC Bank",
  "branch": "Mumbai Main"
}
```

---

### **Billing Operations**

#### 1. Issue Bill for Task
```http
PATCH /api/billing/tasks/:taskId/issue
Headers: { Cookie: auth_token }
Access: Admin only

Body:
{
  "amount": 5000,
  "dueDate": "2025-01-15",
  "paymentMode": "UPI",
  "selectedQRCode": {
    "name": "HDFC Business",
    "qrImageUrl": "/uploads/qr/hdfc.png",
    "upiId": "business@hdfc"
  },
  "taxAmount": 900,
  "discount": 0
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bill issued successfully",
  "task": {
    "_id": "...",
    "title": "Tax Filing - Client ABC",
    "billing": {
      "amount": 5000,
      "paymentStatus": "UNPAID",
      "invoiceNumber": "INV-00001",
      "dueDate": "2025-01-15",
      "paymentMode": "UPI",
      "selectedQRCode": { ... },
      "issuedAt": "2025-12-20T07:00:00.000Z",
      "issuedBy": { ... }
    }
  }
}
```

#### 2. Mark as Paid
```http
PATCH /api/billing/tasks/:taskId/payment
Headers: { Cookie: auth_token }
Access: Admin only

Body:
{
  "paidAmount": 5000,
  "paidAt": "2025-12-20",
  "transactionId": "TXN123456789",
  "paymentNotes": "Received via HDFC UPI"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment recorded successfully (PAID)",
  "task": {
    "billing": {
      "paymentStatus": "PAID",
      "paidAmount": 5000,
      "paidAt": "2025-12-20",
      "transactionId": "TXN123456789"
    }
  }
}
```

#### 3. Get Billing Dashboard
```http
GET /api/billing/dashboard?status=UNPAID&fromDate=2025-01-01
Headers: { Cookie: auth_token }
Access: Admin only

Query Params:
- status: ALL | UNPAID | PAID | OVERDUE | PARTIALLY_PAID
- clientId: Filter by client
- fromDate: Start date
- toDate: End date
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalBills": 50,
    "totalAmount": 250000,
    "totalPaid": 180000,
    "unpaid": 15,
    "paid": 30,
    "overdue": 5,
    "partiallyPaid": 0
  },
  "tasks": [
    {
      "_id": "...",
      "title": "GST Filing",
      "client": { "name": "Client ABC", "code": "C001" },
      "billing": {
        "amount": 5000,
        "paymentStatus": "UNPAID",
        "invoiceNumber": "INV-00001",
        "dueDate": "2025-01-15"
      }
    }
  ]
}
```

#### 4. Get Task Billing Details
```http
GET /api/billing/tasks/:taskId
Headers: { Cookie: auth_token }
Access: Admin only
```

---

## 📊 Database Schema

### **Task Model - Billing Section**
```javascript
billing: {
  amount: Number,              // Bill amount
  currency: String,            // Default: 'INR'
  dueDate: Date,              // Payment due date
  
  paymentMode: String,        // UPI | BANK_TRANSFER | CASH | CHEQUE
  selectedQRCode: {           // If UPI selected
    name: String,
    qrImageUrl: String,
    upiId: String
  },
  
  paymentStatus: String,      // NOT_ISSUED | UNPAID | PAID | OVERDUE | PARTIALLY_PAID
  
  paidAmount: Number,         // Actual amount received
  paidAt: Date,              // Payment date
  transactionId: String,      // Transaction reference
  paymentNotes: String,       // Additional notes
  
  issuedBy: ObjectId,         // Admin who issued
  issuedAt: Date,            // Bill issue date
  
  invoiceNumber: String,      // Auto-generated
  taxAmount: Number,          // Tax if applicable
  discount: Number            // Discount if any
}
```

### **PaymentSettings Model**
```javascript
{
  adminId: ObjectId,          // One settings per admin
  qrCodes: [
    {
      name: String,
      upiId: String,
      qrImageUrl: String,
      isActive: Boolean
    }
  ],
  bankAccounts: [
    {
      name: String,
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String,
      bankName: String,
      branch: String,
      isActive: Boolean
    }
  ],
  invoicePrefix: String,      // Default: 'INV'
  nextInvoiceNumber: Number   // Auto-increment
}
```

---

## ✅ Payment Status Flow

```
NOT_ISSUED → UNPAID → PAID
                ↓
            OVERDUE (if past due date)
                ↓
         PARTIALLY_PAID (if partial payment)
                ↓
              PAID
```

---

## 🎯 Key Features

✅ **Multiple QR Codes** - Store 2-3 UPI QR codes  
✅ **Payment Mode Selection** - UPI, Bank, Cash, Cheque  
✅ **Auto Invoice Numbering** - Sequential invoice generation  
✅ **Payment Tracking** - Full transaction details  
✅ **Overdue Detection** - Automatic overdue status  
✅ **Partial Payments** - Support for installments  
✅ **Archived Task Billing** - Track unpaid archived tasks  
✅ **Dashboard Analytics** - Complete billing overview  
✅ **Tax & Discount** - Built-in tax and discount fields  

---

## 🔒 Security

- All routes require authentication
- Admin-only access for all billing operations
- Mongoose ObjectId validation
- Input validation on amount fields

---

## 📝 Next Steps - Frontend

Now you can build:
1. **Payment Settings Page** - Upload/manage QR codes
2. **Issue Bill Modal** - In TaskDetails page
3. **Billing Dashboard** - View all bills, filter, search
4. **Mark as Paid Modal** - Record payments

---

## 🧪 Testing the API

Use Postman or curl to test:

```bash
# 1. Add QR Code
curl -X POST http://localhost:3000/api/billing/settings/qr \
  -H "Content-Type: application/json" \
  -d '{
    "name": "HDFC Business",
    "upiId": "business@hdfc",
    "qrImageUrl": "/uploads/qr/hdfc.png"
  }'

# 2. Issue Bill
curl -X PATCH http://localhost:3000/api/billing/tasks/TASK_ID/issue \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "paymentMode": "UPI"
  }'

# 3. Get Dashboard
curl http://localhost:3000/api/billing/dashboard
```

---

**Backend is ready! 🚀 Let's build the frontend next!**
