import { useState, useEffect, useCallback, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart } from "recharts";
import {
  Building2, Users, Briefcase, DollarSign, FileText, Brain, RefreshCw,
  BarChart3, ChevronRight, ChevronDown, Search, Bell, Plus, Upload,
  CheckCircle, AlertTriangle, XCircle, Clock, ArrowUpRight, ArrowDownRight,
  Home, Filter, Download, Eye, Edit, Trash2, MapPin, Globe, Shield,
  TrendingUp, TrendingDown, Layers, CreditCard, FileCheck, Settings,
  Activity, Zap, Target, Award, Calendar, Hash, ChevronLeft, X, Menu
} from "lucide-react";

// ─── DESIGN TOKENS ───────────────────────────────────────────
const C = {
  bg: "#0B0F1A",
  sidebar: "#0F1320",
  card: "#141929",
  cardHover: "#1A2035",
  surface: "#1E2540",
  border: "#252D45",
  borderLight: "#2A3355",
  text: "#E8ECF4",
  textSecondary: "#8892B0",
  textMuted: "#5A6380",
  accent: "#6C5CE7",
  accentLight: "#A29BFE",
  green: "#00D68F",
  greenBg: "rgba(0,214,143,0.12)",
  red: "#FF6B6B",
  redBg: "rgba(255,107,107,0.12)",
  yellow: "#FDCB6E",
  yellowBg: "rgba(253,203,110,0.12)",
  blue: "#74B9FF",
  blueBg: "rgba(116,185,255,0.12)",
  orange: "#E17055",
  cyan: "#00CEC9",
};

// ─── SAMPLE DATA ────────────────────────────────────────────
const properties = [
  { id: "P001", name: "Horizon Tower", type: "Residential", city: "Toronto", country: "CA", status: "Active", totalUnits: 320, sold: 245, reserved: 28, available: 47, revenue: 189500000, currency: "CAD" },
  { id: "P002", name: "Manhattan Edge", type: "Mixed-Use", city: "New York", country: "US", status: "Active", totalUnits: 180, sold: 142, reserved: 15, available: 23, revenue: 285000000, currency: "USD" },
  { id: "P003", name: "Skyline Residences", type: "Residential", city: "Mumbai", country: "IN", status: "Active", totalUnits: 450, sold: 310, reserved: 55, available: 85, revenue: 4200000000, currency: "INR" },
  { id: "P004", name: "Pacific Heights", type: "Commercial", city: "Vancouver", country: "CA", status: "Active", totalUnits: 95, sold: 67, reserved: 8, available: 20, revenue: 78200000, currency: "CAD" },
  { id: "P005", name: "Austin Living", type: "Residential", city: "Austin", country: "US", status: "Pre-Launch", totalUnits: 240, sold: 0, reserved: 45, available: 195, revenue: 0, currency: "USD" },
  { id: "P006", name: "Pune Greens", type: "Residential", city: "Pune", country: "IN", status: "Active", totalUnits: 280, sold: 195, reserved: 30, available: 55, revenue: 1850000000, currency: "INR" },
];

const units = [
  { id: "U001", number: "A-101", property: "P001", type: "2BHK", floor: 1, area: 1150, price: 750000, status: "Sold", daysOnMarket: 0 },
  { id: "U002", number: "A-102", property: "P001", type: "3BHK", floor: 1, area: 1450, price: 950000, status: "Available", daysOnMarket: 45 },
  { id: "U003", number: "B-201", property: "P001", type: "Penthouse", floor: 20, area: 2800, price: 2100000, status: "Reserved", daysOnMarket: 12 },
  { id: "U004", number: "A-301", property: "P002", type: "Studio", floor: 3, area: 550, price: 890000, status: "Sold", daysOnMarket: 0 },
  { id: "U005", number: "A-302", property: "P002", type: "1BR", floor: 3, area: 780, price: 1250000, status: "Available", daysOnMarket: 78 },
  { id: "U006", number: "C-501", property: "P003", type: "2BHK", floor: 5, area: 1050, price: 8500000, status: "Sold", daysOnMarket: 0 },
  { id: "U007", number: "C-502", property: "P003", type: "3BHK", floor: 5, area: 1350, price: 12000000, status: "Available", daysOnMarket: 32 },
  { id: "U008", number: "D-101", property: "P004", type: "Office", floor: 1, area: 2200, price: 1850000, status: "Available", daysOnMarket: 90 },
];

const buyers = [
  { id: "B001", name: "Sarah Mitchell", type: "Individual", email: "sarah@email.com", phone: "+1-416-555-0102", country: "CA", kycStatus: "Verified", nsfCount: 0, nsfRisk: "green", totalPurchases: 1, outstandingBalance: 425000 },
  { id: "B002", name: "Raj Patel Corp.", type: "Corporate", email: "raj@patelcorp.in", phone: "+91-22-5555-0103", country: "IN", kycStatus: "Verified", nsfCount: 3, nsfRisk: "red", totalPurchases: 4, outstandingBalance: 18500000 },
  { id: "B003", name: "James & Laura Chen", type: "Joint", email: "jchen@email.com", phone: "+1-212-555-0104", country: "US", kycStatus: "Pending", nsfCount: 1, nsfRisk: "yellow", totalPurchases: 2, outstandingBalance: 890000 },
  { id: "B004", name: "Priya Sharma", type: "Individual", email: "priya@email.com", phone: "+91-98-5555-0105", country: "IN", kycStatus: "Verified", nsfCount: 0, nsfRisk: "green", totalPurchases: 1, outstandingBalance: 3200000 },
  { id: "B005", name: "David Thompson", type: "Individual", email: "david@email.com", phone: "+1-604-555-0106", country: "CA", kycStatus: "Verified", nsfCount: 0, nsfRisk: "green", totalPurchases: 1, outstandingBalance: 0 },
  { id: "B006", name: "Maple Investments Ltd.", type: "Corporate", email: "info@maple.ca", phone: "+1-416-555-0107", country: "CA", kycStatus: "Verified", nsfCount: 2, nsfRisk: "yellow", totalPurchases: 6, outstandingBalance: 2150000 },
];

const brokers = [
  { id: "BR001", name: "Re/Max Elite", type: "Firm", license: "ON-2024-8891", country: "CA", status: "Active", totalSales: 48, totalRevenue: 42500000, commission: 1275000, model: "Tiered %" },
  { id: "BR002", name: "Century 21 NYC", type: "Firm", license: "NY-2024-4421", country: "US", status: "Active", totalSales: 35, totalRevenue: 68200000, commission: 2046000, model: "Flat 3%" },
  { id: "BR003", name: "Vikram Desai", type: "Individual", license: "MH-RERA-2024-112", country: "IN", status: "Active", totalSales: 62, totalRevenue: 520000000, commission: 15600000, model: "Flat 3%" },
  { id: "BR004", name: "Pacific Realty Group", type: "Firm", license: "BC-2024-7720", country: "CA", status: "Active", totalSales: 22, totalRevenue: 31000000, commission: 1085000, model: "Tiered Value" },
  { id: "BR005", name: "Jane Foster", type: "Individual", license: "TX-2024-9933", country: "US", status: "Active", totalSales: 18, totalRevenue: 14200000, commission: 426000, model: "Hybrid" },
];

