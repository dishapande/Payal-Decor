import { useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, ArrowRight, ShieldCheck, UserCheck, Lock } from "lucide-react";
import {
  loginAdmin,
  loginEmployee,
  isLoggedIn,
  getEmployeeAccounts,
  type EmployeeAccount,
} from "@/lib/auth";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (isLoggedIn()) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loginRole, setLoginRole] = useState<"admin" | "employee">("admin");
  const [adminId, setAdminId] = useState("admin");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("gaurav");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const employees: EmployeeAccount[] = getEmployeeAccounts();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (loginRole === "admin") {
      if (!adminId.trim() || !password) {
        setError("Please enter your Admin ID and password.");
        return;
      }

      const res = loginAdmin(adminId, password);
      if (!res.success) {
        setError(res.error || "Admin ID or password is incorrect.");
        return;
      }

      navigate({ to: "/" });
    } else {
      if (!selectedEmployeeId || !password) {
        setError("Please select an employee and enter your password.");
        return;
      }

      const res = loginEmployee(selectedEmployeeId, password);
      if (!res.success) {
        setError(res.error || "Incorrect employee password.");
        return;
      }

      // Route employee directly to their private tasks in the Operations module
      navigate({ to: "/operations" });
    }
  };

  const currentEmployee = employees.find((e) => e.id === selectedEmployeeId) || employees[0];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF7F4] px-4 py-10">
      <div className="w-full max-w-[460px] rounded-2xl border border-[#EADFD5] bg-white p-8 shadow-[0_10px_40px_rgba(60,35,10,0.08)] sm:p-10">
        <div className="mb-6 flex justify-center">
          <img
            src="/payal-decor-logo.png"
            alt="Payal Decor"
            className="h-20 w-auto object-contain"
          />
        </div>

        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-semibold text-[#1F1710]">Sign in to ERP</h1>
          <p className="mt-1 text-sm text-[#7A6A5C]">
            Select your role to access your assigned tasks and workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {/* 1. Dropdown: Login As (Admin or Employee) */}
          <div>
            <label
              htmlFor="login-role"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#1F1710]"
            >
              Sign In As <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="login-role"
                value={loginRole}
                onChange={(e) => {
                  const val = e.target.value as "admin" | "employee";
                  setLoginRole(val);
                  setError("");
                  setPassword("");
                }}
                className="h-11 w-full rounded-lg border border-[#E3D6CA] bg-white px-3 pr-8 text-sm font-medium text-[#1F1710] outline-none transition focus:border-[#B05A00] focus:ring-2 focus:ring-[#B05A00]/20 cursor-pointer"
              >
                <option value="admin">Administrator (Superuser / Full Access)</option>
                <option value="employee">Employee (Private Workspace & Assigned Tasks)</option>
              </select>
            </div>
          </div>

          {/* 2. ADMIN FIELDS (Preserves existing implemented Admin password) */}
          {loginRole === "admin" ? (
            <div>
              <label
                htmlFor="admin-id"
                className="mb-1.5 block text-xs font-semibold text-[#1F1710]"
              >
                Admin ID
              </label>
              <div className="relative">
                <input
                  id="admin-id"
                  type="text"
                  autoComplete="username"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="admin"
                  className="h-11 w-full rounded-lg border border-[#E3D6CA] bg-white px-3 text-sm text-[#1F1710] outline-none transition placeholder:text-[#B5A698] focus:border-[#B05A00] focus:ring-2 focus:ring-[#B05A00]/20 font-mono"
                />
              </div>
            </div>
          ) : (
            /* 3. EMPLOYEE FIELDS (Dropdown with individual profiles & separate passwords) */
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="employee-select"
                  className="mb-1.5 block text-xs font-semibold text-[#1F1710]"
                >
                  Select Your Employee Profile <span className="text-red-500">*</span>
                </label>
                <select
                  id="employee-select"
                  value={selectedEmployeeId}
                  onChange={(e) => {
                    setSelectedEmployeeId(e.target.value);
                    setError("");
                    setPassword("");
                  }}
                  className="h-11 w-full rounded-lg border border-[#E3D6CA] bg-white px-3 text-sm font-semibold text-[#1F1710] outline-none transition focus:border-[#B05A00] focus:ring-2 focus:ring-[#B05A00]/20 cursor-pointer"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {emp.role} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Employee Preview Badge */}
              {currentEmployee && (
                <div className="rounded-lg border border-purple-200 bg-purple-50/60 p-3 text-xs text-purple-950 flex items-center justify-between">
                  <div>
                    <p className="font-bold">{currentEmployee.name} ({currentEmployee.role})</p>
                    <p className="text-[11px] text-purple-700">{currentEmployee.email}</p>
                  </div>
                  <span className="rounded-md bg-purple-200/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-900">
                    Task Isolation
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 4. Password Field */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#1F1710]"
              >
                {loginRole === "admin" ? "Admin Password" : `${currentEmployee?.name || "Employee"} Password`} <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  loginRole === "admin"
                    ? "Enter admin password"
                    : `Enter password for ${currentEmployee?.name || "employee"}`
                }
                className="h-11 w-full rounded-lg border border-[#E3D6CA] bg-white px-3 pr-11 text-sm text-[#1F1710] outline-none transition placeholder:text-[#B5A698] focus:border-[#B05A00] focus:ring-2 focus:ring-[#B05A00]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-[#7A6A5C] hover:text-[#1F1710]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#B05A00] text-sm font-semibold text-white transition hover:bg-[#954C00] focus:outline-none focus:ring-2 focus:ring-[#B05A00]/40 focus:ring-offset-2 shadow-xs"
          >
            {loginRole === "admin" ? (
              <>
                <ShieldCheck size={16} />
                Sign in as Administrator
              </>
            ) : (
              <>
                <UserCheck size={16} />
                Sign in as {currentEmployee?.name || "Employee"}
              </>
            )}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 border-t border-[#EADFD5] pt-4 text-center">
          <p className="text-[11px] text-[#7A6A5C]">
            {loginRole === "admin"
              ? "🛡️ Admin sees all 47 master tasks across all employees."
              : `🔒 Employees can only view tasks assigned to them.`}
          </p>
        </div>
      </div>
    </div>
  );
}
export default LoginPage;
