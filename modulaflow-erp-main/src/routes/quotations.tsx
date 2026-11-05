import { createFileRoute } from "@tanstack/react-router";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Eye,
  FileText,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AppShell } from "@/components/erp/AppShell";
import {
  EstimateDocument,
  QUOTATION_TERMS,
  amountInWords,
  calcEstimate,
  type EstimateData,
  type EstimateItem,
} from "@/components/erp/EstimateDocument";

export const Route = createFileRoute("/quotations")({
  component: QuotationsPage,
});

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5001/api"
).replace(/\/+$/, "");

const UNITS = ["Nos", "Sqf", "Sqm", "Rft", "Trip", "Lot", "Set"];

interface CustomerOption {
  id: string;
  name: string;
  company?: string;
  phone?: string;
  address?: string;
}

/** /estimate-docs मधून येणारा PDF-style estimate */
interface EstimateOption {
  id: string;
  estimateNo: string;
  estimateDate?: string;
  customerId: string | null;
  customerName: string;
  customerAddress?: string | null;
  projectName?: string | null;
  placeOfSupply?: string;
  items: EstimateItem[];
  taxRate: number;
  total?: number;
  terms?: string[] | null;
}

interface QuotationItem {
  id: string;
  itemName: string;
  description: string;
  hsn: string;
  sizes: string;
  quantity: number;
  unit: string;
  rate: number;
}

interface Quotation {
  id: string;
  quotationNo: string;
  customerId: string | null;
  customerName: string;
  customerAddress: string;
  projectName: string;
  estimateId:  null;
  quotationDate: string;
  validUntil: string;
  status: string;
  gstRate: number;
  placeOfSupply: string;
  terms: string[];
  notes: string;
  items: QuotationItem[];
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
}

type QuotationForm = {
  customerId: string;
  customerName: string;
  customerAddress: string;
  projectName: string;
  estimateId: string;
  quotationDate: string;
  validUntil: string;
  status: string;
  gstRate: string;
  placeOfSupply: string;
  termsText: string;
  notes: string;
  items: QuotationItem[];
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const PRINT_FIX = `
@media print {
  body > *:not(.est-portal) { display: none !important; }
  .est-overlay {
    position: static !important;
    overflow: visible !important;
    background: #fff !important;
    padding: 0 !important;
  }
}
`;

const emptyItem = (): QuotationItem => ({
  id: crypto.randomUUID(),
  itemName: "",
  description: "",
  hsn: "9403",
  sizes: "",
  quantity: 1,
  unit: "Nos",
  rate: 0,
});

const createEmptyForm = (): QuotationForm => ({
  customerId: "",
  customerName: "",
  customerAddress: "",
  projectName: "",
  estimateId: "",
  quotationDate: new Date().toISOString().slice(0, 10),
  validUntil: "",
  status: "Draft",
  gstRate: "18",
  placeOfSupply: "27-Maharashtra",
  termsText: QUOTATION_TERMS.join("\n"),
  notes: "",
  items: [emptyItem()],
});

async function parseResponse(response: Response): Promise<any> {
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

function getList<T>(data: any, keys: string[]): T[] {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key] as T[];
  }

  return [];
}

