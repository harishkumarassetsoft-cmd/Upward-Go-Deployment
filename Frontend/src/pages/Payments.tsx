import { useState } from 'react';
import { CreditCard, Calculator, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScheduleItem {
    milestone_name: string;
    percentage: number;
    amount_due: number;
    trigger_type: string;
}

export default function Payments() {
    const [region, setRegion] = useState('India');
    const [price, setPrice] = useState('15000000');
    const [floors, setFloors] = useState('10');
    const [hasGovAid, setHasGovAid] = useState(false);
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Escrow Tracking State
    const [escrowPropertyId, setEscrowPropertyId] = useState('PROP-101');
    const [escrowAmount, setEscrowAmount] = useState('500000');
    const [escrowMilestone, setEscrowMilestone] = useState('80% Structure Complete');
    const [escrowStatus, setEscrowStatus] = useState('');

    const generateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // First call original schedule logic
            const res = await fetch('http://localhost:8080/api/payments/generate-schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    region: region,
                    total_price: parseFloat(price),
                    floors: parseInt(floors)
                })
            });
            const data = await res.json();

            // Phase 6 Integration: Call new deposit schedule endpoint to log to Excel securely
            await fetch('http://localhost:8080/api/phase6/sales/TEST-SALE-01/deposit-schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    purchase_price: parseFloat(price),
                    has_government_aid: hasGovAid
                })
            });

            setSchedule(data.schedule);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const requestEscrowRelease = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:8080/api/phase6/escrow/release', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    property_id: escrowPropertyId,
                    amount_requested: parseFloat(escrowAmount),
                    milestone: escrowMilestone
                })
            });
            const data = await res.json();
            if (res.ok) {
                setEscrowStatus(`Success: ${data.message} (${data.transaction.TransactionID})`);
            } else {
                setEscrowStatus(`Error: ${data.detail}`);
            }
        } catch (err) {
            setEscrowStatus('Error reaching backend.');
        }
    };

    const numericPrice = parseFloat(price) || 0;
    const buyerDown = hasGovAid ? numericPrice * 0.15 : numericPrice * 0.25;
    const govDown = hasGovAid ? numericPrice * 0.10 : 0;

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Payment Schedules</h1>
                    <p className="text-slate-400 mt-1">Generate regional schedules and milestone tranches.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-panel p-6 lg:col-span-1">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-emerald-400" />
                        Schedule Generator
                    </h2>
                    <form onSubmit={generateSchedule} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Region</label>
                            <select
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                            >
                                <option value="India">India (Milestone-based CLP)</option>
                                <option value="Canada">Canada (Time-based Pre-con)</option>
                                <option value="USA">USA (Standard Resale)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Total Unit Price</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-lg border border-slate-700/50">
                            <input
                                type="checkbox"
                                id="gov-aid"
                                checked={hasGovAid}
                                onChange={(e) => setHasGovAid(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-500 flex-shrink-0"
                            />
                            <div className="flex-1">
                                <label htmlFor="gov-aid" className="text-sm font-medium text-slate-200 block">Apply Government Aid Program</label>
                                <p className="text-xs text-slate-500">Shifts 10% of down payment to Gov grant. Extends payment schedule.</p>
                            </div>
                        </div>

                        <div className="space-y-2 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Buyer Down Payment ({hasGovAid ? '15%' : '25%'}):</span>
                                <span className="font-mono text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency: region === 'India' ? 'INR' : 'USD' }).format(buyerDown)}</span>
                            </div>
                            {hasGovAid && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-400">Gov Grant Down Payment (10%):</span>
                                    <span className="font-mono text-blue-400">{new Intl.NumberFormat('en-US', { style: 'currency', currency: region === 'India' ? 'INR' : 'USD' }).format(govDown)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm pt-2 border-t border-slate-800 font-medium">
                                <span className="text-slate-300">Total Validated Down:</span>
                                <span className="font-mono text-emerald-400">{new Intl.NumberFormat('en-US', { style: 'currency', currency: region === 'India' ? 'INR' : 'USD' }).format(buyerDown + govDown)}</span>
                            </div>
                        </div>
                        {region === 'India' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Total Floors in Building</label>
                                <input
                                    type="number"
                                    value={floors}
                                    onChange={(e) => setFloors(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? 'Calculating...' : 'Generate Format'}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                </div>

                <div className="glass-panel p-6 lg:col-span-2">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-400" />
                        Generated Installments
                    </h2>

                    {schedule.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-300">
                                <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 border-b border-slate-700/50">
                                    <tr>
                                        <th className="px-4 py-3">Milestone</th>
                                        <th className="px-4 py-3">Trigger Type</th>
                                        <th className="px-4 py-3 text-right">Percentage</th>
                                        <th className="px-4 py-3 text-right">Amount Due</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {schedule.map((item, i) => (
                                        <motion.tr
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            key={i}
                                            className="hover:bg-slate-800/30"
                                        >
                                            <td className="px-4 py-3 font-medium text-white">{item.milestone_name}</td>
                                            <td className="px-4 py-3 text-slate-400">
                                                <span className={`px-2 py-0.5 rounded text-xs ${item.trigger_type === 'Event' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                    {item.trigger_type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">{(item.percentage * 100).toFixed(1)}%</td>
                                            <td className="px-4 py-3 text-right font-mono text-emerald-400">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: region === 'India' ? 'INR' : 'USD' }).format(item.amount_due)}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-500">
                            <CreditCard className="w-12 h-12 mb-3 opacity-20" />
                            <p>Select criteria and generate a schedule to view tranches.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="glass-panel p-6 mt-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-400" />
                    Escrow Construction Release Tracker
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <p className="text-sm text-slate-400 mb-6">
                            Builders can request release of funds currently locked in Escrow strictly based on certified construction milestones (80% and 100%).
                        </p>
                        <form onSubmit={requestEscrowRelease} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Property ID</label>
                                    <input
                                        type="text"
                                        value={escrowPropertyId}
                                        onChange={(e) => setEscrowPropertyId(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Requested Amount ($)</label>
                                    <input
                                        type="number"
                                        value={escrowAmount}
                                        onChange={(e) => setEscrowAmount(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Certified Milestone</label>
                                <select
                                    value={escrowMilestone}
                                    onChange={(e) => setEscrowMilestone(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="50% Structure">50% Interim Construction</option>
                                    <option value="80% Structure Complete">80% Structural Completion</option>
                                    <option value="100% Practical Completion">100% Practical Completion (Handover)</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 px-4 rounded-lg transition-colors w-full sm:w-auto"
                            >
                                Request Escrow Release
                            </button>

                            {escrowStatus && (
                                <div className={`mt-4 p-3 rounded-lg text-sm ${escrowStatus.includes('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                    {escrowStatus}
                                </div>
                            )}
                        </form>
                    </div>

                    <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-5">
                        <h3 className="text-md font-medium text-white mb-4">Escrow Ledger Summaries</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                                <div>
                                    <p className="text-slate-300 font-medium">{escrowPropertyId} Master Escrow</p>
                                    <p className="text-xs text-slate-500">Held by Legal Trust</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-blue-400 font-mono text-lg">$4,250,500</p>
                                    <p className="text-xs text-slate-500">Accruing 1.2% Interest</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-sm opacity-50">
                                <div>
                                    <p className="text-slate-300">Previous Releases</p>
                                </div>
                                <p className="text-slate-400 font-mono">$0.00</p>
                            </div>
                            <div className="p-3 bg-slate-800 rounded-lg mt-4 text-xs text-slate-400">
                                Escrow ledger accurately tracks 100% of buyer deposits and earnest money per statutory trust regulations. Releases are strictly gated by verification of construction milestones (80%).
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
