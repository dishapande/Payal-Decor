import { Printer } from "lucide-react";
import { amountInWords } from "@/components/erp/EstimateDocument";

export interface InvoiceItem {
  name: string;
  description?: string;
  hsn?: string;
  sizes?: string;
  qty: number;
  unit?: string;
  price: number;
  gstRate?: number; // दिलं नाही तर taxRate वापरतो
  discount?: number; // item discount (रक्कम)
}

export interface InvoiceData {
  invoiceNo: string;
  date: string; // YYYY-MM-DD
  placeOfSupply: string; // "27-Maharashtra"
  ewayBill?: string;

  billToName: string;
  billToAddress?: string;
  billToContact?: string;
  billToGstin?: string;
  billToState?: string;

  shipTo?: string;

  items: InvoiceItem[];
  taxRate: number; // default GST % (18)
  terms?: string[];

  interState?: boolean; // true = IGST
  invoiceDiscount?: number;
  freight?: number;
  advance?: number;
}

export const DEFAULT_INVOICE_TERMS = [
  "Goods Once Sold will not be taken return.",
  "Interest @24% p.a. will be charged on invoice not paid within 30 days.",
  "Subject to Pune Juridiction.",
  "Error And Ommision Expected.",
];

const COMPANY = {
  name: "PAYAL DECOR",
  address:
    "Sr.no 21/2/3 , Payal Decor , Vidhyanagar,near Vishwa Gym , Katraj Kondhwa Road, Pune 411046",
  phone: "8007180059",
  email: "PAYAL.DECOR@YAHOO.COM",
  gstin: "27ABBPM0633R1ZE",
  state: "27-Maharashtra",
  bankName: "ICICI BANK LIMITED, PUNE KATRAJ",
  accountNo: "187705500146",
  ifsc: "ICIC0001877",
  holder: "PAYAL DECOR",
};

const fmt = (v: number) =>
  v.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const money = (v: number) => `₹ ${fmt(v)}`;

function formatDate(value: string) {
  const [y, m, d] = value.slice(0, 10).split("-");
  return `${d}-${m}-${y}`;
}

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function calcInvoice(
  items: InvoiceItem[],
  defaultRate: number,
  extras: { invoiceDiscount?: number; freight?: number; advance?: number } = {},
) {
  // HSN नुसार गट (HSN + दर)
  const groups = new Map<
    string,
    { hsn: string; rate: number; taxable: number; tax: number }
  >();

  let subTotal = 0;

  for (const item of items) {
    const rate = item.gstRate ?? defaultRate;
    const hsn = (item.hsn || "").trim() || "—";
    const key = `${hsn}|${rate}`;
    const taxable = r2(item.qty * item.price - (item.discount ?? 0));
    subTotal += taxable;

    const g = groups.get(key) ?? { hsn, rate, taxable: 0, tax: 0 };
    g.taxable += taxable;
    g.tax += r2((taxable * rate) / 100);
    groups.set(key, g);
  }

  const hsnRows = Array.from(groups.values());
  const taxAmount = hsnRows.reduce((s, g) => s + g.tax, 0);

  const invoiceDiscount = extras.invoiceDiscount ?? 0;
  const freight = extras.freight ?? 0;
  const advance = extras.advance ?? 0;

  const raw = subTotal - invoiceDiscount + freight + taxAmount;
  const total = Math.round(raw);

  return {
    subTotal,
    taxAmount,
    invoiceDiscount,
    freight,
    advance,
    total,
    roundOff: r2(total - raw),
    balance: total - advance,
    hsnRows,
  };
}

