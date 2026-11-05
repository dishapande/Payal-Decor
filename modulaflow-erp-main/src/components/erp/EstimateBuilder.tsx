import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Trash2,
  Save,
  Eye,
  Pencil,
  RefreshCw,
  Calculator,
  X,
} from "lucide-react";
import {
  EstimateDocument,
  DEFAULT_TERMS,
  amountInWords,
  calcEstimate,
  type EstimateData,
  type EstimateItem,
} from "@/components/erp/EstimateDocument";

const API_BASE = (
  import.meta.env["VITE_API_URL"] || "http://localhost:5001/api"
).replace(/\/+$/, "");

const UNITS = ["Nos", "Sqf", "Sqm", "Rft", "Trip", "Lot", "Set"];

interface CustomerLite {
  id: string;
  name: string;
  company?: string;
  address?: string;
}

interface SavedEstimate {
  id: string;
  estimateNo: string;
  estimateDate: string;
  customerId: string | null;
  customerName: string;
  customerAddress: string | null;
  projectName: string | null;
  placeOfSupply: string;
  items: EstimateItem[];
  taxRate: number;
  total: number;
  terms: string[] | null;
}

interface Props {
  customer?: CustomerLite;
  projectName: string;
  panel: { sizes: string; qty: number; price: number };
}

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

const blankItem = (): EstimateItem => ({
  name: "",
  description: "",
  hsn: "9403",
  sizes: "",
  qty: 1,
  unit: "Nos",
  price: 0,
});

const todayString = () => new Date().toISOString().slice(0, 10);

const inr = (value: number) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

