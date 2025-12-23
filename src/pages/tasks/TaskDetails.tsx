import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import confetti from "canvas-confetti";
import { BASE_URL } from "../../utils/constants";
import { useAuth } from "../../api/useAuth";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import DatePicker from "../../components/form/date-picker";

interface Task {
  _id: string;
  title: string;
  serviceType?: string;
  priority: string;
  status: string;
  dueDate?: string;
  assessmentYear?: string;
  period?: string;
  client: {
    _id: string;
    name: string;
    code?: string;
  };
  assignedTo?: {
    _id: string;
    firstName: string;
    email: string;
  };
  owner: {
    _id: string;
    firstName: string;
  };
  notes: Array<{
    message: string;
    createdBy: {
      _id: string;
      firstName: string;
    };
    createdAt: string;
  }>;
  statusHistory: Array<{
    status: string;
    changedAt: string;
    changedBy: {
      _id: string;
      firstName: string;
    };
    note?: string;
  }>;
  legacyAssignedName?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  firstName: string;
  email: string;
  role: string;
}

const STATUS_OPTIONS = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];
const PRIORITY_OPTIONS = ["LOW", "NORMAL", "HIGH"];

export default function TaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    serviceType: "",
    priority: "",
    dueDate: "",
    assessmentYear: "",
    period: "",
    assignedTo: "",
  });

  // Status update
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Add note
  const [noteMessage, setNoteMessage] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Users for assignment
  const [users, setUsers] = useState<User[]>([]);

  const isAdmin = user?.role === "ADMIN";
  const isAssignedToMe = task?.assignedTo?._id === user?.id;

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching task with ID:', taskId);
      console.log('📡 API URL:', `${BASE_URL}/api/tasks/${taskId}`);
      
      const res = await axios.get(`${BASE_URL}/api/tasks/${taskId}`, {
        withCredentials: true,
      });
      
      console.log('✅ Task fetched successfully:', res.data);
      setTask(res.data.task);
      setNewStatus(res.data.task.status);
    } catch (err: any) {
      console.error('❌ Error fetching task:', err);
      console.error('Response status:', err.response?.status);
      console.error('Response data:', err.response?.data);
      console.error('Full error:', err);
      
      if (err.response?.status === 404) {
        setError(`Task not found. The backend route 'GET /api/tasks/:taskId' may be missing.`);
      } else if (err.response?.status === 403) {
        setError('Permission denied. You do not have access to this task.');
      } else if (err.response?.status === 500) {
        setError(`Server error: ${err.response?.data?.error || 'Backend issue'}`);
      } else if (!err.response) {
        setError('Cannot connect to backend. Is the server running?');
      } else {
        setError(err?.response?.data?.error || "Failed to fetch task");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/auth/assignable`, {
        withCredentials: true,
      });
      setUsers(res.data.users);
    } catch (err) {
      console.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchTask();
    if (isAdmin) {
      fetchUsers();
    }
  }, [taskId]);

  // Handle Edit
  const startEdit = () => {
    if (!task) return;
    setEditData({
      title: task.title,
      serviceType: task.serviceType || "",
      priority: task.priority,
      dueDate: task.dueDate || "",
      assessmentYear: task.assessmentYear || "",
      period: task.period || "",
      assignedTo: task.assignedTo?._id || "",
    });
    setIsEditing(true);
  };

  const handleEditSubmit = async () => {
    try {
      await axios.patch(
        `${BASE_URL}/api/tasks/${taskId}/edit`,
        editData,
        { withCredentials: true }
      );
      setIsEditing(false);
      fetchTask();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to update task");
    }
  };

  // Handle Status Update
  const handleStatusUpdate = async () => {
    if (newStatus === task?.status) return;
    
    try {
      setUpdatingStatus(true);
      
      // Check if we're completing the task
      const isCompleting = newStatus === "COMPLETED" && task?.status !== "COMPLETED";
      
      await axios.patch(
        `${BASE_URL}/api/tasks/${taskId}/status`,
        { status: newStatus, note: statusNote },
        { withCredentials: true }
      );
      
      // 🎉 Trigger confetti celebration when completing a task!
      if (isCompleting) {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 999999 };

        function randomInRange(min: number, max: number) {
          return Math.random() * (max - min) + min;
        }

        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          
          // Launch confetti from two sides
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
          });
        }, 250);
      }
      
      setStatusNote("");
      fetchTask();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle Add Note
  const handleAddNote = async () => {
    if (!noteMessage.trim()) return;

    try {
      setAddingNote(true);
      await axios.post(
        `${BASE_URL}/api/tasks/${taskId}/notes`,
        { message: noteMessage },
        { withCredentials: true }
      );
      setNoteMessage("");
      fetchTask();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

  // Handle Archive/Restore

  // Handle Archive/Restore
  const handleArchive = async () => {
    try {
      await axios.patch(
        `${BASE_URL}/api/tasks/${taskId}/archive`,
        {},
        { withCredentials: true }
      );
      navigate("/tasks");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to archive task");
    }
  };

  const handleRestore = async () => {
    try {
      await axios.patch(
        `${BASE_URL}/api/tasks/${taskId}/restore`,
        {},
        { withCredentials: true }
      );
      fetchTask();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to restore task");
    }
  };

  // Handle Permanent Delete
  const handlePermanentDelete = async () => {
    // Multi-step confirmation for safety
    const firstConfirm = window.confirm(
      `⚠️ PERMANENT DELETION WARNING\n\n` +
      `Task: "${task?.title}"\n\n` +
      `This will PERMANENTLY DELETE the task from the database.\n\n` +
      `This action CANNOT be undone.\n\n` +
      `Are you sure you want to continue?`
    );

    if (!firstConfirm) return;

    const secondConfirm = window.confirm(
      `🚨 FINAL CONFIRMATION\n\n` +
      `You are about to PERMANENTLY delete:\n` +
      `"${task?.title}"\n\n` +
      `Type-safe note: Tasks with billing records or payments cannot be deleted.\n\n` +
      `Click OK to proceed with permanent deletion.`
    );

    if (!secondConfirm) return;

    try {
      await axios.delete(
        `${BASE_URL}/api/tasks/${taskId}/permanent`,
        { withCredentials: true }
      );
      
      alert('✅ Task permanently deleted');
      navigate('/tasks/list'); // Redirect to task list
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || "Failed to delete task";
      alert(`❌ Deletion Failed\n\n${errorMsg}`);
      setError(errorMsg);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !task) {
  return (
    <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300">{error || "Task not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
        Task Details
      </h1>
        </div>

        {/* Admin Controls - Archive only for NOT_STARTED or COMPLETED tasks */}
        {isAdmin && !task.isArchived && (task.status === "NOT_STARTED" || task.status === "COMPLETED") && (
          <div className="flex gap-2">
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={startEdit}>
                ✏️ Edit Task
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleArchive}
              className="text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20"
            >
              📦 Archive
            </Button>
            
            {/* Permanent Delete - Only for NOT_STARTED tasks */}
            {task.status === "NOT_STARTED" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePermanentDelete}
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                🗑️ Delete Permanently
              </Button>
            )}
          </div>
        )}

        {/* Edit Only (No Archive) for IN_PROGRESS tasks */}
        {isAdmin && !task.isArchived && task.status === "IN_PROGRESS" && (
          <div className="flex gap-2">
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={startEdit}>
                ✏️ Edit Task
              </Button>
            )}
          </div>
        )}

        {/* View Only Badge for Completed Tasks */}
        {task.status === "COMPLETED" && !task.isArchived && (
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                ✓ Completed - Will auto-archive in 7 days
              </span>
            </div>
            {/* Billing Button - Admin Only */}
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/billing/task/${taskId}`)}
                className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
              >
                💰 Billing
              </Button>
            )}
          </div>
        )}

        {/* Archived Badge */}
        {task.isArchived && (
          <div className="flex gap-2 items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">📦 Archived</span>
            </div>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={handleRestore}>
                🔄 Restore Task
              </Button>
            )}
          </div>
        )}

        {/* Staff View Only Badge */}
        {!isAdmin && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">👁️ View Only</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Info Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            {isEditing && isAdmin ? (
              /* Edit Mode */
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={editData.title}
                    onChange={(e) =>
                      setEditData({ ...editData, title: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Service Type</Label>
                    <Input
                      value={editData.serviceType}
                      onChange={(e) =>
                        setEditData({ ...editData, serviceType: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <select
                      value={editData.priority}
                      onChange={(e) =>
                        setEditData({ ...editData, priority: e.target.value })
                      }
                      className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Assessment Year</Label>
                    <Input
                      value={editData.assessmentYear}
                      onChange={(e) =>
                        setEditData({ ...editData, assessmentYear: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Period</Label>
                    <Input
                      value={editData.period}
                      onChange={(e) =>
                        setEditData({ ...editData, period: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <DatePicker
                    id="edit-due-date"
                    label="Due Date"
                    defaultDate={editData.dueDate || undefined}
                    onChange={(_dates, dateStr) =>
                      setEditData({ ...editData, dueDate: dateStr })
                    }
                  />
                </div>

                {/* REASSIGNMENT: Moving it here from sidebar, but blocking for COMPLETED tasks */}
                {task.status !== "COMPLETED" && (
                  <div>
                    <Label>Assign To</Label>
                    <select
                      value={editData.assignedTo}
                      onChange={(e) =>
                        setEditData({ ...editData, assignedTo: e.target.value })
                      }
                      className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Unassigned</option>
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.firstName} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleEditSubmit}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {task.title}
                  </h2>
                  {task.serviceType && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {task.serviceType}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Priority</p>
                    <span
                      className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.priority === "HIGH"
                          ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                          : task.priority === "LOW"
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                          : "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <span
                      className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === "COMPLETED"
                          ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                          : task.status === "IN_PROGRESS"
                          ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300"
                          : "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {task.status.replace("_", " ")}
                    </span>
                  </div>

                  {task.dueDate && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Due Date</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {new Date(task.dueDate).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  )}
                </div>

                {(task.assessmentYear || task.period) && (
                  <div className="grid grid-cols-2 gap-4">
                    {task.assessmentYear && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Assessment Year
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {task.assessmentYear}
                        </p>
                      </div>
                    )}
                    {task.period && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Period</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {task.period}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Client Info */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Client Information
            </h3>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {task.client?.name || "Deleted Client"}
              </p>
              {task.client?.code && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Code: {task.client.code}
                </p>
              )}
              {task.client?._id && (
                <button
                  onClick={() => navigate(`/clients/${task.client?._id}`)}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 mt-2"
                >
                  View Client Details →
                </button>
              )}
            </div>
          </div>

          {/* Status Update */}
          {!task.isArchived && (isAdmin || isAssignedToMe) && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Update Status
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>New Status</Label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Note (Optional)</Label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Add a note about this status change..."
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  />
                </div>
                <Button
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus || newStatus === task.status}
                >
                  {updatingStatus ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Notes</h3>

            {/* Add Note */}
            {/* Add Note - Available to all users, but not archived or completed */}
            {!task.isArchived && task.status !== "COMPLETED" && (
              <div className="mb-4 space-y-3">
                <textarea
                  value={noteMessage}
                  onChange={(e) => setNoteMessage(e.target.value)}
                  placeholder="Add a note..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                />
                <Button onClick={handleAddNote} disabled={addingNote} size="sm">
                  {addingNote ? "Adding..." : "Add Note"}
                </Button>
              </div>
            )}

            {/* Notes List */}
            <div className="space-y-3">
              {task.notes.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No notes yet
                </p>
              ) : (
                task.notes.map((note, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <p className="text-sm text-gray-900 dark:text-white">
                      {note.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {note.createdBy?.firstName || "Unknown User"} • {formatDate(note.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment */}
          {/* Assignment Section - Keep as info block in sidebar (read-only) */}
          {(task.assignedTo || task.legacyAssignedName) && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                👤 Assignment
              </h3>
              {task.assignedTo ? (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                    Currently assigned to:
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {task.assignedTo.firstName}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {task.assignedTo.email}
                  </p>
                </div>
              ) : task.legacyAssignedName ? (
                /* LEGACY STAFF DISPLAY */
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                    📜 Legacy History
                  </p>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">
                    {task.legacyAssignedName}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 italic">
                    Staff account has been deleted
                  </p>
                </div>
              ) : (
                // This case should ideally not be reached if the outer condition is (task.assignedTo || task.legacyAssignedName)
                // but including it for completeness or if the outer condition changes.
                <p className="text-xs text-gray-500 italic">No staff member currently assigned.</p>
              )}
            </div>
          )}
          
          {/* If no one is assigned, show a status badge instead of empty sidebar */}
          {!task.assignedTo && !task.legacyAssignedName && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                👤 Assignment
              </h3>
              <p className="text-xs text-gray-500 italic">No staff member currently assigned.</p>
            </div>
          )}

          {/* Status History */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Status History
            </h3>
            <div className="space-y-3">
              {task.statusHistory.map((history, index) => (
                <div
                  key={index}
                  className="pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {history.status.replace("_", " ")}
                  </p>
                  {history.note && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {history.note}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {history.changedBy?.firstName || "Unknown User"} •{" "}
                    {formatDate(history.changedAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Meta Info */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Information
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Created By</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {task.owner?.firstName || "System"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Created</p>
                <p className="text-gray-900 dark:text-white">
                  {formatDate(task.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Last Updated</p>
                <p className="text-gray-900 dark:text-white">
                  {formatDate(task.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
