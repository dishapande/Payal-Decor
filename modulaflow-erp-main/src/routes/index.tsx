import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
  Calendar,
  Download,
  SlidersHorizontal,
  Clock,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
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
  ["Export", "निर्यात", "निर्यात"],
  ["Live ERP", "थेट ईआरपी", "लाइव ईआरपी"],
  ["Operational Overview", "कामकाज आढावा", "संचालन अवलोकन"],
  ["Payal Decor Modular Furniture", "पायल डेकोर मॉड्युलर फर्निचर", "पायल डेकोर मॉड्यूलर फर्नीचर"],

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
  ["Peak Sales", "सर्वोच्च विक्री", "शीर्ष बिक्री"],
  ["Net Profit", "निव्वळ नफा", "शुद्ध लाभ"],
  ["Avg Margin", "सरासरी मार्जिन", "औसत मार्जिन"],
  ["6 Categories", "६ श्रेणी", "६ श्रेणियां"],
  ["Total Revenue", "एकूण महसूल", "कुल राजस्व"],
  ["Due Soon", "लवकरच देय", "जल्द देय"],
  ["Overdue", "थकबाकी", "अतिदेय"],
  ["Reorder", "पुन्हा ऑर्डर", "पुनः ऑर्डर"],
  ["All Activities", "सर्व क्रियाकलाप", "सभी गतिविधियाँ"],

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
  const { i18n } = useTranslation();
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
          "Real-time executive dashboard for measurement-driven modular furniture ERP: sales, quotations, production, inventory and GST invoicing at a glance.",
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

const KPI_THEMES: Record<
  Kpi["tone"],
  {
    iconWrap: string;
    accentBar: string;
    badge: string;
  }
> = {
  primary: {
    iconWrap: "bg-primary/10 text-primary border border-primary/20",
    accentBar: "bg-primary",
    badge: "bg-primary/10 text-primary",
  },
  info: {
    iconWrap: "bg-info/15 text-info border border-info/20",
    accentBar: "bg-info",
    badge: "bg-info/10 text-info",
  },
  chart: {
    iconWrap: "bg-chart-4/15 text-chart-4 border border-chart-4/20",
    accentBar: "bg-chart-4",
    badge: "bg-chart-4/10 text-chart-4",
  },
  warning: {
    iconWrap: "bg-warning/20 text-warning-foreground border border-warning/30",
    accentBar: "bg-warning",
    badge: "bg-warning/15 text-warning-foreground",
  },
  accent: {
    iconWrap: "bg-accent/20 text-primary border border-accent/30",
    accentBar: "bg-accent",
    badge: "bg-accent/15 text-primary",
  },
  success: {
    iconWrap: "bg-success/15 text-success border border-success/20",
    accentBar: "bg-success",
    badge: "bg-success/10 text-success",
  },
};

const PIE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-4)",
  "var(--color-chart-3)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
];

