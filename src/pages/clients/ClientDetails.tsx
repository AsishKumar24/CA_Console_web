import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";

interface Client {
  _id: string;
  name: string;
  code?: string;
  mobile: string;
  alternateMobile?: string;
  email?: string;
  pan?: string;
  gstin?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export default function ClientProfile() {
  const { id } = useParams();

  const [client, setClient] = useState<Client | null>(null);
  const [form, setForm] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  
  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/clients/${id}`, {
          withCredentials: true
        });
        setClient(res.data.client);
        setForm(res.data.client);
      } catch (err) {
        console.error("Failed to load client");
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!form || !client) return;

    try {
      setSaving(true);
      const res = await axios.patch(
        `${BASE_URL}/api/clients/${client._id}`,
        form,
        { withCredentials: true }
      );

      setClient(res.data.client);
      setForm(res.data.client);
      setEditMode(false);
    } catch (err) {
      console.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading…</div>;
  }

  if (!client || !form) {
    return <div className="p-6 text-sm text-red-500">Client not found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {client.name}
          </h1>
          <p className="text-sm text-gray-500">Client profile</p>
        </div>

        <div className="flex gap-2">
          {!editMode ? (
            <Button size="sm" onClick={() => setEditMode(true)}>
              Edit Client
            </Button>
          ) : (
            <>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setForm(client);
                  setEditMode(false);
                }}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* BASIC INFO */}
      <Card title="Basic Information">
        <Grid>
          <EditableField
            label="Client Name"
            value={form.name}
            editMode={editMode}
            onChange={(v) => setForm({ ...form, name: v })}
          />

          <EditableField
            label="Client Code"
            value={form.code || ""}
            editMode={editMode}
            onChange={(v) => setForm({ ...form, code: v })}
          />

          <EditableField
            label="Primary Mobile"
            value={form.mobile}
            editMode={editMode}
            onChange={(v) => setForm({ ...form, mobile: v })}
          />

          <EditableField
            label="Alternate Mobile"
            value={form.alternateMobile || ""}
            editMode={editMode}
            onChange={(v) =>
              setForm({ ...form, alternateMobile: v })
            }
          />

          <EditableField
            label="Email"
            value={form.email || ""}
            editMode={editMode}
            onChange={(v) => setForm({ ...form, email: v })}
          />

          {/* STATUS TOGGLE */}
          <div>
            <Label>Status</Label>
            {editMode ? (
              <button
                onClick={() =>
                  setForm({ ...form, isActive: !form.isActive })
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  form.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {form.isActive ? "Active" : "Inactive"}
              </button>
            ) : (
              <p
                className={`text-sm font-medium ${
                  client.isActive
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {client.isActive ? "Active" : "Inactive"}
              </p>
            )}
          </div>
        </Grid>
      </Card>

      {/* ADDITIONAL INFO */}
      <Card title="Additional Details">
        <Grid>
          <EditableField
            label="PAN"
            value={form.pan || ""}
            editMode={editMode}
            onChange={(v) => setForm({ ...form, pan: v })}
          />

          <EditableField
            label="GSTIN"
            value={form.gstin || ""}
            editMode={editMode}
            onChange={(v) => setForm({ ...form, gstin: v })}
          />
        </Grid>

        <EditableField
          label="Address"
          value={form.address || ""}
          editMode={editMode}
          onChange={(v) => setForm({ ...form, address: v })}
        />

        <EditableField
          label="Notes"
          value={form.notes || ""}
          editMode={editMode}
          onChange={(v) => setForm({ ...form, notes: v })}
        />
      </Card>
    </div>
  );
}

/* ================= UI HELPERS ================= */

function Card({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </div>
  );
}

function EditableField({
  label,
  value,
  editMode,
  onChange
}: {
  label: string;
  value: string;
  editMode: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {editMode ? (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
          {value || "—"}
        </p>
      )}
    </div>
  );
}
