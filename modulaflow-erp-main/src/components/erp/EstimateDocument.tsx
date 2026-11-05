import { Printer } from "lucide-react";

export interface EstimateItem {
  name: string;
  description?: string;
  hsn?: string;
  sizes?: string;
  qty: number;
  unit?: string;
  price: number;
}

export interface EstimateData {
  estimateNo: string; // Quotation No. म्हणूनही वापरता येतो
  date: string; // YYYY-MM-DD
  customerName: string;
  customerAddress?: string;
  placeOfSupply: string; // "27-Maharashtra"
  items: EstimateItem[];
  taxRate: number; // 18
  terms?: string[];
}

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

export const DEFAULT_TERMS = [
  "Goods Once Sold will not be taken return.",
  "Estimate Valid For 30 days.",
  "Payment Term-50% Advance and 50% Before Dispatch.",
  "Mathadi Extra If Applicable",
  "Delivery Period - 25-35 Days",
  "Transport At Actual",
];

// Quotation साठी वेगळे default terms (फक्त "Estimate" ऐवजी "Quotation")
export const QUOTATION_TERMS = DEFAULT_TERMS.map((t) =>
  t.replace("Estimate Valid", "Quotation Valid"),
);

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty",
  "Ninety",
];

function below100(n: number) {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
}

export function amountInWords(amount: number) {
  let n = Math.round(amount);
  if (n === 0) return "Zero Rupees only";

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const hundred = Math.floor(n / 100);
  const rest = n % 100;

  const parts: string[] = [];
  if (crore) parts.push(below100(crore) + " Crore");
  if (lakh) parts.push(below100(lakh) + " Lakh");
  if (thousand) parts.push(below100(thousand) + " Thousand");
  if (hundred) parts.push(ONES[hundred] + " Hundred");
  if (rest) parts.push((parts.length ? "and " : "") + below100(rest));

  return parts.join(" ") + " Rupees only";
}

const money = (v: number) => `₹ ${v.toFixed(2)}`;

function formatDate(value: string) {
  const [y, m, d] = value.slice(0, 10).split("-");
  return `${d}-${m}-${y}`;
}

export function calcEstimate(items: EstimateItem[], taxRate: number) {
  const subTotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const taxAmount = (subTotal * taxRate) / 100;
  const raw = subTotal + taxAmount;
  const total = Math.round(raw);
  const roundOff = total - raw;
  return { subTotal, taxAmount, roundOff, total };
}

const STYLE = `
.est-page{width:210mm;min-height:297mm;margin:0 auto 16px;background:#fff;color:#000;
  font-family:Roboto,Arial,sans-serif;font-size:11px;padding:6mm;box-sizing:border-box;
  page-break-after:always}
.est-page:last-child{page-break-after:auto}
.est-title{text-align:center;font-weight:700;font-size:16px;margin:0 0 8px}
.est-box{border:1px solid #888}
.est-head{display:flex;justify-content:space-between;align-items:flex-start;padding:6px}
.est-head img{height:70px;width:70px;object-fit:contain}
.est-company{text-align:right;line-height:1.55;max-width:70%}
.est-company h2{margin:0;font-size:20px}
.est-gray{background:#a0a0a0;color:#fff;font-weight:700;padding:3px 5px}
.est-two{display:grid;grid-template-columns:56% 44%}
.est-two>div+div{border-left:1px solid #888}
.est-cell{padding:5px;line-height:1.6}
.est-right{text-align:right}
table.est-table{width:100%;border-collapse:collapse}
.est-table th{background:#a0a0a0;color:#fff;padding:3px 5px;text-align:left}
.est-table td{padding:3px 5px;vertical-align:top;border-left:1px solid #888;line-height:1.45}
.est-table td:first-child,.est-table th:first-child{border-left:0}
.est-table .r{text-align:right}
.est-desc{white-space:pre-wrap}
.est-amt-row{display:flex;justify-content:space-between;padding:3px 5px}
.est-three{display:grid;grid-template-columns:34% 36% 30%}
.est-three>div+div{border-left:1px solid #888}
.est-bank{display:flex;gap:6px;padding:6px;line-height:1.6}
.est-bank img{width:80px;height:80px;object-fit:contain}
.est-sign{text-align:center;padding:6px}
.est-sign img{height:55px;margin:6px 0}
.est-btn{display:inline-flex;align-items:center;gap:6px;margin:0 auto 12px;padding:8px 16px;
  background:#2563eb;color:#fff;border:0;border-radius:8px;font-size:14px;cursor:pointer}
@media print{
  @page{size:A4;margin:0}
  body *{visibility:hidden}
  .est-print-root,.est-print-root *{visibility:visible}
  .est-print-root{position:absolute;left:0;top:0;width:100%}
  .est-noprint{display:none!important}
  .est-page{margin:0}
}
`;

function Header() {
  return (
    <div className="est-box">
      <div className="est-head">
        <img src="/logo.png" alt="Payal Decor" />
        <div className="est-company">
          <h2>{COMPANY.name}</h2>
          <div>{COMPANY.address}</div>
          <div>
            Phone no.: {COMPANY.phone} Email: {COMPANY.email}
          </div>
          <div>
            GSTIN: {COMPANY.gstin}, State: {COMPANY.state}
          </div>
        </div>
      </div>
    </div>
  );
}

