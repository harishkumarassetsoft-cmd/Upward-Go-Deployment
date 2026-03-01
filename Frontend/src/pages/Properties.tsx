import { useState, useEffect } from 'react';
import { Building2, Home, ArrowLeft, PlusCircle, Edit2, X, Save, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const API = 'http://localhost:8080';

interface Property {
    id: string;
    name: string;
    location: string;
    province: string;
    country: string;
    developer_legal_entity: string;
    developer_tax_id: string;
    total_units: number;
    status: string;
    image_url: string;
    available_units?: number;
}

interface Unit {
    id: string;
    property_id: string;
    unit_number: string;
    floor: number;
    area_sqft: number;
    price: number;
    status: string;
    available_date?: string;
    bedrooms: number;
    bathrooms: number;
    image_url: string;
}

const PROPERTY_STATUSES = ['Pre-Launch', 'Active', 'Registered', 'Sold Out', 'On Hold'];
const UNIT_STATUSES = ['Available', 'Sale In-Progress', 'Sold', 'Under Construction'];

const FB_PROP = [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?w=800&q=80',
];
const FB_UNIT = [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80',
    'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80',
];

function safeImg(url: string, fallbacks: string[], idx = 0) {
    if (url && url.startsWith('http')) return url;
    return fallbacks[idx % fallbacks.length];
}

const blankProp = (): Property => ({
    id: 'new', name: '', location: '', province: '', country: 'Canada',
    developer_legal_entity: '', developer_tax_id: '', total_units: 0,
    status: 'Pre-Launch', image_url: FB_PROP[0],
});

const blankUnit = (propId: string): Unit => ({
    id: 'new', property_id: propId, unit_number: '', floor: 1, area_sqft: 0,
    price: 0, status: 'Available', available_date: '', bedrooms: 1, bathrooms: 1,
    image_url: FB_UNIT[0],
});

const statusPill: Record<string, string> = {
    Available: 'bg-emerald-500/90 text-white',
    'Sale In-Progress': 'bg-amber-500/90 text-white',
    Sold: 'bg-rose-500/90 text-white',
    'Under Construction': 'bg-blue-500/90 text-white',
    Active: 'bg-emerald-600/80 text-white',
    'Pre-Launch': 'bg-purple-500/80 text-white',
    Registered: 'bg-blue-600/80 text-white',
    'Sold Out': 'bg-rose-700/80 text-white',
    'On Hold': 'bg-slate-500/80 text-white',
};

const dotColor = (s: string) =>
    s === 'Available' ? 'bg-emerald-500' :
        s === 'Sale In-Progress' ? 'bg-amber-500' :
            s === 'Under Construction' ? 'bg-blue-500' : 'bg-rose-500';

export default function Properties() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [editProp, setEditProp] = useState<Property | null>(null);
    const [editUnit, setEditUnit] = useState<Unit | null>(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    // When sidebar "Properties" is clicked while on a property detail, reset to portfolio grid
    useEffect(() => {
        if (location.state?.reset) {
            setSelectedProperty(null);
            setUnits([]);
            setActiveFilter(null);
            // Clear the state so navigating within the page doesn't keep resetting
            navigate('/properties', { replace: true, state: {} });
        }
    }, [location.key]);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

    useEffect(() => { fetchProperties(); }, []);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/properties/`);
            setProperties(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const selectProperty = async (p: Property) => {
        setSelectedProperty(p);
        setActiveFilter(null);
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/properties/${p.id}/units`);
            setUnits(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const saveProp = async () => {
        if (!editProp) return;
        setSaving(true);
        try {
            await fetch(`${API}/api/properties/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editProp),
            });
            setEditProp(null);
            await fetchProperties();
            showToast('✓ Property saved and queued to Yardi Sync.');
        } catch { showToast('Error saving property.'); }
        finally { setSaving(false); }
    };

    const saveUnit = async () => {
        if (!editUnit || !selectedProperty) return;
        setSaving(true);
        try {
            await fetch(`${API}/api/properties/${selectedProperty.id}/units`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editUnit),
            });
            setEditUnit(null);
            await selectProperty(selectedProperty);
            showToast('✓ Unit saved and queued to Yardi Sync.');
        } catch { showToast('Error saving unit.'); }
        finally { setSaving(false); }
    };

    const updateProp = (field: string, value: unknown) =>
        setEditProp(prev => prev ? { ...prev, [field]: value } as Property : prev);

    const updateUnit = (field: string, value: unknown) =>
        setEditUnit(prev => prev ? { ...prev, [field]: value } as Unit : prev);

    const filteredUnits = activeFilter ? units.filter(u => u.status === activeFilter) : units;

    return (
        <div className="space-y-6">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="fixed top-4 right-4 z-[100] px-4 py-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-300 text-sm font-medium shadow-xl">
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        {selectedProperty ? selectedProperty.name : 'Properties Portfolio'}
                    </h1>
                    <p className="text-slate-400 mt-1 flex items-center gap-1.5">
                        {selectedProperty
                            ? <><MapPin className="w-3.5 h-3.5" />{selectedProperty.location}, {selectedProperty.province}, {selectedProperty.country}</>
                            : 'Browse buildings, manage inventory, and launch sales.'}
                    </p>
                </div>
                <div className="flex gap-3">
                    {selectedProperty ? (
                        <>
                            <button onClick={() => setEditUnit(blankUnit(selectedProperty.id))}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                                <PlusCircle className="w-4 h-4" /> Add Unit
                            </button>
                            <button onClick={() => setEditProp({ ...selectedProperty })}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium glass-panel hover:bg-slate-700 text-slate-300 transition-colors">
                                <Edit2 className="w-4 h-4" /> Edit Property
                            </button>
                            <button onClick={() => setSelectedProperty(null)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium glass-panel hover:bg-slate-800 text-slate-300 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setEditProp(blankProp())}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                            <PlusCircle className="w-4 h-4" /> Add Property
                        </button>
                    )}
                </div>
            </header>

            {/* Property Detail Banner */}
            {selectedProperty && (
                <div className="glass-panel p-4 grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                    {([
                        { label: 'Property ID', val: selectedProperty.id, cls: 'font-mono' },
                        { label: 'Developer', val: selectedProperty.developer_legal_entity, cls: '' },
                        { label: 'Tax ID / BN', val: selectedProperty.developer_tax_id, cls: 'font-mono' },
                        { label: 'Total Planned', val: String(selectedProperty.total_units), cls: '', tip: 'Total units planned for the building' },
                        { label: 'Listed in System', val: String(units.length), cls: 'text-blue-400 font-semibold', tip: 'Units entered into this system' },
                        { label: 'Status', val: selectedProperty.status, cls: '' },
                    ] as { label: string; val: string; cls: string; tip?: string }[]).map(({ label, val, cls, tip }) => (
                        <div key={label} title={tip}>
                            <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">{label}</span>
                            {label === 'Status'
                                ? <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusPill[val] || 'bg-slate-600 text-white'}`}>{val}</span>
                                : <span className={`text-white ${cls}`}>{val}</span>}
                        </div>
                    ))}
                </div>
            )}

            {/* Main content */}
            {!selectedProperty ? (
                loading ? (
                    <div className="py-20 text-center text-slate-400">Loading Property Portfolio...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((p, i) => (
                            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                onClick={() => selectProperty(p)}
                                className="glass-panel overflow-hidden cursor-pointer hover:border-blue-500/50 transition-colors group">
                                <div className="h-48 overflow-hidden relative bg-slate-800">
                                    <img src={safeImg(p.image_url, FB_PROP, i)} alt={p.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={e => { (e.target as HTMLImageElement).src = FB_PROP[i % 3]; }} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent" />
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${statusPill[p.status] || 'bg-slate-600 text-white'}`}>{p.status}</span>
                                    </div>
                                    <div className="absolute bottom-4 left-4">
                                        <div className="text-xl font-bold text-white">{p.name}</div>
                                        <div className="text-sm text-slate-300 flex items-center gap-1.5 mt-1">
                                            <MapPin className="w-3.5 h-3.5" />{p.location}, {p.province}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 grid grid-cols-3 gap-3 bg-slate-900/50 text-sm">
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase font-semibold">Planned Units</div>
                                        <div className="text-slate-200 font-medium">{p.total_units}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-emerald-500/80 uppercase font-semibold">Available</div>
                                        <div className="text-emerald-400 font-bold">{p.available_units ?? 0}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase font-semibold">Country</div>
                                        <div className="text-slate-300">{p.country}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {properties.length === 0 && (
                            <div className="col-span-3 glass-panel flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
                                <Building2 className="w-12 h-12 opacity-30" />
                                <p>No properties yet. Click "Add Property" to create one.</p>
                            </div>
                        )}
                    </div>
                )
            ) : (
                /* UNIT INVENTORY */
                <div className="space-y-4">
                    {/* Clickable status filter pills */}
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => setActiveFilter(null)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${activeFilter === null
                                ? 'bg-slate-600 border-slate-400 text-white'
                                : 'glass-panel border-slate-700/50 text-slate-400 hover:text-white'
                                }`}>
                            All ({units.length})
                        </button>
                        {UNIT_STATUSES.map(s => {
                            const count = units.filter(u => u.status === s).length;
                            const isActive = activeFilter === s;
                            return (
                                <button key={s}
                                    onClick={() => setActiveFilter(isActive ? null : s)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border cursor-pointer ${isActive
                                        ? 'bg-slate-600 border-slate-400 text-white'
                                        : 'glass-panel border-slate-700/50 text-slate-300 hover:border-slate-500 hover:text-white'
                                        }`}>
                                    <div className={`w-2.5 h-2.5 rounded-full ${dotColor(s)} ${isActive ? 'scale-125' : ''} transition-transform`} />
                                    {s} ({count})
                                    {isActive && <X className="w-3.5 h-3.5 text-slate-400 ml-1" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Unit grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {loading ? (
                            <div className="col-span-full py-12 text-center text-slate-500">Loading units...</div>
                        ) : units.length === 0 ? (
                            <div className="col-span-full glass-panel flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
                                <Home className="w-12 h-12 opacity-30" />
                                <p>No units yet. Click "Add Unit" to add one.</p>
                            </div>
                        ) : filteredUnits.length === 0 ? (
                            <div className="col-span-full glass-panel flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
                                <Home className="w-10 h-10 opacity-30" />
                                <p>No <strong className="text-slate-300">{activeFilter}</strong> units found.</p>
                                <button onClick={() => setActiveFilter(null)} className="text-blue-400 text-sm hover:underline">Clear filter</button>
                            </div>
                        ) : filteredUnits.map((unit, i) => (
                            <motion.div key={unit.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                                className="glass-panel rounded-xl overflow-hidden flex flex-col group">
                                <div className="h-32 relative bg-slate-800">
                                    <img src={safeImg(unit.image_url, FB_UNIT, i)} alt={`Unit ${unit.unit_number}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={e => { (e.target as HTMLImageElement).src = FB_UNIT[i % 3]; }} />
                                    <div className="absolute inset-0 bg-slate-950/40" />
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${statusPill[unit.status] || 'bg-slate-700 text-white'}`}>{unit.status}</span>
                                    </div>
                                    <button onClick={() => setEditUnit({ ...unit })}
                                        className="absolute top-2 left-2 p-1.5 rounded bg-slate-900/70 text-slate-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-lg font-bold text-white flex items-center gap-1.5">
                                            <Home className="w-4 h-4 text-blue-400" />{unit.unit_number}
                                        </div>
                                        <div className="text-sm font-mono text-emerald-400">C${(unit.price / 1000).toFixed(0)}k</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-3">
                                        <div className="bg-slate-900/50 rounded p-1.5 text-center">{unit.bedrooms} Bed</div>
                                        <div className="bg-slate-900/50 rounded p-1.5 text-center">{unit.bathrooms} Bath</div>
                                        <div className="bg-slate-900/50 rounded p-1.5 text-center">{unit.area_sqft} sqft</div>
                                        <div className="bg-slate-900/50 rounded p-1.5 text-center">Floor {unit.floor}</div>
                                    </div>
                                    {unit.available_date && (
                                        <div className="text-xs text-slate-500 mb-3">Avail: {String(unit.available_date).substring(0, 10)}</div>
                                    )}
                                    <div className="mt-auto">
                                        {(unit.status === 'Available' || unit.status === 'Under Construction') ? (
                                            <button
                                                onClick={() => navigate('/sales', {
                                                    state: {
                                                        prefilledUnit: unit,
                                                        property: selectedProperty,
                                                        ...(unit.status === 'Under Construction' && { defaultAgreementType: 'Pre-Construction' })
                                                    }
                                                })}
                                                className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${unit.status === 'Under Construction'
                                                    ? 'bg-blue-900/60 hover:bg-blue-800 text-blue-300 border border-blue-700/50'
                                                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                                                    }`}>
                                                <PlusCircle className="w-4 h-4" />
                                                {unit.status === 'Under Construction' ? 'Pre-Con Sale' : 'Initiate Sale'}
                                            </button>
                                        ) : (
                                            <button disabled className="w-full py-2 bg-slate-800 text-slate-500 rounded-lg text-sm font-medium cursor-not-allowed">
                                                {unit.status}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* PROPERTY MODAL */}
            <AnimatePresence>
                {editProp && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => setEditProp(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-panel p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">{editProp.id === 'new' ? 'Add New Property' : 'Edit Property'}</h2>
                                <button onClick={() => setEditProp(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {([
                                    { label: 'Property Name', field: 'name', full: true },
                                    { label: 'Address', field: 'location', full: true },
                                    { label: 'Province', field: 'province' },
                                    { label: 'Country', field: 'country' },
                                    { label: 'Developer Legal Entity', field: 'developer_legal_entity', full: true },
                                    { label: 'Developer Tax ID (BN in Canada)', field: 'developer_tax_id', full: true },
                                    { label: 'Total Planned Units', field: 'total_units', type: 'number' },
                                ] as { label: string; field: keyof Property; full?: boolean; type?: string }[]).map(({ label, field, full, type }) => (
                                    <div key={field} className={full ? 'col-span-2' : ''}>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
                                        <input type={type || 'text'}
                                            value={String(editProp[field] ?? '')}
                                            onChange={e => updateProp(field, type === 'number' ? Number(e.target.value) : e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Property Status</label>
                                    <select value={editProp.status} onChange={e => updateProp('status', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500">
                                        {PROPERTY_STATUSES.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Image URL (optional)</label>
                                    <input type="text" value={editProp.image_url} onChange={e => updateProp('image_url', e.target.value)} placeholder="https://..."
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button onClick={() => setEditProp(null)} className="px-4 py-2 text-sm text-slate-400 hover:text-white glass-panel rounded-lg">Cancel</button>
                                <button onClick={saveProp} disabled={saving}
                                    className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                                    <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save & Sync to Yardi'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* UNIT MODAL */}
            <AnimatePresence>
                {editUnit && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => setEditUnit(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-panel p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">
                                    {editUnit.id === 'new' ? 'Add New Unit' : `Edit Unit ${editUnit.unit_number}`}
                                </h2>
                                <button onClick={() => setEditUnit(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {([
                                    { label: 'Unit Number', field: 'unit_number' },
                                    { label: 'Floor', field: 'floor', type: 'number' },
                                    { label: 'Area (sqft)', field: 'area_sqft', type: 'number' },
                                    { label: 'Base Price (C$)', field: 'price', type: 'number' },
                                    { label: 'Bedrooms', field: 'bedrooms', type: 'number' },
                                    { label: 'Bathrooms', field: 'bathrooms', type: 'number' },
                                ] as { label: string; field: keyof Unit; type?: string }[]).map(({ label, field, type }) => (
                                    <div key={field}>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
                                        <input type={type || 'text'}
                                            value={String(editUnit[field] ?? '')}
                                            onChange={e => updateUnit(field, type === 'number' ? Number(e.target.value) : e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Unit Status</label>
                                    <select value={editUnit.status} onChange={e => updateUnit('status', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500">
                                        {UNIT_STATUSES.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Unit Available Date</label>
                                    <input type="date" value={String(editUnit.available_date || '')}
                                        onChange={e => updateUnit('available_date', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Image URL (optional)</label>
                                    <input type="text" value={editUnit.image_url} onChange={e => updateUnit('image_url', e.target.value)} placeholder="https://..."
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button onClick={() => setEditUnit(null)} className="px-4 py-2 text-sm text-slate-400 hover:text-white glass-panel rounded-lg">Cancel</button>
                                <button onClick={saveUnit} disabled={saving}
                                    className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                                    <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Unit'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
