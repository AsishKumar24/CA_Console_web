import { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import axios from "axios";
import confetti from "canvas-confetti";
import { BASE_URL } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../api/useAuth";

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
  assignedTo?: string;
}

const COLUMNS = {
  NOT_STARTED: { title: "To Do", color: "bg-gray-100 dark:bg-gray-800" },
  IN_PROGRESS: { title: "In Progress", color: "bg-yellow-100 dark:bg-yellow-900/20" },
  COMPLETED: { title: "Completed", color: "bg-green-100 dark:bg-green-900/20" },
};

const PRIORITY_COLORS = {
  LOW: "border-l-4 border-blue-500",
  NORMAL: "border-l-4 border-gray-500",
  HIGH: "border-l-4 border-red-500",
};

// Task Card Component
function TaskCard({ task, onArchive }: { task: Task; onArchive: (taskId: string) => void }) {
  const navigate = useNavigate();
  
  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { id: task._id, currentStatus: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <div
      ref={drag as any}
      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3 cursor-move hover:shadow-md transition-all ${
        PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]
      } ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      <div className="space-y-2">
        {/* Title */}
        <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
          {task.title}
        </h4>

        {/* Client */}
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
            {task.client.code || task.client.name.substring(0, 10)}
          </span>
          {task.serviceType && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {task.serviceType}
            </span>
          )}
        </div>

        {/* Priority & Due Date */}
        <div className="flex items-center justify-between text-xs">
          <span
            className={`px-2 py-0.5 rounded ${
              task.priority === "HIGH"
                ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                : task.priority === "LOW"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                : "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {task.priority}
          </span>
          {formatDate(task.dueDate) && (
            <span className="text-gray-500 dark:text-gray-400">
              📅 {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => navigate(`/tasks/${task._id}`)}
            className="flex-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
          >
            View Details
          </button>
          {task.status === "COMPLETED" && (
            <span className="text-[10px] text-green-600 dark:text-green-400 px-2 py-1 bg-green-50 dark:bg-green-950/20 rounded font-medium">
              ✓ Completed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Column Component
function Column({
  status,
  title,
  color,
  tasks,
  onDrop,
  onArchive,
}: {
  status: string;
  title: string;
  color: string;
  tasks: Task[];
  onDrop: (taskId: string, newStatus: string) => void;
  onArchive: (taskId: string) => void;
}) {
  const [{ isOver }, drop] = useDrop({
    accept: "TASK",
    drop: (item: { id: string; currentStatus: string }) => {
      if (item.currentStatus !== status) {
        onDrop(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop as any}
      className={`flex-1 min-w-[300px] ${color} rounded-xl p-4 transition-all ${
        isOver ? "ring-2 ring-blue-500" : ""
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
          {tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <div className="space-y-3 min-h-[400px]">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-400">
            Drop tasks here
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onArchive={onArchive}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Main Component
export default function AdminTaskBoard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        console.error('User ID not available');
        setLoading(false);
        return;
      }
      
      // Use getAdminTasks endpoint with assignedTo filter
      // This shows ONLY tasks assigned to the current admin user
      const res = await axios.get(`${BASE_URL}/api/tasks`, {
        params: {
          assignedTo: user.id  // Filter by assignedTo
        },
        withCredentials: true,
      });
      
      setTasks(res.data.tasks);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      // Check if completing a task
      const task = tasks.find(t => t._id === taskId);
      const isCompleting = newStatus === "COMPLETED" && task?.status !== "COMPLETED";
      
      // Optimistically update UI
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );

      // Update on backend
      await axios.patch(
        `${BASE_URL}/api/tasks/${taskId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      
      // 🎉 Trigger confetti when completing a task!
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
    } catch (err) {
      console.error("Failed to update task status", err);
      // Revert on error
      fetchMyTasks();
    }
  };

  const handleArchive = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to archive this task?")) {
      return;
    }

    try {
      await axios.patch(
        `${BASE_URL}/api/tasks/${taskId}/archive`,
        {},
        { withCredentials: true }
      );
      // Remove from local state
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    } catch (err) {
      console.error("Failed to archive task", err);
      alert("Failed to archive task. Please try again.");
    }
  };

  const tasksByStatus = {
    NOT_STARTED: tasks.filter((t) => t.status === "NOT_STARTED"),
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS"),
    COMPLETED: tasks.filter((t) => t.status === "COMPLETED"),
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              My Task Board
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Drag and drop tasks to update their status
            </p>
          </div>
          <button
            onClick={() => navigate("/tasks/archived")}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            📦 Archived Tasks
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
              {tasks.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
            <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400 mt-1">
              {tasksByStatus.IN_PROGRESS.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-1">
              {tasksByStatus.COMPLETED.length}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          /* Kanban Board */
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Object.entries(COLUMNS).map(([status, config]) => (
              <Column
                key={status}
                status={status}
                title={config.title}
                color={config.color}
                tasks={tasksByStatus[status as keyof typeof tasksByStatus]}
                onDrop={handleStatusChange}
                onArchive={handleArchive}
              />
            ))}
          </div>
        )}

        {/* Helper Text */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            💡 Quick Tips
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Drag tasks between columns to change their status</li>
            <li>• Color on left indicates priority (Red=High, Gray=Normal, Blue=Low)</li>
            <li>• Completed tasks can be archived using the Archive button</li>
            <li>• Click "View Details" to see full task information</li>
          </ul>
        </div>
      </div>
    </DndProvider>
  );
}

