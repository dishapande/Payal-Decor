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

export const Route = createFileRoute("/dispatch")({
  component: DispatchPage,
});

const API_BASE = (
  import.meta.env["VITE_API_URL"] || "http://localhost:5001/api"
).replace(/\/+$/, "");

const STATUSES = [
  "Pending",
  "Dispatched",
  "In Transit",
  "Delivered",
  "Cancelled",
] as const;

type DispatchStatus = (typeof STATUSES)[number];

interface Dispatch {
  id: string;
  dispatchNo: string;
  workOrderNo: string | null;
  salesOrderNo: string | null;
  customerId: string | null;
  customerName: string;
  projectName: string | null;
  deliveryAddress: string;
  vehicleNo: string | null;
  driverName: string | null;
  driverPhone: string | null;
  transporter: string | null;
  challanNo: string | null;
  dispatchDate: string;
  expectedDelivery: string | null;
  deliveredDate: string | null;
  receivedBy: string | null;
  status: DispatchStatus;
  notes: string | null;
}

interface CustomerOption {
  id: string;
  name: string;
  company: string;
  address?: string | null;
}

interface WorkOrderOption {
  id: string;
  workOrderNo: string;
  customerId?: string | null;
  customerName: string;
  projectName: string;
}

interface SalesOrderOption {
  id: string;
  orderNo: string;
  customerId?: string | null;
  customerName: string;
  projectName: string;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm = () => ({
  workOrderNo: "",
  salesOrderNo: "",
  customerId: "",
  customerName: "",
  projectName: "",
  deliveryAddress: "",
  vehicleNo: "",
  driverName: "",
  driverPhone: "",
  transporter: "",
  challanNo: "",
  dispatchDate: todayString(),
  expectedDelivery: "",
  deliveredDate: "",
  receivedBy: "",
  status: "Pending" as DispatchStatus,
  notes: "",
});

type FormState = ReturnType<typeof emptyForm>;

const STATUS_STYLE: Record<DispatchStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Dispatched: "bg-blue-100 text-blue-800",
  "In Transit": "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

async function readResponse(response: Response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

async function fetchList<T>(path: string, key: string): Promise<T[]> {
  try {
    const response = await fetch(`${API_BASE}${path}`);
    const data = await readResponse(response);
    return Array.isArray(data) ? data : (data[key] ?? []);
  } catch {
    return [];
  }
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

function DispatchPage() {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrderOption[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrderOption[]>([]);

  const [form, setForm] = useState<FormState>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadDispatches = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/dispatches`);
      const data = await readResponse(response);
      setDispatches(data.dispatches ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Dispatches could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDispatches();

    void (async () => {
      const [c, w, s] = await Promise.all([
        fetchList<CustomerOption>("/crm/customers", "customers"),
        fetchList<WorkOrderOption>("/work-orders", "workOrders"),
        fetchList<SalesOrderOption>("/sales-orders", "salesOrders"),
      ]);
      setCustomers(c);
      setWorkOrders(w);
      setSalesOrders(s);
    })();
  }, [loadDispatches]);

  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const status of STATUSES) {
      result[status] = dispatches.filter((d) => d.status === status).length;
    }
    return result;
  }, [dispatches]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return dispatches.filter((d) => {
      if (statusFilter !== "All" && d.status !== statusFilter) return false;
      if (!query) return true;

      return [
        d.dispatchNo,
        d.customerName,
        d.projectName,
        d.workOrderNo,
        d.salesOrderNo,
        d.vehicleNo,
        d.driverName,
        d.challanNo,
        d.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [dispatches, search, statusFilter]);

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function pickCustomer(id: string) {
    const customer = customers.find((c) => c.id === id);

    setForm((previous) => ({
      ...previous,
      customerId: id,
      customerName: customer ? customer.name : previous.customerName,
      deliveryAddress:
        customer?.address && !previous.deliveryAddress
          ? customer.address
          : previous.deliveryAddress,
    }));
  }

  function pickWorkOrder(workOrderNo: string) {
    const wo = workOrders.find((w) => w.workOrderNo === workOrderNo);

    setForm((previous) => ({
      ...previous,
      workOrderNo,
      customerId: wo?.customerId || previous.customerId,
      customerName: wo ? wo.customerName : previous.customerName,
      projectName: wo ? wo.projectName : previous.projectName,
    }));
  }

  function pickSalesOrder(orderNo: string) {
    const so = salesOrders.find((s) => s.orderNo === orderNo);

    setForm((previous) => ({
      ...previous,
      salesOrderNo: orderNo,
      customerId: so?.customerId || previous.customerId,
      customerName: so ? so.customerName : previous.customerName,
      projectName: so ? so.projectName : previous.projectName,
    }));
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm());
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(d: Dispatch) {
    setEditingId(d.id);

    setForm({
      workOrderNo: d.workOrderNo ?? "",
      salesOrderNo: d.salesOrderNo ?? "",
      customerId: d.customerId ?? "",
      customerName: d.customerName ?? "",
      projectName: d.projectName ?? "",
      deliveryAddress: d.deliveryAddress ?? "",
      vehicleNo: d.vehicleNo ?? "",
      driverName: d.driverName ?? "",
      driverPhone: d.driverPhone ?? "",
      transporter: d.transporter ?? "",
      challanNo: d.challanNo ?? "",
      dispatchDate: dateInput(d.dispatchDate) || todayString(),
      expectedDelivery: dateInput(d.expectedDelivery),
      deliveredDate: dateInput(d.deliveredDate),
      receivedBy: d.receivedBy ?? "",
      status: d.status,
      notes: d.notes ?? "",
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
        ? `${API_BASE}/dispatches/${encodeURIComponent(editingId)}`
        : `${API_BASE}/dispatches`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      await readResponse(response);
      setSuccess(editingId ? "Dispatch updated." : "Dispatch created.");
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm());
      await loadDispatches();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Dispatch could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(d: Dispatch, status: DispatchStatus) {
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE}/dispatches/${encodeURIComponent(d.id)}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );

      await readResponse(response);
      setSuccess(`${d.dispatchNo} status updated to ${status}.`);
      await loadDispatches();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Status could not be updated.",
      );
    }
  }

  async function deleteDispatch(d: Dispatch) {
    const confirmed = window.confirm(
      `Delete dispatch ${d.dispatchNo} (${d.customerName})?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE}/dispatches/${encodeURIComponent(d.id)}`,
        { method: "DELETE" },
      );

      await readResponse(response);
      setSuccess("Dispatch deleted.");
      await loadDispatches();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Dispatch could not be deleted.",
      );
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <AppShell title="Dispatch & Delivery">
      <div className="space-y-5 p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Truck className="h-6 w-6" />
              Dispatch & Delivery
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Track vehicles, drivers and deliveries for every work order.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void loadDispatches()}
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
              New Dispatch
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
            <p className="text-sm text-gray-500">Total Dispatches</p>
            <p className="mt-1 text-2xl font-bold">{dispatches.length}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="mt-1 text-2xl font-bold">{counts["Pending"]}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-500">Dispatched</p>
            <p className="mt-1 text-2xl font-bold">{counts["Dispatched"]}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-500">In Transit</p>
            <p className="mt-1 text-2xl font-bold">{counts["In Transit"]}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-500">Delivered</p>
            <p className="mt-1 text-2xl font-bold">{counts["Delivered"]}</p>
          </div>
        </div>

        {showForm && (
          <section className="rounded-xl border bg-white p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit Dispatch" : "New Dispatch"}
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
                  <span>Work Order (optional)</span>
                  <select
                    className={inputClass}
                    value={form.workOrderNo}
                    onChange={(e) => pickWorkOrder(e.target.value)}
                  >
                    <option value="">— Select Work Order —</option>
                    {workOrders.map((w) => (
                      <option key={w.id} value={w.workOrderNo}>
                        {w.workOrderNo} · {w.customerName}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span>Sales Order (optional)</span>
                  <select
                    className={inputClass}
                    value={form.salesOrderNo}
                    onChange={(e) => pickSalesOrder(e.target.value)}
                  >
                    <option value="">— Select Sales Order —</option>
                    {salesOrders.map((s) => (
                      <option key={s.id} value={s.orderNo}>
                        {s.orderNo} · {s.customerName}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span>CRM Customer (optional)</span>
                  <select
                    className={inputClass}
                    value={form.customerId}
                    onChange={(e) => pickCustomer(e.target.value)}
                  >
                    <option value="">— Select Customer —</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} · {c.company}
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
                  <span>Status</span>
                  <select
                    className={inputClass}
                    value={form.status}
                    onChange={(e) =>
                      updateField("status", e.target.value as DispatchStatus)
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
                  <span>Vehicle No.</span>
                  <input
                    className={inputClass}
                    value={form.vehicleNo}
                    onChange={(e) => updateField("vehicleNo", e.target.value)}
                    placeholder="MH10 AB 1234"
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Driver Name</span>
                  <input
                    className={inputClass}
                    value={form.driverName}
                    onChange={(e) => updateField("driverName", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Driver Phone</span>
                  <input
                    className={inputClass}
                    value={form.driverPhone}
                    onChange={(e) => updateField("driverPhone", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Transporter</span>
                  <input
                    className={inputClass}
                    value={form.transporter}
                    onChange={(e) => updateField("transporter", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Challan / LR No.</span>
                  <input
                    className={inputClass}
                    value={form.challanNo}
                    onChange={(e) => updateField("challanNo", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Dispatch Date</span>
                  <input
                    className={inputClass}
                    type="date"
                    value={form.dispatchDate}
                    onChange={(e) => updateField("dispatchDate", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Expected Delivery</span>
                  <input
                    className={inputClass}
                    type="date"
                    value={form.expectedDelivery}
                    onChange={(e) =>
                      updateField("expectedDelivery", e.target.value)
                    }
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Delivered Date</span>
                  <input
                    className={inputClass}
                    type="date"
                    value={form.deliveredDate}
                    onChange={(e) => updateField("deliveredDate", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Received By</span>
                  <input
                    className={inputClass}
                    value={form.receivedBy}
                    onChange={(e) => updateField("receivedBy", e.target.value)}
                  />
                </label>
              </div>

              <label className="block space-y-1 text-sm">
                <span>Delivery Address *</span>
                <textarea
                  className={inputClass}
                  rows={2}
                  required
                  value={form.deliveryAddress}
                  onChange={(e) => updateField("deliveryAddress", e.target.value)}
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
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Dispatch"
                      : "Save Dispatch"}
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
            <h2 className="font-semibold">Dispatch Records</h2>

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
                  placeholder="Search dispatches..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <p className="p-6 text-sm text-gray-500">Loading dispatches...</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">
              No dispatch records found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-3">Dispatch No.</th>
                    <th className="p-3">Customer / Project</th>
                    <th className="p-3">Work Order</th>
                    <th className="p-3">Vehicle / Driver</th>
                    <th className="p-3">Dispatch Date</th>
                    <th className="p-3">Expected</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{d.dispatchNo}</td>
                      <td className="p-3">
                        <div className="font-medium">{d.customerName}</div>
                        <div className="text-xs text-gray-500">
                          {d.projectName || "—"}
                        </div>
                      </td>
                      <td className="p-3">{d.workOrderNo || "—"}</td>
                      <td className="p-3">
                        <div>{d.vehicleNo || "—"}</div>
                        <div className="text-xs text-gray-500">
                          {[d.driverName, d.driverPhone]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </div>
                      </td>
                      <td className="p-3">{formatDate(d.dispatchDate)}</td>
                      <td className="p-3">
                        {d.status === "Delivered"
                          ? `Delivered ${formatDate(d.deliveredDate)}`
                          : formatDate(d.expectedDelivery)}
                      </td>
                      <td className="p-3">
                        <select
                          value={d.status}
                          onChange={(e) =>
                            void changeStatus(
                              d,
                              e.target.value as DispatchStatus,
                            )
                          }
                          className={`rounded-full border-0 px-2 py-1 text-xs font-medium ${STATUS_STYLE[d.status]}`}
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
                            onClick={() => openEditForm(d)}
                            aria-label="Edit dispatch"
                            className="rounded p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteDispatch(d)}
                            aria-label="Delete dispatch"
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