import { useState } from "react";
import axios from "axios";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { BASE_URL } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
interface Client {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  isActive: boolean;
}

/**
 * Mask helper: shows only first 6 + last 4 chars
 * Example: 65f12b4e9c9a1e001234abcd → 65f12b…abcd
 */
const maskId = (value: string) => {
  if (value.length <= 10) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
};

export default function SearchClient() {
    const navigate = useNavigate()
  const [rawClientId, setRawClientId] = useState(""); // real value
  const [displayValue, setDisplayValue] = useState(""); // masked value

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace("…", "");

    setRawClientId(value);
    setDisplayValue(maskId(value));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setClient(null);

    if (!rawClientId) {
      setError("Please paste the full Client ID");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/api/clients/${rawClientId}`,
        { withCredentials: true }
      );
      setClient(res.data.client);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Client not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Client Lookup
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Paste a client ID copied from the client list
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSearch}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl"
          >
            <div className="px-8 py-6 space-y-4">
              <div>
                <Label>
                  Client ID<span className="text-error-500">*</span>
                </Label>

                <Input
                  placeholder="Paste client ID here"
                  value={displayValue}
                  onChange={handleChange}
                />

                <p className="mt-1 text-xs text-gray-500">
                  ID is masked for safety. Full value is used internally.
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>

            <div className="px-8 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end bg-gray-50 dark:bg-gray-900/40 rounded-b-xl">
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[140px]"
              >
                {loading ? "Searching..." : "Search Client"}
              </Button>
            </div>
          </form>
        </div>

        {/* RIGHT */}
        <aside className="space-y-6">
          {!client && !loading && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-5">
              <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                🔐 Privacy-first lookup
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-blue-700 dark:text-blue-200">
                <li>• Client ID is masked on screen</li>
                <li>• Copy ID from the client list</li>
                <li>• Only owners can access records</li>
              </ul>
            </div>
          )}

          {client && (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-4">
    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
      ✅ Client Found
    </h4>

    <div className="text-sm space-y-2">
      <p>
        <span className="text-gray-500">Name:</span>{" "}
        <span className="font-medium">{client.name}</span>
      </p>

      <p>
        <span className="text-gray-500">Mobile:</span>{" "}
        {client.mobile}
      </p>

      {client.email && (
        <p>
          <span className="text-gray-500">Email:</span>{" "}
          {client.email}
        </p>
      )}

      <p>
        <span className="text-gray-500">Status:</span>{" "}
        <span
          className={`font-medium ${
            client.isActive
              ? "text-green-600"
              : "text-red-500"
          }`}
        >
          {client.isActive ? "Active" : "Inactive"}
        </span>
      </p>
    </div>

    {/* ACTIONS */}
    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
      <Button
        size="sm"
        variant="outline"
        onClick={() => navigate(`/clients/${client._id}`)}
      >
        Edit Client Details
      </Button>
    </div>
  </div>
)}

        </aside>
      </div>
    </div>
  );
}