const sales = [
  { id: "S001", property: "Horizon Tower", unit: "A-101", buyer: "Sarah Mitchell", broker: "Re/Max Elite", price: 750000, currency: "CAD", date: "2026-01-15", status: "Completed", source: "AI Extraction", country: "CA" },
  { id: "S002", property: "Manhattan Edge", unit: "A-301", buyer: "James & Laura Chen", broker: "Century 21 NYC", price: 890000, currency: "USD", date: "2026-02-01", status: "Confirmed", source: "Manual Entry", country: "US" },
  { id: "S003", property: "Skyline Residences", unit: "C-501", buyer: "Raj Patel Corp.", broker: "Vikram Desai", price: 8500000, currency: "INR", date: "2026-01-28", status: "Completed", source: "AI Extraction", country: "IN" },
  { id: "S004", property: "Horizon Tower", unit: "B-201", buyer: "Maple Investments Ltd.", broker: "Re/Max Elite", price: 2100000, currency: "CAD", date: "2026-02-20", status: "Pending Review", source: "AI Extraction", country: "CA" },
  { id: "S005", property: "Skyline Residences", unit: "C-408", buyer: "Priya Sharma", broker: "Vikram Desai", price: 12000000, currency: "INR", date: "2026-02-18", status: "Confirmed", source: "Manual Entry", country: "IN" },
  { id: "S006", property: "Pacific Heights", unit: "D-305", buyer: "David Thompson", broker: "Pacific Realty Group", price: 1850000, currency: "CAD", date: "2025-12-10", status: "Completed", source: "AI Extraction", country: "CA" },
];

const monthlyRevenue = [
  { month: "Mar", current: 18.2, previous: 14.5 }, { month: "Apr", current: 22.1, previous: 17.8 },
  { month: "May", current: 19.8, previous: 20.2 }, { month: "Jun", current: 25.4, previous: 19.1 },
  { month: "Jul", current: 28.9, previous: 22.5 }, { month: "Aug", current: 24.3, previous: 24.8 },
  { month: "Sep", current: 31.2, previous: 26.1 }, { month: "Oct", current: 27.8, previous: 23.4 },
  { month: "Nov", current: 33.5, previous: 28.9 }, { month: "Dec", current: 29.1, previous: 31.2 },
  { month: "Jan", current: 35.8, previous: 27.6 }, { month: "Feb", current: 38.2, previous: 30.1 },
];

const salesByCountry = [
  { country: "USA", units: 195, revenue: 299.2, fill: C.blue },
  { country: "Canada", units: 340, revenue: 267.7, fill: C.accent },
  { country: "India", units: 505, revenue: 605.0, fill: C.green },
];

const inventoryByType = [
  { type: "Studio", available: 35, sold: 88, reserved: 12 },
  { type: "1BR", available: 52, sold: 145, reserved: 18 },
  { type: "2BHK", available: 68, sold: 210, reserved: 25 },
  { type: "3BHK", available: 45, sold: 178, reserved: 22 },
  { type: "Penthouse", available: 12, sold: 28, reserved: 5 },
  { type: "Office", available: 28, sold: 52, reserved: 8 },
  { type: "Retail", available: 15, sold: 38, reserved: 6 },
];

const aiDocuments = [
  { id: "D001", filename: "Sale_Agreement_A101.pdf", property: "Horizon Tower", status: "Completed", confidence: 94, fieldsExtracted: 28, fieldsCorrected: 2, date: "2026-01-15" },
  { id: "D002", filename: "Purchase_Contract_A301.pdf", property: "Manhattan Edge", status: "In Review", confidence: 87, fieldsExtracted: 25, fieldsCorrected: 0, date: "2026-02-01" },
  { id: "D003", filename: "RERA_Agreement_C501.pdf", property: "Skyline Residences", status: "Completed", confidence: 91, fieldsExtracted: 32, fieldsCorrected: 3, date: "2026-01-28" },
  { id: "D004", filename: "Closing_Disclosure_B201.pdf", property: "Horizon Tower", status: "Processing", confidence: 0, fieldsExtracted: 0, fieldsCorrected: 0, date: "2026-02-25" },
  { id: "D005", filename: "Agreement_C408.pdf", property: "Skyline Residences", status: "Exception Queue", confidence: 72, fieldsExtracted: 18, fieldsCorrected: 0, date: "2026-02-18" },
];

const yardiSyncLog = [
  { id: 1, type: "Payable", entity: "Re/Max Elite - Commission S001", status: "Synced", yardiId: "YV-PAY-8812", timestamp: "2026-02-25 14:32" },
  { id: 2, type: "Receivable", entity: "Sarah Mitchell - Installment 3", status: "Synced", yardiId: "YV-REC-4401", timestamp: "2026-02-25 14:32" },
  { id: 3, type: "Payable", entity: "Vikram Desai - Commission S003", status: "Error", yardiId: null, timestamp: "2026-02-25 14:33" },
  { id: 4, type: "Inventory", entity: "Full Sync - 1,565 units", status: "Synced", yardiId: "SYNC-0225", timestamp: "2026-02-25 06:00" },
  { id: 5, type: "Receivable", entity: "Raj Patel Corp. - Installment 5", status: "Pending", yardiId: null, timestamp: "2026-02-25 14:35" },
  { id: 6, type: "Payable", entity: "Century 21 NYC - Commission S002", status: "Synced", yardiId: "YV-PAY-8815", timestamp: "2026-02-24 09:15" },
];

const nsfEvents = [
  { id: "NSF001", buyer: "Raj Patel Corp.", sale: "S003", amount: 850000, currency: "INR", date: "2025-11-15", fine: 25000, fineStatus: "Paid", reason: "Insufficient Funds" },
  { id: "NSF002", buyer: "Raj Patel Corp.", sale: "S003", amount: 850000, currency: "INR", date: "2025-12-20", fine: 25000, fineStatus: "Paid", reason: "Insufficient Funds" },
  { id: "NSF003", buyer: "Raj Patel Corp.", sale: "S005", amount: 1200000, currency: "INR", date: "2026-01-28", fine: 30000, fineStatus: "Pending", reason: "Uncollected Funds" },
  { id: "NSF004", buyer: "James & Laura Chen", sale: "S002", amount: 44500, currency: "USD", date: "2026-02-05", fine: 250, fineStatus: "Invoiced", reason: "Insufficient Funds" },
  { id: "NSF005", buyer: "Maple Investments Ltd.", sale: "S004", amount: 105000, currency: "CAD", date: "2026-01-10", fine: 300, fineStatus: "Paid", reason: "Insufficient Funds" },
  { id: "NSF006", buyer: "Maple Investments Ltd.", sale: "S004", amount: 105000, currency: "CAD", date: "2026-02-12", fine: 300, fineStatus: "Pending", reason: "Account Closed" },
];