const STYLE = `
.inv-root{font-family:"Times New Roman",Times,serif;font-size:11px;color:#000;
  width:210mm;max-width:100%;margin:0 auto;background:#fff;padding:6mm;box-sizing:border-box}
.inv-b{border:1.5px solid #2b2b44;margin-top:5px}
.inv-b:first-of-type{margin-top:0}
.inv-top{display:flex;justify-content:space-between;align-items:center;padding:6px 6px}
.inv-top b{flex:1;text-align:center;font-size:12px}
.inv-top span{color:#555}
.inv-head{display:grid;grid-template-columns:1fr 28%}
.inv-head>div+div{border-left:1.5px solid #2b2b44}
.inv-co{display:flex;gap:8px;padding:6px}
.inv-co img{height:46px;width:auto;max-width:120px;object-fit:contain}
.inv-co h3{margin:0 0 3px;font-size:13px}
.inv-co div{line-height:1.5}
.inv-det{padding:6px;line-height:1.7}
.inv-party{display:grid;grid-template-columns:1fr 38%}
.inv-party>div+div{border-left:1.5px solid #2b2b44}
.inv-party>div{padding:6px;line-height:1.7;min-height:90px}
table.inv-t{width:100%;border-collapse:collapse}
.inv-t th{border-bottom:1.5px solid #2b2b44;padding:4px 5px;text-align:left;font-weight:700}
.inv-t td{padding:4px 5px;vertical-align:top;border-bottom:1.5px solid #2b2b44;border-left:1px solid #2b2b44;line-height:1.4}
.inv-t th{border-left:1px solid #2b2b44}
.inv-t th:first-child,.inv-t td:first-child{border-left:0}
.inv-t tr{page-break-inside:avoid}
.inv-t .r{text-align:right}
.inv-t .c{text-align:center}
.inv-t tbody tr:last-child td{border-bottom:0}
.inv-desc{white-space:pre-wrap}
.inv-sum{display:grid;grid-template-columns:1fr 34%;page-break-inside:avoid}
.inv-sum>div+div{border-left:1.5px solid #2b2b44}
.inv-hsn th,.inv-hsn td{border:1px solid #2b2b44}
.inv-hsn{border:0}
.inv-amt{padding:3px 6px;display:flex;justify-content:space-between}
.inv-words{padding:3px 6px;border-top:1.5px solid #2b2b44;display:flex;gap:8px;min-height:36px}
.inv-terms{padding:6px;line-height:1.5;page-break-inside:avoid}
.inv-foot{display:grid;grid-template-columns:1fr 1fr;page-break-inside:avoid}
.inv-foot>div+div{border-left:1.5px solid #2b2b44}
.inv-bank{display:flex;gap:6px;padding:6px;line-height:1.7}
.inv-bank img{width:78px;height:78px;object-fit:contain}
.inv-sign{padding:6px;text-align:left}
.inv-sign .sg{text-align:right;padding-right:60px}
.inv-sign img{height:50px;margin:2px 0}
.inv-cut{display:flex;align-items:center;gap:6px;margin:8px 0 6px;color:#444;page-break-inside:avoid}
.inv-cut i{flex:1;border-top:1.5px dashed #444}
.inv-ack-title{text-align:center;font-weight:700;margin-bottom:5px}
.inv-ack{page-break-inside:avoid}
.inv-ack-h{display:flex;justify-content:space-between;padding:5px 6px;gap:8px;align-items:center}
.inv-ack-g{display:grid;grid-template-columns:1fr 1.2fr 1.2fr;border-top:1.5px solid #2b2b44}
.inv-ack-g>div{padding:6px;line-height:1.7;min-height:56px}
.inv-ack-g>div+div{border-left:1.5px solid #2b2b44}
.inv-btn{display:inline-flex;align-items:center;gap:6px;margin:0 auto 12px;padding:8px 16px;
  background:#2563eb;color:#fff;border:0;border-radius:8px;font-size:14px;cursor:pointer;font-family:Arial,sans-serif}
@media print{
  @page{size:A4;margin:0}
  body *{visibility:hidden}
  .inv-print-root,.inv-print-root *{visibility:visible}
  .inv-print-root{position:absolute;left:0;top:0;width:100%}
  .inv-noprint{display:none!important}
}
`;

