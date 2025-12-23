import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";

interface Task {
  _id: string;
  title: string;
  serviceType?: string;
  status: string;
  dueDate?: string;
  assessmentYear?: string;
  period?: string;
  client: {
    _id: string;
    name: string;
    code?: string;
    email?: string;
    mobile?: string;
    address?: string;
  };
  billing?: {
    amount: number;
    dueDate: string;
    paymentMode: string;
    paymentStatus: string;
    invoiceNumber: string;
    issuedAt?: string;
    selectedQRCode?: {
      name: string;
      qrImageUrl: string;
      upiId?: string;
    };
    paidAmount: number;
    paidAt?: string;
    transactionId?: string;
    taxAmount?: number;
    discount?: number;
    advance?: {
      isPaid: boolean;
      amount: number;
      receiptNumber?: string;
      paymentMode?: string;
    };
    letterhead?: {
      firmName: string;
      firmSubtitle?: string;
      proprietorName?: string;
      designation?: string;
    };
    paymentHistory?: Array<{
      amount: number;
      mode: string;
      transactionId?: string;
      notes?: string;
      paidAt: string;
    }>;
  };
}

interface QRCode {
  _id: string;
  name: string;
  upiId?: string;
  qrImageUrl: string;
  isActive: boolean;
}

interface Letterhead {
  _id: string;
  firmName: string;
  firmSubtitle?: string;
  proprietorName?: string;
  designation?: string;
  isDefault?: boolean;
}

