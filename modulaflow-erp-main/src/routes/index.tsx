import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  ChartColumnIncreasing,
  FileSearch,
  FileText,
  ReceiptIndianRupee,
  IndianRupee,
  PieChart as PieIcon,
  ArrowUpRight,
  ArrowDownRight,
  FolderPlus,
  Calculator,
  FilePlus2,
  ShoppingCart,
  ClipboardPlus,
  PackagePlus,
  UserPlus,
  TriangleAlert,
  Wallet,
  Factory,
  type LucideIcon,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import "@/i18n";
import { AppShell } from "@/components/erp/AppShell";
import {
  activities,
  inventorySummary,
  kpis,
  outstandingInvoices,
  salesByCategory,
  salesTrend,
  topProjects,
  type Kpi,
} from "@/lib/erp/data";
import { INR, NUM } from "@/lib/erp/units";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Translation: English शब्द -> मराठी / हिन्दी                         */
/*  नवीन शब्द जोडायचा असेल तर WORDS मध्ये एक ओळ जोडा: [English, मराठी, हिन्दी] */
/* ------------------------------------------------------------------ */

type L = "mr" | "hi";

const WORDS: [string, string, string][] = [
  // Header / toolbar
  ["Customize", "सानुकूल करा", "कस्टमाइज़ करें"],
  ["View All", "सर्व पहा", "सभी देखें"],

  // KPI cards
  ["Total Sales", "एकूण विक्री", "कुल बिक्री"],
  ["Total Orders", "एकूण ऑर्डर", "कुल ऑर्डर"],
  ["Total Quotations", "एकूण कोटेशन", "कुल कोटेशन"],
  ["Total Invoices", "एकूण इन्व्हॉइस", "कुल इनवॉइस"],
  ["Outstanding", "थकबाकी", "बकाया"],
  ["Profit Margin", "नफा मार्जिन", "लाभ मार्जिन"],

  // Panels
  ["Sales & Profit Overview", "विक्री आणि नफा आढावा", "बिक्री और लाभ अवलोकन"],
  ["Monthly", "मासिक", "मासिक"],
  ["Sales", "विक्री", "बिक्री"],
  ["Profit", "नफा", "लाभ"],
  ["Sales (₹)", "विक्री (₹)", "बिक्री (₹)"],
  ["Profit (₹)", "नफा (₹)", "लाभ (₹)"],
  ["Sales by Category", "श्रेणीनुसार विक्री", "श्रेणी के अनुसार बिक्री"],
  ["Total", "एकूण", "कुल"],
  ["Recent Activities", "अलीकडील क्रियाकलाप", "हाल की गतिविधियाँ"],
  ["Quick Links", "जलद दुवे", "त्वरित लिंक"],
  ["Top Projects", "प्रमुख प्रकल्प", "शीर्ष प्रोजेक्ट्स"],
  ["Inventory Summary", "इन्व्हेंटरी सारांश", "इन्वेंटरी सारांश"],
  ["Outstanding Invoices", "थकबाकी इन्व्हॉइस", "बकाया इनवॉइस"],
  ["Total receivable", "एकूण येणे रक्कम", "कुल प्राप्य राशि"],

  // Categories
  ["Workstations", "वर्कस्टेशन", "वर्कस्टेशन"],
  ["Benching", "बेंचिंग", "बेंचिंग"],
  ["Storage", "स्टोरेज", "स्टोरेज"],
  ["Partitions", "पार्टिशन", "पार्टिशन"],
  ["Tables", "टेबल", "टेबल"],
  ["Other Accessories", "इतर ॲक्सेसरीज", "अन्य एक्सेसरीज़"],

  // Quick links
  ["New Project", "नवीन प्रकल्प", "नया प्रोजेक्ट"],
  ["New BOQ", "नवीन BOQ", "नया BOQ"],
  ["New Quotation", "नवीन कोटेशन", "नया कोटेशन"],
  ["New Sales Order", "नवीन विक्री ऑर्डर", "नया सेल्स ऑर्डर"],
  ["New Invoice", "नवीन इन्व्हॉइस", "नया इनवॉइस"],
  ["New Work Order", "नवीन वर्क ऑर्डर", "नया वर्क ऑर्डर"],
  ["Add Material", "माल जोडा", "सामग्री जोड़ें"],
  ["Add Vendor", "विक्रेता जोडा", "विक्रेता जोड़ें"],

  // Activities
  ["New Quotation created", "नवीन कोटेशन तयार केले", "नया कोटेशन बनाया गया"],
  ["Material Low Stock Alert", "माल साठा कमी असल्याची सूचना", "सामग्री का स्टॉक कम होने की चेतावनी"],

  // Tables
  ["Project Name", "प्रकल्पाचे नाव", "प्रोजेक्ट का नाम"],
  ["Customer", "ग्राहक", "ग्राहक"],
  ["Status", "स्थिती", "स्थिति"],
  ["Progress", "प्रगती", "प्रगति"],
  ["Value (₹)", "मूल्य (₹)", "मूल्य (₹)"],
  ["Invoice No.", "इन्व्हॉइस क्र.", "इनवॉइस क्र."],
  ["Due Date", "देय तारीख", "देय तिथि"],
  ["Amount (₹)", "रक्कम (₹)", "राशि (₹)"],

  // Status values
  ["In Progress", "प्रगतीत", "प्रगति में"],
  ["Completed", "पूर्ण", "पूर्ण"],
  ["Pending", "प्रलंबित", "लंबित"],
  ["Low Stock", "साठा कमी", "स्टॉक कम"],
  ["In Stock", "साठा उपलब्ध", "स्टॉक में"],
];

