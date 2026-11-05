import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Trash2,
  Search,
  Pencil,
  X,
  RefreshCw,
  Eye,
  FileText,
} from "lucide-react";

import { AppShell } from "@/components/erp/AppShell";
import {
  InvoiceDocument,
  type InvoiceData,
} from "@/components/erp/InvoiceDocument";
import { computeTaxLine, INR2, round } from "@/lib/erp/units";

export const Route = createFileRoute("/invoicing")({
  head: () => ({
    meta: [
      { title: "GST Invoice Engine | Payal Decor ERP" },
      {
        name: "description",
        content:
          "Line-level GST invoice engine: taxable value after item discount, CGST/SGST/IGST split, invoice-level charges, round-off and e-invoice readiness checks.",
      },
      { property: "og:title", content: "GST Invoice Engine | Payal Decor ERP" },
      {
        property: "og:description",
        content:
          "Configurable tax master driven invoicing with e-invoice validation mirrored before IRP submission.",
      },
    ],
  }),
  component: Invoicing,
});

const API_BASE = (
  import.meta.env["VITE_API_URL"] || "http://localhost:5001/api"
).replace(/\/+$/, "");

interface Line {
  id: number;
  description: string;
  details: string;
  hsn: string;
  sizes: string;
  qty: number;
  uom: string;
  rate: number;
  discount: number;
  gstRate: number;
}

interface CustomerLite {
  id: string;
  name: string;
  company?: string;
  phone?: string;
  gstin?: string | null;
  address?: string | null;
  state?: string | null;
}

interface InvoiceForm {
  invoiceNo: string;
  invoiceDate: string;
  placeOfSupply: string;
  ewayBill: string;
  customerId: string;
  billToName: string;
  billToAddress: string;
  billToContact: string;
  billToGstin: string;
  billToState: string;
  shipTo: string;
  interState: boolean;
  invoiceDiscount: number;
  freight: number;
  advance: number;
  status: string;
  lines: Line[];
}

interface InvoiceRecord extends InvoiceForm {
  id: string;
  grandTotal: number;
  balance: number;
}

const UOMS = ["NOS", "SQF", "SQM", "RFT", "TRIP", "LOT", "SET"];
const STATUSES = ["Draft", "Sent", "Paid", "Partially Paid", "Cancelled"];
const FIRST_INVOICE_NO = "2026-27/048";

const inputCls =
  "w-full rounded-md border border-input bg-card px-2 py-1.5 text-sm outline-none focus:border-ring";

const PRINT_FIX = `
@media print {
  body > *:not(.inv-portal) { display: none !important; }
  .inv-overlay {
    position: static !important;
    overflow: visible !important;
    background: #fff !important;
    padding: 0 !important;
  }
}
`;

const todayString = () => new Date().toISOString().slice(0, 10);

const titleCase = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;

const emptyLine = (id: number): Line => ({
  id,
  description: "",
  details: "",
  hsn: "9403",
  sizes: "",
  qty: 1,
  uom: "NOS",
  rate: 0,
  discount: 0,
  gstRate: 18,
});

const createEmptyForm = (invoiceNo: string): InvoiceForm => ({
  invoiceNo,
  invoiceDate: todayString(),
  placeOfSupply: "27-Maharashtra",
  ewayBill: "",
  customerId: "",
  billToName: "",
  billToAddress: "",
  billToContact: "",
  billToGstin: "",
  billToState: "27-Maharashtra",
  shipTo: "",
  interState: false,
  invoiceDiscount: 0,
  freight: 0,
  advance: 0,
  status: "Draft",
  lines: [emptyLine(1)],
});

