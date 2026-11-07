import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Calendar,
  Download,
  CheckSquare,
  Users2,
  Target,
  AlertCircle,
  PauseCircle,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";

export const Route = createFileRoute("/operations")({
  component: OperationsPage,
});

const API_BASE = (
  import.meta.env["VITE_API_URL"] || "http://localhost:5001/api"
).replace(/\/+$/, "");

export type PriorityLevel = "Critical" | "Urgent" | "High" | "Medium" | "Low";
export type TaskStatus =
  | "Not Started"
  | "In Progress"
  | "Completed"
  | "On Hold"
  | "Blocked"
  | "Pending"
  | "Under Review";

export interface OperationTask {
  id: string;
  taskId: string; // Format: PD-001, PD-002, PD-003, etc.
  workstream: string;
  taskActivity: string;
  priority: PriorityLevel;
  primaryResponsible: string;
  supportingRole: string;
  expectedDeliverable: string;
  targetDate: string; // YYYY-MM-DD
  status: TaskStatus;
  remarks: string;
  others: string;
  createdAt?: string;
  updatedAt?: string;
}

export const WORKSTREAM_OPTIONS = [
  "Software & Operations",
  "Data & Documentation",
  "Business Development",
  "Company Profile",
  "Resource Allocation",
  "Business Automation",
  "Marketing",
  "Website",
  "Reporting & Governance",
  "Invoice & Billing Module",
  "User Accounts & Access",
  "Software Rollout & Adoption",
  "Operations & Project Control",
  "Quality Assurance & Sign-off",
  "Production",
  "Procurement",
  "Design & CAD",
  "Site & Installation",
  "Quality & QA",
  "Logistics",
  "Accounts & Admin",
  "Sales & CRM",
  "Maintenance",
];

export const STATUS_OPTIONS: TaskStatus[] = [
  "Not Started",
  "In Progress",
  "Completed",
  "On Hold",
  "Blocked",
  "Pending",
  "Under Review",
];

export const PRIORITY_OPTIONS: PriorityLevel[] = [
  "Critical",
  "Urgent",
  "High",
  "Medium",
  "Low",
];

const LOCAL_STORAGE_KEY = "payal_decor_operations_tasks_v4";