const DICT: Record<L, Record<string, string>> = { mr: {}, hi: {} };
WORDS.forEach(([en, mr, hi]) => {
  DICT.mr[en] = mr;
  DICT.hi[en] = hi;
});

const MONTHS: Record<L, Record<string, string>> = {
  mr: {
    Jan: "जाने", Feb: "फेब्रु", Mar: "मार्च", Apr: "एप्रिल", May: "मे", Jun: "जून",
    Jul: "जुलै", Aug: "ऑगस्ट", Sep: "सप्टें", Oct: "ऑक्टो", Nov: "नोव्हें", Dec: "डिसें",
  },
  hi: {
    Jan: "जन", Feb: "फ़र", Mar: "मार्च", Apr: "अप्रैल", May: "मई", Jun: "जून",
    Jul: "जुल", Aug: "अग", Sep: "सित", Oct: "अक्टू", Nov: "नव", Dec: "दिस",
  },
};
const MONTH_RE = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g;

type Tr = (s: string) => string;
type Pattern = {
  re: RegExp;
  mr: (m: RegExpMatchArray, tr: Tr) => string;
  hi: (m: RegExpMatchArray, tr: Tr) => string;
};

// बदलणारे आकडे/नावे असलेली वाक्ये
const PATTERNS: Pattern[] = [
  { re: /^vs (.+)$/, mr: (m, tr) => `${tr(m[1])} च्या तुलनेत`, hi: (m, tr) => `${tr(m[1])} की तुलना में` },
  { re: /^(\d+) mins? ago$/, mr: (m) => `${m[1]} मिनिटांपूर्वी`, hi: (m) => `${m[1]} मिनट पहले` },
  { re: /^(\d+) hours? ago$/, mr: (m) => `${m[1]} तासांपूर्वी`, hi: (m) => `${m[1]} घंटे पहले` },
  { re: /^(\d+) days? ago$/, mr: (m) => `${m[1]} दिवसांपूर्वी`, hi: (m) => `${m[1]} दिन पहले` },
  { re: /^Work Order (.+)$/, mr: (m) => `वर्क ऑर्डर ${m[1]}`, hi: (m) => `वर्क ऑर्डर ${m[1]}` },
  { re: /^Invoice (.+)$/, mr: (m) => `इन्व्हॉइस ${m[1]}`, hi: (m) => `इनवॉइस ${m[1]}` },
  { re: /^Payment of (.+) received$/, mr: (m) => `${m[1]} चे पेमेंट मिळाले`, hi: (m) => `${m[1]} का भुगतान प्राप्त हुआ` },
  { re: /^status updated to (.+)$/, mr: (m, tr) => `स्थिती अपडेट: ${tr(m[1])}`, hi: (m, tr) => `स्थिति अपडेट: ${tr(m[1])}` },
  { re: /^generated for (.+)$/, mr: (m) => `${m[1]} साठी तयार केले`, hi: (m) => `${m[1]} के लिए तैयार किया` },
  { re: /^from (.+)$/, mr: (m) => `${m[1]} कडून`, hi: (m) => `${m[1]} से` },
  { re: /^([A-Z]{2,3}-[\w-]+) for (.+)$/, mr: (m) => `${m[2]} साठी ${m[1]}`, hi: (m) => `${m[2]} के लिए ${m[1]}` },
];

function translateText(s: string, lang: string): string {
  if (lang !== "mr" && lang !== "hi") return s;
  const l = lang as L;
  const exact = DICT[l][s];
  if (exact) return exact;
  for (const p of PATTERNS) {
    const m = s.match(p.re);
    if (m) return p[l](m, (x) => translateText(x, lang));
  }
  return s.replace(MONTH_RE, (mo) => MONTHS[l][mo] ?? mo);
}

