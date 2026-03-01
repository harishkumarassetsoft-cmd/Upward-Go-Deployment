import { useState, useEffect, useRef } from 'react';
import {
    Users, CreditCard, CheckCircle2, Clock, AlertCircle,
    ChevronDown, ChevronRight, Activity, RefreshCw, XCircle,
    Banknote, AlertTriangle, Split, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BuyerFlowModal from '../components/BuyerFlowModal';

import { API_URL } from '../config';
const API = API_URL;

// Canadian NSF fine per Banking Rules — standard industry fine is $45 CAD
const CANADA_NSF_FEE = 45;

// Check lifecycle statuses
type CheckStatus = 'pending' | 'collected' | 'submitted' | 'cleared' | 'nsf';

interface CheckAttempt {
    attempt: number;
    check_number: string;
    collected_date: string;
    submitted_date: string;
    status: CheckStatus;      // 'pending' | 'collected' | 'submitted' | 'cleared' | 'nsf'
    nsf_fine: number;         // 0 unless NSF
    cleared_date: string;
}

const STATUS_LABELS: Record<CheckStatus, string> = {
    pending: 'Awaiting Check',
    collected: 'Check Collected',
    submitted: 'Submitted to Bank',
    cleared: 'Cleared',
    nsf: 'NSF — Returned',
};

const STATUS_COLOR: Record<CheckStatus, string> = {
    pending: 'text-slate-400 bg-slate-800/50 border-slate-700/50',
    collected: 'text-blue-300 bg-blue-500/10 border-blue-500/30',
    submitted: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
    cleared: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
    nsf: 'text-rose-300 bg-rose-500/10 border-rose-500/30',
};

const STATUS_ICON: Record<CheckStatus, React.ReactElement> = {
    pending: <Clock className="w-3.5 h-3.5" />,
    collected: <Banknote className="w-3.5 h-3.5" />,
    submitted: <RefreshCw className="w-3.5 h-3.5" />,
    cleared: <CheckCircle2 className="w-3.5 h-3.5" />,
    nsf: <XCircle className="w-3.5 h-3.5" />,
};

export default function Buyers() {
    const [sales, setSales] = useState<any[]>([]);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [selectedSale, setSelectedSale] = useState<any>(null);

    // UI state: per payment row — {saleId-milestoneIdx: CheckAttempt[]}
    const [checkData, setCheckData] = useState<Record<string, CheckAttempt[]>>({});

    // Mirror of sales in a ref so the auto-save timer always reads latest state
    const salesRef = useRef<any[]>([]);
    useEffect(() => { salesRef.current = sales; }, [sales]);

    // Partial payment modal state
    const [partialModal, setPartialModal] = useState<{ sale: any; idx: number; totalDue: number; name: string } | null>(null);
    const [partialAmount, setPartialAmount] = useState<string>('');

    // Active tab per expanded sale: 'milestones' | 'upgrades'
    const [activeTab, setActiveTab] = useState<Record<string, 'milestones' | 'upgrades'>>({});
    const getTab = (saleId: string) => activeTab[saleId] || 'milestones';
    const setTab = (saleId: string, tab: 'milestones' | 'upgrades') =>
        setActiveTab(prev => ({ ...prev, [saleId]: tab }));

    // Guard: block background poll from overwriting state within 5s of any save
    const lastSaveRef = useRef<number>(0);
    const checkDataRef = useRef<Record<string, CheckAttempt[]>>({});
    useEffect(() => { checkDataRef.current = checkData; }, [checkData]);

    const [isSyncing, setIsSyncing] = useState(false);

    const isSaveRecent = () => Date.now() - lastSaveRef.current < 5000;

    const fetchSales = async () => {
        // Don't overwrite local optimistic state if a save just happened
        if (isSaveRecent()) return;
        try {
            const res = await fetch(`${API}/api/sales`);
            const data = await res.json();
            const parsed = data.map((s: any) => ({
                ...s,
                data: typeof s.data === 'string' ? JSON.parse(s.data || '{}') : (s.data || {})
            }));
            const filtered = parsed.filter((s: any) => s.data?.paymentScheduleConfirmed && s.data?.paymentSchedule?.length > 0);

            // Merge: keep local sale data if it's newer (has checkAttempts not in backend yet)
            setSales(prev => {
                if (prev.length === 0) return filtered;
                return filtered.map((fs: any) => {
                    const local = prev.find(p => p.id === fs.id);
                    if (!local) return fs;
                    // Keep local if it has more checkAttempts data than backend
                    const localCa = Object.keys(local.data?.checkAttempts || {}).length;
                    const remoteCa = Object.keys(fs.data?.checkAttempts || {}).length;
                    return localCa >= remoteCa ? local : fs;
                });
            });

            // Restore persisted checkData from sale.data.checkAttempts and upgCheckAttempts
            const restored: Record<string, CheckAttempt[]> = {};
            filtered.forEach((s: any) => {
                Object.entries(s.data?.checkAttempts || {}).forEach(([k, v]) => {
                    restored[`${s.id}-${k}`] = v as CheckAttempt[];
                });
                Object.entries(s.data?.upgCheckAttempts || {}).forEach(([k, v]) => {
                    restored[`upg-${s.id}-${k}`] = v as CheckAttempt[];
                });
            });
            // Only restore from backend if we don't already have local data
            setCheckData(prev => {
                const merged: Record<string, CheckAttempt[]> = { ...restored };
                Object.entries(prev).forEach(([k, v]) => {
                    if (v.length >= (merged[k]?.length || 0)) merged[k] = v;
                });
                return merged;
            });
        } catch (e) {
            console.error('fetch sales error', e);
        }
    };

    useEffect(() => {
        fetchSales();
        const pollT = setInterval(fetchSales, 8000);
        return () => clearInterval(pollT);
    }, []);

    // Core sync logic merging transient typed values into the backend payload
    const syncToBackend = async (manual: boolean = false) => {
        if (isSyncing) return;
        const currentSales = salesRef.current;
        const currentChecks = checkDataRef.current;

        const dirtySales = currentSales.filter((s: any) =>
            Object.keys(currentChecks).some(k => k.startsWith(s.id + '-') || k.startsWith('upg-' + s.id + '-'))
        );

        if (dirtySales.length === 0 && !manual) return;

        if (manual) setIsSyncing(true);
        const toPush = manual ? currentSales : dirtySales;

        for (const sale of toPush) {
            const ca: any = {};
            const upgCa: any = {};

            Object.entries(currentChecks).forEach(([key, attempts]) => {
                if (key.startsWith(sale.id + '-')) {
                    ca[key.split('-')[1]] = attempts;
                } else if (key.startsWith('upg-' + sale.id + '-')) {
                    upgCa[key.split('-')[2]] = attempts;
                }
            });

            const updatedData = {
                ...sale.data,
                checkAttempts: { ...(sale.data?.checkAttempts || {}), ...ca },
                upgCheckAttempts: { ...(sale.data?.upgCheckAttempts || {}), ...upgCa }
            };

            try {
                await fetch(`${API}/api/sales`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...sale, data: JSON.stringify(updatedData) })
                });
            } catch (e) { console.error('auto-save failed', e); }
        }

        if (manual) {
            setIsSyncing(false);
            lastSaveRef.current = Date.now();
        }
    };

    // ── 1-minute silent background auto-save ──────────────────────────────
    useEffect(() => {
        const autoSave = setInterval(() => {
            if (Date.now() - lastSaveRef.current > 5000) {
                syncToBackend(false);
            }
        }, 60000);
        return () => clearInterval(autoSave);
    }, []);

    // ----- helpers -----
    const rowKey = (saleId: string, idx: number) => `${saleId}-${idx}`;

    const getAttempts = (saleId: string, idx: number): CheckAttempt[] =>
        checkData[rowKey(saleId, idx)] || [];

    const latestAttempt = (saleId: string, idx: number): CheckAttempt | null => {
        const all = getAttempts(saleId, idx);
        return all.length ? all[all.length - 1] : null;
    };

    const totalNsfFines = (saleId: string, idx: number): number =>
        getAttempts(saleId, idx).reduce((s, a) => s + (a.nsf_fine || 0), 0);

    const setAttempts = (saleId: string, idx: number, attempts: CheckAttempt[]) => {
        setCheckData(prev => ({ ...prev, [rowKey(saleId, idx)]: attempts }));
    };

    // Persist check attempts into the sale record's data blob
    const persistCheckAttempts = async (sale: any, idx: number, attempts: CheckAttempt[]) => {
        lastSaveRef.current = Date.now(); // mark save timestamp to pause polling
        const existingCa = sale.data?.checkAttempts || {};
        const updatedData = {
            ...sale.data,
            checkAttempts: { ...existingCa, [idx]: attempts },
            // Mark milestone as cleared/paid when check clears
            paymentSchedule: sale.data.paymentSchedule.map((m: any, mi: number) =>
                mi === idx && attempts[attempts.length - 1]?.status === 'cleared'
                    ? { ...m, actual_date: attempts[attempts.length - 1].cleared_date }
                    : m
            )
        };
        const updatedSale = { ...sale, data: updatedData };
        setSales(prev => prev.map(s => s.id === sale.id ? updatedSale : s));
        try {
            await fetch(`${API}/api/sales`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...updatedSale, data: JSON.stringify(updatedSale.data) })
            });
        } catch (e) {
            console.error('persist check error', e);
        }
        return updatedSale;
    };

    // ----- Check lifecycle actions -----
    const startCheck = (sale: any, idx: number) => {
        const prev = getAttempts(sale.id, idx);
        const num = prev.length + 1;
        const newAttempt: CheckAttempt = {
            attempt: num,
            check_number: '',
            collected_date: new Date().toISOString().split('T')[0],
            submitted_date: '',
            status: 'collected',
            nsf_fine: 0,
            cleared_date: '',
        };
        const updated = [...prev, newAttempt];
        setAttempts(sale.id, idx, updated);
        persistCheckAttempts(sale, idx, updated);
    };

    const updateAttemptField = (sale: any, idx: number, attIdx: number, field: keyof CheckAttempt, value: any) => {
        const prev = getAttempts(sale.id, idx);
        const updated = prev.map((a, i) => i === attIdx ? { ...a, [field]: value } : a);
        setAttempts(sale.id, idx, updated);
    };

    const advanceStatus = async (sale: any, idx: number) => {
        const prev = getAttempts(sale.id, idx);
        if (!prev.length) return;
        const last = { ...prev[prev.length - 1] };

        if (last.status === 'collected') {
            last.status = 'submitted';
            last.submitted_date = new Date().toISOString().split('T')[0];
        }

        const updated = [...prev.slice(0, -1), last];
        setAttempts(sale.id, idx, updated);
        await persistCheckAttempts(sale, idx, updated);
    };

    const markCleared = async (sale: any, idx: number) => {
        const prev = getAttempts(sale.id, idx);
        if (!prev.length) return;
        const last = { ...prev[prev.length - 1] };
        last.status = 'cleared';
        last.cleared_date = new Date().toISOString().split('T')[0];
        const updated = [...prev.slice(0, -1), last];
        setAttempts(sale.id, idx, updated);
        await persistCheckAttempts(sale, idx, updated);
    };

    const markNSF = async (sale: any, idx: number) => {
        const prev = getAttempts(sale.id, idx);
        if (!prev.length) return;
        const last = { ...prev[prev.length - 1] };
        last.status = 'nsf';
        last.nsf_fine = CANADA_NSF_FEE;
        const updated = [...prev.slice(0, -1), last];
        setAttempts(sale.id, idx, updated);
        await persistCheckAttempts(sale, idx, updated);
    };

    const retryCheck = (sale: any, idx: number) => {
        // Start a new attempt after NSF
        startCheck(sale, idx);
    };

    // ----- Partial Payment -----
    const handlePartialPayment = async () => {
        if (!partialModal) return;
        const { sale, idx, totalDue } = partialModal;
        const partial = parseFloat(partialAmount);
        if (isNaN(partial) || partial <= 0 || partial >= totalDue) return;

        const remaining = totalDue - partial;
        const sched: any[] = [...sale.data.paymentSchedule];
        const original = sched[idx];

        // Update current milestone to the partial amount
        const partialPct = original.percentage * (partial / totalDue);
        sched[idx] = { ...original, amount_due: partial, percentage: partialPct, milestone_name: original.milestone_name + ' (Partial)' };

        // Insert a new milestone right after for the remaining balance
        const balanceMilestone = {
            milestone_name: original.milestone_name + ' (Balance)',
            percentage: original.percentage - partialPct,
            amount_due: remaining,
            estimated_date: original.estimated_date || '',
            actual_date: '',
            isBalanceMilestone: true,
        };
        sched.splice(idx + 1, 0, balanceMilestone);

        const updatedData = { ...sale.data, paymentSchedule: sched };
        const updatedSale = { ...sale, data: updatedData };

        lastSaveRef.current = Date.now();
        setSales(prev => prev.map(s => s.id === sale.id ? updatedSale : s));

        // Also clear the checkData key so the Receive Cheque button reappears for the (Partial) milestone
        setCheckData(prev => {
            const copy = { ...prev };
            delete copy[rowKey(sale.id, idx)];
            return copy;
        });

        try {
            await fetch(`${API}/api/sales`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...updatedSale, data: JSON.stringify(updatedSale.data) })
            });
        } catch (e) {
            console.error('partial payment persist error', e);
        }

        setPartialModal(null);
        setPartialAmount('');
    };

    // ----- Totals -----
    const totalPaid = (schedule: any[]) =>
        schedule.reduce((s, item) => item.actual_date ? s + (item.amount_due || 0) : s, 0);
    const totalOwed = (schedule: any[]) =>
        schedule.reduce((s, i) => s + (i.amount_due || 0), 0);

    const fmt = (n: number, region: string) =>
        new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: region === 'India' ? 'INR' : 'CAD',
            maximumFractionDigits: 0
        }).format(n);

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Buyers Directory</h1>
                    <p className="text-slate-400 mt-1">Track payment instalments, check collection status, and NSF events per buyer.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 glass-panel rounded-xl text-sm text-slate-300">
                        <Users className="w-4 h-4 text-indigo-400" />
                        {sales.length} Active Buyers
                    </div>
                    <button
                        onClick={() => syncToBackend(true)}
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors disabled:opacity-50"
                    >
                        <Upload className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                        {isSyncing ? 'Syncing...' : 'Push to Backend'}
                    </button>
                </div>
            </header>

            {sales.length === 0 ? (
                <div className="glass-panel p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                        <CreditCard className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">No Confirmed Payment Schedules Yet</h2>
                    <p className="text-slate-400 max-w-md">
                        Once a buyer's Payment Schedule is confirmed in the <strong className="text-white">Sales → Buyer Flow</strong>, it will appear here for tracking.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sales.map(sale => {
                        const sched = sale.data.paymentSchedule;
                        const region = sale.data.paymentScheduleRegion || 'Canada';
                        const paid = totalPaid(sched);
                        const total = totalOwed(sched);
                        const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
                        const isExpandedRow = expanded === sale.id;
                        const paidCount = sched.filter((item: any) => item.actual_date).length;

                        return (
                            <motion.div
                                key={sale.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-panel overflow-hidden"
                            >
                                {/* Header row */}
                                <div
                                    className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-800/20 transition-colors"
                                    onClick={() => setExpanded(isExpandedRow ? null : sale.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-sm border border-indigo-500/30">
                                            {sale.buyer.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold">{sale.buyer}</p>
                                            <p className="text-xs text-slate-400">{sale.property} · Unit {sale.unit} · <span className="font-mono text-slate-500">{sale.id}</span></p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs text-slate-400">{paidCount}/{sched.length} instalments paid</p>
                                            <p className="text-sm font-mono text-emerald-400">{fmt(paid, region)} of {fmt(total, region)}</p>
                                        </div>
                                        <div className="w-24 hidden md:block">
                                            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                                <span>{pct}% paid</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {pct === 100 ? (
                                                <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">Fully Paid</span>
                                            ) : paidCount > 0 ? (
                                                <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">In Progress</span>
                                            ) : (
                                                <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">Awaiting Payment</span>
                                            )}
                                            {isExpandedRow ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded instalment rows */}
                                <AnimatePresence>
                                    {isExpandedRow && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-slate-700/50"
                                        >
                                            <div className="p-5 space-y-4">
                                                {/* Top bar */}
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                                        <CreditCard className="w-4 h-4 text-emerald-400" />
                                                        Payment Instalments — {region} Schedule
                                                    </h3>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setSelectedSale(sale); }}
                                                            className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                                                        >
                                                            <Activity className="w-3.5 h-3.5" /> Open Buyer Flow
                                                        </button>
                                                        <div className="text-xs text-slate-400">
                                                            Balance: <span className="font-mono text-amber-400">{fmt(total - paid, region)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Tab bar */}
                                                <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700/40 w-fit">
                                                    {(['milestones', 'upgrades'] as const).map(tab => (
                                                        <button
                                                            key={tab}
                                                            onClick={() => setTab(sale.id, tab)}
                                                            className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${getTab(sale.id) === tab
                                                                ? tab === 'upgrades'
                                                                    ? 'bg-violet-600 text-white shadow-sm'
                                                                    : 'bg-indigo-600 text-white shadow-sm'
                                                                : 'text-slate-400 hover:text-white'
                                                                }`}
                                                        >
                                                            {tab === 'milestones' ? `📋 Milestones (${sched.length})` : `✦ Upgrades (${(sale.data?.upgrades || []).length})`}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* ── MILESTONES TAB ── */}
                                                {getTab(sale.id) === 'milestones' && (
                                                    <>

                                                        {sched.map((item: any, i: number) => {
                                                            const isPaid = !!item.actual_date;
                                                            const isPrevPaid = i === 0 || !!sched[i - 1].actual_date;
                                                            const isAvailable = isPrevPaid && !isPaid;
                                                            const attempts = getAttempts(sale.id, i);
                                                            const latest = latestAttempt(sale.id, i);
                                                            const fines = totalNsfFines(sale.id, i);
                                                            const totalDue = (item.amount_due || 0) + fines;

                                                            return (
                                                                <motion.div
                                                                    key={i}
                                                                    initial={{ opacity: 0, y: 4 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: i * 0.05 }}
                                                                    className={`rounded-xl border p-4 space-y-3 ${isPaid
                                                                        ? 'bg-emerald-500/5 border-emerald-500/20'
                                                                        : isAvailable
                                                                            ? 'bg-slate-800/30 border-slate-700/50'
                                                                            : 'bg-slate-900/30 border-slate-800/50 opacity-60'
                                                                        }`}
                                                                >
                                                                    {/* Milestone header */}
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">{i + 1}</span>
                                                                            <div>
                                                                                <p className="text-sm font-semibold text-white">{item.milestone_name}</p>
                                                                                <p className="text-xs text-slate-500">
                                                                                    Est: {item.estimated_date || '—'}
                                                                                    {fines > 0 && <span className="ml-2 text-rose-400 font-medium">+ {fmt(fines, region)} NSF fine(s)</span>}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="text-base font-mono font-bold text-emerald-400">{fmt(totalDue, region)}</p>
                                                                            {fines > 0 && (
                                                                                <p className="text-[10px] text-slate-500 line-through">{fmt(item.amount_due, region)}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* If paid & cleared */}
                                                                    {isPaid && (
                                                                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                                                                            <CheckCircle2 className="w-4 h-4" />
                                                                            <span>Payment Cleared on {item.actual_date}</span>
                                                                        </div>
                                                                    )}

                                                                    {/* Check attempts history */}
                                                                    {attempts.length > 0 && (
                                                                        <div className="space-y-2">
                                                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Check History</p>
                                                                            {attempts.map((att, ai) => (
                                                                                <div key={ai} className={`rounded-lg border px-3 py-2.5 ${att.status === 'nsf' ? 'border-rose-500/30 bg-rose-500/5' : att.status === 'cleared' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-700/50 bg-slate-800/40'}`}>
                                                                                    <div className="flex items-center justify-between mb-2">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className="text-xs font-bold text-slate-400">Attempt #{att.attempt}</span>
                                                                                            {att.check_number && <span className="text-xs text-slate-500 font-mono">#{att.check_number}</span>}
                                                                                        </div>
                                                                                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full border ${STATUS_COLOR[att.status]}`}>
                                                                                            {STATUS_ICON[att.status]}
                                                                                            {STATUS_LABELS[att.status]}
                                                                                        </span>
                                                                                    </div>

                                                                                    <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400">
                                                                                        <div>
                                                                                            <p className="text-slate-600 uppercase">Collected</p>
                                                                                            <p className="text-slate-300">{att.collected_date || '—'}</p>
                                                                                        </div>
                                                                                        <div>
                                                                                            <p className="text-slate-600 uppercase">Submitted</p>
                                                                                            <p className="text-slate-300">{att.submitted_date || '—'}</p>
                                                                                        </div>
                                                                                        <div>
                                                                                            <p className="text-slate-600 uppercase">Cleared</p>
                                                                                            <p className="text-slate-300">{att.cleared_date || '—'}</p>
                                                                                        </div>
                                                                                    </div>

                                                                                    {att.status === 'nsf' && (
                                                                                        <div className="mt-2 flex items-center gap-2 text-rose-400 text-[11px] font-semibold">
                                                                                            <AlertTriangle className="w-3.5 h-3.5" />
                                                                                            Cheque returned NSF — Fine applied: {fmt(att.nsf_fine, region)} (Canada Banking Rules)
                                                                                        </div>
                                                                                    )}

                                                                                    {/* NSF Fine Ledger — cumulative, shown on the last attempt card */}
                                                                                    {ai === attempts.length - 1 && attempts.some(a => a.status === 'nsf') && (
                                                                                        <div className="mt-3 rounded-lg border border-rose-500/20 bg-rose-950/30 overflow-hidden">
                                                                                            <div className="px-3 py-1.5 border-b border-rose-500/20 flex items-center gap-1.5">
                                                                                                <AlertTriangle className="w-3 h-3 text-rose-400" />
                                                                                                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400">NSF Fine History</span>
                                                                                            </div>
                                                                                            <table className="w-full text-[11px]">
                                                                                                <thead>
                                                                                                    <tr className="text-[10px] uppercase text-slate-500 border-b border-rose-500/10">
                                                                                                        <th className="px-3 py-1.5 text-left font-semibold">Attempt</th>
                                                                                                        <th className="px-3 py-1.5 text-left font-semibold">Cheque #</th>
                                                                                                        <th className="px-3 py-1.5 text-left font-semibold">Returned On</th>
                                                                                                        <th className="px-3 py-1.5 text-right font-semibold">Fine Applied</th>
                                                                                                        <th className="px-3 py-1.5 text-right font-semibold">Cumulative</th>
                                                                                                    </tr>
                                                                                                </thead>
                                                                                                <tbody>
                                                                                                    {(() => {
                                                                                                        let cum = 0;
                                                                                                        return attempts
                                                                                                            .filter(a => a.status === 'nsf')
                                                                                                            .map((a, ni) => {
                                                                                                                cum += a.nsf_fine;
                                                                                                                return (
                                                                                                                    <tr key={ni} className="border-t border-rose-500/10">
                                                                                                                        <td className="px-3 py-1.5 text-slate-400 font-mono">#{a.attempt}</td>
                                                                                                                        <td className="px-3 py-1.5 text-slate-400 font-mono">{a.check_number || '—'}</td>
                                                                                                                        <td className="px-3 py-1.5 text-slate-400">{a.submitted_date || '—'}</td>
                                                                                                                        <td className="px-3 py-1.5 text-right text-rose-400 font-semibold">+{fmt(a.nsf_fine, region)}</td>
                                                                                                                        <td className="px-3 py-1.5 text-right text-rose-300 font-bold">{fmt(cum, region)}</td>
                                                                                                                    </tr>
                                                                                                                );
                                                                                                            });
                                                                                                    })()}
                                                                                                </tbody>
                                                                                                <tfoot className="border-t border-rose-500/30 bg-rose-950/40">
                                                                                                    <tr>
                                                                                                        <td colSpan={3} className="px-3 py-1.5 text-[10px] uppercase text-slate-500 font-semibold">Total NSF Fines Added to Balance</td>
                                                                                                        <td colSpan={2} className="px-3 py-1.5 text-right font-bold text-rose-300">{fmt(fines, region)}</td>
                                                                                                    </tr>
                                                                                                </tfoot>
                                                                                            </table>
                                                                                        </div>
                                                                                    )}
                                                                                    {/* Live action buttons for this attempt */}
                                                                                    {ai === attempts.length - 1 && !isPaid && isAvailable && (
                                                                                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                                                                                            {att.status === 'collected' && (
                                                                                                <>
                                                                                                    <div className="flex items-center gap-1">
                                                                                                        <label className="text-[10px] text-slate-500">Check #</label>
                                                                                                        <input
                                                                                                            type="text"
                                                                                                            value={att.check_number}
                                                                                                            onChange={e => updateAttemptField(sale, i, ai, 'check_number', e.target.value)}
                                                                                                            placeholder="e.g. 00123"
                                                                                                            className="w-20 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[11px] text-slate-200 focus:border-blue-500"
                                                                                                        />
                                                                                                    </div>
                                                                                                    <button
                                                                                                        onClick={() => advanceStatus(sale, i)}
                                                                                                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors"
                                                                                                    >
                                                                                                        <RefreshCw className="w-3 h-3" /> Submit to Bank
                                                                                                    </button>
                                                                                                </>
                                                                                            )}
                                                                                            {att.status === 'submitted' && (
                                                                                                <>
                                                                                                    <button
                                                                                                        onClick={() => markCleared(sale, i)}
                                                                                                        className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors"
                                                                                                    >
                                                                                                        <CheckCircle2 className="w-3 h-3" /> Mark Cleared
                                                                                                    </button>
                                                                                                    <button
                                                                                                        onClick={() => markNSF(sale, i)}
                                                                                                        className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors"
                                                                                                    >
                                                                                                        <XCircle className="w-3 h-3" /> Mark NSF
                                                                                                    </button>
                                                                                                </>
                                                                                            )}
                                                                                            {att.status === 'nsf' && (
                                                                                                <div className="w-full">
                                                                                                    <div className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-rose-950/50 border border-rose-500/30">
                                                                                                        <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                                                                                                        <p className="text-[11px] text-rose-300">
                                                                                                            A <strong className="text-rose-200">C${CANADA_NSF_FEE} NSF fee</strong> has been added. New total due: <strong className="text-rose-200">{fmt(totalDue, region)}</strong>.
                                                                                                            Request a replacement check from the buyer.
                                                                                                        </p>
                                                                                                    </div>
                                                                                                    <button
                                                                                                        onClick={() => retryCheck(sale, i)}
                                                                                                        className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors"
                                                                                                    >
                                                                                                        <RefreshCw className="w-3 h-3" /> Receive Replacement Cheque
                                                                                                    </button>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {/* CTA buttons: Receive Cheque + Partial Payment */}
                                                                    {!isPaid && isAvailable && !latest && (
                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                onClick={() => startCheck(sale, i)}
                                                                                className="flex-1 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                                                                            >
                                                                                <Banknote className="w-4 h-4" /> Receive Cheque
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setPartialModal({ sale, idx: i, totalDue, name: item.milestone_name });
                                                                                    setPartialAmount('');
                                                                                }}
                                                                                className="flex-1 py-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                                                                            >
                                                                                <Split className="w-4 h-4" /> Partial Payment
                                                                            </button>
                                                                        </div>
                                                                    )}

                                                                    {/* Locked future milestone */}
                                                                    {!isPaid && !isAvailable && (
                                                                        <div className="flex items-center gap-2 text-slate-600 text-xs">
                                                                            <AlertCircle className="w-3.5 h-3.5" />
                                                                            Locked — previous instalment must be cleared first
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            );
                                                        })}

                                                        {/* Progress bar */}
                                                        <div className="flex items-center gap-4 pt-2">
                                                            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                                <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                                            </div>
                                                            <span className="text-sm font-semibold text-emerald-400 whitespace-nowrap">{pct}% Complete</span>
                                                        </div>
                                                    </> /* end milestones tab */
                                                )}

                                                {/* ── UPGRADES TAB ── */}
                                                {getTab(sale.id) === 'upgrades' && (() => {
                                                    const upgrades: any[] = sale.data?.upgrades || [];

                                                    const saveUpgrades = async (newUpgrades: any[]) => {
                                                        const updatedSale = { ...sale, data: { ...sale.data, upgrades: newUpgrades } };
                                                        lastSaveRef.current = Date.now();
                                                        setSales(prev => prev.map(s => s.id === sale.id ? updatedSale : s));
                                                        try {
                                                            await fetch(`${API}/api/sales`, {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ ...updatedSale, data: JSON.stringify(updatedSale.data) })
                                                            });
                                                        } catch (e) { console.error('upgrade save error', e); }
                                                    };

                                                    // upgrades use 'upg-{saleId}-{ui}' keys in checkData
                                                    const upgKey = (ui: number) => `upg-${sale.id}-${ui}`;
                                                    const getUpgAttempts = (ui: number): CheckAttempt[] => checkData[upgKey(ui)] || [];
                                                    const latestUpgAttempt = (ui: number) => { const a = getUpgAttempts(ui); return a.length ? a[a.length - 1] : null; };
                                                    const totalUpgFines = (ui: number) => getUpgAttempts(ui).reduce((s, a) => s + (a.nsf_fine || 0), 0);

                                                    const startUpgCheck = (ui: number) => {
                                                        const prev = getUpgAttempts(ui);
                                                        const newAttempt: CheckAttempt = { attempt: prev.length + 1, check_number: '', collected_date: new Date().toISOString().split('T')[0], submitted_date: '', status: 'collected', nsf_fine: 0, cleared_date: '' };
                                                        const updated = [...prev, newAttempt];
                                                        setCheckData(p => ({ ...p, [upgKey(ui)]: updated }));
                                                    };

                                                    const updateUpgAttempt = (ui: number, ai: number, patch: Partial<CheckAttempt>) => {
                                                        const prev = getUpgAttempts(ui);
                                                        const updated = prev.map((a, idx) => idx === ai ? { ...a, ...patch } : a);
                                                        setCheckData(p => ({ ...p, [upgKey(ui)]: updated }));
                                                        if (patch.status === 'cleared') {
                                                            const newUpg = upgrades.map((u, i) => i === ui ? { ...u, actual_date: new Date().toISOString().split('T')[0] } : u);
                                                            saveUpgrades(newUpg);
                                                        }
                                                        if (patch.status === 'nsf') {
                                                            const fine = 45;
                                                            const withFine = updated.map((a, idx) => idx === ai ? { ...a, nsf_fine: fine } : a);
                                                            setCheckData(p => ({ ...p, [upgKey(ui)]: withFine }));
                                                        }
                                                    };

                                                    return (
                                                        <div className="space-y-4">
                                                            {/* Header */}
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-slate-400">{upgrades.length} upgrade{upgrades.length !== 1 ? 's' : ''} · Total: <span className="text-violet-300 font-mono font-semibold">{fmt(upgrades.reduce((s, u) => s + (u.cost || 0), 0), region)}</span></span>
                                                            </div>

                                                            {upgrades.length === 0 && (
                                                                <div className="text-center py-6 text-slate-500 text-sm">
                                                                    <span className="text-2xl block mb-2">✦</span>
                                                                    No upgrades yet. Use the button below to add one.
                                                                </div>
                                                            )}

                                                            {upgrades.map((upg: any, ui: number) => {
                                                                const upgPaid = !!upg.actual_date;
                                                                const upgPrevPaid = ui === 0 || !!upgrades[ui - 1].actual_date;
                                                                const upgAvail = upgPrevPaid && !upgPaid;
                                                                const upgAttempts = getUpgAttempts(ui);
                                                                const upgLatest = latestUpgAttempt(ui);
                                                                const upgFines = totalUpgFines(ui);
                                                                const upgTotalDue = (upg.cost || 0) + upgFines;

                                                                return (
                                                                    <div key={ui} className={`rounded-xl border p-4 space-y-3 ${upgPaid ? 'bg-emerald-500/5 border-emerald-500/20'
                                                                        : upgAvail ? 'bg-violet-900/20 border-violet-500/30'
                                                                            : 'bg-slate-900/30 border-slate-800/50 opacity-60'
                                                                        }`}>
                                                                        {/* Upgrade info row */}
                                                                        <div className="flex items-start gap-3">
                                                                            <div className="flex-1 space-y-1">
                                                                                {/* Editable name */}
                                                                                <input
                                                                                    type="text"
                                                                                    value={upg.name}
                                                                                    placeholder="Upgrade name"
                                                                                    title="Upgrade name"
                                                                                    disabled={upgPaid}
                                                                                    onChange={e => { const n = upgrades.map((u, i) => i === ui ? { ...u, name: e.target.value } : u); saveUpgrades(n); }}
                                                                                    className="w-full bg-transparent border-b border-slate-700/50 focus:border-violet-500 text-sm font-semibold text-white outline-none pb-0.5"
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    value={upg.notes || ''}
                                                                                    placeholder="Notes (optional)"
                                                                                    title="Upgrade notes"
                                                                                    disabled={upgPaid}
                                                                                    onChange={e => { const n = upgrades.map((u, i) => i === ui ? { ...u, notes: e.target.value } : u); saveUpgrades(n); }}
                                                                                    className="w-full bg-transparent border-b border-slate-700/30 focus:border-violet-500 text-xs text-slate-400 outline-none pb-0.5"
                                                                                />
                                                                            </div>
                                                                            <div className="text-right shrink-0">
                                                                                <div className="flex items-center gap-1">
                                                                                    <span className="text-slate-500 text-xs">{region === 'India' ? '₹' : 'C$'}</span>
                                                                                    <input
                                                                                        type="number"
                                                                                        value={upg.cost || ''}
                                                                                        placeholder="0"
                                                                                        title="Upgrade cost"
                                                                                        disabled={upgPaid}
                                                                                        onChange={e => { const n = upgrades.map((u, i) => i === ui ? { ...u, cost: parseFloat(e.target.value) || 0 } : u); saveUpgrades(n); }}
                                                                                        className="w-24 bg-transparent border-b border-slate-700/50 focus:border-violet-500 text-sm font-mono text-violet-300 outline-none text-right"
                                                                                    />
                                                                                </div>
                                                                                {upgFines > 0 && <p className="text-[10px] text-rose-400">+{fmt(upgFines, region)} NSF</p>}
                                                                                <p className="text-xs font-bold text-white">{fmt(upgTotalDue, region)}</p>
                                                                            </div>
                                                                            {!upgPaid && (
                                                                                <button
                                                                                    title="Remove upgrade"
                                                                                    onClick={() => saveUpgrades(upgrades.filter((_: any, i: number) => i !== ui))}
                                                                                    className="w-6 h-6 flex items-center justify-center rounded-full bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-xs transition-colors"
                                                                                >×</button>
                                                                            )}
                                                                        </div>

                                                                        {/* Status badge */}
                                                                        <div className="flex items-center gap-2">
                                                                            {upgPaid && <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">CLEARED</span>}
                                                                            {upgLatest && !upgPaid && (
                                                                                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${STATUS_COLOR[upgLatest.status as CheckStatus]}`}>
                                                                                    {STATUS_LABELS[upgLatest.status as CheckStatus]}
                                                                                </span>
                                                                            )}
                                                                            {!upgPaid && !upgLatest && upgAvail && <span className="text-xs text-slate-500">Awaiting cheque</span>}
                                                                            {!upgPaid && !upgLatest && !upgAvail && <span className="text-xs text-slate-500">Locked — clear previous upgrade first</span>}
                                                                        </div>

                                                                        {/* Cheque attempts */}
                                                                        {upgAttempts.length > 0 && (
                                                                            <div className="space-y-2">
                                                                                {upgAttempts.map((att, ai) => (
                                                                                    <div key={ai} className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/40 space-y-2 text-xs">
                                                                                        <div className="flex items-center justify-between">
                                                                                            <span className="text-slate-400">Attempt #{att.attempt}</span>
                                                                                            {STATUS_ICON[att.status as keyof typeof STATUS_ICON]}
                                                                                        </div>
                                                                                        {/* Cheque number */}
                                                                                        {att.status === 'collected' && (
                                                                                            <input title="Cheque number" placeholder="Cheque #" value={att.check_number} onChange={e => updateUpgAttempt(ui, ai, { check_number: e.target.value })} className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-slate-200 text-xs font-mono outline-none" />
                                                                                        )}
                                                                                        {/* Action buttons */}
                                                                                        {ai === upgAttempts.length - 1 && !upgPaid && (
                                                                                            <div className="flex gap-2 flex-wrap">
                                                                                                {att.status === 'collected' && (
                                                                                                    <button onClick={() => updateUpgAttempt(ui, ai, { status: 'submitted', submitted_date: new Date().toISOString().split('T')[0] })} className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[11px] font-semibold transition-colors">Submit to Bank</button>
                                                                                                )}
                                                                                                {att.status === 'submitted' && (
                                                                                                    <>
                                                                                                        <button onClick={() => updateUpgAttempt(ui, ai, { status: 'cleared', cleared_date: new Date().toISOString().split('T')[0] })} className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition-colors">Mark Cleared</button>
                                                                                                        <button onClick={() => updateUpgAttempt(ui, ai, { status: 'nsf' })} className="px-2 py-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-[11px] font-semibold transition-colors">Mark NSF</button>
                                                                                                    </>
                                                                                                )}
                                                                                                {att.status === 'nsf' && (
                                                                                                    <button onClick={() => startUpgCheck(ui)} className="px-2 py-1 rounded bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors"><RefreshCw className="w-3 h-3" /> Receive Replacement Cheque</button>
                                                                                                )}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}

                                                                        {/* CTA — Receive Cheque (first time) */}
                                                                        {!upgPaid && upgAvail && !upgLatest && (
                                                                            <button onClick={() => startUpgCheck(ui)} className="w-full py-2 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors">
                                                                                <Banknote className="w-4 h-4" /> Receive Cheque
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}

                                                            {/* Upgrades total bar */}
                                                            {/* ── Add Upgrade line-item button ── */}
                                                            <button
                                                                onClick={() => saveUpgrades([...upgrades, { name: '', cost: 0, notes: '', actual_date: '' }])}
                                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-violet-500/30 hover:border-violet-500/60 bg-violet-950/10 hover:bg-violet-950/30 text-violet-400 hover:text-violet-300 text-sm font-semibold transition-all group"
                                                            >
                                                                <span className="w-7 h-7 flex items-center justify-center rounded-full bg-violet-600/20 group-hover:bg-violet-600/40 border border-violet-500/30 text-violet-300 text-base leading-none transition-colors">+</span>
                                                                Add Upgrade Line Item
                                                            </button>

                                                            {upgrades.length > 0 && (
                                                                <div className="flex items-center gap-4 pt-2 border-t border-slate-700/40">
                                                                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-violet-500 rounded-full transition-all duration-700" style={{ width: `${upgrades.length ? Math.round((upgrades.filter((u: any) => !!u.actual_date).length / upgrades.length) * 100) : 0}%` }} />
                                                                    </div>
                                                                    <span className="text-sm font-semibold text-violet-400 whitespace-nowrap">
                                                                        {upgrades.filter((u: any) => !!u.actual_date).length}/{upgrades.length} cleared
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}

                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Buyer Flow Modal */}
            {selectedSale && (
                <BuyerFlowModal
                    sale={selectedSale}
                    onClose={() => setSelectedSale(null)}
                    onUpdateSale={async (updated) => {
                        setSales(prev => prev.map(s => s.id === updated.id ? updated : s));
                        setSelectedSale(updated);
                        try {
                            await fetch(`${API}/api/sales`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ...updated, data: JSON.stringify(updated.data || {}) })
                            });
                        } catch (e) {
                            console.error('sync sale error', e);
                        }
                    }}
                />
            )}

            {/* ── PARTIAL PAYMENT MODAL ── */}
            {partialModal && (() => {
                const { totalDue, name } = partialModal;
                const region = partialModal.sale.data?.paymentScheduleRegion || 'Canada';
                const partial = parseFloat(partialAmount) || 0;
                const remaining = totalDue - partial;
                const isValid = partial > 0 && partial < totalDue;

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-md mx-4 rounded-2xl border border-amber-500/30 bg-slate-900 shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-amber-500/10">
                                <div className="flex items-center gap-2">
                                    <Split className="w-5 h-5 text-amber-400" />
                                    <h2 className="text-base font-bold text-white">Partial Payment</h2>
                                </div>
                                <button onClick={() => setPartialModal(null)} className="text-slate-400 hover:text-white">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Milestone info */}
                                <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3">
                                    <p className="text-xs text-slate-400 mb-1">Milestone</p>
                                    <p className="text-sm font-semibold text-white">{name}</p>
                                    <p className="text-xs text-slate-400 mt-1">Total Due: <span className="text-amber-400 font-bold font-mono">{fmt(totalDue, region)}</span></p>
                                </div>

                                {/* Amount input */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-2">Amount Being Paid Now</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono">{region === 'India' ? '₹' : 'C$'}</span>
                                        <input
                                            type="number"
                                            min={1}
                                            max={totalDue - 1}
                                            step={1}
                                            value={partialAmount}
                                            onChange={e => setPartialAmount(e.target.value)}
                                            placeholder="Enter partial amount"
                                            className="w-full bg-slate-800 border border-slate-600 focus:border-amber-500 rounded-lg px-8 py-3 text-white text-sm font-mono outline-none transition-colors"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* Live summary */}
                                {partial > 0 && (
                                    <div className="rounded-xl border border-slate-700/40 bg-slate-800/40 divide-y divide-slate-700/40">
                                        <div className="flex justify-between px-4 py-2.5 text-sm">
                                            <span className="text-slate-400">Total Due</span>
                                            <span className="font-mono text-white">{fmt(totalDue, region)}</span>
                                        </div>
                                        <div className="flex justify-between px-4 py-2.5 text-sm">
                                            <span className="text-emerald-400">Amount Paid Now</span>
                                            <span className="font-mono text-emerald-400 font-bold">{fmt(partial, region)}</span>
                                        </div>
                                        <div className="flex justify-between px-4 py-2.5 text-sm">
                                            <span className="text-amber-400">Remaining Balance</span>
                                            <span className={`font-mono font-bold ${remaining <= 0 ? 'text-red-400' : 'text-amber-400'}`}>{fmt(remaining > 0 ? remaining : 0, region)}</span>
                                        </div>
                                    </div>
                                )}

                                {!isValid && partial > 0 && (
                                    <p className="text-xs text-rose-400 flex items-center gap-1">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        {partial >= totalDue ? 'Amount must be less than the total due. Use Receive Cheque for full payment.' : 'Amount must be greater than zero.'}
                                    </p>
                                )}

                                <p className="text-[11px] text-slate-500">
                                    The current milestone will be split. A new <strong className="text-slate-300">(Balance)</strong> milestone will be added to the payment schedule for the remaining amount.
                                </p>

                                {/* Actions */}
                                <div className="flex gap-3 pt-1">
                                    <button
                                        onClick={() => setPartialModal(null)}
                                        className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        disabled={!isValid}
                                        onClick={handlePartialPayment}
                                        className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 text-sm font-bold transition-colors"
                                    >
                                        Confirm Partial Payment
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                );
            })()}
        </div>
    );
}
