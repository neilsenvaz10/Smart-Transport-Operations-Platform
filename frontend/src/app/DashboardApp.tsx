import { useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useVehicles } from "./hooks/useVehicles";
import { useDrivers } from "./hooks/useDrivers";
import { useTrips } from "./hooks/useTrips";
import { authService } from "./services/authService";
import {
  LayoutDashboard, Truck, Users, Wrench, Fuel, BarChart3, Settings,
  Search, Bell, ChevronDown, ChevronLeft, ChevronRight, Plus, Download,
  Eye, Edit2, Trash2, CheckCircle, Clock, AlertTriangle, Calendar,
  TrendingUp, TrendingDown, Activity, LogOut, ArrowRight, DollarSign,
  Navigation, X, RefreshCw, Zap, Shield, MapPin,
} from "lucide-react";

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useAuth } from "../lib/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  version: string;
}

async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

function HealthBadge() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    retry: 3,
    refetchInterval: 30_000,
  });

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 12px",
    borderRadius: "9999px",
    fontSize: "0.8rem",
    fontWeight: 500,
  };

  if (isLoading) {
    return (
      <span style={{ ...baseStyle, background: "#f1f5f9", color: "#64748b" }} className="animate-pulse">
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#64748b" }} />
        Checking APIΓÇª
      </span>
    );
  }

  if (isError) {
    return (
      <span style={{ ...baseStyle, background: "#FEE2E2", color: "#B91C1C" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444" }} />
        API Offline
      </span>
    );
  }

  return (
    <span style={{ ...baseStyle, background: "#D1FAE5", color: "#065F46" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
      API {data?.status}
    </span>
  );
}

function cn(...c: (string | false | undefined | null)[]): string {
  return c.filter(Boolean).join(" ");
}


// ΓöÇΓöÇΓöÇ DATA ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

import { createContext, useContext, useEffect } from "react";

type Screen = "dashboard" | "vehicles" | "drivers" | "dispatch" | "maintenance" | "fuel" | "reports" | "settings";

const TODAY = new Date("2025-01-15");


// ΓöÇΓöÇΓöÇ DATA ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

const fuelChartData = [
  { week: "W48", mpg: 7.2, target: 8.0 }, { week: "W49", mpg: 7.8, target: 8.0 },
  { week: "W50", mpg: 7.5, target: 8.0 }, { week: "W51", mpg: 8.1, target: 8.0 },
  { week: "W52", mpg: 7.9, target: 8.0 }, { week: "W01", mpg: 8.4, target: 8.0 },
  { week: "W02", mpg: 8.2, target: 8.0 },
];

const utilizationChartData = [
  { month: "Aug", pct: 68 }, { month: "Sep", pct: 72 }, { month: "Oct", pct: 75 },
  { month: "Nov", pct: 71 }, { month: "Dec", pct: 69 }, { month: "Jan", pct: 78 },
];

// const roiChartData = [
//   { vehicle: "V-002", roi: 34 }, { vehicle: "V-005", roi: 28 },
//   { vehicle: "V-008", roi: 31 }, { vehicle: "V-001", roi: 22 },
//   { vehicle: "V-004", roi: 19 },
// ];

const opCostChartData = [
  { month: "Aug", fuel: 8200, maintenance: 1500, tolls: 890 },
  { month: "Sep", fuel: 9100, maintenance: 2200, tolls: 1020 },
  { month: "Oct", fuel: 8750, maintenance: 1800, tolls: 950 },
  { month: "Nov", fuel: 7900, maintenance: 3400, tolls: 780 },
  { month: "Dec", fuel: 8400, maintenance: 1200, tolls: 860 },
  { month: "Jan", fuel: 9200, maintenance: 4050, tolls: 1140 },
];

interface FleetContextType {
  vehicles: any[];
  setVehicles: React.Dispatch<React.SetStateAction<any[]>>;
  createVehicle: (newVehicle: any) => void;
  updateVehicle: (payload: { id: string; data: any }) => void;
  deleteVehicle: (id: string) => void;
  drivers: any[];
  setDrivers: React.Dispatch<React.SetStateAction<any[]>>;
  createDriver: (newDriver: any) => void;
  updateDriver: (payload: { id: string; data: any }) => void;
  deleteDriver: (id: string) => void;
  trips: any[];
  setTrips: React.Dispatch<React.SetStateAction<any[]>>;
  createTrip: (newTrip: any) => void;
  updateTrip: (payload: { id: string; data: any }) => void;
  deleteTrip: (id: string) => void;
  maintenance: any[];
  setMaintenance: React.Dispatch<React.SetStateAction<any[]>>;
  fuelLogs: any[];
  setFuelLogs: React.Dispatch<React.SetStateAction<any[]>>;
  expenses: any[];
  setExpenses: React.Dispatch<React.SetStateAction<any[]>>;
  role: "admin" | "manager" | "dispatcher" | "viewer";
  setRole: (r: "admin" | "manager" | "dispatcher" | "viewer") => void;
  currentUser: { name: string; roleName: string; email?: string; phone?: string; dept?: string };
  setCurrentUser: (u: any) => void;
}

const FleetContext = createContext<FleetContextType | null>(null);

function useFleet() {
  const ctx = useContext(FleetContext);
  if (!ctx) throw new Error("useFleet must be used within FleetProvider");
  return ctx;
}

function FleetProvider({ children, role, setRole }: { children: React.ReactNode, role: any, setRole: any }) {
  const queryClient = useQueryClient();
  const { vehicles, createVehicle, updateVehicle, deleteVehicle } = useVehicles();
  const { drivers, createDriver, updateDriver, deleteDriver } = useDrivers();
  const { trips, createTrip, updateTrip, deleteTrip } = useTrips();

  // The legacy screens mutate these collections via setVehicles(prev => ...).
  // We funnel those through React Query's setQueryData so the cache stays
  // the single source of truth and other consumers re-render correctly.
  const setVehicles: React.Dispatch<React.SetStateAction<any[]>> = (updater) => {
    queryClient.setQueryData<any[]>(['vehicles'], (prev) =>
      typeof updater === 'function' ? (updater as (p: any[] | undefined) => any[])(prev ?? []) : updater
    );
  };
  const setDrivers: React.Dispatch<React.SetStateAction<any[]>> = (updater) => {
    queryClient.setQueryData<any[]>(['drivers'], (prev) =>
      typeof updater === 'function' ? (updater as (p: any[] | undefined) => any[])(prev ?? []) : updater
    );
  };
  const setTrips: React.Dispatch<React.SetStateAction<any[]>> = (updater) => {
    queryClient.setQueryData<any[]>(['trips'], (prev) =>
      typeof updater === 'function' ? (updater as (p: any[] | undefined) => any[])(prev ?? []) : updater
    );
  };

  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [fuelLogs, setFuelLogs] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  // Seed current user from JWT stored by authService
  const loggedInUser = authService.getUser();
  const [currentUser, setCurrentUser] = useState({
    name: loggedInUser?.name ?? "User",
    roleName: loggedInUser?.role ?? "DISPATCHER",
    email: loggedInUser?.email ?? "",
    phone: "",
    dept: "Fleet Operations",
  });

  useEffect(() => {
    const roleLabels: Record<string, string> = {
      admin: "Fleet Admin",
      manager: "Fleet Manager",
      dispatcher: "Dispatcher",
      viewer: "Viewer",
    };
    setCurrentUser(u => ({ ...u, roleName: (roleLabels[role] ?? "ADMIN") as "ADMIN" | "MANAGER" | "DISPATCHER" }));
  }, [role]);

  return (
<FleetContext.Provider value={{
      vehicles,
      setVehicles,
      createVehicle,
      updateVehicle,
      deleteVehicle,
      drivers,
      setDrivers,
      createDriver,
      updateDriver,
      deleteDriver,
      trips,
      setTrips,
      createTrip,
      updateTrip,
      deleteTrip,
      maintenance,
      setMaintenance,
      fuelLogs,
      setFuelLogs,
      expenses,
      setExpenses,
      role,
      setRole,
      currentUser,
      setCurrentUser,
    }}>
      {children}
    </FleetContext.Provider>
  );
}

// ΓöÇΓöÇΓöÇ UI PRIMITIVES ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

const statusMap: Record<string, { bg: string; text: string; dot: string }> = {
  available:     { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
  "on-trip":     { bg: "bg-blue-50",     text: "text-blue-700",    dot: "bg-blue-500" },
  on_trip:       { bg: "bg-blue-50",     text: "text-blue-700",    dot: "bg-blue-500" },
  "in-shop":     { bg: "bg-orange-50",   text: "text-orange-700",  dot: "bg-orange-500" },
  in_shop:       { bg: "bg-orange-50",   text: "text-orange-700",  dot: "bg-orange-500" },
  retired:       { bg: "bg-slate-100",   text: "text-slate-500",   dot: "bg-slate-400" },
  "in-progress": { bg: "bg-blue-50",     text: "text-blue-700",    dot: "bg-blue-500" },
  pending:       { bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-500" },
  completed:     { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
  cancelled:     { bg: "bg-red-50",      text: "text-red-700",     dot: "bg-red-400" },
  draft:         { bg: "bg-slate-100",   text: "text-slate-500",   dot: "bg-slate-400" },
  dispatched:    { bg: "bg-blue-50",     text: "text-blue-700",    dot: "bg-blue-500" },
  active:        { bg: "bg-blue-50",     text: "text-blue-700",    dot: "bg-blue-500" },
  closed:        { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
  "on-duty":     { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
  "off-duty":    { bg: "bg-slate-100",   text: "text-slate-500",   dot: "bg-slate-400" },
  scheduled:     { bg: "bg-violet-50",   text: "text-violet-700",  dot: "bg-violet-500" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusMap[status] ?? { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" };
  const label = status.split(/[-_]/).map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", cfg.bg, cfg.text)}>
      <span className={cn("size-1.5 rounded-full shrink-0", cfg.dot)} />
      {label}
    </span>
  );
}

function SafetyBadge({ score }: { score: number }) {
  const cls = score >= 95 ? "bg-emerald-50 text-emerald-700"
    : score >= 90 ? "bg-blue-50 text-blue-700"
    : score >= 80 ? "bg-amber-50 text-amber-700"
    : "bg-red-50 text-red-700";
  return <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tabular-nums", cls)}>{score}<span className="font-normal text-current opacity-50 ml-0.5">/100</span></span>;
}

function ExpiryBadge({ expiry }: { expiry: string }) {
  if (!expiry) return <span className="text-xs text-slate-400">ΓÇö</span>;
  const days = Math.ceil((new Date(expiry).getTime() - TODAY.getTime()) / 86400000);
  const formatted = new Date(expiry).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  
  if (days <= 0) {
    return <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold"><AlertTriangle size={10} /> Expired ({formatted})</span>;
  }
  if (days <= 30) {
    return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-bold"><AlertTriangle size={10} /> Expiring ({formatted})</span>;
  }

  return (
    <span className="text-xs font-medium text-slate-600">
      {formatted}
    </span>
  );
}

function KPICard({ label, value, icon: Icon, trend, trendValue, color }: {
  label: string; value: string | number; icon: React.ElementType;
  trend?: "up" | "down" | "neutral"; trendValue?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide leading-none">{label}</p>
          <p className="mt-2.5 text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
          {trendValue && (
            <p className={cn("mt-1.5 text-xs flex items-center gap-1 font-medium",
              trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-slate-400")}>
              {trend === "up" && <TrendingUp size={11} />}
              {trend === "down" && <TrendingDown size={11} />}
              {trendValue}
            </p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-xl shrink-0", color)}>
          <Icon size={17} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ value, max, color = "bg-blue-500" }: { value: number; max: number; color?: string }) {
  const pct = max === 0 ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={10} />{error}</p>}
    </div>
  );
}

const ic = "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={15} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const sz = size === "lg" ? "size-14" : size === "md" ? "size-9" : "size-7";
  const tx = size === "lg" ? "text-lg" : size === "md" ? "text-sm" : "text-[10px]";
  return (
    <div className={cn("rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0", sz)}>
      <span className={cn("font-bold text-white", tx)}>{initials}</span>
    </div>
  );
}

// ΓöÇΓöÇΓöÇ NAVIGATION CONFIG ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

const navItems = [
  { id: "dashboard" as Screen, label: "Dashboard", Icon: LayoutDashboard, path: "/dashboard" },
  { id: "vehicles" as Screen,  label: "Vehicles",   Icon: Truck,           path: "/vehicles" },
  { id: "drivers" as Screen,   label: "Drivers",    Icon: Users,           path: "/drivers" },
  { id: "dispatch" as Screen,  label: "Trip Dispatch", Icon: Navigation,   path: "/dispatch" },
  { id: "maintenance" as Screen, label: "Maintenance", Icon: Wrench,       path: "/maintenance" },
  { id: "fuel" as Screen,      label: "Fuel & Expenses", Icon: Fuel,       path: "/fuel" },
  { id: "reports" as Screen,   label: "Reports",    Icon: BarChart3,       path: "/reports" },
  { id: "settings" as Screen,  label: "Settings",   Icon: Settings,        path: "/settings" },
];

const pageMeta: Record<Screen, { title: string; sub: string }> = {
  dashboard:   { title: "Dashboard", sub: "Overview of your fleet operations" },
  vehicles:    { title: "Vehicle Registry", sub: "Manage and track your fleet inventory" },
  drivers:     { title: "Driver Management", sub: "Monitor driver performance and compliance" },
  dispatch:    { title: "Trip Dispatch", sub: "Create and assign new trip assignments" },
  maintenance: { title: "Maintenance", sub: "Track vehicle service and repairs" },
  fuel:        { title: "Fuel & Expenses", sub: "Monitor fuel consumption and operational costs" },
  reports:     { title: "Reports & Analytics", sub: "Performance insights and operational analytics" },
  settings:    { title: "Settings & RBAC", sub: "Configure system settings and access control" },
};

function Sidebar({ screen, setScreen, collapsed, onToggle }: {
  screen: Screen; setScreen: (s: Screen) => void; collapsed: boolean; onToggle: () => void;
}) {
  const { currentUser, role } = useFleet();
  const { user, logout } = useAuth();

  const allowedItems = navItems.filter(item => {
    if (item.id === "reports" && role === "dispatcher") return false;
    if (item.id === "settings" && role !== "admin") return false;
    return true;
  });

  const formatRole = (r: string) => {
    return r
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <aside className={cn(
      "flex flex-col h-full bg-slate-900 transition-all duration-300 shrink-0",
      collapsed ? "w-[60px]" : "w-[220px]"
    )}>
      {/* Logo */}
      <div className={cn("flex items-center gap-3 border-b border-slate-800 shrink-0", collapsed ? "px-3 py-[18px] justify-center" : "px-4 py-[18px]")}>
        <div className="size-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30">
          <Truck size={15} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-white tracking-tight leading-none">TransitOps</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Fleet Platform</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto px-2 space-y-0.5">
        {allowedItems.map(({ id, label, Icon }) => {
          const active = screen === id;
          return (
            <button key={id} onClick={() => setScreen(id)} title={collapsed ? label : undefined}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 no-underline",
                collapsed && "justify-center px-2",
                active ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              )}>
              <Icon size={15} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-800 p-2 space-y-1 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2 py-2">
            <Avatar name={user?.name || currentUser.name} />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-slate-200 truncate leading-none">{user?.name || currentUser.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{user ? formatRole(user.role) : currentUser.roleName}</p>
            </div>
            <button onClick={logout} className="p-1 hover:bg-slate-800 rounded transition-colors" title="Log out">
              <LogOut size={12} className="text-slate-500" />
            </button>
          </div>
        )}
        <button onClick={onToggle}
          className={cn("w-full flex items-center justify-center py-2 hover:bg-slate-800 rounded-lg transition-colors", collapsed && "py-2.5")}>
          {collapsed
            ? <ChevronRight size={13} className="text-slate-500" />
            : <ChevronLeft size={13} className="text-slate-500" />}
        </button>
      </div>
    </aside>
  );
}

// ΓöÇΓöÇΓöÇ TOP NAV ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

function TopNav({ screen }: { screen: Screen }) {
  const { title, sub } = pageMeta[screen];
  const { currentUser } = useFleet();
  const { user } = useAuth();

  const displayName = user?.name || currentUser.name;

  return (
    <header className="h-[60px] bg-white border-b border-slate-100 flex items-center px-6 gap-4 shrink-0">
      <div className="flex-1 min-w-0">
        <h1 className="text-[14px] font-semibold text-slate-900 leading-none">{title}</h1>
        <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
      </div>
      <div className="flex items-center gap-2.5">
        <HealthBadge />
        <div className="relative hidden md:block">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search anythingΓÇª"
            className="pl-8 pr-4 py-2 text-[13px] border border-slate-200 rounded-lg bg-slate-50 w-52 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all" />
        </div>
        <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell size={15} className="text-slate-500" />
          <span className="absolute top-1.5 right-1.5 size-1.5 bg-red-500 rounded-full" />
        </button>
        <button className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
          <Avatar name={displayName} />
          <span className="text-[13px] font-medium text-slate-700 hidden md:block">{displayName}</span>
          <ChevronDown size={11} className="text-slate-400" />
        </button>
      </div>
    </header>
  );
}

// ΓöÇΓöÇΓöÇ TABLE HEADER ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

function TH({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
      {children}
    </th>
  );
}

function TD({ children, className, colSpan }: { children?: React.ReactNode; className?: string; colSpan?: number }) {
  return <td className={cn("px-5 py-3.5", className)} colSpan={colSpan}>{children}</td>;
}

// ΓöÇΓöÇΓöÇ GATED ROUTE / ACCESS DENIED ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

// ΓöÇΓöÇΓöÇ DASHBOARD ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ



function DashboardScreen() {
  // Pull the canonical (already-normalized) collections from FleetProvider.
  // Calling useVehicles/useDrivers/useTrips here as well would create a second
  // query instance per cache key and would re-introduce the risk of
  // non-array responses reaching the .filter() calls below.
  const { vehicles, drivers, trips, maintenance, fuelLogs, expenses } = useFleet();

  const parseVal = (v: any) => {
    if (typeof v === "number") return v;
    return parseFloat(String(v || "").replace(/[^0-9.]/g, "")) || 0;
  };

  // Active Vehicles
  const activeVehCount = vehicles.filter(v => v.status === "on-trip" || v.status === "on_trip").length;
  // Available Vehicles
  const availVehCount = vehicles.filter(v => v.status === "available").length;
  // In Maintenance
  const maintVehCount = vehicles.filter(v => v.status === "in-shop" || v.status === "in_shop").length;
  // Active Trips
  const activeTripsCount = trips.filter(t => t.status === "in-progress" || t.status === "dispatched").length;
  // Pending Trips
  const pendingTripsCount = trips.filter(t => t.status === "pending" || t.status === "draft").length;
  // Drivers On Duty
  const driversOnDutyCount = drivers.filter(d => d.status === "on-duty" || d.status === "on_trip" || d.status === "available").length;

  // Fleet Utilization
  const nonRetiredVehs = vehicles.filter(v => v.status !== "retired").length;
  const utilizationPct = nonRetiredVehs > 0 ? Math.round((activeVehCount / nonRetiredVehs) * 100) : 0;

  const kpis = [
    { label: "Active Vehicles", value: activeVehCount, icon: Truck, trend: "up" as const, trendValue: `${activeVehCount} on road`, color: "bg-blue-600" },
    { label: "Available Vehicles", value: availVehCount, icon: CheckCircle, trend: "neutral" as const, trendValue: "Ready to dispatch", color: "bg-emerald-500" },
    { label: "In Maintenance", value: maintVehCount, icon: Wrench, trend: "neutral" as const, trendValue: `${maintVehCount} in shop`, color: "bg-orange-500" },
    { label: "Active Trips", value: activeTripsCount, icon: Navigation, trend: "up" as const, trendValue: "Real-time dispatch", color: "bg-blue-600" },
    { label: "Pending Trips", value: pendingTripsCount, icon: Clock, trend: "neutral" as const, trendValue: "Awaiting dispatch", color: "bg-amber-500" },
    { label: "Drivers On Duty", value: driversOnDutyCount, icon: Users, trend: "up" as const, trendValue: `${driversOnDutyCount} active now`, color: "bg-indigo-500" },
    { label: "Fleet Utilization", value: `${utilizationPct}%`, icon: Activity, trend: "up" as const, trendValue: `Of non-retired vehicles`, color: "bg-violet-500" },
  ];

  // Types ΓÇö check both frontend field `type` and backend field; match status both ways
  const vehType = (v: any) => v.type ?? '';
  const isOnTrip = (v: any) => v.status === "on-trip" || v.status === "on_trip";

  const heavyTotal = vehicles.filter(v => vehType(v).includes("Heavy") || vehType(v).includes("Box Truck")).filter(v => v.status !== "retired").length;
  const heavyActive = vehicles.filter(v => (vehType(v).includes("Heavy") || vehType(v).includes("Box Truck")) && isOnTrip(v)).length;

  const mediumTotal = vehicles.filter(v => vehType(v).includes("Medium") || vehType(v).includes("Flatbed")).filter(v => v.status !== "retired").length;
  const mediumActive = vehicles.filter(v => (vehType(v).includes("Medium") || vehType(v).includes("Flatbed")) && isOnTrip(v)).length;

  const lightTotal = vehicles.filter(v => vehType(v).includes("Light") || vehType(v).includes("Van")).filter(v => v.status !== "retired").length;
  const lightActive = vehicles.filter(v => (vehType(v).includes("Light") || vehType(v).includes("Van")) && isOnTrip(v)).length;

  const util = [
    { label: "Heavy Trucks", total: heavyTotal, active: heavyActive, color: "bg-blue-500" },
    { label: "Medium Trucks", total: mediumTotal, active: mediumActive, color: "bg-indigo-500" },
    { label: "Light Vans", total: lightTotal, active: lightActive, color: "bg-violet-500" },
  ];

  // Today at glance metrics
  const totalDistance = trips
    .filter(t => t.status === "completed" || t.status === "in-progress")
    .reduce((sum, t) => sum + parseVal(t.distance), 0);

  const totalFuelLiters = fuelLogs.reduce((sum, f) => sum + parseVal(f.liters), 0);

  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + parseVal(f.total), 0);
  const totalMaintCost = maintenance.reduce((sum, m) => sum + parseVal(m.cost), 0);
  const totalOtherExpenses = expenses.reduce((sum, e) => sum + parseVal(e.amount), 0);
  const totalOperationalCost = totalFuelCost + totalMaintCost + totalOtherExpenses;

  // Alerts logic
  const expiringDrivers = drivers.filter(d => {
    if (!d.expiry) return false;
    const diff = new Date(d.expiry).getTime() - TODAY.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 && days <= 45;
  });
  
  const overdueMaint = maintenance.filter(m => {
    if (m.status !== "in-progress") return false;
    return new Date(m.end).getTime() < TODAY.getTime();
  });

  const alertList: string[] = [];
  expiringDrivers.forEach(d => {
    const days = Math.ceil((new Date(d.expiry).getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
    alertList.push(`License expiring for ${d.name} in ${days} days.`);
  });
  overdueMaint.forEach(m => {
    alertList.push(`${m.vehicleName} service (${m.type}) is past due.`);
  });

  // Recent trips (take 7)
  const recentTrips = [...trips].reverse().slice(0, 7);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12px] text-slate-400">
          <Calendar size={13} />
          <span>January 15, 2025 ΓÇö Last updated just now</span>
        </div>
        <button className="flex items-center gap-1.5 text-[12px] text-blue-600 hover:text-blue-700 font-medium transition-colors">
          <RefreshCw size={12} />Refresh
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {kpis.map(kpi => <KPICard key={kpi.label} {...kpi} />)}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Trips table */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <div>
              <h3 className="text-[13px] font-semibold text-slate-900">Recent Trips</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Latest trip records</p>
            </div>
            <button className="text-[12px] text-blue-600 hover:text-blue-700 font-medium">View all ΓåÆ</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/60">
                  <TH>Trip ID</TH><TH>Route</TH><TH>Driver</TH><TH>Cargo</TH><TH>Status</TH><TH>Cost</TH>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentTrips.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <TD><span className="text-[11px] font-mono font-medium text-slate-500">{t.id}</span></TD>
                    <TD>
                      <div className="flex items-center gap-1 text-[12px] text-slate-700">
                        <MapPin size={9} className="text-slate-400 shrink-0" />
                        <span className="font-medium truncate max-w-[80px]">{t.origin}</span>
                        <ArrowRight size={9} className="text-slate-300 shrink-0" />
                        <span className="truncate max-w-[80px]">{t.destination}</span>
                      </div>
                    </TD>
                    <TD><span className="text-[12px] text-slate-700">{t.driver}</span></TD>
                    <TD><span className="text-[12px] text-slate-500">{t.cargo}</span></TD>
                    <TD><StatusBadge status={t.status} /></TD>
                    <TD><span className="text-[12px] font-semibold text-slate-900">{typeof t.cost === "number" ? `$${t.cost.toLocaleString()}` : t.cost}</span></TD>
                  </tr>
                ))}
                {recentTrips.length === 0 && (
                  <tr>
                    <TD colSpan={6} className="text-center py-6 text-slate-400">No trips recorded</TD>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Utilization */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-[13px] font-semibold text-slate-900 mb-4">Fleet Utilization</h3>
            <div className="space-y-4">
              {util.map(({ label, total, active, color }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-medium text-slate-600">{label}</span>
                    <span className="text-[11px] text-slate-400 tabular-nums">{active}/{total}</span>
                  </div>
                  <ProgressBar value={active} max={total} color={color} />
                  <p className="text-right mt-1 text-[10px] text-slate-400">{total === 0 ? "0" : Math.round((active / total) * 100)}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Today glance */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-[13px] font-semibold text-slate-900 mb-3.5">Today at a Glance</h3>
            <div className="space-y-3">
              {[
                { l: "Total distance covered", v: `${totalDistance.toLocaleString()} mi`, Icon: Activity },
                { l: "Fuel consumed today", v: `${totalFuelLiters.toLocaleString()} L`, Icon: Fuel },
                { l: "Operational cost", v: `$${Math.round(totalOperationalCost).toLocaleString()}`, Icon: DollarSign },
                { l: "On-time trip rate", v: trips.filter(t => t.status === "completed").length > 0 ? "100%" : "98%", Icon: CheckCircle },
              ].map(({ l, v, Icon }) => (
                <div key={l} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-6 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                      <Icon size={12} className="text-slate-400" />
                    </div>
                    <span className="text-[12px] text-slate-600 truncate">{l}</span>
                  </div>
                  <span className="text-[12px] font-bold text-slate-900 shrink-0 tabular-nums">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alert */}
          {alertList.length > 0 && (
            <div className="bg-amber-50 rounded-xl border border-amber-100 p-4 flex items-start gap-2.5">
              <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[12px] font-semibold text-amber-800">{alertList.length} Alerts Require Attention</p>
                <p className="text-[11px] text-amber-600 mt-1 leading-relaxed">{alertList.slice(0, 3).join(" ")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ΓöÇΓöÇΓöÇ VEHICLES ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

function VehiclesScreen() {
  const { vehicles, createVehicle, deleteVehicle, role } = useFleet();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  // Form states ΓÇô mapped to backend Prisma schema fields
  const [formNameModel, setFormNameModel] = useState("");
  const [formType, setFormType] = useState("Van");
  const [formRegNo, setFormRegNo] = useState("");
  const [formOdometer, setFormOdometer] = useState("");
  const [formCapacity, setFormCapacity] = useState("");
  const [formAcqCost, setFormAcqCost] = useState("");
  const [formRegion, setFormRegion] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReadOnly = role === "dispatcher" || role === "viewer";

  // Normalise status for filtering (backend uses on_trip / in_shop)
  const matchesFilter = (v: any) => {
    if (filter === "all") return true;
    const s = v.status;
    if (filter === "available") return s === "available";
    if (filter === "on_trip") return s === "on_trip" || s === "on-trip";
    if (filter === "in_shop") return s === "in_shop" || s === "in-shop";
    if (filter === "retired") return s === "retired";
    return s === filter;
  };

  const list = vehicles.filter(v =>
    matchesFilter(v) &&
    ((v.nameModel ?? v.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
     (v.registrationNumber ?? v.plate ?? "").toLowerCase().includes(search.toLowerCase()))
  );

  const counts = {
    all: vehicles.length,
    available: vehicles.filter(v => v.status === "available").length,
    on_trip: vehicles.filter(v => v.status === "on_trip" || v.status === "on-trip").length,
    in_shop: vehicles.filter(v => v.status === "in_shop" || v.status === "in-shop").length,
  };

  const resetForm = () => {
    setFormNameModel(""); setFormRegNo(""); setFormOdometer("");
    setFormCapacity(""); setFormAcqCost(""); setFormRegion("");
    setFormError(""); setIsSubmitting(false);
  };

  const handleAddVehicle = () => {
    if (!formNameModel || !formRegNo || !formCapacity || !formAcqCost) {
      setFormError("Name, Registration Number, Max Capacity, and Acquisition Cost are required.");
      return;
    }
    const maxLoadCapacity = parseFloat(formCapacity) || 0;
    const acquisitionCost = parseFloat(formAcqCost) || 0;
    if (maxLoadCapacity <= 0) { setFormError("Max load capacity must be a positive number."); return; }
    if (acquisitionCost <= 0) { setFormError("Acquisition cost must be a positive number."); return; }

    setIsSubmitting(true);
    setFormError("");
    createVehicle({
      registrationNumber: formRegNo.trim().toUpperCase(),
      nameModel: formNameModel.trim(),
      type: formType,
      maxLoadCapacity,
      odometer: parseFloat(formOdometer) || 0,
      acquisitionCost,
      region: formRegion.trim() || null,
    });
    setShowModal(false);
    resetForm();
  };

  const handleDeleteVehicle = (id: string) => {
    const v = vehicles.find(veh => veh.id === id);
    if (!v) return;
    const name = v.nameModel ?? v.name ?? "this vehicle";
    if (v.status === "on_trip" || v.status === "on-trip") { alert(`Cannot delete ${name} ΓÇö currently on a trip.`); return; }
    if (v.status === "in_shop" || v.status === "in-shop") { alert(`Cannot delete ${name} ΓÇö currently in maintenance.`); return; }
    if (window.confirm(`Are you sure you want to delete ${name}?`)) deleteVehicle(id);
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Name & Model", "Type", "Reg. No.", "Status", "Odometer (km)", "Max Load (kg)", "Cost ($)", "Region"];
    const rows = list.map(v => [
      v.id, v.nameModel ?? v.name ?? "", v.type ?? "", v.registrationNumber ?? v.plate ?? "",
      v.status ?? "", v.odometer ?? "", v.maxLoadCapacity ?? v.capacity ?? "", v.acquisitionCost ?? "", v.region ?? "",
    ]);
    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `transitops_vehicles_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by name or registration numberΓÇª" value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-4 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer min-w-[150px]">
          <option value="all">All Statuses</option>
          <option value="available">Available</option>
          <option value="on_trip">On Trip</option>
          <option value="in_shop">In Shop</option>
          <option value="retired">Retired</option>
        </select>
        <button onClick={() => { if (isReadOnly) { alert("Read-only access. You cannot add vehicles."); return; } setShowModal(true); }}
          className={cn("flex items-center gap-2 px-4 py-2.5 text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm whitespace-nowrap",
            isReadOnly ? "bg-slate-300 cursor-not-allowed shadow-none" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
          )}>
          {isReadOnly ? <Shield size={14} /> : <Plus size={14} />}Add Vehicle
        </button>
      </div>

      {/* Count pills */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Fleet", val: counts.all, cls: "text-slate-900" },
          { label: "Available", val: counts.available, cls: "text-emerald-600" },
          { label: "On Trip", val: counts.on_trip, cls: "text-blue-600" },
          { label: "In Shop", val: counts.in_shop, cls: "text-orange-600" },
        ].map(({ label, val, cls }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 text-center">
            <p className={cn("text-xl font-bold tabular-nums", cls)}>{val}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <p className="text-[13px] font-medium text-slate-600">{list.length} vehicle{list.length !== 1 ? "s" : ""}</p>
          <button onClick={handleExportCSV} className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 transition-colors font-medium">
            <Download size={12} />Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <TH>Name & Model</TH><TH>Type</TH><TH>Reg. No.</TH><TH>Status</TH><TH>Odometer</TH><TH>Max Load</TH><TH>Cost</TH><TH>Region</TH><TH></TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {list.map(v => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                  <TD>
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <Truck size={13} className="text-blue-600" />
                      </div>
                      <span className="text-[13px] font-semibold text-slate-900">{v.nameModel ?? v.name}</span>
                    </div>
                  </TD>
                  <TD><span className="text-[12px] text-slate-600">{v.type}</span></TD>
                  <TD><span className="text-[12px] font-mono font-medium text-slate-700">{v.registrationNumber ?? v.plate}</span></TD>
                  <TD><StatusBadge status={v.status} /></TD>
                  <TD><span className="text-[12px] text-slate-600 tabular-nums">{(v.odometer ?? 0).toLocaleString()} km</span></TD>
                  <TD><span className="text-[12px] text-slate-600 tabular-nums">{(v.maxLoadCapacity ?? v.capacity ?? 0).toLocaleString()} kg</span></TD>
                  <TD><span className="text-[12px] font-semibold text-slate-900 tabular-nums">${(v.acquisitionCost ?? 0).toLocaleString()}</span></TD>
                  <TD><span className="text-[12px] text-slate-400">{v.region ?? "ΓÇö"}</span></TD>
                  <TD>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"><Eye size={12} className="text-blue-600" /></button>
                      {!isReadOnly && (
                        <>
                          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><Edit2 size={12} className="text-slate-500" /></button>
                          <button onClick={() => handleDeleteVehicle(v.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={12} className="text-red-500" /></button>
                        </>
                      )}
                    </div>
                  </TD>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <TD colSpan={9} className="text-center py-6 text-slate-400">No vehicles match filters</TD>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); resetForm(); }} title="Add New Vehicle">
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-[12px] text-red-600">
              <AlertTriangle size={13} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name & Model"><input className={ic} value={formNameModel} onChange={e => setFormNameModel(e.target.value)} placeholder="e.g. Volvo FH16 Heavy Duty" /></Field>
            <Field label="Type">
              <select className={ic} value={formType} onChange={e => setFormType(e.target.value)}>
                <option value="Box Truck">Box Truck</option>
                <option value="Flatbed">Flatbed</option>
                <option value="Van">Van</option>
                <option value="Heavy Truck">Heavy Truck</option>
                <option value="Medium Truck">Medium Truck</option>
                <option value="Light Van">Light Van</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Registration Number"><input className={ic} value={formRegNo} onChange={e => setFormRegNo(e.target.value)} placeholder="V-003-DEF" /></Field>
            <Field label="Region (optional)"><input className={ic} value={formRegion} onChange={e => setFormRegion(e.target.value)} placeholder="e.g. North Depot" /></Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Odometer (km)"><input type="number" className={ic} value={formOdometer} onChange={e => setFormOdometer(e.target.value)} placeholder="0" /></Field>
            <Field label="Max Load (kg)"><input type="number" className={ic} value={formCapacity} onChange={e => setFormCapacity(e.target.value)} placeholder="e.g. 12000" /></Field>
            <Field label="Acquisition Cost ($)"><input type="number" className={ic} value={formAcqCost} onChange={e => setFormAcqCost(e.target.value)} placeholder="e.g. 110000" /></Field>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-[13px] font-medium hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={handleAddVehicle} disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {isSubmitting ? <RefreshCw size={13} className="animate-spin" /> : null}
              {isSubmitting ? "AddingΓÇª" : "Add Vehicle"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}




function DriversScreen() {
  const { role } = useFleet();
  const { drivers, createDriverAsync, deleteDriverAsync } = useDrivers();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formLicenseCategory, setFormLicenseCategory] = useState("CDL-A");
  const [formLicenseNumber, setFormLicenseNumber] = useState("");
  const [formExpiry, setFormExpiry] = useState("");
  const [formSafetyScore, setFormSafetyScore] = useState("100");
  const [formError, setFormError] = useState("");

  const isReadOnly = role === "dispatcher" || role === "viewer";

  const list = drivers.filter(d =>
    (filter === "all" || d.status === filter) &&
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddDriver = async () => {
    if (!formName || !formPhone || !formLicenseNumber || !formExpiry || !formSafetyScore) {
      setFormError("All fields are required.");
      return;
    }

    const safetyScore = parseInt(formSafetyScore) || 100;
    if (safetyScore < 0 || safetyScore > 100) {
      setFormError("Safety Score must be between 0 and 100.");
      return;
    }

    try {
      await createDriverAsync({
        name: formName,
        contactNumber: formPhone,
        licenseCategory: formLicenseCategory,
        licenseNumber: formLicenseNumber,
        licenseExpiry: new Date(formExpiry).toISOString(),
        safetyScore,
      });

      setShowModal(false);
      // Reset form
      setFormName("");
      setFormPhone("");
      setFormLicenseCategory("CDL-A");
      setFormLicenseNumber("");
      setFormExpiry("");
      setFormSafetyScore("100");
      setFormError("");
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || "Failed to create driver");
    }
  };

  const handleDeleteDriver = async (id: string, name: string, status: string) => {
    if (status === "on_trip") {
      alert(`Cannot delete driver ${name} because they are currently on a trip.`);
      return;
    }
    if (window.confirm(`Are you sure you want to delete driver ${name}?`)) {
      try {
        await deleteDriverAsync(id);
      } catch (err: any) {
        alert(err.response?.data?.message || "Failed to delete driver");
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search driver by nameΓÇª" value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-4 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer min-w-[150px]">
          <option value="all">All Statuses</option>
          <option value="available">Available</option>
          <option value="off_duty">Off Duty</option>
          <option value="on_trip">On Trip</option>
          <option value="suspended">Suspended</option>
        </select>
        <button onClick={() => {
          if (isReadOnly) {
            alert("Your role has read-only access. You do not have permission to add drivers.");
            return;
          }
          setShowModal(true);
        }}
          className={cn("flex items-center gap-2 px-4 py-2.5 text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm whitespace-nowrap",
            isReadOnly ? "bg-slate-300 cursor-not-allowed shadow-none" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
          )}>
          {isReadOnly ? <Shield size={14} /> : <Plus size={14} />}Add Driver
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
          <p className="text-[13px] font-medium text-slate-600">{list.length} driver{list.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <TH>Driver</TH><TH>Phone</TH><TH>License No</TH><TH>Class</TH><TH>Expiry</TH><TH>Safety Score</TH><TH>Status</TH><TH></TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {list.map(d => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors group">
                  <TD>
                    <div className="flex items-center gap-3">
                      <Avatar name={d.name} />
                      <div>
                        <p className="text-[13px] font-semibold text-slate-900">{d.name}</p>
                        <p className="text-[10px] text-slate-400">{d.id.substring(0,8)}</p>
                      </div>
                    </div>
                  </TD>
                  <TD><span className="text-[12px] text-slate-600">{d.contactNumber}</span></TD>
                  <TD>
                    <span className="text-[11px] font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{d.licenseNumber}</span>
                  </TD>
                  <TD><span className="text-[12px] font-medium text-slate-600">{d.licenseCategory}</span></TD>
                  <TD><ExpiryBadge expiry={d.licenseExpiry} /></TD>
                  <TD><SafetyBadge score={d.safetyScore} /></TD>
                  <TD><StatusBadge status={d.status} /></TD>
                  <TD>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                      {!isReadOnly && (
                        <button onClick={() => handleDeleteDriver(d.id, d.name, d.status)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={12} className="text-red-500" /></button>
                      )}
                    </div>
                  </TD>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <TD colSpan={8} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Users size={24} className="text-slate-300" />
                      <p className="text-[14px] font-medium text-slate-600">No drivers found</p>
                      <p className="text-[12px] text-slate-500">Add a driver to get started.</p>
                    </div>
                  </TD>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); setFormError(""); }} title="Add New Driver">
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-[12px] text-red-600">
              <AlertTriangle size={13} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name"><input className={ic} value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Sarah Chen" /></Field>
            <Field label="Phone Number"><input className={ic} value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="+1 555-0199" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="License Class">
              <select className={ic} value={formLicenseCategory} onChange={e => setFormLicenseCategory(e.target.value)}>
                <option value="CDL-A">CDL Class A</option>
                <option value="CDL-B">CDL Class B</option>
                <option value="CDL-C">CDL Class C</option>
              </select>
            </Field>
            <Field label="License Number"><input type="text" className={ic} value={formLicenseNumber} onChange={e => setFormLicenseNumber(e.target.value)} placeholder="e.g. D1234567" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="License Expiry Date"><input type="date" className={ic} value={formExpiry} onChange={e => setFormExpiry(e.target.value)} /></Field>
            <Field label="Initial Safety Score (0-100)">
              <input type="number" className={ic} value={formSafetyScore} onChange={e => setFormSafetyScore(e.target.value)} placeholder="100" />
            </Field>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setShowModal(false); setFormError(""); }} className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-[13px] font-medium hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={handleAddDriver} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-semibold transition-colors">Add Driver</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ΓöÇΓöÇΓöÇ DISPATCH ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

function DispatchScreen() {
  const {
    vehicles, setVehicles,
    drivers, setDrivers,
    trips, setTrips,
    fuelLogs, setFuelLogs,
    expenses, setExpenses,
    role
  } = useFleet();

  const [viewMode, setViewMode] = useState<"list" | "create">("list");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);

  // Wizard state
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ origin: "", destination: "", cargoType: "", weight: "", distance: "", notes: "", vehicleId: "", driverId: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Complete Trip modal state
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeOdometer, setCompleteOdometer] = useState("");
  const [completeFuel, setCompleteFuel] = useState("");
  const [completeRevenue, setCompleteRevenue] = useState("");
  const [completeError, setCompleteError] = useState("");

  const isReadOnly = role === "viewer";

  const parseVal = (v: any) => {
    if (typeof v === "number") return v;
    return parseFloat(String(v || "").replace(/[^0-9.]/g, "")) || 0;
  };

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  };

  // Step 1 validation
  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.origin.trim()) e.origin = "Origin city is required";
    if (!form.destination.trim()) e.destination = "Destination city is required";
    if (!form.cargoType) e.cargoType = "Select a cargo type";
    if (!form.weight || Number(form.weight) <= 0) e.weight = "Enter a valid weight";
    if (!form.distance || Number(form.distance) <= 0) e.distance = "Enter a valid distance";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Step 2 validation
  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.vehicleId) e.vehicleId = "Select a vehicle";
    if (!form.driverId) e.driverId = "Select a driver";

    const v = vehicles.find(veh => veh.id === form.vehicleId);
    if (v && Number(form.weight) > (v.capacity || 0)) {
      e.vehicleId = `Overload Warning: Cargo weight (${form.weight}t) exceeds vehicle capacity (${v.capacity}t)`;
    }

    const d = drivers.find(drv => drv.id === form.driverId);
    if (d && d.expiry && new Date(d.expiry).getTime() < TODAY.getTime()) {
      e.driverId = `Compliance Warning: Selected driver has an expired license (${d.expiry})`;
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Filter lists for wizard
  const availVeh = vehicles.filter(v => v.status === "available");
  const availDrv = drivers.filter(d => d.status === "available" && new Date(d.expiry).getTime() >= TODAY.getTime());

  const selVeh = vehicles.find(v => v.id === form.vehicleId);
  const selDrv = drivers.find(d => d.id === form.driverId);

  const handleCreateTrip = (immediateDispatch: boolean) => {
    if (!selVeh || !selDrv) return;

    const newTripId = `T-${Math.floor(1000 + Math.random() * 9000)}`;
    const costEstimate = Math.round(Number(form.distance) * 2.8);

    const newTrip = {
      id: newTripId,
      origin: form.origin,
      destination: form.destination,
      vehicleId: form.vehicleId,
      vehicle: selVeh.name,
      driverId: form.driverId,
      driver: selDrv.name,
      cargo: form.cargoType,
      weight: `${form.weight}t`,
      distance: `${form.distance} mi`,
      status: immediateDispatch ? "in-progress" : "pending",
      departure: "Jan 15, " + new Date().toTimeString().slice(0, 5),
      cost: `$${costEstimate.toLocaleString()}`,
      revenue: Number(completeRevenue) || Math.round(costEstimate * 1.5),
      finalOdometer: null,
      fuelConsumed: null,
    };

    // Update state
    setTrips(prev => [...prev, newTrip]);

    if (immediateDispatch) {
      setVehicles(prev => prev.map(v => v.id === form.vehicleId ? { ...v, status: "on-trip" } : v));
      setDrivers(prev => prev.map(d => d.id === form.driverId ? { ...d, status: "on-duty", vehicle: selVeh.id } : d));
    }

    // Reset wizard
    setViewMode("list");
    setStep(1);
    setForm({ origin: "", destination: "", cargoType: "", weight: "", distance: "", notes: "", vehicleId: "", driverId: "" });
  };

  // Dispatch existing trip
  const handleDispatchTrip = (trip: any) => {
    const v = vehicles.find(veh => veh.id === trip.vehicleId);
    const d = drivers.find(drv => drv.id === trip.driverId);

    if (!v || v.status !== "available") {
      alert("Cannot dispatch: The assigned vehicle is no longer available.");
      return;
    }
    if (!d || d.status !== "available") {
      alert("Cannot dispatch: The assigned driver is no longer available.");
      return;
    }
    if (d.expiry && new Date(d.expiry).getTime() < TODAY.getTime()) {
      alert(`Cannot dispatch: Driver license is expired (${d.expiry}).`);
      return;
    }

    // Update statuses
    setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, status: "in-progress" } : t));
    setVehicles(prev => prev.map(veh => veh.id === trip.vehicleId ? { ...veh, status: "on-trip" } : veh));
    setDrivers(prev => prev.map(drv => drv.id === trip.driverId ? { ...drv, status: "on-duty", vehicle: trip.vehicleId } : drv));

    setSelectedTrip((prev: any) => prev ? { ...prev, status: "in-progress" } : null);
    alert(`Trip ${trip.id} has been dispatched!`);
  };

  // Cancel trip
  const handleCancelTrip = (trip: any) => {
    if (!window.confirm(`Are you sure you want to cancel trip ${trip.id}?`)) return;

    setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, status: "cancelled" } : t));
    
    // Release vehicle and driver if they were active
    if (trip.status === "in-progress") {
      setVehicles(prev => prev.map(veh => veh.id === trip.vehicleId ? { ...veh, status: "available" } : veh));
      setDrivers(prev => prev.map(drv => drv.id === trip.driverId ? { ...drv, status: "available", vehicle: null } : drv));
    }

    setSelectedTrip((prev: any) => prev ? { ...prev, status: "cancelled" } : null);
    alert(`Trip ${trip.id} has been cancelled.`);
  };

  // Close/Complete trip modal trigger
  const triggerCompleteTrip = () => {
    const v = vehicles.find(veh => veh.id === selectedTrip.vehicleId);
    setCompleteOdometer(v ? String(v.odometer) : "");
    setCompleteFuel("");
    setCompleteRevenue(String(Math.round(parseVal(selectedTrip.cost) * 1.5)));
    setCompleteError("");
    setShowCompleteModal(true);
  };

  // Submit complete trip
  const handleCompleteTripSubmit = () => {
    const v = vehicles.find(veh => veh.id === selectedTrip.vehicleId);
    const d = drivers.find(drv => drv.id === selectedTrip.driverId);
    if (!v || !d) return;

    const newOdo = parseInt(completeOdometer);
    const fuel = parseFloat(completeFuel);
    const rev = parseFloat(completeRevenue);

    if (isNaN(newOdo) || newOdo <= v.odometer) {
      setCompleteError(`Odometer must be greater than current vehicle mileage (${v.odometer.toLocaleString()} mi)`);
      return;
    }
    if (isNaN(fuel) || fuel <= 0) {
      setCompleteError("Please enter a valid fuel volume consumed.");
      return;
    }
    if (isNaN(rev) || rev < 0) {
      setCompleteError("Please enter a valid revenue amount.");
      return;
    }

    // 1. Update trip status
    setTrips(prev => prev.map(t => t.id === selectedTrip.id ? {
      ...t,
      status: "completed",
      finalOdometer: newOdo,
      fuelConsumed: fuel,
      revenue: rev
    } : t));

    // 2. Release vehicle and update odometer
    setVehicles(prev => prev.map(veh => veh.id === selectedTrip.vehicleId ? {
      ...veh,
      status: "available",
      odometer: newOdo,
      mileage: `${newOdo.toLocaleString()} mi`
    } : veh));

    // 3. Release driver and increment trip count
    setDrivers(prev => prev.map(drv => drv.id === selectedTrip.driverId ? {
      ...drv,
      status: "available",
      trips: (drv.trips || 0) + 1,
      vehicle: null
    } : drv));

    // 4. Log Fuel log entry
    const newFuelLog = {
      id: `F-00${fuelLogs.length + 1}`,
      vehicleId: v.id,
      vehicleName: v.name,
      driver: d.name,
      date: TODAY.toISOString().slice(0, 10),
      liters: fuel,
      costPer: "$1.50",
      total: `$${(fuel * 1.50).toFixed(2)}`,
      station: "Odoo Dispatch Depot",
      odometer: `${newOdo.toLocaleString()} mi`
    };
    setFuelLogs(prev => [...prev, newFuelLog]);

    // 5. Log Expense log entry
    const newExpense = {
      id: `E-00${expenses.length + 1}`,
      vehicleId: v.id,
      vehicleName: v.name,
      category: "Toll",
      amount: `$${(parseVal(selectedTrip.cost) * 0.1).toFixed(2)}`, // 10% of cost as tolls
      date: TODAY.toISOString().slice(0, 10),
      description: `Tolls for Trip ${selectedTrip.id} (${selectedTrip.origin} to ${selectedTrip.destination})`,
      receipt: true
    };
    setExpenses(prev => [...prev, newExpense]);

    // Clean up
    setShowCompleteModal(false);
    setSelectedTrip(null);
    alert(`Trip completed successfully! Odometer and fuel usage logged.`);
  };

  const filteredTrips = trips.filter(t => statusFilter === "all" || t.status === statusFilter);

  const stepDot = (n: number) => cn(
    "size-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 transition-all",
    step > n ? "bg-emerald-500 text-white" : step === n ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "bg-slate-100 text-slate-400"
  );
  const stepLine = (n: number) => cn("h-px flex-1", step > n ? "bg-emerald-400" : "bg-slate-200");

  if (viewMode === "list") {
    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer min-w-[170px]">
              <option value="all">All Trips</option>
              <option value="pending">Pending (Draft)</option>
              <option value="in-progress">In Progress (Active)</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button onClick={() => {
            if (isReadOnly) {
              alert("Your role has read-only access. You cannot create trips.");
              return;
            }
            setViewMode("create");
          }}
            className={cn("flex items-center gap-2 px-4 py-2.5 text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm whitespace-nowrap justify-center sm:justify-start",
              isReadOnly ? "bg-slate-300 cursor-not-allowed shadow-none" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
            )}>
            {isReadOnly ? <Shield size={14} /> : <Plus size={14} />}Create Trip
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50">
            <p className="text-[13px] font-medium text-slate-600">{filteredTrips.length} trip record{filteredTrips.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  <TH>ID</TH><TH>Route</TH><TH>Vehicle</TH><TH>Driver</TH><TH>Cargo</TH><TH>Weight</TH><TH>Status</TH><TH>Est. Cost</TH><TH>Actions</TH>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTrips.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                    <TD><span className="text-[11px] font-mono font-medium text-slate-500">{t.id}</span></TD>
                    <TD>
                      <div className="flex items-center gap-1 text-[12px] text-slate-700">
                        <MapPin size={9} className="text-slate-400 shrink-0" />
                        <span className="font-medium truncate max-w-[80px]">{t.origin}</span>
                        <ArrowRight size={9} className="text-slate-300 shrink-0" />
                        <span className="truncate max-w-[80px]">{t.destination}</span>
                      </div>
                    </TD>
                    <TD><span className="text-[12px] text-slate-700">{t.vehicle}</span></TD>
                    <TD><span className="text-[12px] text-slate-700">{t.driver}</span></TD>
                    <TD><span className="text-[12px] text-slate-500">{t.cargo}</span></TD>
                    <TD><span className="text-[12px] text-slate-600 tabular-nums">{t.weight}</span></TD>
                    <TD><StatusBadge status={t.status} /></TD>
                    <TD><span className="text-[12px] font-semibold text-slate-900">{t.cost}</span></TD>
                    <TD>
                      <button onClick={() => setSelectedTrip(t)} className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg transition-colors">
                        Details
                      </button>
                    </TD>
                  </tr>
                ))}
                {filteredTrips.length === 0 && (
                  <tr>
                    <TD colSpan={9} className="text-center py-6 text-slate-400">No trips found matching criteria</TD>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trip detail modal */}
        {selectedTrip && (
          <Modal open={!!selectedTrip} onClose={() => setSelectedTrip(null)} title={`Trip Details ΓÇö ${selectedTrip.id}`}>
            <div className="space-y-5">
              <div className="bg-slate-50 rounded-xl p-4.5 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-blue-600" />
                    <span className="text-[13px] font-bold text-slate-950">{selectedTrip.origin} ΓåÆ {selectedTrip.destination}</span>
                  </div>
                  <StatusBadge status={selectedTrip.status} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">Cargo</span>
                    <span className="text-[12px] font-semibold text-slate-900">{selectedTrip.cargo} ({selectedTrip.weight})</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">Distance</span>
                    <span className="text-[12px] font-semibold text-slate-900">{selectedTrip.distance}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">Estimated Cost</span>
                    <span className="text-[12px] font-semibold text-slate-900">{selectedTrip.cost}</span>
                  </div>
                  {selectedTrip.status === "completed" && (
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">Actual Revenue</span>
                      <span className="text-[12px] font-semibold text-emerald-600">${selectedTrip.revenue?.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-100 rounded-xl p-3.5 bg-white">
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase mb-2">Vehicle Details</span>
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Truck size={13} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-slate-900">{selectedTrip.vehicle}</p>
                      <p className="text-[10px] text-slate-400">{selectedTrip.vehicleId}</p>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-100 rounded-xl p-3.5 bg-white">
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase mb-2">Driver Details</span>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={selectedTrip.driver} size="sm" />
                    <div>
                      <p className="text-[12px] font-bold text-slate-900">{selectedTrip.driver}</p>
                      <p className="text-[10px] text-slate-400">{selectedTrip.driverId}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons based on lifecycle */}
              {!isReadOnly && (
                <div className="flex gap-3 pt-2.5 border-t border-slate-100">
                  {selectedTrip.status === "pending" && (
                    <>
                      <button onClick={() => handleCancelTrip(selectedTrip)} className="flex-1 py-2 text-[12px] text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-50 transition-colors">
                        Cancel Trip
                      </button>
                      <button onClick={() => handleDispatchTrip(selectedTrip)} className="flex-1 py-2 text-[12px] bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-sm flex items-center justify-center gap-1.5">
                        <Zap size={12} />Dispatch Now
                      </button>
                    </>
                  )}
                  {selectedTrip.status === "in-progress" && (
                    <>
                      <button onClick={() => handleCancelTrip(selectedTrip)} className="flex-1 py-2 text-[12px] text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-50 transition-colors">
                        Cancel Trip
                      </button>
                      <button onClick={triggerCompleteTrip} className="flex-1 py-2 text-[12px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-all shadow-sm flex items-center justify-center gap-1.5">
                        <CheckCircle size={12} />Complete Trip
                      </button>
                    </>
                  )}
                  {(selectedTrip.status === "completed" || selectedTrip.status === "cancelled") && (
                    <button onClick={() => setSelectedTrip(null)} className="w-full py-2 border border-slate-200 text-slate-700 rounded-lg text-[12px] font-semibold hover:bg-slate-50 transition-colors">
                      Close Window
                    </button>
                  )}
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Complete Trip submodal */}
        {showCompleteModal && (
          <Modal open={showCompleteModal} onClose={() => setShowCompleteModal(false)} title={`Complete Trip ΓÇö ${selectedTrip?.id}`}>
            <div className="space-y-4">
              {completeError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-[12px] text-red-600">
                  <AlertTriangle size={13} className="shrink-0" />
                  <span>{completeError}</span>
                </div>
              )}
              <Field label="Final Vehicle Odometer Reading (mi)">
                <input type="number" className={ic} value={completeOdometer} onChange={e => setCompleteOdometer(e.target.value)} placeholder="e.g. 78400" />
              </Field>
              <Field label="Actual Fuel Consumed (Liters)">
                <input type="number" className={ic} value={completeFuel} onChange={e => setCompleteFuel(e.target.value)} placeholder="e.g. 110" />
              </Field>
              <Field label="Actual Cargo Revenue ($)">
                <input type="number" className={ic} value={completeRevenue} onChange={e => setCompleteRevenue(e.target.value)} placeholder="e.g. 2500" />
              </Field>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCompleteModal(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-[13px] font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={handleCompleteTripSubmit} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[13px] font-semibold transition-colors">Complete & Log Data</button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Step indicator */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2">
          <div className={stepDot(1)}>{step > 1 ? <CheckCircle size={14} /> : "1"}</div>
          <span className={cn("text-[13px] font-medium hidden sm:block", step === 1 ? "text-slate-900" : "text-slate-400")}>Route Details</span>
          <div className={stepLine(1)} />
          <div className={stepDot(2)}>{step > 2 ? <CheckCircle size={14} /> : "2"}</div>
          <span className={cn("text-[13px] font-medium hidden sm:block", step === 2 ? "text-slate-900" : "text-slate-400")}>Assignment</span>
          <div className={stepLine(2)} />
          <div className={stepDot(3)}>3</div>
          <span className={cn("text-[13px] font-medium hidden sm:block", step === 3 ? "text-slate-900" : "text-slate-400")}>Review & Dispatch</span>
        </div>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <div>
              <h3 className="text-[15px] font-semibold text-slate-900">Route Details</h3>
              <p className="text-[12px] text-slate-400 mt-0.5">Enter trip route, cargo type and dimensions</p>
            </div>
            <button onClick={() => setViewMode("list")} className="text-[12px] text-slate-500 hover:text-slate-700 transition-colors font-medium">Cancel Wizard</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Origin City" error={errors.origin}>
              <div className="relative">
                <MapPin size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                <input value={form.origin} onChange={e => set("origin", e.target.value)} className={cn(ic, "pl-8")} placeholder="e.g. Chicago, IL" />
              </div>
            </Field>
            <Field label="Destination City" error={errors.destination}>
              <div className="relative">
                <MapPin size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
                <input value={form.destination} onChange={e => set("destination", e.target.value)} className={cn(ic, "pl-8")} placeholder="e.g. Detroit, MI" />
              </div>
            </Field>
          </div>
          <Field label="Cargo Type" error={errors.cargoType}>
            <select value={form.cargoType} onChange={e => set("cargoType", e.target.value)} className={ic}>
              <option value="">Select cargo typeΓÇª</option>
              {["Auto Parts", "Electronics", "Food & Beverage", "Building Materials", "Medical Supplies", "Industrial Equipment", "Furniture", "Hazardous Materials", "Other"].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Cargo Weight (tons)" error={errors.weight}>
              <input type="number" value={form.weight} onChange={e => set("weight", e.target.value)} className={ic} placeholder="e.g. 12.5" min="0" step="0.1" />
            </Field>
            <Field label="Planned Distance (mi)" error={errors.distance}>
              <input type="number" value={form.distance} onChange={e => set("distance", e.target.value)} className={ic} placeholder="e.g. 280" min="0" />
            </Field>
          </div>
          <Field label="Special Instructions (optional)">
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} className={cn(ic, "resize-none")} rows={3} placeholder="Fragile cargo, temperature control requirementsΓÇª" />
          </Field>
          <div className="flex justify-end">
            <button onClick={() => { if (validateStep1()) setStep(2); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-xl transition-all">
              Next: Assignment <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <div>
              <h3 className="text-[15px] font-semibold text-slate-900">Vehicle & Driver Assignment</h3>
              <p className="text-[12px] text-slate-400 mt-0.5">Select from currently available vehicles and drivers</p>
            </div>
            <button onClick={() => setViewMode("list")} className="text-[12px] text-slate-500 hover:text-slate-700 transition-colors font-medium">Cancel Wizard</button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-slate-700">Select Vehicle</label>
              {errors.vehicleId && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertTriangle size={10} />{errors.vehicleId}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {availVeh.map(v => (
                <button key={v.id} onClick={() => set("vehicleId", v.id)}
                  className={cn("flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all",
                    form.vehicleId === v.id ? "border-blue-500 bg-blue-50" : "border-slate-100 hover:border-slate-200 bg-white")}>
                  <div className={cn("size-8 rounded-lg flex items-center justify-center shrink-0", form.vehicleId === v.id ? "bg-blue-600" : "bg-slate-100")}>
                    <Truck size={13} className={form.vehicleId === v.id ? "text-white" : "text-slate-500"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-900 truncate">{v.name}</p>
                    <p className="text-[11px] text-slate-400">Plate: {v.plate} ┬╖ Capacity: {v.capacity ?? 20}t</p>
                  </div>
                  {form.vehicleId === v.id && <CheckCircle size={14} className="text-blue-600 shrink-0" />}
                </button>
              ))}
              {availVeh.length === 0 && (
                <p className="col-span-2 py-4 text-center text-[12px] text-slate-400 border border-dashed rounded-xl border-slate-200 bg-slate-50/50">No vehicles available at this time.</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-slate-700">Select Driver</label>
              {errors.driverId && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertTriangle size={10} />{errors.driverId}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {availDrv.map(d => (
                <button key={d.id} onClick={() => set("driverId", d.id)}
                  className={cn("flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all",
                    form.driverId === d.id ? "border-blue-500 bg-blue-50" : "border-slate-100 hover:border-slate-200 bg-white")}>
                  <Avatar name={d.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-900 truncate">{d.name}</p>
                    <p className="text-[11px] text-slate-400">{d.license} ┬╖ Safety: {d.safetyScore}/100</p>
                  </div>
                  {form.driverId === d.id && <CheckCircle size={14} className="text-blue-600 shrink-0" />}
                </button>
              ))}
              {availDrv.length === 0 && (
                <p className="col-span-2 py-4 text-center text-[12px] text-slate-400 border border-dashed rounded-xl border-slate-200 bg-slate-50/50">No compliant drivers available at this time.</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 text-[13px] font-medium rounded-xl hover:bg-slate-50 transition-colors">
              <ChevronLeft size={14} />Back
            </button>
            <button onClick={() => { if (validateStep2()) setStep(3); }} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-xl transition-all">
              Review Trip <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div>
            <h3 className="text-[15px] font-semibold text-slate-900">Review & Confirm</h3>
            <p className="text-[12px] text-slate-400 mt-0.5">Verify all details before dispatching this trip</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <Navigation size={15} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Route</p>
                <p className="text-[14px] font-bold text-slate-900">{form.origin} ΓåÆ {form.destination}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1">
              {[
                { l: "Cargo Type", v: form.cargoType },
                { l: "Weight", v: `${form.weight} tons` },
                { l: "Planned Distance", v: `${form.distance} mi` },
                { l: "Estimated Cost", v: `$${(Number(form.distance) * 2.8).toFixed(0)}` },
              ].map(({ l, v }) => (
                <div key={l}>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{l}</p>
                  <p className="text-[13px] font-semibold text-slate-900 mt-0.5">{v}</p>
                </div>
              ))}
            </div>
            {form.notes && <div className="pt-3 border-t border-slate-200"><p className="text-[10px] text-slate-400 uppercase tracking-wide">Notes</p><p className="text-[13px] text-slate-700 mt-0.5">{form.notes}</p></div>}
          </div>

          {selVeh && selDrv && (
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-slate-100 rounded-xl p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Vehicle</p>
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Truck size={13} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-slate-900">{selVeh.name}</p>
                    <p className="text-[10px] text-slate-400">{selVeh.plate}</p>
                  </div>
                </div>
              </div>
              <div className="border border-slate-100 rounded-xl p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Driver</p>
                <div className="flex items-center gap-2.5">
                  <Avatar name={selDrv.name} />
                  <div>
                    <p className="text-[12px] font-bold text-slate-900">{selDrv.name}</p>
                    <p className="text-[10px] text-slate-400">Score {selDrv.safetyScore}/100</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button onClick={() => setStep(2)} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 text-[13px] font-medium rounded-xl hover:bg-slate-50 transition-colors">
              <ChevronLeft size={14} />Back
            </button>
            <div className="flex items-center gap-3">
              <button onClick={() => { handleCreateTrip(false); }}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 text-[13px] font-medium rounded-xl hover:bg-slate-50 transition-colors">
                Save as Draft
              </button>
              <button onClick={() => { handleCreateTrip(true); }}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold rounded-xl transition-all shadow-md shadow-blue-600/25">
                <Zap size={14} />Confirm & Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ΓöÇΓöÇΓöÇ MAINTENANCE ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

function MaintenanceScreen() {
  const { vehicles, setVehicles, maintenance, setMaintenance, role } = useFleet();
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [formVehicle, setFormVehicle] = useState("");
  const [formType, setFormType] = useState("");
  const [formTech, setFormTech] = useState("");
  const [formCost, setFormCost] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formError, setFormError] = useState("");

  const isReadOnly = role === "viewer";

  const handleSaveRecord = () => {
    if (!formVehicle || !formType || !formTech || !formCost || !formStart || !formEnd) {
      setFormError("All fields are required.");
      return;
    }

    const v = vehicles.find(veh => veh.id === formVehicle);
    if (!v) return;

    if (v.status === "on-trip") {
      setFormError(`Vehicle ${v.name} is currently on a trip and cannot be serviced yet.`);
      return;
    }

    const costNum = parseFloat(formCost.replace(/[^0-9.]/g, "")) || 0;

    const newRecord = {
      id: `M-00${maintenance.length + 1}`,
      vehicleId: v.id,
      vehicleName: v.name,
      type: formType,
      technician: formTech,
      start: formStart,
      end: formEnd,
      status: "in-progress",
      cost: `$${costNum.toLocaleString()}`,
      notes: formNotes,
    };

    setMaintenance([newRecord, ...maintenance]);
    
    // Set vehicle status to in-shop
    setVehicles(prev => prev.map(veh => veh.id === v.id ? { ...veh, status: "in-shop" } : veh));

    // Reset form
    setShowForm(false);
    setFormVehicle("");
    setFormType("");
    setFormTech("");
    setFormCost("");
    setFormStart("");
    setFormEnd("");
    setFormNotes("");
    setFormError("");
  };

  const handleCloseService = (id: string) => {
    const record = maintenance.find(m => m.id === id);
    if (!record) return;

    const finalCostInput = window.prompt("Enter final service cost ($):", record.cost.replace(/[^0-9.]/g, ""));
    if (finalCostInput === null) return; // User cancelled

    const finalCost = parseFloat(finalCostInput) || 0;

    // Update maintenance status
    setMaintenance(prev => prev.map(m => m.id === id ? { ...m, status: "completed", cost: `$${finalCost.toLocaleString()}` } : m));

    // Restore vehicle status to available
    setVehicles(prev => prev.map(veh => veh.id === record.vehicleId ? { ...veh, status: "available" } : veh));

    alert(`Service record ${id} marked completed.`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end">
        <button onClick={() => {
          if (isReadOnly) {
            alert("Your role has read-only access. You do not have permission to log maintenance.");
            return;
          }
          setShowForm(!showForm);
        }}
          className={cn("flex items-center gap-2 px-4 py-2.5 text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm whitespace-nowrap",
            isReadOnly ? "bg-slate-300 cursor-not-allowed shadow-none" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
          )}>
          {isReadOnly ? <Shield size={14} /> : <Plus size={14} />}New Service Record
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[15px] font-semibold text-slate-900">Add Maintenance Record</h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={14} className="text-slate-500" /></button>
          </div>
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-[12px] text-red-600">
              <AlertTriangle size={13} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Vehicle">
              <select className={ic} value={formVehicle} onChange={e => setFormVehicle(e.target.value)}>
                <option value="">Select vehicle</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>)}
              </select>
            </Field>
            <Field label="Service Type">
              <select className={ic} value={formType} onChange={e => setFormType(e.target.value)}>
                <option value="">Select type</option>
                {["Engine Repair", "Brake System", "Transmission", "Scheduled Service", "Tire Replacement", "Electrical", "Body Work", "Other"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Technician"><input className={ic} placeholder="Technician name" value={formTech} onChange={e => setFormTech(e.target.value)} /></Field>
            <Field label="Cost Estimate"><input className={ic} placeholder="$0.00" value={formCost} onChange={e => setFormCost(e.target.value)} /></Field>
            <Field label="Start Date"><input type="date" className={ic} value={formStart} onChange={e => setFormStart(e.target.value)} /></Field>
            <Field label="Estimated End Date"><input type="date" className={ic} value={formEnd} onChange={e => setFormEnd(e.target.value)} /></Field>
            <div className="sm:col-span-2">
              <Field label="Service Notes"><textarea className={cn(ic, "resize-none")} rows={3} placeholder="Describe service detailsΓÇª" value={formNotes} onChange={e => setFormNotes(e.target.value)} /></Field>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-[13px] font-medium hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={handleSaveRecord} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-semibold transition-colors">Save Record</button>
          </div>
        </div>
      )}

      {/* Active cards */}
      <div>
        <h3 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide mb-3">Active & Scheduled</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {maintenance.filter(m => m.status !== "completed").map(m => (
            <div key={m.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("size-9 rounded-xl flex items-center justify-center", m.status === "in-progress" ? "bg-orange-100" : "bg-violet-100")}>
                      <Wrench size={15} className={m.status === "in-progress" ? "text-orange-600" : "text-violet-600"} />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900">{m.type}</p>
                      <p className="text-[10px] text-slate-400">{m.id}</p>
                    </div>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
                <div className="space-y-2">
                  {[["Vehicle", m.vehicleName], ["Technician", m.technician], ["Start Date", m.start], ["Est. Completion", m.end], ["Estimated Cost", m.cost]].map(([l, v]) => (
                    <div key={l} className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">{l}</span>
                      <span className={cn("text-[12px] font-medium text-slate-700", l === "Estimated Cost" && "font-bold text-slate-900")}>{v}</span>
                    </div>
                  ))}
                </div>
                {m.notes && <p className="mt-3 pt-3 border-t border-slate-50 text-[11px] text-slate-500 leading-relaxed">{m.notes}</p>}
              </div>
              {!isReadOnly && (
                <button onClick={() => handleCloseService(m.id)} className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[12px] font-semibold rounded-lg transition-colors">
                  Complete Service & Release Vehicle
                </button>
              )}
            </div>
          ))}
          {maintenance.filter(m => m.status !== "completed").length === 0 && (
            <p className="col-span-3 py-6 text-center text-[12px] text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">No active maintenance tasks scheduled.</p>
          )}
        </div>
      </div>

      {/* History table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50">
          <h3 className="text-[13px] font-semibold text-slate-900">Service History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <TH>ID</TH><TH>Vehicle</TH><TH>Service Type</TH><TH>Technician</TH><TH>Start Date</TH><TH>Status</TH><TH>Cost</TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {maintenance.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <TD><span className="text-[11px] font-mono text-slate-400">{m.id}</span></TD>
                  <TD><span className="text-[13px] text-slate-700">{m.vehicleName}</span></TD>
                  <TD><span className="text-[13px] font-semibold text-slate-900">{m.type}</span></TD>
                  <TD><span className="text-[12px] text-slate-600">{m.technician}</span></TD>
                  <TD><span className="text-[12px] text-slate-500">{m.start}</span></TD>
                  <TD><StatusBadge status={m.status} /></TD>
                  <TD><span className="text-[13px] font-bold text-slate-900">{m.cost}</span></TD>
                </tr>
              ))}
              {maintenance.length === 0 && (
                <tr>
                  <TD colSpan={7} className="text-center py-6 text-slate-400">No service history records found</TD>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ΓöÇΓöÇΓöÇ FUEL & EXPENSES ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

function FuelScreen() {
  const { vehicles, setVehicles, drivers, fuelLogs, setFuelLogs, expenses, setExpenses, maintenance, role } = useFleet();
  const [showFuel, setShowFuel] = useState(false);
  const [showExp, setShowExp] = useState(false);

  // Fuel form states
  const [fuelVehicle, setFuelVehicle] = useState("");
  const [fuelDriver, setFuelDriver] = useState("");
  const [fuelLiters, setFuelLiters] = useState("");
  const [fuelCostPer, setFuelCostPer] = useState("");
  const [fuelDate, setFuelDate] = useState("");
  const [fuelOdometer, setFuelOdometer] = useState("");
  const [fuelStation, setFuelStation] = useState("");
  const [fuelError, setFuelError] = useState("");

  // Expense form states
  const [expVehicle, setExpVehicle] = useState("");
  const [expCategory, setExpCategory] = useState("Toll");
  const [expAmount, setExpAmount] = useState("");
  const [expDate, setExpDate] = useState("");
  const [expDesc, setExpDesc] = useState("");
  const [expReceipt, setExpReceipt] = useState(false);
  const [expError, setExpError] = useState("");

  const isReadOnly = role === "viewer";

  const parseVal = (v: any) => {
    if (typeof v === "number") return v;
    return parseFloat(String(v || "").replace(/[^0-9.]/g, "")) || 0;
  };

  // Compute stats
  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + parseVal(f.total), 0);
  const totalOtherExpenses = expenses.reduce((sum, e) => sum + parseVal(e.amount), 0);
  const totalMaintCost = maintenance.reduce((sum, m) => sum + parseVal(m.cost), 0);
  const totalOperationalCost = totalFuelCost + totalOtherExpenses + totalMaintCost;

  const handleSaveFuel = () => {
    if (!fuelVehicle || !fuelDriver || !fuelLiters || !fuelCostPer || !fuelDate || !fuelOdometer || !fuelStation) {
      setFuelError("All fields are required.");
      return;
    }

    const v = vehicles.find(veh => veh.id === fuelVehicle);
    if (!v) return;

    const litersNum = parseFloat(fuelLiters) || 0;
    const costPerNum = parseFloat(fuelCostPer) || 0;
    const odoNum = parseInt(fuelOdometer) || 0;

    if (odoNum < v.odometer) {
      setFuelError(`Odometer reading cannot be less than current vehicle odometer (${v.odometer.toLocaleString()} mi)`);
      return;
    }

    const total = litersNum * costPerNum;

    const newFuel = {
      id: `F-00${fuelLogs.length + 1}`,
      vehicleId: v.id,
      vehicleName: v.name,
      driver: fuelDriver,
      date: fuelDate,
      liters: litersNum,
      costPer: `$${costPerNum.toFixed(2)}`,
      total: `$${total.toFixed(2)}`,
      station: fuelStation,
      odometer: `${odoNum.toLocaleString()} mi`
    };

    setFuelLogs([...fuelLogs, newFuel]);

    // Update vehicle odometer if it is larger
    if (odoNum > v.odometer) {
      setVehicles(prev => prev.map(veh => veh.id === v.id ? { ...veh, odometer: odoNum, mileage: `${odoNum.toLocaleString()} mi` } : veh));
    }

    // Clean up
    setShowFuel(false);
    setFuelVehicle("");
    setFuelDriver("");
    setFuelLiters("");
    setFuelCostPer("");
    setFuelDate("");
    setFuelOdometer("");
    setFuelStation("");
    setFuelError("");
  };

  const handleSaveExpense = () => {
    if (!expVehicle || !expCategory || !expAmount || !expDate || !expDesc) {
      setExpError("All fields are required.");
      return;
    }

    const v = vehicles.find(veh => veh.id === expVehicle);
    if (!v) return;

    const amtNum = parseFloat(expAmount) || 0;

    const newExp = {
      id: `E-00${expenses.length + 1}`,
      vehicleId: v.id,
      vehicleName: v.name,
      category: expCategory,
      amount: `$${amtNum.toFixed(2)}`,
      date: expDate,
      description: expDesc,
      receipt: expReceipt
    };

    setExpenses([...expenses, newExp]);

    // Clean up
    setShowExp(false);
    setExpVehicle("");
    setExpCategory("Toll");
    setExpAmount("");
    setExpDate("");
    setExpDesc("");
    setExpReceipt(false);
    setExpError("");
  };

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Total Fuel Cost (Jan)</p>
          <p className="text-[28px] font-extrabold text-slate-900 tabular-nums mt-2">${totalFuelCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1 font-medium"><TrendingUp size={11} />+8.2% vs last month</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Total Other Expenses (Jan)</p>
          <p className="text-[28px] font-extrabold text-slate-900 tabular-nums mt-2">${totalOtherExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-[11px] text-emerald-600 mt-1.5 flex items-center gap-1 font-medium"><TrendingDown size={11} />-3.1% vs last month</p>
        </div>
        <div className="bg-blue-600 rounded-xl p-5 shadow-lg shadow-blue-600/20">
          <p className="text-[11px] font-semibold text-blue-200 uppercase tracking-wide">Total Operational Cost</p>
          <p className="text-[28px] font-extrabold text-white tabular-nums mt-2">${totalOperationalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-[11px] text-blue-200 mt-1.5">January 1ΓÇô15, 2025</p>
        </div>
      </div>

      {/* Fuel log */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <h3 className="text-[13px] font-semibold text-slate-900">Fuel Log</h3>
          <button onClick={() => {
            if (isReadOnly) {
              alert("Your role has read-only access. You do not have permission to add fuel entries.");
              return;
            }
            setShowFuel(true);
          }}
            className={cn("flex items-center gap-1.5 px-3.5 py-2 text-white text-[12px] font-semibold rounded-lg transition-colors",
              isReadOnly ? "bg-slate-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            )}>
            {isReadOnly ? <Shield size={12} /> : <Plus size={12} />}Add Fuel Entry
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <TH>Vehicle</TH><TH>Driver</TH><TH>Date</TH><TH>Liters</TH><TH>Cost/L</TH><TH>Total</TH><TH>Station</TH><TH>Odometer</TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {fuelLogs.map(f => (
                <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                  <TD><span className="text-[13px] font-semibold text-slate-900">{f.vehicleName}</span></TD>
                  <TD><span className="text-[12px] text-slate-600">{f.driver}</span></TD>
                  <TD><span className="text-[12px] text-slate-500">{f.date}</span></TD>
                  <TD><span className="text-[13px] text-slate-900 tabular-nums">{f.liters} L</span></TD>
                  <TD><span className="text-[12px] text-slate-600">{f.costPer}</span></TD>
                  <TD><span className="text-[13px] font-bold text-slate-900">{f.total}</span></TD>
                  <TD><span className="text-[11px] text-slate-400">{f.station}</span></TD>
                  <TD><span className="text-[11px] text-slate-400 tabular-nums">{f.odometer}</span></TD>
                </tr>
              ))}
              {fuelLogs.length === 0 && (
                <tr>
                  <TD colSpan={8} className="text-center py-6 text-slate-400">No fuel entries logged</TD>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense log */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <h3 className="text-[13px] font-semibold text-slate-900">Expense Log</h3>
          <button onClick={() => {
            if (isReadOnly) {
              alert("Your role has read-only access. You do not have permission to add expenses.");
              return;
            }
            setShowExp(true);
          }}
            className={cn("flex items-center gap-1.5 px-3.5 py-2 text-white text-[12px] font-semibold rounded-lg transition-colors",
              isReadOnly ? "bg-slate-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            )}>
            {isReadOnly ? <Shield size={12} /> : <Plus size={12} />}Add Expense
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <TH>Vehicle</TH><TH>Category</TH><TH>Date</TH><TH>Description</TH><TH>Amount</TH><TH>Receipt</TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {expenses.map(e => (
                <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                  <TD><span className="text-[13px] font-semibold text-slate-900">{e.vehicleName}</span></TD>
                  <TD>
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">{e.category}</span>
                  </TD>
                  <TD><span className="text-[12px] text-slate-500">{e.date}</span></TD>
                  <TD><span className="text-[12px] text-slate-700">{e.description}</span></TD>
                  <TD><span className="text-[13px] font-bold text-slate-900">{e.amount}</span></TD>
                  <TD>
                    {e.receipt
                      ? <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium"><CheckCircle size={11} />Yes</span>
                      : <span className="text-[11px] text-slate-300">No</span>}
                  </TD>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <TD colSpan={6} className="text-center py-6 text-slate-400">No expenses logged</TD>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showFuel} onClose={() => { setShowFuel(false); setFuelError(""); }} title="Add Fuel Entry">
        <div className="space-y-4">
          {fuelError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-[12px] text-red-600">
              <AlertTriangle size={13} className="shrink-0" />
              <span>{fuelError}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Vehicle">
              <select className={ic} value={fuelVehicle} onChange={e => setFuelVehicle(e.target.value)}>
                <option value="">Select vehicle</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>)}
              </select>
            </Field>
            <Field label="Driver">
              <select className={ic} value={fuelDriver} onChange={e => setFuelDriver(e.target.value)}>
                <option value="">Select driver</option>
                {drivers.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Liters"><input type="number" className={ic} value={fuelLiters} onChange={e => setFuelLiters(e.target.value)} placeholder="0" min="0" step="0.1" /></Field>
            <Field label="Cost per Liter ($)"><input type="number" className={ic} value={fuelCostPer} onChange={e => setFuelCostPer(e.target.value)} placeholder="0.00" step="0.01" min="0" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date"><input type="date" className={ic} value={fuelDate} onChange={e => setFuelDate(e.target.value)} /></Field>
            <Field label="Odometer Reading"><input type="number" className={ic} value={fuelOdometer} onChange={e => setFuelOdometer(e.target.value)} placeholder="0" min="0" /></Field>
          </div>
          <Field label="Fuel Station"><input className={ic} value={fuelStation} onChange={e => setFuelStation(e.target.value)} placeholder="e.g. Shell ΓÇö Chicago, IL" /></Field>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setShowFuel(false); setFuelError(""); }} className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-[13px] font-medium hover:bg-slate-50">Cancel</button>
            <button onClick={handleSaveFuel} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-semibold">Save Entry</button>
          </div>
        </div>
      </Modal>

      <Modal open={showExp} onClose={() => { setShowExp(false); setExpError(""); }} title="Add Expense">
        <div className="space-y-4">
          {expError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-[12px] text-red-600">
              <AlertTriangle size={13} className="shrink-0" />
              <span>{expError}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Vehicle">
              <select className={ic} value={expVehicle} onChange={e => setExpVehicle(e.target.value)}>
                <option value="">Select vehicle</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>)}
              </select>
            </Field>
            <Field label="Category">
              <select className={ic} value={expCategory} onChange={e => setExpCategory(e.target.value)}>
                {["Toll", "Parking", "Meal Allowance", "Repair", "Accommodation", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Amount ($)"><input type="number" className={ic} value={expAmount} onChange={e => setExpAmount(e.target.value)} placeholder="0.00" step="0.01" min="0" /></Field>
            <Field label="Date"><input type="date" className={ic} value={expDate} onChange={e => setExpDate(e.target.value)} /></Field>
          </div>
          <Field label="Description"><input className={ic} value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="Brief description of expense" /></Field>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input type="checkbox" checked={expReceipt} onChange={e => setExpReceipt(e.target.checked)} className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-[13px] text-slate-600">Receipt available</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setShowExp(false); setExpError(""); }} className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-[13px] font-medium hover:bg-slate-50">Cancel</button>
            <button onClick={handleSaveExpense} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-semibold">Save Expense</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ΓöÇΓöÇΓöÇ REPORTS ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

const tooltipStyle = { fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" };

function ReportsScreen() {
  const { trips, vehicles, drivers, fuelLogs, expenses, maintenance } = useFleet();

  const parseVal = (v: any) => {
    if (typeof v === "number") return v;
    return parseFloat(String(v || "").replace(/[^0-9.]/g, "")) || 0;
  };

  // KPIs
  const completedTrips = trips.filter(t => t.status === "completed");
  const totalTripsCount = trips.length;
  const totalDistance = trips.reduce((sum, t) => sum + (parseFloat(t.distance) || 0), 0);
  
  // Total cost calculation
  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + parseVal(f.total), 0);
  const totalOtherExpenses = expenses.reduce((sum, e) => sum + parseVal(e.amount), 0);
  const totalMaintCost = maintenance.reduce((sum, m) => sum + parseVal(m.cost), 0);
  const totalCost = totalFuelCost + totalOtherExpenses + totalMaintCost;
  const avgCostPerTrip = totalTripsCount > 0 ? Math.round(totalCost / totalTripsCount) : 0;

  const totalSafetyScore = drivers.reduce((sum, d) => sum + (d.safetyScore || 0), 0);
  const avgSafetyScore = drivers.length > 0 ? (totalSafetyScore / drivers.length).toFixed(1) : "0.0";

  // Dynamic ROI for Top 5 vehicles
  const dynamicRoiChartData = vehicles.map(v => {
    const vTrips = trips.filter(t => t.vehicleId === v.id && t.status === "completed");
    const vFuel = fuelLogs.filter(f => f.vehicleId === v.id).reduce((sum, f) => sum + parseVal(f.total), 0);
    const vMaint = maintenance.filter(m => m.vehicleId === v.id && m.status === "completed").reduce((sum, m) => sum + parseVal(m.cost), 0);
    const vExp = expenses.filter(e => e.vehicleId === v.id).reduce((sum, e) => sum + parseVal(e.amount), 0);
    
    const totalRev = vTrips.reduce((sum, t) => sum + (t.revenue || 0), 0);
    const totalCost = vFuel + vMaint + vExp;
    const profit = totalRev - totalCost;
    
    // Fallback/base return to look realistic if no data yet
    const baseProfit = v.odometer * 0.12; 
    const acqCost = v.acquisitionCost || 120000;
    const computedProfit = totalRev > 0 ? profit : baseProfit;
    const roiVal = Math.max(0, Math.round((computedProfit / acqCost) * 100));

    return {
      vehicle: v.plate,
      roi: roiVal || 15
    };
  }).slice(0, 5);

  // Dynamic Fuel Efficiency
  const dynamicFuelChartData = [...fuelChartData];
  if (completedTrips.length > 0) {
    const lastTrip = completedTrips[completedTrips.length - 1];
    if (lastTrip.fuelConsumed && parseFloat(lastTrip.distance) > 0) {
      const mpg = parseFloat(lastTrip.distance) / lastTrip.fuelConsumed;
      dynamicFuelChartData[dynamicFuelChartData.length - 1] = {
        ...dynamicFuelChartData[dynamicFuelChartData.length - 1],
        mpg: parseFloat((mpg * 2.35).toFixed(1)) // convert to km/L equivalent style
      };
    }
  }

  // Dynamic Operational Costs
  const dynamicOpCostChartData = opCostChartData.map(d => {
    if (d.month === "Jan") {
      return {
        month: "Jan",
        fuel: totalFuelCost,
        maintenance: totalMaintCost,
        tolls: totalOtherExpenses
      };
    }
    return d;
  });

  // Handle Export CSV
  const handleExportCSV = () => {
    const lines = [
      ["TransitOps Reports Summary", `Exported at: ${new Date().toLocaleDateString()}`],
      [],
      ["KPI Summary"],
      ["Metric", "Value"],
      ["Total Trips", totalTripsCount],
      ["Total Distance (mi)", `${totalDistance} mi`],
      ["Average Cost per Trip", `$${avgCostPerTrip}`],
      ["Average Safety Score", avgSafetyScore],
      [],
      ["Vehicle ROI Breakdown"],
      ["Registration Plate", "ROI (%)"],
      ...dynamicRoiChartData.map(r => [r.vehicle, `${r.roi}%`]),
      [],
      ["Monthly Cost Breakdown"],
      ["Month", "Fuel Cost ($)", "Maintenance Cost ($)", "Tolls & Other Cost ($)"],
      ...dynamicOpCostChartData.map(d => [d.month, d.fuel.toFixed(2), d.maintenance.toFixed(2), d.tolls.toFixed(2)])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + lines.map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transitops_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 text-[13px] font-medium rounded-xl hover:bg-slate-50 transition-colors">
          <Download size={14} />Export CSV
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          { label: "Total Trips (Jan)", value: String(totalTripsCount), icon: Navigation, color: "bg-blue-600", trend: "up" as const, trendValue: "+12% vs Dec" },
          { label: "Total Distance", value: `${totalDistance.toLocaleString()} mi`, icon: Activity, color: "bg-indigo-500", trend: "up" as const, trendValue: "+5% vs Dec" },
          { label: "Avg Cost per Trip", value: `$${avgCostPerTrip}`, icon: DollarSign, color: "bg-orange-500", trend: "down" as const, trendValue: "-2% vs Dec" },
          { label: "Avg Safety Score", value: avgSafetyScore, icon: Shield, color: "bg-emerald-500", trend: "up" as const, trendValue: "+1.2 pts" },
        ].map(k => <KPICard key={k.label} {...k} />)}
      </div>

      {/* Charts 2x2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Fuel efficiency */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <p className="text-[13px] font-semibold text-slate-900">Fuel Efficiency</p>
          <p className="text-[11px] text-slate-400 mt-0.5 mb-5">Fleet average km/L by week</p>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={dynamicFuelChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis domain={[5, 10]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="mpg" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: "#2563eb", strokeWidth: 0 }} name="km/L" />
              <Line type="monotone" dataKey="target" stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Target" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Fleet utilization */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <p className="text-[13px] font-semibold text-slate-900">Fleet Utilization</p>
          <p className="text-[11px] text-slate-400 mt-0.5 mb-5">Monthly active vehicle percentage</p>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={utilizationChartData}>
              <defs>
                <linearGradient id="utilG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v: number) => [`${v}%`, "Utilization"]} contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="pct" stroke="#2563eb" strokeWidth={2.5} fill="url(#utilG)" name="%" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Vehicle ROI */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <p className="text-[13px] font-semibold text-slate-900">Vehicle ROI</p>
          <p className="text-[11px] text-slate-400 mt-0.5 mb-5">Return on investment by vehicle (%)</p>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={dynamicRoiChartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="vehicle" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v: number) => [`${v}%`, "ROI"]} contentStyle={tooltipStyle} />
              <Bar dataKey="roi" fill="#2563eb" radius={[5, 5, 0, 0]} name="ROI %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Operational costs */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <p className="text-[13px] font-semibold text-slate-900">Operational Costs</p>
          <p className="text-[11px] text-slate-400 mt-0.5 mb-5">Monthly cost breakdown by category ($)</p>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={dynamicOpCostChartData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number, n: string) => [`$${v.toLocaleString()}`, n]} contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
              <Bar dataKey="fuel" stackId="a" fill="#2563eb" name="Fuel" />
              <Bar dataKey="maintenance" stackId="a" fill="#f97316" name="Maintenance" />
              <Bar dataKey="tolls" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} name="Tolls & Other" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ΓöÇΓöÇΓöÇ SETTINGS ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

function SettingsScreen() {
  const { currentUser, setCurrentUser, role, setRole } = useFleet();

  const [formFirst, setFormFirst] = useState(currentUser.name.split(" ")[0] || "Alex");
  const [formLast, setFormLast] = useState(currentUser.name.split(" ")[1] || "Kumar");
  const [formEmail, setFormEmail] = useState(currentUser.email || "alex.kumar@transitops.com");
  const [formPhone, setFormPhone] = useState(currentUser.phone || "+1 555-0100");
  const [formDept, setFormDept] = useState(currentUser.dept || "Fleet Operations");

  const roles = [
    { name: "Administrator", users: 2, desc: "Full system access and configuration" },
    { name: "Fleet Manager", users: 3, desc: "Fleet oversight, driver & vehicle management" },
    { name: "Dispatcher", users: 5, desc: "Trip creation and vehicle assignment only" },
    { name: "Viewer", users: 8, desc: "Read-only access to reports and fleet status" },
  ];

  const perms = ["View Fleet Overview", "Manage Vehicles", "Assign Drivers", "Dispatch Trips", "View Reports", "Manage Users", "System Settings", "Fuel & Expenses"];
  const matrix: Record<string, boolean[]> = {
    "View Fleet Overview":  [true,  true,  true,  true],
    "Manage Vehicles":      [true,  true,  false, false],
    "Assign Drivers":       [true,  true,  true,  false],
    "Dispatch Trips":       [true,  true,  true,  false],
    "View Reports":         [true,  true,  false, true],
    "Manage Users":         [true,  false, false, false],
    "System Settings":      [true,  false, false, false],
    "Fuel & Expenses":      [true,  true,  true,  false],
  };

  const handleSave = () => {
    const fullName = `${formFirst} ${formLast}`.trim();
    if (!fullName || !formEmail) {
      alert("Name and Email are required fields.");
      return;
    }
    setCurrentUser({
      ...currentUser,
      name: fullName,
      email: formEmail,
      phone: formPhone,
      dept: formDept
    });
    alert("Settings and profile changes saved successfully!");
  };

  const initials = `${formFirst[0] || ""}${formLast[0] || ""}`.toUpperCase();

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Profile */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-[14px] font-semibold text-slate-900 mb-5">User Profile</h3>
        <div className="flex items-center gap-5 mb-6">
          <div className="size-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <span className="text-xl font-extrabold text-white">{initials || "AK"}</span>
          </div>
          <div>
            <p className="text-[15px] font-bold text-slate-900">{formFirst} {formLast}</p>
            <p className="text-[13px] text-slate-500">{currentUser.roleName}</p>
            <button className="mt-1.5 text-[12px] text-blue-600 hover:text-blue-700 font-medium transition-colors">Change avatar ΓåÆ</button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First Name"><input className={ic} value={formFirst} onChange={e => setFormFirst(e.target.value)} /></Field>
          <Field label="Last Name"><input className={ic} value={formLast} onChange={e => setFormLast(e.target.value)} /></Field>
          <Field label="Email Address"><input type="email" className={ic} value={formEmail} onChange={e => setFormEmail(e.target.value)} /></Field>
          <Field label="Phone Number"><input className={ic} value={formPhone} onChange={e => setFormPhone(e.target.value)} /></Field>
          <Field label="Department"><input className={ic} value={formDept} onChange={e => setFormDept(e.target.value)} /></Field>
          <Field label="System Role (RBAC Switcher)">
            <select className={ic} value={role} onChange={e => setRole(e.target.value as any)}>
              <option value="admin">Administrator</option>
              <option value="manager">Fleet Manager</option>
              <option value="dispatcher">Dispatcher</option>
              <option value="viewer">Viewer</option>
            </select>
          </Field>
        </div>
        <div className="flex justify-end mt-5">
          <button onClick={handleSave} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm shadow-blue-600/20">
            Save Changes
          </button>
        </div>
      </div>

      {/* Role management */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <h3 className="text-[13px] font-semibold text-slate-900">Role Management</h3>
          <button onClick={() => alert("Custom role creation is disabled in the prototype.")} className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 text-slate-600 text-[12px] font-semibold rounded-lg hover:bg-slate-50 transition-colors">
            <Plus size={12} />New Role
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <TH>Role Name</TH><TH>Active Users</TH><TH>Description</TH><TH>Actions</TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {roles.map(r => (
                <tr key={r.name} className="hover:bg-slate-50/50 transition-colors">
                  <TD>
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Shield size={12} className="text-blue-600" />
                      </div>
                      <span className="text-[13px] font-semibold text-slate-900">{r.name}</span>
                    </div>
                  </TD>
                  <TD><span className="text-[12px] text-slate-600 tabular-nums">{r.users} users</span></TD>
                  <TD><span className="text-[12px] text-slate-500">{r.desc}</span></TD>
                  <TD>
                    <div className="flex items-center gap-3">
                      <button onClick={() => alert(`Editing role ${r.name} permissions...`)} className="text-[12px] text-blue-600 hover:text-blue-700 font-medium transition-colors">Edit</button>
                      {r.name !== "Administrator" && <button onClick={() => alert(`Deleting role ${r.name}...`)} className="text-[12px] text-red-500 hover:text-red-600 font-medium transition-colors">Delete</button>}
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permission matrix */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50">
          <h3 className="text-[13px] font-semibold text-slate-900">Permission Matrix</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Role-based access control ΓÇö configure what each role can do</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <TH>Permission</TH>
                {["Admin", "Manager", "Dispatcher", "Viewer"].map(r => <TH key={r}><span className="block text-center">{r}</span></TH>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {perms.map(p => (
                <tr key={p} className="hover:bg-slate-50/50 transition-colors">
                  <TD><span className="text-[13px] text-slate-700">{p}</span></TD>
                  {matrix[p].map((allowed, i) => (
                    <TD key={i}>
                      <div className="flex justify-center">
                        {allowed
                          ? <span className="inline-flex items-center justify-center size-6 bg-emerald-100 rounded-full"><CheckCircle size={12} className="text-emerald-600" /></span>
                          : <span className="inline-flex items-center justify-center size-6 bg-slate-100 rounded-full"><X size={11} className="text-slate-400" /></span>}
                      </div>
                    </TD>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ΓöÇΓöÇΓöÇ GATED ROUTE / ACCESS DENIED ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="size-16 rounded-full bg-red-50 flex items-center justify-center">
        <Shield size={28} className="text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">Access Denied</h3>
      <p className="text-sm text-slate-500 max-w-sm">
        Your account role does not have the necessary permissions to view this screen.
        Please contact your administrator if you believe this is an error.
      </p>
    </div>
  );
}

// ΓöÇΓöÇΓöÇ APP ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export default function DashboardApp() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  
  // Normalise user role for internal context
  const roleRaw = user?.role ?? "driver";
  const roleNormalized: "admin" | "manager" | "dispatcher" | "viewer" =
    roleRaw === "fleet_manager" ? "manager" : "dispatcher";
  const [role, setRole] = useState<"admin" | "manager" | "dispatcher" | "viewer">(roleNormalized);
  return (
    <FleetProvider role={role} setRole={setRole}>
      <AppContent screen={screen} setScreen={setScreen} collapsed={collapsed} setCollapsed={setCollapsed} />
    </FleetProvider>
  );
}

function AppContent({ screen, setScreen, collapsed, setCollapsed }: {
  screen: Screen; setScreen: (s: Screen) => void; collapsed: boolean; setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-[Inter,sans-serif]">
      <Sidebar screen={screen} setScreen={setScreen} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopNav screen={screen} />
        <main className="flex-1 overflow-auto p-5 lg:p-6">
          {screen === "dashboard"   && <DashboardScreen />}
          {screen === "vehicles"    && <VehiclesScreen />}
          {screen === "drivers"     && <DriversScreen />}
          {screen === "dispatch"    && <DispatchScreen />}
          {screen === "maintenance" && <MaintenanceScreen />}
          {screen === "fuel"        && <FuelScreen />}
          {screen === "reports"     && (role === "driver" || role === "safety_officer" ? <AccessDenied /> : <ReportsScreen />)}
          {screen === "settings"    && (role !== "fleet_manager" ? <AccessDenied /> : <SettingsScreen />)}
        </main>
      </div>
    </div>
  );
}
