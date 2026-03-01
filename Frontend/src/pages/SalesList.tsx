import { useState, useEffect } from 'react';
import BuyerFlowModal from '../components/BuyerFlowModal';
import { Plus, Upload, Filter, Search, X, Building, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

import { API_URL } from '../config';
const API = API_URL;
const STATUS_OPTIONS = ['All', 'Reservation', 'Pending', 'Confirmed', 'Completed', 'Cancelled', 'Draft'];

export default function SalesList() {
    const location = useLocation();
    const { prefilledUnit, property, defaultAgreementType } = location.state || {};
    // Whether the incoming unit is Under Construction (forces Pre-Construction agreement)
    const isPreCon = prefilledUnit?.status === 'Under Construction' || defaultAgreementType === 'Pre-Construction';

    const [sales, setSales] = useState<any[]>([]);
    const [selectedSale, setSelectedSale] = useState<any>(null);


    // Search & filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [showFilter, setShowFilter] = useState(false);

    // New sale modal state
    const [isCreatingSale, setIsCreatingSale] = useState(!!prefilledUnit);
    const [properties, setProperties] = useState<any[]>([]);
    const [availableUnits, setAvailableUnits] = useState<any[]>([]);
    const [newSale, setNewSale] = useState({
        property: property?.name ?? '',
        propertyId: property?.id ?? '',
        unit: prefilledUnit?.unit_number ?? '',
        unitId: prefilledUnit?.id ?? '',
        unitStatus: prefilledUnit?.status ?? '',   // tracks status of selected unit
        price: prefilledUnit?.price ?? '',
        agreementType: isPreCon ? 'Pre-Construction' : '',
        buyerName: '',
        country: 'CA',
    });

    const loadAvailableUnits = async (propId: string) => {
        if (!propId) { setAvailableUnits([]); return; }
        try {
            const res = await fetch(`${API}/api/properties/${propId}/units`);
            const all = await res.json();
            // Include both Available AND Under Construction units (UC = pre-con sale)
            // AND ensure the unit is not already attached to an active sale
            const activeUnitIds = new Set(sales.filter((s: any) => s.status !== 'Cancelled').map((s: any) => s.unitId || s.unit));
            setAvailableUnits(all.filter((u: any) =>
                (u.status === 'Available' || u.status === 'Under Construction') &&
                !activeUnitIds.has(u.id) &&
                !activeUnitIds.has(u.unit_number)
            ));
        } catch { setAvailableUnits([]); }
    };

    useEffect(() => {
        // Fetch properties
        fetch(`${API}/api/properties/`)
            .then(r => r.json())
            .then(data => {
                setProperties(data);
                if (property?.id) loadAvailableUnits(property.id);
            })
            .catch(console.error);

        // Fetch sales
        fetch(`${API}/api/sales`)
            .then(r => r.json())
            .then(data => {
                // Parse the embedded 'data' JSON string if needed
                const parsedSales = data.map((s: any) => ({
                    ...s,
                    data: typeof s.data === 'string' ? JSON.parse(s.data || '{}') : (s.data || {})
                }));
                setSales(parsedSales);
            })
            .catch(console.error);
    }, [property, prefilledUnit]);

    // Filtered sales list
    const filteredSales = sales.filter((s: any) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q ||
            s.id.toLowerCase().includes(q) ||
            (s.property || '').toLowerCase().includes(q) ||
            (s.buyer || '').toLowerCase().includes(q) ||
            (s.unit || '').toLowerCase().includes(q);
        const matchesStatus = filterStatus === 'All' || s.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const statusColor: Record<string, string> = {
        Confirmed: 'bg-emerald-500/10 text-emerald-400',
        Pending: 'bg-amber-500/10 text-amber-400',
        Reservation: 'bg-blue-500/10 text-blue-400',
        Cancelled: 'bg-red-500/10 text-red-400',
        Completed: 'bg-emerald-700/20 text-emerald-300',
        Draft: 'bg-slate-700 text-slate-300',
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Sales Pipeline</h1>
                    <p className="text-slate-400 mt-1">Manage unit sales and compliance documentation.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium glass-panel hover:bg-slate-800 text-slate-300 transition-colors">
                        <Upload className="w-4 h-4" />
                        AI Document Upload
                    </button>
                    <button
                        onClick={() => setIsCreatingSale(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Sale
                    </button>
                </div>
            </header>

            <div className="glass-panel overflow-hidden">
                {/* Search + Filter bar */}
                <div className="p-4 border-b border-slate-700/50 flex gap-3 items-center relative">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by ID, Property, Unit, or Buyer..."
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-8 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowFilter(f => !f)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors ${filterStatus !== 'All'
                                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                                : 'glass-panel border-slate-700/50 text-slate-300 hover:bg-slate-800'
                                }`}>
                            <Filter className="w-4 h-4" />
                            {filterStatus !== 'All' && <span className="text-xs font-medium">{filterStatus}</span>}
                            <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <AnimatePresence>
                            {showFilter && (
                                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                                    className="absolute right-0 top-full mt-2 w-44 glass-panel rounded-xl overflow-hidden z-30 border border-slate-700/50 shadow-xl">
                                    {STATUS_OPTIONS.map(s => (
                                        <button key={s} onClick={() => { setFilterStatus(s); setShowFilter(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${filterStatus === s ? 'bg-blue-600/20 text-blue-400' : 'text-slate-300 hover:bg-slate-800'
                                                }`}>
                                            {s}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {(searchQuery || filterStatus !== 'All') && (
                        <span className="text-xs text-slate-500">{filteredSales.length} result{filteredSales.length !== 1 ? 's' : ''}</span>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 font-semibold border-b border-slate-700/50">
                            <tr>
                                <th className="px-6 py-4">Sale ID</th>
                                <th className="px-6 py-4">Property & Unit</th>
                                <th className="px-6 py-4">Buyer</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Compliance Region</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {filteredSales.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        {searchQuery || filterStatus !== 'All'
                                            ? `No sales match "${searchQuery || filterStatus}". Try clearing your search or filter.`
                                            : 'No sales yet. Click "+ New Sale" to create one.'}
                                    </td>
                                </tr>
                            ) : filteredSales.map((sale: any, i: number) => (
                                <motion.tr
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    key={sale.id}
                                    className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer"
                                    onClick={() => {
                                        setSelectedSale(sale);
                                    }}
                                >
                                    <td className="px-6 py-4 font-medium text-white">{sale.id}</td>
                                    <td className="px-6 py-4">
                                        <div>{sale.property}</div>
                                        <div className="text-xs text-slate-500">Unit: {sale.unit}</div>
                                    </td>
                                    <td className="px-6 py-4">{sale.buyer}</td>
                                    <td className="px-6 py-4 font-medium font-mono">{sale.price}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[sale.status] || 'bg-slate-700 text-slate-300'}`}>
                                            {sale.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="w-6 h-4 rounded bg-slate-800 border border-slate-700 inline-flex items-center justify-center text-[10px] font-bold">
                                            {sale.country}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── SALE DETAIL MODAL ── */}
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
            {/* ── NEW SALE MODAL ── */}
            {isCreatingSale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel p-6 w-full max-w-lg relative max-h-[92vh] overflow-y-auto"
                    >
                        <button
                            onClick={() => setIsCreatingSale(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Building className="w-5 h-5 text-blue-400" />
                            Initiate New Sale
                        </h2>

                        <form className="space-y-4" onSubmit={(e) => {
                            e.preventDefault();
                            const newSaleObj = {
                                id: `SL-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
                                property: newSale.property || property?.name || 'Unknown',
                                unit: newSale.unit || prefilledUnit?.unit_number || '',
                                unitId: newSale.unitId || prefilledUnit?.id || '',
                                unitStatus: newSale.unitStatus || prefilledUnit?.status || '',
                                buyer: newSale.buyerName,
                                price: `C$${Number(newSale.price).toLocaleString()}`,
                                status: 'Reservation',
                                country: newSale.country,
                                stage: 0,
                                data: {
                                    agreementType: newSale.unitStatus === 'Under Construction' ? 'Pre-Construction' : (newSale.agreementType || ''),
                                    salePrice: parseFloat(String(newSale.price || '0').replace(/[^0-9.]/g, '')) || '',
                                    unitId: newSale.unitId || prefilledUnit?.id || ''
                                }
                            };
                            setSales([newSaleObj, ...sales]);

                            // Background sync to backend
                            const payload = {
                                ...newSaleObj,
                                data: JSON.stringify(newSaleObj.data)
                            };
                            fetch(`${API}/api/sales`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload)
                            }).then(() => {
                                // Once the sale is saved, mark the unit itself as Reserved
                                if (newSale.unitId && newSale.unitStatus === 'Available') {
                                    fetch(`${API}/api/properties/units/${newSale.unitId}/status`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ status: 'Sale In-Progress' })
                                    }).catch(console.error);
                                }
                            }).catch(console.error);

                            setIsCreatingSale(false);
                        }}>
                            {/* Property */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Property</label>
                                {property ? (
                                    <input type="text" disabled value={property.name}
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-400 cursor-not-allowed" />
                                ) : (
                                    <select value={newSale.propertyId}
                                        onChange={async e => {
                                            const p = properties.find((pr: any) => pr.id === e.target.value);
                                            setNewSale(prev => ({ ...prev, propertyId: e.target.value, property: p?.name || '', unit: '', unitId: '', price: '' }));
                                            await loadAvailableUnits(e.target.value);
                                        }}
                                        required
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500">
                                        <option value="">Select a property...</option>
                                        {properties.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                )}
                            </div>

                            {/* Unit — Available + Under Construction */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Unit Number
                                    <span className="text-emerald-500 text-xs ml-1">— Available</span>
                                    <span className="text-blue-400 text-xs ml-1">& Under Construction</span>
                                </label>
                                {property && prefilledUnit ? (
                                    // Came from Properties page — show selected unit + others in same property
                                    <select value={newSale.unitId}
                                        onChange={e => {
                                            const u = availableUnits.find((u: any) => u.id === e.target.value) ||
                                                (e.target.value === prefilledUnit.id ? prefilledUnit : null);
                                            const isUC = u?.status === 'Under Construction';
                                            setNewSale(prev => ({
                                                ...prev,
                                                unitId: e.target.value,
                                                unit: u?.unit_number || '',
                                                unitStatus: u?.status || '',
                                                price: u?.price ?? prev.price,
                                                agreementType: isUC ? 'Pre-Construction' : prev.agreementType,
                                            }));
                                        }}
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500">
                                        <option value={prefilledUnit.id}>
                                            {prefilledUnit.unit_number} — C${(prefilledUnit.price / 1000).toFixed(0)}k
                                            {prefilledUnit.status === 'Under Construction' ? ' 🔧 Pre-Con' : ' ✓ pre-selected'}
                                        </option>
                                        {availableUnits.filter((u: any) => u.id !== prefilledUnit.id).map((u: any) => (
                                            <option key={u.id} value={u.id}>
                                                {u.unit_number} — C${(u.price / 1000).toFixed(0)}k | Floor {u.floor}
                                                {u.status === 'Under Construction' ? ' 🔧' : ''}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <select value={newSale.unitId}
                                        onChange={e => {
                                            const u = availableUnits.find((u: any) => u.id === e.target.value);
                                            const isUC = u?.status === 'Under Construction';
                                            setNewSale(prev => ({
                                                ...prev,
                                                unitId: e.target.value,
                                                unit: u?.unit_number || '',
                                                unitStatus: u?.status || '',
                                                price: u?.price ?? '',
                                                agreementType: isUC ? 'Pre-Construction' : '',
                                            }));
                                        }}
                                        required
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500">
                                        <option value="">{newSale.propertyId ? 'Select a unit...' : '← Select property first'}</option>
                                        {availableUnits.map((u: any) => (
                                            <option key={u.id} value={u.id}>
                                                {u.unit_number} — C${(u.price / 1000).toFixed(0)}k | Floor {u.floor} | {u.area_sqft} sqft
                                                {u.status === 'Under Construction' ? ' 🔧 Pre-Con' : ''}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {newSale.propertyId && availableUnits.length === 0 && (
                                    <p className="mt-1 text-xs text-amber-400">No sellable units in this property.</p>
                                )}
                            </div>

                            {/* Agreement Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                                    Agreement Type
                                    {newSale.unitStatus === 'Under Construction' && (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">🔧 Locked: Pre-Construction</span>
                                    )}
                                </label>
                                {newSale.unitStatus === 'Under Construction' ? (
                                    <input type="text" disabled value="Pre-Construction"
                                        className="w-full bg-blue-950/40 border border-blue-700/40 rounded-lg px-3 py-2 text-blue-300 cursor-not-allowed font-medium" />
                                ) : (
                                    <select value={newSale.agreementType}
                                        onChange={e => setNewSale(prev => ({ ...prev, agreementType: e.target.value }))}
                                        required
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500">
                                        <option value="">Select type...</option>
                                        <option value="Pre-Construction">Pre-Construction</option>
                                        <option value="Resale">Resale</option>
                                        <option value="Assignment">Assignment</option>
                                    </select>
                                )}
                            </div>

                            {/* Editable Sale Price */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Sale Price (C$) <span className="text-slate-500 text-xs ml-1">— auto-filled, editable</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">C$</span>
                                    <input type="number" value={newSale.price} min={0} step={500}
                                        onChange={e => setNewSale(prev => ({ ...prev, price: e.target.value }))}
                                        required placeholder="e.g. 620000"
                                        className="w-full bg-slate-800 border border-slate-700/50 rounded-lg py-2 pl-10 pr-3 text-slate-200 focus:outline-none focus:border-blue-500 font-mono" />
                                </div>
                                {newSale.price && (
                                    <p className="mt-1 text-xs text-slate-500">= C${Number(newSale.price).toLocaleString()}</p>
                                )}
                            </div>

                            {/* Buyer Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Buyer Full Name</label>
                                <input type="text" value={newSale.buyerName}
                                    onChange={e => setNewSale(prev => ({ ...prev, buyerName: e.target.value }))}
                                    placeholder="Enter full legal name of the buyer"
                                    required
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                            </div>

                            {/* Compliance Region */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Compliance Region</label>
                                <select value={newSale.country} onChange={e => setNewSale(prev => ({ ...prev, country: e.target.value }))}
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500">
                                    <option value="CA">🇨🇦 Canada</option>
                                    <option value="US">🇺🇸 United States</option>
                                    <option value="IN">🇮🇳 India</option>
                                </select>
                            </div>

                            <div className="pt-4 mt-2 border-t border-slate-700/50">
                                <button
                                    type="submit"
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                                >
                                    Confirm Reservation
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