// Exact dataset transcribed from the Payal Decor Daily Task & Execution Tracker PDF (PD-001 to PD-045)
export const PDF_TASKS_DATA: OperationTask[] = [
  {
    id: "pd-001",
    taskId: "PD-001",
    workstream: "Software & Operations",
    taskActivity: "Create the Operations tab in the existing software",
    priority: "Critical",
    primaryResponsible: "Software Developer",
    supportingRole: "Project Manager",
    expectedDeliverable: "Operations tab structure, fields and workflow agreed and implemented",
    targetDate: "2026-11-06",
    status: "Completed",
    remarks: "milestone",
    others: "",
  },
  {
    id: "pd-002",
    taskId: "PD-002",
    workstream: "Software & Operations",
    taskActivity: "Map end-to-end business workflow and module requirements",
    priority: "Critical",
    primaryResponsible: "Project Manager",
    supportingRole: "Software Developer",
    expectedDeliverable: "Approved workflow covering enquiry through project closure",
    targetDate: "2026-11-06",
    status: "In Progress",
    remarks: "requirements may change later - blocker.",
    others: "",
  },
  {
    id: "pd-003",
    taskId: "PD-003",
    workstream: "Software & Operations",
    taskActivity: "Define lead, client, quotation, invoice and payment workflows",
    priority: "High",
    primaryResponsible: "Software Developer",
    supportingRole: "Project Manager",
    expectedDeliverable: "Module-wise requirements and process flow documented",
    targetDate: "2026-11-09",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-004",
    taskId: "PD-004",
    workstream: "Software & Operations",
    taskActivity: "Define project, task, employee and daily reporting workflows",
    priority: "High",
    primaryResponsible: "Software Developer",
    supportingRole: "Project Manager",
    expectedDeliverable: "Task allocation, ownership, status and reporting requirements documented",
    targetDate: "2026-11-09",
    status: "On Hold",
    remarks: "",
    others: "",
  },
  {
    id: "pd-005",
    taskId: "PD-005",
    workstream: "Software & Operations",
    taskActivity: "Prepare software development plan and testing checklist",
    priority: "High",
    primaryResponsible: "Project Manager",
    supportingRole: "Software Developer",
    expectedDeliverable: "Milestones, owners, test cases and delivery dates published",
    targetDate: "2026-11-06",
    status: "In Progress",
    remarks: "",
    others: "",
  },
  {
    id: "pd-006",
    taskId: "PD-006",
    workstream: "Data & Documentation",
    taskActivity: "Collect company details, services, projects, client and vendor information",
    priority: "High",
    primaryResponsible: "Project Manager",
    supportingRole: "Digital Marketing",
    expectedDeliverable: "Verified central data sheet with missing information flagged",
    targetDate: "2026-11-06",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-007",
    taskId: "PD-007",
    workstream: "Data & Documentation",
    taskActivity: "Collect machinery list, specifications, capacity and photographs",
    priority: "High",
    primaryResponsible: "Project Manager",
    supportingRole: "Website Developer",
    expectedDeliverable: "Machinery register with specifications and usable images",
    targetDate: "2026-11-06",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-008",
    taskId: "PD-008",
    workstream: "Business Development",
    taskActivity: "Build a prospect list of architects and interior design companies",
    priority: "Critical",
    primaryResponsible: "Project Manager",
    supportingRole: "Digital Marketing",
    expectedDeliverable: "Target list with company, contact person, phone/email, location and source",
    targetDate: "2026-11-06",
    status: "Not Started",
    remarks: "Target: 20+ architect contacts and 10–15 interior design contacts",
    others: "",
  },
  {
    id: "pd-009",
    taskId: "PD-009",
    workstream: "Business Development",
    taskActivity: "Contact architects and introduce Payal Decor services",
    priority: "Critical",
    primaryResponsible: "Project Manager",
    supportingRole: "Digital Marketing",
    expectedDeliverable: "Outreach logged; response and next follow-up date recorded",
    targetDate: "2026-11-06",
    status: "Not Started",
    remarks: "Target: 20–25 contacts",
    others: "",
  },
  {
    id: "pd-010",
    taskId: "PD-010",
    workstream: "Business Development",
    taskActivity: "Contact interior design companies for collaboration opportunities",
    priority: "High",
    primaryResponsible: "Project Manager",
    supportingRole: "Digital Marketing",
    expectedDeliverable: "Outreach log and interested prospects list",
    targetDate: "2026-11-06",
    status: "Not Started",
    remarks: "Target: 10–15 contacts",
    others: "",
  },
  {
    id: "pd-011",
    taskId: "PD-011",
    workstream: "Business Development",
    taskActivity: "Identify builders, contractors and referral partners",
    priority: "High",
    primaryResponsible: "Project Manager",
    supportingRole: "Digital Marketing",
    expectedDeliverable: "At least 5 relevant prospects added with next action",
    targetDate: "2026-11-06",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-012",
    taskId: "PD-012",
    workstream: "Company Profile",
    taskActivity: "Revise company profile and update service portfolio",
    priority: "High",
    primaryResponsible: "Digital Marketing",
    supportingRole: "Project Manager",
    expectedDeliverable: "Updated company overview, services, strengths and contact details",
    targetDate: "2026-11-09",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-013",
    taskId: "PD-013",
    workstream: "Company Profile",
    taskActivity: "Add machinery, infrastructure and technical capabilities to profile",
    priority: "High",
    primaryResponsible: "Project Manager",
    supportingRole: "Digital Marketing",
    expectedDeliverable: "Verified machinery section with specifications and photographs",
    targetDate: "2026-11-09",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-014",
    taskId: "PD-014",
    workstream: "Company Profile",
    taskActivity: "Compile project photographs and create a client-ready portfolio",
    priority: "Medium",
    primaryResponsible: "Digital Marketing",
    supportingRole: "Website Developer",
    expectedDeliverable: "Organised project gallery with approved captions and images",
    targetDate: "2026-11-10",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-015",
    taskId: "PD-015",
    workstream: "Resource Allocation",
    taskActivity: "Assign two dedicated software resources and confirm responsibilities",
    priority: "Critical",
    primaryResponsible: "Project Manager",
    supportingRole: "Software Developer",
    expectedDeliverable: "Two named resources, ownership split and availability confirmed",
    targetDate: "2026-11-06",
    status: "Not Started",
    remarks: "Add actual employee names once allocated",
    others: "",
  },
  {
    id: "pd-016",
    taskId: "PD-016",
    workstream: "Business Automation",
    taskActivity: "Prepare the full business automation roadmap",
    priority: "High",
    primaryResponsible: "Project Manager",
    supportingRole: "Software Developer",
    expectedDeliverable: "Prioritised roadmap for CRM, quotations, invoices, projects, inventory, purchase, vendors, machinery and reports",
    targetDate: "2026-11-09",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-017",
    taskId: "PD-017",
    workstream: "Marketing",
    taskActivity: "Create a distinctive, premium Dhanteras creative",
    priority: "Medium",
    primaryResponsible: "Digital Marketing",
    supportingRole: "Project Manager",
    expectedDeliverable: "Approved creative, caption and platform-ready formats",
    targetDate: "2026-11-06",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-018",
    taskId: "PD-018",
    workstream: "Website",
    taskActivity: "Audit the complete website for errors and missing content",
    priority: "High",
    primaryResponsible: "Website Developer",
    supportingRole: "Project Manager",
    expectedDeliverable: "Audit list covering broken links, forms, mobile responsiveness, content and speed",
    targetDate: "2026-11-06",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-019",
    taskId: "PD-019",
    workstream: "Website",
    taskActivity: "Fix high-priority website errors and test enquiry journey",
    priority: "High",
    primaryResponsible: "Website Developer",
    supportingRole: "Project Manager",
    expectedDeliverable: "Critical fixes completed; contact/enquiry forms tested",
    targetDate: "2026-11-09",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-020",
    taskId: "PD-020",
    workstream: "Reporting & Governance",
    taskActivity: "Collect end-of-day updates from every role and consolidate report",
    priority: "High",
    primaryResponsible: "Project Manager",
    supportingRole: "All Roles",
    expectedDeliverable: "Completed, in-progress, pending, blockers and next-day plan submitted",
    targetDate: "2026-11-06",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-021",
    taskId: "PD-021",
    workstream: "Business Development",
    taskActivity: "Maintain follow-up tracker for all prospects and enquiries",
    priority: "High",
    primaryResponsible: "Project Manager",
    supportingRole: "Digital Marketing",
    expectedDeliverable: "Every prospect has owner, status, last contact and next follow-up date",
    targetDate: "2026-11-06",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-022",
    taskId: "PD-022",
    workstream: "Invoice & Billing Module",
    taskActivity: "Review the supplied reference PDF and prepare a module-by-module invoice requirements checklist",
    priority: "Critical",
    primaryResponsible: "Project Manager",
    supportingRole: "Software Developer",
    expectedDeliverable: "PDF reviewed; required screens, fields, calculations, print layouts and approval points documented",
    targetDate: "2026-11-06",
    status: "Not Started",
    remarks: "PDF was not attached in this chat; attach it to complete the reference-based verification.",
    others: "",
  },
  {
    id: "pd-023",
    taskId: "PD-023",
    workstream: "Invoice & Billing Module",
    taskActivity: "Study the requested Vyapar-style billing workflow and map the equivalent Payal Decor workflow",
    priority: "Critical",
    primaryResponsible: "Project Manager",
    supportingRole: "Software Developer",
    expectedDeliverable: "Workflow documented for customer selection, item entry, tax/discount, totals, payment and invoice sharing",
    targetDate: "2026-11-09",
    status: "Not Started",
    remarks: "Use as a workflow reference; confirm exact features against the provided PDF and business needs.",
    others: "",
  },
  {
    id: "pd-024",
    taskId: "PD-024",
    workstream: "Invoice & Billing Module",
    taskActivity: "Create and configure customer/client master with client name and contact details",
    priority: "Critical",
    primaryResponsible: "Software Developer",
    supportingRole: "Project Manager",
    expectedDeliverable: "Client name, phone, email, billing address, GSTIN where applicable and saved customer history available",
    targetDate: "2026-11-09",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-025",
    taskId: "PD-025",
    workstream: "Invoice & Billing Module",
    taskActivity: "Create item/product master with unique item number or item code",
    priority: "Critical",
    primaryResponsible: "Software Developer",
    supportingRole: "Project Manager",
    expectedDeliverable: "Each item has unique item number/code, item name/description and searchable selection",
    targetDate: "2026-11-09",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-026",
    taskId: "PD-026",
    workstream: "Invoice & Billing Module",
    taskActivity: "Add item-wise size/dimension, unit, quantity, rate and amount fields",
    priority: "Critical",
    primaryResponsible: "Software Developer",
    supportingRole: "Project Manager",
    expectedDeliverable: "Invoice line supports size/dimensions, unit, quantity, rate and auto-calculated line amount",
    targetDate: "2026-11-09",
    status: "Not Started",
    remarks: "Confirm required size format and units with Payal Decor operations.",
    others: "",
  },
  {
    id: "pd-027",
    taskId: "PD-027",
    workstream: "Invoice & Billing Module",
    taskActivity: "Configure invoice number, invoice date, due date and payment terms",
    priority: "High",
    primaryResponsible: "Software Developer",
    supportingRole: "Project Manager",
    expectedDeliverable: "Unique invoice numbering, dates and payment terms work correctly",
    targetDate: "2026-11-10",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-028",
    taskId: "PD-028",
    workstream: "Invoice & Billing Module",
    taskActivity: "Configure discount, taxes/GST, subtotal, round-off and grand total calculations",
    priority: "Critical",
    primaryResponsible: "Software Developer",
    supportingRole: "Project Manager",
    expectedDeliverable: "Calculations tested with approved tax rules and sample invoices",
    targetDate: "2026-11-10",
    status: "Not Started",
    remarks: "Tax configuration to be confirmed by management/accountant.",
    others: "",
  },
  {
    id: "pd-029",
    taskId: "PD-029",
    workstream: "Invoice & Billing Module",
    taskActivity: "Add payment tracking: paid, partially paid, balance due and payment mode",
    priority: "High",
    primaryResponsible: "Software Developer",
    supportingRole: "Project Manager",
    expectedDeliverable: "Payment entries update outstanding balance and payment status accurately",
    targetDate: "2026-11-10",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-030",
    taskId: "PD-030",
    workstream: "Invoice & Billing Module",
    taskActivity: "Create professional invoice PDF/print template with company details and terms",
    priority: "High",
    primaryResponsible: "Software Developer",
    supportingRole: "Digital Marketing",
    expectedDeliverable: "Branded invoice output is readable, accurate and ready to print/share",
    targetDate: "2026-11-11",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-031",
    taskId: "PD-031",
    workstream: "Invoice & Billing Module",
    taskActivity: "Add invoice actions: save draft, edit, approve/finalise, print, download and share",
    priority: "High",
    primaryResponsible: "Software Developer",
    supportingRole: "Project Manager",
    expectedDeliverable: "Authorised users can complete the invoice lifecycle with audit trail",
    targetDate: "2026-11-11",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-032",
    taskId: "PD-032",
    workstream: "Invoice & Billing Module",
    taskActivity: "Link invoices to client records, quotations and projects where applicable",
    priority: "High",
    primaryResponsible: "Software Developer",
    supportingRole: "Project Manager",
    expectedDeliverable: "Invoice is traceable to client and relevant quotation/project",
    targetDate: "2026-11-11",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-033",
    taskId: "PD-033",
    workstream: "Invoice & Billing Module",
    taskActivity: "Test invoice calculations and output using management-approved sample cases",
    priority: "Critical",
    primaryResponsible: "Software Developer",
    supportingRole: "Project Manager",
    expectedDeliverable: "Test cases cover multiple items, sizes, quantities, discounts, taxes, partial payments and edits",
    targetDate: "2026-11-12",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-034",
    taskId: "PD-034",
    workstream: "User Accounts & Access",
    taskActivity: "Create employee login accounts for all active team members",
    priority: "Critical",
    primaryResponsible: "Project Manager",
    supportingRole: "Software Developer",
    expectedDeliverable: "Named employee accounts created; initial access details shared securely",
    targetDate: "2026-11-06",
    status: "Not Started",
    remarks: "Never share one common login; use individual accounts.",
    others: "",
  },
  {
    id: "pd-035",
    taskId: "PD-035",
    workstream: "User Accounts & Access",
    taskActivity: "Configure role-based access for Project Manager, Website Developer, Software Developer and Digital Marketing",
    priority: "Critical",
    primaryResponsible: "Software Developer",
    supportingRole: "Project Manager",
    expectedDeliverable: "Each role sees only the modules and actions needed for their work",
    targetDate: "2026-11-09",
    status: "Not Started",
    remarks: "Add other employees/roles after management confirms the list.",
    others: "",
  },
  {
    id: "pd-036",
    taskId: "PD-036",
    workstream: "User Accounts & Access",
    taskActivity: "Set up employee profiles, department, reporting manager and active status",
    priority: "High",
    primaryResponsible: "Project Manager",
    supportingRole: "Software Developer",
    expectedDeliverable: "Employee directory is complete and linked to role permissions",
    targetDate: "2026-11-09",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-037",
    taskId: "PD-037",
    workstream: "User Accounts & Access",
    taskActivity: "Test login, password reset, account activation and access permissions",
    priority: "High",
    primaryResponsible: "Software Developer",
    supportingRole: "Project Manager",
    expectedDeliverable: "Each role can log in and access the correct modules; unauthorised access is blocked",
    targetDate: "2026-11-10",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-038",
    taskId: "PD-038",
    workstream: "Software Rollout & Adoption",
    taskActivity: "Make the software the official system for daily task, lead, project and invoice updates",
    priority: "Critical",
    primaryResponsible: "Project Manager",
    supportingRole: "All Roles",
    expectedDeliverable: "Team instructed to record all relevant work in the software from rollout date",
    targetDate: "2026-11-06",
    status: "Not Started",
    remarks: "Confirm rollout date and communicate the policy to all employees.",
    others: "",
  },
  {
    id: "pd-039",
    taskId: "PD-039",
    workstream: "Software Rollout & Adoption",
    taskActivity: "Conduct role-wise software onboarding and practical training",
    priority: "High",
    primaryResponsible: "Project Manager",
    supportingRole: "Software Developer",
    expectedDeliverable: "Each employee completes a basic task in their assigned module",
    targetDate: "2026-11-10",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-040",
    taskId: "PD-040",
    workstream: "Software Rollout & Adoption",
    taskActivity: "Prepare user guide/SOP and issue reporting process",
    priority: "Medium",
    primaryResponsible: "Project Manager",
    supportingRole: "Software Developer",
    expectedDeliverable: "Short SOP covers login, task updates, lead entry, invoice flow and support escalation",
    targetDate: "2026-11-11",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-041",
    taskId: "PD-041",
    workstream: "Software Rollout & Adoption",
    taskActivity: "Set up data backup, access review and change/audit history requirements",
    priority: "High",
    primaryResponsible: "Software Developer",
    supportingRole: "Project Manager",
    expectedDeliverable: "Backup approach, permission review and change tracking documented and tested",
    targetDate: "2026-11-12",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-042",
    taskId: "PD-042",
    workstream: "Operations & Project Control",
    taskActivity: "Define project stages, handover checklist, site measurements and approval checkpoints",
    priority: "High",
    primaryResponsible: "Project Manager",
    supportingRole: "Website Developer",
    expectedDeliverable: "Standard project stages and required client/site information documented",
    targetDate: "2026-11-11",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-043",
    taskId: "PD-043",
    workstream: "Operations & Project Control",
    taskActivity: "Add purchase, vendor, material issue/return and inventory movement requirements",
    priority: "High",
    primaryResponsible: "Project Manager",
    supportingRole: "Software Developer",
    expectedDeliverable: "Material and vendor workflow mapped, including stock movement and accountability",
    targetDate: "2026-11-12",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-044",
    taskId: "PD-044",
    workstream: "Operations & Project Control",
    taskActivity: "Define machinery register, maintenance schedule and downtime reporting",
    priority: "Medium",
    primaryResponsible: "Project Manager",
    supportingRole: "Software Developer",
    expectedDeliverable: "Machinery details, service dates and downtime can be recorded and reviewed",
    targetDate: "2026-11-12",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-045",
    taskId: "PD-045",
    workstream: "Quality Assurance & Sign-off",
    taskActivity: "Run end-to-end acceptance testing across lead, quotation, invoice, project and reporting modules",
    priority: "Critical",
    primaryResponsible: "Project Manager",
    supportingRole: "Software Developer; Website Developer",
    expectedDeliverable: "Management-approved test checklist passed; critical defects closed before full rollout",
    targetDate: "2026-11-13",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-046",
    taskId: "PD-046",
    workstream: "Quality Assurance & Sign-off",
    taskActivity: "Obtain management sign-off and publish software rollout instructions",
    priority: "High",
    primaryResponsible: "Project Manager",
    supportingRole: "All Roles",
    expectedDeliverable: "Approved release checklist, owner list and rollout communication completed",
    targetDate: "2026-11-13",
    status: "Not Started",
    remarks: "",
    others: "",
  },
  {
    id: "pd-047",
    taskId: "PD-047",
    workstream: "Software & Operations",
    taskActivity: "Fix non-working UI and Button logic",
    priority: "High",
    primaryResponsible: "Software Developer",
    supportingRole: "Project Manager",
    expectedDeliverable: "Improve the UI and fix non working buttons and logic",
    targetDate: "2026-11-06",
    status: "Completed",
    remarks: "On time completed",
    others: "",
  },
];

