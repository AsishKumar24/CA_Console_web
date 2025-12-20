# ✅ QR Code Upload - Backend Complete!

## What Was Added:

### 1. **File Upload Middleware**
**File:** `src/middleware/upload.js`
- Uses `multer` for file uploads
- Validates image files only (jpeg, jpg, png, gif, webp)
- 5MB size limit
- Saves to `uploads/qr-codes/` directory
- Unique filename generation

### 2. **Upload Endpoint**
**Route:** `POST /api/billing/upload/qr`
**Access:** Admin only
**Request:** Form-data with field name `qrImage`
**Response:**
```json
{
  "success": true,
  "message": "QR code uploaded successfully",
  "fileUrl": "/uploads/qr-codes/qr-1234567890-123456789.png",
  "filename": "qr-1234567890-123456789.png"
}
```

### 3. **Static File Serving**
**File:** `src/app.js`
- Serves uploaded files at `/uploads/*`
- QR codes accessible at `http://localhost:3000/uploads/qr-codes/filename.png`

---

## Complete Workflow:

### **1. Admin Uploads QR Code Image**
```bash
POST /api/billing/upload/qr
Content-Type: multipart/form-data
Body: qrImage=<file>

Response: { fileUrl: "/uploads/qr-codes/qr-xxx.png" }
```

### **2. Admin Saves QR Code  to Settings**
```bash
POST /api/billing/settings/qr
Body: {
  "name": "HDFC Business UPI",
  "upiId": "business@hdfc",
  "qrImageUrl": "/uploads/qr-codes/qr-xxx.png"  ← Use URL from step 1
}
```

### **3. Frontend Displays QR Code**
```html
<img src="http://localhost:3000/uploads/qr-codes/qr-xxx.png" />
```

---

## Backend API Summary:

### File Upload:
- ✅ `POST /api/billing/upload/qr` - Upload QR image

### QR Code Management:
- ✅ `GET /api/billing/settings` - Get all QR codes
- ✅ `POST /api/billing/settings/qr` - Add QR code (with URL)
- ✅ `PATCH /api/billing/settings/qr/:id` - Update QR code
- ✅ `DELETE /api/billing/settings/qr/:id` - Delete QR code

### Billing Operations:
- ✅ `PATCH /api/billing/tasks/:id/issue` - Issue bill (select QR)
- ✅ `PATCH /api/billing/tasks/:id/payment` - Mark as paid
- ✅ `GET /api/billing/dashboard` - All bills with stats
- ✅ `GET /api/billing/tasks/:id` - Get task billing

---

## Frontend TODO:

Now you can build the Payment Settings page with:

1. **File Upload Component**
   - Use `<input type="file" accept="image/*" />`
   - Upload to `POST /api/billing/upload/qr`
   - Get back `fileUrl`

2. **Save QR Code**
   - Form with: name, UPI ID
   - Use `fileUrl` from upload
   - POST to `/api/billing/settings/qr`

3. **Display QR Codes**
   - Fetch from `/api/billing/settings`
   - Display images using returned URLs
   - Edit/delete functionality

---

## Testing the Upload:

### Using Postman or curl:
```bash
curl -X POST http://localhost:3000/api/billing/upload/qr \
  -H "Cookie: your-auth-cookie" \
  -F "qrImage=@/path/to/your/qr-code.png"
```

**Response:**
```json
{
  "success": true,
  "fileUrl": "/uploads/qr-codes/qr-1703045678-987654321.png"
}
```

---

**Backend is 100% ready for file uploads!** 🎉
**Now build the frontend Payment Settings page!** 🚀
