import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard, Truck, Users, MapPin, Wrench, Fuel, BarChart3, Settings,
  Search, Bell, ChevronDown, ChevronLeft, ChevronRight, Plus, Download,
  Eye, Edit2, Trash2, CheckCircle, Clock, AlertTriangle, Calendar,
  TrendingUp, TrendingDown, Activity, LogOut, ArrowRight, DollarSign,
  Navigation, X, RefreshCw, Zap, Shield,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

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
  const { data, isLoading, isError, error } = useQuery({
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
        Checking API…
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

type Screen = "auth" | "dashboard" | "vehicles" | "drivers" | "dispatch" | "maintenance" | "fuel" | "reports" | "settings";

const TODAY = new Date("2025-01-15");


// ─── DATA ────────────────────────────────────────────────────────────────────

const vehicles = [
  { id: "V-001", name: "MAN TGX 18.440", type: "Heavy Truck", plate: "ABC-1234", year: 2021, status: "available", mileage: "45,200 mi", lastService: "Nov 15, 2024", fuel: "Diesel" },
  { id: "V-002", name: "Volvo FH16 750", type: "Heavy Truck", plate: "XYZ-5678", year: 2020, status: "on-trip", mileage: "78,300 mi", lastService: "Oct 22, 2024", fuel: "Diesel" },
  { id: "V-003", name: "Mercedes Actros", type: "Medium Truck", plate: "DEF-9012", year: 2022, status: "in-shop", mileage: "31,100 mi", lastService: "Jan 03, 2025", fuel: "Diesel" },
  { id: "V-004", name: "DAF XF 480", type: "Heavy Truck", plate: "GHI-3456", year: 2019, status: "available", mileage: "102,500 mi", lastService: "Dec 01, 2024", fuel: "Diesel" },
  { id: "V-005", name: "Scania R500", type: "Heavy Truck", plate: "JKL-7890", year: 2021, status: "on-trip", mileage: "56,800 mi", lastService: "Nov 28, 2024", fuel: "Diesel" },
  { id: "V-006", name: "Iveco Stralis XP", type: "Medium Truck", plate: "MNO-1234", year: 2018, status: "retired", mileage: "215,000 mi", lastService: "Aug 15, 2024", fuel: "Diesel" },
  { id: "V-007", name: "Ford Transit 350", type: "Light Van", plate: "PQR-5678", year: 2023, status: "available", mileage: "12,300 mi", lastService: "Jan 10, 2025", fuel: "Petrol" },
  { id: "V-008", name: "Renault T520", type: "Heavy Truck", plate: "STU-9012", year: 2020, status: "on-trip", mileage: "67,400 mi", lastService: "Dec 15, 2024", fuel: "Diesel" },
];

const driversData = [
  { id: "D-001", name: "James Mitchell", phone: "+1 555-0123", license: "CDL-A", expiry: "2025-08-15", safetyScore: 94, status: "on-duty", trips: 234, vehicle: "V-001" },
  { id: "D-002", name: "Sarah Chen", phone: "+1 555-0124", license: "CDL-A", expiry: "2026-03-22", safetyScore: 98, status: "on-duty", trips: 312, vehicle: "V-002" },
  { id: "D-003", name: "Marcus Johnson", phone: "+1 555-0125", license: "CDL-B", expiry: "2025-11-30", safetyScore: 87, status: "available", trips: 189, vehicle: null },
  { id: "D-004", name: "Elena Rodriguez", phone: "+1 555-0126", license: "CDL-A", expiry: "2025-04-10", safetyScore: 91, status: "on-duty", trips: 267, vehicle: "V-005" },
  { id: "D-005", name: "David Okafor", phone: "+1 555-0127", license: "CDL-A", expiry: "2026-07-18", safetyScore: 96, status: "on-duty", trips: 445, vehicle: "V-008" },
  { id: "D-006", name: "Lisa Park", phone: "+1 555-0128", license: "CDL-B", expiry: "2025-02-28", safetyScore: 89, status: "off-duty", trips: 156, vehicle: null },
  { id: "D-007", name: "Robert Torres", phone: "+1 555-0129", license: "CDL-A", expiry: "2025-09-05", safetyScore: 77, status: "available", trips: 98, vehicle: null },
];

const tripsData = [
  { id: "T-8821", origin: "Chicago, IL", destination: "Detroit, MI", vehicle: "V-002", driver: "Sarah Chen", cargo: "Auto Parts", weight: "12.4t", distance: "281 mi", status: "in-progress", departure: "Jan 15, 08:30", cost: "$1,240" },
  { id: "T-8820", origin: "New York, NY", destination: "Philadelphia, PA", vehicle: "V-005", driver: "Elena Rodriguez", cargo: "Electronics", weight: "8.2t", distance: "95 mi", status: "in-progress", departure: "Jan 15, 07:00", cost: "$480" },
  { id: "T-8819", origin: "Los Angeles, CA", destination: "Las Vegas, NV", vehicle: "V-008", driver: "David Okafor", cargo: "Furniture", weight: "15.8t", distance: "270 mi", status: "in-progress", departure: "Jan 15, 06:00", cost: "$980" },
  { id: "T-8818", origin: "Houston, TX", destination: "Dallas, TX", vehicle: "V-001", driver: "James Mitchell", cargo: "Food & Beverage", weight: "10.5t", distance: "239 mi", status: "pending", departure: "Jan 15, 12:00", cost: "$760" },
  { id: "T-8817", origin: "Seattle, WA", destination: "Portland, OR", vehicle: "V-004", driver: "Marcus Johnson", cargo: "Building Materials", weight: "18.2t", distance: "174 mi", status: "completed", departure: "Jan 14, 09:00", cost: "$620" },
  { id: "T-8816", origin: "Miami, FL", destination: "Orlando, FL", vehicle: "V-007", driver: "Lisa Park", cargo: "Medical Supplies", weight: "3.1t", distance: "235 mi", status: "completed", departure: "Jan 14, 08:00", cost: "$390" },
  { id: "T-8815", origin: "Denver, CO", destination: "Albuquerque, NM", vehicle: "V-004", driver: "Robert Torres", cargo: "Industrial Equip.", weight: "22.0t", distance: "451 mi", status: "cancelled", departure: "Jan 13, 07:00", cost: "$1,580" },
];

const maintenanceData = [
  { id: "M-001", vehicleName: "Mercedes Actros", type: "Engine Repair", technician: "Tom Bradley", start: "Jan 10, 2025", end: "Jan 20, 2025", status: "in-progress", cost: "$3,200", notes: "Injector replacement and full engine service" },
  { id: "M-002", vehicleName: "Iveco Stralis XP", type: "Brake System", technician: "Amy Wilson", start: "Jan 12, 2025", end: "Jan 14, 2025", status: "completed", cost: "$850", notes: "Front brake pad replacement" },
  { id: "M-003", vehicleName: "MAN TGX 18.440", type: "Scheduled Service", technician: "Tom Bradley", start: "Jan 16, 2025", end: "Jan 16, 2025", status: "scheduled", cost: "$450", notes: "50,000 km service interval" },
];

const fuelData = [
  { id: "F-001", vehicleName: "MAN TGX 18.440", driver: "James Mitchell", date: "Jan 15, 2025", liters: 120, costPer: "$1.45", total: "$174.00", station: "Shell — Chicago, IL", odometer: "45,180 mi" },
  { id: "F-002", vehicleName: "Volvo FH16 750", driver: "Sarah Chen", date: "Jan 14, 2025", liters: 95, costPer: "$1.52", total: "$144.40", station: "BP — Detroit, MI", odometer: "78,250 mi" },
  { id: "F-003", vehicleName: "Scania R500", driver: "Elena Rodriguez", date: "Jan 14, 2025", liters: 110, costPer: "$1.48", total: "$162.80", station: "Chevron — New York, NY", odometer: "56,720 mi" },
  { id: "F-004", vehicleName: "Renault T520", driver: "David Okafor", date: "Jan 13, 2025", liters: 135, costPer: "$1.39", total: "$187.65", station: "Valero — Las Vegas, NV", odometer: "67,340 mi" },
  { id: "F-005", vehicleName: "DAF XF 480", driver: "Marcus Johnson", date: "Jan 13, 2025", liters: 88, costPer: "$1.51", total: "$132.88", station: "Exxon — Seattle, WA", odometer: "102,430 mi" },
];

const expenseData = [
  { id: "E-001", vehicleName: "MAN TGX 18.440", category: "Toll", amount: "$45.50", date: "Jan 15, 2025", description: "I-90 Chicago to Detroit Toll", receipt: true },
  { id: "E-002", vehicleName: "Volvo FH16 750", category: "Parking", amount: "$28.00", date: "Jan 14, 2025", description: "Overnight parking — Detroit Terminal", receipt: true },
  { id: "E-003", vehicleName: "Scania R500", category: "Meal Allowance", amount: "$55.00", date: "Jan 14, 2025", description: "Driver meal allowance — 2 days", receipt: false },
  { id: "E-004", vehicleName: "Renault T520", category: "Repair", amount: "$320.00", date: "Jan 13, 2025", description: "Emergency tire replacement — Roadside", receipt: true },
  { id: "E-005", vehicleName: "DAF XF 480", category: "Toll", amount: "$32.00", date: "Jan 12, 2025", description: "SR-520 Toll — Seattle", receipt: true },
];

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

const roiChartData = [
  { vehicle: "V-002", roi: 34 }, { vehicle: "V-005", roi: 28 },
  { vehicle: "V-008", roi: 31 }, { vehicle: "V-001", roi: 22 },
  { vehicle: "V-004", roi: 19 },
];

const opCostChartData = [
  { month: "Aug", fuel: 8200, maintenance: 1500, tolls: 890 },
  { month: "Sep", fuel: 9100, maintenance: 2200, tolls: 1020 },
  { month: "Oct", fuel: 8750, maintenance: 1800, tolls: 950 },
  { month: "Nov", fuel: 7900, maintenance: 3400, tolls: 780 },
  { month: "Dec", fuel: 8400, maintenance: 1200, tolls: 860 },
  { month: "Jan", fuel: 9200, maintenance: 4050, tolls: 1140 },
];

// ─── UI PRIMITIVES ───────────────────────────────────────────────────────────

const statusMap: Record<string, { bg: string; text: string; dot: string }> = {
  available:     { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
  "on-trip":     { bg: "bg-blue-50",     text: "text-blue-700",    dot: "bg-blue-500" },
  "in-shop":     { bg: "bg-orange-50",   text: "text-orange-700",  dot: "bg-orange-500" },
  retired:       { bg: "bg-slate-100",   text: "text-slate-500",   dot: "bg-slate-400" },
  "in-progress": { bg: "bg-blue-50",     text: "text-blue-700",    dot: "bg-blue-500" },
  pending:       { bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-500" },
  completed:     { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
  cancelled:     { bg: "bg-red-50",      text: "text-red-700",     dot: "bg-red-400" },
  "on-duty":     { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
  "off-duty":    { bg: "bg-slate-100",   text: "text-slate-500",   dot: "bg-slate-400" },
  scheduled:     { bg: "bg-violet-50",   text: "text-violet-700",  dot: "bg-violet-500" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusMap[status] ?? { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" };
  const label = status.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
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
  const days = Math.ceil((new Date(expiry).getTime() - TODAY.getTime()) / 86400000);
  const formatted = new Date(expiry).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const cls = days > 90 ? "text-slate-600" : days > 30 ? "text-amber-600" : "text-red-600";
  return (
    <span className={cn("text-xs font-medium", cls)}>
      {days <= 30 && <AlertTriangle size={10} className="inline mr-1" />}
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

// ─── NAVIGATION CONFIG ───────────────────────────────────────────────────────

const navItems = [
  { id: "dashboard" as Screen, label: "Dashboard", Icon: LayoutDashboard },
  { id: "vehicles" as Screen, label: "Vehicles", Icon: Truck },
  { id: "drivers" as Screen, label: "Drivers", Icon: Users },
  { id: "dispatch" as Screen, label: "Trip Dispatch", Icon: Navigation },
  { id: "maintenance" as Screen, label: "Maintenance", Icon: Wrench },
  { id: "fuel" as Screen, label: "Fuel & Expenses", Icon: Fuel },
  { id: "reports" as Screen, label: "Reports", Icon: BarChart3 },
  { id: "settings" as Screen, label: "Settings", Icon: Settings },
];

const pageMeta: Record<Screen, { title: string; sub: string }> = {
  auth:        { title: "", sub: "" },
  dashboard:   { title: "Dashboard", sub: "Overview of your fleet operations" },
  vehicles:    { title: "Vehicle Registry", sub: "Manage and track your fleet inventory" },
  drivers:     { title: "Driver Management", sub: "Monitor driver performance and compliance" },
  dispatch:    { title: "Trip Dispatch", sub: "Create and assign new trip assignments" },
  maintenance: { title: "Maintenance", sub: "Track vehicle service and repairs" },
  fuel:        { title: "Fuel & Expenses", sub: "Monitor fuel consumption and operational costs" },
  reports:     { title: "Reports & Analytics", sub: "Performance insights and operational analytics" },
  settings:    { title: "Settings & RBAC", sub: "Configure system settings and access control" },
};

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────

function Sidebar({ current, onNav, collapsed, onToggle }: {
  current: Screen; onNav: (s: Screen) => void; collapsed: boolean; onToggle: () => void;
}) {
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
        {navItems.map(({ id, label, Icon }) => {
          const active = current === id;
          return (
            <button key={id} onClick={() => onNav(id)} title={collapsed ? label : undefined}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150",
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
            <Avatar name="Alex Kumar" />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-slate-200 truncate leading-none">Alex Kumar</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Fleet Admin</p>
            </div>
            <button className="p-1 hover:bg-slate-800 rounded transition-colors">
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

// ─── TOP NAV ─────────────────────────────────────────────────────────────────

function TopNav({ screen }: { screen: Screen }) {
  const { title, sub } = pageMeta[screen];
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
          <input type="text" placeholder="Search anything…"
            className="pl-8 pr-4 py-2 text-[13px] border border-slate-200 rounded-lg bg-slate-50 w-52 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all" />
        </div>
        <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell size={15} className="text-slate-500" />
          <span className="absolute top-1.5 right-1.5 size-1.5 bg-red-500 rounded-full" />
        </button>
        <button className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
          <Avatar name="Alex Kumar" />
          <span className="text-[13px] font-medium text-slate-700 hidden md:block">Alex Kumar</span>
          <ChevronDown size={11} className="text-slate-400" />
        </button>
      </div>
    </header>
  );
}

// ─── TABLE HEADER ────────────────────────────────────────────────────────────

function TH({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
      {children}
    </th>
  );
}

function TD({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-5 py-3.5", className)}>{children}</td>;
}

// ─── AUTH SCREEN ─────────────────────────────────────────────────────────────

function AuthScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("admin@transitops.com");
  const [password, setPassword] = useState("Password1234");
  const [remember, setRemember] = useState(true);
  const [demoRole, setDemoRole] = useState<"admin" | "manager" | "dispatcher">("admin");

  return (
    <div className="flex h-screen bg-white font-[Inter,sans-serif]">
      {/* Left branding */}
      <div className="hidden lg:flex w-[58%] flex-col relative overflow-hidden bg-slate-900">
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900" />
        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.15]">
          <defs>
            <pattern id="grid" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/40">
              <Truck size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[17px] font-bold text-white tracking-tight">TransitOps</p>
              <p className="text-[11px] text-blue-300 leading-none">Smart Transport Platform</p>
            </div>
          </div>

          {/* Hero text */}
          <div className="flex-1 flex flex-col justify-center max-w-sm">
            <h2 className="text-[42px] font-extrabold text-white leading-[1.1] tracking-tight mb-4">
              Smarter fleet<br />operations,<br />at scale.
            </h2>
            <p className="text-blue-200 text-[15px] leading-relaxed mb-10">
              Real-time tracking, driver compliance, and operational intelligence — unified in one enterprise platform.
            </p>

            {/* Fleet illustration */}
            <svg viewBox="0 0 420 210" className="w-full mb-10">
              {/* Road surface */}
              <path d="M-10 175 Q210 145 430 175" stroke="rgba(255,255,255,0.07)" strokeWidth="54" fill="none" />
              <path d="M-10 175 Q210 145 430 175" stroke="rgba(255,255,255,0.04)" strokeWidth="60" fill="none" />
              {/* Road dashes */}
              {[0,55,110,165,220,275,330,385].map(x => (
                <line key={x} x1={x} y1={174} x2={x + 35} y2={172} stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeDasharray="28 12" />
              ))}

              {/* Truck 1 */}
              <rect x="48" y="147" width="80" height="30" rx="5" fill="rgba(59,130,246,0.3)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
              <rect x="48" y="153" width="26" height="24" rx="4" fill="rgba(59,130,246,0.45)" />
              <rect x="77" y="150" width="51" height="20" rx="2" fill="rgba(255,255,255,0.07)" />
              <circle cx="66" cy="180" r="9" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
              <circle cx="66" cy="180" r="4" fill="rgba(255,255,255,0.08)" />
              <circle cx="112" cy="180" r="9" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
              <circle cx="112" cy="180" r="4" fill="rgba(255,255,255,0.08)" />

              {/* Truck 2 */}
              <rect x="268" y="143" width="92" height="34" rx="5" fill="rgba(99,102,241,0.25)" stroke="rgba(255,255,255,0.13)" strokeWidth="1" />
              <rect x="268" y="151" width="30" height="26" rx="4" fill="rgba(99,102,241,0.35)" />
              <rect x="302" y="146" width="58" height="24" rx="2" fill="rgba(255,255,255,0.05)" />
              <circle cx="287" cy="180" r="10" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
              <circle cx="287" cy="180" r="4.5" fill="rgba(255,255,255,0.07)" />
              <circle cx="338" cy="180" r="10" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
              <circle cx="338" cy="180" r="4.5" fill="rgba(255,255,255,0.07)" />

              {/* Pin A */}
              <circle cx="88" cy="85" r="20" fill="rgba(59,130,246,0.2)" />
              <circle cx="88" cy="85" r="11" fill="rgba(59,130,246,0.45)" />
              <circle cx="88" cy="85" r="5" fill="rgba(255,255,255,0.85)" />
              <line x1="88" y1="105" x2="88" y2="147" stroke="rgba(59,130,246,0.35)" strokeWidth="1.5" strokeDasharray="5 4" />

              {/* Pin B */}
              <circle cx="310" cy="62" r="20" fill="rgba(96,165,250,0.18)" />
              <circle cx="310" cy="62" r="11" fill="rgba(96,165,250,0.38)" />
              <circle cx="310" cy="62" r="5" fill="rgba(255,255,255,0.75)" />
              <line x1="310" y1="82" x2="310" y2="143" stroke="rgba(96,165,250,0.28)" strokeWidth="1.5" strokeDasharray="5 4" />

              {/* Route path */}
              <path d="M108 85 Q200 45 290 62" stroke="rgba(148,197,253,0.45)" strokeWidth="1.5" strokeDasharray="7 5" fill="none" />

              {/* Labels */}
              <rect x="112" y="75" width="56" height="18" rx="4" fill="rgba(255,255,255,0.08)" />
              <text x="140" y="87" fontSize="9" fill="rgba(255,255,255,0.7)" textAnchor="middle" fontFamily="Inter,sans-serif">Chicago, IL</text>
              <rect x="272" y="50" width="62" height="18" rx="4" fill="rgba(255,255,255,0.08)" />
              <text x="303" y="62" fontSize="9" fill="rgba(255,255,255,0.7)" textAnchor="middle" fontFamily="Inter,sans-serif">Detroit, MI</text>

              {/* Speed dots */}
              <circle cx="30" cy="25" r="3" fill="rgba(96,165,250,0.4)" />
              <circle cx="200" cy="18" r="3" fill="rgba(96,165,250,0.3)" />
              <circle cx="390" cy="30" r="3" fill="rgba(96,165,250,0.35)" />
            </svg>

            {/* Stats */}
            <div className="flex gap-8">
              {[{ v: "500+", l: "Enterprise Clients" }, { v: "12K+", l: "Vehicles Tracked" }, { v: "99.9%", l: "Platform Uptime" }].map(({ v, l }) => (
                <div key={l}>
                  <p className="text-[22px] font-extrabold text-white tabular-nums">{v}</p>
                  <p className="text-[11px] text-blue-300 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Role pills */}
          <div className="flex gap-3">
            {[{ r: "Dispatcher", d: "Assign & track trips" }, { r: "Fleet Manager", d: "Full fleet oversight" }, { r: "Administrator", d: "System-wide control" }].map(({ r, d }) => (
              <div key={r} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-3">
                <p className="text-[11px] font-semibold text-white">{r}</p>
                <p className="text-[10px] text-blue-300 mt-0.5">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-8">
        <div className="w-full max-w-[340px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="size-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Truck size={15} className="text-white" />
            </div>
            <span className="font-bold text-slate-900">TransitOps</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/60 p-8">
            <div className="mb-7">
              <h2 className="text-[22px] font-bold text-slate-900">Welcome back</h2>
              <p className="text-[13px] text-slate-500 mt-1">Sign in to your TransitOps account</p>
            </div>

            {/* Demo role */}
            <div className="mb-5 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-[10px] font-semibold text-blue-500 mb-2 uppercase tracking-wider">Demo Access</p>
              <div className="flex gap-1.5">
                {(["admin", "manager", "dispatcher"] as const).map(r => (
                  <button key={r} onClick={() => setDemoRole(r)}
                    className={cn("flex-1 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all",
                      demoRole === r ? "bg-blue-600 text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200")}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Field label="Email address">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={ic} placeholder="you@company.com" />
              </Field>
              <Field label="Password">
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={ic} placeholder="Enter your password" />
              </Field>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                    className="size-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-[13px] text-slate-600">Remember me</span>
                </label>
                <button className="text-[13px] text-blue-600 hover:text-blue-700 font-medium transition-colors">Forgot password?</button>
              </div>
              <button onClick={onLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold text-[14px] transition-all shadow-sm shadow-blue-600/25 hover:shadow-md hover:shadow-blue-600/25 active:scale-[0.99]">
                Sign In to TransitOps
              </button>
            </div>
          </div>
          <p className="text-center text-[11px] text-slate-400 mt-5">SOC 2 Type II certified · Enterprise-grade security</p>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function DashboardScreen() {
  const kpis = [
    { label: "Active Vehicles", value: 3, icon: Truck, trend: "up" as const, trendValue: "+1 from yesterday", color: "bg-blue-600" },
    { label: "Available Vehicles", value: 3, icon: CheckCircle, trend: "neutral" as const, trendValue: "Ready to dispatch", color: "bg-emerald-500" },
    { label: "In Maintenance", value: 2, icon: Wrench, trend: "neutral" as const, trendValue: "1 completing today", color: "bg-orange-500" },
    { label: "Active Trips", value: 3, icon: Navigation, trend: "up" as const, trendValue: "All on schedule", color: "bg-blue-600" },
    { label: "Pending Trips", value: 1, icon: Clock, trend: "neutral" as const, trendValue: "Awaiting dispatch", color: "bg-amber-500" },
    { label: "Drivers On Duty", value: 4, icon: Users, trend: "up" as const, trendValue: "+1 vs last shift", color: "bg-indigo-500" },
    { label: "Fleet Utilization", value: "75%", icon: Activity, trend: "up" as const, trendValue: "+3% this week", color: "bg-violet-500" },
  ];

  const util = [
    { label: "Heavy Trucks", total: 5, active: 3, color: "bg-blue-500" },
    { label: "Medium Trucks", total: 2, active: 1, color: "bg-indigo-500" },
    { label: "Light Vans", total: 1, active: 0, color: "bg-violet-500" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12px] text-slate-400">
          <Calendar size={13} />
          <span>January 15, 2025 — Last updated 2 mins ago</span>
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
              <p className="text-[11px] text-slate-400 mt-0.5">Latest 7 trip records</p>
            </div>
            <button className="text-[12px] text-blue-600 hover:text-blue-700 font-medium">View all →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/60">
                  <TH>Trip ID</TH><TH>Route</TH><TH>Driver</TH><TH>Cargo</TH><TH>Status</TH><TH>Cost</TH>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tripsData.map(t => (
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
                    <TD><span className="text-[12px] font-semibold text-slate-900">{t.cost}</span></TD>
                  </tr>
                ))}
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
                { l: "Total distance covered", v: "646 mi", Icon: Activity },
                { l: "Fuel consumed today", v: "333 L", Icon: Fuel },
                { l: "Operational cost", v: "$2,700", Icon: DollarSign },
                { l: "On-time trip rate", v: "100%", Icon: CheckCircle },
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
          <div className="bg-amber-50 rounded-xl border border-amber-100 p-4 flex items-start gap-2.5">
            <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-[12px] font-semibold text-amber-800">2 Alerts Require Attention</p>
              <p className="text-[11px] text-amber-600 mt-1 leading-relaxed">License expiring for Lisa Park in 44 days. V-003 engine service overdue.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── VEHICLES ────────────────────────────────────────────────────────────────

function VehiclesScreen() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const list = vehicles.filter(v =>
    (filter === "all" || v.status === filter) &&
    (v.name.toLowerCase().includes(search.toLowerCase()) || v.plate.toLowerCase().includes(search.toLowerCase()))
  );

  const counts = { all: vehicles.length, available: vehicles.filter(v => v.status === "available").length, "on-trip": vehicles.filter(v => v.status === "on-trip").length, "in-shop": vehicles.filter(v => v.status === "in-shop").length };

  return (
    <div className="space-y-5">
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by name or plate number…" value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-4 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer min-w-[150px]">
          <option value="all">All Statuses</option>
          <option value="available">Available</option>
          <option value="on-trip">On Trip</option>
          <option value="in-shop">In Shop</option>
          <option value="retired">Retired</option>
        </select>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm shadow-blue-600/20 whitespace-nowrap">
          <Plus size={14} />Add Vehicle
        </button>
      </div>

      {/* Count pills */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Fleet", val: counts.all, cls: "text-slate-900" },
          { label: "Available", val: counts.available, cls: "text-emerald-600" },
          { label: "On Trip", val: counts["on-trip"], cls: "text-blue-600" },
          { label: "In Shop", val: counts["in-shop"], cls: "text-orange-600" },
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
          <button className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 transition-colors font-medium">
            <Download size={12} />Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <TH>ID</TH><TH>Name & Model</TH><TH>Type</TH><TH>Plate</TH><TH>Year</TH><TH>Status</TH><TH>Mileage</TH><TH>Last Service</TH><TH></TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {list.map(v => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                  <TD><span className="text-[11px] font-mono text-slate-400">{v.id}</span></TD>
                  <TD>
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <Truck size={13} className="text-blue-600" />
                      </div>
                      <span className="text-[13px] font-semibold text-slate-900">{v.name}</span>
                    </div>
                  </TD>
                  <TD><span className="text-[12px] text-slate-600">{v.type}</span></TD>
                  <TD><span className="text-[12px] font-mono font-medium text-slate-700">{v.plate}</span></TD>
                  <TD><span className="text-[12px] text-slate-600">{v.year}</span></TD>
                  <TD><StatusBadge status={v.status} /></TD>
                  <TD><span className="text-[12px] text-slate-600 tabular-nums">{v.mileage}</span></TD>
                  <TD><span className="text-[12px] text-slate-400">{v.lastService}</span></TD>
                  <TD>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"><Eye size={12} className="text-blue-600" /></button>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><Edit2 size={12} className="text-slate-500" /></button>
                      <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={12} className="text-red-500" /></button>
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New Vehicle">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Vehicle Name"><input className={ic} placeholder="e.g. Volvo FH16" /></Field>
            <Field label="Type">
              <select className={ic}><option>Heavy Truck</option><option>Medium Truck</option><option>Light Van</option></select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="License Plate"><input className={ic} placeholder="ABC-1234" /></Field>
            <Field label="Year"><input type="number" className={ic} placeholder="2024" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Fuel Type">
              <select className={ic}><option>Diesel</option><option>Petrol</option><option>Electric</option><option>Hybrid</option></select>
            </Field>
            <Field label="Current Mileage"><input className={ic} placeholder="0 mi" /></Field>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-[13px] font-medium hover:bg-slate-50 transition-colors">Cancel</button>
            <button className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-semibold transition-colors">Add Vehicle</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── DRIVERS ─────────────────────────────────────────────────────────────────

function DriversScreen() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const list = driversData.filter(d =>
    (filter === "all" || d.status === filter) &&
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search driver by name…" value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-4 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer min-w-[150px]">
          <option value="all">All Statuses</option>
          <option value="on-duty">On Duty</option>
          <option value="available">Available</option>
          <option value="off-duty">Off Duty</option>
        </select>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm shadow-blue-600/20">
          <Plus size={14} />Add Driver
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50">
          <p className="text-[13px] font-medium text-slate-600">{list.length} driver{list.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <TH>Driver</TH><TH>Phone</TH><TH>License</TH><TH>Expiry</TH><TH>Safety Score</TH><TH>Status</TH><TH>Total Trips</TH><TH>Assigned Vehicle</TH><TH></TH>
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
                        <p className="text-[10px] text-slate-400">{d.id}</p>
                      </div>
                    </div>
                  </TD>
                  <TD><span className="text-[12px] text-slate-600">{d.phone}</span></TD>
                  <TD>
                    <span className="text-[11px] font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{d.license}</span>
                  </TD>
                  <TD><ExpiryBadge expiry={d.expiry} /></TD>
                  <TD><SafetyBadge score={d.safetyScore} /></TD>
                  <TD><StatusBadge status={d.status} /></TD>
                  <TD><span className="text-[13px] font-bold text-slate-900 tabular-nums">{d.trips}</span></TD>
                  <TD>
                    {d.vehicle
                      ? <span className="text-[11px] font-mono font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{d.vehicle}</span>
                      : <span className="text-[12px] text-slate-300">—</span>}
                  </TD>
                  <TD>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-blue-50 rounded-lg"><Eye size={12} className="text-blue-600" /></button>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg"><Edit2 size={12} className="text-slate-500" /></button>
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── DISPATCH ────────────────────────────────────────────────────────────────

function DispatchScreen() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ origin: "", destination: "", cargoType: "", weight: "", distance: "", notes: "", vehicleId: "", driverId: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })); };

  const v1 = () => {
    const e: Record<string, string> = {};
    if (!form.origin.trim()) e.origin = "Origin city is required";
    if (!form.destination.trim()) e.destination = "Destination city is required";
    if (!form.cargoType) e.cargoType = "Select a cargo type";
    if (!form.weight || Number(form.weight) <= 0) e.weight = "Enter a valid weight";
    if (!form.distance || Number(form.distance) <= 0) e.distance = "Enter a valid distance";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const v2 = () => {
    const e: Record<string, string> = {};
    if (!form.vehicleId) e.vehicleId = "Select a vehicle";
    if (!form.driverId) e.driverId = "Select a driver";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const availVeh = vehicles.filter(v => v.status === "available");
  const availDrv = driversData.filter(d => d.status === "available");

  const selVeh = vehicles.find(v => v.id === form.vehicleId);
  const selDrv = driversData.find(d => d.id === form.driverId);

  const stepDot = (n: number) => cn(
    "size-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 transition-all",
    step > n ? "bg-emerald-500 text-white" : step === n ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "bg-slate-100 text-slate-400"
  );
  const stepLine = (n: number) => cn("h-px flex-1", step > n ? "bg-emerald-400" : "bg-slate-200");

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
          <div>
            <h3 className="text-[15px] font-semibold text-slate-900">Route Details</h3>
            <p className="text-[12px] text-slate-400 mt-0.5">Enter trip route, cargo type and dimensions</p>
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
              <option value="">Select cargo type…</option>
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
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} className={cn(ic, "resize-none")} rows={3} placeholder="Fragile cargo, temperature control requirements…" />
          </Field>
          <div className="flex justify-end">
            <button onClick={() => { if (v1()) setStep(2); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-xl transition-all">
              Next: Assignment <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-[15px] font-semibold text-slate-900">Vehicle & Driver Assignment</h3>
            <p className="text-[12px] text-slate-400 mt-0.5">Select from currently available vehicles and drivers</p>
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
                    <p className="text-[11px] text-slate-400">{v.plate} · {v.type}</p>
                  </div>
                  {form.vehicleId === v.id && <CheckCircle size={14} className="text-blue-600 shrink-0" />}
                </button>
              ))}
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
                    <p className="text-[11px] text-slate-400">{d.license} · Score {d.safetyScore}</p>
                  </div>
                  {form.driverId === d.id && <CheckCircle size={14} className="text-blue-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 text-[13px] font-medium rounded-xl hover:bg-slate-50 transition-colors">
              <ChevronLeft size={14} />Back
            </button>
            <button onClick={() => { if (v2()) setStep(3); }} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-xl transition-all">
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
                <p className="text-[14px] font-bold text-slate-900">{form.origin} → {form.destination}</p>
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
              <button onClick={() => { setStep(1); setForm({ origin: "", destination: "", cargoType: "", weight: "", distance: "", notes: "", vehicleId: "", driverId: "" }); }}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 text-[13px] font-medium rounded-xl hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => { alert("Trip dispatched successfully!"); setStep(1); setForm({ origin: "", destination: "", cargoType: "", weight: "", distance: "", notes: "", vehicleId: "", driverId: "" }); }}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold rounded-xl transition-all shadow-md shadow-blue-600/25">
                <Zap size={14} />Dispatch Trip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAINTENANCE ─────────────────────────────────────────────────────────────

function MaintenanceScreen() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicle: "", type: "", tech: "", start: "", end: "", cost: "", notes: "" });
  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end">
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm shadow-blue-600/20">
          <Plus size={14} />New Service Record
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[15px] font-semibold text-slate-900">Add Maintenance Record</h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={14} className="text-slate-500" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Vehicle">
              <select className={ic} value={form.vehicle} onChange={e => setF("vehicle", e.target.value)}>
                <option value="">Select vehicle</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </Field>
            <Field label="Service Type">
              <select className={ic} value={form.type} onChange={e => setF("type", e.target.value)}>
                <option value="">Select type</option>
                {["Engine Repair", "Brake System", "Transmission", "Scheduled Service", "Tire Replacement", "Electrical", "Body Work", "Other"].map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Technician"><input className={ic} placeholder="Technician name" value={form.tech} onChange={e => setF("tech", e.target.value)} /></Field>
            <Field label="Cost Estimate"><input className={ic} placeholder="$0.00" value={form.cost} onChange={e => setF("cost", e.target.value)} /></Field>
            <Field label="Start Date"><input type="date" className={ic} value={form.start} onChange={e => setF("start", e.target.value)} /></Field>
            <Field label="Estimated End Date"><input type="date" className={ic} value={form.end} onChange={e => setF("end", e.target.value)} /></Field>
            <div className="sm:col-span-2">
              <Field label="Service Notes"><textarea className={cn(ic, "resize-none")} rows={3} placeholder="Describe service details…" value={form.notes} onChange={e => setF("notes", e.target.value)} /></Field>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-[13px] font-medium hover:bg-slate-50 transition-colors">Cancel</button>
            <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-semibold transition-colors">Save Record</button>
          </div>
        </div>
      )}

      {/* Active cards */}
      <div>
        <h3 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide mb-3">Active & Scheduled</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {maintenanceData.filter(m => m.status !== "completed").map(m => (
            <div key={m.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
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
          ))}
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
              {maintenanceData.map(m => (
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── FUEL & EXPENSES ─────────────────────────────────────────────────────────

function FuelScreen() {
  const [showFuel, setShowFuel] = useState(false);
  const [showExp, setShowExp] = useState(false);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Total Fuel Cost (Jan)</p>
          <p className="text-[28px] font-extrabold text-slate-900 tabular-nums mt-2">$801.73</p>
          <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1 font-medium"><TrendingUp size={11} />+8.2% vs last month</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Total Other Expenses (Jan)</p>
          <p className="text-[28px] font-extrabold text-slate-900 tabular-nums mt-2">$480.50</p>
          <p className="text-[11px] text-emerald-600 mt-1.5 flex items-center gap-1 font-medium"><TrendingDown size={11} />-3.1% vs last month</p>
        </div>
        <div className="bg-blue-600 rounded-xl p-5 shadow-lg shadow-blue-600/20">
          <p className="text-[11px] font-semibold text-blue-200 uppercase tracking-wide">Total Operational Cost</p>
          <p className="text-[28px] font-extrabold text-white tabular-nums mt-2">$1,282.23</p>
          <p className="text-[11px] text-blue-200 mt-1.5">January 1–15, 2025</p>
        </div>
      </div>

      {/* Fuel log */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <h3 className="text-[13px] font-semibold text-slate-900">Fuel Log</h3>
          <button onClick={() => setShowFuel(true)} className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold rounded-lg transition-colors">
            <Plus size={12} />Add Fuel Entry
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
              {fuelData.map(f => (
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
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense log */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <h3 className="text-[13px] font-semibold text-slate-900">Expense Log</h3>
          <button onClick={() => setShowExp(true)} className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold rounded-lg transition-colors">
            <Plus size={12} />Add Expense
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
              {expenseData.map(e => (
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
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showFuel} onClose={() => setShowFuel(false)} title="Add Fuel Entry">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Vehicle"><select className={ic}><option value="">Select vehicle</option>{vehicles.map(v => <option key={v.id}>{v.name}</option>)}</select></Field>
            <Field label="Driver"><select className={ic}><option value="">Select driver</option>{driversData.map(d => <option key={d.id}>{d.name}</option>)}</select></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Liters"><input type="number" className={ic} placeholder="0" /></Field>
            <Field label="Cost per Liter ($)"><input type="number" className={ic} placeholder="0.00" step="0.01" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date"><input type="date" className={ic} /></Field>
            <Field label="Odometer Reading"><input type="number" className={ic} placeholder="0 mi" /></Field>
          </div>
          <Field label="Fuel Station"><input className={ic} placeholder="e.g. Shell — Chicago, IL" /></Field>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowFuel(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-[13px] font-medium hover:bg-slate-50">Cancel</button>
            <button className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-semibold">Save Entry</button>
          </div>
        </div>
      </Modal>

      <Modal open={showExp} onClose={() => setShowExp(false)} title="Add Expense">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Vehicle"><select className={ic}><option value="">Select vehicle</option>{vehicles.map(v => <option key={v.id}>{v.name}</option>)}</select></Field>
            <Field label="Category">
              <select className={ic}>{["Toll", "Parking", "Meal Allowance", "Repair", "Accommodation", "Other"].map(c => <option key={c}>{c}</option>)}</select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Amount ($)"><input type="number" className={ic} placeholder="0.00" step="0.01" /></Field>
            <Field label="Date"><input type="date" className={ic} /></Field>
          </div>
          <Field label="Description"><input className={ic} placeholder="Brief description of expense" /></Field>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input type="checkbox" className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-[13px] text-slate-600">Receipt available</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowExp(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-[13px] font-medium hover:bg-slate-50">Cancel</button>
            <button className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-semibold">Save Expense</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────

const tooltipStyle = { fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" };

function ReportsScreen() {
  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 text-[13px] font-medium rounded-xl hover:bg-slate-50 transition-colors">
          <Download size={14} />Export CSV
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          { label: "Total Trips (Jan)", value: "47", icon: Navigation, color: "bg-blue-600", trend: "up" as const, trendValue: "+12% vs Dec" },
          { label: "Total Distance", value: "12,840 mi", icon: Activity, color: "bg-indigo-500", trend: "up" as const, trendValue: "+5% vs Dec" },
          { label: "Avg Cost per Trip", value: "$195", icon: DollarSign, color: "bg-orange-500", trend: "down" as const, trendValue: "-2% vs Dec" },
          { label: "Avg Safety Score", value: "90.3", icon: Shield, color: "bg-emerald-500", trend: "up" as const, trendValue: "+1.2 pts" },
        ].map(k => <KPICard key={k.label} {...k} />)}
      </div>

      {/* Charts 2x2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Fuel efficiency */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <p className="text-[13px] font-semibold text-slate-900">Fuel Efficiency</p>
          <p className="text-[11px] text-slate-400 mt-0.5 mb-5">Fleet average km/L by week</p>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={fuelChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis domain={[6, 9]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
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
            <BarChart data={roiChartData} barSize={28}>
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
            <BarChart data={opCostChartData} barSize={18}>
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

// ─── SETTINGS ────────────────────────────────────────────────────────────────

function SettingsScreen() {
  const [profile, setProfile] = useState({ first: "Alex", last: "Kumar", email: "alex.kumar@transitops.com", phone: "+1 555-0100", dept: "Fleet Operations" });
  const setP = (k: string, v: string) => setProfile(p => ({ ...p, [k]: v }));

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

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Profile */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-[14px] font-semibold text-slate-900 mb-5">User Profile</h3>
        <div className="flex items-center gap-5 mb-6">
          <div className="size-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <span className="text-xl font-extrabold text-white">AK</span>
          </div>
          <div>
            <p className="text-[15px] font-bold text-slate-900">Alex Kumar</p>
            <p className="text-[13px] text-slate-500">Fleet Administrator</p>
            <button className="mt-1.5 text-[12px] text-blue-600 hover:text-blue-700 font-medium transition-colors">Change avatar →</button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First Name"><input className={ic} value={profile.first} onChange={e => setP("first", e.target.value)} /></Field>
          <Field label="Last Name"><input className={ic} value={profile.last} onChange={e => setP("last", e.target.value)} /></Field>
          <Field label="Email Address"><input type="email" className={ic} value={profile.email} onChange={e => setP("email", e.target.value)} /></Field>
          <Field label="Phone Number"><input className={ic} value={profile.phone} onChange={e => setP("phone", e.target.value)} /></Field>
          <Field label="Department"><input className={ic} value={profile.dept} onChange={e => setP("dept", e.target.value)} /></Field>
          <Field label="System Role">
            <div className={cn(ic, "flex items-center gap-2 bg-slate-50 cursor-not-allowed select-none")}>
              <Shield size={13} className="text-blue-600" />
              <span className="text-slate-700 font-medium">Administrator</span>
              <span className="ml-auto text-[10px] text-slate-400">Managed by org</span>
            </div>
          </Field>
        </div>
        <div className="flex justify-end mt-5">
          <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm shadow-blue-600/20">
            Save Changes
          </button>
        </div>
      </div>

      {/* Role management */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <h3 className="text-[13px] font-semibold text-slate-900">Role Management</h3>
          <button className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 text-slate-600 text-[12px] font-semibold rounded-lg hover:bg-slate-50 transition-colors">
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
                      <button className="text-[12px] text-blue-600 hover:text-blue-700 font-medium transition-colors">Edit</button>
                      {r.name !== "Administrator" && <button className="text-[12px] text-red-500 hover:text-red-600 font-medium transition-colors">Delete</button>}
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
          <p className="text-[11px] text-slate-400 mt-0.5">Role-based access control — configure what each role can do</p>
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

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("auth");
  const [collapsed, setCollapsed] = useState(false);

  if (screen === "auth") {
    return <AuthScreen onLogin={() => setScreen("dashboard")} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-[Inter,sans-serif]">
      <Sidebar current={screen} onNav={setScreen} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopNav screen={screen} />
        <main className="flex-1 overflow-auto p-5 lg:p-6">
          {screen === "dashboard"   && <DashboardScreen />}
          {screen === "vehicles"    && <VehiclesScreen />}
          {screen === "drivers"     && <DriversScreen />}
          {screen === "dispatch"    && <DispatchScreen />}
          {screen === "maintenance" && <MaintenanceScreen />}
          {screen === "fuel"        && <FuelScreen />}
          {screen === "reports"     && <ReportsScreen />}
          {screen === "settings"    && <SettingsScreen />}
        </main>
      </div>
    </div>
  );
}
