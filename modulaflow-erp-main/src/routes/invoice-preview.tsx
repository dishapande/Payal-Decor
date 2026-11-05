import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/erp/AppShell";
import {
  InvoiceDocument,
  type InvoiceData,
} from "@/components/erp/InvoiceDocument";

export const Route = createFileRoute("/invoice-preview")({
  component: InvoicePreviewPage,
});

const MADE = "Made In 18 mm Merino Marine Board With Edge band Finish";

const SAMPLE: InvoiceData = {
  invoiceNo: "2026-27/047",
  date: "2026-10-06",
  placeOfSupply: "27-Maharashtra",
  ewayBill: "202302755659",

  billToName: "DESIGN CUBBE",
  billToAddress: "1 CTS 1297 FP 683, SHIVAJINAGAR\nPune, Maharashtra - 411005\nIndia",
  billToContact: "9823033003",
  billToGstin: "27AFNPM1665H1Z5",
  billToState: "27-Maharashtra",

  shipTo: "Medirail Systems , Gaud Dhara , Khedshivapaur , Pune",

  taxRate: 18,
  items: [
    {
      name: "Reception Table",
      description: "Made In Ply and Laminate Finish With pedestal",
      hsn: "9403",
      sizes: "1600 X 525",
      qty: 1,
      unit: "Nos",
      price: 31500,
    },
    {
      name: "Side Runner ( D-400 mm ) ( 3 Drawer / 2 Shutter )",
      description: `${MADE}, Drawer in telescopic Channe`,
      hsn: "9403",
      sizes: "1155 X 600",
      qty: 1,
      unit: "Nos",
      price: 11600,
    },
    {
      name: "Back Runner",
      description: MADE,
      hsn: "9403",
      sizes: "3610 X 750",
      qty: 30,
      unit: "Sqf",
      price: 950,
    },
    {
      name: "Side Runner",
      description: `${MADE}, Drawer in telescopic Channe`,
      hsn: "9403",
      sizes: "1200 X 600",
      qty: 1,
      unit: "Nos",
      price: 11600,
    },
    {
      name: "Back Runner",
      description: MADE,
      hsn: "9403",
      sizes: "2995 X 750",
      qty: 25,
      unit: "Sqf",
      price: 950,
    },
    {
      name: "Full Ht Storage",
      description: MADE,
      hsn: "9403",
      sizes: "1200 X 2700",
      qty: 36,
      unit: "Sqf",
      price: 950,
    },
    {
      name: "Cabin Table",
      description:
        "Understructure in 18mm Marine Board , Top in 16 mm Ply one side Laminate Finish.",
      hsn: "9403",
      sizes: "2100 X 750",
      qty: 2,
      unit: "Nos",
      price: 22000,
    },
    {
      name: "Mandir Unit",
      description:
        "Made in Ply and Laminate Finish, Wooden Mandir Assembly Included.",
      hsn: "9403",
      sizes: "1500 X 600 X 850",
      qty: 1,
      unit: "-",
      price: 36500,
    },
    {
      name: "32 mm Door and Frame Mdf Finish",
      hsn: "9403",
      sizes: `8'0" X 2'6"`,
      qty: 1,
      unit: "Nos",
      price: 25600,
    },
    {
      name: "Conference Table",
      description: "Made in ply and L aminate",
      hsn: "9403",
      sizes: "3000 X 1500",
      qty: 1,
      unit: "Nos",
      price: 37500,
    },
    {
      name: "30 mm WPC door",
      description: "Both side Laminate Finish.",
      hsn: "9403",
      qty: 1,
      unit: "Nos",
      price: 14200,
    },
    {
      name: "Transport",
      hsn: "9965",
      qty: 3,
      unit: "Trip",
      price: 2000,
    },
  ],
};

function InvoicePreviewPage() {
  return (
    <AppShell title="Invoice Preview">
      <div className="p-4" style={{ background: "#e5e7eb" }}>
        <InvoiceDocument data={SAMPLE} />
      </div>
    </AppShell>
  );
}