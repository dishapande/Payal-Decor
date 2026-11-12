// Authentication helper for Payal Decor ERP.
// Supports Admin login (existing password: payal@123)
// and Individual Employee login with their own passwords.

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  isAdmin: boolean;
}

export interface EmployeeAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  password: string;
}

// Configured employees with their own private passwords
export const INITIAL_EMPLOYEE_ACCOUNTS: EmployeeAccount[] = [
  {
    id: "gaurav",
    name: "Gaurav",
    email: "gaurav@payaldecor.com",
    role: "Project Manager",
    department: "Operations & Project Control",
    password: "gaurav@123",
  },
  {
    id: "disha",
    name: "Disha",
    email: "disha@payaldecor.com",
    role: "Software Developer",
    department: "Software & Operations",
    password: "disha@123",
  },
  {
    id: "sairaj",
    name: "Sairaj",
    email: "sairaj@payaldecor.com",
    role: "Operations & Production",
    department: "Production & Site",
    password: "sairaj@123",
  },
  {
    id: "saniya",
    name: "Saniya",
    email: "saniya@payaldecor.com",
    role: "Design & Documentation",
    department: "Design & CAD",
    password: "saniya@123",
  },
];

const ADMIN_ID = "admin";
const ADMIN_PASSWORD = "payal@123"; // Existing implemented admin password (preserved untouched)

const AUTH_KEY = "payal_decor_admin_auth";
const CURRENT_USER_KEY = "payal_decor_current_user";
const OPERATIONS_AUTH_KEY = "payal_decor_operations_auth_user_v4";
const EMPLOYEES_STORAGE_KEY = "payal_decor_employees_v4";

// Retrieve active employee roster (base + any dynamic user-added)
export function getEmployeeAccounts(): EmployeeAccount[] {
  if (typeof window === "undefined") return INITIAL_EMPLOYEE_ACCOUNTS;
  try {
    const stored = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const baseNames = new Set(INITIAL_EMPLOYEE_ACCOUNTS.map((e) => e.name.toLowerCase()));
        const custom: EmployeeAccount[] = [];
        for (const item of parsed) {
          if (!baseNames.has((item.name || "").toLowerCase())) {
            custom.push({
              id: item.id || (item.name || "").toLowerCase(),
              name: item.name,
              email: item.email || `${(item.name || "").toLowerCase()}@payaldecor.com`,
              role: item.role || "Employee",
              department: item.department || "General",
              password: item.password || `${(item.name || "").toLowerCase()}@123`,
            });
          }
        }
        return [...INITIAL_EMPLOYEE_ACCOUNTS, ...custom];
      }
    }
  } catch {
    // fallback
  }
  return INITIAL_EMPLOYEE_ACCOUNTS;
}

// Save active session in both sessionStorage and operations localStorage
function saveSession(user: AuthUser) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(AUTH_KEY, "true");
  sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  try {
    localStorage.setItem(OPERATIONS_AUTH_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

// Admin login verification (using existing implemented credentials)
export function loginAdmin(id: string, password: string): { success: boolean; error?: string; user?: AuthUser } {
  if (id.trim().toLowerCase() !== ADMIN_ID || password !== ADMIN_PASSWORD) {
    return { success: false, error: "Admin ID or password is incorrect." };
  }
  const user: AuthUser = {
    id: "admin",
    name: "Admin",
    email: "admin@payaldecor.com",
    role: "System Administrator",
    isAdmin: true,
  };
  saveSession(user);
  return { success: true, user };
}

// Employee login verification (using individual employee passwords)
export function loginEmployee(
  employeeIdentifier: string,
  password: string
): { success: boolean; error?: string; user?: AuthUser } {
  const cleanId = employeeIdentifier.trim().toLowerCase();
  const accounts = getEmployeeAccounts();

  const found = accounts.find(
    (acc) =>
      acc.id.toLowerCase() === cleanId ||
      acc.name.toLowerCase() === cleanId ||
      acc.email.toLowerCase() === cleanId
  );

  if (!found) {
    return { success: false, error: "Employee account not found. Please select a valid employee." };
  }

  if (password !== found.password) {
    return {
      success: false,
      error: `Incorrect password for ${found.name}. Please enter your employee password.`,
    };
  }

  const user: AuthUser = {
    id: found.id,
    name: found.name,
    email: found.email,
    role: found.role,
    department: found.department,
    isAdmin: false,
  };
  saveSession(user);
  return { success: true, user };
}

// Universal login wrapper for backward compatibility
export function login(id: string, password: string, loginType: "admin" | "employee" = "admin"): boolean {
  if (loginType === "admin") {
    return loginAdmin(id, password).success;
  }
  return loginEmployee(id, password).success;
}

export function logout() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(CURRENT_USER_KEY);
  try {
    localStorage.removeItem(OPERATIONS_AUTH_KEY);
  } catch {
    // ignore
  }
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CURRENT_USER_KEY);
    if (raw) return JSON.parse(raw);
    const opRaw = localStorage.getItem(OPERATIONS_AUTH_KEY);
    if (opRaw) return JSON.parse(opRaw);
  } catch {
    // ignore
  }
  return null;
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(AUTH_KEY) === "true";
}