async function readResponse(response: Response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

function recordToData(rec: SavedEstimate): EstimateData {
  return {
    estimateNo: rec.estimateNo,
    date: rec.estimateDate.slice(0, 10),
    customerName: rec.customerName,
    customerAddress: rec.customerAddress ?? undefined,
    placeOfSupply: rec.placeOfSupply,
    items: rec.items,
    taxRate: rec.taxRate,
    terms: rec.terms?.length ? rec.terms : undefined,
  };
}

export function EstimateBuilder({ customer, projectName, panel }: Props) {
  const topRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<EstimateItem[]>([blankItem()]);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [estCustomer, setEstCustomer] = useState("");
  const [address, setAddress] = useState("");
  const [placeOfSupply, setPlaceOfSupply] = useState("27-Maharashtra");
  const [estDate, setEstDate] = useState(todayString());
  const [taxRate, setTaxRate] = useState(18);
  const [termsText, setTermsText] = useState(DEFAULT_TERMS.join("\n"));

  const [editingId, setEditingId] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedEstimate[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState<EstimateData | null>(null);

  // वरच्या form मध्ये CRM customer निवडला की "Estimate For" आपोआप भरतो
  useEffect(() => {
    if (!customer || editingId) return;
    setCustomerId(customer.id);
    setEstCustomer(customer.company || customer.name);
    setAddress(customer.address ?? "");
  }, [customer?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSaved = useCallback(async () => {
    setLoadingList(true);

    try {
      const response = await fetch(`${API_BASE}/estimate-docs`);
      const data = await readResponse(response);
      setSaved(data.estimates ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Saved estimates could not load: ${err.message}`
          : "Saved estimates could not load.",
      );
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void loadSaved();
  }, [loadSaved]);

  const cleanItems = useMemo(
    () => items.filter((item) => item.name.trim()),
    [items],
  );

  const totals = useMemo(
    () => calcEstimate(cleanItems, taxRate),
    [cleanItems, taxRate],
  );

  function updateItem(index: number, patch: Partial<EstimateItem>) {
    setItems((previous) =>
      previous.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function addPanelItem() {
    const row: EstimateItem = {
      name: projectName.trim() || "Panel",
      description: "",
      hsn: "9403",
      sizes: panel.sizes,
      qty: panel.qty > 0 ? panel.qty : 1,
      unit: "Nos",
      price: Math.round(panel.price * 100) / 100,
    };

    setItems((previous) => {
      // सुरुवातीची रिकामी ओळ असेल तर तिच्या जागी टाका
      if (previous.length === 1 && !previous[0].name.trim()) return [row];
      return [...previous, row];
    });
  }

  function termsList() {
    return termsText
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  function draftData(estimateNo: string): EstimateData {
    return {
      estimateNo,
      date: estDate,
      customerName: estCustomer,
      customerAddress: address || undefined,
      placeOfSupply,
      items: cleanItems,
      taxRate,
      terms: termsList(),
    };
  }

  function resetForm() {
    setEditingId(null);
    setItems([blankItem()]);
    setEstDate(todayString());
    setTermsText(DEFAULT_TERMS.join("\n"));
  }

  async function save() {
    setError("");
    setSuccess("");

    if (!estCustomer.trim()) {
      setError("'Estimate For' (customer name) is required.");
      return;
    }

    if (cleanItems.length === 0) {
      setError("Add at least one item with a name.");
      return;
    }

    setSaving(true);

    try {
      const url = editingId
        ? `${API_BASE}/estimate-docs/${encodeURIComponent(editingId)}`
        : `${API_BASE}/estimate-docs`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          customerName: estCustomer,
          customerAddress: address,
          projectName,
          placeOfSupply,
          estimateDate: estDate,
          items: cleanItems,
          taxRate,
          terms: termsList(),
        }),
      });

      const data = await readResponse(response);
      setSuccess(`Estimate ${data.estimate?.estimateNo ?? ""} saved.`);
      resetForm();
      await loadSaved();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Estimate could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit(rec: SavedEstimate) {
    setEditingId(rec.id);
    setCustomerId(rec.customerId);
    setEstCustomer(rec.customerName);
    setAddress(rec.customerAddress ?? "");
    setPlaceOfSupply(rec.placeOfSupply);
    setEstDate(rec.estimateDate.slice(0, 10));
    setTaxRate(rec.taxRate);
    setItems(rec.items.length ? rec.items : [blankItem()]);
    setTermsText((rec.terms?.length ? rec.terms : DEFAULT_TERMS).join("\n"));
    setError("");
    setSuccess("");
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function remove(rec: SavedEstimate) {
    if (!window.confirm(`Delete estimate ${rec.estimateNo}?`)) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE}/estimate-docs/${encodeURIComponent(rec.id)}`,
        { method: "DELETE" },
      );
      await readResponse(response);
      setSuccess("Estimate deleted.");
      if (editingId === rec.id) resetForm();
      await loadSaved();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Estimate could not be deleted.",
      );
    }
  }

  const editingNo = saved.find((s) => s.id === editingId)?.estimateNo;

  return (
    <>
      <section
        ref={topRef}
        className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-4 py-3">
          <h2 className="font-semibold text-gray-800">
            {editingId
              ? `Estimate (PDF format) — Editing ${editingNo ?? ""}`
              : "Estimate (PDF format)"}
          </h2>
          <span className="text-xs text-gray-500">
            Estimate No. is generated automatically when you save (e.g. 2026-27/045)
          </span>
        </header>

        <div className="space-y-4 p-4">
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

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="block space-y-1 text-sm">
              <span className="text-gray-600">Estimate For *</span>
              <input
                className={inputClass}
                value={estCustomer}
                onChange={(e) => setEstCustomer(e.target.value)}
                placeholder="Customer / company name"
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="text-gray-600">Date</span>
              <input
                type="date"
                className={inputClass}
                value={estDate}
                onChange={(e) => setEstDate(e.target.value)}
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="text-gray-600">Place of Supply</span>
              <input
                className={inputClass}
                value={placeOfSupply}
                onChange={(e) => setPlaceOfSupply(e.target.value)}
              />
            </label>

            <label className="block space-y-1 text-sm md:col-span-2">
              <span className="text-gray-600">Customer Address (optional)</span>
              <input
                className={inputClass}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="text-gray-600">Tax % (GST)</span>
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                className={inputClass}
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-800">Items</h3>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addPanelItem}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
              >
                <Calculator className="h-4 w-4" />
                Add calculator result as item
              </button>

              <button
                type="button"
                onClick={() => setItems((p) => [...p, blankItem()])}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 p-3"
              >
                <div className="grid grid-cols-2 gap-2 md:grid-cols-12">
                  <label className="col-span-2 space-y-1 text-xs md:col-span-4">
                    <span className="text-gray-500">
                      {index + 1}. Item name *
                    </span>
                    <input
                      className={inputClass}
                      value={item.name}
                      onChange={(e) =>
                        updateItem(index, { name: e.target.value })
                      }
                    />
                  </label>

                  <label className="space-y-1 text-xs md:col-span-1">
                    <span className="text-gray-500">HSN/SAC</span>
                    <input
                      className={inputClass}
                      value={item.hsn ?? ""}
                      onChange={(e) =>
                        updateItem(index, { hsn: e.target.value })
                      }
                    />
                  </label>

                  <label className="space-y-1 text-xs md:col-span-2">
                    <span className="text-gray-500">Sizes</span>
                    <input
                      className={inputClass}
                      value={item.sizes ?? ""}
                      onChange={(e) =>
                        updateItem(index, { sizes: e.target.value })
                      }
                      placeholder="2400 X 1200"
                    />
                  </label>

                  <label className="space-y-1 text-xs md:col-span-1">
                    <span className="text-gray-500">Qty</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className={inputClass}
                      value={item.qty}
                      onChange={(e) =>
                        updateItem(index, { qty: Number(e.target.value) })
                      }
                    />
                  </label>

                  <label className="space-y-1 text-xs md:col-span-1">
                    <span className="text-gray-500">Unit</span>
                    <select
                      className={inputClass}
                      value={item.unit ?? "Nos"}
                      onChange={(e) =>
                        updateItem(index, { unit: e.target.value })
                      }
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="col-span-1 space-y-1 text-xs md:col-span-2">
                    <span className="text-gray-500">Price / Unit (₹)</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className={inputClass}
                      value={item.price}
                      onChange={(e) =>
                        updateItem(index, { price: Number(e.target.value) })
                      }
                    />
                  </label>

                  <div className="col-span-1 flex items-end md:col-span-1">
                    <button
                      type="button"
                      onClick={() =>
                        setItems((p) =>
                          p.length === 1
                            ? [blankItem()]
                            : p.filter((_, i) => i !== index),
                        )
                      }
                      aria-label="Remove item"
                      className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <label className="mt-2 block space-y-1 text-xs">
                  <span className="text-gray-500">
                    Description (PDF मध्ये कंसात दिसेल)
                  </span>
                  <textarea
                    rows={2}
                    className={inputClass}
                    value={item.description ?? ""}
                    onChange={(e) =>
                      updateItem(index, { description: e.target.value })
                    }
                    placeholder="Under Structure in M.S With Powder Coating..."
                  />
                </label>

                <p className="mt-1 text-right text-xs text-gray-500">
                  Amount: ₹ {inr(item.qty * item.price)}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block space-y-1 text-sm">
              <span className="text-gray-600">
                Terms and conditions (प्रत्येक ओळ एक term)
              </span>
              <textarea
                rows={7}
                className={inputClass}
                value={termsText}
                onChange={(e) => setTermsText(e.target.value)}
              />
            </label>

            <div className="rounded-lg border border-gray-200 p-4 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Sub Total</span>
                <span className="tabular-nums">₹ {inr(totals.subTotal)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Tax ({taxRate}%)</span>
                <span className="tabular-nums">₹ {inr(totals.taxAmount)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Round off</span>
                <span className="tabular-nums">₹ {inr(totals.roundOff)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 py-2 font-semibold">
                <span>Total</span>
                <span className="tabular-nums">₹ {inr(totals.total)}</span>
              </div>
              <p className="text-xs text-gray-500">
                {amountInWords(totals.total)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
                Cancel Edit
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (cleanItems.length === 0) {
                  setError("Add at least one item with a name.");
                  return;
                }
                setError("");
                setPreview(draftData(editingNo ?? "(Draft)"));
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm hover:bg-gray-50"
            >
              <Eye className="h-4 w-4" />
              Preview / Print
            </button>

            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#8f2525] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#741d1d] disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Estimate"
                  : "Save Estimate"}
            </button>
          </div>
        </div>
      </section>

      <section className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="font-semibold text-gray-800">Saved Estimates (PDF)</h2>
          <button
            type="button"
            onClick={() => void loadSaved()}
            disabled={loadingList}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${loadingList ? "animate-spin" : ""}`}
            />
          </button>
        </header>

        {saved.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">
            No saved estimates yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-600">
                <tr>
                  <th className="p-3">Estimate No.</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Estimate For</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {saved.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium">{rec.estimateNo}</td>
                    <td className="p-3">
                      {new Date(rec.estimateDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-3">{rec.customerName}</td>
                    <td className="p-3 text-right font-medium tabular-nums">
                      ₹ {inr(rec.total)}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setPreview(recordToData(rec))}
                          className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View / Print
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(rec)}
                          aria-label="Edit estimate"
                          className="rounded p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(rec)}
                          aria-label="Delete estimate"
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

            <EstimateDocument data={preview} />
          </div>,
          document.body,
        )}
    </>
  );
}