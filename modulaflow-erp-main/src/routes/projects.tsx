import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/erp/AppShell";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
});

const API_BASE = (
  import.meta.env["VITE_API_URL"] || "http://localhost:5001/api"
).replace(/\/+$/, "");

type ProjectStatus = "Pending" | "InProgress" | "Completed";
type StatusFilter = "All" | ProjectStatus;

interface Project {
  id: string;
  name: string;
  customerId: string | null;
  customerName: string;
  site: string | null;
  projectLead: string | null;
  measuredArea: string | null;
  targetDate: string | null;
  progress: number;
  value: number;
  status: ProjectStatus;
  notes: string | null;
}

interface CustomerOption {
  id: string;
  name: string;
  company: string;
}

interface ProjectForm {
  name: string;
  customerId: string;
  site: string;
  projectLead: string;
  measuredArea: string;
  targetDate: string;
  progress: number;
  value: number;
  status: ProjectStatus;
  notes: string;
}

const emptyForm: ProjectForm = {
  name: "",
  customerId: "",
  site: "",
  projectLead: "",
  measuredArea: "",
  targetDate: "",
  progress: 0,
  value: 0,
  status: "Pending",
  notes: "",
};

const FILTERS: StatusFilter[] = ["All", "InProgress", "Pending", "Completed"];

const statusStyle: Record<ProjectStatus, string> = {
  Pending: "bg-amber-100 text-amber-800",
  InProgress: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
};