// Helper to calculate next PD-001, PD-002, PD-003 Task ID
export function getNextTaskId(tasks: OperationTask[]): string {
  let maxNumber = 0;
  for (const t of tasks) {
    if (t.taskId && t.taskId.startsWith("PD-")) {
      const numPart = parseInt(t.taskId.replace(/^PD-/, ""), 10);
      if (!isNaN(numPart) && numPart > maxNumber) {
        maxNumber = numPart;
      }
    }
  }
  return `PD-${String(maxNumber + 1).padStart(3, "0")}`;
}

const emptyFormData = (autoId: string = "PD-001") => ({
  taskId: autoId,
  workstream: "Software & Operations",
  taskActivity: "",
  priority: "High" as PriorityLevel,
  primaryResponsible: "",
  supportingRole: "",
  expectedDeliverable: "",
  targetDate: new Date().toISOString().slice(0, 10),
  status: "Not Started" as TaskStatus,
  remarks: "",
  others: "",
});

function formatDateDisplay(val: string) {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getWorkstreamBadgeColor(ws: string) {
  switch (ws) {
    case "Software & Operations":
      return "bg-violet-100 text-violet-800 border-violet-200";
    case "Data & Documentation":
      return "bg-teal-100 text-teal-800 border-teal-200";
    case "Business Development":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Company Profile":
      return "bg-sky-100 text-sky-800 border-sky-200";
    case "Resource Allocation":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "Business Automation":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "Marketing":
      return "bg-pink-100 text-pink-800 border-pink-200";
    case "Website":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Reporting & Governance":
      return "bg-cyan-100 text-cyan-800 border-cyan-200";
    case "Invoice & Billing Module":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "User Accounts & Access":
      return "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200";
    case "Software Rollout & Adoption":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "Operations & Project Control":
      return "bg-lime-100 text-lime-800 border-lime-200";
    case "Quality Assurance & Sign-off":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "Production":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "Procurement":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Design & CAD":
      return "bg-cyan-100 text-cyan-800 border-cyan-200";
    case "Site & Installation":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "Quality & QA":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Logistics":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Accounts & Admin":
      return "bg-slate-100 text-slate-800 border-slate-200";
    case "Sales & CRM":
      return "bg-rose-100 text-rose-800 border-rose-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function getPriorityBadge(priority: PriorityLevel) {
  switch (priority) {
    case "Critical":
    case "Urgent":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          {priority}
        </span>
      );
    case "High":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          High
        </span>
      );
    case "Medium":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Medium
        </span>
      );
    case "Low":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-600">
          <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
          Low
        </span>
      );
  }
}