export function InvoiceDocument({
  data,
  showPrintButton = true,
}: {
  data: InvoiceData;
  showPrintButton?: boolean;
}) {
  const {
    subTotal,
    taxAmount,
    total,
    roundOff,
    hsnRows,
    invoiceDiscount,
    freight,
    advance,
    balance,
  } = calcInvoice(data.items, data.taxRate, {
    invoiceDiscount: data.invoiceDiscount,
    freight: data.freight,
    advance: data.advance,
  });

  const intraState =
    data.interState !== undefined
      ? !data.interState
      : data.placeOfSupply.trim().startsWith("27");
  const hasDiscount = data.items.some((i) => (i.discount ?? 0) > 0);
  const terms = data.terms?.length ? data.terms : DEFAULT_INVOICE_TERMS;
  const taxLabel =
    hsnRows.length === 1 ? `${hsnRows[0].rate.toFixed(1)}%` : "GST";

  return (
    <div className="inv-print-root">
      <style>{STYLE}</style>

      {showPrintButton && (
        <div className="inv-noprint" style={{ textAlign: "center" }}>
          <button className="inv-btn" onClick={() => window.print()}>
            <Printer size={16} /> Print / Save as PDF
          </button>
        </div>
      )}

      <div className="inv-root">
        {/* Title */}
        <div className="inv-b inv-top">
          <span style={{ visibility: "hidden" }}>ORIGINAL FOR RECIPIENT</span>
          <b>Tax Invoice</b>
          <span>ORIGINAL FOR RECIPIENT</span>
        </div>

        {/* Company + invoice details */}
        <div className="inv-b inv-head">
          <div className="inv-co">
            <img
              src="/logo-icon.png"
              alt="Payal Decor"
              onError={(e) => {
                const t = e.currentTarget;
                if (!t.dataset.fb) {
                  t.dataset.fb = "1";
                  t.src = "/logo.png";
                }
              }}
            />
            <div>
              <h3>{COMPANY.name}</h3>
              <div>{COMPANY.address}</div>
              <div>
                Phone: <b>{COMPANY.phone}</b> &nbsp;&nbsp;&nbsp;&nbsp; Email:{" "}
                <b>{COMPANY.email}</b>
              </div>
              <div>
                GSTIN: <b>{COMPANY.gstin}</b> &nbsp;&nbsp;&nbsp;&nbsp; State:{" "}
                <b>{COMPANY.state}</b>
              </div>
            </div>
          </div>
          <div className="inv-det">
            <div>
              Invoice No: <b>{data.invoiceNo}</b>
            </div>
            <div>
              Date: <b>{formatDate(data.date)}</b>
            </div>
            <div>
              Place of Supply: <b>{data.placeOfSupply}</b>
            </div>
            {data.ewayBill && (
              <div>
                E-way Bill number: <b>{data.ewayBill}</b>
              </div>
            )}
          </div>
        </div>

        {/* Bill To / Ship To */}
        <div className="inv-b inv-party">
          <div>
            <b>Bill To:</b>
            <div>
              <b>{data.billToName || "—"}</b>
            </div>
            {data.billToAddress && (
              <div className="inv-desc">{data.billToAddress}</div>
            )}
            {data.billToContact && (
              <div>
                Contact No: <b>{data.billToContact}</b>
              </div>
            )}
            {data.billToGstin && (
              <div>
                GSTIN Number: <b>{data.billToGstin}</b>
              </div>
            )}
            {data.billToState && (
              <div>
                State: <b>{data.billToState}</b>
              </div>
            )}
          </div>
          <div>
            <b>Ship To:</b>
            <div className="inv-desc">{data.shipTo || ""}</div>
          </div>
        </div>

        {/* Items */}
        <div className="inv-b">
          <table className="inv-t">
            <thead>
              <tr>
                <th style={{ width: "3.5%" }}>#</th>
                <th>Item name</th>
                <th style={{ width: "9%" }}>HSN/ SAC</th>
                <th className="r" style={{ width: "13%" }}>
                  Sizes
                </th>
                <th className="r" style={{ width: "10%" }}>
                  Quantity
                </th>
                <th className="r" style={{ width: "8%" }}>
                  Unit
                </th>
                <th className="r" style={{ width: "12%" }}>
                  Price/ Unit
                </th>
                {hasDiscount && (
                  <th className="r" style={{ width: "10%" }}>
                    Discount
                  </th>
                )}
                <th className="r" style={{ width: "13%" }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <b>{index + 1}</b>
                  </td>
                  <td>
                    <b>{item.name}</b>
                    {item.description && (
                      <div className="inv-desc">({item.description})</div>
                    )}
                  </td>
                  <td>{item.hsn || ""}</td>
                  <td className="r">{item.sizes || ""}</td>
                  <td className="r">{item.qty}</td>
                  <td className="r">{item.unit || "Nos"}</td>
                  <td className="r">{money(item.price)}</td>
                  {hasDiscount && (
                    <td className="r">
                      {(item.discount ?? 0) > 0 ? money(item.discount ?? 0) : ""}
                    </td>
                  )}
                  <td className="r">
                    {money(item.qty * item.price - (item.discount ?? 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* HSN-wise tax + totals */}
        <div className="inv-b inv-sum">
          <div>
            <table className="inv-t inv-hsn">
              <thead>
                <tr>
                  <th rowSpan={2} className="c">
                    HSN/ SAC
                  </th>
                  <th rowSpan={2} className="c">
                    Taxable amount
                  </th>
                  {intraState ? (
                    <>
                      <th colSpan={2} className="c">
                        CGST
                      </th>
                      <th colSpan={2} className="c">
                        SGST
                      </th>
                    </>
                  ) : (
                    <th colSpan={2} className="c">
                      IGST
                    </th>
                  )}
                  <th rowSpan={2} className="c">
                    Total Tax
                  </th>
                </tr>
                <tr>
                  {intraState ? (
                    <>
                      <th className="c">Rate (%)</th>
                      <th className="c">Amt</th>
                      <th className="c">Rate (%)</th>
                      <th className="c">Amt</th>
                    </>
                  ) : (
                    <>
                      <th className="c">Rate (%)</th>
                      <th className="c">Amt</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {hsnRows.map((g) => (
                  <tr key={`${g.hsn}-${g.rate}`}>
                    <td>{g.hsn}</td>
                    <td className="r">{fmt(g.taxable)}</td>
                    {intraState ? (
                      <>
                        <td className="r">{(g.rate / 2).toFixed(1)}</td>
                        <td className="r">{fmt(g.tax / 2)}</td>
                        <td className="r">{(g.rate / 2).toFixed(1)}</td>
                        <td className="r">{fmt(g.tax / 2)}</td>
                      </>
                    ) : (
                      <>
                        <td className="r">{g.rate.toFixed(1)}</td>
                        <td className="r">{fmt(g.tax)}</td>
                      </>
                    )}
                    <td className="r">{fmt(g.tax)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="c">
                    <b>TOTAL</b>
                  </td>
                  <td className="r">
                    <b>{fmt(subTotal)}</b>
                  </td>
                  {intraState ? (
                    <>
                      <td />
                      <td className="r">
                        <b>{fmt(taxAmount / 2)}</b>
                      </td>
                      <td />
                      <td className="r">
                        <b>{fmt(taxAmount / 2)}</b>
                      </td>
                    </>
                  ) : (
                    <>
                      <td />
                      <td className="r">
                        <b>{fmt(taxAmount)}</b>
                      </td>
                    </>
                  )}
                  <td className="r">
                    <b>{fmt(taxAmount)}</b>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <div className="inv-amt">
              <span>Sub Total &nbsp;&nbsp;:</span>
              <span>{money(subTotal)}</span>
            </div>
            <div className="inv-amt">
              <span>Tax ({taxLabel}) &nbsp;&nbsp;:</span>
              <span>{money(taxAmount)}</span>
            </div>
            {invoiceDiscount > 0 && (
              <div className="inv-amt">
                <span>Invoice discount &nbsp;&nbsp;:</span>
                <span>- {money(invoiceDiscount)}</span>
              </div>
            )}
            {freight > 0 && (
              <div className="inv-amt">
                <span>Freight / other &nbsp;&nbsp;:</span>
                <span>{money(freight)}</span>
              </div>
            )}
            {Math.abs(roundOff) >= 0.005 && (
              <div className="inv-amt">
                <span>Round off &nbsp;&nbsp;:</span>
                <span>
                  {roundOff < 0 ? "- " : ""}
                  {money(Math.abs(roundOff))}
                </span>
              </div>
            )}
            <div className="inv-amt" style={{ fontWeight: 700 }}>
              <span>Total &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</span>
              <span>{money(total)}</span>
            </div>
            {advance > 0 && (
              <>
                <div className="inv-amt">
                  <span>Advance adjusted &nbsp;&nbsp;:</span>
                  <span>- {money(advance)}</span>
                </div>
                <div className="inv-amt" style={{ fontWeight: 700 }}>
                  <span>Balance due &nbsp;&nbsp;:</span>
                  <span>{money(balance)}</span>
                </div>
              </>
            )}
            <div className="inv-words">
              <span style={{ width: "34%", flexShrink: 0 }}>
                Invoice Amount In Words :
              </span>
              <span style={{ flex: 1 }}>{amountInWords(total)}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="inv-b inv-terms">
          <b>Terms And Conditions:</b>
          {terms.map((t, i) => (
            <div key={i}>
              {i + 1}.{t}
            </div>
          ))}
        </div>

        {/* Bank + signature */}
        <div className="inv-b inv-foot">
          <div>
            <div style={{ padding: "6px 6px 0" }}>
              <b>Bank Details:</b>
            </div>
            <div className="inv-bank">
              <img src="/upi-qr.png" alt="UPI QR" />
              <div>
                <div>
                  Bank Name: <b>{COMPANY.bankName}</b>
                </div>
                <div>
                  Bank Account No.: <b>{COMPANY.accountNo}</b>
                </div>
                <div>
                  IFSC code: <b>{COMPANY.ifsc}</b>
                </div>
                <div>
                  Account Holder's Name: <b>{COMPANY.holder}</b>
                </div>
              </div>
            </div>
          </div>
          <div className="inv-sign">
            <b>For {COMPANY.name}:</b>
            <div className="sg">
              <img src="/signature.png" alt="Signature" />
              <div>Authorized Signatory</div>
            </div>
          </div>
        </div>

        {/* Cut line + acknowledgement */}
        <div className="inv-cut">
          <span>✂</span>
          <i />
        </div>

        <div className="inv-ack">
          <div className="inv-ack-title">Acknowledgement</div>
          <div className="inv-b">
            <div className="inv-ack-h">
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <img
                  src="/logo-icon.png"
                  alt=""
                  onError={(e) => {
                    const t = e.currentTarget;
                    if (!t.dataset.fb) {
                      t.dataset.fb = "1";
                      t.src = "/logo.png";
                    }
                  }}
                  style={{
                    height: 24,
                    width: "auto",
                    maxWidth: 60,
                    objectFit: "contain",
                  }}
                />
                <div>
                  <b>{COMPANY.name}</b>
                  <div>
                    Phone: <b>{COMPANY.phone}</b>
                  </div>
                </div>
              </div>
              <div>
                Email: <b>{COMPANY.email}</b>
              </div>
              <div>
                GSTIN: <b>{COMPANY.gstin}</b>
              </div>
            </div>
            <div className="inv-ack-g">
              <div>
                <div>
                  Invoice No. : <b>{data.invoiceNo}</b>
                </div>
                <div>
                  Invoice Date : <b>{formatDate(data.date)}</b>
                </div>
                <div>
                  Invoice Amount : <b>{total.toFixed(1)}</b>
                </div>
              </div>
              <div>
                <div>
                  To <b>{data.billToName || "—"}</b>
                </div>
                {data.billToAddress && (
                  <div className="inv-desc">{data.billToAddress}</div>
                )}
              </div>
              <div>
                <b>Receiver's Seal &amp; Sign:</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}