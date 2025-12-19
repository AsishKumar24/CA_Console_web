import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";

interface Client {
  _id: string;
  name: string;
  code?: string;
  mobile: string;
  email?: string;
  type?: string;
  isActive: boolean;
  createdAt: string;
}

export default function ClientList() {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/clients`, {
        params: { 
          page, 
          limit, 
          search,
          isActive: statusFilter === "all" ? undefined : statusFilter === "active"
        },
        withCredentials: true
      });

      setClients(res.data.clients);
      setTotalPages(res.data.pagination.totalPages);
      setTotal(res.data.pagination.total);
    } catch (err) {
      console.error("Failed to fetch clients", err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients();
    }, 300);

    return () => clearTimeout(timer);
  }, [page, search, statusFilter]);

  const copyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Client List
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage and view all your clients
          </p>
        </div>

        <Button onClick={() => navigate("/clients/create")}>
          + Add Client
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Clients</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
            {total}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
          <p className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-1">
            {clients.filter(c => c.isActive).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Inactive</p>
          <p className="text-2xl font-semibold text-red-600 dark:text-red-400 mt-1">
            {clients.filter(c => !c.isActive).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by name, code, mobile..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value as any);
          }}
          className="h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading clients...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
              {search ? "No clients found" : "No clients yet"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {search ? "Try a different search term" : "Get started by adding your first client"}
            </p>
            {!search && (
              <Button onClick={() => navigate("/clients/create")}>
                + Add Your First Client
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Name</th>
                  <th className="px-6 py-3 text-left font-semibold">Code</th>
                  <th className="px-6 py-3 text-left font-semibold">Mobile</th>
                  <th className="px-6 py-3 text-left font-semibold">Type</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {clients.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => navigate(`/clients/${c._id}`)}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {c.name}
                      </div>
                      {c.email && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {c.email}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {c.code ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                          {c.code}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {c.mobile}
                    </td>

                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {c.type || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          c.isActive
                            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                            : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                        }`}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => copyId(e, c._id)}
                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        {copied === c._id ? "✓ Copied!" : "Copy ID"}
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
      {!loading && clients.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium">{clients.length}</span> of{" "}
            <span className="font-medium">{total}</span> clients
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
