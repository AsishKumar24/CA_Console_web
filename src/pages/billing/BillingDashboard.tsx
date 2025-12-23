import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import Input from "../../components/form/input/InputField";
import { SensitiveData } from "../../components/common/SensitiveData";

interface Task {
  _id: string;
  title: string;
  client: {
    _id: string;
    name: string;
    code?: string;
  };
  billing: {
    amount: number;
    taxAmount?: number;
    discount?: number;
    dueDate: string;
    paymentMode: string;
    paymentStatus: string;
    invoiceNumber: string;
    paidAmount: number;
    paidAt?: string;
    advance?: {
      isPaid: boolean;
      amount: number;
    };
  };
}

interface Stats {
  totalBills: number;
  totalAmount: number;
  totalPaid: number;
  unpaid: number;
  paid: number;
  overdue: number;
  partiallyPaid: number;
}

export default function BillingDashboard() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalBills: 0,
    totalAmount: 0,
    totalPaid: 0,
    unpaid: 0,
    paid: 0,
    overdue: 0,
    partiallyPaid: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchBills = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/billing/dashboard`, {
        params: {
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          search: search || undefined,
        },
        withCredentials: true,
        signal
      });
      setTasks(res.data.tasks);
      setStats(res.data.stats);
    } catch (err) {
      if (axios.isCancel(err)) {
       // console.log("Billing Dashboard fetch cancelled");
      } else {
        console.error("Failed to fetch billing dashboard", err);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    
    const timer = setTimeout(() => {
      fetchBills(controller.signal);
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [statusFilter, search]);

  const filteredTasks = tasks; // Server now returns the filtered list

  const statusColors = {
    UNPAID:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300",
    PAID:
      "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300",
    OVERDUE:
      "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300",
    PARTIALLY_PAID:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isOverdue = (task: Task) => {
    return (
      task.billing.paymentStatus === "UNPAID" &&
      new Date(task.billing.dueDate) < new Date()
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Billing Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track all your bills and payments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bills */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Bills</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
            {stats.totalBills}
          </p>
        </div>

        {/* Total Amount */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
            <SensitiveData value={stats.totalAmount} className="inline" />
          </p>
        </div>

        {/* Paid */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Paid</p>
          <p className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-1">
            <SensitiveData value={stats.totalPaid} className="inline" />
          </p>
          <p className="text-xs text-gray-500 mt-1">{stats.paid} bills</p>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
          <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400 mt-1">
            <SensitiveData
              value={stats.totalAmount - stats.totalPaid}
              className="inline"
            />
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.unpaid} unpaid • {stats.overdue} overdue
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <Input
          placeholder="Search by task, client, or invoice number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4"
        >
          <option value="ALL">All Status</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="PARTIALLY_PAID">Partially Paid</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/40">
            <tr>
              <th className="px-6 py-3 text-left">Invoice</th>
              <th className="px-6 py-3 text-left">Task</th>
              <th className="px-6 py-3 text-left">Client</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Billing Date</th>
              <th className="px-6 py-3 text-left">Mode</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span>Loading billing records...</span>
                  </div>
                </td>
              </tr>
            ) : filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No billing records found.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task._id} className="border-t hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">{task.billing.invoiceNumber}</td>
                  <td className="px-6 py-4">{task.title}</td>
                  <td className="px-6 py-4">{task.client.name}</td>

                  <td className="px-6 py-4 font-medium">
                    {/* Total Bill */}
                    <span className="font-medium">
                      ₹{((task.billing.amount || 0) + (task.billing.taxAmount || 0) - (task.billing.discount || 0)).toLocaleString("en-IN")}
                    </span>

                    {/* Paid amount (advance + paid) */}
                    {((task.billing.advance?.amount || 0) + (task.billing.paidAmount || 0)) > 0 && (
                      <div className="text-xs text-green-600 mt-1 font-normal">
                        Paid: ₹{((task.billing.advance?.amount || 0) + (task.billing.paidAmount || 0)).toLocaleString("en-IN")}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4">{formatDate(task.billing.dueDate)}</td>
                  <td className="px-6 py-4">
                    {task.billing.paymentMode.replace(/_/g, " ")}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                        statusColors[
                          isOverdue(task)
                            ? "OVERDUE"
                            : (task.billing.paymentStatus as keyof typeof statusColors)
                        ]
                      }`}
                    >
                      {isOverdue(task)
                        ? "OVERDUE"
                        : task.billing.paymentStatus.replace(/_/g, " ")}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/billing/task/${task._id}`)}
                      className="text-blue-600 dark:text-blue-400 text-xs font-semibold hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
