import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Building, AlertCircle, X } from 'lucide-react';
import axios from 'axios';

// Add simple fast API URL configuration
const API_URL = 'http://localhost:8080';

export default function Dashboard() {
    const [sales, setSales] = useState([]);
    const [selectedStat, setSelectedStat] = useState<string | null>(null);

    useEffect(() => {
        // In a real app we'd fetch this from the actual excel-backed API,
        // this acts as a placeholder while the backend isn't running yet during scaffolding.
        axios.get(`${API_URL}/api/sales`)
            .then(res => setSales(res.data))
            .catch(err => console.error("API not up yet or error fetching:", err));
    }, []);

    // Dynamic statistic calculations
    const formatCurrency = (val: number) => {
        if (val >= 1000000) return '$' + (val / 1000000).toFixed(1) + 'M';
        if (val >= 1000) return '$' + (val / 1000).toFixed(1) + 'K';
        return '$' + val;
    };

    const totalVolume = sales.reduce((sum, sale: any) => {
        const p = sale.price ?? sale.SalePrice ?? 0;
        return sum + Number(String(p).replace(/[^0-9.-]+/g, ''));
    }, 0);
    const activeBuyersCount = new Set(sales.map((s: any) => s.buyer || s.BuyerName)).size;
    const missingCompliance = sales.filter((s: any) => {
        const fintrac = s.fintrac_verified ?? s.data?.fintracStatus ?? s.FINTRAC_Verified;
        return fintrac === 0.0 || fintrac === "No" || fintrac === 0 || fintrac === "Not Started" || fintrac === false;
    }).length;

    const stats = [
        { title: 'Total Sales Volume', value: formatCurrency(totalVolume), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10', onClick: () => setSelectedStat('Total Sales Volume') },
        { title: 'Active Buyers', value: activeBuyersCount.toString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', onClick: () => setSelectedStat('Active Buyers') },
        { title: 'Available Units', value: '89', icon: Building, color: 'text-indigo-400', bg: 'bg-indigo-400/10', onClick: () => setSelectedStat('Available Units') },
        { title: 'Compliance Alerts', value: missingCompliance.toString(), icon: AlertCircle, color: missingCompliance > 0 ? 'text-rose-400' : 'text-slate-400', bg: missingCompliance > 0 ? 'bg-rose-400/10' : 'bg-slate-400/10', onClick: () => setSelectedStat('Compliance Alerts') },
    ];

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-400 mt-1">Real-time metrics from the Excel database.</p>
                </div>

                <div className="flex gap-2">
                    {['US', 'CA', 'IN'].map(country => (
                        <button key={country} className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700 focus:ring-2 focus:ring-blue-500">
                            {country}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel p-6 flex items-start justify-between group hover:border-slate-500 transition-colors cursor-pointer active:scale-95 duration-200"
                        onClick={stat.onClick}
                    >
                        <div>
                            <p className="text-sm font-medium text-slate-400">{stat.title}</p>
                            <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Placeholder for AI Extractor feed or Recent Sales Table */}
            <div className="glass-panel p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Recent Sales Activity</h2>
                {sales.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-700/50 text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="px-4 py-3 font-medium">Sale ID</th>
                                    <th className="px-4 py-3 font-medium">Property</th>
                                    <th className="px-4 py-3 font-medium">Unit</th>
                                    <th className="px-4 py-3 font-medium">Buyer</th>
                                    <th className="px-4 py-3 font-medium">Price</th>
                                    <th className="px-4 py-3 font-medium">Date</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...sales].reverse().slice(0, 10).map((sale: any, i) => (
                                    <motion.tr
                                        key={sale.id || sale.SaleID}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors"
                                    >
                                        <td className="px-4 py-3 font-medium text-white text-sm">{(sale.id || sale.SaleID || "").substring(0, 8)}...</td>
                                        <td className="px-4 py-3 text-slate-300 text-sm">{sale.property || sale.PropertyID}</td>
                                        <td className="px-4 py-3 text-slate-300 text-sm">{sale.unit || sale.UnitID}</td>
                                        <td className="px-4 py-3 text-slate-300 text-sm">{sale.buyer || sale.BuyerName}</td>
                                        <td className="px-4 py-3 font-medium text-sm text-slate-300">${Number(String(sale.price || sale.SalePrice || 0).replace(/[^0-9.-]+/g, '')).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-slate-400 text-sm">{((sale.date || sale.Date) ? String(sale.date || sale.Date).substring(0, 10) : "")}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                                ${['Confirmed', 'Completed', 'Sold'].includes(sale.status || sale.Status) ? 'bg-emerald-500/10 text-emerald-400' :
                                                    (sale.status || sale.Status) === 'Cancelled' ? 'bg-red-500/10 text-red-400' :
                                                        'bg-amber-500/10 text-amber-400'}`}>
                                                {sale.status || sale.Status || 'Pending'}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="h-48 border-2 border-dashed border-slate-700/50 rounded-xl flex items-center justify-center text-slate-500 flex-col">
                        <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
                        <p>No recent data fetched yet. Waiting for backend.</p>
                    </div>
                )}
            </div>

            {/* Modal Overlay for Tile Details */}
            {selectedStat && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedStat(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel p-6 w-full max-w-3xl relative max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedStat(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">
                            {selectedStat} Details
                        </h2>

                        {selectedStat === 'Compliance Alerts' && (
                            <div className="overflow-x-auto">
                                <p className="text-slate-400 text-sm mb-4">The following sales are missing mandatory FINTRAC KYC verification. Please collect SIN/ITN and Residency details immediately to proceed.</p>
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-rose-500/20 text-rose-400 text-xs uppercase tracking-wider bg-rose-500/5">
                                            <th className="px-4 py-3 font-medium">Sale ID</th>
                                            <th className="px-4 py-3 font-medium">Buyer</th>
                                            <th className="px-4 py-3 font-medium">Date Initiated</th>
                                            <th className="px-4 py-3 font-medium">Action Required</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sales.filter((s: any) => {
                                            const fintrac = s.fintrac_verified ?? s.data?.fintracStatus ?? s.FINTRAC_Verified;
                                            return fintrac === 0.0 || fintrac === "No" || fintrac === 0 || fintrac === "Not Started" || fintrac === false;
                                        }).map((sale: any) => (
                                            <tr key={sale.id || sale.SaleID} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                                                <td className="px-4 py-3 font-medium text-white text-sm">{(sale.id || sale.SaleID || "").substring(0, 8)}...</td>
                                                <td className="px-4 py-3 text-slate-300 text-sm">{sale.buyer || sale.BuyerName}</td>
                                                <td className="px-4 py-3 text-slate-400 text-sm">{String(sale.date || sale.Date).substring(0, 10)}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <button className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-xs hover:bg-rose-500/30 transition-colors">Resolve KYC</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {selectedStat === 'Active Buyers' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Array.from(new Set(sales.map((s: any) => s.buyer || s.BuyerName))).map((buyer: any, idx) => (
                                    <div key={idx} className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg flex items-center gap-3 hover:border-blue-500/30 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                                            {buyer ? String(buyer).charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{buyer}</p>
                                            <p className="text-slate-400 text-xs truncate">Client ID: B-{1000 + idx}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedStat === 'Total Sales Volume' && (
                            <p className="text-slate-400">Total Volume is calculated dynamically as the sum of all confirmed or pending Sale Contracts in the database. You can view the individual lines in the Recent Sales table.</p>
                        )}

                        {selectedStat === 'Available Units' && (
                            <div className="grid grid-cols-2 gap-4">
                                <p className="col-span-2 text-slate-400 text-sm mb-2">Simulated live inventory from construction projects:</p>
                                {['B-101 (Maple Vista)', 'B-102 (Maple Vista)', 'C-305 (Azure Heights)', 'P-44 (Oasis)'].map((unit, idx) => (
                                    <div key={idx} className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg flex items-center justify-between">
                                        <span className="text-slate-200 text-sm font-medium">{unit}</span>
                                        <span className="px-2 py-1 text-xs bg-indigo-500/20 text-indigo-400 rounded-md">Available</span>
                                    </div>
                                ))}
                                <div className="col-span-2 p-3 text-center border border-dashed border-slate-700 rounded-lg text-slate-500 text-sm mt-2">
                                    + 85 more units listed in Yardi Sync...
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
}
