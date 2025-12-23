import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
import { 
  History, 
  UserX, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText
} from "lucide-react";

interface LegacyTask {
  _id: string;
  title: string;
  status: string;
  isArchived: boolean;
  updatedAt: string;
  client: {
    _id: string;
    name: string;
    code: string;
  };
  assignedTo: {
    _id: string;
    firstName: string;
    lastName?: string;
    email: string;
  };
  legacyAssignedName?: string;
}

export default function InactiveStaffTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<LegacyTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInactiveStaffTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/management/inactive-staff-tasks`, {
        withCredentials: true
      });
      setTasks(res.data.tasks);
    } catch (err) {
      console.error("Failed to fetch inactive staff tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInactiveStaffTasks();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400">
            <History size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Inactive Staff Tasks
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          Viewing work history for deactivated staff members
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {tasks.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
              <FileText size={32} />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">No tasks found</p>
              <p className="text-sm text-gray-500">There are no tasks assigned to currently inactive staff members.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4">Task Details</th>
                  <th className="px-6 py-4">Assigned To (Inactive)</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white line-clamp-1">{task.title}</div>
                      <div className="text-xs text-gray-400">Last updated: {formatDate(task.updatedAt)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <UserX size={14} className="text-red-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {task.assignedTo ? (
                              `${task.assignedTo.firstName} ${task.assignedTo.lastName || ''}`
                            ) : task.legacyAssignedName ? (
                              <span className="flex items-center gap-1.5 font-bold italic text-gray-400">
                                {task.legacyAssignedName} <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">Legacy</span>
                              </span>
                            ) : (
                              "Unassigned"
                            )}
                          </p>
                          {task.assignedTo?.email && (
                            <p className="text-[10px] text-gray-500">{task.assignedTo.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {task.client?.name}
                      <span className="block text-[10px] text-gray-400">{task.client?.code}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {task.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 text-[10px] font-bold uppercase">
                            <CheckCircle2 size={10} /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400 text-[10px] font-bold uppercase">
                            <Clock size={10} /> {task.status.replace('_', ' ')}
                          </span>
                        )}
                        {task.isArchived && (
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-[10px] font-bold uppercase">
                            Archived
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/tasks/${task._id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View Full Details"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-2xl flex gap-4">
        <AlertCircle className="text-blue-600 dark:text-blue-400 shrink-0" size={24} />
        <div className="space-y-1">
          <h3 className="font-bold text-blue-900 dark:text-blue-300">Staff Work Preservation</h3>
          <p className="text-sm text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
            This page lists all tasks currently assigned to staff who have been deactivated. 
            <strong> Even if a staff member is permanently deleted,</strong> their completed and archived tasks stay in your records for compliance and historical reference.
            You can re-assign these tasks to active staff from the task details page if they are still pending.
          </p>
        </div>
      </div>
    </div>
  );
}
