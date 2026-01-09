import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
import StaffDashboard from "./StaffDashboard";
import { useAuth } from "../../context/AuthContext";
import { SensitiveData } from "../../components/common/SensitiveData";

interface DashboardStats {
  tasks: {
    total: number;
    notStarted: number;
    inProgress: number;
    completed: number;
    completedToday: number;
    dueThisWeek: number;
    overdue: number;
  };
  clients: {
    total: number;
    active: number;
    inactive: number;
  };
  billing: {
    totalBills: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueCount: number;
  };
  staff: {
    total: number;
    activeToday: number;
  };
}

interface RecentActivity {
  type: string;
  description: string;
  time: string;
  icon: string;
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  // Simple relative time formatter
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 0) return "Just now";
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString("en-IN", { day: 'numeric', month: 'short' });
  };

  // Get user role from AuthContext
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardStats();
      fetchRecentActivities();
    } else if (user) {
      // If user is loaded but not admin, stop loading so we can show StaffDashboard
      setLoading(false);
    }
  }, [isAdmin, user]);

  const fetchRecentActivities = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/dashboard/activities`, {
        withCredentials: true,
      });
      setRecentActivities(res.data.activities);
    } catch (err) {
      console.error("Failed to fetch recent activities", err);
    }
  };

  const handleRefresh = () => {
    fetchDashboardStats();
    fetchRecentActivities();
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/dashboard/stats`, {
        withCredentials: true,
      });
      setStats(res.data.stats);
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  // Show staff dashboard for non-admin users
  if (!isAdmin) {
    return <StaffDashboard />;
  }
  
  // Show skeleton while loading stats
  if (!stats || loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const taskCompletionRate = Math.round((stats.tasks.completed / stats.tasks.total) * 100);
  const paymentCollectionRate = Math.round((stats.billing.paidAmount / stats.billing.totalAmount) * 100);



  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <span className={loading ? "animate-spin" : ""}>🔄</span>
            Refresh
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tasks */}
        <div 
          className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all"
          onClick={() => navigate("/tasks/list")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <span className="text-sm bg-white/20 px-2 py-1 rounded-full">+{stats.tasks.completedToday} today</span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.tasks.total}</h3>
          <p className="text-blue-100 text-sm">Total Tasks</p>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span>{stats.tasks.inProgress} in progress</span>
            <span>{taskCompletionRate}% complete</span>
          </div>
        </div>

        {/* Active Clients */}
        <div 
          className="bg-gradient-to-br from-green-400 to-green-500 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all"
          onClick={() => navigate("/clients")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <span className="text-sm bg-white/20 px-2 py-1 rounded-full">{stats.clients.active} active</span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.clients.total}</h3>
          <p className="text-green-100 text-sm">Total Clients</p>
          <div className="mt-3 text-xs">
            {stats.clients.inactive} inactive clients
          </div>
        </div>

        {/* Revenue Collection */}
        <div 
          className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all"
          onClick={() => navigate("/billing")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <span className="text-sm bg-white/20 px-2 py-1 rounded-full">{paymentCollectionRate}%</span>
          </div>
          <h3 className="text-3xl font-bold mb-1">
            <SensitiveData value={stats.billing.paidAmount} className="inline text-white" />
          </h3>
          <p className="text-purple-100 text-sm">Revenue Collected</p>
          <div className="mt-3 text-xs">
            <SensitiveData value={stats.billing.pendingAmount} className="inline text-white" /> pending
          </div>
        </div>

        {/* Urgent Items */}
        <div 
          className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all"
          onClick={() => navigate("/dashboard/overdue")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <span className="text-sm bg-white/20 px-2 py-1 rounded-full">Urgent</span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.tasks.overdue + stats.billing.overdueCount}</h3>
          <p className="text-orange-100 text-sm">Items Need Attention</p>
          <div className="mt-3 flex justify-between text-xs">
            <span>{stats.tasks.overdue} overdue tasks</span>
            <span>{stats.billing.overdueCount} overdue bills</span>
          </div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* This Week's Tasks */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">This Week</h3>
            <span className="text-2xl">📅</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Due this week</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.tasks.dueThisWeek}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Completed today</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{stats.tasks.completedToday}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ 
                  width: `${Math.min(
                    stats.tasks.dueThisWeek > 0 
                      ? (stats.tasks.completedToday / stats.tasks.dueThisWeek) * 100 
                      : 0, 
                    100
                  )}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Task Breakdown */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Task Status</h3>
            <span className="text-2xl">📊</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">Not Started</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.tasks.notStarted}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">In Progress</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.tasks.inProgress}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">Completed</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.tasks.completed}</span>
            </div>
          </div>
        </div>

        {/* Team Activity */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Team</h3>
            <span className="text-2xl">👨‍💼</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Staff</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.staff.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Today</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{stats.staff.activeToday}</span>
            </div>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-xs font-semibold">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
              {stats.staff.total > 5 && (
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 border-2 border-white dark:border-gray-900 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-semibold">
                  +{stats.staff.total - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button 
              onClick={() => navigate("/tasks")}
              className="w-full text-left px-4 py-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-blue-700 dark:text-blue-300 text-sm transition-colors"
            >
              ➕ Create New Task
            </button>
            <button 
              onClick={() => navigate("/clients/create")}
              className="w-full text-left px-4 py-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg text-green-700 dark:text-green-300 text-sm transition-colors"
            >
              👤 Add New Client
            </button>
            <button 
              onClick={() => navigate("/billing/settings")}
              className="w-full text-left px-4 py-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg text-purple-700 dark:text-purple-300 text-sm transition-colors"
            >
              💳 Manage Billing
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-lg">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatTime(activity.time)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm italic">No recent activity yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