async function readResponse(response: Response) {
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

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

/** सेव्ह केलेल्या invoices वरून पुढचा नंबर: 2026-27/048 -> 2026-27/049 */
function nextInvoiceNo(list: InvoiceRecord[]) {
  let prefix = "";
  let max = 0;

  for (const inv of list) {
    const m = /^(\d{4}-\d{2})\/(\d+)$/.exec(inv.invoiceNo.trim());
    if (!m) continue;
    const n = Number(m[2]);
    if (n > max) {
      max = n;
      prefix = m[1];
    }
  }

  if (!max) return FIRST_INVOICE_NO;
  return `${prefix}/${String(max + 1).padStart(3, "0")}`;
}

type TotalsInput = Pick<
  InvoiceForm,
  "lines" | "interState" | "invoiceDiscount" | "freight" | "advance"
>;

function computeTotals(f: TotalsInput) {
  const rows = f.lines.map((l) => ({
    line: l,
    tax: computeTaxLine({
      qty: l.qty,
      rate: l.rate,
      discountAmount: l.discount,
      gstRate: l.gstRate,
      interState: f.interState,
    }),
  }));

  const taxable = rows.reduce((s, r) => s + r.tax.taxableValue, 0);
  const cgst = rows.reduce((s, r) => s + r.tax.cgst, 0);
  const sgst = rows.reduce((s, r) => s + r.tax.sgst, 0);
  const igst = rows.reduce((s, r) => s + r.tax.igst, 0);
  const beforeRound =
    taxable - f.invoiceDiscount + f.freight + cgst + sgst + igst;
  const grand = Math.round(beforeRound);

  return {
    rows,
    taxable,
    cgst,
    sgst,
    igst,
    roundOff: round(grand - beforeRound, 2),
    grand,
    balance: grand - f.advance,
  };
}

/** PDF-style invoice component साठी data */
function buildDocData(f: InvoiceForm): InvoiceData {
  return {
    invoiceNo: f.invoiceNo,
    date: f.invoiceDate,
    placeOfSupply: f.placeOfSupply,
    ewayBill: f.ewayBill.trim() || undefined,

    billToName: f.billToName || "—",
    billToAddress: f.billToAddress || undefined,
    billToContact: f.billToContact || undefined,
    billToGstin: f.billToGstin || undefined,
    billToState: f.billToState || undefined,
    shipTo: f.shipTo || undefined,

    taxRate: 18,
    interState: f.interState,
    invoiceDiscount: f.invoiceDiscount,
    freight: f.freight,
    advance: f.advance,

    items: f.lines
      .filter((l) => l.description.trim())
      .map((l) => ({
        name: l.description,
        description: l.details || undefined,
        hsn: l.hsn,
        sizes: l.sizes || undefined,
        qty: l.qty,
        unit: titleCase(l.uom),
        price: l.rate,
        gstRate: l.gstRate,
        discount: l.discount,
      })),
  };
}

function normalizeInvoice(row: any): InvoiceRecord {
  const lines: Line[] = Array.isArray(row.items)
    ? row.items.map((l: any, i: number) => ({
        id: Number(l.id ?? i + 1),
        description: l.description ?? "",
        details: l.details ?? "",
        hsn: l.hsn ?? "9403",
        sizes: l.sizes ?? "",
        qty: Number(l.qty ?? 1),
        uom: l.uom ?? "NOS",
        rate: Number(l.rate ?? 0),
        discount: Number(l.discount ?? 0),
        gstRate: Number(l.gstRate ?? 18),
      }))
    : [];

  const base: InvoiceForm = {
    invoiceNo: row.invoiceNo ?? "",
    invoiceDate: row.invoiceDate ? String(row.invoiceDate).slice(0, 10) : "",
    placeOfSupply: row.placeOfSupply ?? "27-Maharashtra",
    ewayBill: row.ewayBill ?? "",
    customerId: row.customerId != null ? String(row.customerId) : "",
    billToName: row.billToName ?? "",
    billToAddress: row.billToAddress ?? "",
    billToContact: row.billToContact ?? "",
    billToGstin: row.billToGstin ?? "",
    billToState: row.billToState ?? "27-Maharashtra",
    shipTo: row.shipTo ?? "",
    interState: Boolean(row.interState),
    invoiceDiscount: Number(row.invoiceDiscount ?? 0),
    freight: Number(row.freight ?? 0),
    advance: Number(row.advance ?? 0),
    status: row.status ?? "Draft",
    lines: lines.length ? lines : [emptyLine(1)],
  };

  const totals = computeTotals(base);

  return {
    ...base,
    id: String(row.id),
    grandTotal: Number(row.grandTotal ?? totals.grand),
    balance: Number(row.balance ?? totals.balance),
  };
}

function Invoicing() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerLite[]>([]);

  const [form, setForm] = useState<InvoiceForm>(() =>
    createEmptyForm(FIRST_INVOICE_NO),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<InvoiceRecord | null>(null);
  const [preview, setPreview] = useState<InvoiceData | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/invoices`);
      const data = await readResponse(response);
      setInvoices(getList<any>(data, ["invoices", "data"]).map(normalizeInvoice));
    } catch (err) {
      setError(getErrorMessage(err, "Invoices could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCustomers = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/crm/customers`);
      const data = await readResponse(response);
      setCustomers(getList<CustomerLite>(data, ["customers", "data"]));
    } catch {
      setCustomers([]);
    }
  }, []);

  useEffect(() => {
    void loadInvoices();
    void loadCustomers();
  }, [loadInvoices, loadCustomers]);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices.filter((item) => {
      const matchesSearch = [
        item.invoiceNo,
        item.billToName,
        item.status,
        item.invoiceDate,
      ].some((v) => String(v ?? "").toLowerCase().includes(query));

      const matchesStatus = statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const computed = useMemo(() => computeTotals(form), [form]);

  function setField<K extends keyof InvoiceForm>(field: K, value: InvoiceForm[K]) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  function pickCustomer(id: string) {
    const c = customers.find((x) => x.id === id);

    setForm((p) => ({
      ...p,
      customerId: id,
      billToName: c ? c.company || c.name : p.billToName,
      billToAddress: c ? (c.address ?? "") : p.billToAddress,
      billToContact: c ? (c.phone ?? "") : p.billToContact,
      billToGstin: c ? (c.gstin ?? "") : p.billToGstin,
      billToState: c?.state ? c.state : p.billToState,
    }));
  }

  const updateLine = (id: number, patch: Partial<Line>) =>
    setForm((p) => ({
      ...p,
      lines: p.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));

  function addLine() {
    setForm((p) => ({
      ...p,
      lines: [...p.lines, emptyLine(Math.max(0, ...p.lines.map((l) => l.id)) + 1)],
    }));
  }

  function removeLine(id: number) {
    setForm((p) => ({
      ...p,
      lines: p.lines.length === 1 ? p.lines : p.lines.filter((l) => l.id !== id),
    }));
  }

  function openCreate() {
    setEditingId(null);
    setViewing(null);
    setForm(createEmptyForm(nextInvoiceNo(invoices)));
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function openEdit(item: InvoiceRecord) {
    const { id, grandTotal, balance, ...rest } = item;
    void grandTotal;
    void balance;

    setEditingId(id);
    setViewing(null);
    setForm({ ...rest, lines: rest.lines.map((l) => ({ ...l })) });
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function validateForm() {
    if (!form.invoiceNo.trim()) {
      setError("Please enter the invoice number.");
      return false;
    }
    if (!form.invoiceDate) {
      setError("Please select the invoice date.");
      return false;
    }
    if (!form.billToName.trim()) {
      setError("Please enter the Bill To name.");
      return false;
    }
    if (!form.lines.some((l) => l.description.trim())) {
      setError("Please enter at least one item.");
      return false;
    }
    for (const l of form.lines) {
      if (l.description.trim() && (!(l.qty > 0) || l.rate < 0)) {
        setError("Quantity must be greater than zero and rate cannot be negative.");
        return false;
      }
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
      const payload = {
        invoiceNo: form.invoiceNo.trim(),
        invoiceDate: form.invoiceDate,
        placeOfSupply: form.placeOfSupply.trim(),
        ewayBill: form.ewayBill.trim() || null,
        customerId: form.customerId || null,
        billToName: form.billToName.trim(),
        billToAddress: form.billToAddress.trim() || null,
        billToContact: form.billToContact.trim() || null,
        billToGstin: form.billToGstin.trim() || null,
        billToState: form.billToState.trim() || null,
        shipTo: form.shipTo.trim() || null,
        interState: form.interState,
        invoiceDiscount: form.invoiceDiscount,
        freight: form.freight,
        advance: form.advance,
        status: form.status,
        items: form.lines.filter((l) => l.description.trim()),
        taxable: computed.taxable,
        grandTotal: computed.grand,
        balance: computed.balance,
      };

      const url = editingId
        ? `${API_BASE}/invoices/${encodeURIComponent(editingId)}`
        : `${API_BASE}/invoices`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await readResponse(response);

      setSuccess(
        editingId ? "Invoice updated successfully." : "Invoice saved successfully.",
      );
      setShowForm(false);
      setEditingId(null);

      await loadInvoices();
    } catch (err) {
      setError(getErrorMessage(err, "Invoice could not be saved."));
    } finally {
      setSaving(false);
    }
  }

  async function deleteInvoice(item: InvoiceRecord) {
    if (!window.confirm(`Are you sure you want to delete ${item.invoiceNo}?`)) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE}/invoices/${encodeURIComponent(item.id)}`,
        { method: "DELETE" },
      );
      await readResponse(response);

      setSuccess("Invoice deleted successfully.");
      if (viewing?.id === item.id) setViewing(null);
      if (editingId === item.id) {
        setEditingId(null);
        setShowForm(false);
      }

      await loadInvoices();
    } catch (err) {
      setError(getErrorMessage(err, "Invoice could not be deleted."));
    }
  }

  const viewingTotals = viewing ? computeTotals(viewing) : null;

  return (
    <AppShell title="Invoicing">
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Invoicing</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create GST tax invoices and download them as PDF.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                void loadInvoices();
                void loadCustomers();
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
              Create Invoice
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
            { label: "Total Invoices", value: invoices.length },
            {
              label: "Draft Invoices",
              value: invoices.filter((i) => i.status === "Draft").length,
            },
            {
              label: "Sent Invoices",
              value: invoices.filter((i) => i.status === "Sent").length,
            },
            {
              label: "Paid Invoices",
              value: invoices.filter((i) => i.status === "Paid").length,
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-border bg-card p-5"
            >
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="mt-2 text-2xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>

        {/* ================= FORM ================= */}
        {showForm && (
          <form onSubmit={submitForm} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit Invoice" : "Create Invoice"}
              </h2>

              <button
                type="button"
                aria-label="Close invoice form"
                onClick={() => setShowForm(false)}
                className="rounded p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-wrap items-end gap-3">
                <label className="block">
                  <span className="mb-1 block text-sm text-muted-foreground">
                    Invoice number
                  </span>
                  <input
                    className={`${inputCls} w-44 text-lg font-semibold`}
                    value={form.invoiceNo}
                    onChange={(e) => setField("invoiceNo", e.target.value)}
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm text-muted-foreground">
                    Status
                  </span>
                  <select
                    className={`${inputCls} w-40`}
                    value={form.status}
                    onChange={(e) => setField("status", e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.interState}
                  onChange={(e) => setField("interState", e.target.checked)}
                />
                Inter-state supply (IGST)
              </label>
            </div>

            {/* Invoice details + Bill To / Ship To */}
            <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <h3 className="mb-3 text-sm font-semibold">
                Invoice &amp; Customer details
              </h3>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <label className="block">
                  <span className="mb-1 block text-xs text-muted-foreground">
                    Invoice date
                  </span>
                  <input
                    type="date"
                    className={inputCls}
                    value={form.invoiceDate}
                    onChange={(e) => setField("invoiceDate", e.target.value)}
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs text-muted-foreground">
                    Place of Supply
                  </span>
                  <input
                    className={inputCls}
                    value={form.placeOfSupply}
                    onChange={(e) => setField("placeOfSupply", e.target.value)}
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs text-muted-foreground">
                    E-way Bill number
                  </span>
                  <input
                    className={inputCls}
                    value={form.ewayBill}
                    onChange={(e) => setField("ewayBill", e.target.value)}
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs text-muted-foreground">
                    CRM Customer 
                  </span>
                  <select
                    className={inputCls}
                    value={form.customerId}
                    onChange={(e) => pickCustomer(e.target.value)}
                  >
                    <option value="">— Select customer —</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {c.company ? ` — ${c.company}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Bill To
                  </p>
                  <label className="block">
                    <span className="mb-1 block text-xs text-muted-foreground">
                      Name *
                    </span>
                    <input
                      className={inputCls}
                      value={form.billToName}
                      onChange={(e) => setField("billToName", e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-muted-foreground">
                      Address
                    </span>
                    <textarea
                      rows={3}
                      className={inputCls}
                      value={form.billToAddress}
                      onChange={(e) => setField("billToAddress", e.target.value)}
                    />
                  </label>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <label className="block">
                      <span className="mb-1 block text-xs text-muted-foreground">
                        Contact No.
                      </span>
                      <input
                        className={inputCls}
                        value={form.billToContact}
                        onChange={(e) => setField("billToContact", e.target.value)}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-muted-foreground">
                        GSTIN
                      </span>
                      <input
                        className={inputCls}
                        value={form.billToGstin}
                        onChange={(e) => setField("billToGstin", e.target.value)}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-muted-foreground">
                        State
                      </span>
                      <input
                        className={inputCls}
                        value={form.billToState}
                        onChange={(e) => setField("billToState", e.target.value)}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Ship To
                  </p>
                  <label className="block">
                    <span className="mb-1 block text-xs text-muted-foreground">
                      Ship To address
                    </span>
                    <textarea
                      rows={5}
                      className={inputCls}
                      value={form.shipTo}
                      onChange={(e) => setField("shipTo", e.target.value)}
                    />
                  </label>
                </div>
              </div>
            </section>

            {/* Items */}
            <section className="overflow-x-auto rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
              <table className="w-full min-w-[1000px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-2 py-3 font-medium">HSN/SAC</th>
                    <th className="px-2 py-3 font-medium">Sizes</th>
                    <th className="px-2 py-3 font-medium">Qty</th>
                    <th className="px-2 py-3 font-medium">UOM</th>
                    <th className="px-2 py-3 font-medium">Rate</th>
                    <th className="px-2 py-3 font-medium">Discount</th>
                    <th className="px-2 py-3 font-medium">GST %</th>
                    <th className="px-2 py-3 text-right font-medium">Taxable</th>
                    <th className="px-2 py-3 text-right font-medium">Tax</th>
                    <th className="px-2 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {computed.rows.map(({ line, tax }) => (
                    <tr key={line.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-2">
                        <input
                          className={inputCls}
                          value={line.description}
                          onChange={(e) =>
                            updateLine(line.id, { description: e.target.value })
                          }
                          placeholder="Item name"
                        />
                        <textarea
                          rows={2}
                          className={`${inputCls} mt-1 text-xs`}
                          value={line.details}
                          onChange={(e) =>
                            updateLine(line.id, { details: e.target.value })
                          }
                          placeholder="Description"
                        />
                      </td>
                      <td className="w-24 px-2 py-2">
                        <input
                          className={inputCls}
                          value={line.hsn}
                          onChange={(e) => updateLine(line.id, { hsn: e.target.value })}
                        />
                      </td>
                      <td className="w-32 px-2 py-2">
                        <input
                          className={inputCls}
                          value={line.sizes}
                          onChange={(e) => updateLine(line.id, { sizes: e.target.value })}
                          placeholder="1600 X 525"
                        />
                      </td>
                      <td className="w-20 px-2 py-2">
                        <input
                          type="number"
                          className={inputCls}
                          value={line.qty}
                          onChange={(e) =>
                            updateLine(line.id, { qty: Number(e.target.value) })
                          }
                        />
                      </td>
                      <td className="w-24 px-2 py-2">
                        <select
                          className={inputCls}
                          value={line.uom}
                          onChange={(e) => updateLine(line.id, { uom: e.target.value })}
                        >
                          {UOMS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="w-28 px-2 py-2">
                        <input
                          type="number"
                          className={inputCls}
                          value={line.rate}
                          onChange={(e) =>
                            updateLine(line.id, { rate: Number(e.target.value) })
                          }
                        />
                      </td>
                      <td className="w-28 px-2 py-2">
                        <input
                          type="number"
                          className={inputCls}
                          value={line.discount}
                          onChange={(e) =>
                            updateLine(line.id, { discount: Number(e.target.value) })
                          }
                        />
                      </td>
                      <td className="w-20 px-2 py-2">
                        <input
                          type="number"
                          className={inputCls}
                          value={line.gstRate}
                          onChange={(e) =>
                            updateLine(line.id, { gstRate: Number(e.target.value) })
                          }
                        />
                      </td>
                      <td className="tabular px-2 py-2 text-right">
                        {INR2.format(tax.taxableValue)}
                      </td>
                      <td className="tabular px-2 py-2 text-right">
                        {INR2.format(tax.cgst + tax.sgst + tax.igst)}
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => removeLine(line.id)}
                          aria-label="Remove item"
                          className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-border p-3">
                <button
                  type="button"
                  onClick={addLine}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </button>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <h3 className="mb-3 text-sm font-semibold">Invoice-level adjustments</h3>
                <div className="grid grid-cols-3 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-xs text-muted-foreground">
                      Invoice discount
                    </span>
                    <input
                      type="number"
                      className={inputCls}
                      value={form.invoiceDiscount}
                      onChange={(e) =>
                        setField("invoiceDiscount", Number(e.target.value))
                      }
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-muted-foreground">
                      Freight / other
                    </span>
                    <input
                      type="number"
                      className={inputCls}
                      value={form.freight}
                      onChange={(e) => setField("freight", Number(e.target.value))}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-muted-foreground">
                      Advance adjusted
                    </span>
                    <input
                      type="number"
                      className={inputCls}
                      value={form.advance}
                      onChange={(e) => setField("advance", Number(e.target.value))}
                    />
                  </label>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Item discounts reduce taxable value before tax; invoice-level discount,
                  freight and round-off are kept as separate buckets so e-invoice
                  validations reconcile.
                </p>
              </section>

              <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <h3 className="mb-3 text-sm font-semibold">Summary</h3>
                <Row label="Total taxable value" value={INR2.format(computed.taxable)} />
                {form.interState ? (
                  <Row label="IGST" value={INR2.format(computed.igst)} />
                ) : (
                  <>
                    <Row label="CGST" value={INR2.format(computed.cgst)} />
                    <Row label="SGST" value={INR2.format(computed.sgst)} />
                  </>
                )}
                <Row
                  label="Invoice discount"
                  value={`− ${INR2.format(form.invoiceDiscount)}`}
                />
                <Row label="Freight / other charges" value={INR2.format(form.freight)} />
                <Row label="Round off" value={INR2.format(computed.roundOff)} />
                <Row label="Grand total" value={INR2.format(computed.grand)} strong />
                <Row
                  label="Advance adjusted"
                  value={`− ${INR2.format(form.advance)}`}
                />
                <Row label="Balance due" value={INR2.format(computed.balance)} strong />
              </section>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : editingId ? "Update Invoice" : "Save Invoice"}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (validateForm()) setPreview(buildDocData(form));
                }}
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
        )}

        {/* ================= VIEW DETAILS ================= */}
        {viewing && viewingTotals && (
          <section className="space-y-4 rounded-xl border border-border bg-card p-4 md:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Invoice Details: {viewing.invoiceNo}
              </h2>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreview(buildDocData(viewing))}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                >
                  <FileText className="h-4 w-4" />
                  View / Download PDF
                </button>

                <button
                  type="button"
                  onClick={() => setViewing(null)}
                  className="rounded p-2 hover:bg-gray-100"
                  aria-label="Close invoice details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <p><strong>Bill To:</strong> {viewing.billToName}</p>
              <p><strong>Invoice No:</strong> {viewing.invoiceNo}</p>
              <p><strong>Date:</strong> {viewing.invoiceDate || "—"}</p>
              <p><strong>Status:</strong> {viewing.status}</p>
              <p><strong>Place of Supply:</strong> {viewing.placeOfSupply}</p>
              <p><strong>E-way Bill:</strong> {viewing.ewayBill || "—"}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3">Item</th>
                    <th className="p-3">HSN</th>
                    <th className="p-3">Sizes</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Unit</th>
                    <th className="p-3">Rate</th>
                    <th className="p-3">Discount</th>
                    <th className="p-3">GST %</th>
                    <th className="p-3 text-right">Taxable</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {viewingTotals.rows.map(({ line, tax }) => (
                    <tr key={line.id}>
                      <td className="p-3">
                        <div>{line.description}</div>
                        {line.details && (
                          <div className="text-xs text-muted-foreground">
                            {line.details}
                          </div>
                        )}
                      </td>
                      <td className="p-3">{line.hsn}</td>
                      <td className="p-3">{line.sizes}</td>
                      <td className="p-3">{line.qty}</td>
                      <td className="p-3">{line.uom}</td>
                      <td className="p-3">{INR2.format(line.rate)}</td>
                      <td className="p-3">{INR2.format(line.discount)}</td>
                      <td className="p-3">{line.gstRate}%</td>
                      <td className="p-3 text-right">
                        {INR2.format(tax.taxableValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ml-auto max-w-sm rounded-lg bg-gray-50 p-4">
              <Row label="Total taxable value" value={INR2.format(viewingTotals.taxable)} />
              {viewing.interState ? (
                <Row label="IGST" value={INR2.format(viewingTotals.igst)} />
              ) : (
                <>
                  <Row label="CGST" value={INR2.format(viewingTotals.cgst)} />
                  <Row label="SGST" value={INR2.format(viewingTotals.sgst)} />
                </>
              )}
              <Row label="Freight / other" value={INR2.format(viewing.freight)} />
              <Row label="Grand total" value={INR2.format(viewingTotals.grand)} strong />
              <Row label="Advance adjusted" value={`− ${INR2.format(viewing.advance)}`} />
              <Row label="Balance due" value={INR2.format(viewingTotals.balance)} strong />
            </div>
          </section>
        )}

        {/* ================= RECORDS ================= */}
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold">Invoice Records</h2>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  className={`${inputCls} py-2 pl-9 sm:w-64`}
                  placeholder="Search invoices..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className={`${inputCls} py-2`}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading invoices...</p>
          ) : filteredInvoices.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No invoices found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-3">Invoice No.</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Grand Total</th>
                    <th className="p-3">Balance Due</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredInvoices.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{item.invoiceNo}</td>
                      <td className="p-3">{item.billToName}</td>
                      <td className="p-3">{item.invoiceDate || "—"}</td>
                      <td className="p-3 font-medium">{INR2.format(item.grandTotal)}</td>
                      <td className="p-3">{INR2.format(item.balance)}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            aria-label="Download invoice PDF"
                            title="View / Download PDF"
                            onClick={() => setPreview(buildDocData(item))}
                            className="rounded p-2 text-green-700 hover:bg-green-50"
                          >
                            <FileText className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            aria-label="View invoice"
                            onClick={() => setViewing(item)}
                            className="rounded p-2 text-gray-700 hover:bg-gray-100"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            aria-label="Edit invoice"
                            onClick={() => openEdit(item)}
                            className="rounded p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            aria-label="Delete invoice"
                            onClick={() => void deleteInvoice(item)}
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

      {/* ================= PDF OVERLAY ================= */}
      {preview &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="inv-portal inv-overlay"
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
              className="inv-noprint"
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

            <InvoiceDocument data={preview} />
          </div>,
          document.body,
        )}
    </AppShell>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "tabular font-semibold" : "tabular"}>{value}</span>
    </div>
  );
}