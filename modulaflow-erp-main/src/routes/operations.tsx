import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Calendar,
  Download,
  Upload,
  CheckSquare,
  Users2,
  UserPlus,
  User,
  ShieldCheck,
  Lock,
  Target,
  AlertCircle,
  PauseCircle,
  FileSpreadsheet,
  Briefcase,
  Check,
  LogIn,
  LogOut,
  KeyRound,
  UserCheck,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { loginAdmin, loginEmployee, getCurrentUser } from "@/lib/auth";

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

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  phone?: string;
  avatarColor?: string;
}

export interface AuthSession {
  name: string;
  email: string;
  role: string;
  isAdmin: boolean;
}

export interface OperationTask {
  id: string;
  taskId: string; // Format: PD-001, PD-002, PD-003, etc.
  workstream: string;
  taskActivity: string;
  priority: PriorityLevel;
  employee: string; // "Disha" | "Sairaj" | "Saniya"
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
  "Software / Operation",
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

const LOCAL_STORAGE_KEY = "payal_decor_operations_tasks_v10";
const EMPLOYEES_STORAGE_KEY = "payal_decor_employees_v4";
const AUTH_STORAGE_KEY = "payal_decor_operations_auth_user_v4";

// Configured employees: Disha, Gaurav (Project Manager), Sairaj, and Saniya
export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "emp-disha",
    name: "Disha",
    email: "disha@payaldecor.com",
    role: "Software Developer",
    department: "Software & Operations",
    phone: "+91 98765 43210",
    avatarColor: "bg-purple-100 text-purple-700 border-purple-200",
  },
  {
    id: "emp-gaurav",
    name: "Gaurav",
    email: "gaurav@payaldecor.com",
    role: "Project Manager",
    department: "Operations & Project Control",
    phone: "+91 98765 43213",
    avatarColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  {
    id: "emp-sairaj",
    name: "Sairaj",
    email: "sairaj@payaldecor.com",
    role: "Operations & Production Lead",
    department: "Operations & Project Control",
    phone: "+91 98765 43211",
    avatarColor: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    id: "emp-saniya",
    name: "Saniya",
    email: "saniya@payaldecor.com",
    role: "Design & Documentation Lead",
    department: "Data & Documentation",
    phone: "+91 98765 43212",
    avatarColor: "bg-pink-100 text-pink-700 border-pink-200",
  },
];

// Exact dataset transcribed from Payal Decor Daily Task & Execution Tracker (PD-001 to PD-050)
// Configured strictly across Disha, Gaurav, Sairaj, and Saniya
export const PDF_TASKS_DATA: OperationTask[] = [
  {
    id: "pd-001",
    taskId: "PD-001",
    workstream: "Software & Operations",
    taskActivity: "Create the Operations tab in the existing software",
    priority: "Critical",
    employee: "Disha",
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
    employee: "Gaurav",
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
    employee: "Disha",
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
    employee: "Disha",
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
    employee: "Gaurav",
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
    employee: "Saniya",
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
    employee: "Saniya",
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
    employee: "Gaurav",
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
    employee: "Gaurav",
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
    employee: "Gaurav",
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
    employee: "Gaurav",
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
    employee: "Saniya",
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
    employee: "Saniya",
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
    employee: "Saniya",
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
    employee: "Gaurav",
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
    employee: "Gaurav",
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
    employee: "Saniya",
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
    employee: "Disha",
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
    employee: "Disha",
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
    employee: "Gaurav",
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
    employee: "Gaurav",
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
    employee: "Gaurav",
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
    employee: "Gaurav",
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
    employee: "Disha",
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
    employee: "Disha",
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
    employee: "Disha",
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
    employee: "Disha",
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
    employee: "Disha",
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
    employee: "Disha",
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
    employee: "Disha",
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
    employee: "Disha",
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
    employee: "Disha",
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
    employee: "Disha",
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
    employee: "Gaurav",
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
    employee: "Disha",
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
    employee: "Gaurav",
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
    employee: "Disha",
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
    employee: "Gaurav",
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
    employee: "Gaurav",
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
    employee: "Gaurav",
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
    employee: "Disha",
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
    employee: "Sairaj",
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
    employee: "Sairaj",
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
    employee: "Sairaj",
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
    employee: "Gaurav",
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
    employee: "Gaurav",
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
    employee: "Disha",
    primaryResponsible: "Software Developer",
    supportingRole: "Project Manager",
    expectedDeliverable: "Improve the UI and fix non working buttons and logic",
    targetDate: "2026-11-06",
    status: "Completed",
    remarks: "On time completed",
    others: "",
  },
  {
    id: "pd-048",
    taskId: "PD-048",
    workstream: "Software / Operation",
    taskActivity: "Improvement of the operations Tab",
    priority: "Low",
    employee: "Disha",
    primaryResponsible: "Software Developer",
    supportingRole: "Project Manager",
    expectedDeliverable: "Improve Bussiness side operations and software side.",
    targetDate: "2026-11-10",
    status: "In Progress",
    remarks: "Assigned to Disha",
    others: "",
  },
  {
    id: "pd-049",
    taskId: "PD-049",
    workstream: "Software / Operation",
    taskActivity: "Website aligment issue",
    priority: "Medium",
    employee: "Sairaj",
    primaryResponsible: "Website Developer",
    supportingRole: "Project Manager",
    expectedDeliverable: "Alinment of elements",
    targetDate: "2026-11-10",
    status: "Completed",
    remarks: "Assigned to Sairaj",
    others: "",
  },
  {
    id: "pd-050",
    taskId: "PD-050",
    workstream: "Software / Operation",
    taskActivity: "Website SEO and keyword",
    priority: "High",
    employee: "Sairaj",
    primaryResponsible: "Website Developer",
    supportingRole: "Project Manager",
    expectedDeliverable: "Making website visible, Improve keywording.",
    targetDate: "2026-11-10",
    status: "In Progress",
    remarks: "Assigned to Sairaj",
    others: "",
  },
];

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

