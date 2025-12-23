import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import DatePicker from "../../components/form/date-picker";
import { BASE_URL } from "../../utils/constants";

interface User {
  _id: string;
  firstName: string;
  email: string;
  role: string;
  isActive?: boolean; // Optional for backward compatibility
}

interface Client {
  _id: string;
  name: string;
  code?: string;
  isActive?: boolean; // Optional for backward compatibility
}

const ASSESSMENT_YEARS = [
  "2017-18",
  "2018-19",
  "2019-20",
  "2020-21",
  "2021-22",
  "2022-23",
  "2023-24",
  "2024-25",
  "2025-26",
  "2026-27",
  "2027-28",
  "2028-29",
];

const PERIODS = ["One Time","Monthly", "Quarterly", "Yearly"];

// Main Service Types
const SERVICE_TYPES = [
  "GST",
  "IT",
  "Project Report",
  "Audit",
  "Tenders",
  "DSC",
  "ROC Filing",
  "TDS",
  "Bookkeeping",
  "Other (Custom)"
];

// Sub-categories for each service type
const SERVICE_SUB_CATEGORIES: Record<string, string[]> = {
  "GST": ["Return Filing", "Notice", "Appeal", "Tribunal", "Others"],
  "IT": ["Return Filing", "Notice", "Appeal", "Tribunal", "Others"],
  "Project Report": ["DPR", "CMA", "Others"],
  "Audit": ["Tax Audit", "Company Audit", "Trust Audit", "Government Audit", "Others"],
  "Tenders": ["SPCL Contractor", "A-Class", "B-Class", "C-Class", "D-Class", "Others"],
  "DSC": ["Individual", "Individual Combo", "Org. Combo", "Govt. Combo", "Others"],
  "ROC Filing": ["Annual Filing", "Change in Directors", "Incorporation", "Closure", "Others"],
  "TDS": ["Quarterly Return", "Annual Return", "TDS Refund", "Others"],
  "Bookkeeping": ["Monthly", "Quarterly", "Annual", "Others"]
};

// Third-level categories (for Return Filing in GST/IT)
const RETURN_FILING_TYPES: Record<string, string[]> = {
  "GST": ["GSTR1", "GSTR3B", "Others"],
  "IT": ["Individual", "Partnership", "Company", "Trust", "Others"]
};