function Panel({
  title,
  action,
  className,
  children,
  subtitle,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const tr = useTr();
  return (
    <section
      className={cn(
        "group relative flex flex-col rounded-xl border border-border bg-card shadow-[var(--shadow-card)] transition-all duration-200 hover:border-border/80 hover:shadow-md",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">{tr(title)}</h2>
          {subtitle && (
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{tr(subtitle)}</p>
          )}
        </div>
        {action}
      </header>
      <div className="flex-1 px-5 pb-5">{children}</div>
    </section>
  );
}

function ViewAll({ to }: { to?: string }) {
  const tr = useTr();
  if (to) {
    return (
      <Link
        to={to}
        className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80 hover:underline"
      >
        <span>{tr("View All")}</span>
        <ArrowRight className="size-3" />
      </Link>
    );
  }
  return (
    <button className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80 hover:underline">
      <span>{tr("View All")}</span>
      <ArrowRight className="size-3" />
    </button>
  );
}

const QUICK_LINKS: { label: string; icon: LucideIcon; to: string; tag: string }[] = [
  { label: "New Project", icon: FolderPlus, to: "/projects", tag: "Projects" },
  { label: "New BOQ", icon: Calculator, to: "/estimation", tag: "Estimation" },
  { label: "New Quotation", icon: FilePlus2, to: "/quotations", tag: "Sales" },
  { label: "New Sales Order", icon: ShoppingCart, to: "/sales-orders", tag: "Orders" },
  { label: "New Invoice", icon: ReceiptIndianRupee, to: "/invoicing", tag: "Billing" },
  { label: "New Work Order", icon: ClipboardPlus, to: "/work-orders", tag: "Factory" },
  { label: "Add Material", icon: PackagePlus, to: "/inventory", tag: "Stock" },
  { label: "Add Vendor", icon: UserPlus, to: "/vendors", tag: "Vendors" },
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
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);

  return (
    <AppShell title="Dashboard">
      {/* Top Welcome & Executive Header */}
      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-border/80 bg-gradient-to-r from-card via-card to-muted/40 p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
              <span className="size-1.5 rounded-full bg-success animate-pulse" />
              {tr("Live ERP")}
            </span>
            <span className="text-xs text-muted-foreground">
              {tr("Payal Decor Modular Furniture")} • FY 2025-26
            </span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {tr("Operational Overview")}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-client-calendar"))}
            title={tr("Client Meetings")}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-xs transition-colors hover:border-primary/50 hover:bg-muted cursor-pointer"
          >
            <Calendar className="size-3.5 text-primary" />
            <span>{tr("01 May 2025 – 31 May 2025")}</span>
            <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary">
              {tr("4 Meetings")}
            </span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-xs transition-colors hover:bg-muted"
          >
            <Download className="size-3.5 text-muted-foreground" />
            <span>{tr("Export")}</span>
          </button>
          <button
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-xs transition-colors hover:bg-muted"
          >
            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
            <span>{tr("Customize")}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => {
          const Icon = KPI_ICONS[k.icon];
          const up = k.delta >= 0;
          const theme = KPI_THEMES[k.tone];
          return (
            <article
              key={k.label}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className={cn("absolute inset-x-0 top-0 h-1", theme.accentBar)} />
              <div className="flex items-start justify-between gap-2">
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg shadow-xs", theme.iconWrap)}>
                  <Icon className="size-4.5" />
                </span>
                <span
                  className={cn(
                    "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular",
                    up ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
                  )}
                >
                  {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                  {Math.abs(k.delta)}%
                </span>
              </div>
              <div className="mt-3 min-w-0">
                <p className="truncate text-xs font-medium text-muted-foreground">{tr(k.label)}</p>
                <p className="tabular mt-0.5 truncate text-xl font-bold tracking-tight text-foreground">{k.value}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span>{tr(k.compare)}</span>
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {/* Row 2: Charts & Activities */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Sales & Profit Chart Panel */}
        <Panel
          title="Sales & Profit Overview"
          subtitle="Monthly revenue vs gross profit trend in Lakhs"
          className="xl:col-span-5"
          action={
            <div className="flex items-center gap-2">
              <span className="rounded-lg border border-border bg-muted/60 px-2.5 py-1 text-xs font-semibold text-foreground">
                {tr("Monthly")}
              </span>
            </div>
          }
        >
          {/* Quick Metrics Bar */}
          <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-chart-1" />
              <span className="text-muted-foreground">{tr("Peak Sales")}:</span>
              <span className="font-semibold text-foreground">₹ 128 L (May)</span>
            </div>
            <div className="h-3 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-chart-2" />
              <span className="text-muted-foreground">{tr("Net Profit")}:</span>
              <span className="font-semibold text-foreground">₹ 41 L (32%)</span>
            </div>
            <div className="h-3 w-px bg-border" />
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">{tr("Avg Margin")}:</span>
              <span className="font-semibold text-success">27.2%</span>
            </div>
          </div>

          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
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
                    boxShadow: "var(--shadow-pop)",
                    fontSize: 12,
                  }}
                />
                <Legend
                  formatter={(v) => (v === "sales" ? tr("Sales (₹)") : tr("Profit (₹)"))}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2.5}
                  fill="url(#salesGradient)"
                  activeDot={{ r: 5, stroke: "var(--color-card)", strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2.5}
                  fill="url(#profitGradient)"
                  activeDot={{ r: 5, stroke: "var(--color-card)", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Sales by Category Panel - Completely fixed layout with interactive center & progress pills */}
        <Panel
          title="Sales by Category"
          subtitle="Revenue share across product categories"
          className="xl:col-span-4"
          action={
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              ₹ 1.25 Cr {tr("Total")}
            </span>
          }
        >
          <div className="flex flex-col">
            {/* Interactive Donut Chart */}
            <div className="relative mx-auto h-[175px] w-full max-w-[200px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByCategory}
                    dataKey="value"
                    innerRadius={54}
                    outerRadius={80}
                    paddingAngle={2}
                    stroke="var(--color-card)"
                    strokeWidth={2}
                    onMouseEnter={(_, idx) => setActiveCategoryIndex(idx)}
                    onMouseLeave={() => setActiveCategoryIndex(null)}
                  >
                    {salesByCategory.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                        opacity={activeCategoryIndex === null || activeCategoryIndex === i ? 1 : 0.4}
                        className="cursor-pointer transition-opacity duration-200"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [`${v}% of sales`, "Share"]}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-card)",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Dynamic Center Display */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                {activeCategoryIndex !== null ? (
                  <div className="w-[100px] animate-in fade-in zoom-in-95 duration-150">
                    <p className="truncate text-[11px] font-semibold text-primary">
                      {tr(salesByCategory[activeCategoryIndex].name)}
                    </p>
                    <p className="tabular text-sm font-bold text-foreground">
                      ₹ {((124.8035 * salesByCategory[activeCategoryIndex].value) / 100).toFixed(1)}L
                    </p>
                    <span className="mt-0.5 inline-block rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                      {salesByCategory[activeCategoryIndex].value}%
                    </span>
                  </div>
                ) : (
                  <div className="w-[100px]">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {tr("Total Sales")}
                    </p>
                    <p className="tabular text-sm font-bold text-foreground">₹ 1.25 Cr</p>
                    <span className="mt-0.5 inline-block rounded-full bg-success/15 px-1.5 py-0.2 text-[10px] font-semibold text-success">
                      +18.6%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Categorized Breakdown Grid - Safe 2-column layout with truncation & mini progress bars */}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
              {salesByCategory.map((c, i) => {
                const isHovered = activeCategoryIndex === i;
                const valLakh = ((124.8035 * c.value) / 100).toFixed(1);
                return (
                  <div
                    key={c.name}
                    onMouseEnter={() => setActiveCategoryIndex(i)}
                    onMouseLeave={() => setActiveCategoryIndex(null)}
                    className={cn(
                      "group flex flex-col justify-between rounded-lg border p-2 text-left transition-all duration-150 min-w-0 cursor-pointer",
                      isHovered
                        ? "border-primary/40 bg-muted shadow-xs"
                        : "border-border/50 bg-card hover:border-border hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="size-2 shrink-0 rounded-full transition-transform group-hover:scale-125"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="truncate text-xs font-medium text-foreground">
                        {tr(c.name)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between gap-1">
                      <span className="tabular text-[11px] text-muted-foreground">
                        ₹ {valLakh}L
                      </span>
                      <span className="tabular text-xs font-semibold text-foreground">
                        {c.value}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${c.value}%`,
                          background: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Panel>

        {/* Recent Activities Panel */}
        <Panel
          title="Recent Activities"
          subtitle="Real-time operations log"
          className="xl:col-span-3"
          action={<ViewAll />}
        >
          <div className="relative pl-2">
            <div className="absolute left-[21px] top-2 bottom-2 w-px bg-border/80" />
            <ul className="space-y-3.5">
              {activities.map((a) => {
                const Icon = ACTIVITY_ICON[a.kind];
                return (
                  <li key={a.title} className="relative flex items-start gap-3">
                    <span
                      className={cn(
                        "relative z-10 grid size-7 shrink-0 place-items-center rounded-full border border-background shadow-xs",
                        a.kind === "alert"
                          ? "bg-destructive text-destructive-foreground ring-4 ring-destructive/15"
                          : a.kind === "payment"
                            ? "bg-success text-success-foreground"
                            : "bg-primary text-primary-foreground",
                      )}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <p className="truncate text-xs font-semibold text-foreground">{tr(a.title)}</p>
                        <span className="shrink-0 text-[10px] text-muted-foreground">{tr(a.time)}</span>
                      </div>
                      <p className="truncate text-[11px] text-muted-foreground">{tr(a.detail)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Panel>
      </div>

      {/* Quick Action Hub - Interactive Shortcuts to Modules */}
      <Panel
        title="Quick Links"
        subtitle="One-click access to create records and manage modules"
        className="mt-4"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.label}
              to={q.to}
              className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-border/80 bg-card p-3.5 text-center text-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:bg-muted/60 hover:shadow-md"
            >
              <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                <q.icon className="size-5" />
              </div>
              <span className="font-semibold text-foreground leading-tight">{tr(q.label)}</span>
              <span className="text-[10px] text-muted-foreground">{q.tag}</span>
            </Link>
          ))}
        </div>
      </Panel>

      {/* Lower Row: Projects, Inventory, Outstanding Invoices */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Top Projects Panel */}
        <Panel
          title="Top Projects"
          subtitle="High-value client installations and active status"
          className="xl:col-span-5"
          action={<ViewAll to="/projects" />}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2.5 font-medium">{tr("Project Name")}</th>
                  <th className="pb-2.5 font-medium">{tr("Customer")}</th>
                  <th className="pb-2.5 font-medium">{tr("Status")}</th>
                  <th className="pb-2.5 font-medium">{tr("Progress")}</th>
                  <th className="pb-2.5 text-right font-medium">{tr("Value (₹)")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {topProjects.map((p) => (
                  <tr key={p.name} className="transition-colors hover:bg-muted/40">
                    <td className="py-2.5 pr-2 font-medium text-foreground">{p.name}</td>
                    <td className="py-2.5 pr-2 text-xs text-muted-foreground">{p.customer}</td>
                    <td className="py-2.5 pr-2">
                      <StatusChip status={p.status} />
                    </td>
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <span className="tabular text-xs font-semibold">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="tabular py-2.5 text-right font-medium text-foreground">
                      {NUM.format(p.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Inventory Summary Panel */}
        <Panel
          title="Inventory Summary"
          subtitle="Critical material levels and stock health"
          className="xl:col-span-3"
          action={<ViewAll to="/inventory" />}
        >
          <ul className="space-y-3 text-sm">
            {inventorySummary.map((i) => {
              const isLow = i.status === "Low Stock";
              return (
                <li
                  key={i.item}
                  className="flex items-center gap-3 rounded-lg border border-border/50 p-2.5 transition-colors hover:bg-muted/40"
                >
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-md shadow-xs",
                      isLow ? "bg-destructive/10 text-destructive" : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    <PackagePlus className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">{i.item}</p>
                    <p className="tabular text-[11px] text-muted-foreground">{i.qty}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      isLow
                        ? "bg-destructive/15 text-destructive"
                        : "bg-success/15 text-success",
                    )}
                  >
                    {tr(i.status)}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>

        {/* Outstanding Invoices Panel */}
        <Panel
          title="Outstanding Invoices"
          subtitle="Pending receivables sorted by urgency"
          className="xl:col-span-4"
          action={<ViewAll to="/invoicing" />}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2.5 font-medium">{tr("Invoice No.")}</th>
                  <th className="pb-2.5 font-medium">{tr("Customer")}</th>
                  <th className="pb-2.5 font-medium">{tr("Due Date")}</th>
                  <th className="pb-2.5 text-right font-medium">{tr("Amount (₹)")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {outstandingInvoices.map((inv) => (
                  <tr key={inv.no} className="transition-colors hover:bg-muted/40">
                    <td className="py-2.5 pr-2 font-medium text-foreground">{inv.no}</td>
                    <td className="py-2.5 pr-2 text-xs text-muted-foreground">{inv.customer}</td>
                    <td className="py-2.5 pr-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3 text-warning" />
                        {tr(inv.due)}
                      </span>
                    </td>
                    <td className="tabular py-2.5 text-right font-semibold text-destructive">
                      {NUM.format(inv.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Receivable Summary Card */}
          <div className="mt-3 flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{tr("Total receivable")}</p>
              <p className="tabular text-base font-bold text-destructive">
                {INR.format(outstandingInvoices.reduce((s, i) => s + i.amount, 0))}
              </p>
            </div>
            <Link
              to="/invoicing"
              className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20"
            >
              <span>{tr("View All")}</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

function StatusChip({ status }: { status: "In Progress" | "Completed" | "Pending" }) {
  const tr = useTr();
  const tone =
    status === "Completed"
      ? "bg-success/15 text-success border-success/30"
      : status === "Pending"
        ? "bg-warning/25 text-warning-foreground border-warning/40"
        : "bg-info/15 text-info border-info/30";
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold", tone)}>
      {tr(status)}
    </span>
  );
}
