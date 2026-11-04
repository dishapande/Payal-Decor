import { createFileRoute } from "@tanstack/react-router";
import {
  Wrench,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/erp/AppShell";

export const Route = createFileRoute("/installation")({
  component: InstallationPage,
});

const API_BASE = (
  import.meta.env["VITE_API_URL"] || "http://localhost:5001/api"
).replace(/\/+$/, "");

const STATUSES = [
  "Pending",
  "Scheduled",
  "In Progress",
  "Completed",
  "Cancelled",
] as const;

type InstallationStatus = (typeof STATUSES)[number];

interface Installation {
  id: string;
  installationNo: string;
  dispatchNo: string | null;
  workOrderNo: string | null;
  customerId: string | null;
  customerName: string;
  projectName: string | null;
  siteAddress: string;
  installerName: string | null;
  installerPhone: string | null;
  scheduledDate: string | null;
  completedDate: string | null;
  signedOffBy: string | null;
  status: InstallationStatus;
  notes: string | null;
}

interface DispatchOption {
  id: string;
  dispatchNo: string;
  workOrderNo: string | null;
  customerId: string | null;
  customerName: string;
  projectName: string | null;
  deliveryAddress: string;
  status: string;
}

const emptyForm = () => ({
  dispatchNo: "",
  workOrderNo: "",
  customerId: "",
  customerName: "",
  projectName: "",
  siteAddress: "",
  installerName: "",
  installerPhone: "",
  scheduledDate: "",
  completedDate: "",
  signedOffBy: "",
  status: "Pending" as InstallationStatus,
  notes: "",
});

type FormState = ReturnType<typeof emptyForm>;

const STATUS_STYLE: Record<InstallationStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Scheduled: "bg-blue-100 text-blue-800",
  "In Progress": "bg-purple-100 text-purple-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

async function readResponse(response: Response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function dateInput(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

function InstallationPage() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [dispatches, setDispatches] = useState<DispatchOption[]>([]);

  const [form, setForm] = useState<FormState>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadInstallations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/installations`);
      const data = await readResponse(response);
      setInstallations(data.installations ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Installations could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInstallations();

    void (async () => {
      try {
        const response = await fetch(`${API_BASE}/dispatches`);
        const data = await readResponse(response);
        setDispatches(data.dispatches ?? []);
      } catch {
        setDispatches([]);
      }
    })();
  }, [loadInstallations]);

  // फक्त Delivered dispatches दाखवायचे
  const deliveredDispatches = useMemo(
    () => dispatches.filter((d) => d.status === "Delivered"),
    [dispatches],
  );

  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const status of STATUSES) {
      result[status] = installations.filter((i) => i.status === status).length;
    }
    return result;
  }, [installations]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return installations.filter((i) => {
      if (statusFilter !== "All" && i.status !== statusFilter) return false;
      if (!query) return true;

      return [
        i.installationNo,
        i.customerName,
        i.projectName,
        i.dispatchNo,
        i.workOrderNo,
        i.installerName,
        i.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [installations, search, statusFilter]);

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function pickDispatch(dispatchNo: string) {
    const d = dispatches.find((x) => x.dispatchNo === dispatchNo);

    setForm((previous) => ({
      ...previous,
      dispatchNo,
      workOrderNo: d?.workOrderNo ?? previous.workOrderNo,
      customerId: d?.customerId ?? previous.customerId,
      customerName: d ? d.customerName : previous.customerName,
      projectName: d?.projectName ?? previous.projectName,
      siteAddress: d ? d.deliveryAddress : previous.siteAddress,
    }));
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm());
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(i: Installation) {
    setEditingId(i.id);

    setForm({
      dispatchNo: i.dispatchNo ?? "",
      workOrderNo: i.workOrderNo ?? "",
      customerId: i.customerId ?? "",
      customerName: i.customerName ?? "",
      projectName: i.projectName ?? "",
      siteAddress: i.siteAddress ?? "",
      installerName: i.installerName ?? "",
      installerPhone: i.installerPhone ?? "",
      scheduledDate: dateInput(i.scheduledDate),
      completedDate: dateInput(i.completedDate),
      signedOffBy: i.signedOffBy ?? "",
      status: i.status,
      notes: i.notes ?? "",
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
        ? `${API_BASE}/installations/${encodeURIComponent(editingId)}`
        : `${API_BASE}/installations`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      await readResponse(response);
      setSuccess(editingId ? "Installation updated." : "Installation created.");
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm());
      await loadInstallations();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Installation could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(i: Installation, status: InstallationStatus) {
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE}/installations/${encodeURIComponent(i.id)}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );

      await readResponse(response);
      setSuccess(`${i.installationNo} status updated to ${status}.`);
      await loadInstallations();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Status could not be updated.",
      );
    }
  }

  async function deleteInstallation(i: Installation) {
    const confirmed = window.confirm(
      `Delete installation ${i.installationNo} (${i.customerName})?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE}/installations/${encodeURIComponent(i.id)}`,
        { method: "DELETE" },
      );

      await readResponse(response);
      setSuccess("Installation deleted.");
      await loadInstallations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Installation could not be deleted.",
      );
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <AppShell title="Installation">
      <div className="space-y-5 p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Wrench className="h-6 w-6" />
              Installation
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Track site installations for every delivered dispatch.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void loadInstallations()}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              New Installation
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

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-500">Total Installations</p>
            <p className="mt-1 text-2xl font-bold">{installations.length}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="mt-1 text-2xl font-bold">{counts["Pending"]}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-500">Scheduled</p>
            <p className="mt-1 text-2xl font-bold">{counts["Scheduled"]}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="mt-1 text-2xl font-bold">{counts["In Progress"]}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="mt-1 text-2xl font-bold">{counts["Completed"]}</p>
          </div>
        </div>

        {showForm && (
          <section className="rounded-xl border bg-white p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit Installation" : "New Installation"}
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
                  <span>Delivered Dispatch (optional)</span>
                  <select
                    className={inputClass}
                    value={form.dispatchNo}
                    onChange={(e) => pickDispatch(e.target.value)}
                  >
                    <option value="">— Select Dispatch —</option>
                    {deliveredDispatches.map((d) => (
                      <option key={d.id} value={d.dispatchNo}>
                        {d.dispatchNo} · {d.customerName}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span>Work Order No.</span>
                  <input
                    className={inputClass}
                    value={form.workOrderNo}
                    onChange={(e) => updateField("workOrderNo", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Status</span>
                  <select
                    className={inputClass}
                    value={form.status}
                    onChange={(e) =>
                      updateField("status", e.target.value as InstallationStatus)
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span>Customer Name *</span>
                  <input
                    className={inputClass}
                    required
                    value={form.customerName}
                    onChange={(e) => updateField("customerName", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Project Name</span>
                  <input
                    className={inputClass}
                    value={form.projectName}
                    onChange={(e) => updateField("projectName", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Installer / Team</span>
                  <input
                    className={inputClass}
                    value={form.installerName}
                    onChange={(e) => updateField("installerName", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Installer Phone</span>
                  <input
                    className={inputClass}
                    value={form.installerPhone}
                    onChange={(e) =>
                      updateField("installerPhone", e.target.value)
                    }
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Scheduled Date</span>
                  <input
                    className={inputClass}
                    type="date"
                    value={form.scheduledDate}
                    onChange={(e) => updateField("scheduledDate", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Completed Date</span>
                  <input
                    className={inputClass}
                    type="date"
                    value={form.completedDate}
                    onChange={(e) => updateField("completedDate", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Customer Sign-off (name)</span>
                  <input
                    className={inputClass}
                    value={form.signedOffBy}
                    onChange={(e) => updateField("signedOffBy", e.target.value)}
                  />
                </label>
              </div>

              <label className="block space-y-1 text-sm">
                <span>Site Address *</span>
                <textarea
                  className={inputClass}
                  rows={2}
                  required
                  value={form.siteAddress}
                  onChange={(e) => updateField("siteAddress", e.target.value)}
                />
              </label>

              <label className="block space-y-1 text-sm">
                <span>Notes / Remarks</span>
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
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Installation"
                      : "Save Installation"}
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
            <h2 className="font-semibold">Installation Records</h2>

            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                className={`${inputClass} sm:w-44`}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  className={`${inputClass} pl-9`}
                  placeholder="Search installations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <p className="p-6 text-sm text-gray-500">Loading installations...</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">
              No installation records found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-3">Installation No.</th>
                    <th className="p-3">Customer / Project</th>
                    <th className="p-3">Dispatch / Work Order</th>
                    <th className="p-3">Installer</th>
                    <th className="p-3">Scheduled</th>
                    <th className="p-3">Completed</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((i) => (
                    <tr key={i.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{i.installationNo}</td>
                      <td className="p-3">
                        <div className="font-medium">{i.customerName}</div>
                        <div className="text-xs text-gray-500">
                          {i.projectName || "—"}
                        </div>
                      </td>
                      <td className="p-3">
                        <div>{i.dispatchNo || "—"}</div>
                        <div className="text-xs text-gray-500">
                          {i.workOrderNo || "—"}
                        </div>
                      </td>
                      <td className="p-3">
                        <div>{i.installerName || "—"}</div>
                        <div className="text-xs text-gray-500">
                          {i.installerPhone || ""}
                        </div>
                      </td>
                      <td className="p-3">{formatDate(i.scheduledDate)}</td>
                      <td className="p-3">{formatDate(i.completedDate)}</td>
                      <td className="p-3">
                        <select
                          value={i.status}
                          onChange={(e) =>
                            void changeStatus(
                              i,
                              e.target.value as InstallationStatus,
                            )
                          }
                          className={`rounded-full border-0 px-2 py-1 text-xs font-medium ${STATUS_STYLE[i.status]}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(i)}
                            aria-label="Edit installation"
                            className="rounded p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteInstallation(i)}
                            aria-label="Delete installation"
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