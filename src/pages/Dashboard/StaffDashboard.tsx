import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";

interface StaffStats {
  myTasks: {
    total: number;
    notStarted: number;
    inProgress: number;
    completed: number;
    dueToday: number;
    dueThisWeek: number;
    overdue: number;
  };
}

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffStats();
  }, []);

  const fetchStaffStats = async () => {
    try {
      setLoading(true);
      console.log("StaffDashboard: Fetching stats...");
      const res = await axios.get(`${BASE_URL}/api/dashboard/staff-stats`, {
        withCredentials: true,
      });
      console.log("StaffDashboard: Stats received:", res.data);
      if (res.data.success) {
        setStats(res.data.stats);
      } else {
        throw new Error(res.data.error || "Failed to fetch stats");
      }
    } catch (err) {
      console.error("StaffDashboard: Error fetching stats:", err);
      // Set default empty stats on error to avoid crashes
      setStats({
        myTasks: {
          total: 0,
          notStarted: 0,
          inProgress: 0,
          completed: 0,
          dueToday: 0,
          dueThisWeek: 0,
          overdue: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 animate-pulse text-sm">Loading your dashboard...</p>
      </div>
    );
  }

  // Final guard to ensure we don't crash if stats is still null for some reason
  if (!stats) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track your assigned tasks and progress
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* My Tasks */}
        <div
          className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all"
          onClick={() => navigate("/my-tasks")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.myTasks.total}</h3>
          <p className="text-blue-100 text-sm">My Tasks</p>
          <div className="mt-3 text-xs">
            {stats.myTasks.inProgress} in progress
          </div>
        </div>

        {/* Due Today */}
        <div
          className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all"
          onClick={() => navigate("/my-tasks")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.myTasks.dueToday}</h3>
          <p className="text-orange-100 text-sm">Due Today</p>
          <div className="mt-3 text-xs">Focus on these first!</div>
        </div>

        {/* Due This Week */}
        <div
          className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all"
          onClick={() => navigate("/my-tasks")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.myTasks.dueThisWeek}</h3>
          <p className="text-purple-100 text-sm">Due This Week</p>
          <div className="mt-3 text-xs">Plan ahead</div>
        </div>

        {/* Overdue */}
        <div
          className="bg-gradient-to-br from-red-400 to-red-500 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all"
          onClick={() => navigate("/my-tasks")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.myTasks.overdue}</h3>
          <p className="text-red-100 text-sm">Overdue</p>
          <div className="mt-3 text-xs">
            {stats.myTasks.overdue > 0 ? "Needs attention!" : "All clear!"}
          </div>
        </div>
      </div>

      {/* Task Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Task Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                Not Started
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.myTasks.notStarted}
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                In Progress
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.myTasks.inProgress}
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                Completed
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.myTasks.completed}
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <button
            onClick={() => navigate("/my-tasks")}
            className="w-full px-4 py-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-blue-700 dark:text-blue-300 text-sm transition-colors text-left flex items-center justify-between"
          >
            <span>📋 My Task Board</span>
            <span>→</span>
          </button>
          <button
            onClick={() => navigate("/clients")}
            className="w-full px-4 py-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg text-green-700 dark:text-green-300 text-sm transition-colors text-left flex items-center justify-between mt-2"
          >
            <span>👥 View Clients</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
              Tip: Tasks Auto-Archive
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Completed tasks are automatically archived after 7 days. You can
              view them in the "Archived Tasks" page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