function getStatusBadge(status: TaskStatus) {
  switch (status) {
    case "Completed":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          Completed
        </span>
      );
    case "In Progress":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          <Clock className="h-3.5 w-3.5 text-blue-600" />
          In Progress
        </span>
      );
    case "On Hold":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
          <PauseCircle className="h-3.5 w-3.5 text-amber-600" />
          On Hold
        </span>
      );
    case "Blocked":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700">
          <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
          Blocked
        </span>
      );
    case "Under Review":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700">
          <Target className="h-3.5 w-3.5 text-purple-600" />
          Under Review
        </span>
      );
    case "Not Started":
    case "Pending":
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-600">
          <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
          {status}
        </span>
      );
  }
}

function OperationsPage() {
  const [tasks, setTasks] = useState<OperationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [workstreamFilter, setWorkstreamFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingTask, setViewingTask] = useState<OperationTask | null>(null);
  const [form, setForm] = useState(emptyFormData("PD-001"));
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Load tasks: Preserve user's PD-001 if already filled, and populate PD-002 to PD-045 from PDF
  const loadTasks = useCallback(async () => {
    setLoading(true);

    let initialList = [...PDF_TASKS_DATA];

    try {
      // Check if user already had saved tasks in localStorage
      const stored =
        localStorage.getItem(LOCAL_STORAGE_KEY) ||
        localStorage.getItem("payal_decor_operations_tasks_v2") ||
        localStorage.getItem("payal_decor_operations_tasks_v1");

      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Find if user already filled/customized PD-001
          const userPd001 = parsed.find(
            (t: any) => String(t.taskId || "").toUpperCase() === "PD-001"
          );

          if (userPd001) {
            // Keep user's PD-001 and ensure PD-002 through PD-047 from PDF follow it
            const restOfPdf = PDF_TASKS_DATA.filter((t) => t.taskId !== "PD-001");
            initialList = [userPd001, ...restOfPdf];
          } else {
            // Merge custom user tasks with PDF data
            const existingIds = new Set(parsed.map((p: any) => p.taskId));
            const missingPdfTasks = PDF_TASKS_DATA.filter(
              (p) => !existingIds.has(p.taskId)
            );
            initialList = [...parsed, ...missingPdfTasks];
          }
        }
      }
    } catch {
      // ignore
    }

    // Try fetching from backend API if available
    try {
      const res = await fetch(`${API_BASE}/operations`, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.tasks) && data.tasks.length > 0) {
          const apiTasks = data.tasks.map((item: any) => ({
            id: String(item.id),
            taskId: item.taskId || "PD-001",
            workstream: item.workstream || "General",
            taskActivity: item.taskActivity || "",
            priority: (item.priority || "Medium") as PriorityLevel,
            primaryResponsible: item.primaryResponsible || "",
            supportingRole: item.supportingRole || "",
            expectedDeliverable: item.expectedDeliverable || "",
            targetDate: item.targetDate
              ? String(item.targetDate).slice(0, 10)
              : "",
            status: (item.status || "Not Started") as TaskStatus,
            remarks: item.remarks || "",
            others: "",
            createdAt: item.createdAt,
          }));

          const apiIds = new Set(apiTasks.map((t: any) => t.taskId));
          const missingPdfTasks = PDF_TASKS_DATA.filter((p) => !apiIds.has(p.taskId));
          initialList = [...apiTasks, ...missingPdfTasks];
        }
      }
    } catch {
      // Backend not running, local storage data is used
    }

    setTasks(initialList);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialList));
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  // Sync to local storage when tasks change
  const persistTasks = (newTasks: OperationTask[]) => {
    setTasks(newTasks);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTasks));
    } catch (e) {
      console.error("Local storage error:", e);
    }
  };

  // Open Create Task form with newly formatted Task ID (PD-046, PD-047, etc.)
  const handleOpenCreate = () => {
    const nextId = getNextTaskId(tasks);
    setForm(emptyFormData(nextId));
    setEditingId(null);
    setFeedbackMsg(null);
    setShowModal(true);
  };

  // Open Edit Task form
  const handleOpenEdit = (task: OperationTask) => {
    setForm({
      taskId: task.taskId,
      workstream: task.workstream,
      taskActivity: task.taskActivity,
      priority: task.priority,
      primaryResponsible: task.primaryResponsible,
      supportingRole: task.supportingRole,
      expectedDeliverable: task.expectedDeliverable,
      targetDate: task.targetDate || "",
      status: task.status,
      remarks: task.remarks || "",
      others: "",
    });
    setEditingId(task.id);
    setFeedbackMsg(null);
    setShowModal(true);
  };

  // Save Task (Create or Update)
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.taskActivity.trim()) {
      setFeedbackMsg({
        type: "error",
        text: "Please enter Task / Activity description.",
      });
      return;
    }
    if (!form.primaryResponsible.trim()) {
      setFeedbackMsg({
        type: "error",
        text: "Please enter Primary Responsible Person.",
      });
      return;
    }

    setSaving(true);
    setFeedbackMsg(null);

    // Make sure taskId is in format PD-001, PD-002, etc.
    let finalTaskId = form.taskId.trim().toUpperCase();
    if (!finalTaskId) {
      finalTaskId = getNextTaskId(tasks);
    } else if (!finalTaskId.startsWith("PD-")) {
      finalTaskId = `PD-${finalTaskId}`;
    }

    const payload = {
      ...form,
      taskId: finalTaskId,
      others: "", // others column left blank as requested
    };

    let updatedTasks = [...tasks];

    // Attempt backend save
    try {
      if (editingId) {
        const res = await fetch(`${API_BASE}/operations/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.success && resData.task) {
            updatedTasks = updatedTasks.map((t) =>
              t.id === editingId ? { ...t, ...payload, id: editingId } : t
            );
          }
        } else {
          updatedTasks = updatedTasks.map((t) =>
            t.id === editingId ? { ...t, ...payload } : t
          );
        }
      } else {
        const res = await fetch(`${API_BASE}/operations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.success && resData.task) {
            const created = {
              ...payload,
              id: String(resData.task.id),
              createdAt: resData.task.createdAt || new Date().toISOString(),
            };
            updatedTasks = [created, ...updatedTasks];
          }
        } else {
          const newTask: OperationTask = {
            ...payload,
            id: `task-${Date.now()}`,
            createdAt: new Date().toISOString(),
          };
          updatedTasks = [...updatedTasks, newTask];
        }
      }
    } catch {
      if (editingId) {
        updatedTasks = updatedTasks.map((t) =>
          t.id === editingId ? { ...t, ...payload } : t
        );
      } else {
        const newTask: OperationTask = {
          ...payload,
          id: `task-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        updatedTasks = [...updatedTasks, newTask];
      }
    }

    persistTasks(updatedTasks);
    setSaving(false);
    setShowModal(false);
    setFeedbackMsg({
      type: "success",
      text: editingId
        ? `Task ${finalTaskId} updated successfully.`
        : `Task ${finalTaskId} created successfully!`,
    });
  };

  // Delete Task
  const handleDeleteTask = async (task: OperationTask) => {
    if (
      !window.confirm(
        `Are you sure you want to delete task ${task.taskId} ("${task.taskActivity.slice(0, 30)}...")?`
      )
    ) {
      return;
    }

    try {
      await fetch(`${API_BASE}/operations/${task.id}`, { method: "DELETE" });
    } catch {
      // ignore
    }

    const filtered = tasks.filter((t) => t.id !== task.id);
    persistTasks(filtered);
    if (viewingTask?.id === task.id) {
      setViewingTask(null);
    }
    setFeedbackMsg({
      type: "success",
      text: `Task ${task.taskId} deleted.`,
    });
  };

  // Quick Status Change directly from dropdown
  const handleStatusChange = async (task: OperationTask, newStatus: TaskStatus) => {
    const updated = tasks.map((t) =>
      t.id === task.id ? { ...t, status: newStatus } : t
    );
    persistTasks(updated);

    try {
      await fetch(`${API_BASE}/operations/${task.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // ignore
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredTasks.length === 0) {
      alert("No tasks to export.");
      return;
    }

    const headers = [
      "Task ID",
      "Workstream",
      "Task / Activity",
      "Priority",
      "Primary Responsible Person",
      "Supporting Role",
      "Expected Deliverable",
      "Target Date",
      "Status",
      "Remarks / Blockers",
      "Others",
    ];

    const rows = filteredTasks.map((t) => [
      `"${t.taskId || ""}"`,
      `"${t.workstream || ""}"`,
      `"${(t.taskActivity || "").replace(/"/g, '""')}"`,
      `"${t.priority || ""}"`,
      `"${(t.primaryResponsible || "").replace(/"/g, '""')}"`,
      `"${(t.supportingRole || "").replace(/"/g, '""')}"`,
      `"${(t.expectedDeliverable || "").replace(/"/g, '""')}"`,
      `"${t.targetDate || ""}"`,
      `"${t.status || ""}"`,
      `"${(t.remarks || "").replace(/"/g, '""')}"`,
      `""`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `operations_daily_tracker_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter tasks based on search & dropdowns
  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchSearch =
        !q ||
        [
          t.taskId,
          t.workstream,
          t.taskActivity,
          t.primaryResponsible,
          t.supportingRole,
          t.expectedDeliverable,
          t.remarks,
        ].some((val) => String(val || "").toLowerCase().includes(q));

      const matchWorkstream =
        workstreamFilter === "All" || t.workstream === workstreamFilter;
      const matchStatus = statusFilter === "All" || t.status === statusFilter;
      const matchPriority =
        priorityFilter === "All" || t.priority === priorityFilter;

      return matchSearch && matchWorkstream && matchStatus && matchPriority;
    });
  }, [tasks, search, workstreamFilter, statusFilter, priorityFilter]);

  // Statistics counters
  const totalTasks = tasks.length;
  const inProgressCount = tasks.filter((t) => t.status === "In Progress").length;
  const completedCount = tasks.filter((t) => t.status === "Completed").length;
  const notStartedCount = tasks.filter(
    (t) => t.status === "Not Started" || t.status === "Pending"
  ).length;
  const onHoldCount = tasks.filter((t) => t.status === "On Hold").length;
  const blockedCount = tasks.filter((t) => t.status === "Blocked").length;
  const criticalOrHighCount = tasks.filter(
    (t) => t.priority === "Critical" || t.priority === "High" || t.priority === "Urgent"
  ).length;

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors";

  return (
    <AppShell title="Operations">
      <div className="space-y-5 p-4 md:p-6">
        {/* Page Top Header with Title, Badges, and Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                Daily Execution & Tracker
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">
                Payal Decor Modular Furniture
              </span>
            </div>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900">
              <CheckSquare className="h-6 w-6 text-blue-600" />
              Operations Module
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Daily task and execution tracker (PD-001 to PD-047) across workstreams,
              owners, deliverables, and blockers.
            </p>
          </div>

          {/* Action Buttons Top Right: Refresh, Export, and CREATE TASK (prominently before table) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void loadTasks()}
              title="Refresh tracker"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4 text-gray-500" />
              Refresh
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filteredTasks.length === 0}
              title="Export tasks to CSV"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4 text-gray-500" />
              Export
            </button>

            {/* Prominent Create Task Button on top right of page before table */}
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-[0.98] transition-all"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              Create Task
            </button>
          </div>
        </div>

        {/* Feedback Alert Message */}
        {feedbackMsg && (
          <div
            className={`flex items-center justify-between rounded-xl border p-3.5 text-sm ${
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

        {/* Metric KPI Overview Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                Total Tasks
              </span>
              <Layers className="h-4 w-4 text-gray-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">{totalTasks}</p>
            <p className="mt-0.5 text-[11px] text-gray-400">PD-001 to PD-047</p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-600">
                In Progress
              </span>
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-blue-700">
              {inProgressCount}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400">Active execution</p>
          </div>

          <div className="rounded-xl border border-green-100 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-green-600">
                Completed
              </span>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-green-700">
              {completedCount}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400">Milestones achieved</p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">
                Not Started
              </span>
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-700">
              {notStartedCount}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400">Upcoming queue</p>
          </div>

          <div className="rounded-xl border border-amber-100 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-600">
                On Hold / Issues
              </span>
              <PauseCircle className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-700">
              {onHoldCount + blockedCount}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400">Pending clarity</p>
          </div>

          <div className="rounded-xl border border-red-100 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-red-600">
                Critical & High
              </span>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-red-700">
              {criticalOrHighCount}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400">High priority</p>
          </div>
        </div>

        {/* Table & Controls Section */}
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
          {/* Controls Bar: Search, Filters, and Counters */}
          <div className="flex flex-col gap-3 border-b border-gray-200 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900">
                  Daily Execution Records
                </h2>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Showing Payal Decor tasks with target dates, deliverables and responsible owners
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[220px] flex-1 sm:flex-none">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Task ID, Activity, Owner..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`${inputClass} pl-9`}
                />
              </div>

              {/* Workstream Filter */}
              <select
                aria-label="Filter by workstream"
                value={workstreamFilter}
                onChange={(e) => setWorkstreamFilter(e.target.value)}
                className={`${inputClass} w-auto text-xs sm:text-sm`}
              >
                <option value="All">All Workstreams</option>
                {WORKSTREAM_OPTIONS.map((ws) => (
                  <option key={ws} value={ws}>
                    {ws}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`${inputClass} w-auto text-xs sm:text-sm`}
              >
                <option value="All">All Statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                aria-label="Filter by priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className={`${inputClass} w-auto text-xs sm:text-sm`}
              >
                <option value="All">All Priorities</option>
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              {(search ||
                workstreamFilter !== "All" ||
                statusFilter !== "All" ||
                priorityFilter !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setWorkstreamFilter("All");
                    setStatusFilter("All");
                    setPriorityFilter("All");
                  }}
                  className="rounded-lg border border-gray-200 px-2.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Main Table with all 11 required columns */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-sm text-gray-500">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mb-2" />
              Loading operations daily tasks...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <CheckSquare className="h-10 w-10 text-gray-300 mb-2" />
              <p className="text-base font-semibold text-gray-700">
                No matching tasks found
              </p>
              <p className="text-sm text-gray-500 mt-1 max-w-sm">
                Try clearing your search query or filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setWorkstreamFilter("All");
                  setStatusFilter("All");
                  setPriorityFilter("All");
                }}
                className="mt-3 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px] text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50/80 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="p-3.5 w-28">
                      Task ID
                    </th>
                    <th scope="col" className="p-3.5 w-44">
                      Workstream
                    </th>
                    <th scope="col" className="p-3.5 min-w-[240px]">
                      Task / Activity
                    </th>
                    <th scope="col" className="p-3.5 w-28">
                      Priority
                    </th>
                    <th scope="col" className="p-3.5 w-44">
                      Primary Responsible Person
                    </th>
                    <th scope="col" className="p-3.5 w-40">
                      Supporting Role
                    </th>
                    <th scope="col" className="p-3.5 min-w-[220px]">
                      Expected Deliverable
                    </th>
                    <th scope="col" className="p-3.5 w-32">
                      Target Date
                    </th>
                    <th scope="col" className="p-3.5 w-36">
                      Status
                    </th>
                    <th scope="col" className="p-3.5 min-w-[200px]">
                      Remarks / Blockers
                    </th>
                    <th scope="col" className="p-3.5 w-24">
                      Others
                    </th>
                    <th scope="col" className="p-3.5 w-24 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTasks.map((task) => {
                    const isBlocked = task.status === "Blocked";
                    const isOnHold = task.status === "On Hold";
                    return (
                      <tr
                        key={task.id}
                        className={`transition-colors hover:bg-blue-50/40 ${
                          isBlocked
                            ? "bg-rose-50/20"
                            : isOnHold
                            ? "bg-amber-50/20"
                            : ""
                        }`}
                      >
                        {/* 1. Task ID (PD-001 format) */}
                        <td className="p-3.5 align-top whitespace-nowrap">
                          <span className="inline-block rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-bold text-slate-800 border border-slate-200">
                            {task.taskId}
                          </span>
                        </td>

                        {/* 2. Workstream */}
                        <td className="p-3.5 align-top">
                          <span
                            className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium leading-tight ${getWorkstreamBadgeColor(
                              task.workstream
                            )}`}
                          >
                            {task.workstream}
                          </span>
                        </td>

                        {/* 3. Task / Activity */}
                        <td className="p-3.5 align-top">
                          <div className="font-medium text-gray-900 leading-snug">
                            {task.taskActivity}
                          </div>
                        </td>

                        {/* 4. Priority */}
                        <td className="p-3.5 align-top whitespace-nowrap">
                          {getPriorityBadge(task.priority)}
                        </td>

                        {/* 5. Primary Responsible Person */}
                        <td className="p-3.5 align-top">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
                              {task.primaryResponsible
                                ? task.primaryResponsible
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)
                                : "P"}
                            </div>
                            <span className="font-medium text-gray-800">
                              {task.primaryResponsible}
                            </span>
                          </div>
                        </td>

                        {/* 6. Supporting role */}
                        <td className="p-3.5 align-top">
                          {task.supportingRole ? (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded px-2 py-0.5">
                              <Users2 className="h-3 w-3 text-gray-400" />
                              {task.supportingRole}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>

                        {/* 7. Expected Deliverable */}
                        <td className="p-3.5 align-top">
                          {task.expectedDeliverable ? (
                            <div className="flex items-start gap-1.5 text-xs text-gray-700 leading-snug">
                              <Target className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                              <span>{task.expectedDeliverable}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>

                        {/* 8. Target Date */}
                        <td className="p-3.5 align-top whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs text-gray-700">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            <span>{formatDateDisplay(task.targetDate)}</span>
                          </div>
                        </td>

                        {/* 9. Status */}
                        <td className="p-3.5 align-top">
                          <div className="relative inline-block">
                            <select
                              aria-label={`Status for task ${task.taskId}`}
                              value={task.status}
                              onChange={(e) =>
                                void handleStatusChange(
                                  task,
                                  e.target.value as TaskStatus
                                )
                              }
                              className="cursor-pointer appearance-none rounded-full border border-gray-200 bg-white py-1 pl-2.5 pr-6 text-xs font-medium text-gray-700 shadow-2xs hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              {STATUS_OPTIONS.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                              <span className="text-[10px] text-gray-400">▼</span>
                            </div>
                          </div>
                        </td>

                        {/* 10. Remarks / Blockers */}
                        <td className="p-3.5 align-top">
                          {task.remarks ? (
                            <div
                              className={`rounded p-1.5 text-xs leading-relaxed ${
                                isBlocked
                                  ? "bg-rose-50 text-rose-800 border border-rose-200"
                                  : isOnHold
                                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                                  : "text-gray-600"
                              }`}
                            >
                              {isBlocked && (
                                <span className="inline-flex items-center gap-1 font-semibold text-rose-700 mr-1">
                                  <AlertTriangle className="h-3 w-3 inline text-rose-600" />
                                  Blocker:
                                </span>
                              )}
                              <span>{task.remarks}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>

                        {/* 11. Others (Left blank as requested) */}
                        <td className="p-3.5 align-top text-gray-300 text-xs">
                          {task.others || "—"}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 align-top text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              title="View details"
                              onClick={() => setViewingTask(task)}
                              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              title="Edit task"
                              onClick={() => handleOpenEdit(task)}
                              className="rounded p-1 text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              title="Delete task"
                              onClick={() => void handleDeleteTask(task)}
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
        {/* CREATE / EDIT TASK MODAL                                    */}
        {/* ============================================================ */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {editingId ? "Edit Operations Task" : "Create Operations Task"}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {editingId
                      ? `Update daily task parameters for ${form.taskId}`
                      : "Add a new daily activity to the execution tracker"}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close modal"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="mt-4 space-y-4">
                {/* Row 1: Task ID (auto-generated format PD-001), Workstream, Priority */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Task ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.taskId}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, taskId: e.target.value }))
                      }
                      placeholder="e.g. PD-046"
                      className={`${inputClass} font-mono font-bold bg-slate-50`}
                    />
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      Auto format: PD-001, PD-002...
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Workstream <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.workstream}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, workstream: e.target.value }))
                      }
                      className={inputClass}
                    >
                      {WORKSTREAM_OPTIONS.map((ws) => (
                        <option key={ws} value={ws}>
                          {ws}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.priority}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          priority: e.target.value as PriorityLevel,
                        }))
                      }
                      className={inputClass}
                    >
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Task / Activity (description) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Task / Activity <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={form.taskActivity}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, taskActivity: e.target.value }))
                    }
                    placeholder="Describe specific task to execute..."
                    className={inputClass}
                  />
                </div>

                {/* Row 3: Primary Responsible Person & Supporting Role */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Primary Responsible Person <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.primaryResponsible}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          primaryResponsible: e.target.value,
                        }))
                      }
                      placeholder="e.g. Project Manager / Software Developer"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Supporting Role
                    </label>
                    <input
                      type="text"
                      value={form.supportingRole}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          supportingRole: e.target.value,
                        }))
                      }
                      placeholder="e.g. Software Developer / Digital Marketing"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Row 4: Expected Deliverable & Target Date */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Expected Deliverable
                    </label>
                    <input
                      type="text"
                      value={form.expectedDeliverable}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          expectedDeliverable: e.target.value,
                        }))
                      }
                      placeholder="e.g. Approved workflow covering enquiry through project closure"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Target Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={form.targetDate}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, targetDate: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Row 5: Status & Others */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          status: e.target.value as TaskStatus,
                        }))
                      }
                      className={inputClass}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Others (Left blank by default)
                    </label>
                    <input
                      type="text"
                      value={form.others}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, others: e.target.value }))
                      }
                      placeholder="Leave blank"
                      className={`${inputClass} bg-gray-50`}
                    />
                  </div>
                </div>

                {/* Row 6: Remarks / Blockers */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Remarks / Blockers
                  </label>
                  <textarea
                    rows={2}
                    value={form.remarks}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, remarks: e.target.value }))
                    }
                    placeholder="Note any delays, vendor issues, requirements changes or milestones..."
                    className={inputClass}
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : editingId ? (
                      "Update Task"
                    ) : (
                      "Create Task"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW TASK DETAILS MODAL                                      */}
        {/* ============================================================ */}
        {viewingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-base font-bold bg-slate-100 text-slate-800 border px-2.5 py-1 rounded-md">
                    {viewingTask.taskId}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Task Execution Details
                    </h3>
                    <p className="text-xs text-gray-500">
                      Workstream: {viewingTask.workstream}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close task details"
                  onClick={() => setViewingTask(null)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Task / Activity
                  </h4>
                  <p className="mt-1 font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border">
                    {viewingTask.taskActivity}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <span className="text-xs text-gray-500">Priority</span>
                    <div className="mt-1">{getPriorityBadge(viewingTask.priority)}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <span className="text-xs text-gray-500">Status</span>
                    <div className="mt-1">{getStatusBadge(viewingTask.status)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border p-3">
                    <span className="text-xs text-gray-500">Primary Responsible Person</span>
                    <p className="mt-1 font-semibold text-gray-900">
                      {viewingTask.primaryResponsible}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <span className="text-xs text-gray-500">Supporting Role</span>
                    <p className="mt-1 text-gray-800">
                      {viewingTask.supportingRole || "—"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border p-3">
                    <span className="text-xs text-gray-500">Expected Deliverable</span>
                    <p className="mt-1 text-gray-800">
                      {viewingTask.expectedDeliverable || "—"}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <span className="text-xs text-gray-500">Target Date</span>
                    <p className="mt-1 font-semibold text-gray-900">
                      {formatDateDisplay(viewingTask.targetDate)}
                    </p>
                  </div>
                </div>

                {viewingTask.remarks && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                    <span className="text-xs font-semibold text-amber-900">
                      Remarks / Blockers
                    </span>
                    <p className="mt-1 text-amber-800 text-xs leading-relaxed">
                      {viewingTask.remarks}
                    </p>
                  </div>
                )}

                <div className="rounded-lg border p-3">
                  <span className="text-xs text-gray-500">Others</span>
                  <p className="mt-1 text-gray-400 text-xs italic">
                    {viewingTask.others || "— (Blank)"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => {
                    const t = viewingTask;
                    setViewingTask(null);
                    handleOpenEdit(t);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Task
                </button>
                <button
                  type="button"
                  onClick={() => setViewingTask(null)}
                  className="rounded-lg bg-gray-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
export default OperationsPage;
