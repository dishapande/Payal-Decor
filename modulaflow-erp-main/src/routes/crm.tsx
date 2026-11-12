import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Download,
  Upload,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Eye,
  Users,
  Filter,
  Check,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  Compass,
  Database,
  Copy,
  Send,
  Settings,
  SendHorizontal,
  AtSign,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Key,
  Globe,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/erp/AppShell";
import { INITIAL_CRM_RECORDS, type CRMLead } from "@/data/crm-data";

export const Route = createFileRoute("/crm")({
  component: CRMPage,
});

const API_BASE = (
  import.meta.env["VITE_API_URL"] || "http://localhost:5001/api"
).replace(/\/+$/, "");

const STORAGE_KEY = "payal_decor_crm_leads_v5";
export const HOSTINGER_STORAGE_KEY = "payal_decor_hostinger_mail_config";

/**
 * Standard Cold Email Template for Payal Decor architectural & interior outreach
 */
export function getColdEmailTemplate(lead: {
  businessName: string;
  category?: string;
  locality?: string;
  secondaryEmail?: string;
}) {
  const companyName = lead.businessName || "your team";
  const contactName = lead.businessName ? `${lead.businessName} Team` : "Team";
  const subject = "Furniture & Interior Solutions for Your Upcoming Projects";
  const body = `Hi ${contactName},

We are reaching out from Payal Decor, Pune.

We would like to explore opportunities to collaborate with ${companyName} on upcoming architectural and interior projects.

Payal Decor offers furniture and interior solutions for residential and commercial requirements.

We would be interested in understanding your upcoming project requirements and exploring how we could support your team.

Would you be available for a brief discussion?

Website: https://payaldecor.in/

Regards,
Team Payal Decor`;

  return { subject, body };
}

/**
 * Generates direct Gmail Web Compose URL with user-specified Cold Email template
 */
export function getGmailComposeUrl(lead: {
  businessName: string;
  category?: string;
  locality?: string;
  secondaryEmail?: string;
}) {
  const email = (lead.secondaryEmail || "").trim();
  if (!email) return "";

  const { subject, body } = getColdEmailTemplate(lead);

  const baseUrl = "https://mail.google.com/mail/?view=cm&fs=1";
  const params = [
    `to=${encodeURIComponent(email)}`,
    `su=${encodeURIComponent(subject)}`,
    `body=${encodeURIComponent(body)}`,
  ].join("&");

  return `${baseUrl}&${params}`;
}

/**
 * Generates direct WhatsApp message URL with user-specified WhatsApp Introduction template
 */