const emptyFormData = (autoId: string = "PD-001", defaultEmployee: string = "Disha") => ({
  taskId: autoId,
  workstream: "Software & Operations",
  taskActivity: "",
  priority: "High" as PriorityLevel,
  employee: defaultEmployee,
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
    case "Software / Operation":
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
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [search, setSearch] = useState("");
  const [workstreamFilter, setWorkstreamFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // ============================================================
  // SECURE AUTHENTICATION VIA EMAIL AND NAME (AS REQUESTED)
  // An employee must log in via Email and Name.
  // Once logged in (e.g. as Disha), only Disha's tasks are visible!
  // Anyone without logging in as another employee cannot see their tasks!
  // ============================================================
  const [currentSession, setCurrentSession] = useState<AuthSession>(() => {
    try {
      const authUser = getCurrentUser();
      if (authUser) {
        return {
          name: authUser.name,
          email: authUser.email,
          role: authUser.role,
          isAdmin: authUser.isAdmin,
        };
      }
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email && parsed.name) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    // Default logged in user: Admin (full visibility across all 50 tasks)
    return {
      name: "Admin",
      email: "admin@payaldecor.com",
      role: "System Administrator",
      isAdmin: true,
    };
  });

  // Login Modal State (Supports Admin & Individual Employee with own passwords)
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [modalLoginRole, setModalLoginRole] = useState<"admin" | "employee">("employee");
  const [modalAdminId, setModalAdminId] = useState("admin");
  const [modalEmployeeId, setModalEmployeeId] = useState("gaurav");
  const [modalPassword, setModalPassword] = useState("");
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingTask, setViewingTask] = useState<OperationTask | null>(null);
  const [form, setForm] = useState(emptyFormData("PD-001", currentSession.name));
  const [saving, setSaving] = useState(false);

  // Import Modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [importMode, setImportMode] = useState<"append" | "replace">("append");
  const [importParsedCount, setImportParsedCount] = useState<number | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Add Employee Modal state
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpRole, setNewEmpRole] = useState("Software Developer");
  const [newEmpDept, setNewEmpDept] = useState("Software & Operations");
  const [newEmpEmail, setNewEmpEmail] = useState("");
  const [newEmpPhone, setNewEmpPhone] = useState("");

  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Save authentication session
  const saveAuthSession = (session: AuthSession) => {
    setCurrentSession(session);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // ignore
    }
  };

  // Perform Login with Password Verification
  const handlePerformLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (modalLoginRole === "admin") {
      if (!modalAdminId.trim() || !modalPassword) {
        setLoginError("Please enter your Admin ID and password.");
        return;
      }
      const res = loginAdmin(modalAdminId, modalPassword);
      if (!res.success) {
        setLoginError(res.error || "Admin ID or password is incorrect.");
        return;
      }
      const adminSession: AuthSession = {
        name: "Admin",
        email: "admin@payaldecor.com",
        role: "System Administrator",
        isAdmin: true,
      };
      saveAuthSession(adminSession);
      setShowLoginModal(false);
      setModalPassword("");
      setFeedbackMsg({
        type: "success",
        text: "Logged in as Administrator (Unrestricted View across all 50 tasks).",
      });
    } else {
      if (!modalEmployeeId || !modalPassword) {
        setLoginError("Please select your employee profile and enter your password.");
        return;
      }
      const res = loginEmployee(modalEmployeeId, modalPassword);
      if (!res.success) {
        setLoginError(res.error || "Incorrect employee password.");
        return;
      }
      if (res.user) {
        const empSession: AuthSession = {
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
          isAdmin: false,
        };
        saveAuthSession(empSession);
        setShowLoginModal(false);
        setModalPassword("");
        setFeedbackMsg({
          type: "success",
          text: `Welcome back, ${res.user.name}! Showing only your assigned tasks.`,
        });
      }
    }
  };

  // Log Out / Clear Session
  const handleLogout = () => {
    setModalPassword("");
    setLoginError(null);
    setShowLoginModal(true);
  };

  // Load employees from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Keep only Disha, Sairaj, Saniya as base, plus any custom user-added
          const baseNames = new Set(INITIAL_EMPLOYEES.map((e) => e.name.toLowerCase()));
          const userAdded = parsed.filter(
            (e: Employee) =>
              !baseNames.has(e.name.toLowerCase()) &&
              !["rahul pawar", "sneha patil", "pooja kulkarni", "amit sharma", "vikram singh"].includes(
                e.name.toLowerCase()
              )
          );
          setEmployees([...INITIAL_EMPLOYEES, ...userAdded]);
          return;
        }
      }
    } catch {
      // ignore
    }
    setEmployees(INITIAL_EMPLOYEES);
  }, []);

  // Persist employees
  const persistEmployees = (list: Employee[]) => {
    setEmployees(list);
    try {
      localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  };

  // Load tasks: Preserve user's PD-001 to PD-047 with employee assignments
  const loadTasks = useCallback(async () => {
    setLoading(true);

    let initialList = [...PDF_TASKS_DATA];

    try {
      const stored =
        localStorage.getItem(LOCAL_STORAGE_KEY) ||
        localStorage.getItem("payal_decor_operations_tasks_v8") ||
        localStorage.getItem("payal_decor_operations_tasks_v7");

      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Remap any old names to Disha, Gaurav, Sairaj, Saniya
          const updatedWithCleanEmployees = parsed.map((item: any) => {
            if (item.taskId === "PD-048")
              return { ...item, employee: "Disha", remarks: item.remarks || "Assigned to Disha" };
            if (item.taskId === "PD-049")
              return { ...item, employee: "Sairaj", remarks: item.remarks || "Assigned to Sairaj" };
            if (item.taskId === "PD-050")
              return { ...item, employee: "Sairaj", remarks: item.remarks || "Assigned to Sairaj" };
            const rawEmp = String(item.employee || "").trim().toLowerCase();
            if (rawEmp.includes("disha")) return { ...item, employee: "Disha" };
            if (rawEmp.includes("gaurav")) return { ...item, employee: "Gaurav" };
            if (rawEmp.includes("sairaj")) return { ...item, employee: "Sairaj" };
            if (rawEmp.includes("saniya")) return { ...item, employee: "Saniya" };

            // Map roles if unassigned
            const pr = String(item.primaryResponsible || "").toLowerCase();
            if (pr.includes("software") || pr.includes("developer")) return { ...item, employee: "Disha" };
            if (pr.includes("project manager")) return { ...item, employee: "Gaurav" };
            if (pr.includes("marketing") || pr.includes("data") || pr.includes("profile")) return { ...item, employee: "Saniya" };
            return { ...item, employee: "Sairaj" };
          });

          const taskMap = new Map<string, OperationTask>();
          for (const item of updatedWithCleanEmployees) {
            taskMap.set(item.taskId, item);
          }
          // Ensure all official PDF/spreadsheet tasks are present and updated
          for (const required of PDF_TASKS_DATA) {
            if (!taskMap.has(required.taskId)) {
              taskMap.set(required.taskId, required);
            } else if (["PD-048", "PD-049", "PD-050"].includes(required.taskId)) {
              const existing = taskMap.get(required.taskId)!;
              taskMap.set(required.taskId, {
                ...existing,
                ...required,
                remarks: existing.remarks || required.remarks,
              });
            }
          }
          initialList = Array.from(taskMap.values());
          initialList.sort((a, b) => {
            const numA = parseInt((a.taskId || "").replace(/\D/g, "") || "0", 10);
            const numB = parseInt((b.taskId || "").replace(/\D/g, "") || "0", 10);
            return numA - numB;
          });
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
          const apiTasks = data.tasks.map((item: any) => {
            let emp = item.employee || "Disha";
            if (emp.toLowerCase().includes("disha")) emp = "Disha";
            else if (emp.toLowerCase().includes("gaurav")) emp = "Gaurav";
            else if (emp.toLowerCase().includes("sairaj")) emp = "Sairaj";
            else if (emp.toLowerCase().includes("saniya")) emp = "Saniya";

            return {
              id: String(item.id),
              taskId: item.taskId || "PD-001",
              workstream: item.workstream || "General",
              taskActivity: item.taskActivity || "",
              priority: (item.priority || "Medium") as PriorityLevel,
              employee: emp,
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
            };
          });

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

  // ------------------------------------------------------------
  // STRICT TASK ISOLATION BASED ON AUTHENTICATED USER SESSION:
  // If logged in as Disha, she can ONLY see Disha's tasks.
  // There is NO dropdown that lets Disha look into Sairaj or Saniya's tasks!
  // If logged in as Sairaj, only Sairaj's tasks are visible.
  // If logged in as Saniya, only Saniya's tasks are visible.
  // Only Admin has cross-employee visibility.
  // ------------------------------------------------------------
  const isolatedTasks = useMemo(() => {
    if (currentSession.isAdmin) {
      return tasks;
    }
    const currentName = currentSession.name.trim().toLowerCase();
    return tasks.filter((t) => {
      const emp = (t.employee || "").trim().toLowerCase();
      return emp === currentName || emp.includes(currentName) || currentName.includes(emp);
    });
  }, [tasks, currentSession]);

  // Secondary Filter: Search, Workstream, Status, Priority
  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return isolatedTasks.filter((t) => {
      const matchSearch =
        !q ||
        [
          t.taskId,
          t.workstream,
          t.taskActivity,
          t.employee,
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
  }, [isolatedTasks, search, workstreamFilter, statusFilter, priorityFilter]);

  // Statistics counters (strictly calculated for the logged-in user's tasks)
  const totalTasks = isolatedTasks.length;
  const inProgressCount = isolatedTasks.filter((t) => t.status === "In Progress").length;
  const completedCount = isolatedTasks.filter((t) => t.status === "Completed").length;
  const notStartedCount = isolatedTasks.filter(
    (t) => t.status === "Not Started" || t.status === "Pending"
  ).length;
  const onHoldCount = isolatedTasks.filter((t) => t.status === "On Hold").length;
  const blockedCount = isolatedTasks.filter((t) => t.status === "Blocked").length;
  const criticalOrHighCount = isolatedTasks.filter(
    (t) => t.priority === "Critical" || t.priority === "High" || t.priority === "Urgent"
  ).length;

  // Open Create Task form
  const handleOpenCreate = () => {
    const nextId = getNextTaskId(tasks);
    // When employee creates task, auto-assign strictly to them!
    const defaultEmp = currentSession.isAdmin ? "Disha" : currentSession.name;
    setForm(emptyFormData(nextId, defaultEmp));
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
      employee: task.employee || currentSession.name,
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

    let finalTaskId = form.taskId.trim().toUpperCase();
    if (!finalTaskId) {
      finalTaskId = getNextTaskId(tasks);
    } else if (!finalTaskId.startsWith("PD-")) {
      finalTaskId = `PD-${finalTaskId}`;
    }

    const payload = {
      ...form,
      taskId: finalTaskId,
      employee: currentSession.isAdmin ? form.employee : currentSession.name,
      others: "",
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
        : `Task ${finalTaskId} created and assigned to ${payload.employee}!`,
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

  // Add Employee Handler
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) {
      alert("Please enter employee name.");
      return;
    }
    const cleanName = newEmpName.trim().charAt(0).toUpperCase() + newEmpName.trim().slice(1);
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name: cleanName,
      role: newEmpRole.trim(),
      department: newEmpDept.trim(),
      email: newEmpEmail.trim() || `${cleanName.toLowerCase()}@payaldecor.com`,
      phone: newEmpPhone.trim(),
      avatarColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
    };

    persistEmployees([...employees, newEmp]);
    setNewEmpName("");
    setNewEmpEmail("");
    setNewEmpPhone("");
    setFeedbackMsg({
      type: "success",
      text: `Employee "${newEmp.name}" registered. They can now log in via email "${newEmp.email}" to see their personal tasks!`,
    });
    setShowEmployeeModal(false);
  };

  // Export CSV (Exports currently isolated and filtered tasks)
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
      "Employee",
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
      `"${(t.employee || "").replace(/"/g, '""')}"`,
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
    const suffix = currentSession.isAdmin ? "admin_all" : currentSession.name.toLowerCase();
    link.setAttribute(
      "download",
      `operations_tasks_${suffix}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download CSV Template for Import
  const handleDownloadTemplate = () => {
    const headers = [
      "Task ID",
      "Workstream",
      "Task / Activity",
      "Priority",
      "Employee",
      "Primary Responsible Person",
      "Supporting Role",
      "Expected Deliverable",
      "Target Date",
      "Status",
      "Remarks / Blockers",
      "Others",
    ];
    const sample = [
      "PD-048",
      "Software & Operations",
      "Build live notifications for task updates",
      "High",
      "Disha",
      "Software Developer",
      "Project Manager",
      "Real-time task notification component",
      "2026-11-20",
      "In Progress",
      "Requires WebSocket or SSE",
      "",
    ];

    const csv = [headers.join(","), sample.map((s) => `"${s}"`).join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "payal_decor_task_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV Helper
  const parseCSVString = (csvText: string): OperationTask[] => {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const result: OperationTask[] = [];
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

    const idIdx = findIndex(["id"]);
    const wsIdx = findIndex(["workstream"]);
    const actIdx = findIndex(["task", "activity"]);
    const priIdx = findIndex(["priority"]);
    const empIdx = findIndex(["employee", "assignee", "owner"]);
    const prIdx = findIndex(["primary", "responsible"]);
    const srIdx = findIndex(["supporting", "role"]);
    const delIdx = findIndex(["deliverable", "expected"]);
    const tdIdx = findIndex(["date", "target"]);
    const stIdx = findIndex(["status"]);
    const remIdx = findIndex(["remark", "blocker"]);

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const cols = parseLine(line);
      if (cols.length === 0 || !cols.some((c) => c.length > 0)) continue;

      const act = actIdx !== -1 && cols[actIdx] ? cols[actIdx] : cols[2] || cols[1] || "";
      if (!act) continue;

      let rawId = idIdx !== -1 && cols[idIdx] ? cols[idIdx].trim().toUpperCase() : "";
      if (!rawId) {
        rawId = `PD-${String(result.length + 100).padStart(3, "0")}`;
      } else if (!rawId.startsWith("PD-")) {
        rawId = `PD-${rawId}`;
      }

      const rawPri = priIdx !== -1 && cols[priIdx] ? cols[priIdx] : "High";
      const validPri: PriorityLevel = ["Critical", "Urgent", "High", "Medium", "Low"].includes(rawPri)
        ? (rawPri as PriorityLevel)
        : "Medium";

      const rawSt = stIdx !== -1 && cols[stIdx] ? cols[stIdx] : "Not Started";
      const validStatus: TaskStatus = STATUS_OPTIONS.includes(rawSt as TaskStatus)
        ? (rawSt as TaskStatus)
        : "Not Started";

      let empName = empIdx !== -1 && cols[empIdx] ? cols[empIdx].trim() : currentSession.name;
      if (empName.toLowerCase().includes("disha")) empName = "Disha";
      else if (empName.toLowerCase().includes("sairaj")) empName = "Sairaj";
      else if (empName.toLowerCase().includes("saniya")) empName = "Saniya";

      result.push({
        id: `import-${Date.now()}-${i}`,
        taskId: rawId,
        workstream: wsIdx !== -1 && cols[wsIdx] ? cols[wsIdx] : "Software & Operations",
        taskActivity: act,
        priority: validPri,
        employee: empName,
        primaryResponsible: prIdx !== -1 && cols[prIdx] ? cols[prIdx] : "Software Developer",
        supportingRole: srIdx !== -1 && cols[srIdx] ? cols[srIdx] : "",
        expectedDeliverable: delIdx !== -1 && cols[delIdx] ? cols[delIdx] : "",
        targetDate: tdIdx !== -1 && cols[tdIdx] ? cols[tdIdx].slice(0, 10) : new Date().toISOString().slice(0, 10),
        status: validStatus,
        remarks: remIdx !== -1 && cols[remIdx] ? cols[remIdx] : "",
        others: "",
      });
    }

    return result;
  };

  // Handle CSV file selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = String(event.target?.result || "");
      setImportText(text);
      const parsed = parseCSVString(text);
      setImportParsedCount(parsed.length);
      setImportError(null);
    };
    reader.onerror = () => {
      setImportError("Failed to read file.");
    };
    reader.readAsText(file);
  };

  // Execute Import
  const handleExecuteImport = () => {
    if (!importText.trim()) {
      setImportError("Please upload or paste CSV data first.");
      return;
    }
    const parsed = parseCSVString(importText);
    if (parsed.length === 0) {
      setImportError("Could not parse any valid tasks. Check formatting and headers.");
      return;
    }

    let nextTasks: OperationTask[];
    if (importMode === "replace") {
      nextTasks = parsed;
    } else {
      const existingIds = new Set(tasks.map((t) => t.taskId));
      const adjusted = parsed.map((t) => {
        if (existingIds.has(t.taskId)) {
          const newId = getNextTaskId([...tasks, ...nextTasks || []]);
          return { ...t, taskId: newId };
        }
        return t;
      });
      nextTasks = [...tasks, ...adjusted];
    }

    persistTasks(nextTasks);
    setShowImportModal(false);
    setImportText("");
    setImportParsedCount(null);
    setFeedbackMsg({
      type: "success",
      text: `Successfully imported ${parsed.length} tasks (${importMode === "replace" ? "Replaced all" : "Appended"}).`,
    });
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors";

  return (
    <AppShell title="Operations">
      <div className="space-y-4 p-4 md:p-6">
        {/* ============================================================ */}
        {/* TOP HEADER & ALL ACTION BUTTONS IN THE SAME LINE             */}
        {/* ============================================================ */}
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
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
            <h1 className="mt-0.5 flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900">
              <CheckSquare className="h-6 w-6 text-blue-600" />
              Operations Module
            </h1>
          </div>

          {/* ALL BUTTONS STRICTLY IN THE SAME LINE (NO WRAPPING) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0 shrink-0 flex-nowrap">
            {/* 1. Refresh */}
            <button
              type="button"
              onClick={() => void loadTasks()}
              title="Refresh tracker"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 whitespace-nowrap transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5 text-gray-500" />
              Refresh
            </button>

            {/* 2. Export */}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filteredTasks.length === 0}
              title="Export tasks to CSV"
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
              title="Import tasks from CSV"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50/70 px-3 py-2 text-xs font-semibold text-blue-700 shadow-2xs hover:bg-blue-100 whitespace-nowrap transition-colors"
            >
              <Upload className="h-3.5 w-3.5 text-blue-600" />
              Import
            </button>

            {/* 4. Add Employee */}
            <button
              type="button"
              onClick={() => setShowEmployeeModal(true)}
              title="Register new team member"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-purple-300 bg-purple-50/70 px-3 py-2 text-xs font-semibold text-purple-700 shadow-2xs hover:bg-purple-100 whitespace-nowrap transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5 text-purple-600" />
              Add Employee
            </button>

            {/* 5. Employee Login (ONLY visible when logged in as Admin) */}
            {currentSession.isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setModalPassword("");
                  setLoginError(null);
                  setShowLoginModal(true);
                }}
                title="Sign in as Employee or Admin to view assigned tasks"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-indigo-300 bg-indigo-50/80 px-3 py-2 text-xs font-semibold text-indigo-700 shadow-2xs hover:bg-indigo-100 whitespace-nowrap transition-colors"
              >
                <KeyRound className="h-3.5 w-3.5 text-indigo-600" />
                Employee Login
              </button>
            )}

            {/* 6. Create Task */}
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 active:scale-[0.98] whitespace-nowrap transition-all"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              Create Task
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECURE EMPLOYEE LOGIN & IDENTITY STATUS BANNER               */}
        {/* Shows who is logged in and enforces task isolation.           */}
        {/* ============================================================ */}
        <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50/90 via-indigo-50/70 to-blue-50/90 p-3.5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-700 text-white shadow-xs font-bold text-sm select-none">
              {currentSession.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-900">
                  Active Account:
                </span>
                <span className="rounded-md bg-purple-200/80 px-2 py-0.5 text-xs font-bold text-purple-900">
                  {currentSession.name} ({currentSession.email})
                </span>
                <span className="text-xs text-purple-700 font-medium">
                  • {currentSession.role}
                </span>
              </div>
              <p className="text-xs text-purple-900/80 mt-0.5">
                {currentSession.isAdmin ? (
                  <span className="font-semibold text-blue-800">
                    🛡️ Administrator Access: Full organization view across all team tasks.
                  </span>
                ) : (
                  <span>
                    🔒 <strong>Strict Task Privacy Active:</strong> Logged in as <strong>{currentSession.name}</strong>. Only tasks assigned to {currentSession.name} are visible in this workspace.
                  </span>
                )}
              </p>
            </div>
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

        {/* Metric KPI Overview Cards (Strictly scoped to logged in employee) */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                {currentSession.isAdmin ? "Total Tasks" : `${currentSession.name}'s Tasks`}
              </span>
              <Layers className="h-4 w-4 text-gray-400" />
            </div>
            <p className="mt-1.5 text-2xl font-bold text-gray-900">{totalTasks}</p>
            <p className="mt-0.5 text-[11px] text-gray-400">
              {currentSession.isAdmin ? "All company tasks" : "Assigned directly to you"}
            </p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-600">
                In Progress
              </span>
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-1.5 text-2xl font-bold text-blue-700">
              {inProgressCount}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400">Active execution</p>
          </div>

          <div className="rounded-xl border border-green-100 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-green-600">
                Completed
              </span>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <p className="mt-1.5 text-2xl font-bold text-green-700">
              {completedCount}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400">Milestones achieved</p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">
                Not Started
              </span>
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
            <p className="mt-1.5 text-2xl font-bold text-gray-700">
              {notStartedCount}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400">Upcoming queue</p>
          </div>

          <div className="rounded-xl border border-amber-100 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-600">
                On Hold / Issues
              </span>
              <PauseCircle className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-1.5 text-2xl font-bold text-amber-700">
              {onHoldCount + blockedCount}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400">Pending clarity</p>
          </div>

          <div className="rounded-xl border border-red-100 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-red-600">
                Critical & High
              </span>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
            <p className="mt-1.5 text-2xl font-bold text-red-700">
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
                {!currentSession.isAdmin && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">
                    <Lock className="h-3 w-3" />
                    Private to {currentSession.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {currentSession.isAdmin
                  ? "Showing all Payal Decor tasks across all team members"
                  : `Showing exclusively tasks assigned to ${currentSession.name} (other members' tasks hidden)`}
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] flex-1 sm:flex-none">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Task ID, Activity..."
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
                className={`${inputClass} w-auto text-xs`}
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
                className={`${inputClass} w-auto text-xs`}
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
                className={`${inputClass} w-auto text-xs`}
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

          {/* Main Table: Employee column strictly after Priority */}
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
                {!currentSession.isAdmin
                  ? `No tasks currently assigned to ${currentSession.name} match the filters.`
                  : "Try clearing your search query or filters."}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setWorkstreamFilter("All");
                    setStatusFilter("All");
                    setPriorityFilter("All");
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Clear filters
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1350px] text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50/80 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <tr>
                    {/* 1. Task ID */}
                    <th scope="col" className="p-3.5 w-28">
                      Task ID
                    </th>
                    {/* 2. Workstream */}
                    <th scope="col" className="p-3.5 w-44">
                      Workstream
                    </th>
                    {/* 3. Task / Activity */}
                    <th scope="col" className="p-3.5 min-w-[240px]">
                      Task / Activity
                    </th>
                    {/* 4. Priority */}
                    <th scope="col" className="p-3.5 w-28">
                      Priority
                    </th>
                    {/* 5. EMPLOYEE COLUMN AFTER PRIORITY */}
                    <th scope="col" className="p-3.5 w-36">
                      Employee
                    </th>
                    {/* 6. Primary Responsible Person */}
                    <th scope="col" className="p-3.5 w-44">
                      Primary Responsible Person
                    </th>
                    {/* 7. Supporting Role */}
                    <th scope="col" className="p-3.5 w-40">
                      Supporting Role
                    </th>
                    {/* 8. Expected Deliverable */}
                    <th scope="col" className="p-3.5 min-w-[220px]">
                      Expected Deliverable
                    </th>
                    {/* 9. Target Date */}
                    <th scope="col" className="p-3.5 w-32">
                      Target Date
                    </th>
                    {/* 10. Status */}
                    <th scope="col" className="p-3.5 w-36">
                      Status
                    </th>
                    {/* 11. Remarks / Blockers */}
                    <th scope="col" className="p-3.5 min-w-[200px]">
                      Remarks / Blockers
                    </th>
                    {/* 12. Others */}
                    <th scope="col" className="p-3.5 w-24">
                      Others
                    </th>
                    {/* Actions */}
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
                        <td className="p-3.5 align-top font-mono text-xs font-bold text-slate-800">
                          <span className="rounded bg-slate-100 px-2 py-1 border border-slate-200">
                            {task.taskId}
                          </span>
                        </td>

                        {/* 2. Workstream */}
                        <td className="p-3.5 align-top">
                          <span
                            className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium ${getWorkstreamBadgeColor(
                              task.workstream
                            )}`}
                          >
                            {task.workstream}
                          </span>
                        </td>

                        {/* 3. Task / Activity */}
                        <td className="p-3.5 align-top">
                          <p className="font-medium text-gray-900 leading-snug">
                            {task.taskActivity}
                          </p>
                        </td>

                        {/* 4. Priority */}
                        <td className="p-3.5 align-top">
                          {getPriorityBadge(task.priority)}
                        </td>

                        {/* 5. EMPLOYEE COLUMN AFTER PRIORITY */}
                        <td className="p-3.5 align-top">
                          <div className="flex items-center gap-1.5">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700 border border-slate-200">
                              {task.employee.charAt(0).toUpperCase()}
                            </span>
                            <span className="font-semibold text-xs text-gray-800">
                              {task.employee}
                            </span>
                          </div>
                        </td>

                        {/* 6. Primary Responsible Person */}
                        <td className="p-3.5 align-top font-medium text-gray-800 text-xs">
                          {task.primaryResponsible}
                        </td>

                        {/* 7. Supporting Role */}
                        <td className="p-3.5 align-top text-gray-600 text-xs">
                          {task.supportingRole || <span className="text-gray-400">—</span>}
                        </td>

                        {/* 8. Expected Deliverable */}
                        <td className="p-3.5 align-top text-gray-700 text-xs leading-relaxed">
                          {task.expectedDeliverable || <span className="text-gray-400">—</span>}
                        </td>

                        {/* 9. Target Date */}
                        <td className="p-3.5 align-top text-xs font-medium text-gray-800 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            {formatDateDisplay(task.targetDate)}
                          </div>
                        </td>

                        {/* 10. Status */}
                        <td className="p-3.5 align-top">
                          <div className="relative inline-block">
                            <select
                              aria-label={`Change status for ${task.taskId}`}
                              value={task.status}
                              onChange={(e) =>
                                void handleStatusChange(task, e.target.value as TaskStatus)
                              }
                              className="appearance-none rounded-lg border border-gray-200 bg-white py-1 pl-2.5 pr-6 text-xs font-medium text-gray-800 shadow-2xs hover:border-gray-300 focus:border-blue-500 focus:outline-none cursor-pointer"
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

                        {/* 11. Remarks / Blockers */}
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

                        {/* 12. Others */}
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
        {/* EMPLOYEE & ADMIN LOGIN MODAL (WITH DROPDOWN & OWN PASSWORD)  */}
        {/* ============================================================ */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Sign In to Workspace
                    </h3>
                    <p className="text-xs text-gray-500">
                      Select role and enter credentials
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close modal"
                  onClick={() => setShowLoginModal(false)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handlePerformLogin} className="mt-4 space-y-3.5">
                {loginError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Dropdown: Role Selection (Admin or Employee) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Sign In As <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={modalLoginRole}
                    onChange={(e) => {
                      setModalLoginRole(e.target.value as "admin" | "employee");
                      setLoginError(null);
                      setModalPassword("");
                    }}
                    className={inputClass}
                  >
                    <option value="admin">Administrator (Superuser / Master View)</option>
                    <option value="employee">Employee (Private Workspace & Personal Tasks)</option>
                  </select>
                </div>

                {modalLoginRole === "admin" ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Admin ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={modalAdminId}
                      onChange={(e) => setModalAdminId(e.target.value)}
                      placeholder="admin"
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Select Employee Profile <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={modalEmployeeId}
                      onChange={(e) => {
                        setModalEmployeeId(e.target.value);
                        setLoginError(null);
                        setModalPassword("");
                      }}
                      className={inputClass}
                    >
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.name.toLowerCase()}>
                          {emp.name} — {emp.role} ({emp.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Password input with toggle */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {modalLoginRole === "admin" ? "Admin Password" : "Employee Password"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showModalPassword ? "text" : "password"}
                      required
                      value={modalPassword}
                      onChange={(e) => setModalPassword(e.target.value)}
                      placeholder={
                        modalLoginRole === "admin"
                          ? "Enter admin password"
                          : "Enter your employee password"
                      }
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowModalPassword((v) => !v)}
                      aria-label={showModalPassword ? "Hide password" : "Show password"}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      {showModalPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {modalLoginRole === "admin"
                      ? "Admin access unlocks master visibility across all 47 tasks."
                      : "Employee accounts show strictly the tasks assigned to that employee."}
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-purple-800 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In to Workspace
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* IMPORT TASKS MODAL (JUST SIDE OF EXPORT)                    */}
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
                      Import Operations Tasks (CSV)
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
                    <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                    <span>
                      Columns: <strong>Task ID, Workstream, Task / Activity, Priority, Employee, Primary Responsible, Supporting Role, Expected Deliverable, Target Date, Status, Remarks</strong>
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
                    placeholder={`"Task ID","Workstream","Task / Activity","Priority","Employee","Primary Responsible Person","Supporting Role","Expected Deliverable","Target Date","Status","Remarks","Others"\n"PD-048","Software & Operations","Build client portal","High","Disha","Software Developer","Project Manager","Portal MVP","2026-11-25","Not Started","",""`}
                    className={`${inputClass} font-mono text-xs`}
                  />
                  {importParsedCount !== null && (
                    <p className="mt-1 text-xs font-semibold text-green-700 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" />
                      Detected {importParsedCount} valid task {importParsedCount === 1 ? "row" : "rows"} ready to import.
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
                    <label className={`flex items-start gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${
                      importMode === "append" ? "border-blue-500 bg-blue-50/50" : "border-gray-200"
                    }`}>
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === "append"}
                        onChange={() => setImportMode("append")}
                        className="mt-0.5 text-blue-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-900">Append Tasks</span>
                        <p className="text-[11px] text-gray-500">Keep current tasks and append new rows</p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${
                      importMode === "replace" ? "border-amber-500 bg-amber-50/50" : "border-gray-200"
                    }`}>
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === "replace"}
                        onChange={() => setImportMode("replace")}
                        className="mt-0.5 text-amber-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-amber-900">Replace All</span>
                        <p className="text-[11px] text-gray-500">Overwrite existing tasks with this file</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteImport}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
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
        {/* ADD EMPLOYEE MODAL (CONFIGURED DISHA, SAIRAJ, SANIYA)        */}
        {/* ============================================================ */}
        {showEmployeeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Add Employee & Team Roster
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Register employees who can log in with their email to view their tasks
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close modal"
                  onClick={() => setShowEmployeeModal(false)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddEmployee} className="mt-4 space-y-4">
                <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900">
                    Register New Employee
                  </h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Employee Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newEmpName}
                        onChange={(e) => setNewEmpName(e.target.value)}
                        placeholder="e.g. Rahul"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Designation / Role <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newEmpRole}
                        onChange={(e) => setNewEmpRole(e.target.value)}
                        placeholder="e.g. Site Engineer"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Email Address (Used for Login) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={newEmpEmail}
                        onChange={(e) => setNewEmpEmail(e.target.value)}
                        placeholder="name@payaldecor.com"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Department
                      </label>
                      <select
                        value={newEmpDept}
                        onChange={(e) => setNewEmpDept(e.target.value)}
                        className={inputClass}
                      >
                        {WORKSTREAM_OPTIONS.map((ws) => (
                          <option key={ws} value={ws}>
                            {ws}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-purple-700 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-purple-800"
                    >
                      <UserPlus className="h-4 w-4" />
                      Add Employee
                    </button>
                  </div>
                </div>
              </form>

              {/* Configured Team Members */}
              <div className="mt-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Configured Active Team Members ({employees.length})
                </h4>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  {employees.map((emp) => {
                    const assignedCount = tasks.filter(
                      (t) => (t.employee || "").toLowerCase() === emp.name.toLowerCase()
                    ).length;
                    return (
                      <div
                        key={emp.id}
                        className="rounded-xl border border-gray-200 bg-white p-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-800 border border-purple-200">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">{emp.name}</p>
                            <p className="text-[10px] text-gray-500 truncate">{emp.email}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span className="text-gray-500">{emp.role}</span>
                          <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
                            {assignedCount} tasks
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex justify-end border-t pt-3">
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

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
                      placeholder="e.g. PD-048"
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Assigned Employee <span className="text-red-500">*</span>
                    </label>
                    {currentSession.isAdmin ? (
                      <select
                        required
                        value={form.employee}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, employee: e.target.value }))
                        }
                        className={`${inputClass} font-bold text-purple-900 bg-purple-50/50 border-purple-200`}
                      >
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.name}>
                            {emp.name} ({emp.role})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="rounded-lg border border-purple-200 bg-purple-50/50 px-3 py-2 text-sm font-bold text-purple-900">
                        {currentSession.name} (Locked to Logged In Account)
                      </div>
                    )}
                  </div>

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
                      placeholder="e.g. Software Developer"
                      className={inputClass}
                    />
                  </div>
                </div>

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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      placeholder="e.g. Project Manager"
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
                    placeholder="Deliverable details"
                    className={inputClass}
                  />
                </div>

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
                    placeholder="Note any delays or notes..."
                    className={inputClass}
                  />
                </div>

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
                  <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-3">
                    <span className="text-xs font-semibold text-purple-900">Assigned Employee</span>
                    <p className="mt-1 font-bold text-purple-950 flex items-center gap-1.5">
                      <User className="h-4 w-4 text-purple-700" />
                      {viewingTask.employee}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <span className="text-xs text-gray-500">Primary Responsible Person</span>
                    <p className="mt-1 font-semibold text-gray-900">
                      {viewingTask.primaryResponsible}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border p-3">
                    <span className="text-xs text-gray-500">Supporting Role</span>
                    <p className="mt-1 text-gray-800">
                      {viewingTask.supportingRole || "—"}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <span className="text-xs text-gray-500">Target Date</span>
                    <p className="mt-1 font-semibold text-gray-900">
                      {formatDateDisplay(viewingTask.targetDate)}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="rounded-lg border p-3">
                    <span className="text-xs text-gray-500">Expected Deliverable</span>
                    <p className="mt-1 text-gray-800">
                      {viewingTask.expectedDeliverable || "—"}
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
