import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { Trash2, UserX, Users, AlertCircle, CheckCircle2, FileText } from "lucide-react";

interface InactiveStaff {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  lastActive?: string;
  createdAt: string;
}

interface InactiveClient {
  _id: string;
  name: string;
  code: string;
  email?: string;
  mobile?: string;
  createdAt: string;
}

export default function InactiveCleanup() {
  const [staff, setStaff] = useState<InactiveStaff[]>([]);
  const [clients, setClients] = useState<InactiveClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchInactiveEntities = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/management/inactive-entities`, {
        withCredentials: true
      });
      setStaff(res.data.data.staff);
      setClients(res.data.data.clients);
    } catch (err) {
      console.error("Failed to fetch inactive entities", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInactiveEntities();
  }, []);

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm('⚠️ PERMANENT DELETION\n\nThis will permanently delete this staff member.\n\nTheir completed tasks will be preserved with a "Legacy" attribution.\n\nThis action cannot be undone. Continue?')) {
      return;
    }

    try {
      setDeleting(id); // Keep loading state for UI feedback
      const res = await axios.delete(`${BASE_URL}/api/management/inactive-staff/${id}`, {
        withCredentials: true
      });
      
      // Show detailed success message with statistics
      if (res.data.stats) {
        alert(`✅ Staff Deleted Successfully\n\n` +
              `Name: ${res.data.stats.staffName}\n` +
              `Tasks Preserved: ${res.data.stats.tasksPreserved}\n\n` +
              `All tasks have been marked with legacy attribution.`);
      } else {
        alert('Staff member deleted successfully');
      }
      
      fetchInactiveEntities(); // Refresh the list after deletion
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to delete staff');
    } finally {
      setDeleting(null); // Reset deleting state
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!window.confirm("Are you sure you want to PERMANENTLY delete this client and all their archived tasks? This cannot be undone.")) return;
    
    try {
      setDeleting(clientId);
      await axios.delete(`${BASE_URL}/api/management/clients/${clientId}`, {
        withCredentials: true
      });
      setClients(prev => prev.filter(c => c._id !== clientId));
      setMessage({ type: 'success', text: 'Client and archived tasks deleted successfully' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to delete client' });
    } finally {
      setDeleting(null);
      setTimeout(() => setMessage(null), 5000);
    }
  };

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
        <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          Cleanup Console
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Permanently remove inactive entities from your workspace
        </p>
      </div>

      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400' 
            : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Inactive Staff Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <UserX size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Inactive Staff</h2>
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-semibold">
              {staff.length}
            </span>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            {staff.length === 0 ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                No inactive staff members found.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {staff.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white">{s.firstName} {s.lastName}</div>
                        <div className="text-xs text-gray-500">{s.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-400">Created: {formatDate(s.createdAt)}</div>
                        <div className="text-xs text-gray-400">Last Seen: {s.lastActive ? formatDate(s.lastActive) : 'Never'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => window.location.href = '/management/staff-tasks'}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                            title="View Staff Tasks"
                          >
                            <FileText size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(s._id)}
                            disabled={deleting === s._id}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Staff Permanently"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Inactive Clients Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
              <Users size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Inactive Clients</h2>
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-semibold">
              {clients.length}
            </span>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            {clients.length === 0 ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                No inactive clients found.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-4">Client Details</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {clients.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white">{c.name}</div>
                        <div className="text-xs text-gray-500">Code: {c.code}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteClient(c._id)}
                          disabled={deleting === c._id}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 p-6 rounded-2xl flex gap-4">
        <AlertCircle className="text-orange-600 dark:text-orange-400 shrink-0" size={24} />
        <div className="space-y-3">
          <h3 className="font-bold text-orange-900 dark:text-orange-300">Important Administrative Note</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase text-orange-600 dark:text-orange-500 tracking-wider">Clients Deletion</p>
              <p className="text-sm text-orange-800/80 dark:text-orange-400/80 leading-relaxed">
                Deleting a client is <strong>total</strong>. All their profiles and <span className="font-semibold px-1 rounded bg-orange-200/50 dark:bg-orange-800/30">ALL archived tasks</span> will be permanently wiped. 
                <span className="block mt-1 font-medium text-orange-900 dark:text-orange-200 underline decoration-orange-300 dark:decoration-orange-700">
                  Note: You cannot delete a client if they still have "Active" (non-archived) tasks. You must archive them first.
                </span>
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold uppercase text-orange-600 dark:text-orange-500 tracking-wider">Staff Deletion</p>
              <p className="text-sm text-orange-800/80 dark:text-orange-400/80 leading-relaxed">
                Deleting staff removes their access, but their <strong>work history is preserved</strong>. Archived tasks they completed stay in the system to protect your firm's audit trail and records.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-orange-200/50 dark:border-orange-800/50">
            <p className="text-xs text-orange-800/60 dark:text-orange-400/60 flex items-center gap-2">
              <CheckCircle2 size={12} />
              Admin accounts are protected and cannot be deleted via this console.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