function money(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

/** Estimate PDF सारखाच हिशेब: Sub Total + Tax, मग Round off */
function getTotals(items: QuotationItem[], gstRate: number) {
  const { subTotal, taxAmount, roundOff, total } = calcEstimate(
    items.map((i) => ({
      name: i.itemName,
      qty: Math.max(0, Number(i.quantity) || 0),
      price: Math.max(0, Number(i.rate) || 0),
    })),
    gstRate,
  );

  return { subtotal: subTotal, gstAmount: taxAmount, roundOff, grandTotal: total };
}

function createQuotationNumber() {
  // तात्पुरता नंबर. backend ने 2026-27/012 सारखी series दिली तर ती वापरा.
  return `QT-${Date.now()}`;
}

function normalizeItem(row: any): QuotationItem {
  return {
    id: String(row.id ?? crypto.randomUUID()),
    itemName: row.itemName ?? row.name ?? "",
    description: row.description ?? "",
    hsn: row.hsn ?? "9403",
    sizes: row.sizes ?? "",
    quantity: Number(row.quantity ?? row.qty ?? 1),
    unit: row.unit ?? "Nos",
    rate: Number(row.rate ?? row.unitPrice ?? row.price ?? 0),
  };
}

function normalizeQuotation(row: any): Quotation {
  const items = Array.isArray(row.items) ? row.items.map(normalizeItem) : [];
  const gstRate = Number(row.gstRate ?? 18);
  const totals = getTotals(items, gstRate);

  return {
    id: String(row.id),
    quotationNo: row.quotationNo || row.quotationNumber || "QT-PENDING",
    customerId: row.customerId != null ? String(row.customerId) : null,
    customerName: row.customerName ?? row.customer?.name ?? "",
    customerAddress: row.customerAddress ?? row.customer?.address ?? "",
    projectName: row.projectName ?? "",
    estimateId: row.estimateId != null ? String(row.estimateId) : null,
    quotationDate: row.quotationDate ? String(row.quotationDate).slice(0, 10) : "",
    validUntil: row.validUntil ? String(row.validUntil).slice(0, 10) : "",
    status: row.status ?? "Draft",
    gstRate,
    placeOfSupply: row.placeOfSupply ?? "27-Maharashtra",
    terms: Array.isArray(row.terms) ? row.terms : [],
    notes: row.notes ?? "",
    items,
    subtotal: Number(row.subtotal ?? totals.subtotal),
    gstAmount: Number(row.gstAmount ?? totals.gstAmount),
    grandTotal: Number(row.grandTotal ?? totals.grandTotal),
  };
}

function normalizeEstimate(row: any): EstimateOption {
  return {
    ...row,
    id: String(row.id),
    customerId: row.customerId != null ? String(row.customerId) : null,
    items: Array.isArray(row.items) ? row.items : [],
    taxRate: Number(row.taxRate ?? 18),
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

/** Quotation -> PDF component साठी data */
function toDocData(q: Quotation): EstimateData {
  return {
    estimateNo: q.quotationNo,
    date: q.quotationDate || new Date().toISOString().slice(0, 10),
    customerName: q.customerName,
    customerAddress: q.customerAddress || undefined,
    placeOfSupply: q.placeOfSupply,
    items: q.items.map((i) => ({
      name: i.itemName,
      description: i.description,
      hsn: i.hsn,
      sizes: i.sizes,
      qty: i.quantity,
      unit: i.unit,
      price: i.rate,
    })),
    taxRate: q.gstRate,
    terms: q.terms.length
      ? q.terms
      : q.notes
        ? q.notes.split("\n").filter(Boolean)
        : undefined,
  };
}

function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [estimates, setEstimates] = useState<EstimateOption[]>([]);

  const [form, setForm] = useState<QuotationForm>(createEmptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Quotation | null>(null);
  const [preview, setPreview] = useState<EstimateData | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadQuotations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/quotations`);
      const data = await parseResponse(response);
      setQuotations(
        getList<any>(data, ["quotations", "data"]).map(normalizeQuotation),
      );
    } catch (err) {
      setError(getErrorMessage(err, "Quotations could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCustomers = useCallback(async () => {
    const response = await fetch(`${API_BASE}/crm/customers`);
    const data = await parseResponse(response);
    setCustomers(getList<CustomerOption>(data, ["customers", "data"]));
  }, []);

  // PDF-style estimates (EstimateBuilder चाच स्रोत)
  const loadEstimates = useCallback(async () => {
    const response = await fetch(`${API_BASE}/estimate-docs`);
    const data = await parseResponse(response);
    setEstimates(
      getList<any>(data, ["estimates", "data"]).map(normalizeEstimate),
    );
  }, []);

  const loadDropdowns = useCallback(async () => {
    const results = await Promise.allSettled([loadCustomers(), loadEstimates()]);
    const failed = results.find((r) => r.status === "rejected");

    if (failed?.status === "rejected") {
      setError(
        failed.reason instanceof Error
          ? `Customer/Estimate list could not load: ${failed.reason.message}`
          : "Customer/Estimate list could not load.",
      );
    }
  }, [loadCustomers, loadEstimates]);

  useEffect(() => {
    void loadQuotations();
    void loadDropdowns();
  }, [loadQuotations, loadDropdowns]);

  const filteredQuotations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return quotations.filter((item) => {
      const matchesSearch = [
        item.quotationNo,
        item.customerName,
        item.projectName,
        item.status,
      ].some((value) => String(value ?? "").toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [quotations, search, statusFilter]);

  const totals = useMemo(
    () => getTotals(form.items, Number(form.gstRate) || 0),
    [form.items, form.gstRate],
  );

  function setField<K extends keyof QuotationForm>(
    field: K,
    value: QuotationForm[K],
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function selectCustomer(customerId: string) {
    const customer = customers.find((item) => item.id === customerId);

    setForm((previous) => ({
      ...previous,
      customerId,
      customerName: customer?.company || customer?.name || previous.customerName,
      customerAddress: customer?.address ?? previous.customerAddress,
    }));
  }

  /** Estimate निवडला की customer, project, items, tax, terms सगळं भरतं */
  function selectEstimate(estimateId: string) {
    const estimate = estimates.find((item) => item.id === estimateId);

    if (!estimate) {
      setField("estimateId", "");
      return;
    }

    setForm((previous) => ({
      ...previous,
      estimateId,
      customerId: estimate.customerId ?? previous.customerId,
      customerName: estimate.customerName || previous.customerName,
      customerAddress: estimate.customerAddress ?? previous.customerAddress,
      projectName: estimate.projectName || previous.projectName,
      placeOfSupply: estimate.placeOfSupply || previous.placeOfSupply,
      gstRate: String(estimate.taxRate ?? 18),
      termsText: estimate.terms?.length
        ? estimate.terms
            .map((t) => t.replace("Estimate Valid", "Quotation Valid"))
            .join("\n")
        : previous.termsText,
      items: estimate.items.length
        ? estimate.items.map((i) =>
            normalizeItem({
              name: i.name,
              description: i.description,
              hsn: i.hsn,
              sizes: i.sizes,
              qty: i.qty,
              unit: i.unit,
              price: i.price,
            }),
          )
        : previous.items,
    }));
  }

  function openCreate() {
    setEditingId(null);
    setViewing(null);
    setForm(createEmptyForm());
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function openEdit(item: Quotation) {
    setEditingId(item.id);
    setViewing(null);

    setForm({
      customerId: item.customerId ?? "",
      customerName: item.customerName,
      customerAddress: item.customerAddress,
      projectName: item.projectName,
      estimateId: item.estimateId ?? "",
      quotationDate: item.quotationDate,
      validUntil: item.validUntil,
      status: item.status,
      gstRate: String(item.gstRate),
      placeOfSupply: item.placeOfSupply,
      termsText: (item.terms.length ? item.terms : QUOTATION_TERMS).join("\n"),
      notes: item.notes,
      items: item.items.length
        ? item.items.map((row) => ({ ...row }))
        : [emptyItem()],
    });

    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function addItem() {
    setForm((previous) => ({
      ...previous,
      items: [...previous.items, emptyItem()],
    }));
  }

  function removeItem(itemId: string) {
    setForm((previous) => ({
      ...previous,
      items:
        previous.items.length <= 1
          ? previous.items
          : previous.items.filter((item) => item.id !== itemId),
    }));
  }

  function updateItem(
    itemId: string,
    field: keyof QuotationItem,
    value: string | number,
  ) {
    setForm((previous) => ({
      ...previous,
      items: previous.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function validateForm() {
    if (!form.customerId) {
      setError("Please select a CRM customer.");
      return false;
    }
    if (!form.customerName.trim()) {
      setError("Please enter the customer name.");
      return false;
    }
    if (!form.projectName.trim()) {
      setError("Please enter the project name.");
      return false;
    }
    if (!form.quotationDate) {
      setError("Please select the quotation date.");
      return false;
    }
    if (form.validUntil && form.validUntil < form.quotationDate) {
      setError("Validity date cannot be before the quotation date.");
      return false;
    }

    for (const item of form.items) {
      if (!item.itemName.trim()) {
        setError("Please enter an item name for every item.");
        return false;
      }
      if (!Number.isFinite(Number(item.quantity)) || item.quantity <= 0) {
        setError("Quantity must be greater than zero.");
        return false;
      }
      if (!Number.isFinite(Number(item.rate)) || item.rate < 0) {
        setError("Rate cannot be negative.");
        return false;
      }
    }

    const gstRate = Number(form.gstRate);

    if (!Number.isFinite(gstRate) || gstRate < 0 || gstRate > 100) {
      setError("Please enter a valid GST percentage.");
      return false;
    }

    const selectedEstimate = estimates.find((e) => e.id === form.estimateId);

    if (
      selectedEstimate?.customerId &&
      selectedEstimate.customerId !== form.customerId
    ) {
      setError(
        "The selected estimate belongs to a different customer. Please select the correct customer.",
      );
      return false;
    }

    return true;
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setSaving(true);

    try {
      const existing = editingId
        ? quotations.find((item) => item.id === editingId)
        : undefined;

      const quotationTotals = getTotals(form.items, Number(form.gstRate) || 0);

      const payload = {
        quotationNo: existing?.quotationNo ?? createQuotationNumber(),
        customerId: form.customerId,
        customerName: form.customerName.trim(),
        customerAddress: form.customerAddress.trim() || null,
        projectName: form.projectName.trim(),
        estimateId: form.estimateId || null,
        quotationDate: form.quotationDate,
        validUntil: form.validUntil || null,
        status: form.status,
        gstRate: Number(form.gstRate),
        placeOfSupply: form.placeOfSupply.trim(),
        terms: form.termsText
          .split("\n")
          .map((t) => t.trim())
          .filter(Boolean),
        notes: form.notes.trim() || null,
        items: form.items.map((item) => ({
          itemName: item.itemName.trim(),
          description: item.description.trim() || null,
          hsn: item.hsn.trim() || null,
          sizes: item.sizes.trim() || null,
          quantity: Number(item.quantity),
          unit: item.unit,
          rate: Number(item.rate),
          amount: Number((Number(item.quantity) * Number(item.rate)).toFixed(2)),
        })),
        subtotal: quotationTotals.subtotal,
        gstAmount: quotationTotals.gstAmount,
        roundOff: quotationTotals.roundOff,
        grandTotal: quotationTotals.grandTotal,
      };

      const url = editingId
        ? `${API_BASE}/quotations/${encodeURIComponent(editingId)}`
        : `${API_BASE}/quotations`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await parseResponse(response);

      setSuccess(
        editingId
          ? "Quotation updated successfully."
          : "Quotation saved successfully.",
      );

      setShowForm(false);
      setEditingId(null);
      setForm(createEmptyForm());

      await loadQuotations();
      await loadDropdowns();
    } catch (err) {
      setError(getErrorMessage(err, "Quotation could not be saved."));
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuotation(item: Quotation) {
    if (!window.confirm(`Are you sure you want to delete ${item.quotationNo}?`)) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE}/quotations/${encodeURIComponent(item.id)}`,
        { method: "DELETE" },
      );
      await parseResponse(response);

      setSuccess("Quotation deleted successfully.");

      if (viewing?.id === item.id) setViewing(null);

      if (editingId === item.id) {
        setEditingId(null);
        setShowForm(false);
      }

      await loadQuotations();
    } catch (err) {
      setError(getErrorMessage(err, "Quotation could not be deleted."));
    }
  }

  function previewDraft() {
    if (!validateForm()) return;

    const existing = editingId
      ? quotations.find((q) => q.id === editingId)
      : undefined;

    setPreview(
      toDocData({
        id: editingId ?? "draft",
        quotationNo: existing?.quotationNo ?? "(Draft)",
        customerId: form.customerId,
        customerName: form.customerName,
        customerAddress: form.customerAddress,
        projectName: form.projectName,
        estimateId: form.estimateId || null,
        quotationDate: form.quotationDate,
        validUntil: form.validUntil,
        status: form.status,
        gstRate: Number(form.gstRate) || 0,
        placeOfSupply: form.placeOfSupply,
        terms: form.termsText
          .split("\n")
          .map((t) => t.trim())
          .filter(Boolean),
        notes: form.notes,
        items: form.items,
        ...totals,
      }),
    );
  }

  return (
    <AppShell title="Quotation Management">
      <div className="space-y-5 p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quotation Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Create quotations from saved Estimates and download them as PDF.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                void loadQuotations();
                void loadDropdowns();
              }}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Quotation
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total Quotations", value: quotations.length },
            {
              label: "Draft Quotations",
              value: quotations.filter((q) => q.status === "Draft").length,
            },
            {
              label: "Sent Quotations",
              value: quotations.filter((q) => q.status === "Sent").length,
            },
            {
              label: "Accepted Quotations",
              value: quotations.filter((q) => q.status === "Accepted").length,
            },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border bg-white p-5">
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {showForm && (
          <section className="rounded-xl border bg-white p-4 md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit Quotation" : "Create Quotation"}
              </h2>

              <button
                type="button"
                aria-label="Close quotation form"
                onClick={() => setShowForm(false)}
                className="rounded p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitForm} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <label className="space-y-1 text-sm md:col-span-3">
                  <span>Estimate (निवडल्यावर सर्व items आपोआप भरतील)</span>
                  <select
                    className={inputClass}
                    value={form.estimateId}
                    onChange={(event) => selectEstimate(event.target.value)}
                  >
                    <option value="">Select Estimate (Optional)</option>
                    {estimates.map((estimate) => (
                      <option key={estimate.id} value={estimate.id}>
                        {estimate.estimateNo} — {estimate.customerName}
                        {estimate.projectName ? ` — ${estimate.projectName}` : ""}
                        {estimate.total != null ? ` — ${money(estimate.total)}` : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span>CRM Customer *</span>
                  <select
                    className={inputClass}
                    required
                    value={form.customerId}
                    onChange={(event) => selectCustomer(event.target.value)}
                  >
                    <option value="">Select Customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                        {customer.company ? ` — ${customer.company}` : ""}
                        {customer.phone ? ` (${customer.phone})` : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span>Quotation For (Customer Name) *</span>
                  <input
                    className={inputClass}
                    required
                    value={form.customerName}
                    onChange={(e) => setField("customerName", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Customer Address</span>
                  <input
                    className={inputClass}
                    value={form.customerAddress}
                    onChange={(e) => setField("customerAddress", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Project Name *</span>
                  <input
                    className={inputClass}
                    required
                    value={form.projectName}
                    onChange={(e) => setField("projectName", e.target.value)}
                    placeholder="Kitchen, wardrobe, workstation..."
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Quotation Date *</span>
                  <input
                    className={inputClass}
                    type="date"
                    required
                    value={form.quotationDate}
                    onChange={(e) => setField("quotationDate", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Valid Until</span>
                  <input
                    className={inputClass}
                    type="date"
                    min={form.quotationDate}
                    value={form.validUntil}
                    onChange={(e) => setField("validUntil", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Place of Supply</span>
                  <input
                    className={inputClass}
                    value={form.placeOfSupply}
                    onChange={(e) => setField("placeOfSupply", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Status</span>
                  <select
                    className={inputClass}
                    value={form.status}
                    onChange={(e) => setField("status", e.target.value)}
                  >
                    <option>Draft</option>
                    <option>Sent</option>
                    <option>Accepted</option>
                    <option>Rejected</option>
                    <option>Expired</option>
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span>GST Percentage (%)</span>
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    value={form.gstRate}
                    onChange={(e) => setField("gstRate", e.target.value)}
                  />
                </label>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">Quotation Items</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {form.items.map((item, index) => (
                    <div key={item.id} className="rounded-lg border p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-semibold">Item {index + 1}</h4>

                        <button
                          type="button"
                          disabled={form.items.length === 1}
                          onClick={() => removeItem(item.id)}
                          className="rounded p-2 text-red-600 hover:bg-red-50 disabled:opacity-40"
                          aria-label={`Remove item ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 md:grid-cols-12">
                        <label className="col-span-2 space-y-1 text-xs md:col-span-4">
                          <span>Item Name *</span>
                          <input
                            className={inputClass}
                            required
                            value={item.itemName}
                            onChange={(e) =>
                              updateItem(item.id, "itemName", e.target.value)
                            }
                          />
                        </label>

                        <label className="space-y-1 text-xs md:col-span-1">
                          <span>HSN/SAC</span>
                          <input
                            className={inputClass}
                            value={item.hsn}
                            onChange={(e) =>
                              updateItem(item.id, "hsn", e.target.value)
                            }
                          />
                        </label>

                        <label className="space-y-1 text-xs md:col-span-2">
                          <span>Sizes</span>
                          <input
                            className={inputClass}
                            value={item.sizes}
                            placeholder="2400 X 1200"
                            onChange={(e) =>
                              updateItem(item.id, "sizes", e.target.value)
                            }
                          />
                        </label>

                        <label className="space-y-1 text-xs md:col-span-1">
                          <span>Qty *</span>
                          <input
                            className={inputClass}
                            type="number"
                            min="0.001"
                            step="any"
                            required
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(item.id, "quantity", Number(e.target.value))
                            }
                          />
                        </label>

                        <label className="space-y-1 text-xs md:col-span-1">
                          <span>Unit</span>
                          <select
                            className={inputClass}
                            value={item.unit}
                            onChange={(e) =>
                              updateItem(item.id, "unit", e.target.value)
                            }
                          >
                            {UNITS.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="col-span-2 space-y-1 text-xs md:col-span-3">
                          <span>Price / Unit (₹) *</span>
                          <input
                            className={inputClass}
                            type="number"
                            min="0"
                            step="any"
                            required
                            value={item.rate}
                            onChange={(e) =>
                              updateItem(item.id, "rate", Number(e.target.value))
                            }
                          />
                        </label>
                      </div>

                      <label className="mt-3 block space-y-1 text-xs">
                        <span>Description (PDF मध्ये कंसात दिसेल)</span>
                        <textarea
                          rows={2}
                          className={inputClass}
                          value={item.description}
                          onChange={(e) =>
                            updateItem(item.id, "description", e.target.value)
                          }
                        />
                      </label>

                      <p className="mt-1 text-right text-xs text-gray-500">
                        Amount: {money(item.quantity * item.rate)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block space-y-1 text-sm">
                  <span>Terms and conditions (प्रत्येक ओळ एक term)</span>
                  <textarea
                    className={inputClass}
                    rows={7}
                    value={form.termsText}
                    onChange={(e) => setField("termsText", e.target.value)}
                  />
                </label>

                <div className="space-y-2 rounded-xl border bg-gray-50 p-4 text-sm">
                  <div className="flex justify-between">
                    <span>Sub Total</span>
                    <strong>{money(totals.subtotal)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>GST ({Number(form.gstRate) || 0}%)</span>
                    <strong>{money(totals.gstAmount)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Round off</span>
                    <strong>{money(totals.roundOff)}</strong>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-lg">
                    <strong>Grand Total</strong>
                    <strong>{money(totals.grandTotal)}</strong>
                  </div>
                  <p className="text-xs text-gray-500">
                    {amountInWords(totals.grandTotal)}
                  </p>
                </div>
              </div>

              <label className="block space-y-1 text-sm">
                <span>Internal Notes</span>
                <textarea
                  className={inputClass}
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
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
                      ? "Update Quotation"
                      : "Save Quotation"}
                </button>

                <button
                  type="button"
                  onClick={previewDraft}
                  className="inline-flex items-center gap-2 rounded-lg border px-5 py-2 text-sm hover:bg-gray-50"
                >
                  <FileText className="h-4 w-4" />
                  Preview PDF
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

        {viewing && (
          <section className="space-y-4 rounded-xl border bg-white p-4 md:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Quotation Details: {viewing.quotationNo}
              </h2>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreview(toDocData(viewing))}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                >
                  <FileText className="h-4 w-4" />
                  View / Download PDF
                </button>

                <button
                  type="button"
                  onClick={() => setViewing(null)}
                  className="rounded p-2 hover:bg-gray-100"
                  aria-label="Close quotation details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <p><strong>Customer:</strong> {viewing.customerName}</p>
              <p><strong>Project:</strong> {viewing.projectName}</p>
              <p><strong>Quotation No:</strong> {viewing.quotationNo}</p>
              <p><strong>Date:</strong> {viewing.quotationDate || "—"}</p>
              <p><strong>Valid Until:</strong> {viewing.validUntil || "—"}</p>
              <p><strong>Status:</strong> {viewing.status}</p>
              <p><strong>GST:</strong> {viewing.gstRate}%</p>
              <p><strong>Place of Supply:</strong> {viewing.placeOfSupply}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3">Item</th>
                    <th className="p-3">HSN</th>
                    <th className="p-3">Sizes</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Unit</th>
                    <th className="p-3">Rate</th>
                    <th className="p-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {viewing.items.map((item) => (
                    <tr key={item.id}>
                      <td className="p-3">
                        <div>{item.itemName}</div>
                        {item.description && (
                          <div className="text-xs text-gray-500">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="p-3">{item.hsn}</td>
                      <td className="p-3">{item.sizes}</td>
                      <td className="p-3">{item.quantity}</td>
                      <td className="p-3">{item.unit}</td>
                      <td className="p-3">{money(item.rate)}</td>
                      <td className="p-3">{money(item.quantity * item.rate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ml-auto max-w-sm space-y-2 rounded-lg bg-gray-50 p-4">
              <div className="flex justify-between">
                <span>Sub Total</span>
                <strong>{money(viewing.subtotal)}</strong>
              </div>
              <div className="flex justify-between">
                <span>GST ({viewing.gstRate}%)</span>
                <strong>{money(viewing.gstAmount)}</strong>
              </div>
              <div className="flex justify-between border-t pt-2 text-lg">
                <strong>Grand Total</strong>
                <strong>{money(viewing.grandTotal)}</strong>
              </div>
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-xl border bg-white">
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold">Quotation Records</h2>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  className={`${inputClass} pl-9 sm:w-64`}
                  placeholder="Search quotations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className={inputClass}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="p-6 text-sm text-gray-500">Loading quotations...</p>
          ) : filteredQuotations.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No quotations found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-3">Quotation No.</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Project</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Grand Total</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredQuotations.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{item.quotationNo}</td>
                      <td className="p-3">{item.customerName}</td>
                      <td className="p-3">{item.projectName || "—"}</td>
                      <td className="p-3">{item.quotationDate || "—"}</td>
                      <td className="p-3 font-medium">{money(item.grandTotal)}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            aria-label="Download quotation PDF"
                            title="View / Download PDF"
                            onClick={() => setPreview(toDocData(item))}
                            className="rounded p-2 text-green-700 hover:bg-green-50"
                          >
                            <FileText className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            aria-label="View quotation"
                            onClick={() => setViewing(item)}
                            className="rounded p-2 text-gray-700 hover:bg-gray-100"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            aria-label="Edit quotation"
                            onClick={() => openEdit(item)}
                            className="rounded p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            aria-label="Delete quotation"
                            onClick={() => void deleteQuotation(item)}
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

      {preview &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="est-portal est-overlay"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              background: "#e5e7eb",
              overflow: "auto",
              padding: 16,
            }}
          >
            <style>{PRINT_FIX}</style>

            <div
              className="est-noprint"
              style={{ textAlign: "center", marginBottom: 12 }}
            >
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="rounded-lg border border-gray-400 bg-white px-4 py-2 text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <EstimateDocument data={preview} title="Quotation" />
          </div>,
          document.body,
        )}
    </AppShell>
  );
}