function useTr(): Tr {
  const { i18n } = useTranslation(); // भाषा बदलली की page आपोआप पुन्हा draw होतो
  const lang = (i18n.language || "en").slice(0, 2);
  return (s: string) => translateText(s, lang);
}

/* ------------------------------------------------------------------ */

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | Payal Decor Modular Furniture ERP" },
      {
        name: "description",
        content:
          "Real-time dashboard for measurement-driven modular furniture ERP: sales, quotations, production, inventory and GST invoicing at a glance.",
      },
      { property: "og:title", content: "Dashboard | Payal Decor Modular Furniture ERP" },
      {
        property: "og:description",
        content:
          "Track sales, BOQ, work orders, inventory and receivables across every modular furniture project.",
      },
    ],
  }),
  component: Dashboard,
});

const KPI_ICONS: Record<Kpi["icon"], LucideIcon> = {
  sales: ChartColumnIncreasing,
  orders: FileSearch,
  quotations: FileText,
  invoices: ReceiptIndianRupee,
  outstanding: IndianRupee,
  margin: PieIcon,
};

const TONE: Record<Kpi["tone"], string> = {
  primary: "bg-primary/10 text-primary",
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/20 text-warning-foreground",
  accent: "bg-accent/20 text-primary",
  chart: "bg-chart-6/20 text-chart-6",
};

const PIE_COLORS = [
  "var(--color-chart-4)",
  "var(--color-chart-1)",
  "var(--color-chart-5)",
  "var(--color-chart-2)",
  "var(--color-warning)",
  "var(--color-success)",
];

