import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/erp/AppShell";
import {
  EstimateDocument,
  type EstimateData,
} from "@/components/erp/EstimateDocument";

export const Route = createFileRoute("/estimate-preview")({
  component: EstimatePreviewPage,
});

const SAMPLE: EstimateData = {
  estimateNo: "2026-27/044",
  date: "2026-06-27",
  customerName: "Jahaagirdar Properties",
  placeOfSupply: "27-Maharashtra",
  taxRate: 18,
  items: [
    {
      name: "Sharing Workstation- (ECO O Leg Series) Cluster of 6",
      description:
        "Under Structure in M.S With Powder Coating Top in 25 mm PLB BSl Particle Board with 2mm PVC Edgeband 8mm Sandwich Glass Divider on Clamps.Individual Cable Manager. Common Raceway with electrical cutout provision. Without Apron, Keyboard , Cpu Trolley and Electrical Work.",
      hsn: "9403",
      sizes: "2400 X 1200",
      qty: 1,
      unit: "Nos",
      price: 36960,
    },
    {
      name: "Cabin Table",
      description:
        "Under Structure in M.S 50 X50 pipe with powder coating, Top in 25mm PLPB Particle Board , With Front Apron.",
      hsn: "9403",
      sizes: "2100 X 750",
      qty: 1,
      unit: "Nos",
      price: 19800,
    },
    {
      name: "Side Runner",
      description:
        "Top in 25 mm PLB Partical Board, Base in 18mm PLPB Particle Board Finish ",
      hsn: "9403",
      sizes: "900 X 400 X 900",
      qty: 1,
      unit: "Nos",
      price: 9000,
    },
    { name: "Chair-Mint", hsn: "9403", qty: 3, unit: "Nos", price: 5500 },
    { name: "Chair-EVA 03", hsn: "9403", qty: 3, unit: "Nos", price: 6500 },
    { name: "Dust Bin- DEBD 05", sizes: '8" X 12"', qty: 7, unit: "Nos", price: 600 },
  ],
};

function EstimatePreviewPage() {
  return (
    <AppShell title="Estimate Preview">
      <div className="p-4">
        <EstimateDocument data={SAMPLE} />
      </div>
    </AppShell>
  );
}