// ─── UTILITY FUNCTIONS ──────────────────────────────────────
const fmt = (n, cur = "USD") => {
  if (cur === "INR") {
    if (n >= 10000000) return `₹${(n/10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n/100000).toFixed(1)}L`;
    return `₹${n.toLocaleString("en-IN")}`;
  }
  const sym = cur === "CAD" ? "C$" : "$";
  if (n >= 1000000000) return `${sym}${(n/1000000000).toFixed(1)}B`;
  if (n >= 1000000) return `${sym}${(n/1000000).toFixed(1)}M`;
  if (n >= 1000) return `${sym}${(n/1000).toFixed(0)}K`;
  return `${sym}${n.toLocaleString()}`;
};

const flag = (c) => ({ US: "🇺🇸", CA: "🇨🇦", IN: "🇮🇳" }[c] || "🌍");

const statusColor = (s) => {
  const m = { Sold: C.green, Completed: C.green, Active: C.green, Synced: C.green, Verified: C.green, Available: C.blue, "In Review": C.yellow, "Pending Review": C.yellow, Pending: C.yellow, Processing: C.yellow, Reserved: C.accent, "Pre-Launch": C.cyan, Confirmed: C.accentLight, Error: C.red, Cancelled: C.red, Failed: C.red, "Exception Queue": C.orange, Draft: C.textMuted, Invoiced: C.yellow, Paid: C.green, Waived: C.textMuted };
  return m[s] || C.textSecondary;
};

const statusBg = (s) => `${statusColor(s)}18`;

// ─── REUSABLE COMPONENTS ────────────────────────────────────
const Badge = ({ children, color, bg }) => (
  <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, color: color || C.text, background: bg || C.surface, whiteSpace: "nowrap" }}>{children}</span>
);

const StatusBadge = ({ status }) => (
  <Badge color={statusColor(status)} bg={statusBg(status)}>{status}</Badge>
);

const NsfBadge = ({ risk }) => {
  const m = { green: { label: "Low", color: C.green, bg: C.greenBg }, yellow: { label: "Medium", color: C.yellow, bg: C.yellowBg }, red: { label: "High", color: C.red, bg: C.redBg } };
  const v = m[risk] || m.green;
  return <Badge color={v.color} bg={v.bg}>{v.label} Risk</Badge>;
};

const CountryBadge = ({ country }) => (
  <span style={{ fontSize: 13 }}>{flag(country)}</span>
);

const KPI = ({ icon: Icon, label, value, sub, trend, trendUp, color }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color || C.accent}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={18} color={color || C.accent} />
      </div>
      {trend && (
        <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 600, color: trendUp ? C.green : C.red }}>
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      )}
    </div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 700, color: C.text, letterSpacing: -0.5, lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>{label}</div>
    </div>
    {sub && <div style={{ fontSize: 11, color: C.textMuted }}>{sub}</div>}
  </div>
);

const Card = ({ title, children, action, style: extraStyle }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", ...extraStyle }}>
    {title && (
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{title}</span>
        {action}
      </div>
    )}
    <div style={{ padding: 20 }}>{children}</div>
  </div>
);

