import { createFileRoute } from "@tanstack/react-router";
import {
  Truck,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/erp/AppShell";

export const Route = createFileRoute("/vendors")({
  component: VendorsPage,
});

const API_BASE = (
  import.meta.env["VITE_API_URL"] || "http://localhost:5001/api"
).replace(/\/+$/, "");

type VendorStatus = "Active" | "Inactive";

interface Vendor {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  category: string;
  city: string;
  status: VendorStatus;
  gstin: string;
  address: string;
  state: string;
  pincode: string;
  contactPerson: string;
  notes: string;
}

const emptyForm: Omit<Vendor, "id"> = {
  name: "",
  company: "",
  phone: "",
  email: "",
  category: "",
  city: "",
  status: "Active",
  gstin: "",
  address: "",
  state: "",
  pincode: "",
  contactPerson: "",
  notes: "",
};

const categories = [
  "Plywood",
  "Laminates",
  "Hardware",
  "Edge Band",
  "Glass",
  "Fabric",
  "Other",
];

async function readResponse(response: Response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadVendors = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/vendors`);
      const data = await readResponse(response);
      const rows = Array.isArray(data) ? data : data.vendors ?? data.data ?? [];

      setVendors(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vendors load झाले नाहीत.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVendors();
  }, [loadVendors]);

  const filteredVendors = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return vendors;

    return vendors.filter((vendor) =>
      [
        vendor.name,
        vendor.company,
        vendor.phone,
        vendor.email,
        vendor.category,
        vendor.city,
        vendor.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [vendors, search]);

  function updateField<K extends keyof typeof emptyForm>(
    field: K,
    value: (typeof emptyForm)[K],
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function openCreateForm() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(vendor: Vendor) {
    setEditingId(vendor.id);

    setForm({
      name: vendor.name ?? "",
      company: vendor.company ?? "",
      phone: vendor.phone ?? "",
      email: vendor.email ?? "",
      category: vendor.category ?? "",
      city: vendor.city ?? "",
      status: vendor.status ?? "Active",
      gstin: vendor.gstin ?? "",
      address: vendor.address ?? "",
      state: vendor.state ?? "",
      pincode: vendor.pincode ?? "",
      contactPerson: vendor.contactPerson ?? "",
      notes: vendor.notes ?? "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const url = editingId
        ? `${API_BASE}/vendors/${encodeURIComponent(editingId)}`
        : `${API_BASE}/vendors`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      await readResponse(response);
      setSuccess(editingId ? "Vendor update झाला." : "Vendor save झाला.");
      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      await loadVendors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vendor save झाला नाही.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteVendor(vendor: Vendor) {
    const confirmed = window.confirm(
      `${vendor.name} हा vendor delete करायचा आहे का?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE}/vendors/${encodeURIComponent(vendor.id)}`,
        { method: "DELETE" },
      );

      await readResponse(response);
      setSuccess("Vendor delete झाला.");
      await loadVendors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vendor delete झाला नाही.");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100";

  return (
    <AppShell title="Vendors">
      <div className="space-y-5 p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Truck className="h-6 w-6" />
              Vendors
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage suppliers, their contact details and categories.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void loadVendors()}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900"
            >
              <Plus className="h-4 w-4" />
              Add Vendor
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-500">Total Vendors</p>
            <p className="mt-1 text-2xl font-bold">{vendors.length}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-500">Active Vendors</p>
            <p className="mt-1 text-2xl font-bold">
              {vendors.filter((item) => item.status === "Active").length}
            </p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-500">Inactive Vendors</p>
            <p className="mt-1 text-2xl font-bold">
              {vendors.filter((item) => item.status === "Inactive").length}
            </p>
          </div>
        </div>

        {showForm && (
          <section className="rounded-xl border bg-white p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit Vendor" : "Add Vendor"}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
                className="rounded p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <label className="space-y-1 text-sm">
                  <span>Vendor Name *</span>
                  <input
                    className={inputClass}
                    required
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Company Name *</span>
                  <input
                    className={inputClass}
                    required
                    value={form.company}
                    onChange={(e) => updateField("company", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Phone *</span>
                  <input
                    className={inputClass}
                    required
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Email</span>
                  <input
                    className={inputClass}
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Category</span>
                  <select
                    className={inputClass}
                    value={form.category}
                    onChange={(e) => updateField("category", e.target.value)}
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span>Status</span>
                  <select
                    className={inputClass}
                    value={form.status}
                    onChange={(e) =>
                      updateField("status", e.target.value as VendorStatus)
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span>Contact Person</span>
                  <input
                    className={inputClass}
                    value={form.contactPerson}
                    onChange={(e) =>
                      updateField("contactPerson", e.target.value)
                    }
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>GSTIN</span>
                  <input
                    className={inputClass}
                    value={form.gstin}
                    onChange={(e) => updateField("gstin", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>City</span>
                  <input
                    className={inputClass}
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>State</span>
                  <input
                    className={inputClass}
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Pincode</span>
                  <input
                    className={inputClass}
                    value={form.pincode}
                    onChange={(e) => updateField("pincode", e.target.value)}
                  />
                </label>
              </div>

              <label className="block space-y-1 text-sm">
                <span>Address</span>
                <textarea
                  className={inputClass}
                  rows={2}
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                />
              </label>

              <label className="block space-y-1 text-sm">
                <span>Notes</span>
                <textarea
                  className={inputClass}
                  rows={2}
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-amber-800 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Vendor"
                      : "Save Vendor"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border px-5 py-2 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="overflow-hidden rounded-xl border bg-white">
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold">Vendor Records</h2>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                className={`${inputClass} pl-9`}
                placeholder="Search vendors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p className="p-6 text-sm text-gray-500">Loading vendors...</p>
          ) : filteredVendors.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">
              No vendors yet. Use Add Vendor to create the first one.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-3">Vendor</th>
                    <th className="p-3">Company</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">City</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{vendor.name}</td>
                      <td className="p-3">{vendor.company}</td>
                      <td className="p-3">{vendor.category || "—"}</td>
                      <td className="p-3">{vendor.phone}</td>
                      <td className="p-3">{vendor.city || "—"}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                          {vendor.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(vendor)}
                            aria-label="Edit vendor"
                            className="rounded p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteVendor(vendor)}
                            aria-label="Delete vendor"
                            className="rounded p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}