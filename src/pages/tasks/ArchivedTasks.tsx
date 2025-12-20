import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import Input from "../../components/form/input/InputField";

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
  assignedTo?: {
    _id: string;
    firstName: string;
  };
  owner: {
    _id: string;
    firstName: string;
  };
  archivedAt?: string;
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

export default function ArchivedTasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  const fetchArchivedTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/tasks`, {
        params: { 
          archived: true,
        },
        withCredentials: true
      });

      setTasks(res.data.tasks);
    } catch (err) {
      console.error("Failed to fetch archived tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedTasks();
  }, []);

  const handleRestore = async (taskId: string) => {
    try {
      setRestoring(taskId);
      await axios.patch(
        `${BASE_URL}/api/tasks/${taskId}/restore`,
        {},
        { withCredentials: true }
      );
      // Remove from local state
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (err: any) {
      console.error("Failed to restore task", err);
      alert(err?.response?.data?.error || "Failed to restore task");
    } finally {
      setRestoring(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // Local search filter
  const filteredTasks = search
    ? tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(search.toLowerCase()) ||
          task.client.name.toLowerCase().includes(search.toLowerCase()) ||
          task.client.code?.toLowerCase().includes(search.toLowerCase())
      )
    : tasks;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-2"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Archived Tasks
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View and restore archived tasks
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Total Archived Tasks</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
          {tasks.length}
        </p>
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by task, client name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Task Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading archived tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📦</div>
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
              {search ? "No archived tasks found" : "No archived tasks"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {search ? "Try a different search term" : "Archived tasks will appear here"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Task</th>
                  <th className="px-6 py-3 text-left font-semibold">Client</th>
                  <th className="px-6 py-3 text-left font-semibold">Assigned To</th>
                  <th className="px-6 py-3 text-left font-semibold">Priority</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Archived On</th>
                  <th className="px-6 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredTasks.map((task) => (
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

                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {task.assignedTo ? task.assignedTo.firstName : "—"}
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
                      {formatDate(task.archivedAt)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/tasks/${task._id}`)}
                          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleRestore(task._id)}
                          disabled={restoring === task._id}
                          className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {restoring === task._id ? "Restoring..." : "Restore"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          💡 About Archived Tasks
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Archived tasks are hidden from the main task views</li>
          <li>• Only admins can archive or restore tasks</li>
          <li>• Click "Restore" to bring a task back to active status</li>
          <li>• All task data is preserved when archived</li>
        </ul>
      </div>
    </div>
  );
}