const DataTable = ({ columns, data, onRowClick }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr>{columns.map((col, i) => (
          <th key={i} style={{ padding: "10px 14px", textAlign: "left", color: C.textMuted, fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{col.label}</th>
        ))}</tr>
      </thead>
      <tbody>{data.map((row, ri) => (
        <tr key={ri} onClick={() => onRowClick?.(row)} style={{ cursor: onRowClick ? "pointer" : "default", transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = C.cardHover} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          {columns.map((col, ci) => (
            <td key={ci} style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}08`, color: col.muted ? C.textSecondary : C.text, whiteSpace: "nowrap" }}>
              {col.render ? col.render(row) : row[col.key]}
            </td>
          ))}
        </tr>
      ))}</tbody>
    </table>
  </div>
);

const Btn = ({ children, variant = "primary", icon: Icon, onClick, small }) => {
  const styles = {
    primary: { background: C.accent, color: "#fff", border: "none" },
    secondary: { background: "transparent", color: C.textSecondary, border: `1px solid ${C.border}` },
    danger: { background: C.redBg, color: C.red, border: `1px solid ${C.red}30` },
    success: { background: C.greenBg, color: C.green, border: `1px solid ${C.green}30` },
  };
  return (
    <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: small ? "5px 12px" : "8px 16px", borderRadius: 8, fontSize: small ? 12 : 13, fontWeight: 500, cursor: "pointer", transition: "all 0.15s", ...styles[variant] }}>
      {Icon && <Icon size={small ? 13 : 15} />}{children}
    </button>
  );
};

const TabBar = ({ tabs, active, onChange }) => (
  <div style={{ display: "flex", gap: 2, borderBottom: `1px solid ${C.border}`, marginBottom: 20 }}>
    {tabs.map(t => (
      <button key={t.key} onClick={() => onChange(t.key)} style={{ padding: "10px 18px", fontSize: 13, fontWeight: 500, color: active === t.key ? C.accent : C.textSecondary, background: "transparent", border: "none", borderBottom: `2px solid ${active === t.key ? C.accent : "transparent"}`, cursor: "pointer", transition: "all 0.15s" }}>
        {t.label} {t.count !== undefined && <span style={{ marginLeft: 5, padding: "1px 7px", borderRadius: 10, fontSize: 10, background: active === t.key ? `${C.accent}25` : C.surface, color: active === t.key ? C.accentLight : C.textMuted }}>{t.count}</span>}
      </button>
    ))}
  </div>
);

const SearchBar = ({ placeholder, value, onChange }) => (
  <div style={{ position: "relative", width: "100%", maxWidth: 320 }}>
    <Search size={15} color={C.textMuted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "8px 12px 8px 36px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
  </div>
);

const ProgressBar = ({ value, max = 100, color }) => (
  <div style={{ width: "100%", height: 6, borderRadius: 3, background: C.surface }}>
    <div style={{ width: `${(value/max)*100}%`, height: "100%", borderRadius: 3, background: color || C.accent, transition: "width 0.5s ease" }} />
  </div>
);

const Stat = ({ label, value, color }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontSize: 22, fontWeight: 700, color: color || C.text }}>{value}</div>
    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{label}</div>
  </div>
);

// ─── NAVIGATION ─────────────────────────────────────────────
const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: Home },
  { key: "properties", label: "Properties", icon: Building2 },
  { key: "sales", label: "Sales", icon: FileText },
  { key: "buyers", label: "Buyers", icon: Users },
  { key: "brokers", label: "Brokers", icon: Briefcase },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "ai", label: "AI Engine", icon: Brain },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "yardi", label: "Yardi Sync", icon: RefreshCw },
  { key: "compliance", label: "Compliance", icon: Shield },
];

// ─── PAGE: DASHBOARD ────────────────────────────────────────
const DashboardPage = () => {
  const totalRevenue = properties.reduce((a, p) => a + (p.currency === "INR" ? p.revenue/83 : p.currency === "CAD" ? p.revenue/1.36 : p.revenue), 0);
  const totalUnits = properties.reduce((a, p) => a + p.totalUnits, 0);
  const soldUnits = properties.reduce((a, p) => a + p.sold, 0);
  const availableUnits = properties.reduce((a, p) => a + p.available, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <KPI icon={DollarSign} label="Total Revenue (USD equiv.)" value={fmt(totalRevenue)} trend="+18.2%" trendUp color={C.green} sub="Across all properties & countries" />
        <KPI icon={Target} label="Units Sold" value={soldUnits.toLocaleString()} trend="+12.5%" trendUp color={C.accent} sub={`of ${totalUnits.toLocaleString()} total units`} />
        <KPI icon={Layers} label="Available Inventory" value={availableUnits.toLocaleString()} color={C.blue} sub={`${((availableUnits/totalUnits)*100).toFixed(1)}% remaining`} />
        <KPI icon={Clock} label="Avg Days to Close" value="34" trend="-8 days" trendUp color={C.cyan} sub="Improved from 42 days" />
        <KPI icon={Briefcase} label="Commissions Payable" value={fmt(4832000)} color={C.orange} sub="12 pending approval" />
        <KPI icon={Activity} label="AI Accuracy" value="92.4%" trend="+3.1%" trendUp color={C.green} sub="Based on 156 documents" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <Card title="Revenue Trend — YoY Comparison" action={<Badge color={C.textSecondary}>Last 12 Months</Badge>}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="gCur" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.accent} stopOpacity={0.3} /><stop offset="95%" stopColor={C.accent} stopOpacity={0} /></linearGradient>
                <linearGradient id="gPrev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.textMuted} stopOpacity={0.15} /><stop offset="95%" stopColor={C.textMuted} stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="month" stroke={C.textMuted} fontSize={11} />
              <YAxis stroke={C.textMuted} fontSize={11} tickFormatter={v => `$${v}M`} />
              <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text }} />
              <Area type="monotone" dataKey="previous" name="2025" stroke={C.textMuted} fill="url(#gPrev)" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="current" name="2026" stroke={C.accent} fill="url(#gCur)" strokeWidth={2} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: C.textSecondary }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Sales by Country">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={salesByCountry} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="units" nameKey="country" strokeWidth={0}>
                {salesByCountry.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8 }}>
            {salesByCountry.map(c => (
              <div key={c.country} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.textSecondary }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.fill }} />
                {c.country} ({c.units})
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card title="Recent Sales" action={<Btn variant="secondary" small icon={ChevronRight}>View All</Btn>}>
          <DataTable columns={[
            { label: "Sale", key: "id" },
            { label: "Property", key: "property" },
            { label: "Unit", key: "unit" },
            { label: "Buyer", key: "buyer" },
            { label: "Price", render: r => fmt(r.price, r.currency) },
            { label: "Status", render: r => <StatusBadge status={r.status} /> },
          ]} data={sales.slice(0, 4)} />
        </Card>

        <Card title="AI Document Queue" action={<Badge color={C.yellow} bg={C.yellowBg}>3 Need Review</Badge>}>
          <DataTable columns={[
            { label: "Document", render: r => <span style={{ display: "flex", alignItems: "center", gap: 6 }}><FileText size={14} color={C.accent} />{r.filename}</span> },
            { label: "Status", render: r => <StatusBadge status={r.status} /> },
            { label: "Confidence", render: r => r.confidence > 0 ? <span style={{ color: r.confidence >= 90 ? C.green : r.confidence >= 80 ? C.yellow : C.red }}>{r.confidence}%</span> : "—" },
          ]} data={aiDocuments.slice(0, 4)} />
        </Card>
      </div>
    </div>
  );
};

// ─── PAGE: PROPERTIES ───────────────────────────────────────
const PropertiesPage = () => {
  const [search, setSearch] = useState("");
  const filtered = properties.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SearchBar placeholder="Search properties..." value={search} onChange={setSearch} />
        <Btn icon={Plus}>Add Property</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "none"; }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: C.textSecondary, display: "flex", alignItems: "center", gap: 6 }}>
                  <CountryBadge country={p.country} /> {p.city} · {p.type}
                </div>
              </div>
              <StatusBadge status={p.status} />
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <div style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: C.greenBg, textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.green }}>{p.sold}</div>
                <div style={{ fontSize: 10, color: C.green, opacity: 0.7 }}>Sold</div>
              </div>
              <div style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: `${C.accent}15`, textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.accentLight }}>{p.reserved}</div>
                <div style={{ fontSize: 10, color: C.accentLight, opacity: 0.7 }}>Reserved</div>
              </div>
              <div style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: C.blueBg, textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.blue }}>{p.available}</div>
                <div style={{ fontSize: 10, color: C.blue, opacity: 0.7 }}>Available</div>
              </div>
            </div>

            <ProgressBar value={p.sold} max={p.totalUnits} color={C.green} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: C.textMuted }}>
              <span>{((p.sold/p.totalUnits)*100).toFixed(0)}% sold</span>
              <span>{fmt(p.revenue, p.currency)} revenue</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── PAGE: SALES ────────────────────────────────────────────
const SalesPage = () => {
  const [tab, setTab] = useState("all");
  const filtered = tab === "all" ? sales : sales.filter(s => s.status === tab);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <TabBar tabs={[
          { key: "all", label: "All Sales", count: sales.length },
          { key: "Pending Review", label: "Pending Review", count: sales.filter(s => s.status === "Pending Review").length },
          { key: "Confirmed", label: "Confirmed", count: sales.filter(s => s.status === "Confirmed").length },
          { key: "Completed", label: "Completed", count: sales.filter(s => s.status === "Completed").length },
        ]} active={tab} onChange={setTab} />
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="secondary" icon={Upload} small>AI Upload</Btn>
          <Btn icon={Plus} small>New Sale</Btn>
        </div>
      </div>

      <Card>
        <DataTable columns={[
          { label: "Sale ID", key: "id" },
          { label: "Property", key: "property" },
          { label: "Unit", key: "unit" },
          { label: "Buyer", key: "buyer" },
          { label: "Broker", key: "broker" },
          { label: "", render: r => <CountryBadge country={r.country} /> },
          { label: "Price", render: r => <span style={{ fontWeight: 600 }}>{fmt(r.price, r.currency)}</span> },
          { label: "Date", key: "date", muted: true },
          { label: "Source", render: r => <Badge color={r.source === "AI Extraction" ? C.accentLight : C.textSecondary} bg={r.source === "AI Extraction" ? `${C.accent}20` : C.surface}>{r.source === "AI Extraction" ? "🤖 AI" : "✏️ Manual"}</Badge> },
          { label: "Status", render: r => <StatusBadge status={r.status} /> },
        ]} data={filtered} />
      </Card>
    </div>
  );
};

// ─── PAGE: BUYERS ───────────────────────────────────────────
const BuyersPage = () => {
  const [tab, setTab] = useState("profiles");
  const [search, setSearch] = useState("");
  const filtered = buyers.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <TabBar tabs={[
        { key: "profiles", label: "Buyer Profiles", count: buyers.length },
        { key: "nsf", label: "NSF History", count: nsfEvents.length },
      ]} active={tab} onChange={setTab} />

      {tab === "profiles" ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <SearchBar placeholder="Search buyers..." value={search} onChange={setSearch} />
            <Btn icon={Plus}>Add Buyer</Btn>
          </div>
          <Card>
            <DataTable columns={[
              { label: "Buyer", render: r => <div><div style={{ fontWeight: 500 }}>{r.name}</div><div style={{ fontSize: 11, color: C.textMuted }}>{r.email}</div></div> },
              { label: "", render: r => <CountryBadge country={r.country} /> },
              { label: "Type", key: "type", muted: true },
              { label: "KYC", render: r => <StatusBadge status={r.kycStatus} /> },
              { label: "NSF Risk", render: r => <NsfBadge risk={r.nsfRisk} /> },
              { label: "NSF Count", render: r => <span style={{ color: r.nsfCount > 0 ? C.yellow : C.textMuted, fontWeight: r.nsfCount > 0 ? 600 : 400 }}>{r.nsfCount}</span> },
              { label: "Purchases", key: "totalPurchases" },
              { label: "Outstanding", render: r => r.outstandingBalance > 0 ? fmt(r.outstandingBalance, r.country === "IN" ? "INR" : r.country === "CA" ? "CAD" : "USD") : <span style={{ color: C.green }}>Paid</span> },
            ]} data={filtered} />
          </Card>
        </>
      ) : (
        <Card title="NSF Check History & Fines" action={<Badge color={C.red} bg={C.redBg}>{nsfEvents.filter(n => n.fineStatus === "Pending").length} Pending Fines</Badge>}>
          <DataTable columns={[
            { label: "NSF ID", key: "id" },
            { label: "Buyer", key: "buyer" },
            { label: "Sale", key: "sale" },
            { label: "Amount", render: r => fmt(r.amount, r.currency) },
            { label: "NSF Date", key: "date" },
            { label: "Reason", key: "reason", muted: true },
            { label: "Fine", render: r => <span style={{ fontWeight: 600, color: C.orange }}>{fmt(r.fine, r.currency)}</span> },
            { label: "Fine Status", render: r => <StatusBadge status={r.fineStatus} /> },
          ]} data={nsfEvents} />
        </Card>
      )}
    </div>
  );
};

// ─── PAGE: BROKERS ──────────────────────────────────────────
const BrokersPage = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ fontSize: 13, color: C.textSecondary }}>{brokers.length} active brokers & firms</div>
      <Btn icon={Plus}>Add Broker</Btn>
    </div>

    <Card>
      <DataTable columns={[
        { label: "Broker / Firm", render: r => <div><div style={{ fontWeight: 500 }}>{r.name}</div><div style={{ fontSize: 11, color: C.textMuted }}>License: {r.license}</div></div> },
        { label: "", render: r => <CountryBadge country={r.country} /> },
        { label: "Type", render: r => <Badge>{r.type}</Badge> },
        { label: "Model", render: r => <Badge color={C.accentLight} bg={`${C.accent}20`}>{r.model}</Badge> },
        { label: "Sales", render: r => <span style={{ fontWeight: 600 }}>{r.totalSales}</span> },
        { label: "Revenue", render: r => fmt(r.totalRevenue, r.country === "IN" ? "INR" : r.country === "CA" ? "CAD" : "USD") },
        { label: "Commission", render: r => <span style={{ color: C.green, fontWeight: 600 }}>{fmt(r.commission, r.country === "IN" ? "INR" : r.country === "CA" ? "CAD" : "USD")}</span> },
        { label: "Status", render: r => <StatusBadge status={r.status} /> },
      ]} data={brokers} />
    </Card>

    <Card title="Commission Models Supported">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {["Flat %", "Tiered %", "Flat Fee", "Hybrid", "Split", "Override", "Tiered Value", "GCI Cap", "Cascading Split", "Buyer-Paid (Post-NAR)"].map(m => (
          <div key={m} style={{ padding: "12px 16px", borderRadius: 8, background: C.surface, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
            <Zap size={14} color={C.accent} />{m}
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// ─── PAGE: PAYMENTS ─────────────────────────────────────────
const PaymentsPage = () => {
  const [tab, setTab] = useState("payables");
  const payables = [
    { id: "PAY001", broker: "Re/Max Elite", sale: "S001", amount: 22500, currency: "CAD", status: "Paid", dueDate: "2026-02-15", yardi: "Synced" },
    { id: "PAY002", broker: "Century 21 NYC", sale: "S002", amount: 26700, currency: "USD", status: "Approved", dueDate: "2026-03-01", yardi: "Pending" },
    { id: "PAY003", broker: "Vikram Desai", sale: "S003", amount: 255000, currency: "INR", status: "Pending", dueDate: "2026-03-10", yardi: "Not Synced" },
    { id: "PAY004", broker: "Re/Max Elite", sale: "S004", amount: 63000, currency: "CAD", status: "Pending", dueDate: "2026-03-20", yardi: "Not Synced" },
    { id: "PAY005", broker: "Pacific Realty Group", sale: "S006", amount: 64750, currency: "CAD", status: "Paid", dueDate: "2026-01-10", yardi: "Synced" },
  ];
  const receivables = [
    { id: "REC001", buyer: "Sarah Mitchell", sale: "S001", installment: "3 of 12", amount: 35417, currency: "CAD", due: "2026-03-15", status: "Upcoming", yardi: "Synced" },
    { id: "REC002", buyer: "Raj Patel Corp.", sale: "S003", installment: "Milestone 4", amount: 1275000, currency: "INR", due: "2026-02-28", status: "Overdue", yardi: "Synced" },
    { id: "REC003", buyer: "James & Laura Chen", sale: "S002", installment: "2 of 8", amount: 55625, currency: "USD", due: "2026-03-01", status: "Due", yardi: "Pending" },
    { id: "REC004", buyer: "Priya Sharma", sale: "S005", installment: "Milestone 2", amount: 1800000, currency: "INR", due: "2026-04-15", status: "Upcoming", yardi: "Not Synced" },
    { id: "REC005", buyer: "Maple Investments Ltd.", sale: "S004", installment: "1 of 6", amount: 350000, currency: "CAD", due: "2026-03-20", status: "Due", yardi: "Not Synced" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <KPI icon={ArrowUpRight} label="Total Payables" value={fmt(176950)} color={C.orange} sub="5 commissions" />
        <KPI icon={ArrowDownRight} label="Total Receivables" value={fmt(2516042)} color={C.blue} sub="5 installments" />
        <KPI icon={CheckCircle} label="Collected (Feb)" value={fmt(1845000)} color={C.green} sub="82% collection rate" />
        <KPI icon={AlertTriangle} label="Overdue" value={fmt(1275000, "INR")} color={C.red} sub="1 installment overdue" />
      </div>

      <TabBar tabs={[
        { key: "payables", label: "Payables (Commissions)", count: payables.length },
        { key: "receivables", label: "Receivables (Installments)", count: receivables.length },
      ]} active={tab} onChange={setTab} />

      {tab === "payables" ? (
        <Card>
          <DataTable columns={[
            { label: "Payment ID", key: "id" },
            { label: "Broker", key: "broker" },
            { label: "Sale", key: "sale" },
            { label: "Amount", render: r => <span style={{ fontWeight: 600 }}>{fmt(r.amount, r.currency)}</span> },
            { label: "Due Date", key: "dueDate" },
            { label: "Status", render: r => <StatusBadge status={r.status} /> },
            { label: "Yardi", render: r => <StatusBadge status={r.yardi} /> },
          ]} data={payables} />
        </Card>
      ) : (
        <Card>
          <DataTable columns={[
            { label: "ID", key: "id" },
            { label: "Buyer", key: "buyer" },
            { label: "Sale", key: "sale" },
            { label: "Installment", key: "installment" },
            { label: "Amount", render: r => <span style={{ fontWeight: 600 }}>{fmt(r.amount, r.currency)}</span> },
            { label: "Due", key: "due" },
            { label: "Status", render: r => <StatusBadge status={r.status} /> },
            { label: "Yardi", render: r => <StatusBadge status={r.yardi} /> },
          ]} data={receivables} />
        </Card>
      )}
    </div>
  );
};

// ─── PAGE: AI ENGINE ────────────────────────────────────────
const AIPage = () => {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const extractedFields = [
    { field: "Buyer Name", value: "Sarah Mitchell", confidence: 98, status: "verified" },
    { field: "Property", value: "Horizon Tower", confidence: 99, status: "verified" },
    { field: "Unit Number", value: "A-101", confidence: 97, status: "verified" },
    { field: "Sale Price", value: "CAD 750,000", confidence: 95, status: "verified" },
    { field: "HST Amount", value: "CAD 97,500", confidence: 92, status: "verified" },
    { field: "Contract Date", value: "2026-01-15", confidence: 94, status: "verified" },
    { field: "Target Closing", value: "2026-04-15", confidence: 88, status: "corrected" },
    { field: "Broker Name", value: "Re/Max Elite", confidence: 91, status: "verified" },
    { field: "Commission Rate", value: "3.0%", confidence: 87, status: "verified" },
    { field: "Down Payment", value: "CAD 150,000", confidence: 93, status: "verified" },
    { field: "Installments", value: "12 monthly", confidence: 85, status: "corrected" },
    { field: "Tarion Fee", value: "CAD 1,250", confidence: 78, status: "pending" },
    { field: "Parkland Levy", value: "CAD 3,200", confidence: 72, status: "pending" },
    { field: "Schedule D %", value: "2.5%", confidence: 68, status: "pending" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <KPI icon={Brain} label="Total Processed" value="156" color={C.accent} sub="Documents" />
        <KPI icon={CheckCircle} label="Auto-Approved" value="112" color={C.green} sub="71.8% auto rate" />
        <KPI icon={Target} label="Avg Confidence" value="92.4%" trend="+3.1%" trendUp color={C.cyan} />
        <KPI icon={TrendingUp} label="Model Version" value="v2.4" color={C.accentLight} sub="Last retrained: Feb 22" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 16 }}>
        <Card title="Document Queue" action={<Btn icon={Upload} small>Upload</Btn>}>
          {aiDocuments.map(doc => (
            <div key={doc.id} onClick={() => setSelectedDoc(doc)} style={{ padding: "12px 14px", borderRadius: 8, marginBottom: 6, background: selectedDoc?.id === doc.id ? `${C.accent}15` : "transparent", border: `1px solid ${selectedDoc?.id === doc.id ? C.accent : "transparent"}`, cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FileText size={16} color={statusColor(doc.status)} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{doc.filename}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{doc.property} · {doc.date}</div>
                  </div>
                </div>
                <StatusBadge status={doc.status} />
              </div>
              {doc.confidence > 0 && (
                <div style={{ marginTop: 8 }}>
                  <ProgressBar value={doc.confidence} color={doc.confidence >= 90 ? C.green : doc.confidence >= 80 ? C.yellow : C.red} />
                  <div style={{ fontSize: 10, color: C.textMuted, marginTop: 3 }}>{doc.confidence}% confidence · {doc.fieldsExtracted} fields · {doc.fieldsCorrected} corrected</div>
                </div>
              )}
            </div>
          ))}
        </Card>

        <Card title={selectedDoc ? `Extraction Review — ${selectedDoc.filename}` : "Select a Document"}>
          {selectedDoc?.status === "Completed" || selectedDoc?.status === "In Review" || selectedDoc?.status === "Exception Queue" ? (
            <div>
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <Stat label="Fields" value={extractedFields.length} color={C.accent} />
                <Stat label="Verified" value={extractedFields.filter(f => f.status === "verified").length} color={C.green} />
                <Stat label="Corrected" value={extractedFields.filter(f => f.status === "corrected").length} color={C.yellow} />
                <Stat label="Pending" value={extractedFields.filter(f => f.status === "pending").length} color={C.orange} />
              </div>
              <div style={{ maxHeight: 340, overflowY: "auto" }}>
                {extractedFields.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", padding: "10px 12px", borderRadius: 6, marginBottom: 4, background: f.status === "pending" ? `${C.orange}08` : "transparent", border: `1px solid ${f.status === "pending" ? `${C.orange}30` : C.border}08` }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", marginRight: 12, background: f.confidence >= 90 ? C.green : f.confidence >= 80 ? C.yellow : C.red }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: C.textMuted }}>{f.field}</div>
                      <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{f.value}</div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: f.confidence >= 90 ? C.green : f.confidence >= 80 ? C.yellow : C.red, marginRight: 12 }}>{f.confidence}%</div>
                    {f.status === "verified" && <CheckCircle size={16} color={C.green} />}
                    {f.status === "corrected" && <Edit size={16} color={C.yellow} />}
                    {f.status === "pending" && <AlertTriangle size={16} color={C.orange} />}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <Btn icon={CheckCircle} variant="success">Approve All</Btn>
                <Btn icon={Edit} variant="secondary">Edit Fields</Btn>
                <Btn icon={XCircle} variant="danger">Reject</Btn>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, color: C.textMuted }}>
              <Brain size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
              <div style={{ fontSize: 14 }}>{selectedDoc ? "Processing document..." : "Select a document to review"}</div>
            </div>
          )}
        </Card>
      </div>

      <Card title="AI Model Performance — Self-Learning Metrics">
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={[
            { doc: "0-20", accuracy: 62, corrections: 38 }, { doc: "20-40", accuracy: 74, corrections: 26 },
            { doc: "40-60", accuracy: 82, corrections: 18 }, { doc: "60-80", accuracy: 88, corrections: 12 },
            { doc: "80-100", accuracy: 91, corrections: 9 }, { doc: "100-120", accuracy: 93, corrections: 7 },
            { doc: "120-156", accuracy: 95, corrections: 5 },
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="doc" label={{ value: "Documents Processed", position: "insideBottom", offset: -5, fill: C.textMuted, fontSize: 11 }} stroke={C.textMuted} fontSize={11} />
            <YAxis yAxisId="l" stroke={C.textMuted} fontSize={11} domain={[50, 100]} tickFormatter={v => `${v}%`} />
            <YAxis yAxisId="r" orientation="right" stroke={C.textMuted} fontSize={11} tickFormatter={v => `${v}%`} />
            <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text }} />
            <Bar yAxisId="r" dataKey="corrections" fill={`${C.red}40`} radius={[4, 4, 0, 0]} name="Correction Rate %" />
            <Line yAxisId="l" type="monotone" dataKey="accuracy" stroke={C.green} strokeWidth={2.5} dot={{ fill: C.green, r: 4 }} name="Extraction Accuracy %" />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: C.textSecondary }} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

// ─── PAGE: ANALYTICS ────────────────────────────────────────
const AnalyticsPage = () => {
  const [period, setPeriod] = useState("ytd");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[["ytd", "Year to Date"], ["q1", "Q1 2026"], ["month", "This Month"]].map(([k, l]) => (
            <button key={k} onClick={() => setPeriod(k)} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${period === k ? C.accent : C.border}`, background: period === k ? `${C.accent}20` : "transparent", color: period === k ? C.accentLight : C.textSecondary, fontSize: 12, cursor: "pointer" }}>{l}</button>
          ))}
        </div>
        <Btn icon={Download} variant="secondary" small>Export PDF</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
        <Card title="Sales Velocity / Absorption Rate">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={[
              { property: "Horizon", rate: 8.2 }, { property: "Manhattan", rate: 6.8 },
              { property: "Skyline", rate: 11.5 }, { property: "Pacific", rate: 4.2 },
              { property: "Austin", rate: 0 }, { property: "Pune", rate: 7.8 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="property" stroke={C.textMuted} fontSize={11} />
              <YAxis stroke={C.textMuted} fontSize={11} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text }} formatter={v => [`${v}% / month`]} />
              <Bar dataKey="rate" fill={C.accent} radius={[4, 4, 0, 0]} name="Absorption Rate" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Inventory Status (All Properties)">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={inventoryByType} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis type="number" stroke={C.textMuted} fontSize={11} />
              <YAxis type="category" dataKey="type" stroke={C.textMuted} fontSize={11} width={70} />
              <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text }} />
              <Bar dataKey="sold" stackId="a" fill={C.green} name="Sold" />
              <Bar dataKey="reserved" stackId="a" fill={C.accent} name="Reserved" />
              <Bar dataKey="available" stackId="a" fill={C.blue} name="Available" radius={[0, 4, 4, 0]} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: C.textSecondary }} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Top Sales Partners — Leaderboard">
        <DataTable columns={[
          { label: "Rank", render: (r, i) => <div style={{ width: 24, height: 24, borderRadius: "50%", background: [C.yellow, C.textSecondary, C.orange][brokers.indexOf(r)] || C.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: brokers.indexOf(r) < 3 ? C.bg : C.textSecondary }}>{brokers.indexOf(r) + 1}</div> },
          { label: "Partner", render: r => <div><span style={{ fontWeight: 500 }}>{r.name}</span> <Badge>{r.type}</Badge></div> },
          { label: "", render: r => <CountryBadge country={r.country} /> },
          { label: "Units Sold", render: r => <span style={{ fontWeight: 600 }}>{r.totalSales}</span> },
          { label: "Revenue Generated", render: r => fmt(r.totalRevenue, r.country === "IN" ? "INR" : r.country === "CA" ? "CAD" : "USD") },
          { label: "Commission Earned", render: r => <span style={{ color: C.green, fontWeight: 600 }}>{fmt(r.commission, r.country === "IN" ? "INR" : r.country === "CA" ? "CAD" : "USD")}</span> },
          { label: "Efficiency", render: r => <span style={{ color: C.cyan }}>{(r.totalRevenue / r.commission).toFixed(0)}:1</span> },
        ]} data={[...brokers].sort((a, b) => b.totalSales - a.totalSales)} />
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card title="Revenue vs Collections">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { month: "Oct", revenue: 27.8, collected: 22.1 }, { month: "Nov", revenue: 33.5, collected: 28.2 },
              { month: "Dec", revenue: 29.1, collected: 26.8 }, { month: "Jan", revenue: 35.8, collected: 30.1 },
              { month: "Feb", revenue: 38.2, collected: 31.4 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="month" stroke={C.textMuted} fontSize={11} />
              <YAxis stroke={C.textMuted} fontSize={11} tickFormatter={v => `$${v}M`} />
              <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text }} />
              <Bar dataKey="revenue" fill={C.accent} name="Revenue" radius={[3, 3, 0, 0]} />
              <Bar dataKey="collected" fill={C.green} name="Collected" radius={[3, 3, 0, 0]} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: C.textSecondary }} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Receivables Aging Waterfall">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { bucket: "Current", amount: 4.2 }, { bucket: "30 Day", amount: 1.8 },
              { bucket: "60 Day", amount: 0.9 }, { bucket: "90 Day", amount: 0.4 },
              { bucket: "120+", amount: 0.2 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="bucket" stroke={C.textMuted} fontSize={11} />
              <YAxis stroke={C.textMuted} fontSize={11} tickFormatter={v => `$${v}M`} />
              <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text }} />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]} name="Outstanding">
                {[C.green, C.blue, C.yellow, C.orange, C.red].map((c, i) => <Cell key={i} fill={c} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

// ─── PAGE: YARDI SYNC ───────────────────────────────────────
const YardiPage = () => {
  const synced = yardiSyncLog.filter(s => s.status === "Synced").length;
  const errors = yardiSyncLog.filter(s => s.status === "Error").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <KPI icon={CheckCircle} label="Synced Records" value={synced} color={C.green} sub="Last 24 hours" />
        <KPI icon={AlertTriangle} label="Sync Errors" value={errors} color={C.red} sub="Requires attention" />
        <KPI icon={Clock} label="Last Full Sync" value="6:00 AM" color={C.blue} sub="Today, 1,565 units" />
        <KPI icon={RefreshCw} label="Connection" value="Healthy" color={C.green} sub="Yardi Voyager 7.S" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <Card title="Sync Activity Log" action={<Btn icon={RefreshCw} small>Force Sync</Btn>}>
          <DataTable columns={[
            { label: "Type", render: r => <Badge color={r.type === "Payable" ? C.orange : r.type === "Receivable" ? C.blue : r.type === "Inventory" ? C.cyan : C.textSecondary} bg={r.type === "Payable" ? `${C.orange}15` : r.type === "Receivable" ? C.blueBg : r.type === "Inventory" ? `${C.cyan}15` : C.surface}>{r.type}</Badge> },
            { label: "Entity", key: "entity" },
            { label: "Status", render: r => <StatusBadge status={r.status} /> },
            { label: "Yardi ID", render: r => r.yardiId || <span style={{ color: C.textMuted }}>—</span> },
            { label: "Timestamp", key: "timestamp", muted: true },
          ]} data={yardiSyncLog} />
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card title="Integration Method">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ padding: "14px 16px", borderRadius: 8, background: C.greenBg, border: `1px solid ${C.green}25` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.green }}>Phase 1: FinPayables CSV</div>
                <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 4 }}>Active — Batch ETL via SFTP</div>
              </div>
              <div style={{ padding: "14px 16px", borderRadius: 8, background: C.surface, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary }}>Phase 2: SIPP API</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>Planned — $25K/yr per interface</div>
              </div>
            </div>
          </Card>
          <Card title="Sync Schedule">
            <div style={{ fontSize: 12, color: C.textSecondary, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Inventory Full Sync</span><Badge>Daily 6:00 AM</Badge></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Inventory Incremental</span><Badge>Every 15 min</Badge></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Payables Push</span><Badge>On Approval</Badge></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Receivables Push</span><Badge>On Payment</Badge></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ─── PAGE: COMPLIANCE ───────────────────────────────────────
const CompliancePage = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
      {[
        { country: "US", flag: "🇺🇸", title: "United States", items: ["RESPA / TRID Compliance", "UCD v2.0 Extraction", "NAR Decoupled Commissions", "FIRPTA 15% Withholding", "State Transfer Tax", "1099-S Reporting", "Fair Housing Audit Trail", "Lead Paint Disclosure"], color: C.blue },
        { country: "CA", flag: "🇨🇦", title: "Canada", items: ["FINTRAC KYC Verification", "24-Hour $10K LCTR Rule", "Receipt of Funds Records", "Foreign Buyer Ban (3%)", "Provincial Transfer Tax", "GST/HST by Province", "Tarion / Home Warranty", "10-Day Cooling-Off"], color: C.accent },
        { country: "IN", flag: "🇮🇳", title: "India", items: ["RERA Registration Check", "70% Escrow Routing", "10% Advance Cap", "Milestone-Linked Payments", "5-Year Defect Liability", "SBI MCLR+2% Penalty", "TDS Section 194-IA", "Benami Prevention"], color: C.green },
      ].map(c => (
        <div key={c.country} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, background: `${c.color}08` }}>
            <span style={{ fontSize: 24 }}>{c.flag}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{c.title}</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>Compliance Engine Active</div>
            </div>
            <CheckCircle size={18} color={C.green} style={{ marginLeft: "auto" }} />
          </div>
          <div style={{ padding: "16px 20px" }}>
            {c.items.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: i < c.items.length - 1 ? `1px solid ${C.border}08` : "none" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.color }} />
                <span style={{ fontSize: 12, color: C.textSecondary }}>{item}</span>
                <Shield size={12} color={C.green} style={{ marginLeft: "auto", opacity: 0.5 }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    <Card title="Database Architecture — Dynamic Attributes Pattern">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { table: "Properties", universal: "name, address, country, total_units", jsonb: "rera_reg_number, escrow_bank, zoning_code" },
          { table: "Unit_Sales", universal: "property_id, buyer_id, sale_price, date", jsonb: "fintrac_24hr_flag, carpet_area, ucd_closing_data" },
          { table: "Buyers", universal: "first_name, last_name, email, phone", jsonb: "dual_process_id, ssn_hash, pan_number" },
          { table: "Commissions", universal: "sale_id, broker_id, amount, status", jsonb: "buyer_broker_verified, hst_tax, tds_amount" },
        ].map(t => (
          <div key={t.table} style={{ padding: 14, borderRadius: 8, background: C.surface, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.accent, marginBottom: 8 }}>{t.table}</div>
            <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 6 }}>
              <span style={{ color: C.textMuted }}>Universal:</span> {t.universal}
            </div>
            <div style={{ fontSize: 11, color: C.textSecondary }}>
              <span style={{ color: C.yellow }}>JSONB:</span> {t.jsonb}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: `${C.accent}08`, border: `1px solid ${C.accent}20`, fontSize: 12, color: C.textSecondary }}>
        <Shield size={14} color={C.accent} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
        Data Residency: CA data → AWS ca-central-1 · IN data → ap-south-1 · US data → us-east-1 · AES-256 at rest · TLS 1.3 in transit
      </div>
    </Card>
  </div>
);