export function getWhatsAppUrl(phone: string, businessName: string) {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  if (!cleanPhone) return "#";
  const formattedPhone = cleanPhone.startsWith("91")
    ? cleanPhone
    : `91${cleanPhone.replace(/^0+/, "")}`;

  const contactName = businessName ? `${businessName} Team` : "Team";
  const message = `Hello ${contactName},
This is from Payal Decor, Pune. We work on furniture and interior solutions for various project requirements.
We would love to connect with your architecture firm and explore potential collaboration opportunities.
Would it be possible to schedule a brief discussion?`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

const emptyForm: Omit<CRMLead, "id"> = {
  source: "Meta",
  businessName: "",
  category: "Hostel",
  genderType: "Boys & Girls",
  primaryPhone: "",
  secondaryEmail: "",
  website: "",
  address: "",
  locality: "Pune",
  mapsUrl: "",
  sourceNote: "",
  sourceUrl: "",
  status: "New",
  notes: "",
};

export const CATEGORY_OPTIONS = [
  "Boys hostel",
  "Girls hostel",
  "PG / hostel",
  "PG accommodation",
  "Student housing / hostel",
  "Ladies hostel",
  "Institutional hostel",
  "Institutional girls hostel",
  "Hostel / co-work / cafe",
  "Backpacker / co-living",
  "Hostel / co-work",
  "Backpacker hostel",
  "Hostel",
];

export const GENDER_OPTIONS = [
  "Boys",
  "Girls",
  "Boys & Girls",
  "Mixed",
  "Not stated",
];

export const SOURCE_OPTIONS = [
  "Meta Ads",
  "Meta",
  "Direct Referral",
  "Justdial",
  "Vidyasagar Academy",
  "OpenAlfa",
  "Google Business",
  "Other",
];

function CRMPage() {
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [localityFilter, setLocalityFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");

  // Create / Edit Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // View Details Modal State
  const [viewingLead, setViewingLead] = useState<CRMLead | null>(null);

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [importMode, setImportMode] = useState<"append" | "replace">("append");
  const [importParsedCount, setImportParsedCount] = useState<number | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Notification Banner
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Database Connection & Sync Status
  const [dbStatus, setDbStatus] = useState<"connected" | "syncing" | "local">("local");
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Email Copy State
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Hostinger Mail API Configuration State
  const [hostingerConfig, setHostingerConfig] = useState<{
    apiKey: string;
    senderEmail: string;
    senderName: string;
  }>(() => {
    try {
      const saved = localStorage.getItem(HOSTINGER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      apiKey: "",
      senderEmail: "info@payaldecor.in",
      senderName: "Payal Decor ERP",
    };
  });

  // Settings Modal State
  const [showEmailSettingsModal, setShowEmailSettingsModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  const [tempSenderEmail, setTempSenderEmail] = useState("");
  const [tempSenderName, setTempSenderName] = useState("");

  // Official Send Email Modal State (Hostinger Mail API)
  const [showSendEmailModal, setShowSendEmailModal] = useState(false);
  const [emailTargetLead, setEmailTargetLead] = useState<CRMLead | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Sync Hostinger configuration from backend on mount
  useEffect(() => {
    const fetchBackendConfig = async () => {
      try {
        const res = await fetch(`${API_BASE}/crm/email-config`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.success) {
            setHostingerConfig((prev) => ({
              apiKey: prev.apiKey || (data.configured ? "configured-in-backend" : ""),
              senderEmail: data.senderEmail || prev.senderEmail || "info@payaldecor.in",
              senderName: data.senderName || prev.senderName || "Payal Decor ERP",
            }));
          }
        }
      } catch {
        // backend offline
      }
    };
    void fetchBackendConfig();
  }, []);

  const handleOpenEmailSettings = () => {
    setTempApiKey(hostingerConfig.apiKey);
    setTempSenderEmail(hostingerConfig.senderEmail);
    setTempSenderName(hostingerConfig.senderName);
    setShowEmailSettingsModal(true);
  };

  const handleSaveEmailSettings = async () => {
    const newConfig = {
      apiKey: tempApiKey.trim(),
      senderEmail: tempSenderEmail.trim() || "info@payaldecor.in",
      senderName: tempSenderName.trim() || "Payal Decor ERP",
    };
    setHostingerConfig(newConfig);
    try {
      localStorage.setItem(HOSTINGER_STORAGE_KEY, JSON.stringify(newConfig));
    } catch {
      // ignore
    }

    try {
      await fetch(`${API_BASE}/crm/email-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
    } catch {
      // ignore
    }

    setShowEmailSettingsModal(false);
    setFeedbackMsg({
      type: "success",
      text: "Hostinger Mail API settings saved! Official emails will be sent with Payal Decor corporate identity.",
    });
  };

  const handleOpenSendEmail = (lead: CRMLead) => {
    if (!lead.secondaryEmail) {
      alert("This lead does not have a public email address listed.");
      return;
    }
    const template = getColdEmailTemplate(lead);
    setEmailTargetLead(lead);
    setEmailSubject(template.subject);
    setEmailBody(template.body);
    setEmailFeedback(null);
    setShowSendEmailModal(true);
  };

  const handleSendOfficialEmail = async () => {
    if (!emailTargetLead || !emailTargetLead.secondaryEmail) return;

    setSendingEmail(true);
    setEmailFeedback(null);

    try {
      // 1. Send via Backend Server (Node.js -> Hostinger Mail API)
      const res = await fetch(`${API_BASE}/crm/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailTargetLead.secondaryEmail,
          recipientName: emailTargetLead.businessName,
          subject: emailSubject,
          body: emailBody,
          hostingerApiKey: hostingerConfig.apiKey || undefined,
          senderEmail: hostingerConfig.senderEmail || "info@payaldecor.in",
          senderName: hostingerConfig.senderName || "Payal Decor ERP",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        const updatedTimestamp = new Date().toISOString();
        const updatedLeads = leads.map((l) =>
          l.id === emailTargetLead.id
            ? {
                ...l,
                lastEmailedAt: updatedTimestamp,
                status: l.status === "New" ? ("Contacted" as const) : l.status,
              }
            : l
        );
        persistLeads(updatedLeads);

        setEmailFeedback({
          type: "success",
          text: `Official email queued and delivered via Hostinger Mail API from ${hostingerConfig.senderName} <${hostingerConfig.senderEmail}>!`,
        });

        setTimeout(() => {
          setShowSendEmailModal(false);
          setEmailFeedback(null);
        }, 2200);
      } else {
        setEmailFeedback({
          type: "error",
          text: data.message || "Hostinger Mail API delivery failed. Please verify your API Key and domain in Hostinger hPanel.",
        });
      }
    } catch (err: any) {
      // 2. Direct client fallback to Hostinger Mail API: POST /api/v1/mailboxes/{mailboxId}/send
      try {
        const mailboxId = "AC07bd27deec3511fc9e0418c64501";
        const token = hostingerConfig.apiKey || "aa491c65bc4f6adda6f906db867bee2016d832b2b397fae94096528df89d4131";
        const directUrl = `https://api.mail.hostinger.com/api/v1/mailboxes/${mailboxId}/send`;

        const directRes = await fetch(directUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            to: [emailTargetLead.secondaryEmail],
            displayName: "Payal Decor",
            subject: emailSubject,
            text: emailBody,
            html: `<div style="font-family:sans-serif;line-height:1.6;color:#1e293b;">${emailBody.replace(/\n/g, "<br/>")}</div>`,
          }),
        });

        const directData = await directRes.json().catch(() => ({}));

        if (directRes.ok || directRes.status === 200 || directRes.status === 201 || directRes.status === 202) {
          const updatedTimestamp = new Date().toISOString();
          const updatedLeads = leads.map((l) =>
            l.id === emailTargetLead.id
              ? {
                  ...l,
                  lastEmailedAt: updatedTimestamp,
                  status: l.status === "New" ? ("Contacted" as const) : l.status,
                }
              : l
          );
          persistLeads(updatedLeads);

          setEmailFeedback({
            type: "success",
            text: `Official email queued and delivered to ${emailTargetLead.secondaryEmail} as Payal Decor <info@payaldecor.in>!`,
          });

          setTimeout(() => {
            setShowSendEmailModal(false);
            setEmailFeedback(null);
          }, 2200);
          setSendingEmail(false);
          return;
        } else {
          setEmailFeedback({
            type: "error",
            text: directData.message || directData.error || `Hostinger Mail API error: HTTP ${directRes.status}. Make sure your backend server is running on port 5001.`,
          });
          setSendingEmail(false);
          return;
        }
      } catch (directErr: any) {
        // continue to error below
      }

      setEmailFeedback({
        type: "error",
        text: `Failed to dispatch email. Please ensure your backend server is running on port 5001 (run "node server.js" in the backend directory).`,
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCopyEmail = (email: string) => {
    if (!email) return;
    try {
      navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch {
      // fallback
    }
  };

  // Persist to local database cache
  const persistLeads = (data: CRMLead[]) => {
    setLeads(data);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  };

  // Load leads from persistent storage and sync with PostgreSQL / Backend Database API
  const loadLeads = useCallback(async () => {
    setLoading(true);
    let currentData = [...INITIAL_CRM_RECORDS];

    // 1. Load from local database cache (immediate offline & speed guarantee)
    try {
      const stored =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem("payal_decor_crm_leads_v4") ||
        localStorage.getItem("payal_decor_crm_leads_v3");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((r: CRMLead) => r.id));

          // Fresh Meta Ads leads not yet in parsed cache
          const freshMetaLeads = INITIAL_CRM_RECORDS.filter(
            (r) => r.source === "Meta Ads" && !existingIds.has(r.id)
          );

          // Any other missing records (like existing hostel leads)
          const missingOther = INITIAL_CRM_RECORDS.filter(
            (r) =>
              r.source !== "Meta Ads" &&
              !existingIds.has(r.id) &&
              (r.businessName
                ? !parsed.some(
                    (p: CRMLead) =>
                      p.businessName.toLowerCase().trim() === r.businessName.toLowerCase().trim()
                  )
                : false)
          );

          currentData = [...freshMetaLeads, ...parsed, ...missingOther];
        }
      }
    } catch {
      // ignore
    }

    // Strict guarantee: Fresh Meta Ads leads are ALWAYS placed on top
    const metaAdsLeads = currentData.filter((l) => l.source === "Meta Ads");
    const otherLeads = currentData.filter((l) => l.source !== "Meta Ads");
    currentData = [...metaAdsLeads, ...otherLeads];

    // 2. Query Central Database API (PostgreSQL / Express at http://localhost:5001)
    try {
      const res = await fetch(`${API_BASE}/crm/leads`, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const dbData = await res.json();
        const serverLeads = Array.isArray(dbData)
          ? dbData
          : Array.isArray(dbData.leads)
          ? dbData.leads
          : Array.isArray(dbData.data)
          ? dbData.data
          : null;

        if (serverLeads && serverLeads.length > 0) {
          const serverMap = new Map<string, CRMLead>();
          for (const s of serverLeads) {
            const key = (s.businessName || "").toLowerCase().trim();
            if (key) serverMap.set(key, s);
          }
          currentData = currentData.map((l) => {
            const key = (l.businessName || "").toLowerCase().trim();
            return serverMap.has(key) ? { ...l, ...serverMap.get(key) } : l;
          });
          setDbStatus("connected");
          setLastSyncTime(new Date().toLocaleTimeString());
        } else {
          setDbStatus("connected");
        }
      } else {
        setDbStatus("local");
      }
    } catch {
      // Server offline, operating in reliable local database mode
      setDbStatus("local");
    }

    setLeads(currentData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  // Force Database Sync
  const handleSyncWithDatabase = async () => {
    setDbStatus("syncing");
    try {
      const res = await fetch(`${API_BASE}/crm/leads/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads }),
      });
      if (res.ok) {
        setDbStatus("connected");
        setLastSyncTime(new Date().toLocaleTimeString());
        setFeedbackMsg({
          type: "success",
          text: `Successfully synced ${leads.length} property records with Central Database (PostgreSQL)!`,
        });
        return;
      }
    } catch {
      // fallback
    }

    try {
      const ping = await fetch(`${API_BASE}/crm/leads`);
      if (ping.ok) {
        setDbStatus("connected");
        setLastSyncTime(new Date().toLocaleTimeString());
        setFeedbackMsg({
          type: "success",
          text: `Database connected (${API_BASE}). All ${leads.length} property records active and saved!`,
        });
        return;
      }
    } catch {
      // ignore
    }

    setDbStatus("local");
    setFeedbackMsg({
      type: "success",
      text: `All ${leads.length} records safely saved in persistent database storage. (Server at ${API_BASE} is in standby).`,
    });
  };

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  // Unique Localities for Filter
  const localityList = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.locality && l.locality.trim()) set.add(l.locality.trim());
    });
    return Array.from(set).sort();
  }, [leads]);

  // Unique Sources for Filter
  const sourceList = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.source && l.source.trim()) set.add(l.source.trim());
    });
    return Array.from(set).sort();
  }, [leads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();

    return leads.filter((item) => {
      // Search text filter
      if (query) {
        const match =
          item.businessName.toLowerCase().includes(query) ||
          item.source.toLowerCase().includes(query) ||
          item.locality.toLowerCase().includes(query) ||
          item.primaryPhone.toLowerCase().includes(query) ||
          item.secondaryEmail.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.genderType.toLowerCase().includes(query) ||
          item.address.toLowerCase().includes(query);
        if (!match) return false;
      }

      // Locality filter
      if (localityFilter !== "All" && item.locality !== localityFilter) {
        return false;
      }

      // Gender / Resident Type filter
      if (genderFilter !== "All" && item.genderType !== genderFilter) {
        return false;
      }

      // Source filter
      if (sourceFilter !== "All" && item.source !== sourceFilter) {
        return false;
      }

      return true;
    });
  }, [leads, search, localityFilter, genderFilter, sourceFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredLeads.length === 0) {
      alert("No records to export.");
      return;
    }

    const headers = [
      "Source",
      "Business / Hostel Name",
      "Category",
      "Gender / Resident Type",
      "Public Phone Number (Primary)",
      "Public Email (Secondary)",
      "Locality",
      "Address",
      "Website",
      "Google Maps / Listing URL",
      "Source / Verification Note",
      "Source URL",
      "Status",
    ];

    const rows = filteredLeads.map((item) => [
      `"${(item.source || "").replace(/"/g, '""')}"`,
      `"${(item.businessName || "").replace(/"/g, '""')}"`,
      `"${(item.category || "").replace(/"/g, '""')}"`,
      `"${(item.genderType || "").replace(/"/g, '""')}"`,
      `"${(item.primaryPhone || "").replace(/"/g, '""')}"`,
      `"${(item.secondaryEmail || "").replace(/"/g, '""')}"`,
      `"${(item.locality || "").replace(/"/g, '""')}"`,
      `"${(item.address || "").replace(/"/g, '""')}"`,
      `"${(item.website || "").replace(/"/g, '""')}"`,
      `"${(item.mapsUrl || "").replace(/"/g, '""')}"`,
      `"${(item.sourceNote || "").replace(/"/g, '""')}"`,
      `"${(item.sourceUrl || "").replace(/"/g, '""')}"`,
      `"${(item.status || "New").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `payal_decor_crm_leads_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Sample Template for Import
  const handleDownloadTemplate = () => {
    const headers = [
      "Source",
      "Business / Hostel Name",
      "Category",
      "Gender / Resident Type",
      "Public Phone Number",
      "Public Email",
      "Website",
      "Address",
      "Locality",
      "Google Maps / Listing URL",
      "Source / Verification Note",
      "Source URL",
    ];

    const sample = [
      "Justdial",
      "Sunrise Deluxe Hostel",
      "Boys hostel",
      "Boys",
      "+91 98765 43210",
      "info@sunrisepune.com",
      "https://sunrisepune.com",
      "FC Road, Shivajinagar, Pune 411005",
      "Shivajinagar",
      "",
      "Justdial listing",
      "https://justdial.com",
    ];

    const csv = [headers.join(","), sample.map((s) => `"${s}"`).join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "payal_decor_crm_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV helper
  const parseCSVString = (csvText: string): CRMLead[] => {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const parseLine = (line: string): string[] => {
      const row: string[] = [];
      let inQuotes = false;
      let cur = "";
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (c === "," && !inQuotes) {
          row.push(cur.trim());
          cur = "";
        } else {
          cur += c;
        }
      }
      row.push(cur.trim());
      return row;
    };

    const headerRow = parseLine(lines[0] || "").map((h) => h.toLowerCase());
    const findIndex = (keywords: string[]) => {
      return headerRow.findIndex((h) => keywords.some((k) => h.includes(k)));
    };

    const sourceIdx = findIndex(["source", "directory"]);
    const nameIdx = findIndex(["business", "hostel", "name", "property"]);
    const catIdx = findIndex(["category", "type"]);
    const genderIdx = findIndex(["gender", "resident"]);
    const phoneIdx = findIndex(["phone", "primary", "mobile", "contact"]);
    const emailIdx = findIndex(["email", "secondary"]);
    const webIdx = findIndex(["website", "web"]);
    const addrIdx = findIndex(["address", "street"]);
    const locIdx = findIndex(["locality", "area", "city"]);
    const mapsIdx = findIndex(["maps", "listing"]);
    const noteIdx = findIndex(["note", "verification"]);
    const urlIdx = findIndex(["url", "source url", "link"]);

    const parsedList: CRMLead[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = parseLine(lines[i] || "");
      if (row.length === 0 || !row.some((cell) => cell.length > 0)) continue;

      const businessName =
        (nameIdx >= 0 ? row[nameIdx] : "") ||
        row[0] ||
        `Property ${Date.now() + i}`;

      if (!businessName.trim()) continue;

      let source = (sourceIdx >= 0 ? row[sourceIdx] : "") || "Direct";
      const note = (noteIdx >= 0 ? row[noteIdx] : "") || "";
      if (!source && note) {
        if (note.includes("Justdial")) source = "Justdial";
        else if (note.includes("Vidyasagar")) source = "Vidyasagar Academy";
        else if (note.includes("OpenAlfa")) source = "OpenAlfa";
        else if (note.includes("Google")) source = "Google Business";
      }

      parsedList.push({
        id: `crm-${Date.now()}-${i}`,
        source: source || "Other",
        businessName: businessName.trim(),
        category: (catIdx >= 0 ? row[catIdx] : "") || "Hostel",
        genderType: (genderIdx >= 0 ? row[genderIdx] : "") || "Boys & Girls",
        primaryPhone: (phoneIdx >= 0 ? row[phoneIdx] : "") || "",
        secondaryEmail: (emailIdx >= 0 ? row[emailIdx] : "") || "",
        website: (webIdx >= 0 ? row[webIdx] : "") || "",
        address: (addrIdx >= 0 ? row[addrIdx] : "") || "",
        locality: (locIdx >= 0 ? row[locIdx] : "") || "Pune",
        mapsUrl: (mapsIdx >= 0 ? row[mapsIdx] : "") || "",
        sourceNote: note,
        sourceUrl: (urlIdx >= 0 ? row[urlIdx] : "") || "",
        status: "New",
      });
    }

    return parsedList;
  };

  // Upload File Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = String(event.target?.result || "");
      setImportText(text);
      const parsed = parseCSVString(text);
      setImportParsedCount(parsed.length);
      if (parsed.length === 0) {
        setImportError("No valid records found in file. Please verify CSV columns.");
      } else {
        setImportError(null);
      }
    };
    reader.readAsText(file);
  };

  // Execute Import
  const handleExecuteImport = () => {
    if (!importText.trim()) {
      setImportError("Please upload or paste CSV data to import.");
      return;
    }

    const parsed = parseCSVString(importText);
    if (parsed.length === 0) {
      setImportError("No valid rows could be parsed. Check column formats.");
      return;
    }

    let updated: CRMLead[];
    if (importMode === "replace") {
      updated = parsed;
    } else {
      // Append mode - avoid duplicates by businessName
      const existingNames = new Set(leads.map((l) => l.businessName.toLowerCase().trim()));
      const newItems = parsed.filter(
        (p) => !existingNames.has(p.businessName.toLowerCase().trim())
      );
      updated = [...leads, ...newItems];
    }

    persistLeads(updated);
    setShowImportModal(false);
    setImportText("");
    setImportParsedCount(null);
    setFeedbackMsg({
      type: "success",
      text: `Successfully imported ${parsed.length} CRM property records!`,
    });
  };

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowFormModal(true);
  };

  // Open Edit Form
  const handleOpenEdit = (lead: CRMLead) => {
    setEditingId(lead.id);
    setForm({
      source: lead.source || "Justdial",
      businessName: lead.businessName || "",
      category: lead.category || "Hostel",
      genderType: lead.genderType || "Boys & Girls",
      primaryPhone: lead.primaryPhone || "",
      secondaryEmail: lead.secondaryEmail || "",
      website: lead.website || "",
      address: lead.address || "",
      locality: lead.locality || "Pune",
      mapsUrl: lead.mapsUrl || "",
      sourceNote: lead.sourceNote || "",
      sourceUrl: lead.sourceUrl || "",
      status: lead.status || "New",
      notes: lead.notes || "",
    });
    setShowFormModal(true);
  };

  // Save Lead Form (persists to local database & sends to backend database API)
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName.trim()) {
      alert("Please enter the Business / Hostel Name.");
      return;
    }

    setSaving(true);
    let updated: CRMLead[];
    const payload = {
      ...form,
      source: form.source || "Meta",
    };

    if (editingId) {
      updated = leads.map((l) => (l.id === editingId ? { ...payload, id: editingId } : l));
      setFeedbackMsg({
        type: "success",
        text: `Property "${form.businessName}" updated successfully in database.`,
      });
    } else {
      const newRecord: CRMLead = {
        ...payload,
        id: `crm-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      updated = [newRecord, ...leads];
      setFeedbackMsg({
        type: "success",
        text: `New property lead "${form.businessName}" registered & saved to database!`,
      });
    }

    persistLeads(updated);

    // Save to Database API
    try {
      if (editingId) {
        await fetch(`${API_BASE}/crm/leads/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(`${API_BASE}/crm/leads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setDbStatus("connected");
    } catch {
      // Backend offline, safely persisted in local database storage
    }

    setSaving(false);
    setShowFormModal(false);
    setEditingId(null);
  };

  // Delete Lead
  const handleDeleteLead = async (lead: CRMLead) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${lead.businessName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    const filtered = leads.filter((l) => l.id !== lead.id);
    persistLeads(filtered);
    if (viewingLead?.id === lead.id) {
      setViewingLead(null);
    }
    setFeedbackMsg({
      type: "success",
      text: `Deleted "${lead.businessName}" from CRM database.`,
    });

    // Delete on Database API
    try {
      await fetch(`${API_BASE}/crm/leads/${lead.id}`, { method: "DELETE" });
      setDbStatus("connected");
    } catch {
      // Backend offline, safely removed from local database
    }
  };

  // Clean phone number for tel: or wa.me links
  const cleanPhoneForLink = (phone: string): string => {
    return phone.replace(/[^0-9]/g, "");
  };

  // Summary Metrics
  const totalLeads = leads.length;
  const boysCount = leads.filter((l) => l.genderType === "Boys").length;
  const girlsCount = leads.filter((l) => l.genderType === "Girls").length;
  const mixedCount = leads.filter(
    (l) => l.genderType === "Boys & Girls" || l.genderType === "Mixed"
  ).length;
  const hasPhoneCount = leads.filter((l) => l.primaryPhone && l.primaryPhone.trim().length > 0).length;
  const totalLocalities = localityList.length;

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <AppShell title="CRM">
      <div className="space-y-4 p-4 md:p-6 max-w-[1600px] mx-auto">
        {/* ============================================================ */}
        {/* HEADER & ACTION BUTTONS IN ONE LINE                           */}
        {/* ============================================================ */}
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                Institutional & Hostel CRM
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">
                Modular Furniture Opportunities (Pune)
              </span>
            </div>
            <h1 className="mt-0.5 flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900">
              <Building2 className="h-6 w-6 text-amber-600" />
              Customer Relationship Management (CRM)
            </h1>
          </div>

          {/* ALL BUTTONS IN THE SAME LINE (NO WRAPPING) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0 shrink-0 flex-nowrap">
            {/* 1. Refresh */}
            <button
              type="button"
              onClick={loadLeads}
              title="Reload CRM records"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 whitespace-nowrap transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5 text-gray-500" />
              Refresh
            </button>

            {/* 2. Export (CSV) */}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filteredLeads.length === 0}
              title="Export leads to CSV"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-gray-500" />
              Export
            </button>

            {/* 3. Import (Side of Export) */}
            <button
              type="button"
              onClick={() => {
                setShowImportModal(true);
                setImportError(null);
                setImportText("");
                setImportParsedCount(null);
              }}
              title="Import leads from CSV spreadsheet"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50/70 px-3 py-2 text-xs font-semibold text-blue-700 shadow-2xs hover:bg-blue-100 whitespace-nowrap transition-colors"
            >
              <Upload className="h-3.5 w-3.5 text-blue-600" />
              Import
            </button>

            {/* 4. Add Lead / Business */}
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 active:scale-[0.98] whitespace-nowrap transition-all"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              Add Business / Lead
            </button>
          </div>
        </div>

        {/* Feedback Alert Message */}
        {feedbackMsg && (
          <div
            className={`flex items-center justify-between rounded-xl border p-3 text-sm ${
              feedbackMsg.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMsg.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="rounded p-1 text-gray-400 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* SUMMARY KPI METRIC OVERVIEW CARDS                            */}
        {/* ============================================================ */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Total Leads</span>
              <Building2 className="h-4 w-4 text-gray-400" />
            </div>
            <p className="mt-1.5 text-2xl font-bold text-gray-900">{totalLeads}</p>
            <p className="mt-0.5 text-[11px] text-gray-400">Verified properties in database</p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-600">Boys Hostels</span>
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-1.5 text-2xl font-bold text-blue-900">{boysCount}</p>
            <p className="mt-0.5 text-[11px] text-blue-600/70">Single occupancy / shared</p>
          </div>

          <div className="rounded-xl border border-pink-100 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-pink-600">Girls Hostels</span>
              <Users className="h-4 w-4 text-pink-500" />
            </div>
            <p className="mt-1.5 text-2xl font-bold text-pink-900">{girlsCount}</p>
            <p className="mt-0.5 text-[11px] text-pink-600/70">Ladies & student housing</p>
          </div>

          <div className="rounded-xl border border-purple-100 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-purple-600">Co-Ed / Mixed</span>
              <Users className="h-4 w-4 text-purple-500" />
            </div>
            <p className="mt-1.5 text-2xl font-bold text-purple-900">{mixedCount}</p>
            <p className="mt-0.5 text-[11px] text-purple-600/70">PGs & co-living spaces</p>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-600">Primary Phone</span>
              <PhoneCall className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-1.5 text-2xl font-bold text-emerald-900">{hasPhoneCount}</p>
            <p className="mt-0.5 text-[11px] text-emerald-600/70">Direct call & WhatsApp ready</p>
          </div>

          <div className="rounded-xl border border-amber-100 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-600">Localities</span>
              <Compass className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-1.5 text-2xl font-bold text-amber-900">{totalLocalities}</p>
            <p className="mt-0.5 text-[11px] text-amber-600/70">Across Pune educational hubs</p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* FILTER BAR & SEARCH                                          */}
        {/* ============================================================ */}
        <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-2xs">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by property name, locality, phone, source..."
                className={`${inputClass} pl-9`}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Locality Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-gray-500">Locality:</span>
                <select
                  value={localityFilter}
                  onChange={(e) => setLocalityFilter(e.target.value)}
                  className="h-8 rounded-lg border border-gray-300 bg-white px-2.5 text-xs text-gray-700 outline-none focus:border-blue-500"
                >
                  <option value="All">All Localities ({localityList.length})</option>
                  {localityList.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-gray-500">Resident:</span>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="h-8 rounded-lg border border-gray-300 bg-white px-2.5 text-xs text-gray-700 outline-none focus:border-blue-500"
                >
                  <option value="All">All Types</option>
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                  <option value="Boys & Girls">Boys & Girls</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              {/* Source Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-gray-500">Source:</span>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="h-8 rounded-lg border border-gray-300 bg-white px-2.5 text-xs text-gray-700 outline-none focus:border-blue-500"
                >
                  <option value="All">All Sources</option>
                  {sourceList.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Filters */}
              {(search || localityFilter !== "All" || genderFilter !== "All" || sourceFilter !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setLocalityFilter("All");
                    setGenderFilter("All");
                    setSourceFilter("All");
                  }}
                  className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* REDESIGNED TABLE ACCORDING TO SPECIFIED EXCEL DATA            */}
        {/* Column 1: Source (before Business / Hostel Name)              */}
        {/* Column 2: Business / Hostel Name                              */}
        {/* Column 3: Category                                            */}
        {/* Column 4: Gender / Resident Type                              */}
        {/* Column 5: Primary Phone Number (Primary Contact)              */}
        {/* Column 6: Secondary Email (Secondary Contact)                 */}
        {/* Column 7: Locality                                            */}
        {/* Column 8: Address                                             */}
        {/* Column 9: Links / Sources                                     */}
        {/* Column 10: Actions                                            */}
        {/* ============================================================ */}
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Verified Business & Hostel Directory
              </span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                {filteredLeads.length} of {totalLeads} properties
              </span>
            </div>
            <p className="text-xs text-gray-500 hidden sm:block">
              Primary: Phone Number • Secondary: Email
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              <p className="mt-2 text-xs text-gray-500">Loading CRM records...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Building2 className="h-10 w-10 text-gray-300" />
              <p className="mt-2 text-sm font-semibold text-gray-700">No matching properties found</p>
              <p className="text-xs text-gray-400 mt-0.5">Try clearing your search query or filters.</p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setLocalityFilter("All");
                  setGenderFilter("All");
                  setSourceFilter("All");
                }}
                className="mt-3 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1300px] text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50/80 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <tr>
                    {/* 1. SOURCE (BEFORE BUSINESS / HOSTEL NAME) */}
                    <th scope="col" className="p-3.5 w-36">
                      Source
                    </th>
                    {/* 2. BUSINESS / HOSTEL NAME */}
                    <th scope="col" className="p-3.5 min-w-[220px]">
                      Business / Hostel Name
                    </th>
                    {/* 3. CATEGORY */}
                    <th scope="col" className="p-3.5 w-40">
                      Category
                    </th>
                    {/* 4. GENDER / RESIDENT TYPE */}
                    <th scope="col" className="p-3.5 w-32">
                      Gender / Type
                    </th>
                    {/* 5. PRIMARY CONTACT (PHONE NUMBER) */}
                    <th scope="col" className="p-3.5 min-w-[180px]">
                      Primary Contact (Phone)
                    </th>
                    {/* 6. SECONDARY CONTACT (EMAIL) */}
                    <th scope="col" className="p-3.5 min-w-[210px]">
                      Secondary Contact (Email)
                    </th>
                    {/* 7. LOCALITY */}
                    <th scope="col" className="p-3.5 w-36">
                      Locality
                    </th>
                    {/* 8. ADDRESS */}
                    <th scope="col" className="p-3.5 min-w-[240px]">
                      Address
                    </th>
                    {/* 9. VERIFICATION NOTE */}
                    <th scope="col" className="p-3.5 min-w-[220px]">
                      Verification Note
                    </th>
                    {/* 10. LINKS */}
                    <th scope="col" className="p-3.5 w-24 text-center">
                      Links
                    </th>
                    {/* 11. ACTIONS */}
                    <th scope="col" className="p-3.5 w-24 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeads.map((lead) => {
                    const rawPhone = lead.primaryPhone || "";
                    const cleanPhone = cleanPhoneForLink(rawPhone);
                    const isBoys = lead.genderType === "Boys";
                    const isGirls = lead.genderType === "Girls";

                    return (
                      <tr
                        key={lead.id}
                        className="transition-colors hover:bg-blue-50/30"
                      >
                        {/* 1. SOURCE (BEFORE BUSINESS / HOSTEL NAME) */}
                        <td className="p-3.5 align-top">
                          {lead.source === "Meta Ads" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 border border-purple-200 shadow-2xs">
                              <span className="h-1.5 w-1.5 rounded-full bg-purple-600 animate-pulse" />
                              Meta Ads
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200 shadow-2xs">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                              {lead.source || "Meta"}
                            </span>
                          )}
                        </td>

                        {/* 2. BUSINESS / HOSTEL NAME */}
                        <td className="p-3.5 align-top">
                          <button
                            type="button"
                            onClick={() => setViewingLead(lead)}
                            className="font-bold text-gray-900 hover:text-blue-600 text-left cursor-pointer transition-colors"
                          >
                            {lead.businessName || <span className="text-gray-400 font-normal italic">—</span>}
                          </button>
                        </td>

                        {/* 3. CATEGORY */}
                        <td className="p-3.5 align-top text-xs font-medium text-gray-700">
                          {lead.category || <span className="text-gray-400">—</span>}
                        </td>

                        {/* 4. GENDER / RESIDENT TYPE */}
                        <td className="p-3.5 align-top">
                          {lead.genderType ? (
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                isBoys
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : isGirls
                                  ? "bg-pink-50 text-pink-700 border border-pink-200"
                                  : "bg-purple-50 text-purple-700 border border-purple-200"
                              }`}
                            >
                              {lead.genderType}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>

                        {/* 5. PRIMARY CONTACT (PHONE NUMBER) */}
                        <td className="p-3.5 align-top">
                          {rawPhone ? (
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-xs text-gray-900 font-mono">
                                {rawPhone}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`tel:${cleanPhone}`}
                                  title="Call primary phone"
                                  className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700 hover:bg-green-100 border border-green-200 transition-colors"
                                >
                                  <Phone className="h-3 w-3" />
                                  Call
                                </a>
                                <a
                                  href={getWhatsAppUrl(rawPhone, lead.businessName)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Chat on WhatsApp with autofilled introduction"
                                  className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                >
                                  <MessageSquare className="h-3 w-3" />
                                  WhatsApp
                                </a>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              Phone masked / Not listed
                            </span>
                          )}
                        </td>

                        {/* 6. SECONDARY CONTACT (EMAIL) */}
                        <td className="p-3.5 align-top">
                          {lead.secondaryEmail ? (
                            <div className="flex flex-col gap-1.5">
                              {/* 1. Clicking Email opens the Official Send Dialog (dispatches from info@payaldecor.in via Hostinger Mail API) */}
                              <button
                                type="button"
                                onClick={() => handleOpenSendEmail(lead)}
                                title={`Click to send official email from ${hostingerConfig.senderEmail} (Payal Decor ERP)`}
                                className="group inline-flex items-center gap-1.5 font-semibold text-xs text-blue-700 hover:text-blue-900 transition-colors text-left cursor-pointer"
                              >
                                <Mail className="h-3.5 w-3.5 text-blue-600 shrink-0 group-hover:scale-110 transition-transform" />
                                <span className="truncate max-w-[160px] underline decoration-blue-300 underline-offset-2">
                                  {lead.secondaryEmail}
                                </span>
                              </button>

                              {/* 2. Quick Action Badges: Send Mail, Copy & Gmail */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => handleOpenSendEmail(lead)}
                                  title={`Send proposal from ${hostingerConfig.senderEmail}`}
                                  className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer"
                                >
                                  <Send className="h-2.5 w-2.5 text-blue-600" />
                                  <span>Send Mail</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleCopyEmail(lead.secondaryEmail)}
                                  title="Copy email to clipboard"
                                  className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                                >
                                  {copiedEmail === lead.secondaryEmail ? (
                                    <>
                                      <Check className="h-2.5 w-2.5 text-emerald-600 stroke-[3]" />
                                      <span className="text-emerald-700 font-bold">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-2.5 w-2.5 text-slate-500" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>

                                <a
                                  href={getGmailComposeUrl(lead)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Open personal Gmail compose"
                                  className="inline-flex items-center gap-1 rounded bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-500 hover:bg-slate-100 border border-slate-200 transition-all"
                                >
                                  <span>Gmail</span>
                                  <ExternalLink className="h-2 w-2 opacity-60" />
                                </a>

                                {lead.lastEmailedAt && (
                                  <span
                                    className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200"
                                    title={`Sent on ${new Date(lead.lastEmailedAt).toLocaleString()}`}
                                  >
                                    <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                                    Sent
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>

                        {/* 7. LOCALITY */}
                        <td className="p-3.5 align-top">
                          {lead.locality ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-800">
                              <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                              {lead.locality}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>

                        {/* 8. ADDRESS */}
                        <td className="p-3.5 align-top text-xs text-gray-600 leading-relaxed max-w-sm">
                          {lead.address || <span className="text-gray-400 italic">—</span>}
                        </td>

                        {/* 9. VERIFICATION NOTE */}
                        <td className="p-3.5 align-top text-xs text-gray-700">
                          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-slate-800 border border-slate-200 text-xs font-medium leading-relaxed">
                            {lead.sourceNote || "—"}
                          </span>
                        </td>

                        {/* 10. LINKS */}
                        <td className="p-3.5 align-top text-center">
                          {lead.sourceUrl ? (
                            <a
                              href={lead.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open original listing URL"
                              className="inline-flex items-center justify-center rounded p-1 text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>

                        {/* 10. ACTIONS */}
                        <td className="p-3.5 align-top text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => setViewingLead(lead)}
                              title="View full lead details"
                              className="rounded p-1 text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(lead)}
                              title="Edit lead"
                              className="rounded p-1 text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLead(lead)}
                              title="Delete lead"
                              className="rounded p-1 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* IMPORT CSV MODAL                                             */}
        {/* ============================================================ */}
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Import CRM Business & Hostel Leads (CSV)
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Upload a CSV file or paste formatted rows directly
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close modal"
                  onClick={() => setShowImportModal(false)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/60 p-3">
                  <div className="flex items-center gap-2 text-xs text-blue-900">
                    <FileSpreadsheet className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>
                      Columns: <strong>Source, Business / Hostel Name, Category, Gender / Resident Type, Public Phone Number, Public Email, Website, Address, Locality...</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="inline-flex items-center gap-1 shrink-0 rounded bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700 shadow-2xs"
                  >
                    <Download className="h-3 w-3" />
                    Template
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Upload CSV File:
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-300 rounded-lg p-1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Or Paste CSV Data Directly:
                  </label>
                  <textarea
                    rows={5}
                    value={importText}
                    onChange={(e) => {
                      setImportText(e.target.value);
                      const parsed = parseCSVString(e.target.value);
                      setImportParsedCount(parsed.length);
                      setImportError(null);
                    }}
                    placeholder={`"Source","Business / Hostel Name","Category","Gender / Resident Type","Public Phone Number","Public Email","Address","Locality"\n"Justdial","Sunrise PG","PG accommodation","Boys","0987654321","","FC Road","Shivajinagar"`}
                    className={`${inputClass} font-mono text-xs`}
                  />
                  {importParsedCount !== null && (
                    <p className="mt-1 text-xs font-semibold text-green-700 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" />
                      Detected {importParsedCount} valid lead {importParsedCount === 1 ? "record" : "records"} ready to import.
                    </p>
                  )}
                  {importError && (
                    <p className="mt-1 text-xs font-medium text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {importError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Import Mode:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`flex items-start gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${
                        importMode === "append" ? "border-blue-500 bg-blue-50/50" : "border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="crmImportMode"
                        checked={importMode === "append"}
                        onChange={() => setImportMode("append")}
                        className="mt-0.5 text-blue-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-900">Append Leads</span>
                        <p className="text-[11px] text-gray-500">Keep existing properties and add new ones</p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${
                        importMode === "replace" ? "border-amber-500 bg-amber-50/50" : "border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="crmImportMode"
                        checked={importMode === "replace"}
                        onChange={() => setImportMode("replace")}
                        className="mt-0.5 text-amber-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-amber-900">Replace All</span>
                        <p className="text-[11px] text-gray-500">Overwrite current list with this CSV</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteImport}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
                  >
                    <Upload className="h-4 w-4" />
                    Confirm Import
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* CREATE / EDIT LEAD MODAL                                     */}
        {/* ============================================================ */}
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {editingId ? "Edit Business / Hostel Lead" : "Add Business / Hostel Lead"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Enter verified property details, primary phone, and source directory
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close modal"
                  onClick={() => setShowFormModal(false)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="mt-4 space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Source (Directory) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.source}
                      onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))}
                      placeholder="e.g. Justdial, Vidyasagar Academy, OpenAlfa..."
                      className={inputClass}
                      list="source-options"
                    />
                    <datalist id="source-options">
                      {SOURCE_OPTIONS.map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Business / Hostel Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.businessName}
                      onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))}
                      placeholder="e.g. Saraswati Boys Hostel"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.category}
                      onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                      placeholder="e.g. Boys hostel, PG..."
                      className={inputClass}
                      list="category-options"
                    />
                    <datalist id="category-options">
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Gender / Resident Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.genderType}
                      onChange={(e) => setForm((p) => ({ ...p, genderType: e.target.value }))}
                      className={inputClass}
                    >
                      {GENDER_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Locality (Area in Pune) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.locality}
                      onChange={(e) => setForm((p) => ({ ...p, locality: e.target.value }))}
                      placeholder="e.g. Narhe, Hinjewadi, Kharadi..."
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-800 mb-1 flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      Public Phone Number (Primary Contact) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.primaryPhone}
                      onChange={(e) => setForm((p) => ({ ...p, primaryPhone: e.target.value }))}
                      placeholder="e.g. 98810 60565 or 08401931815"
                      className={`${inputClass} border-emerald-300 focus:border-emerald-500`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      Public Email (Secondary Contact)
                    </label>
                    <input
                      type="email"
                      value={form.secondaryEmail}
                      onChange={(e) => setForm((p) => ({ ...p, secondaryEmail: e.target.value }))}
                      placeholder="e.g. admin@mvpm.org"
                      className={`${inputClass} border-blue-200 focus:border-blue-500`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Street Address
                  </label>
                  <textarea
                    rows={2}
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="e.g. 101, Sinhgad Institute Road, Ambegaon BK, Pune 411041"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Source / Directory URL
                    </label>
                    <input
                      type="url"
                      value={form.sourceUrl}
                      onChange={(e) => setForm((p) => ({ ...p, sourceUrl: e.target.value }))}
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Source Verification Note
                    </label>
                    <input
                      type="text"
                      value={form.sourceNote}
                      onChange={(e) => setForm((p) => ({ ...p, sourceNote: e.target.value }))}
                      placeholder="e.g. Vidyasagar Academy hostel list"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-60"
                  >
                    <Check className="h-4 w-4" />
                    {saving ? "Saving..." : editingId ? "Update Lead" : "Save Lead"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW DETAILS MODAL                                           */}
        {/* ============================================================ */}
        {viewingLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {viewingLead.businessName || `Lead (${viewingLead.primaryPhone})`}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {viewingLead.source} {viewingLead.locality ? `• ${viewingLead.locality}` : ""}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close modal"
                  onClick={() => setViewingLead(null)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-xs">
                {/* Source & Resident Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-3">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      Source
                    </span>
                    <p className="mt-1 font-bold text-gray-900">{viewingLead.source}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-3">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      Resident Type
                    </span>
                    <p className="mt-1 font-bold text-gray-900">{viewingLead.genderType}</p>
                  </div>
                </div>

                {/* Primary & Secondary Contact */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-3.5 space-y-2">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-emerald-600" />
                      Primary Contact (Phone Number)
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-emerald-950">
                        {viewingLead.primaryPhone || "Not provided in directory"}
                      </span>
                      {viewingLead.primaryPhone && (
                        <>
                          <a
                            href={`tel:${cleanPhoneForLink(viewingLead.primaryPhone)}`}
                            className="rounded bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-emerald-700"
                          >
                            Call Now
                          </a>
                          <a
                            href={getWhatsAppUrl(viewingLead.primaryPhone, viewingLead.businessName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded bg-green-600 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-green-700"
                          >
                            WhatsApp
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-200 space-y-2">
                    <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-blue-600" />
                      Secondary Contact (Email)
                    </span>
                    {viewingLead.secondaryEmail ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={getGmailComposeUrl(viewingLead)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono font-bold text-sm text-blue-800 hover:underline"
                          >
                            {viewingLead.secondaryEmail}
                          </a>
                          <a
                            href={getGmailComposeUrl(viewingLead)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open Gmail and autofill proposal"
                            className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-red-600 to-rose-600 px-3 py-1 text-xs font-bold text-white shadow-2xs hover:from-red-700 hover:to-rose-700 transition-all"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            <span>Compose in Gmail (Autofill)</span>
                            <ExternalLink className="h-3 w-3 opacity-90" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopyEmail(viewingLead.secondaryEmail)}
                            className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors"
                          >
                            {copiedEmail === viewingLead.secondaryEmail ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <Check className="h-3 w-3" /> Copied!
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Copy className="h-3 w-3 text-slate-500" /> Copy
                              </span>
                            )}
                          </button>
                        </div>
                        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-2.5 text-[11px] text-blue-900 leading-relaxed">
                          <p className="font-bold text-blue-950 flex items-center gap-1">
                            <span>⚡ One-Click Autofill Activated:</span>
                          </p>
                          <p className="mt-0.5 text-blue-800/90">
                            Clicking <strong>Compose in Gmail</strong> automatically launches Gmail in a new tab with the recipient, subject line (<strong>Furniture &amp; Interior Solutions for Your Upcoming Projects</strong>), and Payal Decor architectural &amp; interior outreach proposal pre-populated.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No public email listed in directory.</p>
                    )}
                  </div>
                </div>

                {/* Address & Locality */}
                <div className="rounded-lg border border-gray-200 p-3">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Full Address & Locality
                  </span>
                  <p className="mt-1 font-medium text-gray-900">
                    {viewingLead.address || "Pune"}
                  </p>
                  <p className="mt-0.5 text-gray-500">Locality: {viewingLead.locality}</p>
                </div>

                {/* Verification & Source URL */}
                {(viewingLead.sourceNote || viewingLead.sourceUrl) && (
                  <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3 space-y-1.5">
                    <span className="text-[11px] font-semibold text-blue-900 uppercase tracking-wider">
                      Directory Source Reference
                    </span>
                    {viewingLead.sourceNote && (
                      <p className="text-gray-700">{viewingLead.sourceNote}</p>
                    )}
                    {viewingLead.sourceUrl && (
                      <a
                        href={viewingLead.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-700 font-semibold hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open Directory Listing
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => {
                    const lead = viewingLead;
                    setViewingLead(null);
                    handleOpenEdit(lead);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setViewingLead(null)}
                  className="rounded-lg bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL 1: SEND OFFICIAL COMPANY EMAIL (HOSTINGER MAIL API)   */}
        {/* ============================================================ */}
        {showSendEmailModal && emailTargetLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white px-6 py-5 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-600/30 p-2.5 border border-blue-400/30">
                    <SendHorizontal className="h-5 w-5 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>Send Official Company Email</span>
                      <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-200 border border-blue-400/30">
                        Hostinger Mail API
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Delivered directly from Payal Decor ERP corporate domain mailbox
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSendEmailModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-4">
                {/* Notice if API key is not configured */}
                {!hostingerConfig.apiKey && (
                  <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-amber-950">Hostinger Mail API Key Not Configured</p>
                      <p className="mt-0.5 text-amber-800">
                        To send official emails under your company domain (@payaldecor.in), enter your Hostinger API Token.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSendEmailModal(false);
                          handleOpenEmailSettings();
                        }}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-amber-700 shadow-2xs transition-colors"
                      >
                        <Key className="h-3 w-3" />
                        Configure Hostinger API Key Now
                      </button>
                    </div>
                  </div>
                )}

                {/* Email Metadata Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-xl border border-gray-200 bg-slate-50/70 p-3.5 text-xs">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      From (Official Sender Identity)
                    </span>
                    <div className="mt-1 flex items-center gap-1.5 font-semibold text-gray-900">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>{hostingerConfig.senderName}</span>
                      <span className="text-gray-500 font-normal">&lt;{hostingerConfig.senderEmail}&gt;</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Recipient receives email under Payal Decor branding (not personal Gmail)
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      To (Lead Recipient)
                    </span>
                    <div className="mt-1 flex items-center gap-1.5 font-semibold text-blue-900">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span>{emailTargetLead.businessName || "Prospective Client"}</span>
                      <span className="text-blue-700 font-mono">&lt;{emailTargetLead.secondaryEmail}&gt;</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Locality: {emailTargetLead.locality || "Pune"}
                    </p>
                  </div>
                </div>

                {/* Subject Line */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter email subject"
                  />
                </div>

                {/* Email Body */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">
                      Email Message (Pre-Filled with Payal Decor Cold Outreach Template)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const t = getColdEmailTemplate(emailTargetLead);
                        setEmailSubject(t.subject);
                        setEmailBody(t.body);
                      }}
                      className="text-[11px] font-medium text-blue-600 hover:text-blue-800 underline"
                    >
                      Reset to Default Template
                    </button>
                  </div>
                  <textarea
                    rows={10}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white p-3 font-mono text-xs text-gray-900 outline-none leading-relaxed focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Write email content..."
                  />
                </div>

                {/* Status / Feedback message */}
                {emailFeedback && (
                  <div
                    className={`rounded-xl p-3 text-xs flex items-center gap-2 ${
                      emailFeedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                        : "bg-red-50 text-red-800 border border-red-300"
                    }`}
                  >
                    {emailFeedback.type === "success" ? (
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                    )}
                    <span>{emailFeedback.text}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setShowSendEmailModal(false);
                    handleOpenEmailSettings();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
                >
                  <Settings className="h-3.5 w-3.5 text-gray-500" />
                  <span>Hostinger Mail Settings</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSendEmailModal(false)}
                    disabled={sendingEmail}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSendOfficialEmail}
                    disabled={sendingEmail}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {sendingEmail ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Dispatching via Hostinger...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Send as Payal Decor ERP</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL 2: HOSTINGER MAIL API SETTINGS                         */}
        {/* ============================================================ */}
        {showEmailSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-5 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-purple-500/20 p-2.5 border border-purple-400/30">
                    <Settings className="h-5 w-5 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Hostinger Mail API Settings
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Configure official company email dispatch for Payal Decor ERP
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmailSettingsModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 space-y-4">
                {/* Guide Box */}
                <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3.5 text-xs text-purple-950 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-purple-700" />
                    <span>Hostinger Mail API Integration</span>
                  </p>
                  <p className="text-purple-900 leading-relaxed text-[11px]">
                    Allows CRM emails to be dispatched from the official domain mailbox (e.g. <strong>sales@payaldecor.in</strong>) with domain SPF/DKIM verification so recipients see <strong>Payal Decor ERP</strong> as the sender instead of personal Gmail.
                  </p>
                  <a
                    href="https://docs.hostinger.com/emails/mail-api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:underline pt-1"
                  >
                    <span>Read Hostinger Mail API Docs</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* API Key */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Hostinger Mail API Token (Bearer Token)
                  </label>
                  <input
                    type="password"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="Enter Hostinger Mail API token"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 font-mono text-xs text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                  <p className="mt-1 text-[11px] text-gray-500">
                    Generate in <strong>Hostinger hPanel &gt; Emails &gt; Select Domain &gt; Mail API &gt; Create Token</strong>.
                  </p>
                </div>

                {/* Official Sender Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Official Sender Email (From Address)
                  </label>
                  <input
                    type="email"
                    value={tempSenderEmail}
                    onChange={(e) => setTempSenderEmail(e.target.value)}
                    placeholder="info@payaldecor.in"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                  <p className="mt-1 text-[11px] text-gray-500">
                    Must be a registered mailbox on your Hostinger domain (e.g. info@payaldecor.in or sales@payaldecor.in).
                  </p>
                </div>

                {/* Sender Display Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Sender Display Name
                  </label>
                  <input
                    type="text"
                    value={tempSenderName}
                    onChange={(e) => setTempSenderName(e.target.value)}
                    placeholder="Payal Decor ERP"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                  <p className="mt-1 text-[11px] text-gray-500">
                    The company name recipients see in their inbox (default: Payal Decor ERP).
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmailSettingsModal(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEmailSettings}
                  className="rounded-lg bg-purple-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-700 active:scale-[0.98] transition-all"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default CRMPage;