export default function TaskBilling() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const billRef = useRef<HTMLDivElement>(null);

  const [task, setTask] = useState<Task | null>(null);
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [letterheads, setLetterheads] = useState<Letterhead[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Issue Bill Form (Step 1: Show Bill Preview)
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [amount, setAmount] = useState("");
  const [billDate, setBillDate] = useState("");  // Date shown on invoice
  const [dueDate, setDueDate] = useState("");     // Payment due date (for overdue tracking)
  const [taxAmount, setTaxAmount] = useState("");
  const [discount, setDiscount] = useState("");
  const [selectedLetterhead, setSelectedLetterhead] = useState("");

  // Mark as Paid Form (Step 2: Payment Details)
  const [showPaidForm, setShowPaidForm] = useState(false);
  const [paidAmount, setPaidAmount] = useState("");
  const [paidDate, setPaidDate] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [selectedQR, setSelectedQR] = useState("");

  // Download
  const [downloading, setDownloading] = useState(false);

  // Edit Bill Form
  const [showEditForm, setShowEditForm] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [editBillDate, setEditBillDate] = useState("");  // Bill Date shown on invoice
  const [editDueDate, setEditDueDate] = useState("");    // Payment Due Date
  const [editTaxAmount, setEditTaxAmount] = useState("");
  const [editDiscount, setEditDiscount] = useState("");
const [showQRPreview, setShowQRPreview] = useState(false);
  const fetchTask = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/billing/tasks/${taskId}`, {
        withCredentials: true,
      });
      setTask(res.data.task);

      // Set default dates
          // Set default dates with time
    const today = new Date();
    setBillDate(today.toISOString().slice(0, 16)); // YYYY-MM-DDTHH:mm
    
    // Default payment due date to 7 days from today
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    setDueDate(weekFromNow.toISOString().slice(0, 16)); // YYYY-MM-DDTHH:mm
    } catch (err) {
      console.error("Failed to fetch task", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQRCodes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/billing/settings`, {
        withCredentials: true,
      });
      const activeQRs = res.data.settings.qrCodes?.filter((qr: QRCode) => qr.isActive) || [];
      setQrCodes(activeQRs);
      if (activeQRs.length > 0) {
        setSelectedQR(activeQRs[0]._id);
      }
      
      // Fetch letterheads
      const lhs = res.data.settings.letterheads || [];
      setLetterheads(lhs);
      // Set default letterhead
      const defaultLh = lhs.find((lh: Letterhead) => lh.isDefault) || lhs[0];
      if (defaultLh) {
        setSelectedLetterhead(defaultLh._id);
      }
    } catch (err) {
      console.error("Failed to fetch settings");
    }
  };

  useEffect(() => {
    fetchTask();
    fetchQRCodes();
  }, [taskId]);

  // Calculate totals
  const calculateTotal = () => {
    const base = parseFloat(amount) || 0;
    const tax = parseFloat(taxAmount) || 0;
    const disc = parseFloat(discount) || 0;
    return base + tax - disc;
  };

  const calculateRemaining = () => {
    if (!task?.billing) return 0;
    // Total = base amount + tax - discount
    const base = task.billing.amount || 0;
    const tax = task.billing.taxAmount || 0;
    const disc = task.billing.discount || 0;
    const total = base + tax - disc;
    const advance = task.billing.advance?.amount || 0;
    const paid = task.billing.paidAmount || 0;
    return total - advance - paid;
  };

  // Show preview before issuing
  const handleShowPreview = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    setShowIssueForm(false);
    setShowBillPreview(true);
  };

  // Confirm and issue bill
  const handleIssueBill = async () => {
    try {
      setSubmitting(true);
      
      // Get selected letterhead data
      const selectedLh = letterheads.find(lh => lh._id === selectedLetterhead);

      await axios.patch(
        `${BASE_URL}/api/billing/tasks/${taskId}/issue`,
        {
          amount: parseFloat(amount),
          billDate,      // Date shown on invoice
          dueDate,       // Payment due date
          taxAmount: parseFloat(taxAmount) || 0,
          discount: parseFloat(discount) || 0,
          letterhead: selectedLh ? {
            firmName: selectedLh.firmName,
            firmSubtitle: selectedLh.firmSubtitle,
            proprietorName: selectedLh.proprietorName,
            designation: selectedLh.designation
          } : undefined,
        },
        { withCredentials: true }
      );

      setShowBillPreview(false);
      setShowIssueForm(false);
      fetchTask();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to issue bill");
    } finally {
      setSubmitting(false);
    }
  };

  // Mark as paid with payment mode
  const handleMarkAsPaid = async () => {
    if (!paidAmount || parseFloat(paidAmount) <= 0) {
      alert("Please enter paid amount");
      return;
    }

    try {
      setSubmitting(true);

      const selectedQRData = qrCodes.find((qr) => qr._id === selectedQR);

      await axios.patch(
        `${BASE_URL}/api/billing/tasks/${taskId}/payment`,
        {
          paidAmount: parseFloat(paidAmount),
          paidAt: paidDate || new Date().toISOString(),
          transactionId,
          paymentNotes,
          paymentMode,
          selectedQRCode: paymentMode === "UPI" && selectedQRData ? {
            name: selectedQRData.name,
            qrImageUrl: selectedQRData.qrImageUrl,
            upiId: selectedQRData.upiId,
          } : undefined,
        },
        { withCredentials: true }
      );

      setShowPaidForm(false);
      fetchTask();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to mark as paid");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Bill form with current values
  const openEditForm = () => {
    if (!task?.billing) return;
    setEditAmount(task.billing.amount.toString());
    // Fallback to dueDate if issuedAt doesn't exist (for old bills)
    setEditBillDate((task.billing.issuedAt || task.billing.dueDate).split("T")[0]);  
    setEditDueDate(task.billing.dueDate.split("T")[0]);    
    setEditTaxAmount((task.billing.taxAmount || 0).toString());
    setEditDiscount((task.billing.discount || 0).toString());
    setShowEditForm(true);
  };

  // Handle Edit Bill submission
  const handleEditBill = async () => {
    if (!editAmount || parseFloat(editAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setSubmitting(true);

      await axios.patch(
        `${BASE_URL}/api/billing/tasks/${taskId}/edit`,
        {
          amount: parseFloat(editAmount),
          billDate: editBillDate,      // Bill Date
          dueDate: editDueDate,         // Payment Due Date
          taxAmount: parseFloat(editTaxAmount) || 0,
          discount: parseFloat(editDiscount) || 0,
        },
        { withCredentials: true }
      );

      setShowEditForm(false);
      fetchTask();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to edit bill");
    } finally {
      setSubmitting(false);
    }
  };

  // Download bill using print to PDF
  const handleDownloadBill = () => {
    if (!billRef.current) return;
    
    setDownloading(true);
    
    // Create a new window with just the bill for printing
    const printContent = billRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice - ${task?.billing?.invoiceNumber || 'Draft'}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; }
              .bg-gradient-to-r { background: linear-gradient(to right, #2563eb, #1d4ed8); }
              .text-white { color: white; }
              .text-2xl { font-size: 1.5rem; }
              .font-bold { font-weight: 700; }
              .font-semibold { font-weight: 600; }
              .font-medium { font-weight: 500; }
              .text-sm { font-size: 0.875rem; }
              .text-xs { font-size: 0.75rem; }
              .text-lg { font-size: 1.125rem; }
              .text-xl { font-size: 1.25rem; }
              .p-6 { padding: 1.5rem; }
              .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
              .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
              .px-4 { padding-left: 1rem; padding-right: 1rem; }
              .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
              .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
              .mb-1 { margin-bottom: 0.25rem; }
              .mb-2 { margin-bottom: 0.5rem; }
              .mb-3 { margin-bottom: 0.75rem; }
              .mt-2 { margin-top: 0.5rem; }
              .pt-4 { padding-top: 1rem; }
              .space-y-6 > * + * { margin-top: 1.5rem; }
              .space-y-4 > * + * { margin-top: 1rem; }
              .gap-4 { gap: 1rem; }
              .gap-6 { gap: 1.5rem; }
              .grid { display: grid; }
              .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
              .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
              .text-right { text-align: right; }
              .text-left { text-align: left; }
              .text-center { text-align: center; }
              .uppercase { text-transform: uppercase; }
              .rounded-lg { border-radius: 0.5rem; }
              .rounded-xl { border-radius: 0.75rem; }
              .rounded-full { border-radius: 9999px; }
              .border { border: 1px solid #e5e7eb; }
              .border-t { border-top: 1px solid #e5e7eb; }
              .border-t-2 { border-top: 2px solid #e5e7eb; }
              .overflow-hidden { overflow: hidden; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #e5e7eb; }
              .bg-gray-50 { background-color: #f9fafb; }
              .bg-gray-100 { background-color: #f3f4f6; }
              .bg-green-50 { background-color: #f0fdf4; }
              .bg-green-500 { background-color: #22c55e; }
              .bg-yellow-400 { background-color: #facc15; }
              .bg-red-500 { background-color: #ef4444; }
              .text-gray-500 { color: #6b7280; }
              .text-gray-600 { color: #4b5563; }
              .text-gray-900 { color: #111827; }
              .text-green-600 { color: #16a34a; }
              .text-green-700 { color: #15803d; }
              .text-green-800 { color: #166534; }
              .text-green-900 { color: #14532d; }
              .text-blue-100 { color: #dbeafe; }
              .text-yellow-900 { color: #713f12; }
              .flex { display: flex; }
              .items-center { align-items: center; }
              .justify-between { justify-content: space-between; }
              .mx-auto { margin-left: auto; margin-right: auto; }
              .w-40 { width: 10rem; }
              .h-40 { height: 10rem; }
              .object-contain { object-fit: contain; }
              @media print {
                body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setDownloading(false);
      }, 500);
    } else {
      setDownloading(false);
      alert('Please allow popups to download the invoice.');
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-6">
        <p className="text-red-600">Task not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-2"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Billing - {task.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Client: {task.client.name} {task.client.code && `(${task.client.code})`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!task.billing || task.billing.paymentStatus === "NOT_ISSUED" ? (
            <Button onClick={() => setShowIssueForm(true)}>💰 Issue Bill</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleDownloadBill} disabled={downloading}>
                {downloading ? "Downloading..." : "📥 Download"}
              </Button>
              {task.billing.paymentStatus !== "PAID" && (
                <Button variant="outline" onClick={openEditForm}>
                  ✏️ Edit Bill
                </Button>
              )}
              {task.billing.paymentStatus !== "PAID" && (
                <Button onClick={() => {
                  // Pre-fill remaining amount
                  setPaidAmount(calculateRemaining().toString());
                  setShowPaidForm(true);
                }}>✓ Mark Payment</Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Advance Payment Info */}
      {task.billing?.advance?.isPaid && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💵</span>
            <div>
              <p className="font-semibold text-green-800 dark:text-green-200">
                Advance Received: ₹{task.billing.advance.amount.toLocaleString()}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Receipt: {task.billing.advance.receiptNumber} • Mode: {task.billing.advance.paymentMode?.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bill Display */}
      {task.billing && task.billing.paymentStatus !== "NOT_ISSUED" && (
        <div ref={billRef} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden print:border-0 print:m-0 print:p-0">
          {/* Print-Only CSS for maximum control */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              .print-compact { padding: 10px !important; }
              .print-text-small { font-size: 11px !important; }
              .print-text-medium { font-size: 13px !important; }
              .print-header { border-bottom: 2px solid #333 !important; margin-bottom: 15px !important; }
              .print-right { text-align: right !important; float: right !important; }
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            }
          `}} />

          {/* Combined Header Area */}
          <div className="px-6 py-6 border-b-2 border-gray-100 dark:border-gray-800 print:px-0 print:py-2 print:border-b-4 print:border-blue-900">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              {/* Left Side: Invoice Label */}
              <div className="print:w-1/2">
                <h2 className="text-3xl font-black text-blue-900 dark:text-blue-400 print:text-2xl print:mb-0">INVOICE</h2>
                <p className="text-gray-500 font-bold print:text-sm">{task.billing.invoiceNumber}</p>
                
                <div className="mt-4 print:mt-2">
                   <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase print:border print:border-gray-400 ${
                    task.billing.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {task.billing.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Right Side: Firm Letterhead (TOP RIGHT) */}
              {task.billing.letterhead?.firmName && (
                <div className="text-right flex-1 print:w-1/2">
                  <div className="inline-block text-right">
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white print:text-xl print:text-blue-900">
                      {task.billing.letterhead.firmName}
                    </h1>
                    {task.billing.letterhead.firmSubtitle && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-bold italic print:text-[10px] print:text-gray-700 leading-tight">
                        {task.billing.letterhead.firmSubtitle}
                      </p>
                    )}
                    {task.billing.letterhead.proprietorName && (
                      <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium print:text-[10px] print:text-gray-800">
                        {task.billing.letterhead.designation || 'Proprietor'}: {task.billing.letterhead.proprietorName}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bill Body */}
          <div className="p-6 space-y-4 print:p-2 print:space-y-2">
            {/* Client & Task Info */}
            <div className="grid grid-cols-2 gap-6 print:gap-2">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">BILL TO</p>
                <p className="font-bold text-gray-900 dark:text-white text-base print:text-sm">{task.client.name}</p>
                {task.client.address && <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 print:text-[11px] print:leading-tight">{task.client.address}</p>}
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">DATE</p>
                <p className="text-gray-700 dark:text-gray-300 text-sm print:text-[11px]">Bill Date: <span className="font-semibold text-gray-900">{formatDate(task.billing.issuedAt || task.billing.dueDate)}</span></p>
              </div>
            </div>

            {/* Service Details */}
            <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Description</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t dark:border-gray-700">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                      {task.serviceType && <p className="text-sm text-gray-500">{task.serviceType}</p>}
                      {task.assessmentYear && <p className="text-sm text-gray-500">TY: {task.assessmentYear}</p>}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                      ₹{task.billing.amount.toLocaleString()}
                    </td>
                  </tr>
                  {task.billing.taxAmount !== undefined && task.billing.taxAmount > 0 && (
                    <tr className="border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Tax</td>
                      <td className="px-4 py-2 text-right text-gray-900 dark:text-white">₹{task.billing.taxAmount.toLocaleString()}</td>
                    </tr>
                  )}
                  {task.billing.discount !== undefined && task.billing.discount > 0 && (
                    <tr className="border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Discount</td>
                      <td className="px-4 py-2 text-right text-green-600 dark:text-green-400">-₹{task.billing.discount.toLocaleString()}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  {/* Total Bill */}
                  <tr className="border-t-2 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
                    <td className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">Total Bill</td>
                    <td className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">
                      ₹{((task.billing.amount || 0) + (task.billing.taxAmount || 0) - (task.billing.discount || 0)).toLocaleString()}
                    </td>
                  </tr>
                  
                  {/* Amount Paid (including advance) */}
                  {((task.billing.advance?.amount || 0) + (task.billing.paidAmount || 0)) > 0 && (
                    <tr className="bg-green-50 dark:bg-green-900/20">
                      <td className="px-4 py-2 text-green-700 dark:text-green-400">
                        Amount Paid
                        <span className="text-xs text-green-600 ml-2">
                          {task.billing.advance?.isPaid && `(Adv: ₹${task.billing.advance.amount.toLocaleString()}`}
                          {task.billing.advance?.isPaid && task.billing.paidAmount > 0 && ' + '}
                          {task.billing.paidAmount > 0 && `₹${task.billing.paidAmount.toLocaleString()}`}
                          {task.billing.advance?.isPaid && ')'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-green-600 dark:text-green-400">
                        -₹{((task.billing.advance?.amount || 0) + (task.billing.paidAmount || 0)).toLocaleString()}
                      </td>
                    </tr>
                  )}
                  
                  {/* Balance Due */}
                  <tr className="bg-gray-200 dark:bg-gray-700">
                    <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">Balance Due</td>
                    <td className={`px-4 py-3 text-right font-bold text-xl ${
                      calculateRemaining() === 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {calculateRemaining() === 0 ? '✓ Paid' : `₹${calculateRemaining().toLocaleString()}`}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Payment History */}
            {(task.billing.advance?.isPaid || (task.billing.paymentHistory && task.billing.paymentHistory.length > 0)) && (
              <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 border-b dark:border-gray-700">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                    <span>💰</span> Payment History
                  </h4>
                </div>
                <div className="divide-y dark:divide-gray-700">
                  {/* Advance Payment */}
                  {task.billing.advance?.isPaid && (
                    <div className="px-4 py-3 flex items-center justify-between bg-white dark:bg-gray-900">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Advance Payment</p>
                        <p className="text-xs text-gray-500">
                          {task.billing.advance.receiptNumber} • {task.billing.advance.paymentMode?.replace("_", " ")}
                        </p>
                      </div>
                      <p className="font-semibold text-green-600">₹{task.billing.advance.amount.toLocaleString()}</p>
                    </div>
                  )}
                  
                  {/* Payment History from Array */}
                  {task.billing.paymentHistory?.map((payment, index) => (
                    <div key={index} className="px-4 py-3 flex items-center justify-between bg-white dark:bg-gray-900">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Payment #{index + 1}
                          {payment.mode && payment.mode !== 'NOT_SPECIFIED' && 
                            <span className="text-xs text-gray-500 ml-2">({payment.mode.replace("_", " ")})</span>
                          }
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(payment.paidAt)}
                          {payment.transactionId && ` • Txn: ${payment.transactionId}`}
                        </p>
                      </div>
                      <p className="font-semibold text-green-600">₹{payment.amount.toLocaleString()}</p>
                    </div>
                  ))}
                  
                  {/* Fallback for old payments without history */}
                  {!task.billing.paymentHistory?.length && task.billing.paidAmount > 0 && (
                    <div className="px-4 py-3 flex items-center justify-between bg-white dark:bg-gray-900">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Payment Received</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(task.billing.paidAt)} • {task.billing.paymentMode?.replace("_", " ")}
                          {task.billing.transactionId && ` • ${task.billing.transactionId}`}
                        </p>
                      </div>
                      <p className="font-semibold text-green-600">₹{task.billing.paidAmount.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* QR Code for unpaid */}
            {task.billing.selectedQRCode && task.billing.paymentStatus !== "PAID" && (
              <div className="text-center pt-4 border-t dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Scan to Pay</p>
                <img
                  src={`${BASE_URL}${task.billing.selectedQRCode.qrImageUrl}`}
                  alt={task.billing.selectedQRCode.name}
                  className="w-40 h-40 mx-auto object-contain bg-white rounded-lg border cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setShowQRPreview(true)}
                />
                {task.billing.selectedQRCode.upiId && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    UPI: {task.billing.selectedQRCode.upiId}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">Click to enlarge</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Bill Issued */}
      {(!task.billing || task.billing.paymentStatus === "NOT_ISSUED") && (
        <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">💳</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Bill Issued
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Issue a bill to track payment for this task
          </p>
          <Button onClick={() => setShowIssueForm(true)}>💰 Issue Bill</Button>
        </div>
      )}

      {/* Issue Bill Modal - Step 1 */}
      {showIssueForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100000] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Issue Bill
            </h2>

            <div className="space-y-4">
              {/* Letterhead Selection - Always show */}
              <div>
                <Label>Invoice Header / Firm (Optional)</Label>
                {letterheads.length > 0 ? (
                  <select
                    value={selectedLetterhead}
                    onChange={(e) => setSelectedLetterhead(e.target.value)}
                    className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4"
                  >
                    <option value="">No Firm Header (Default)</option>
                    {letterheads.map((lh) => (
                      <option key={lh._id} value={lh._id}>
                        {lh.firmName} {lh.proprietorName ? `(${lh.designation || 'Proprietor'} ${lh.proprietorName})` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    No letterheads added. Go to <span className="font-medium text-blue-600">Billing → Payment Settings</span> to add your firm name.
                  </div>
                )}
              </div>
              
              <div>
                <Label>Amount (₹) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Bill Date <span className="text-red-500">*</span></Label>
                  <Input
                    type="datetime-local"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Date shown on invoice</p>
                </div>
                
                <div>
                  <Label>Payment Due Date <span className="text-red-500">*</span></Label>
                  <Input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">For overdue tracking</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tax Amount</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Discount</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>
              </div>

              {/* Total Preview */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Amount</span>
                  <span>₹{(parseFloat(amount) || 0).toLocaleString()}</span>
                </div>
                {(parseFloat(taxAmount) || 0) > 0 && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600 dark:text-gray-400">Tax</span>
                    <span>₹{(parseFloat(taxAmount) || 0).toLocaleString()}</span>
                  </div>
                )}
                {(parseFloat(discount) || 0) > 0 && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600 dark:text-gray-400">Discount</span>
                    <span className="text-green-600">-₹{(parseFloat(discount) || 0).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm mt-1 pt-1 border-t dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Subtotal</span>
                  <span className="font-medium">₹{calculateTotal().toLocaleString()}</span>
                </div>
                {task.billing?.advance?.isPaid && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-green-600 dark:text-green-400">Advance Paid</span>
                    <span className="text-green-600">-₹{task.billing.advance.amount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t dark:border-gray-700">
                  <span>Total Due</span>
                  <span>₹{(calculateTotal() - (task.billing?.advance?.amount || 0)).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleShowPreview}>
                  Preview Bill
                </Button>
                <Button variant="outline" onClick={() => setShowIssueForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bill Preview Modal - Step 2 */}
      {showBillPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100000] p-4 overflow-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full my-8">
            {/* Letterhead Section - Above Preview Header */}
            {(() => {
              const selectedLh = letterheads.find(lh => lh._id === selectedLetterhead);
              return selectedLh ? (
                <div className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 px-6 py-6 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-xl px-8 py-4 shadow-lg max-w-md text-right">
                      <h1 className="text-2xl font-bold leading-tight">
                        {selectedLh.firmName}
                      </h1>
                      {selectedLh.proprietorName && (
                        <p className="text-sm text-blue-100 mt-2">
                          {selectedLh.designation || 'Proprietor'} {selectedLh.proprietorName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
            
            {/* Preview Header */}
            <div className={`bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white ${!letterheads.find(lh => lh._id === selectedLetterhead) ? 'rounded-t-xl' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">INVOICE PREVIEW</h2>
                  <p className="text-blue-100">Will be generated on confirmation</p>
                </div>
                <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-semibold">
                  DRAFT
                </span>
              </div>
            </div>

            {/* Preview Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Bill To</p>
                  <p className="font-semibold">{task.client.name}</p>
                  {task.client.code && <p className="text-sm text-gray-600">{task.client.code}</p>}
                  {task.client.address && <p className="text-sm text-gray-500 mt-1">{task.client.address}</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase">Bill Date</p>
                  <p className="font-semibold">{formatDate(billDate)}</p>
                </div>
              </div>

              <table className="w-full border dark:border-gray-700 rounded-lg overflow-hidden">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm">Description</th>
                    <th className="px-4 py-2 text-right text-sm">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t dark:border-gray-700">
                    <td className="px-4 py-3">{task.title}</td>
                    <td className="px-4 py-3 text-right">₹{(parseFloat(amount) || 0).toLocaleString()}</td>
                  </tr>
                  {taxAmount && parseFloat(taxAmount) > 0 && (
                    <tr className="border-t dark:border-gray-700">
                      <td className="px-4 py-2 text-gray-600">Tax</td>
                      <td className="px-4 py-2 text-right">₹{parseFloat(taxAmount).toLocaleString()}</td>
                    </tr>
                  )}
                  {discount && parseFloat(discount) > 0 && (
                    <tr className="border-t dark:border-gray-700">
                      <td className="px-4 py-2 text-gray-600">Discount</td>
                      <td className="px-4 py-2 text-right text-green-600">-₹{parseFloat(discount).toLocaleString()}</td>
                    </tr>
                  )}
                  {task.billing?.advance?.isPaid && (
                    <tr className="border-t dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
                      <td className="px-4 py-2 text-green-700">Advance Paid</td>
                      <td className="px-4 py-2 text-right text-green-600">-₹{task.billing.advance.amount.toLocaleString()}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 bg-gray-100 dark:bg-gray-800">
                    <td className="px-4 py-3 font-bold">Total Due</td>
                    <td className="px-4 py-3 text-right font-bold text-xl">
                      ₹{(calculateTotal() - (task.billing?.advance?.amount || 0)).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleIssueBill} disabled={submitting}>
                  {submitting ? "Issuing..." : "✓ Confirm & Issue Bill"}
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowBillPreview(false);
                  setShowIssueForm(true);
                }}>
                  ← Edit
                </Button>
                <Button variant="outline" onClick={() => setShowBillPreview(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Paid Modal */}
      {showPaidForm && task.billing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100000] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Record Payment
            </h2>

            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Bill Amount</span>
                  <span>₹{task.billing.amount.toLocaleString()}</span>
                </div>
                {task.billing.taxAmount !== undefined && task.billing.taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>₹{task.billing.taxAmount.toLocaleString()}</span>
                  </div>
                )}
                {task.billing.discount !== undefined && task.billing.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{task.billing.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-1 border-t border-blue-200 dark:border-blue-800">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-medium">
                    ₹{((task.billing.amount || 0) + (task.billing.taxAmount || 0) - (task.billing.discount || 0)).toLocaleString()}
                  </span>
                </div>
                {task.billing.advance?.isPaid && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-green-600">Advance Paid</span>
                    <span className="text-green-600">-₹{task.billing.advance.amount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                  <span>Remaining</span>
                  <span>₹{calculateRemaining().toLocaleString()}</span>
                </div>
              </div>

              <div>
                <Label>Amount Received <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  placeholder={calculateRemaining().toString()}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                />
              </div>

              <div>
                <Label>Payment Mode <span className="text-red-500">*</span></Label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4"
                >
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              {paymentMode === "UPI" && qrCodes.length > 0 && (
                <div>
                  <Label>QR Code Used</Label>
                  <select
                    value={selectedQR}
                    onChange={(e) => setSelectedQR(e.target.value)}
                    className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4"
                  >
                    {qrCodes.map((qr) => (
                      <option key={qr._id} value={qr._id}>
                        {qr.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <Label>Payment Date</Label>
                <Input
                  type="datetime-local"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                />
              </div>

              <div>
                <Label>Transaction ID</Label>
                <Input
                  placeholder="TXN123456789"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>

              <div>
                <Label>Notes</Label>
                <textarea
                  placeholder="Payment notes..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleMarkAsPaid} disabled={submitting}>
                  {submitting ? "Saving..." : "Confirm Payment"}
                </Button>
                <Button variant="outline" onClick={() => setShowPaidForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bill Modal */}
      {showEditForm && task?.billing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100000] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Edit Bill
            </h2>

            <div className="space-y-4">
              <div>
                <Label>Amount (₹) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Bill Date</Label>
                  <Input
                    type="date"
                    value={editBillDate}
                    onChange={(e) => setEditBillDate(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Shown on invoice</p>
                </div>
                
                <div>
                  <Label>Payment Due Date</Label>
                  <Input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">For overdue tracking</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tax Amount</Label>
                  <Input
                    type="number"
                    value={editTaxAmount}
                    onChange={(e) => setEditTaxAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Discount</Label>
                  <Input
                    type="number"
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  Invoice: <span className="font-semibold text-gray-900 dark:text-white">{task.billing.invoiceNumber}</span>
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  Note: Invoice number cannot be changed
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleEditBill} disabled={submitting}>
                  {submitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setShowEditForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Preview Modal */}
      {showQRPreview && task?.billing?.selectedQRCode && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[999999] p-4"
          onClick={() => setShowQRPreview(false)}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {task.billing.selectedQRCode.name}
              </h3>
              <button 
                onClick={() => setShowQRPreview(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                &times;
              </button>
            </div>
            <img
              src={`${BASE_URL}${task.billing.selectedQRCode.qrImageUrl}`}
              alt={task.billing.selectedQRCode.name}
              className="w-full h-auto mx-auto object-contain bg-white rounded-lg"
            />
            {task.billing.selectedQRCode.upiId && (
              <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
                UPI ID: <span className="font-mono font-semibold">{task.billing.selectedQRCode.upiId}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