export function EstimateDocument({
  data,
  title = "Estimate",
  showPrintButton = true,
}: {
  data: EstimateData;
  /** "Estimate" किंवा "Quotation": पानाचं शीर्षक आणि सर्व labels बदलतात */
  title?: "Estimate" | "Quotation";
  showPrintButton?: boolean;
}) {
  const { subTotal, taxAmount, roundOff, total } = calcEstimate(
    data.items,
    data.taxRate,
  );
  const intraState = data.placeOfSupply.trim().startsWith("27");
  const halfRate = data.taxRate / 2;
  const terms = data.terms?.length
    ? data.terms
    : title === "Quotation"
      ? QUOTATION_TERMS
      : DEFAULT_TERMS;

  const roundOffText =
    roundOff < 0 ? `- ${money(Math.abs(roundOff))}` : money(roundOff);

  return (
    <div className="est-print-root">
      <style>{STYLE}</style>

      {showPrintButton && (
        <div className="est-noprint" style={{ textAlign: "center" }}>
          <button className="est-btn" onClick={() => window.print()}>
            <Printer size={16} /> Print / Save as PDF
          </button>
        </div>
      )}

      {/* ---------- PAGE 1 ---------- */}
      <div className="est-page">
        <div className="est-title">{title}</div>
        <Header />

        <div className="est-box est-two" style={{ borderTop: 0 }}>
          <div>
            <div className="est-gray">{title} For</div>
            <div className="est-cell">
              <b>{data.customerName}</b>
              {data.customerAddress && (
                <div className="est-desc">{data.customerAddress}</div>
              )}
            </div>
          </div>
          <div>
            <div className="est-gray est-right">{title} Details</div>
            <div className="est-cell est-right">
              <div>
                {title} No.: {data.estimateNo}
              </div>
              <div>Date: {formatDate(data.date)}</div>
              <div>Place of Supply: {data.placeOfSupply}</div>
            </div>
          </div>
        </div>

        <div className="est-box" style={{ borderTop: 0 }}>
          <table className="est-table">
            <thead>
              <tr>
                <th style={{ width: "4%" }}>#</th>
                <th>Item name</th>
                <th style={{ width: "9%" }}>HSN/ SAC</th>
                <th className="r" style={{ width: "13%" }}>Sizes</th>
                <th className="r" style={{ width: "9%" }}>Quantity</th>
                <th className="r" style={{ width: "7%" }}>Unit</th>
                <th className="r" style={{ width: "12%" }}>Price/ Unit</th>
                <th className="r" style={{ width: "12%" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <b>{item.name}</b>
                    {item.description && (
                      <div className="est-desc">({item.description})</div>
                    )}
                  </td>
                  <td>{item.hsn || ""}</td>
                  <td className="r">{item.sizes || ""}</td>
                  <td className="r">{item.qty}</td>
                  <td className="r">{item.unit || "Nos"}</td>
                  <td className="r">{money(item.price)}</td>
                  <td className="r">{money(item.qty * item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="est-box est-two" style={{ borderTop: 0 }}>
          <div>
            <div className="est-gray" style={{ textAlign: "center" }}>
              {title} order Amount In Words
            </div>
            <div className="est-cell" style={{ textAlign: "center" }}>
              {amountInWords(total)}
            </div>
          </div>
          <div>
            <div className="est-gray">Amounts</div>
            <div className="est-amt-row">
              <span>Sub Total</span>
              <span>{money(subTotal)}</span>
            </div>
            <div className="est-amt-row">
              <span>Tax ({data.taxRate.toFixed(1)}%)</span>
              <span>{money(taxAmount)}</span>
            </div>
            <div className="est-amt-row">
              <span>Round off</span>
              <span>{roundOffText}</span>
            </div>
            <div
              className="est-amt-row"
              style={{ borderTop: "1px solid #888", fontWeight: 700 }}
            >
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- PAGE 2 ---------- */}
      <div className="est-page">
        <div className="est-title">{title}</div>
        <Header />

        <div className="est-box" style={{ borderTop: 0 }}>
          <table className="est-table" style={{ width: "56%" }}>
            <thead>
              <tr>
                <th>Tax type</th>
                <th className="r">Taxable amount</th>
                <th className="r">Rate</th>
                <th className="r">Tax amount</th>
              </tr>
            </thead>
            <tbody>
              {intraState ? (
                <>
                  <tr>
                    <td>SGST</td>
                    <td className="r">{money(subTotal)}</td>
                    <td className="r">{halfRate.toFixed(1)}%</td>
                    <td className="r">{money(taxAmount / 2)}</td>
                  </tr>
                  <tr>
                    <td>CGST</td>
                    <td className="r">{money(subTotal)}</td>
                    <td className="r">{halfRate.toFixed(1)}%</td>
                    <td className="r">{money(taxAmount / 2)}</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td>IGST</td>
                  <td className="r">{money(subTotal)}</td>
                  <td className="r">{data.taxRate.toFixed(1)}%</td>
                  <td className="r">{money(taxAmount)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="est-box est-three" style={{ borderTop: 0 }}>
          <div>
            <div className="est-gray">Bank Details</div>
            <div className="est-bank">
              <img src="/upi-qr.png" alt="UPI QR" />
              <div>
                <div>Name: {COMPANY.bankName}</div>
                <div>Account No.: {COMPANY.accountNo}</div>
                <div>IFSC code: {COMPANY.ifsc}</div>
                <div>Account Holder's Name: {COMPANY.holder}</div>
              </div>
            </div>
          </div>
          <div>
            <div className="est-gray">Terms and conditions</div>
            <div className="est-cell">
              {terms.map((t, i) => (
                <div key={i}>
                  {i + 1}.{t}
                </div>
              ))}
            </div>
          </div>
          <div className="est-sign">
            <div>For: {COMPANY.name}</div>
            <img src="/signature.png" alt="Signature" />
            <div>
              <b>Authorized Signatory</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}