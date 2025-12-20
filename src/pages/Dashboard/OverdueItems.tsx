import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";

interface OverdueTask {
  _id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  daysOverdue: number;
  client: {
    name: string;
    code?: string;
  };
  assignedTo?: {
    firstName: string;
    lastName: string;
  };
}

interface OverdueBill {
  _id: string;
  title: string;
  daysOverdue: number;
  client: {
    name: string;
    code?: string;
  };
  billing: {
    amount: number;
    dueDate: string;
    paymentStatus: string;
    invoiceNumber: string;
  };
}

export default function OverdueItems() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<OverdueTask[]>([]);
  const [bills, setBills] = useState<OverdueBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "TASKS" | "BILLS">("ALL");

  useEffect(() => {
    fetchOverdueItems();
  }, []);

  const fetchOverdueItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/dashboard/overdue`, {
        withCredentials: true,
      });
      setTasks(res.data.data.tasks);
      setBills(res.data.data.bills);
    } catch (err) {
      console.error("Failed to fetch overdue items", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
      HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300",
      URGENT: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300",
    };
    return colors[priority as keyof typeof colors] || colors.MEDIUM;
  };

  const getDaysColor = (days: number) => {
    if (days > 7) return "text-red-600 dark:text-red-400";
    if (days > 3) return "text-orange-600 dark:text-orange-400";
    return "text-yellow-600 dark:text-yellow-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalOverdue = tasks.length + bills.length;
  const filteredTasks = filter === "ALL" || filter === "TASKS" ? tasks : [];
  const filteredBills = filter === "ALL" || filter === "BILLS" ? bills : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-3"
        >
          ← Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              ⚠️ Overdue Items
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {totalOverdue} items need immediate attention
            </p>
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4"
          >
            <option value="ALL">All ({totalOverdue})</option>
            <option value="TASKS">Tasks Only ({tasks.length})</option>
            <option value="BILLS">Bills Only ({bills.length})</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-xl">
              📋
            </div>
            <div>
              <h3 className="text-2xl font-bold text-orange-900 dark:text-orange-300">
                {tasks.length}
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-400">Overdue Tasks</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-xl">
              💰
            </div>
            <div>
              <h3 className="text-2xl font-bold text-red-900 dark:text-red-300">
                {bills.length}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400">Overdue Bills</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Tasks */}
      {filteredTasks.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Overdue Tasks ({tasks.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Task</th>
                  <th className="px-6 py-3 text-left font-semibold">Client</th>
                  <th className="px-6 py-3 text-left font-semibold">Due Date</th>
                  <th className="px-6 py-3 text-left font-semibold">Days Overdue</th>
                  <th className="px-6 py-3 text-left font-semibold">Assigned To</th>
                  <th className="px-6 py-3 text-left font-semibold">Priority</th>
                  <th className="px-6 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredTasks.map((task) => (
                  <tr key={task._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{task.title}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {task.client?.name}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {formatDate(task.dueDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${getDaysColor(task.daysOverdue)}`}>
                        {task.daysOverdue} days
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/tasks/${task._id}`)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-medium"
                      >
                        Edit Task
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Overdue Bills */}
      {filteredBills.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Overdue Bills ({bills.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Invoice #</th>
                  <th className="px-6 py-3 text-left font-semibold">Task</th>
                  <th className="px-6 py-3 text-left font-semibold">Client</th>
                  <th className="px-6 py-3 text-left font-semibold">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold">Due Date</th>
                  <th className="px-6 py-3 text-left font-semibold">Days Overdue</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredBills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {bill.billing.invoiceNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{bill.title}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {bill.client?.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ₹{bill.billing.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {formatDate(bill.billing.dueDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${getDaysColor(bill.daysOverdue)}`}>
                        {bill.daysOverdue} days
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300">
                        {bill.billing.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/billing/task/${bill._id}`)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalOverdue === 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-2">
            All Clear!
          </h3>
          <p className="text-green-700 dark:text-green-400">
            No overdue tasks or bills. Great job!
          </p>
        </div>
      )}
    </div>
  );
}
