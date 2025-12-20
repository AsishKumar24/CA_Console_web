import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";

interface QRCode {
  _id: string;
  name: string;
  upiId?: string;
  qrImageUrl: string;
  isActive: boolean;
}

interface PaymentSettings {
  _id: string;
  qrCodes: QRCode[];
}

export default function PaymentSettings() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // New QR Code form
  const [showAddForm, setShowAddForm] = useState(false);
  const [qrName, setQrName] = useState("");
  const [qrUpiId, setQrUpiId] = useState("");
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/billing/settings`, {
        withCredentials: true,
      });
      setSettings(res.data.settings);
    } catch (err) {
      console.error("Failed to fetch payment settings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddQRCode = async () => {
    if (!qrFile || !qrName) {
      setError("Please provide QR code name and image");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setUploading(true);

      // 1. Upload image
      const formData = new FormData();
      formData.append("qrImage", qrFile);

      const uploadRes = await axios.post(
        `${BASE_URL}/api/billing/upload/qr`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const qrImageUrl = uploadRes.data.fileUrl;

      // 2. Save QR code
      setSaving(true);
      await axios.post(
        `${BASE_URL}/api/billing/settings/qr`,
        {
          name: qrName,
          upiId: qrUpiId,
          qrImageUrl,
        },
        { withCredentials: true }
      );

      // Reset form
      setQrName("");
      setQrUpiId("");
      setQrFile(null);
      setQrPreview("");
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
      setShowAddForm(false);
      setSuccess("QR code added successfully!");

      // Refresh settings
      fetchSettings();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Failed to add QR code", err);
      setError(err?.response?.data?.error || "Failed to add QR code");
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  const handleDeleteQR = async (qrId: string) => {
    if (!window.confirm("Delete this QR code?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/billing/settings/qr/${qrId}`, {
        withCredentials: true,
      });
      fetchSettings();
    } catch (err) {
      console.error("Failed to delete QR code", err);
      alert("Failed to delete QR code");
    }
  };

  const handleToggleActive = async (qr: QRCode) => {
    try {
      await axios.patch(
        `${BASE_URL}/api/billing/settings/qr/${qr._id}`,
        { isActive: !qr.isActive },
        { withCredentials: true }
      );
      fetchSettings();
    } catch (err) {
      console.error("Failed to update QR code", err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-800 dark:text-green-300 text-sm">✓ {success}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300 text-sm">✕ {error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Payment Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage QR codes and payment methods
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "+ Add QR Code"}
        </Button>
      </div>

      {/* Add QR Code Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Add New QR Code
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <Label>
                  QR Code Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g., HDFC Business UPI"
                  value={qrName}
                  onChange={(e) => setQrName(e.target.value)}
                />
              </div>

              <div>
                <Label>UPI ID (Optional)</Label>
                <Input
                  placeholder="e.g., business@hdfc"
                  value={qrUpiId}
                  onChange={(e) => setQrUpiId(e.target.value)}
                />
              </div>

              <div>
                <Label>
                  Upload QR Code Image <span className="text-red-500">*</span>
                </Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer bg-white dark:bg-gray-800 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>

              <Button
                onClick={handleAddQRCode}
                disabled={uploading || saving || !qrFile || !qrName}
              >
                {uploading
                  ? "Uploading..."
                  : saving
                  ? "Saving..."
                  : "Save QR Code"}
              </Button>
            </div>

            {/* Preview */}
            <div>
              {qrPreview && (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preview:
                  </p>
                  <img
                    src={qrPreview}
                    alt="QR Code Preview"
                    className="w-64 h-64 object-contain mx-auto bg-white rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Codes List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Saved QR Codes ({settings?.qrCodes?.length || 0})
        </h2>

        {!settings?.qrCodes || settings.qrCodes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">💳</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No QR codes added yet
            </p>
            <Button onClick={() => setShowAddForm(true)}>+ Add First QR Code</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {settings.qrCodes.map((qr) => (
              <div
                key={qr._id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
              >
                {/* QR Image */}
                <div className="bg-white rounded-lg p-2">
                  <img
                    src={`${BASE_URL}${qr.qrImageUrl}`}
                    alt={qr.name}
                    className="w-full h-48 object-contain"
                  />
                </div>

                {/* QR Info */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {qr.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        qr.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {qr.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {qr.upiId && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {qr.upiId}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(qr)}
                    className="flex-1 text-xs px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    {qr.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDeleteQR(qr._id)}
                    className="flex-1 text-xs px-3 py-2 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          💡 How to use QR Codes
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Upload QR codes for different UPI accounts</li>
          <li>• When issuing a bill, select which QR code to use</li>
          <li>• QR code will be shown to the client for payment</li>
          <li>• Deactivate QR codes you no longer want to use</li>
        </ul>
      </div>
    </div>
  );
}
