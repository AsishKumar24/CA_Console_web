import { useState } from "react";
import axios from "axios";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { BASE_URL } from "../../utils/constants";

const CLIENT_TYPES = [
  "Individual",
  "Sole Proprietor",
  "Partnership Firm",
  "LLP",
  "Private Limited",
  "Public Limited",
  "HUF",
  "Trust",
  "Society",
  "NGO",
  "Freelancer / Professional",
  "Startup",
  "Other",
];

export default function CreateClient() {
  // ===== FORM STATE =====
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState("");
  const [customType, setCustomType] = useState("");
  const [pan, setPan] = useState("");
  const [gstin, setGstin] = useState("");
  const [mobile, setMobile] = useState("");
  const [alternateMobile, setAlternateMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Auto-generate code prefix when name changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    
    // Auto-generate code prefix from first letter
    if (newName.trim()) {
      const firstLetter = newName.trim()[0].toUpperCase();
      // Only set prefix if code is empty or still has the old prefix pattern
      if (!code || /^[A-Z]-\d*$/.test(code)) {
        setCode(`${firstLetter}-`);
      }
    }
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const finalType = type === "Other" ? customType : type;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name || !mobile) {
      setError("Client name and mobile are required");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        BASE_URL + "/api/clients",
        {
          name,
          code,
          type: finalType || undefined,
          pan,
          gstin,
          mobile,
          alternateMobile,
          email,
          address,
          notes,
        },
        { withCredentials: true }
      );

      setSuccess(true);
      setName("");
      setCode("");
      setType("");
      setCustomType("");
      setPan("");
      setGstin("");
      setMobile("");
      setAlternateMobile("");
      setEmail("");
      setAddress("");
      setNotes("");

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to create client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Create Client
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Build strong relationships, manage efficiently, deliver excellence
        </p>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ================= LEFT: FORM ================= */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
          >
            <div className="px-6 py-5 space-y-6">
              {/* BASIC INFO */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>
                      Client Name<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      value={name}
                      onChange={handleNameChange}
                      placeholder="e.g., ABC Enterprises"
                      required
                    />
                  </div>

                  <div>
                    <Label>Client Code</Label>
                    <Input
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="e.g., A-1"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Auto-generated from name. Add number after hyphen.
                    </p>
                  </div>
                </div>
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* CLIENT TYPE */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Client Type
                </h3>

                <div>
                  <Label>Type</Label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select client type</option>
                    {CLIENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {type === "Other" && (
                  <div>
                    <Label>Custom Client Type</Label>
                    <Input
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      placeholder="Enter custom type"
                    />
                  </div>
                )}
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* CONTACT */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>
                      Mobile<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="Primary contact number"
                      required
                    />
                  </div>

                  <div>
                    <Label>Alternate Mobile</Label>
                    <Input
                      type="tel"
                      value={alternateMobile}
                      onChange={(e) => setAlternateMobile(e.target.value)}
                      placeholder="Secondary contact number"
                    />
                  </div>
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@example.com"
                  />
                </div>
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* TAX */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tax Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>PAN</Label>
                    <Input 
                      value={pan} 
                      onChange={(e) => setPan(e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"                    />
                  </div>

                  <div>
                    <Label>GSTIN</Label>
                    <Input
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="22ABCDE1234F1Z5"
                    />
                  </div>
                </div>
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* ADDITIONAL */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Additional Details
                </h3>

                <div>
                  <Label>Address</Label>
                  <textarea
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Complete business address"
                  />
                </div>

                <div>
                  <Label>Notes</Label>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional information about the client"
                  />
                </div>
              </section>

              {/* Alerts */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    Client created successfully!
                  </p>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end bg-gray-50 dark:bg-gray-900/40 rounded-b-xl">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Client"}
              </Button>
            </div>
          </form>
        </div>

        {/* ================= RIGHT: SIDEBAR ================= */}
        <aside className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
              Quick Tips
            </h4>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>• Name and mobile are required fields</li>
              <li>• Client code helps with quick identification</li>
              <li>• PAN and GSTIN auto-convert to uppercase</li>
              <li>• Add notes for special requirements</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              What's Next?
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              After creating a client, you can create tasks, manage documents,
              and track all compliance activities from their profile.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
