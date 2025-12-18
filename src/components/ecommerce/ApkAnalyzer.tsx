
import React, { useRef, useState, ChangeEvent, FormEvent } from "react";

/* -------------------- CONFIG OPTIONS -------------------- */

const SERVICE_TYPES = [
  "ITR Filing",
  "GST Return (GSTR-3B / 1)",
  "TDS / TCS Return",
  "Tax Audit",
  "Statutory Audit",
  "Bookkeeping",
  "Company Incorporation",
  "ROC / MCA Filing",
  "Project Report",
  "Tenders",
  "Consultation",
  "Other",
];

const CLIENT_TYPES = ["Individual", "Proprietorship", "Partnership", "LLP", "Company", "Trust"];

const PRIORITIES = ["Low", "Normal", "High", "Urgent"];

const STATUSES = ["Not Started", "In Progress", "Waiting on Client", "Completed", "On Hold"];

const STAFF_MEMBERS = ["Unassigned", "Ravi", "Babu", "Prasant", "Monika"];

const BILLING_TYPES = ["Fixed Fee", "Hourly", "Retainer", "Not Billable"];

const FEATURE_CHECKLIST = [
  "Collect basic KYC documents",
  "Collect bank statements",
  "Collect purchase & sales invoices",
  "Reconcile books",
  "Prepare financial statements",
  "Compute tax liability",
  "Review before filing",
  "File return / form",
  "Share filed copy with client",
];

type CreatedTask = {
  id: number;
  clientName: string;
  serviceType: string;
  assignedTo: string;
  dueDate: string;
  status: string;
};

/* -------------------- COMPONENT -------------------- */

const ClientTaskEntry: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [attachments, setAttachments] = useState<File[]>([]);
  const [history, setHistory] = useState<CreatedTask[]>([]);

  const [form, setForm] = useState({
    clientName: "",
    clientCode: "",
    clientType: CLIENT_TYPES[0],
    pan: "",
    gstin: "",
    mobile: "",
    email: "",
    serviceType: SERVICE_TYPES[0],
    priority: "Normal",
    status: "Not Started",
    assignedTo: "Unassigned",
    assessmentYear: "",
    period: "",
    dueDate: "",
    billingType: "Fixed Fee",
    feeAmount: "",
    notes: "",
    remindersEmail: true,
    remindersWhatsApp: false,
    features: new Set<string>() as Set<string>,
  });

  /* -------------------- HANDLERS -------------------- */

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    if (type === "checkbox" && (name === "remindersEmail" || name === "remindersWhatsApp")) {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const toggleFeature = (feature: string) => {
    setForm((prev) => {
      const next = new Set(prev.features);
      if (next.has(feature)) next.delete(feature);
      else next.add(feature);
      return { ...prev, features: next };
    });
  };

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setAttachments(files);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // In real app: send to backend here (Axios / fetch).

    const newTask: CreatedTask = {
      id: Date.now(),
      clientName: form.clientName || "Unnamed Client",
      serviceType: form.serviceType,
      assignedTo: form.assignedTo,
      dueDate: form.dueDate,
      status: form.status,
    };

    setHistory((prev) => [newTask, ...prev.slice(0, 4)]);

    // Simple reset except a few defaults
    setForm((prev) => ({
      ...prev,
      clientName: "",
      clientCode: "",
      pan: "",
      gstin: "",
      mobile: "",
      email: "",
      assessmentYear: "",
      period: "",
      dueDate: "",
      feeAmount: "",
      notes: "",
      features: new Set<string>(),
      status: "Not Started",
    }));
    setAttachments([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* -------------------- RENDER -------------------- */

  return (
    <div className="mx-auto my-10 max-w-5xl">
      <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-xl backdrop-blur dark:border-gray-800 dark:bg-white/[0.03] sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white/90">
              New Client Task
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create a task for a client so it can be assigned to staff and tracked.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-sm">
          {/* Client Details */}
          <section>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Client details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Client name
                </label>
                <input
                  name="clientName"
                  value={form.clientName}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                  placeholder="ABC Pvt Ltd"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Client code / ID
                </label>
                <input
                  name="clientCode"
                  value={form.clientCode}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                  placeholder="CLI-00123"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Client type
                </label>
                <select
                  name="clientType"
                  value={form.clientType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  {CLIENT_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">PAN</label>
                <input
                  name="pan"
                  value={form.pan}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase dark:border-gray-700 dark:bg-gray-900"
                  placeholder="ABCDE1234F"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">GSTIN</label>
                <input
                  name="gstin"
                  value={form.gstin}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase dark:border-gray-700 dark:bg-gray-900"
                  placeholder="22ABCDE1234F1Z5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Mobile
                </label>
                <input
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                  placeholder="9876543210"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                  placeholder="client@example.com"
                />
              </div>
            </div>
          </section>

          {/* Task details */}
          <section>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Task details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Service / work type
                </label>
                <select
                  name="serviceType"
                  value={form.serviceType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  {SERVICE_TYPES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Assessment year
                </label>
                <input
                  name="assessmentYear"
                  value={form.assessmentYear}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                  placeholder="2024-25"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Period / Month
                </label>
                <input
                  name="period"
                  value={form.period}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                  placeholder="Apr 2025"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Assign to
                </label>
                <select
                  name="assignedTo"
                  value={form.assignedTo}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  {STAFF_MEMBERS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Due date
                </label>
                <input
                  name="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                />
              </div>
            </div>
          </section>

          {/* Billing */}
          <section>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Billing
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Billing type
                </label>
                <select
                  name="billingType"
                  value={form.billingType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  {BILLING_TYPES.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Fee amount (₹)
                </label>
                <input
                  name="feeAmount"
                  value={form.feeAmount}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                  placeholder="5000"
                />
              </div>
            </div>
          </section>

          {/* Feature checklist */}
          <section>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Work checklist
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {FEATURE_CHECKLIST.map((f) => (
                <label key={f} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.features.has(f)}
                    onChange={() => toggleFeature(f)}
                    className="mt-0.5 h-3 w-3 rounded border-gray-300 text-indigo-600"
                  />
                  <span>{f}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Reminders */}
          <section>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Reminders
            </h2>
            <div className="flex flex-wrap gap-4 text-xs text-gray-700 dark:text-gray-300">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="remindersEmail"
                  checked={form.remindersEmail}
                  onChange={handleChange}
                  className="h-3 w-3 rounded border-gray-300 text-indigo-600"
                />
                Email reminders
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="remindersWhatsApp"
                  checked={form.remindersWhatsApp}
                  onChange={handleChange}
                  className="h-3 w-3 rounded border-gray-300 text-indigo-600"
                />
                WhatsApp reminders (manual / external)
              </label>
            </div>
          </section>

          {/* Attachments & Notes */}
          <section>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Attachments & notes
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Upload documents
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFiles}
                  className="w-full text-xs text-gray-600 dark:text-gray-300"
                />
                {attachments.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                    {attachments.map((f) => (
                      <li key={f.name} className="truncate">
                        {f.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Internal notes
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                  placeholder="Any special instructions for staff or important points…"
                />
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700"
            >
              Save task
            </button>
          </div>
        </form>

        {/* Recent tasks */}
        {history.length > 0 && (
          <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90 mb-2">
              Recently created tasks
            </h3>
            <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              {history.map((t) => (
                <li key={t.id} className="flex justify-between gap-4">
                  <span className="truncate">
                    {t.clientName} — {t.serviceType}
                  </span>
                  <span className="shrink-0">
                    {t.assignedTo} • {t.dueDate || "No due date"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientTaskEntry;