export default function CreateTask() {
  // ===== Task Fields =====
  const [title, setTitle] = useState("");
  const [titleManuallyEdited, setTitleManuallyEdited] = useState(false);
  const [serviceType, setServiceType] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [returnType, setReturnType] = useState(""); // For Return Filing
  const [customServiceType, setCustomServiceType] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [dueDate, setDueDate] = useState("");
  const [assessmentYear, setAssessmentYear] = useState("");
  const [period, setPeriod] = useState("");
  const [notes, setNotes] = useState("");

  // ===== Advance Payment =====
  const [hasAdvance, setHasAdvance] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [advancePaymentMode, setAdvancePaymentMode] = useState("CASH");
  const [advanceTransactionId, setAdvanceTransactionId] = useState("");
  const [advanceNotes, setAdvanceNotes] = useState("");

  // ===== Assignment =====
  const [users, setUsers] = useState<User[]>([]);
  const [assignedTo, setAssignedTo] = useState<string | null>(null);

  // ===== Client Search =====
  const [clientSearch, setClientSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const clientInputRef = useRef<HTMLInputElement>(null);

  // ===== State =====
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ===== Auto-populate Title from Service Type =====
  useEffect(() => {
    // Only auto-populate if user hasn't manually edited the title
    if (titleManuallyEdited) return;

    let autoTitle = "";

    if (serviceType && serviceType !== "Other (Custom)") {
      if (subCategory) {
        if (subCategory === "Return Filing" && returnType) {
          autoTitle = `${serviceType} - Return Filing (${returnType})`;
        } else {
          autoTitle = `${serviceType} - ${subCategory}`;
        }
      } else {
        autoTitle = serviceType;
      }
    } else if (serviceType === "Other (Custom)" && customServiceType) {
      autoTitle = customServiceType;
    }

    setTitle(autoTitle);
  }, [serviceType, subCategory, returnType, customServiceType, titleManuallyEdited]);

  // ===== Fetch Assignable Users (On Mount Only) =====
  useEffect(() => {
    const fetchUsers = () => {
      axios
        .get(BASE_URL + "/auth/assignable", { withCredentials: true })
        .then(res => setUsers(res.data.users.filter((u: User) => u.isActive !== false)))
        .catch(() => setUsers([]));
    };

    fetchUsers();
  }, []);

  // Fetch clients based on search input OR when field is focused
  useEffect(() => {
    if (!clientSearch && !showClientDropdown) return;
    
    const controller = new AbortController();
    setSearchLoading(true);

    const timer = setTimeout(() => {
      axios
        .get(BASE_URL + `/api/clients?search=${clientSearch}`, {
          withCredentials: true,
          signal: controller.signal
        })
        .then(res => {
          setClients(res.data.clients.filter((c: Client) => c.isActive !== false));
          setSearchLoading(false);
        })
        .catch((err) => {
          if (axios.isCancel(err)) {
            console.log("Client search cancelled");
          } else {
            setClients([]);
            setSearchLoading(false);
          }
        });
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
      setSearchLoading(false);
    };
  }, [clientSearch, selectedClient, showClientDropdown]);

  // ===== Submit =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!title || !selectedClient) {
      setError("Title and Client are required");
      return;
    }

    try {
      setLoading(true);
      
      // Build service type based on selections
      let finalServiceType = serviceType;
      
      if (serviceType && serviceType !== "Other (Custom)" && subCategory) {
        // Has sub-category
        if (subCategory === "Return Filing" && returnType) {
          // Full hierarchy with return type
          finalServiceType = `${serviceType} - Return Filing (${returnType})`;
        } else {
          // Just service + sub-category
          finalServiceType = `${serviceType} - ${subCategory}`;
        }
      } else if (serviceType === "Other (Custom)" && customServiceType) {
        finalServiceType = customServiceType;
      }
      
      // Prepare payload
      const payload: any = {
        title,
        serviceType: finalServiceType,
        priority,
        dueDate,
        assessmentYear,
        period,
        client: selectedClient._id,
        assignedTo
      };

      // Add notes if provided
      if (notes.trim()) {
        payload.notes = [{
          message: notes.trim()
        }];
      }

      // Add advance payment if provided
      if (hasAdvance && advanceAmount && parseFloat(advanceAmount) > 0) {
        payload.advance = {
          isPaid: true,
          amount: parseFloat(advanceAmount),
          paymentMode: advancePaymentMode,
          transactionId: advanceTransactionId.trim() || undefined,
          notes: advanceNotes.trim() || undefined
        };
      }

      await axios.post(
        BASE_URL + "/api/tasks",
        payload,
        { withCredentials: true }
      );

      setSuccess(true);
      setTitle("");
      setTitleManuallyEdited(false);
      setServiceType("");
      setSubCategory("");
      setReturnType("");
      setCustomServiceType("");
      setPriority("NORMAL");
      setDueDate("");
      setAssessmentYear("");
      setPeriod("");
      setNotes("");
      setAssignedTo(null);
      setSelectedClient(null);
      setClientSearch("");
      
      // Reset advance payment fields
      setHasAdvance(false);
      setAdvanceAmount("");
      setAdvancePaymentMode("CASH");
      setAdvanceTransactionId("");
      setAdvanceNotes("");
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  // Clear client selection
  const handleClearClient = () => {
    setSelectedClient(null);
    setClientSearch("");
    setClients([]);
    clientInputRef.current?.focus();
  };

  // Get sub-categories for selected service
  const getSubCategories = () => {
    if (!serviceType || serviceType === "Other (Custom)") return [];
    return SERVICE_SUB_CATEGORIES[serviceType] || [];
  };

  // Check if return type dropdown should show
  const showReturnTypeDropdown = () => {
    return subCategory === "Return Filing" && 
           (serviceType === "GST" || serviceType === "IT");
  };

  // Get return types for selected service
  const getReturnTypes = () => {
    if (!serviceType) return [];
    return RETURN_FILING_TYPES[serviceType] || [];
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ================= LEFT: FORM ================= */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Create Task
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Organize work efficiently, track progress seamlessly, and deliver excellence
            </p>
          </div>

          <div className="px-6 py-5 space-y-6">
            {/* Task Info */}
            <section className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Service Type</Label>
                  <select
                    value={serviceType}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setServiceType(newValue);
                      // Reset dependent fields
                      setSubCategory("");
                      setReturnType("");
                      if (newValue !== "Other (Custom)") {
                        setCustomServiceType("");
                      }
                    }}
                    className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Service Type</option>
                    {SERVICE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Priority</Label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              {/* Sub-category dropdown (appears for all services except Other) */}
              {getSubCategories().length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>{serviceType} Category</Label>
                    <select
                      value={subCategory}
                      onChange={(e) => {
                        setSubCategory(e.target.value);
                        if (e.target.value !== "Return Filing") {
                          setReturnType("");
                        }
                      }}
                      className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      {getSubCategories().map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Return Type dropdown (only for GST/IT Return Filing) */}
                  {showReturnTypeDropdown() && (
                    <div>
                      <Label>Return Type</Label>
                      <select
                        value={returnType}
                        onChange={(e) => setReturnType(e.target.value)}
                        className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Return</option>
                        {getReturnTypes().map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Custom Service Type (if Other selected) */}
              {serviceType === "Other (Custom)" && (
                <div>
                  <Label>Custom Service Type</Label>
                  <Input
                    placeholder="Enter custom service type"
                    value={customServiceType}
                    onChange={(e) => setCustomServiceType(e.target.value)}
                  />
                </div>
              )}

              {/* Task Title - Moved below service type for better UX */}
              <div>
                <Label>
                  Task Title<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  placeholder="e.g., GST Filing – March 2024"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setTitleManuallyEdited(true);
                  }}
                  required
                />
              </div>
            </section>
            

            {/* Client Search */}
            <section className="space-y-2">
              <Label>
                Client<span className="text-red-500 ml-1">*</span>
              </Label>

              {/* Selected Client Display */}
              {selectedClient ? (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedClient.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Code: {selectedClient.code || "Not assigned"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearClient}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    ref={clientInputRef}
                    type="text"
                    placeholder="Search client name or code..."
                    value={clientSearch}
                    onFocus={() => setShowClientDropdown(true)}
                    onChange={(e) => {
                      setClientSearch(e.target.value);
                      setSelectedClient(null);
                      setShowClientDropdown(true);
                    }}
                    className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}

                  {/* Dropdown */}
                  {showClientDropdown && clientSearch && !selectedClient && (
                    <div className="absolute z-30 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-auto">
                      {searchLoading ? (
                        <div className="px-4 py-6 text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Searching...
                          </p>
                        </div>
                      ) : clients.length > 0 ? (
                        <>
                          {clients.map((c) => (
                            <button
                              type="button"
                              key={c._id}
                              onClick={() => {
                                setSelectedClient(c);
                                setClientSearch("");
                                setClients([]);
                                setShowClientDropdown(false);
                              }}
                              className="w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                            >
                              <p className="font-medium text-gray-900 dark:text-white">
                                {c.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {c.code ? `Code: ${c.code}` : "No code"}
                              </p>
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            No clients found
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Dates & Period */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Assessment Year</Label>
                <select
                  value={assessmentYear}
                  onChange={(e) => setAssessmentYear(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select</option>
                  {ASSESSMENT_YEARS.map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Period</Label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select</option>
                  {PERIODS.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <DatePicker
                  id="task-due-date"
                  label="Due Date"
                  placeholder="Select date"
                  mode="single"
                  defaultDate={dueDate || undefined}
                  onChange={(_dates, dateStr) => {
                    setDueDate(dateStr);
                  }}
                />
              </div>
            </section>

            {/* Assignment */}
            <section>
              <Label>Assign To</Label>
              <select
                value={assignedTo || ""}
                onChange={(e) => setAssignedTo(e.target.value || null)}
                className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select Staff Member --</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.firstName} — {u.role}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave unassigned to keep task in your queue
              </p>
            </section>

            {/* ========== ADVANCE PAYMENT SECTION ========== */}
            <section className="space-y-4">
              <div 
                className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                onClick={() => setHasAdvance(!hasAdvance)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-6 rounded-full transition-colors flex items-center ${hasAdvance ? 'bg-green-500 justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'}`}>
                    <div className="w-5 h-5 bg-white rounded-full shadow mx-0.5"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Advance Payment</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Mark if client paid in advance</p>
                  </div>
                </div>
                {hasAdvance && (
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                    Advance Received
                  </span>
                )}
              </div>

              {/* Advance Payment Details (Collapsible) */}
              {hasAdvance && (
                <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Advance Amount (₹) <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={advanceAmount}
                        onChange={(e) => setAdvanceAmount(e.target.value)}
                        min="1"
                        required={hasAdvance}
                      />
                    </div>
                    <div>
                      <Label>Payment Mode</Label>
                      <select
                        value={advancePaymentMode}
                        onChange={(e) => setAdvancePaymentMode(e.target.value)}
                        className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="CASH">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="CHEQUE">Cheque</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Transaction ID (Optional)</Label>
                      <Input
                        placeholder="e.g., TXN123456"
                        value={advanceTransactionId}
                        onChange={(e) => setAdvanceTransactionId(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Notes (Optional)</Label>
                      <Input
                        placeholder="e.g., Cash received at office"
                        value={advanceNotes}
                        onChange={(e) => setAdvanceNotes(e.target.value)}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    An advance receipt (ADV-XXXXXX) will be generated automatically
                  </p>
                </div>
              )}
            </section>

            {/* Notes */}
            <section>
              <Label>Notes (Optional)</Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Files provided by client, special instructions, etc."
                rows={3}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Add any relevant information or instructions for this task
              </p>
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
                  Task created successfully!
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 rounded-b-xl flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>

        {/* ================= RIGHT: SIDEBAR ================= */}
        <aside className="space-y-4">
          {/* Priority Guide */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Priority Levels
            </h4>
            <div className="space-y-2">
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm font-medium text-red-700 dark:text-red-300">High - Urgent tasks</p>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Normal - Standard tasks</p>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Low - Non-urgent tasks</p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
              Quick Tips
            </h4>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>• Use clear task titles for better tracking</li>
              <li>• Add notes for files received or instructions</li>
              <li>• Assessment Year helps with compliance</li>
              <li>• Assign tasks early to avoid delays</li>
              <li>• Set due dates to prioritize work</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