// ─── MAIN APP ───────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const pageTitle = NAV_ITEMS.find(n => n.key === page)?.label || "Dashboard";

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage />;
      case "properties": return <PropertiesPage />;
      case "sales": return <SalesPage />;
      case "buyers": return <BuyersPage />;
      case "brokers": return <BrokersPage />;
      case "payments": return <PaymentsPage />;
      case "ai": return <AIPage />;
      case "analytics": return <AnalyticsPage />;
      case "yardi": return <YardiPage />;
      case "compliance": return <CompliancePage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* SIDEBAR */}
      <div style={{ width: sidebarCollapsed ? 64 : 230, background: C.sidebar, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", transition: "width 0.2s ease", flexShrink: 0, overflow: "hidden" }}>
        <div style={{ padding: sidebarCollapsed ? "20px 12px" : "20px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${C.border}`, minHeight: 64 }}>
          {!sidebarCollapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#fff" }}>U</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>UPWARD</div>
                <div style={{ fontSize: 9, color: C.textMuted, letterSpacing: 1.5, textTransform: "uppercase" }}>Unit Sales Platform</div>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ marginLeft: "auto", background: "transparent", border: "none", cursor: "pointer", padding: 4, color: C.textMuted }}>
            {sidebarCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {NAV_ITEMS.map(item => {
            const active = page === item.key;
            return (
              <button key={item.key} onClick={() => setPage(item.key)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: sidebarCollapsed ? "10px 14px" : "10px 14px", borderRadius: 8, border: "none", background: active ? `${C.accent}18` : "transparent", color: active ? C.accentLight : C.textSecondary, fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer", transition: "all 0.15s", marginBottom: 2, justifyContent: sidebarCollapsed ? "center" : "flex-start" }} title={item.label}>
                <item.icon size={18} />
                {!sidebarCollapsed && item.label}
                {active && !sidebarCollapsed && <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.accent, marginLeft: "auto" }} />}
              </button>
            );
          })}
        </nav>

        {!sidebarCollapsed && (
          <div style={{ padding: "16px 20px", borderTop: `1px solid ${C.border}`, fontSize: 11 }}>
            <div style={{ color: C.textSecondary }}>Logged in as</div>
            <div style={{ color: C.text, fontWeight: 500 }}>Sarah Johnson</div>
            <div style={{ color: C.textMuted, marginTop: 2 }}>Super Admin</div>
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* TOP BAR */}
        <div style={{ padding: "14px 28px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: C.sidebar, flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>{pageTitle}</h1>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
              {time.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", gap: 4 }}>
              {["US", "CA", "IN"].map(c => (
                <span key={c} style={{ fontSize: 16, cursor: "pointer", opacity: 0.7 }} title={c}>{flag(c)}</span>
              ))}
            </div>
            <div style={{ width: 1, height: 24, background: C.border }} />
            <div style={{ position: "relative", cursor: "pointer" }}>
              <Bell size={18} color={C.textSecondary} />
              <div style={{ position: "absolute", top: -2, right: -4, width: 8, height: 8, borderRadius: "50%", background: C.red, border: `2px solid ${C.sidebar}` }} />
            </div>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer" }}>SJ</div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
