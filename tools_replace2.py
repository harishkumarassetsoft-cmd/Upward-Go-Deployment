import sys

file_path = 'c:/Upward-Go/Frontend/src/pages/Buyers.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    orig = f.read()

new_content = """import { useState, useEffect } from 'react';
import { Users, CreditCard, CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BuyerFlowModal from '../components/BuyerFlowModal';

const API = 'http://localhost:8000';

export default function Buyers() {
    const [sales, setSales] = useState<any[]>([]);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [paymentDates, setPaymentDates] = useState<Record<string, string>>({}); // temp state for picking date
    const [selectedSale, setSelectedSale] = useState<any>(null);

    // Fetch sales and filter for confirmed schedules
    const fetchSales = async () => {
        try {
            const res = await fetch(`${API}/api/sales`);
            const data = await res.json();
            const parsed = data.map((s: any) => ({
                ...s,
                data: typeof s.data === 'string' ? JSON.parse(s.data || '{}') : (s.data || {})
            }));
            setSales(parsed.filter((s: any) => s.data?.paymentScheduleConfirmed && s.data?.paymentSchedule?.length > 0));
        } catch (error) {
            console.error("Failed to fetch sales for buyers directory", error);
        }
    };

    useEffect(() => {
        fetchSales();
        const interval = setInterval(fetchSales, 5000);
        return () => clearInterval(interval);
    }, []);

    const markPaid = async (sale: any, idx: number, date: string) => {
        if (!date) {
            alert("Please select the actual date of payment.");
            return;
        }
        
        const updatedSchedule = [...sale.data.paymentSchedule];
        updatedSchedule[idx] = { ...updatedSchedule[idx], actual_date: date };
        
        const updatedSale = {
            ...sale,
            data: { ...sale.data, paymentSchedule: updatedSchedule }
        };

        setSales(prev => prev.map(s => s.id === updatedSale.id ? updatedSale : s));
        
        try {
            await fetch(`${API}/api/sales`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...updatedSale,
                    data: JSON.stringify(updatedSale.data || {})
                })
            });
            setPaymentDates(prev => {
                const copy = { ...prev };
                delete copy[`${sale.id}-${idx}`];
                return copy;
            });
        } catch (error) {
            console.error('Failed to sync actual payment date:', error);
        }
    };

    const totalPaid = (schedule: any[]) => schedule.reduce((sum, item) => item.actual_date ? sum + item.amount_due : sum, 0);
    const totalOwed = (schedule: any[]) => schedule.reduce((sum, i) => sum + i.amount_due, 0);

    const fmt = (n: number, region: string) =>
        new Intl.NumberFormat('en-CA', { style: 'currency', currency: region === 'India' ? 'INR' : 'CAD', maximumFractionDigits: 0 }).format(n);

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Buyers Directory</h1>
                    <p className="text-slate-400 mt-1">View confirmed payment schedules and track instalment payments per buyer.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 glass-panel rounded-xl text-sm text-slate-300">
                    <Users className="w-4 h-4 text-indigo-400" />
                    {sales.length} Active Buyers
                </div>
            </header>

            {sales.length === 0 ? (
                <div className="glass-panel p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                        <CreditCard className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">No Confirmed Payment Schedules Yet</h2>
                    <p className="text-slate-400 max-w-md">
                        Once a buyer's Payment Schedule is confirmed in the <strong className="text-white">Sales → Buyer Flow</strong> (Stage 3: Payment Schedule), it will appear here for tracking and payment.
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
                        const isExpanded = expanded === sale.id;
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
                                    onClick={() => setExpanded(isExpanded ? null : sale.id)}
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
                                        {/* Progress ring summary */}
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs text-slate-400">{paidCount}/{sched.length} instalments paid</p>
                                            <p className="text-sm font-mono text-emerald-400">{fmt(paid, region)} of {fmt(total, region)}</p>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="w-24 hidden md:block">
                                            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                                <span>{pct}% paid</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${pct}%` }}
                                                />
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
                                            {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded instalment table */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-slate-700/50"
                                        >
                                            <div className="p-5">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                                        <CreditCard className="w-4 h-4 text-emerald-400" />
                                                        Payment Instalments — {region} Schedule
                                                    </h3>
                                                    <div className="flex items-center gap-4">
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

                                                <div className="rounded-lg overflow-hidden border border-slate-700/50">
                                                    <table className="w-full text-left text-sm">
                                                        <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 border-b border-slate-700/50">
                                                            <tr>
                                                                <th className="px-3 py-3">#</th>
                                                                <th className="px-3 py-3">Milestone</th>
                                                                <th className="px-3 py-3 text-right">%</th>
                                                                <th className="px-3 py-3 text-right">Amount</th>
                                                                <th className="px-3 py-3">Est. Date</th>
                                                                <th className="px-3 py-3">Act. Date</th>
                                                                <th className="px-3 py-3 text-right">Status</th>
                                                                <th className="px-3 py-3 text-center w-32">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-800">
                                                            {sched.map((item: any, i: number) => {
                                                                const isPaid = !!item.actual_date;
                                                                const isPrevPaid = i === 0 || !!sched[i - 1].actual_date;
                                                                const isAvailable = isPrevPaid && !isPaid;
                                                                const tempDateKey = `${sale.id}-${i}`;

                                                                return (
                                                                    <motion.tr
                                                                        key={i}
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1 }}
                                                                        transition={{ delay: i * 0.04 }}
                                                                        className={`transition-colors ${isPaid ? 'bg-emerald-500/5' : isAvailable ? 'bg-slate-800/20' : 'opacity-60'}`}
                                                                    >
                                                                        <td className="px-3 py-3 text-slate-500 font-mono text-xs">{i + 1}</td>
                                                                        <td className="px-3 py-3 font-medium text-white max-w-[150px] truncate text-xs" title={item.milestone_name}>{item.milestone_name}</td>
                                                                        <td className="px-3 py-3 text-right text-slate-300 text-xs">{(item.percentage * 100).toFixed(1)}%</td>
                                                                        <td className="px-3 py-3 text-right font-mono text-emerald-400 text-xs">{fmt(item.amount_due, region)}</td>
                                                                        <td className="px-3 py-3 text-slate-400 text-xs">{item.estimated_date || '—'}</td>
                                                                        <td className="px-3 py-3 text-slate-300 font-medium text-xs">
                                                                            {isPaid ? (
                                                                                <span className="text-emerald-300">{item.actual_date}</span>
                                                                            ) : isAvailable ? (
                                                                                <input
                                                                                    type="date"
                                                                                    value={paymentDates[tempDateKey] || ''}
                                                                                    onChange={(e) => setPaymentDates(prev => ({ ...prev, [tempDateKey]: e.target.value }))}
                                                                                    className="w-24 bg-slate-900 border border-slate-700 rounded px-1 text-[10px] text-slate-200 focus:border-blue-500"
                                                                                />
                                                                            ) : (
                                                                                <span className="text-slate-600">—</span>
                                                                            )}
                                                                        </td>
                                                                        <td className="px-3 py-3 text-right">
                                                                            {isPaid ? (
                                                                                <span className="flex items-center justify-end gap-1 text-emerald-400 text-xs font-medium">
                                                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                                                                                </span>
                                                                            ) : isAvailable ? (
                                                                                <span className="flex items-center justify-end gap-1 text-amber-400 text-xs font-medium">
                                                                                    <Clock className="w-3.5 h-3.5" /> Due
                                                                                </span>
                                                                            ) : (
                                                                                <span className="flex items-center justify-end gap-1 text-slate-500 text-xs">
                                                                                    <AlertCircle className="w-3.5 h-3.5" /> Pending
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                        <td className="px-3 py-3 text-center">
                                                                            {isPaid ? (
                                                                                <span className="text-emerald-500 text-xs">✓</span>
                                                                            ) : isAvailable ? (
                                                                                <button
                                                                                    onClick={() => markPaid(sale, i, paymentDates[tempDateKey] || '')}
                                                                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md transition-colors"
                                                                                >
                                                                                    Mark Paid
                                                                                </button>
                                                                            ) : (
                                                                                <span className="text-slate-600 text-xs">—</span>
                                                                            )}
                                                                        </td>
                                                                    </motion.tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Summary bar */}
                                                <div className="mt-4 flex items-center gap-4">
                                                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="text-sm font-semibold text-emerald-400 whitespace-nowrap">{pct}% Complete</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            )}
            
            {/* ── BUYER FLOW MODAL ── */}
            {selectedSale && (
                <BuyerFlowModal
                    sale={selectedSale}
                    onClose={() => setSelectedSale(null)}
                    onUpdateSale={async (updated) => {
                        setSales(prev => prev.map(s => s.id === updated.id ? updated : s));
                        setSelectedSale(updated);
                        
                        try {
                            const payload = {
                                ...updated,
                                data: JSON.stringify(updated.data || {})
                            };
                            await fetch(`${API}/api/sales`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload)
                            });
                        } catch (error) {
                            console.error('Failed to sync sale update:', error);
                        }
                    }}
                />
            )}
        </div>
    );
}
"""

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Updated Buyers.tsx successfully")
