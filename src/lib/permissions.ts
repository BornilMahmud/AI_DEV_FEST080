import { NavigationPage } from "@/types";

export type AppRole = "CUSTOMER" | "ANALYST" | "ADMIN" | "INVESTIGATOR" | "VIEWER";

/**
 * Role-Based Access Control (RBAC) Mapping
 * Ensures each role only sees the dashboards and tasks appropriate for their permissions.
 * Customers are strictly restricted from fraud risk management and administrative consoles.
 */
export const ROLE_PERMISSIONS: Record<AppRole, NavigationPage[]> = {
  CUSTOMER: [
    "customer-portal",
  ],
  ANALYST: [
    "overview",
    "transactions",
    "risk",
    "network",
    "alerts",
    "investigations",
    "investigation",
    "customers",
    "analytics",
    "customer-portal",
  ],
  INVESTIGATOR: [
    "overview",
    "transactions",
    "network",
    "alerts",
    "investigations",
    "investigation",
    "customers",
    "analytics",
    "customer-portal",
  ],
  VIEWER: [
    "overview",
    "transactions",
    "alerts",
    "customer-portal",
  ],
  ADMIN: [
    "overview",
    "transactions",
    "risk",
    "network",
    "alerts",
    "security",
    "investigations",
    "investigation",
    "customers",
    "audit",
    "models",
    "datasets",
    "system-health",
    "analytics",
    "customer-portal",
  ],
};

/**
 * Normalize role string from authentication payloads or storage
 */
export const normalizeRole = (role?: string): AppRole => {
  if (!role) return "CUSTOMER";
  const upper = role.toUpperCase();
  if (upper === "ADMIN" || upper.includes("ADMIN")) return "ADMIN";
  if (upper === "ANALYST" || upper.includes("ANALYST")) return "ANALYST";
  if (upper === "INVESTIGATOR" || upper.includes("INVESTIGATOR")) return "INVESTIGATOR";
  if (upper === "VIEWER") return "VIEWER";
  return "CUSTOMER";
};

/**
 * Check if the given role is allowed to access the specified page
 */
export const canAccessPage = (role: string | undefined, page: NavigationPage): boolean => {
  const norm = normalizeRole(role);
  const allowedPages = ROLE_PERMISSIONS[norm] || ROLE_PERMISSIONS.CUSTOMER;
  return allowedPages.includes(page);
};

/**
 * Get default starting page for a given role upon login
 */
export const getDefaultPageForRole = (role: string | undefined): NavigationPage => {
  const norm = normalizeRole(role);
  if (norm === "CUSTOMER") {
    return "customer-portal";
  }
  return "overview";
};

/**
 * Check if user is an authorized risk manager (Analyst, Investigator, or Admin)
 */
export const isRiskManager = (role: string | undefined): boolean => {
  const norm = normalizeRole(role);
  return norm === "ADMIN" || norm === "ANALYST" || norm === "INVESTIGATOR";
};

/**
 * Check if user is a system administrator
 */
export const isSystemAdmin = (role: string | undefined): boolean => {
  const norm = normalizeRole(role);
  return norm === "ADMIN";
};

/**
 * Human-readable role descriptions and badges
 */
export const getRoleMeta = (role: string | undefined) => {
  const norm = normalizeRole(role);
  switch (norm) {
    case "CUSTOMER":
      return {
        labelEn: "Upay MFS Customer",
        labelBn: "গ্রাহক ওয়ালেট ব্যবহারকারী",
        badge: "CUSTOMER WALLET",
        color: "blue",
      };
    case "ANALYST":
      return {
        labelEn: "Fraud Risk Analyst (SOC)",
        labelBn: "জালিয়াতি ঝুঁকি বিশ্লেষক",
        badge: "RISK ANALYST",
        color: "emerald",
      };
    case "INVESTIGATOR":
      return {
        labelEn: "Financial Crime Investigator",
        labelBn: "আর্থিক অপরাধ তদন্তকারী",
        badge: "INVESTIGATOR",
        color: "amber",
      };
    case "ADMIN":
      return {
        labelEn: "System Administrator",
        labelBn: "সিস্টেম অ্যাডমিনিস্ট্রেটর",
        badge: "SYSTEM ADMIN",
        color: "purple",
      };
    default:
      return {
        labelEn: "Verified User",
        labelBn: "অনুমোদিত ব্যবহারকারী",
        badge: "VERIFIED USER",
        color: "slate",
      };
  }
};
