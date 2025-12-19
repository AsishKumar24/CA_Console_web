import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import Button from "../../components/ui/button/Button";

interface Task {
  _id: string;
  title: string;
  serviceType?: string;
  priority: string;
  status: string;
  dueDate?: string;
  client: {
    _id: string;
    name: string;
    code?: string;
  };
  createdAt: string;
}

const PRIORITY_COLORS = {
  LOW: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  NORMAL: "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  HIGH: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
};

const STATUS_COLORS = {
  NOT_STARTED: "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  IN_PROGRESS: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300",
  COMPLETED: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300",
};

export default function MyTasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/tasks/my`, {
        params: { page, limit },
        withCredentials: true
      });

      setTasks(res.data.tasks);
      setTotalPages(res.data.pagination.totalPages);
      setTotal(res.data.pagination.total);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, [page]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            My Tasks
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tasks assigned to you
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Assigned</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
            {total}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Not Started</p>
          <p className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mt-1">
            {tasks.filter(t => t.status === "NOT_STARTED").length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
          <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400 mt-1">
            {tasks.filter(t => t.status === "IN_PROGRESS").length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
          <p className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-1">
            {tasks.filter(t => t.status === "COMPLETED").length}
          </p>
        </div>
      </div>

      {/* Task Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
              No tasks assigned yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your assigned tasks will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Task</th>
                  <th className="px-6 py-3 text-left font-semibold">Client</th>
                  <th className="px-6 py-3 text-left font-semibold">Priority</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Due Date</th>
                  <th className="px-6 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {tasks.map((task) => (
                  <tr
                    key={task._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {task.title}
                      </div>
                      {task.serviceType && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {task.serviceType}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-gray-700 dark:text-gray-300">
                        {task.client.name}
                      </div>
                      {task.client.code && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {task.client.code}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]
                        }`}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {formatDate(task.dueDate)}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/tasks/${task._id}`)}
                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && tasks.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium">{tasks.length}</span> of{" "}
            <span className="font-medium">{total}</span> tasks
          </p>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Previous
            </Button>
            <span className="text-sm text-gray-700 dark:text-gray-300 px-3">
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