async function readResponse(response: Response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

function formatMoney(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [projectRes, customerRes] = await Promise.all([
        fetch(`${API_BASE}/projects`),
        fetch(`${API_BASE}/crm/customers`),
      ]);

      const projectData = await readResponse(projectRes);
      const customerData = await readResponse(customerRes);

      setProjects(projectData.projects ?? []);
      setCustomers(customerData.customers ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load projects.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projects.filter((project) => {
      if (statusFilter !== "All" && project.status !== statusFilter) {
        return false;
      }

      if (!query) return true;

      return [
        project.name,
        project.customerName,
        project.site,
        project.projectLead,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [projects, search, statusFilter]);

  function updateField<K extends keyof ProjectForm>(
    field: K,
    value: ProjectForm[K],
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function openCreateForm() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(project: Project) {
    setEditingId(project.id);
    setForm({
      name: project.name ?? "",
      customerId: project.customerId ?? "",
      site: project.site ?? "",
      projectLead: project.projectLead ?? "",
      measuredArea: project.measuredArea ?? "",
      targetDate: project.targetDate ? project.targetDate.slice(0, 10) : "",
      progress: Number(project.progress ?? 0),
      value: Number(project.value ?? 0),
      status: project.status ?? "Pending",
      notes: project.notes ?? "",
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const url = editingId
        ? `${API_BASE}/projects/${encodeURIComponent(editingId)}`
        : `${API_BASE}/projects`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          customerId: form.customerId,
          site: form.site,
          projectLead: form.projectLead,
          measuredArea: form.measuredArea,
          targetDate: form.targetDate || null,
          progress: Number(form.progress || 0),
          value: Number(form.value || 0),
          status: form.status,
          notes: form.notes,
        }),
      });

      await readResponse(response);
      setSuccess(editingId ? "Project updated." : "Project saved.");
      closeForm();
      setForm({ ...emptyForm });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save project.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(project: Project) {
    const confirmed = window.confirm(
      `Delete project "${project.name}"?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE}/projects/${encodeURIComponent(project.id)}`,
        { method: "DELETE" },
      );

      await readResponse(response);
      setSuccess("Project deleted.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete project.",
      );
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#7c4a1d] focus:ring-2 focus:ring-amber-100";

  const primaryButton =
    "inline-flex items-center gap-2 rounded-lg bg-[#7c4a1d] px-4 py-2 text-sm font-medium text-white hover:bg-[#6a3e18] disabled:opacity-60";

  return (
    <AppShell title="Projects">
      <div className="space-y-5 p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">Project workspace</p>
            <h1 className="text-2xl font-bold text-gray-900">All projects</h1>
          </div>

          <button type="button" onClick={openCreateForm} className={primaryButton}>
            <Plus className="h-4 w-4" />
            New project
          </button>
        </div>

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

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className={`${inputClass} pl-9`}
              placeholder="Search projects or clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  statusFilter === filter
                    ? "border-[#7c4a1d] bg-[#7c4a1d] text-white"
                    : "bg-white text-gray-800 hover:bg-gray-50"
                }`}
              >
                {filter}
              </button>
            ))}

            <button
              type="button"
              onClick={() => void loadData()}
              className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        <section className="overflow-hidden rounded-xl border bg-white">
          {loading ? (
            <p className="p-6 text-sm text-gray-500">Loading projects...</p>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-10 text-center">
              <Building2 className="h-10 w-10 text-gray-400" />
              <p className="font-semibold text-gray-900">No projects found</p>
              <p className="text-sm text-gray-500">
                {projects.length === 0
                  ? "No projects are available yet. Create a new project to get started."
                  : "No projects match this search or filter."}
              </p>
              {projects.length === 0 && (
                <button
                  type="button"
                  onClick={openCreateForm}
                  className={`${primaryButton} mt-2`}
                >
                  <Plus className="h-4 w-4" />
                  New project
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-3">Project</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Site</th>
                    <th className="p-3">Lead</th>
                    <th className="p-3">Target date</th>
                    <th className="p-3">Progress</th>
                    <th className="p-3">Value</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{project.name}</td>
                      <td className="p-3">{project.customerName || "—"}</td>
                      <td className="p-3">{project.site || "—"}</td>
                      <td className="p-3">{project.projectLead || "—"}</td>
                      <td className="p-3">{formatDate(project.targetDate)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-[#7c4a1d]"
                              style={{
                                width: `${Math.min(100, Math.max(0, project.progress))}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">
                            {project.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3">{formatMoney(project.value)}</td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${statusStyle[project.status] ?? "bg-gray-100"}`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(project)}
                            aria-label="Edit project"
                            className="rounded p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteProject(project)}
                            aria-label="Delete project"
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
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
          <section className="my-8 w-full max-w-3xl rounded-xl border bg-white p-4 shadow-xl md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit project" : "New project"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Close form"
                className="rounded p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm md:col-span-2">
                  <span>Project name *</span>
                  <input
                    className={inputClass}
                    required
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Customer (from CRM) *</span>
                  <select
                    className={inputClass}
                    required
                    value={form.customerId}
                    onChange={(e) => updateField("customerId", e.target.value)}
                  >
                    <option value="">Select customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                        {customer.company ? ` — ${customer.company}` : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span>Site / location</span>
                  <input
                    className={inputClass}
                    value={form.site}
                    onChange={(e) => updateField("site", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Project lead</span>
                  <input
                    className={inputClass}
                    value={form.projectLead}
                    onChange={(e) => updateField("projectLead", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Measured area</span>
                  <input
                    className={inputClass}
                    placeholder="e.g. 1200 sq.ft"
                    value={form.measuredArea}
                    onChange={(e) =>
                      updateField("measuredArea", e.target.value)
                    }
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Target date</span>
                  <input
                    className={inputClass}
                    type="date"
                    value={form.targetDate}
                    onChange={(e) => updateField("targetDate", e.target.value)}
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Project value (₹)</span>
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    value={form.value}
                    onChange={(e) =>
                      updateField("value", Number(e.target.value))
                    }
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span>Status</span>
                  <select
                    className={inputClass}
                    value={form.status}
                    onChange={(e) =>
                      updateField("status", e.target.value as ProjectStatus)
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="InProgress">InProgress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </label>

                <label className="space-y-1 text-sm md:col-span-2">
                  <span>Progress: {form.progress}%</span>
                  <input
                    className="w-full"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={form.progress}
                    onChange={(e) =>
                      updateField("progress", Number(e.target.value))
                    }
                  />
                </label>
              </div>

              <label className="block space-y-1 text-sm">
                <span>Notes</span>
                <textarea
                  className={inputClass}
                  rows={3}
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <button type="submit" disabled={saving} className={primaryButton}>
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update project"
                      : "Save project"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border px-5 py-2 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </AppShell>
  );
}