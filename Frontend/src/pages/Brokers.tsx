import { useState } from 'react';
import { BadgeDollarSign, Calculator, Layers, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Brokers() {
    const [region, setRegion] = useState('NA');
    const [price, setPrice] = useState('850000');
    const [split, setSplit] = useState('0.06');
    const [commission, setCommission] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const calculateBrokerage = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8080/api/brokerage/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    region: region,
                    total_price: parseFloat(price),
                    split_percentage: parseFloat(split)
                })
            });
            const data = await res.json();
            setCommission(data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Broker Commissions</h1>
                    <p className="text-slate-400 mt-1">Calculate splits and payout milestones.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-amber-400" />
                        Commission Calculator
                    </h2>
                    <form onSubmit={calculateBrokerage} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Region Logic</label>
                                <select
                                    value={region}
                                    onChange={(e) => setRegion(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                                >
                                    <option value="NA">North America (Agent Split)</option>
                                    <option value="India">India (Milestone Release)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Base Price</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Total Commission Rate (Decimal)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={split}
                                onChange={(e) => setSplit(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? 'Processing...' : 'Calculate Distributions'}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                </div>

                <div className="glass-panel p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-indigo-400" />
                        Distribution Payouts
                    </h2>

                    {commission ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                <div className="text-sm text-slate-400">Total Commission Value</div>
                                <div className="text-3xl font-bold text-white mt-1">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(commission.total_commission)}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Breakdown Structure</h3>
                                {Object.entries(commission.breakdown).map(([key, value]: [string, any], index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded border border-slate-700/50">
                                        <span className="text-slate-300 capitalize">{key.replace(/_/g, ' ')}</span>
                                        <span className="font-mono text-amber-400">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-48 flex flex-col items-center justify-center text-slate-500">
                            <BadgeDollarSign className="w-12 h-12 mb-3 opacity-20" />
                            <p>Awaiting calculation request.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
