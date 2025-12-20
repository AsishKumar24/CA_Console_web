import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";

interface Task {
  _id: string;
  title: string;
  status: string;
  client: {
    _id: string;
    name: string;
    code?: string;
    email?: string;
  };
  billing?: {
    amount: number;
    dueDate: string;
    paymentMode: string;
    paymentStatus: string;
    invoiceNumber: string;
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
  };
}

interface QRCode {
  _id: string;
  name: string;
  upiId?: string;
  qrImageUrl: string;
  isActive: boolean;
}

export default function TaskBilling() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Issue Bill Form
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [selectedQR, setSelectedQR] = useState("");
  const [taxAmount, setTaxAmount] = useState("");
  const [discount, setDiscount] = useState("");

  // Mark as Paid Form
  const [showPaidForm, setShowPaidForm] = useState(false);
  const [paidAmount, setPaidAmount] = useState("");
  const [paidDate, setPaidDate] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  // QR Code Preview
  const [showQRPreview, setShowQRPreview] = useState(false);
  const [previewQR, setPreviewQR] = useState<{name: string; url: string; upiId?: string} | null>(null);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/billing/tasks/${taskId}`, {
        withCredentials: true,
      });
      setTask(res.data.task);

      // Set default due date to 30 days from now
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 30);
      setDueDate(defaultDueDate.toISOString().split("T")[0]);
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
      const activeQRs = res.data.settings.qrCodes.filter((qr: QRCode) => qr.isActive);
      setQrCodes(activeQRs);
      if (activeQRs.length > 0) {
        setSelectedQR(activeQRs[0]._id);
      }
    } catch (err) {
      console.error("Failed to fetch QR codes");
    }
  };

  useEffect(() => {
    fetchTask();
    fetchQRCodes();
  }, [taskId]);

  const handleIssueBill = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setSubmitting(true);

      const selectedQRData = qrCodes.find((qr) => qr._id === selectedQR);

      await axios.patch(
        `${BASE_URL}/api/billing/tasks/${taskId}/issue`,
        {
          amount: parseFloat(amount),
          dueDate,
          paymentMode,
          selectedQRCode: paymentMode === "UPI" && selectedQRData ? {
            name: selectedQRData.name,
            qrImageUrl: selectedQRData.qrImageUrl,
            upiId: selectedQRData.upiId,
          } : null,
          taxAmount: parseFloat(taxAmount) || 0,
          discount: parseFloat(discount) || 0,
        },
        { withCredentials: true }
      );

      setShowIssueForm(false);
      fetchTask();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to issue bill");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!paidAmount || parseFloat(paidAmount) <= 0) {
      alert("Please enter paid amount");
      return;
    }

    try {
      setSubmitting(true);

      await axios.patch(
        `${BASE_URL}/api/billing/tasks/${taskId}/payment`,
        {
          paidAmount: parseFloat(paidAmount),
          paidAt: paidDate || new Date().toISOString(),
          transactionId,
          paymentNotes,
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

  const statusColors = {
    NOT_ISSUED: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    UNPAID: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300",
    PAID: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300",
    OVERDUE: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300",
    PARTIALLY_PAID: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  };

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
        {!task.billing || task.billing.paymentStatus === "NOT_ISSUED" ? (
          <Button onClick={() => setShowIssueForm(true)}>💰 Issue Bill</Button>
        ) : task.billing.paymentStatus !== "PAID" ? (
          <Button onClick={() => setShowPaidForm(true)}>✓ Mark as Paid</Button>
        ) : null}
      </div>

      {/* Bill Status */}
      {task.billing && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Bill Details
            </h2>
            <span
              className={`px-3 py-1 text-sm rounded-full font-medium ${
                statusColors[task.billing.paymentStatus as keyof typeof statusColors]
              }`}
            >
              {task.billing.paymentStatus.replace("_", " ")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Invoice Number</p>
              <p className="text-gray-900 dark:text-white font-medium">{task.billing.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
              <p className="text-gray-900 dark:text-white font-medium">₹{task.billing.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Due Date</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {new Date(task.billing.dueDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Payment Mode</p>
              <p className="text-gray-900 dark:text-white font-medium">{task.billing.paymentMode}</p>
            </div>
          </div>

          {/* QR Code Display */}
          {task.billing.selectedQRCode && task.billing.paymentStatus !== "PAID" && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Scan to Pay - {task.billing.selectedQRCode.name}
              </h3>
              <div className="flex flex-col items-center">
                <img
                  src={`${BASE_URL}${task.billing.selectedQRCode.qrImageUrl}`}
                  alt={task.billing.selectedQRCode.name}
                  onClick={() => {
                    setPreviewQR({
                      name: task.billing!.selectedQRCode!.name,
                      url: task.billing!.selectedQRCode!.qrImageUrl,
                      upiId: task.billing!.selectedQRCode!.upiId
                    });
                    setShowQRPreview(true);
                  }}
                  className="w-64 h-64 object-contain bg-white rounded-lg cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                  title="Click to enlarge"
                />
                {task.billing.selectedQRCode.upiId && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    UPI ID: {task.billing.selectedQRCode.upiId}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Click image to enlarge</p>
              </div>
            </div>
          )}

          {/* Payment Info */}
          {task.billing.paymentStatus === "PAID" && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                ✓ Payment Received
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-green-700 dark:text-green-400">Amount Paid</p>
                  <p className="text-green-900 dark:text-green-200 font-medium">
                    ₹{task.billing.paidAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-green-700 dark:text-green-400">Payment Date</p>
                  <p className="text-green-900 dark:text-green-200 font-medium">
                    {task.billing.paidAt && new Date(task.billing.paidAt).toLocaleDateString()}
                  </p>
                </div>
                {task.billing.transactionId && (
                  <div className="col-span-2">
                    <p className="text-green-700 dark:text-green-400">Transaction ID</p>
                    <p className="text-green-900 dark:text-green-200 font-medium">
                      {task.billing.transactionId}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
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
            Issue a bill for this task to track payment
          </p>
          <Button onClick={() => setShowIssueForm(true)}>💰 Issue Bill</Button>
        </div>
      )}

      {/* Issue Bill Modal */}
      {showIssueForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100000] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Issue Bill
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    placeholder="5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Due Date <span className="text-red-500">*</span></Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
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

              <div>
                <Label>Payment Mode <span className="text-red-500">*</span></Label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4"
                >
                  <option value="UPI">UPI (QR Code)</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              {paymentMode === "UPI" && qrCodes.length > 0 && (
                <div>
                  <Label>Select QR Code</Label>
                  <select
                    value={selectedQR}
                    onChange={(e) => setSelectedQR(e.target.value)}
                    className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4"
                  >
                    {qrCodes.map((qr) => (
                      <option key={qr._id} value={qr._id}>
                        {qr.name} {qr.upiId && `- ${qr.upiId}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {paymentMode === "UPI" && qrCodes.length === 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    ⚠️ No active QR codes found. Please add one in Payment Settings first.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button onClick={handleIssueBill} disabled={submitting}>
                  {submitting ? "Issuing..." : "Issue Bill"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowIssueForm(false)}
                >
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
              Mark as Paid
            </h2>

            <div className="space-y-4">
              <div>
                <Label>Amount Paid <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  placeholder={task.billing.amount.toString()}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Bill Amount: ₹{task.billing.amount.toLocaleString()}
                </p>
              </div>

              <div>
                <Label>Payment Date & Time</Label>
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
                  className="w-full min-h-[80px] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleMarkAsPaid} disabled={submitting}>
                  {submitting ? "Saving..." : "Mark as Paid"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPaidForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Preview Modal */}
      {showQRPreview && previewQR && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100001] p-4"
          onClick={() => setShowQRPreview(false)}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {previewQR.name}
              </h2>
              <button
                onClick={() => setShowQRPreview(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="flex flex-col items-center">
              <img
                src={`${BASE_URL}${previewQR.url}`}
                alt={previewQR.name}
                className="max-w-full h-auto max-h-[70vh] object-contain bg-white rounded-lg"
              />
              {previewQR.upiId && (
                <p className="text-gray-600 dark:text-gray-400 mt-4">
                  UPI ID: <span className="font-mono font-semibold">{previewQR.upiId}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