function Panel({
  title,
  action,
  className,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  const tr = useTr();
  return (
    <section
      className={cn("rounded-xl border border-border bg-card shadow-[var(--shadow-card)]", className)}
    >
      <header className="flex items-center justify-between gap-3 px-5 py-4">
        <h2 className="text-sm font-semibold">{tr(title)}</h2>
        {action}
      </header>
      <div className="px-5 pb-5">{children}</div>
    </section>
  );
}

function ViewAll() {
  const tr = useTr();
  return (
    <button className="text-xs font-medium text-primary hover:underline">{tr("View All")}</button>
  );
}

const QUICK_LINKS: { label: string; icon: LucideIcon }[] = [
  { label: "New Project", icon: FolderPlus },
  { label: "New BOQ", icon: Calculator },
  { label: "New Quotation", icon: FilePlus2 },
  { label: "New Sales Order", icon: ShoppingCart },
  { label: "New Invoice", icon: ReceiptIndianRupee },
  { label: "New Work Order", icon: ClipboardPlus },
  { label: "Add Material", icon: PackagePlus },
  { label: "Add Vendor", icon: UserPlus },
];

const ACTIVITY_ICON = {
  quotation: FileText,
  production: Factory,
  invoice: ReceiptIndianRupee,
  payment: Wallet,
  alert: TriangleAlert,
} as const;

function Dashboard() {
  const tr = useTr();

  return (
    <AppShell title="Dashboard">
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
          {tr("01 May 2025 – 31 May 2025")}
        </div>
        <button className="rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted">
          {tr("Customize")}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {kpis.map((k) => {
          const Icon = KPI_ICONS[k.icon];
          const up = k.delta >= 0;
          return (
            <article
              key={k.label}
              className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-start gap-3">
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", TONE[k.tone])}>
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{tr(k.label)}</p>
                  <p className="tabular mt-1 truncate text-xl font-semibold">{k.value}</p>
                  <p
                    className={cn(
                      "mt-1 flex items-center gap-1 text-xs font-medium",
                      up ? "text-success" : "text-destructive",
                    )}
                  >
                    {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                    {Math.abs(k.delta)}%
                  </p>
                  <p className="text-[11px] text-muted-foreground">{tr(k.compare)}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel
          title="Sales & Profit Overview"
          className="xl:col-span-5"
          action={
            <span className="rounded-lg border border-border px-3 py-1.5 text-xs">
              {tr("Monthly")}
            </span>
          }
        >
          <div className="h-[290px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrend} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={(v: string) => tr(String(v))}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--color-border)" }}
                />
                <YAxis
                  tickFormatter={(v: number) => `${v}L`}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(v: number, n) => [
                    `₹ ${v} Lakh`,
                    n === "sales" ? tr("Sales") : tr("Profit"),
                  ]}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    fontSize: 12,
                  }}
                />
                <Legend
                  formatter={(v) => (v === "sales" ? tr("Sales (₹)") : tr("Profit (₹)"))}
                  iconType="plainline"
                  wrapperStyle={{ fontSize: 12 }}
                />
                <Line
                  type="linear"
                  dataKey="sales"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="linear"
                  dataKey="profit"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Sales by Category" className="xl:col-span-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative h-[220px] w-[220px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByCategory}
                    dataKey="value"
                    innerRadius={62}
                    outerRadius={100}
                    paddingAngle={1}
                    stroke="var(--color-card)"
                  >
                    {salesByCategory.map((entry, i) => (
                      <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => `${v}%`}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-card)",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                <div>
                  <p className="text-xs text-muted-foreground">{tr("Total")}</p>
                  <p className="tabular text-sm font-semibold">₹ 1,24,80,350</p>
                </div>
              </div>
            </div>
            <ul className="w-full space-y-2 text-sm">
              {salesByCategory.map((c, i) => (
                <li key={c.name} className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="flex-1 text-muted-foreground">{tr(c.name)}</span>
                  <span className="tabular font-medium">{c.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <Panel title="Recent Activities" className="xl:col-span-3" action={<ViewAll />}>
          <ul className="space-y-3">
            {activities.map((a) => {
              const Icon = ACTIVITY_ICON[a.kind];
              return (
                <li key={a.title} className="flex gap-3 border-b border-border pb-3 last:border-0">
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-md",
                      a.kind === "alert" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight">{tr(a.title)}</p>
                    <p className="truncate text-xs text-muted-foreground">{tr(a.detail)}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{tr(a.time)}</span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <Panel title="Quick Links" className="mt-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
          {QUICK_LINKS.map((q) => (
            <button
              key={q.label}
              className="flex flex-col items-center gap-2 rounded-lg border border-border px-3 py-4 text-xs transition-colors hover:border-primary hover:bg-muted"
            >
              <q.icon className="size-5 text-primary" />
              {tr(q.label)}
            </button>
          ))}
        </div>
      </Panel>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel title="Top Projects" className="xl:col-span-5" action={<ViewAll />}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="pb-2 font-medium">{tr("Project Name")}</th>
                <th className="pb-2 font-medium">{tr("Customer")}</th>
                <th className="pb-2 font-medium">{tr("Status")}</th>
                <th className="pb-2 font-medium">{tr("Progress")}</th>
                <th className="pb-2 text-right font-medium">{tr("Value (₹)")}</th>
              </tr>
            </thead>
            <tbody>
              {topProjects.map((p) => (
                <tr key={p.name} className="border-b border-border last:border-0">
                  <td className="py-2.5 pr-2">{p.name}</td>
                  <td className="py-2.5 pr-2 text-muted-foreground">{p.customer}</td>
                  <td className="py-2.5 pr-2">
                    <StatusChip status={p.status} />
                  </td>
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                      <span className="tabular text-xs">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="tabular py-2.5 text-right">{NUM.format(p.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Inventory Summary" className="xl:col-span-3" action={<ViewAll />}>
          <ul className="space-y-3 text-sm">
            {inventorySummary.map((i) => (
              <li key={i.item} className="flex items-center gap-3 border-b border-border pb-3 last:border-0">
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-secondary text-secondary-foreground">
                  <PackagePlus className="size-4" />
                </span>
                <span className="min-w-0 flex-1 truncate">{i.item}</span>
                <span className="tabular shrink-0 text-xs text-muted-foreground">{i.qty}</span>
                <span
                  className={cn(
                    "shrink-0 text-xs font-medium",
                    i.status === "Low Stock" ? "text-destructive" : "text-success",
                  )}
                >
                  {tr(i.status)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Outstanding Invoices" className="xl:col-span-4" action={<ViewAll />}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="pb-2 font-medium">{tr("Invoice No.")}</th>
                <th className="pb-2 font-medium">{tr("Customer")}</th>
                <th className="pb-2 font-medium">{tr("Due Date")}</th>
                <th className="pb-2 text-right font-medium">{tr("Amount (₹)")}</th>
              </tr>
            </thead>
            <tbody>
              {outstandingInvoices.map((inv) => (
                <tr key={inv.no} className="border-b border-border last:border-0">
                  <td className="py-2.5 pr-2">{inv.no}</td>
                  <td className="py-2.5 pr-2 text-muted-foreground">{inv.customer}</td>
                  <td className="py-2.5 pr-2 text-muted-foreground">{tr(inv.due)}</td>
                  <td className="tabular py-2.5 text-right font-medium text-destructive">
                    {NUM.format(inv.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted-foreground">
            {tr("Total receivable")}{" "}
            {INR.format(outstandingInvoices.reduce((s, i) => s + i.amount, 0))}
          </p>
        </Panel>
      </div>
    </AppShell>
  );
}

function StatusChip({ status }: { status: "In Progress" | "Completed" | "Pending" }) {
  const tr = useTr();
  const tone =
    status === "Completed"
      ? "bg-success/15 text-success"
      : status === "Pending"
        ? "bg-warning/25 text-warning-foreground"
        : "bg-info/15 text-info";
  return (
    <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", tone)}>{tr(status)}</span>
  );
}