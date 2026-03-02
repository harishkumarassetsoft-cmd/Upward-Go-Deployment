import { useState, useEffect } from 'react';
import { X, CheckCircle2, Upload, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface BuyerFlowModalProps {
    sale: any;
    onClose: () => void;
    onUpdateSale: (updatedSale: any) => void;
}

export default function BuyerFlowModal({ sale, onClose, onUpdateSale }: BuyerFlowModalProps) {
    const stages = [
        { name: 'Reservation', desc: 'Offer submitted, Earnest Money/Booking Amount paid.' },
        { name: 'Verification', desc: 'Escrow/Conditional Period for Title Search & Financing.' },
        { name: 'Payment Schedule', desc: 'Select and confirm buyer payment plan with milestone tranches.' },
        { name: 'Progress', desc: 'Construction-Linked or Time-based Interval triggers.' },
        { name: 'Pre-Closing', desc: 'Final walkthrough or PDI. Snagging checks.' },
        { name: 'Closing', desc: 'Final Statement of Adjustments. Deed registered.' }
    ];

    const [expandedStage, setExpandedStage] = useState<number | null>(() => sale.stage < stages.length ? sale.stage : stages.length - 1);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [refundDeposit, setRefundDeposit] = useState(true);

    const [paySchedRegion, setPaySchedRegion] = useState('Canada');
    const [paySchedHasGovAid, setPaySchedHasGovAid] = useState(false);

    // Draft state for the "Add Upgrade" form
    const [draftUpgrade, setDraftUpgrade] = useState<{ name: string; cost: string; notes: string } | null>(null);

    // Keep local selection in sync if parent changes it
    useEffect(() => {
        // Nothing strictly needed here since we consume 'sale' directly from props
    }, [sale]);

    const handleSaleDataChange = (field: string, value: any) => {
        const updated = {
            ...sale,
            data: { ...(sale.data || {}), [field]: value }
        };
        onUpdateSale(updated);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-6 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex justify-between items-start mb-6 w-5/6">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">Buyer Flow</h2>
                        <p className="text-slate-400 text-sm">
                            Tracking {sale.property} (Unit {sale.unit}) for {sale.buyer}
                        </p>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 max-w-sm">
                            <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${(sale.stage / stages.length) * 100}%` }}></div>
                        </div>
                    </div>
                    {sale.stage === 0 && sale.status !== 'Cancelled' && (
                        <button
                            onClick={() => { setRefundDeposit(true); setShowCancelModal(true); }}
                            className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-md text-xs font-medium transition-colors"
                        >
                            Cancel Sale (Cooling-off)
                        </button>
                    )}
                    {sale.status === 'Cancelled' && (
                        <span className="px-3 py-1.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-md text-xs font-medium">
                            Cancelled (Refunded)
                        </span>
                    )}
                </div>

                {sale.status === 'Cancelled' && (
                    <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                        <span className="text-rose-400 text-lg">🚫</span>
                        <div>
                            <p className="text-rose-400 font-semibold text-sm">Sale Cancelled</p>
                            <p className="text-rose-400/70 text-xs mt-0.5">
                                {sale.data?.cancelReason || 'Cooling-off period cancellation.'}
                                {sale.data?.refundDeposit ? ' · Deposit refund initiated.' : ' · No refund requested.'}
                            </p>
                        </div>
                    </div>
                )}

                <div className={`space-y-6 ${sale.status === 'Cancelled' ? 'pointer-events-none opacity-60 select-none' : ''}`}>
                    {stages.map((stage, idx) => {
                        const isCompleted = idx < sale.stage;
                        const isCurrent = idx === sale.stage;
                        const isExpanded = expandedStage === idx;
                        return (
                            <div key={idx} className="flex gap-4 cursor-pointer group" onClick={() => setExpandedStage(isExpanded ? null : idx)}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors
                                            ${isCompleted ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' :
                                            isCurrent ? 'bg-blue-500/20 border-blue-500 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' :
                                                'bg-slate-800 border-slate-700 text-slate-600 group-hover:border-slate-500'}`}>
                                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-sm font-bold">{idx + 1}</span>}
                                    </div>
                                    {idx < stages.length - 1 && (
                                        <div className={`w-0.5 h-full min-h-[48px] mt-2 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                                    )}
                                </div>
                                <div className="pt-1 flex-1 pb-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className={`font-semibold transition-colors ${isCurrent ? 'text-blue-400 text-lg' : isCompleted ? 'text-slate-200' : 'text-slate-400'}`}>
                                            {stage.name}
                                        </h3>
                                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded border border-slate-700 group-hover:bg-slate-700 transition-colors">
                                            {isExpanded ? 'Collapse' : 'Expand'}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-sm mt-1">{stage.desc}</p>

                                    {isExpanded && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className={`mt-4 rounded-lg p-4 border space-y-4 w-full ${isCurrent ? 'bg-slate-900/80 border-blue-500/30' : 'bg-slate-900/40 border-slate-800/80'}`} onClick={(e) => e.stopPropagation()}>
                                            {idx === 0 && (
                                                <>
                                                    {/* Sale Agreement Header */}
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="h-px flex-1 bg-slate-700/60" />
                                                        <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Sale Agreement</span>
                                                        <div className="h-px flex-1 bg-slate-700/60" />
                                                    </div>

                                                    {/* Row 1: Sale ID + Property ID */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-400 mb-1">Sale ID</label>
                                                            <input type="text" value={sale.id} disabled className="w-full bg-slate-900/60 border border-slate-700/50 rounded-md py-1.5 px-3 text-xs text-slate-400 font-mono cursor-not-allowed" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-400 mb-1">Property ID</label>
                                                            <input type="text" value={sale.data?.propertyId || sale.property || ''} onChange={(e) => handleSaleDataChange('propertyId', e.target.value)} placeholder="e.g. PROP-001" className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                                                        </div>
                                                    </div>

                                                    {/* Row 2: Unit ID + Buyer ID */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-400 mb-1">Unit ID</label>
                                                            <input type="text" value={sale.data?.unitId || sale.unit || ''} onChange={(e) => handleSaleDataChange('unitId', e.target.value)} placeholder="e.g. UNIT-001" className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-400 mb-1">Buyer ID</label>
                                                            <input type="text" value={sale.data?.buyerId || ''} onChange={(e) => handleSaleDataChange('buyerId', e.target.value)} placeholder="e.g. BYR-001" className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                                                        </div>
                                                    </div>

                                                    {/* Row 3: Sale Date + Agreement Type */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-400 mb-1">Sale Date</label>
                                                            <input type="date" value={sale.data?.saleDate || ''} onChange={(e) => handleSaleDataChange('saleDate', e.target.value)} className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-2">
                                                                Agreement Type
                                                                {sale.unitStatus === 'Under Construction' && (
                                                                    <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">🔧 Locked</span>
                                                                )}
                                                            </label>
                                                            {sale.unitStatus === 'Under Construction' ? (
                                                                <input type="text" disabled value="Pre-Construction"
                                                                    className="w-full bg-blue-950/40 border border-blue-700/40 rounded-md py-1.5 px-3 text-sm text-blue-300 cursor-not-allowed font-medium" />
                                                            ) : (
                                                                <select value={sale.data?.agreementType || ''} onChange={(e) => handleSaleDataChange('agreementType', e.target.value)} className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500">
                                                                    <option value="">Select type...</option>
                                                                    <option value="Pre-Construction">Pre-Construction</option>
                                                                    <option value="Resale">Resale</option>
                                                                    <option value="Assignment">Assignment</option>
                                                                </select>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Row 4: Sale Price + Sale Status */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-400 mb-1">Sale Price (C$)</label>
                                                            <div className="relative">
                                                                <input type="number" value={sale.data?.salePrice ? parseFloat(String(sale.data.salePrice).replace(/[^0-9.]/g, '')) : (sale.price ? parseFloat(String(sale.price).replace(/[^0-9.]/g, '')) : '')} onChange={(e) => handleSaleDataChange('salePrice', e.target.value)} placeholder="e.g. 620000" className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 pl-8 pr-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-400 mb-1">Sale Status</label>
                                                            <select value={sale.data?.saleStatus || 'Reservation'} onChange={(e) => handleSaleDataChange('saleStatus', e.target.value)} className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500">
                                                                <option>Reservation</option>
                                                                <option>Pending</option>
                                                                <option>Confirmed</option>
                                                                <option>Completed</option>
                                                                <option>Cancelled</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* Earnest Money + APS */}
                                                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/40">
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-400 mb-1">Earnest / Booking Amount (C$)</label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">C$</span>
                                                                <input type="text" value={sale.data?.earnestMoney || ''} onChange={(e) => handleSaleDataChange('earnestMoney', e.target.value)} placeholder="5,000.00" className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 pl-8 pr-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-400 mb-1">APS / Contract Signed Date</label>
                                                            <input type="date" value={sale.data?.apsDate || ''} onChange={(e) => handleSaleDataChange('apsDate', e.target.value)} className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input type="checkbox" checked={!!sale.data?.apsSigned} onChange={(e) => handleSaleDataChange('apsSigned', e.target.checked)} id="aps-signed" className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500" />
                                                        <label htmlFor="aps-signed" className="text-sm text-slate-300">Offer Submitted & Earnest Money Received</label>
                                                    </div>
                                                </>
                                            )}
                                            {idx === 1 && (
                                                <>
                                                    {/* Escrow + Financing */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-400 mb-1">Inspection Status</label>
                                                            <select value={sale.data?.inspectionStatus || ''} onChange={(e) => handleSaleDataChange('inspectionStatus', e.target.value)} className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500">
                                                                <option>Pending</option>
                                                                <option>Completed - Clean</option>
                                                                <option>Completed - Issues Found</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-400 mb-1">Appraisal Value (C$)</label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">C$</span>
                                                                <input type="text" value={sale.data?.appraisalValue || ''} onChange={(e) => handleSaleDataChange('appraisalValue', e.target.value)} placeholder="0.00" className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 pl-8 pr-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input type="checkbox" checked={!!sale.data?.financingApproved} onChange={(e) => handleSaleDataChange('financingApproved', e.target.checked)} id="financing-approved" className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500" />
                                                        <label htmlFor="financing-approved" className="text-sm text-slate-300">Financing Approved & Title Clear</label>
                                                    </div>

                                                    {/* ── Buyer KYC Section ── */}
                                                    <div className="pt-4 border-t border-slate-700/50">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="h-px flex-1 bg-slate-700/60" />
                                                            <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Buyer KYC — FINTRAC / AML</span>
                                                            <div className="h-px flex-1 bg-slate-700/60" />
                                                        </div>
                                                        {!sale.data?.kycVerified && (
                                                            <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-xs font-medium">
                                                                <span>⚠</span> KYC must be completed and verified before advancing to the next stage.
                                                            </div>
                                                        )}

                                                        {/* Buyer ID + Name */}
                                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-400 mb-1">Buyer ID</label>
                                                                <input type="text" value={sale.data?.buyerId || ''} onChange={(e) => handleSaleDataChange('buyerId', e.target.value)} placeholder="e.g. BYR-001" className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-400 mb-1">Full Legal Name</label>
                                                                <input type="text" value={sale.data?.kycName || sale.buyer || ''} onChange={(e) => handleSaleDataChange('kycName', e.target.value)} placeholder="As per ID" className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                                                            </div>
                                                        </div>

                                                        {/* DOB + Nationality */}
                                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-400 mb-1">Date of Birth</label>
                                                                <input type="date" value={sale.data?.kycDob || ''} onChange={(e) => handleSaleDataChange('kycDob', e.target.value)} className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-400 mb-1">Nationality</label>
                                                                <input type="text" value={sale.data?.kycNationality || ''} onChange={(e) => handleSaleDataChange('kycNationality', e.target.value)} placeholder="e.g. Canadian" className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                                                            </div>
                                                        </div>

                                                        {/* Residency Status + SIN/ITN */}
                                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-400 mb-1">Residency Status</label>
                                                                <select value={sale.data?.residencyStatus || ''} onChange={(e) => handleSaleDataChange('residencyStatus', e.target.value)} className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500">
                                                                    <option value="">Select...</option>
                                                                    <option value="Citizen">Citizen / PR</option>
                                                                    <option value="TempResident">Temporary Resident</option>
                                                                    <option value="Foreign">Foreign Investor (FIPA)</option>
                                                                    <option value="NonResident">Non-Resident</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-400 mb-1">SIN / ITN</label>
                                                                <input type="text" value={sale.data?.sinItn || ''} onChange={(e) => handleSaleDataChange('sinItn', e.target.value)} placeholder="000-000-000" className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono" />
                                                            </div>
                                                        </div>

                                                        {/* Address */}
                                                        <div className="mb-3">
                                                            <label className="block text-xs font-medium text-slate-400 mb-1">Address</label>
                                                            <input type="text" value={sale.data?.kycAddress || ''} onChange={(e) => handleSaleDataChange('kycAddress', e.target.value)} placeholder="Street, City, Province, Postal Code" className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                                                        </div>

                                                        {/* Phone + Email */}
                                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-400 mb-1">Phone</label>
                                                                <input type="tel" value={sale.data?.kycPhone || ''} onChange={(e) => handleSaleDataChange('kycPhone', e.target.value)} placeholder="+1 (416) 000-0000" className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                                                                <input type="email" value={sale.data?.kycEmail || ''} onChange={(e) => handleSaleDataChange('kycEmail', e.target.value)} placeholder="buyer@email.com" className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                                                            </div>
                                                        </div>

                                                        {/* KYC Documents */}
                                                        <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 mb-3">
                                                            <div className="p-2 bg-amber-500/10 rounded-md">
                                                                <Upload className="w-4 h-4 text-amber-400" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-slate-300 text-sm font-medium">KYC Documents</p>
                                                                <p className="text-xs text-slate-500">Gov't ID (Passport/DL), Proof of Address, Source of Funds</p>
                                                                <div className="flex items-center gap-2 mt-1.5">
                                                                    <input type="checkbox" checked={!!sale.data?.kycDocsUploaded} onChange={(e) => handleSaleDataChange('kycDocsUploaded', e.target.checked)} id="kyc-docs-uploaded" className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-amber-500" />
                                                                    <label htmlFor="kyc-docs-uploaded" className="text-xs text-slate-400">All documents received</label>
                                                                </div>
                                                            </div>
                                                            <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 text-xs transition-colors">Upload</button>
                                                        </div>

                                                        {/* KYC Verified Gate */}
                                                        <div className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${sale.data?.kycVerified
                                                            ? 'bg-emerald-500/10 border-emerald-500/40'
                                                            : 'bg-slate-800/50 border-slate-700/50'
                                                            }`}>
                                                            <input type="checkbox" checked={!!sale.data?.kycVerified} onChange={(e) => handleSaleDataChange('kycVerified', e.target.checked)} id="kyc-verified" className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500" />
                                                            <label htmlFor="kyc-verified" className={`text-sm font-semibold cursor-pointer ${sale.data?.kycVerified ? 'text-emerald-400' : 'text-slate-300'
                                                                }`}>
                                                                {sale.data?.kycVerified ? '✓ KYC Verified — Identity & Funds Confirmed (FINTRAC)' : 'Mark KYC as Verified (required to proceed)'}
                                                            </label>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {idx === 2 && (() => {
                                                const schedule = sale.data?.paymentSchedule || [];
                                                const totalPct = schedule.reduce((sum: number, item: any) => sum + (parseFloat(item.percentage) || 0), 0);
                                                const is100Pct = Math.abs(totalPct - 1) < 0.001; // floating point safe
                                                const basePrice = parseFloat(sale.data?.paymentSchedulePrice !== undefined ? sale.data?.paymentSchedulePrice : String(sale.price || '').replace(/[^0-9.]/g, '')) || 0;
                                                const taxRate = paySchedRegion === 'Canada' ? 0.13 : paySchedRegion === 'India' ? 0.05 : 0;

                                                return (
                                                    <>
                                                        {/* Payment Schedule header */}
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className="h-px flex-1 bg-slate-700/60" />
                                                            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Payment Schedule</span>
                                                            <div className="h-px flex-1 bg-slate-700/60" />
                                                        </div>

                                                        {/* Controls */}
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-400 mb-1">Region / Schedule Type</label>
                                                                <select value={paySchedRegion} onChange={e => setPaySchedRegion(e.target.value)}
                                                                    className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
                                                                    <option value="Canada">Canada (Time-based Pre-con)</option>
                                                                    <option value="India">India (Milestone-based CLP)</option>
                                                                    <option value="USA">USA (Standard Resale)</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-400 mb-1">Total Unit Base Price (C$)</label>
                                                                <input type="number"
                                                                    value={basePrice || ''}
                                                                    onChange={(e) => handleSaleDataChange('paymentSchedulePrice', parseFloat(e.target.value) || 0)}
                                                                    className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono" />
                                                            </div>
                                                        </div>

                                                        <div className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${paySchedHasGovAid ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-800/50 border-slate-700/50'
                                                            }`} onClick={() => setPaySchedHasGovAid(p => !p)}>
                                                            <input type="checkbox" checked={paySchedHasGovAid} readOnly className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 pointer-events-none flex-shrink-0" />
                                                            <div>
                                                                <p className={`text-xs font-semibold ${paySchedHasGovAid ? 'text-blue-300' : 'text-slate-300'}`}>Apply Government Aid Program</p>
                                                                <p className="text-[10px] text-slate-500">Shifts 10% of down payment to Gov grant. Extends payment schedule.</p>
                                                            </div>
                                                        </div>

                                                        {!schedule.length && (
                                                            <button
                                                                type="button"
                                                                disabled={!!sale.data?.paymentScheduleConfirmed}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    if (!basePrice) {
                                                                        alert("Please enter a valid base price greater than 0");
                                                                        return;
                                                                    }

                                                                    let newSchedule = [];
                                                                    if (paySchedHasGovAid) {
                                                                        newSchedule.push({ milestone_name: 'Buyer Down Payment', percentage: 0.15, estimated_date: '', actual_date: '' });
                                                                        newSchedule.push({ milestone_name: 'Government Grant (Escrow)', percentage: 0.10, estimated_date: '', actual_date: '' });
                                                                    } else {
                                                                        newSchedule.push({ milestone_name: 'Deposit Amount', percentage: 0.25, estimated_date: '', actual_date: '' });
                                                                    }

                                                                    newSchedule.push({ milestone_name: 'Foundation / Plinth', percentage: 0.25, estimated_date: '', actual_date: '' });
                                                                    newSchedule.push({ milestone_name: 'Structure / Framing', percentage: 0.25, estimated_date: '', actual_date: '' });
                                                                    newSchedule.push({ milestone_name: 'Closing / Handover', percentage: 0.25, estimated_date: '', actual_date: '' });

                                                                    handleSaleDataChange('paymentScheduleRegion', paySchedRegion);
                                                                    handleSaleDataChange('paymentSchedule', newSchedule);
                                                                }}
                                                                className="w-full py-1.5 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-colors bg-blue-600 hover:bg-blue-500 text-white"
                                                            >
                                                                ⚡ Auto-Generate Base Schedule
                                                            </button>
                                                        )}

                                                        {schedule.length > 0 && (
                                                            <>
                                                                <div className="flex justify-between items-center text-xs bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                                                    <div>
                                                                        <span className="text-slate-400">Total %:</span>
                                                                        <span className={`ml-1 font-mono font-bold ${is100Pct ? 'text-emerald-400' : 'text-rose-400'}`}>{(totalPct * 100).toFixed(1)}%</span>
                                                                    </div>
                                                                    <div><span className="text-slate-400">Base Price:</span> <span className="text-slate-200 font-mono">C${Number(basePrice).toLocaleString()}</span></div>
                                                                    <div><span className="text-slate-400">Tax Avg ({taxRate * 100}%):</span> <span className="text-slate-200 font-mono">+ C${Number(basePrice * taxRate).toLocaleString()}</span></div>
                                                                    <div className="font-semibold"><span className="text-slate-400">Total Amount:</span> <span className="text-emerald-400 font-mono text-sm">C${Number(basePrice * (1 + taxRate)).toLocaleString()}</span></div>
                                                                </div>

                                                                <div className="rounded-lg overflow-x-auto border border-slate-700/50">
                                                                    <table className="w-full text-left text-xs whitespace-nowrap">
                                                                        <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-700/50">
                                                                            <tr>
                                                                                <th className="px-2 py-2 w-1/4">Milestone Name</th>
                                                                                <th className="px-2 py-2 w-20">%</th>
                                                                                <th className="px-2 py-2 text-right">Base Amt</th>
                                                                                <th className="px-2 py-2 text-right">Tax</th>
                                                                                <th className="px-2 py-2 text-right text-amber-400">Earnest/Booking</th>
                                                                                <th className="px-2 py-2 text-right">Total Amt</th>
                                                                                <th className="px-2 py-2">Est. Date</th>
                                                                                <th className="px-2 py-2 text-center w-8"></th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-slate-800/80">
                                                                            {schedule.map((item: any, i: number) => {
                                                                                const isFirstRow = i === 0;
                                                                                // Row 0 is always locked to Deposit Amount at 25%
                                                                                const pct = isFirstRow ? 0.25 : (parseFloat(item.percentage) || 0);
                                                                                const amount = basePrice * pct;
                                                                                const tax = amount * taxRate;
                                                                                const grossAmt = amount + tax;
                                                                                const parsedEarnest = parseFloat(String(sale.data?.earnestMoney || '0').replace(/[^0-9.]/g, '')) || 0;
                                                                                const netAmt = isFirstRow ? Math.max(0, grossAmt - parsedEarnest) : grossAmt;

                                                                                return (
                                                                                    <tr key={i} className={`hover:bg-slate-800/30 ${isFirstRow ? 'bg-blue-950/20' : ''}`}>
                                                                                        <td className="px-2 py-2">
                                                                                            <input
                                                                                                type="text"
                                                                                                value={isFirstRow ? 'Deposit Amount' : item.milestone_name}
                                                                                                disabled={isFirstRow || sale.data?.paymentScheduleConfirmed}
                                                                                                onChange={(e) => {
                                                                                                    if (isFirstRow) return;
                                                                                                    const newSched = [...schedule];
                                                                                                    newSched[i] = { ...newSched[i], milestone_name: e.target.value };
                                                                                                    handleSaleDataChange('paymentSchedule', newSched);
                                                                                                }}
                                                                                                className={`w-full border rounded px-2 py-1 focus:border-blue-500 ${isFirstRow ? 'bg-blue-900/30 border-blue-700/40 text-blue-300 font-semibold cursor-not-allowed' : 'bg-slate-900 border-slate-700 text-slate-200 disabled:opacity-50'}`}
                                                                                            />
                                                                                        </td>
                                                                                        <td className="px-2 py-2">
                                                                                            <div className="flex items-center gap-1">
                                                                                                {isFirstRow ? (
                                                                                                    <span className="w-16 px-1 py-1 text-blue-300 font-bold font-mono text-center block">25%</span>
                                                                                                ) : (
                                                                                                    <>
                                                                                                        <input
                                                                                                            type="number"
                                                                                                            value={item.percentage !== undefined ? parseFloat((item.percentage * 100).toFixed(4)) : 0}
                                                                                                            disabled={sale.data?.paymentScheduleConfirmed}
                                                                                                            onChange={(e) => {
                                                                                                                const newPct = parseFloat(e.target.value) / 100;
                                                                                                                if (isNaN(newPct)) return;
                                                                                                                const newSched = [...schedule];
                                                                                                                newSched[i] = { ...newSched[i], percentage: newPct };
                                                                                                                handleSaleDataChange('paymentSchedule', newSched);
                                                                                                            }}
                                                                                                            className="w-16 bg-slate-900 border border-slate-700 rounded px-1 py-1 text-slate-200 focus:border-blue-500 disabled:opacity-50"
                                                                                                        />
                                                                                                        <span className="text-slate-500">%</span>
                                                                                                    </>
                                                                                                )}
                                                                                            </div>
                                                                                        </td>
                                                                                        <td className="px-2 py-2 text-right font-mono text-slate-300">
                                                                                            {Number(amount).toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                                                        </td>
                                                                                        <td className="px-2 py-2 text-right font-mono text-rose-300/80">
                                                                                            {Number(tax).toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                                                        </td>
                                                                                        {/* Earnest/Booking deduction column */}
                                                                                        <td className="px-2 py-2 text-right font-mono">
                                                                                            {isFirstRow && parsedEarnest > 0 ? (
                                                                                                <span className="text-amber-400">− C${Number(parsedEarnest).toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                                                                            ) : (
                                                                                                <span className="text-slate-600">—</span>
                                                                                            )}
                                                                                        </td>
                                                                                        <td className="px-2 py-2 text-right font-mono text-emerald-400 font-medium">
                                                                                            C${Number(netAmt).toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                                                            {isFirstRow && parsedEarnest > 0 && (
                                                                                                <div className="text-[10px] text-slate-500 line-through">
                                                                                                    C${Number(grossAmt).toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                                                                </div>
                                                                                            )}
                                                                                        </td>
                                                                                        <td className="px-2 py-2">
                                                                                            <input type="date" value={item.estimated_date || ''} disabled={sale.data?.paymentScheduleConfirmed} onChange={(e) => {
                                                                                                const newSched = [...schedule];
                                                                                                newSched[i] = { ...newSched[i], estimated_date: e.target.value };
                                                                                                handleSaleDataChange('paymentSchedule', newSched);
                                                                                            }} className="w-[110px] bg-slate-900 border border-slate-700 rounded px-1 py-1 text-[11px] text-slate-300 disabled:opacity-50" />
                                                                                        </td>
                                                                                        <td className="px-2 py-2 text-center">
                                                                                            {!sale.data?.paymentScheduleConfirmed && !isFirstRow && (
                                                                                                <button
                                                                                                    onClick={() => {
                                                                                                        const newSched = schedule.filter((_: any, idx: number) => idx !== i);
                                                                                                        handleSaleDataChange('paymentSchedule', newSched);
                                                                                                    }}
                                                                                                    className="w-6 h-6 flex items-center justify-center rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-colors"
                                                                                                >
                                                                                                    <span className="text-sm rounded-full leading-none font-bold" style={{ marginTop: '-2px' }}>&times;</span>
                                                                                                </button>
                                                                                            )}
                                                                                        </td>
                                                                                    </tr>
                                                                                )
                                                                            })}
                                                                        </tbody>
                                                                    </table>
                                                                    {!sale.data?.paymentScheduleConfirmed && (
                                                                        <div className="p-2 border-t border-slate-700/50 bg-slate-800/30">
                                                                            <button
                                                                                onClick={() => {
                                                                                    const newSched = [...schedule, { milestone_name: 'New Milestone', percentage: 0, estimated_date: '', actual_date: '' }];
                                                                                    handleSaleDataChange('paymentSchedule', newSched);
                                                                                }}
                                                                                className="w-full py-1.5 rounded text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors flex justify-center items-center gap-1"
                                                                            >
                                                                                <span>+</span> Add Milestone
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {!sale.data?.paymentScheduleConfirmed && (
                                                                    <button
                                                                        disabled={!is100Pct}
                                                                        onClick={() => {
                                                                            // Ensure we write total amount, tax into the schedule object array for backward compatibility
                                                                            const finalizeSchedule = schedule.map((item: any, idx: number) => {
                                                                                const amt = basePrice * (parseFloat(item.percentage) || 0);
                                                                                const tx = amt * taxRate;
                                                                                let finalAmt = amt + tx;

                                                                                const parsedEarnest = parseFloat(String(sale.data?.earnestMoney || '0').replace(/[^0-9.]/g, '')) || 0;
                                                                                if (idx === 0 && (item.milestone_name === 'Deposit 1' || item.milestone_name === 'Buyer Down Payment') && parsedEarnest > 0) {
                                                                                    finalAmt -= parsedEarnest;
                                                                                }

                                                                                return {
                                                                                    ...item,
                                                                                    amount_due: finalAmt,
                                                                                    base_amount_due: amt,
                                                                                    tax_amount: tx
                                                                                }
                                                                            });
                                                                            onUpdateSale({
                                                                                ...sale,
                                                                                data: {
                                                                                    ...sale.data,
                                                                                    paymentSchedule: finalizeSchedule,
                                                                                    paymentScheduleConfirmed: true
                                                                                }
                                                                            });

                                                                            const key = 'confirmedPaySchedules';
                                                                            const existing = JSON.parse(localStorage.getItem(key) || '[]');
                                                                            const idx2 = existing.findIndex((e: any) => e.saleId === sale.id);
                                                                            const entry = {
                                                                                saleId: sale.id,
                                                                                buyer: sale.buyer,
                                                                                property: sale.property,
                                                                                unit: sale.unit,
                                                                                region: paySchedRegion,
                                                                                schedule: finalizeSchedule,
                                                                            };
                                                                            if (idx2 >= 0) existing[idx2] = entry; else existing.push(entry);
                                                                            localStorage.setItem(key, JSON.stringify(existing));
                                                                        }}
                                                                        className={`w-full py-2 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${is100Pct
                                                                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                                                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                                                            }`}
                                                                    >
                                                                        {is100Pct ? '✓ Confirm Payment Schedule' : 'Total must be exactly 100% to confirm'}
                                                                    </button>
                                                                )}

                                                                {sale.data?.paymentScheduleConfirmed && (
                                                                    <div className="flex items-center justify-between w-full px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-emerald-400 text-sm">✓</span>
                                                                            <span className="text-emerald-400 text-sm font-medium">Schedule confirmed. Buyer can now view & pay instalments on the Buyers page.</span>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleSaleDataChange('paymentScheduleConfirmed', false)}
                                                                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors border border-slate-700 hover:text-white"
                                                                        >
                                                                            Edit Schedule
                                                                        </button>
                                                                    </div>
                                                                )}

                                                                {/* ── Upgrades Section ── */}
                                                                <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-950/20 overflow-hidden">
                                                                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-violet-500/20 bg-violet-500/10">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-violet-400 text-sm">✦</span>
                                                                            <span className="text-xs font-bold uppercase tracking-widest text-violet-300">Upgrades / Add-ons</span>
                                                                        </div>
                                                                        <button
                                                                            title="Add upgrade"
                                                                            onClick={() => setDraftUpgrade({ name: '', cost: '', notes: '' })}
                                                                            disabled={!!draftUpgrade}
                                                                            className="px-2 py-1 rounded-md bg-violet-600/30 hover:bg-violet-600/50 disabled:opacity-40 disabled:cursor-not-allowed text-violet-300 text-xs font-semibold border border-violet-500/30 transition-colors"
                                                                        >
                                                                            + Add Upgrade
                                                                        </button>
                                                                    </div>

                                                                    {(!sale.data?.upgrades?.length && !draftUpgrade) ? (
                                                                        <p className="text-xs text-slate-500 text-center py-4">No upgrades added. Click <strong className="text-violet-400">+ Add Upgrade</strong> to begin.</p>
                                                                    ) : (
                                                                        <div className="divide-y divide-violet-500/10">
                                                                            {(sale.data?.upgrades as any[] || []).map((upg: any, ui: number) => (
                                                                                <div key={ui} className="px-4 py-3 grid grid-cols-[1fr_110px_100px_32px] gap-2 items-start">
                                                                                    <div>
                                                                                        <input
                                                                                            type="text"
                                                                                            placeholder="Upgrade name (e.g. Kitchen Quartz Countertop)"
                                                                                            value={upg.name}
                                                                                            title="Upgrade name"
                                                                                            onChange={e => {
                                                                                                const upgs = [...(sale.data?.upgrades || [])];
                                                                                                upgs[ui] = { ...upgs[ui], name: e.target.value };
                                                                                                handleSaleDataChange('upgrades', upgs);
                                                                                            }}
                                                                                            className="w-full bg-slate-800 border border-slate-700/50 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                                                                                        />
                                                                                        <input
                                                                                            type="text"
                                                                                            placeholder="Notes (optional)"
                                                                                            value={upg.notes}
                                                                                            title="Upgrade notes"
                                                                                            onChange={e => {
                                                                                                const upgs = [...(sale.data?.upgrades || [])];
                                                                                                upgs[ui] = { ...upgs[ui], notes: e.target.value };
                                                                                                handleSaleDataChange('upgrades', upgs);
                                                                                            }}
                                                                                            className="w-full mt-1 bg-slate-800 border border-slate-700/50 rounded px-2 py-1 text-[11px] text-slate-400 focus:outline-none focus:border-violet-500"
                                                                                        />
                                                                                    </div>
                                                                                    <div className="relative">
                                                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                                                                                            {(sale.data?.paymentScheduleRegion || 'Canada') === 'India' ? '₹' : 'C$'}
                                                                                        </span>
                                                                                        <input
                                                                                            type="number"
                                                                                            min={0}
                                                                                            step={100}
                                                                                            title="Upgrade cost"
                                                                                            placeholder="0"
                                                                                            value={upg.cost || ''}
                                                                                            onChange={e => {
                                                                                                const upgs = [...(sale.data?.upgrades || [])];
                                                                                                upgs[ui] = { ...upgs[ui], cost: parseFloat(e.target.value) || 0 };
                                                                                                handleSaleDataChange('upgrades', upgs);
                                                                                            }}
                                                                                            className="w-full bg-slate-800 border border-slate-700/50 rounded pl-7 pr-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-violet-500"
                                                                                        />
                                                                                    </div>
                                                                                    <div className="text-right">
                                                                                        <span className="text-xs font-mono text-violet-300 font-semibold">
                                                                                            {(sale.data?.paymentScheduleRegion || 'Canada') === 'India'
                                                                                                ? `₹${(upg.cost || 0).toLocaleString('en-IN')}`
                                                                                                : `C$${(upg.cost || 0).toLocaleString('en-CA', { minimumFractionDigits: 2 })}`
                                                                                            }
                                                                                        </span>
                                                                                    </div>
                                                                                    <button
                                                                                        title="Remove upgrade"
                                                                                        onClick={() => {
                                                                                            const upgs = (sale.data?.upgrades as any[]).filter((_: any, i: number) => i !== ui);
                                                                                            handleSaleDataChange('upgrades', upgs);
                                                                                        }}
                                                                                        className="w-7 h-7 flex items-center justify-center rounded-full bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-colors"
                                                                                    >
                                                                                        ✕
                                                                                    </button>
                                                                                </div>
                                                                            ))}
                                                                            {/* Draft form — shown when + Add Upgrade is clicked */}
                                                                            {draftUpgrade !== null && (
                                                                                <div className="px-4 py-3 border border-violet-500/40 bg-violet-900/30 rounded-lg mx-3 my-2 space-y-2">
                                                                                    <p className="text-xs font-semibold text-violet-300 uppercase tracking-wide mb-1">New Upgrade</p>
                                                                                    <div className="grid grid-cols-[1fr_130px] gap-2">
                                                                                        <input
                                                                                            autoFocus
                                                                                            type="text"
                                                                                            placeholder="Upgrade name (e.g. Kitchen Quartz Countertop)"
                                                                                            title="Upgrade name"
                                                                                            value={draftUpgrade.name}
                                                                                            onChange={e => setDraftUpgrade(d => d ? { ...d, name: e.target.value } : d)}
                                                                                            className="w-full bg-slate-800 border border-slate-700/50 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                                                                                        />
                                                                                        <div className="relative">
                                                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                                                                                                {(sale.data?.paymentScheduleRegion || paySchedRegion) === 'India' ? '₹' : 'C$'}
                                                                                            </span>
                                                                                            <input
                                                                                                type="number"
                                                                                                min={0}
                                                                                                step={100}
                                                                                                title="Upgrade cost"
                                                                                                placeholder="0"
                                                                                                value={draftUpgrade.cost}
                                                                                                onChange={e => setDraftUpgrade(d => d ? { ...d, cost: e.target.value } : d)}
                                                                                                className="w-full bg-slate-800 border border-slate-700/50 rounded pl-7 pr-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-violet-500"
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                    <input
                                                                                        type="text"
                                                                                        placeholder="Notes (optional)"
                                                                                        title="Upgrade notes"
                                                                                        value={draftUpgrade.notes}
                                                                                        onChange={e => setDraftUpgrade(d => d ? { ...d, notes: e.target.value } : d)}
                                                                                        className="w-full bg-slate-800 border border-slate-700/50 rounded px-2 py-1 text-[11px] text-slate-400 focus:outline-none focus:border-violet-500"
                                                                                    />
                                                                                    <div className="flex gap-2 justify-end pt-1">
                                                                                        <button
                                                                                            onClick={() => setDraftUpgrade(null)}
                                                                                            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                                                                                        >
                                                                                            Cancel
                                                                                        </button>
                                                                                        <button
                                                                                            disabled={!draftUpgrade.name.trim()}
                                                                                            onClick={() => {
                                                                                                if (!draftUpgrade.name.trim()) return;
                                                                                                const existing: any[] = sale.data?.upgrades || [];
                                                                                                handleSaleDataChange('upgrades', [
                                                                                                    ...existing,
                                                                                                    { name: draftUpgrade.name.trim(), cost: parseFloat(draftUpgrade.cost) || 0, notes: draftUpgrade.notes.trim(), actual_date: '' }
                                                                                                ]);
                                                                                                setDraftUpgrade(null);
                                                                                            }}
                                                                                            className="px-4 py-1.5 rounded-md text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors flex items-center gap-1"
                                                                                        >
                                                                                            ✓ Add
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            <div className="flex justify-between px-4 py-2.5 bg-violet-950/40 border-t border-violet-500/20">
                                                                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Upgrades</span>
                                                                                <span className="text-sm font-bold text-violet-300 font-mono">
                                                                                    {(sale.data?.paymentScheduleRegion || 'Canada') === 'India'
                                                                                        ? `₹${((sale.data?.upgrades as any[] || []).reduce((s: number, u: any) => s + (u.cost || 0), 0)).toLocaleString('en-IN')}`
                                                                                        : `C$${((sale.data?.upgrades as any[] || []).reduce((s: number, u: any) => s + (u.cost || 0), 0)).toLocaleString('en-CA', { minimumFractionDigits: 2 })}`
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                            {idx === 3 && (
                                                <>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-400 mb-1">Current Milestone</label>
                                                            <select value={sale.data?.currentMilestone || ''} onChange={(e) => handleSaleDataChange('currentMilestone', e.target.value)} className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500">
                                                                <option>Foundation / Plinth</option>
                                                                <option>Structure / Framing</option>
                                                                <option>Interior Finishing</option>
                                                                <option>Final Inspection Ready</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-400 mb-1">Expected Completion Date</label>
                                                            <input type="date" value={sale.data?.expectedCompletionDate || ''} onChange={(e) => handleSaleDataChange('expectedCompletionDate', e.target.value)} className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input type="checkbox" checked={!!sale.data?.milestonePaymentCollected} onChange={(e) => handleSaleDataChange('milestonePaymentCollected', e.target.checked)} id="milestone-payment" className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500" />
                                                        <label htmlFor="milestone-payment" className="text-sm text-slate-300">Milestone Payment Collected</label>
                                                    </div>
                                                </>
                                            )}
                                            {idx === 4 && (
                                                <>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-400 mb-1">Walkthrough / PDI Date</label>
                                                            <input type="date" value={sale.data?.walkthroughDate || ''} onChange={(e) => handleSaleDataChange('walkthroughDate', e.target.value)} className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-400 mb-1">Snagging Issues Status</label>
                                                            <select value={sale.data?.snaggingStatus || ''} onChange={(e) => handleSaleDataChange('snaggingStatus', e.target.value)} className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500">
                                                                <option>No Deficiencies</option>
                                                                <option>Pending Fixes</option>
                                                                <option>Fixes Verified</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-400 mb-1">Walkthrough Notes / Defect List</label>
                                                        <textarea value={sale.data?.walkthroughNotes || ''} onChange={(e) => handleSaleDataChange('walkthroughNotes', e.target.value)} rows={2} className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" placeholder="List any defects or 'None'"></textarea>
                                                    </div>
                                                    <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 text-sm">
                                                        <div className="p-2 bg-blue-500/10 rounded-md">
                                                            <Upload className="w-4 h-4 text-blue-400" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-slate-300 font-medium">Upload Formal Punch List</p>
                                                            <p className="text-xs text-slate-500">PDF or Image of the signed defect list.</p>
                                                        </div>
                                                        <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 text-xs transition-colors">
                                                            Select File
                                                        </button>
                                                    </div>
                                                    <div className="pt-4 border-t border-slate-700/50">
                                                        <h4 className="text-sm font-semibold text-slate-300 mb-3">Interim Occupancy & Registration</h4>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-400 mb-1">Interim Occupancy Start</label>
                                                                <input type="date" value={sale.data?.interimOccupancyStart || ''} onChange={(e) => handleSaleDataChange('interimOccupancyStart', e.target.value)} className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-400 mb-1">Monthly Occupancy Fee</label>
                                                                <input type="number" value={sale.data?.interimOccupancyFee || ''} onChange={(e) => handleSaleDataChange('interimOccupancyFee', parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono" placeholder="0.00" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-400 mb-1">Condo Registration Date</label>
                                                                <input type="date" value={sale.data?.condoRegistrationDate || ''} onChange={(e) => handleSaleDataChange('condoRegistrationDate', e.target.value)} className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="pt-4 mt-4 border-t border-slate-700/50">
                                                        <div className="flex items-center gap-2">
                                                            <input type="checkbox" checked={!!sale.data?.pdiComplete} onChange={(e) => handleSaleDataChange('pdiComplete', e.target.checked)} id="pdi-complete" className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500" />
                                                            <label htmlFor="pdi-complete" className="text-sm text-slate-300">PDI Complete & All Defects Resolved</label>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {idx === 5 && (() => {
                                                const basePrice = parseFloat(sale.data?.salePrice || (typeof sale.price === 'string' ? sale.price.replace(/[^0-9.]/g, '') : sale.price)) || 0;
                                                const upgradesTotal = (sale.data?.upgrades as any[] || []).reduce((s: number, u: any) => s + (u.cost || 0), 0);
                                                const taxRate = sale.data?.paymentScheduleRegion === 'India' ? 0.05 : 0.13;
                                                const totalTax = (basePrice + upgradesTotal) * taxRate;
                                                const totalPurchasePrice = basePrice + upgradesTotal + totalTax;
                                                const depositsPaid = (sale.data?.paymentSchedule as any[] || []).reduce((s: number, item: any) => item.actual_date ? s + (item.amount_due || 0) : s, 0);

                                                const tarionFee = parseFloat(sale.data?.tarionEnrollmentFee) || 0;
                                                const managementFee = parseFloat(sale.data?.managementFee) || 0;
                                                const closingFee = parseFloat(sale.data?.closingFee) || 0;
                                                const totalAdditionalFees = tarionFee + managementFee + closingFee;

                                                const balanceDue = totalPurchasePrice - depositsPaid + totalAdditionalFees;
                                                const region = sale.data?.paymentScheduleRegion || 'Canada';
                                                const fmt = (n: number) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: region === 'India' ? 'INR' : 'CAD' }).format(n);

                                                return (
                                                    <>
                                                        <div className="grid grid-cols-2 gap-4 mb-5">
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-400 mb-1">Closing Date</label>
                                                                <input type="date" value={sale.data?.closingDate || ''} onChange={(e) => handleSaleDataChange('closingDate', e.target.value)} className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-400 mb-1">Final Sale Price</label>
                                                                <input type="number" value={sale.data?.finalPrice || ''} onChange={(e) => handleSaleDataChange('finalPrice', parseFloat(e.target.value) || 0)} placeholder="620000" className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono" />
                                                            </div>
                                                        </div>

                                                        <div className="pt-4 border-t border-slate-700/50 mb-5">
                                                            <h4 className="text-sm font-semibold text-slate-300 mb-3">Broker Information</h4>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-slate-400 mb-1">Broker Name</label>
                                                                    <input type="text" value={sale.data?.brokerName || ''} onChange={(e) => handleSaleDataChange('brokerName', e.target.value)} className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" placeholder="e.g. John Doe Realty" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-slate-400 mb-1">Commission Structure</label>
                                                                    <select value={sale.data?.brokerCommissionStatus || ''} onChange={(e) => handleSaleDataChange('brokerCommissionStatus', e.target.value)} className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500">
                                                                        <option value="">None</option>
                                                                        <option value="1%">1%</option>
                                                                        <option value="2%">2%</option>
                                                                        <option value="3%">3%</option>
                                                                        <option value="4%">4%</option>
                                                                        <option value="5%">5%</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="pt-4 border-t border-slate-700/50 mb-5">
                                                            <h4 className="text-sm font-semibold text-slate-300 mb-3">Tarion Warranty Registration</h4>
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-400 mb-1">Warranty Start Date</label>
                                                                <input type="date" value={sale.data?.tarionWarrantyStart || ''} onChange={(e) => handleSaleDataChange('tarionWarrantyStart', e.target.value)} className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                                                            </div>
                                                        </div>

                                                        <div className="pt-4 border-t border-slate-700/50 mb-5">
                                                            <h4 className="text-sm font-semibold text-slate-300 mb-3">Additional Closing Fees</h4>
                                                            <div className="grid grid-cols-3 gap-4">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-slate-400 mb-1">Tarion Enrollment Fee</label>
                                                                    <input type="number" value={sale.data?.tarionEnrollmentFee || ''} onChange={(e) => handleSaleDataChange('tarionEnrollmentFee', parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono" placeholder="0.00" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-slate-400 mb-1">Management Fee</label>
                                                                    <input type="number" value={sale.data?.managementFee || ''} onChange={(e) => handleSaleDataChange('managementFee', parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono" placeholder="0.00" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-slate-400 mb-1">Closing & Legal Fee</label>
                                                                    <input type="number" value={sale.data?.closingFee || ''} onChange={(e) => handleSaleDataChange('closingFee', parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-700/50 rounded-md py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono" placeholder="0.00" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="bg-slate-900/50 rounded-lg border border-slate-700/50 overflow-hidden mb-5">
                                                            <div className="px-4 py-2 bg-slate-800/80 border-b border-slate-700/50 flex justify-between items-center">
                                                                <h4 className="text-sm font-semibold text-slate-300">Statement of Adjustments</h4>
                                                            </div>
                                                            <div className="p-4 space-y-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-400">Base Purchase Price</span>
                                                                    <span className="text-slate-200 font-mono">{fmt(basePrice)}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-400">Total Upgrades</span>
                                                                    <span className="text-slate-200 font-mono">{fmt(upgradesTotal)}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-400">Taxes ({(taxRate * 100).toFixed(0)}%)</span>
                                                                    <span className="text-slate-200 font-mono">{fmt(totalTax)}</span>
                                                                </div>
                                                                <div className="flex justify-between border-t border-slate-700/50 pt-2">
                                                                    <span className="text-slate-300 font-medium">Total Purchase Price</span>
                                                                    <span className="text-slate-200 font-medium font-mono">{fmt(totalPurchasePrice)}</span>
                                                                </div>
                                                                <div className="flex justify-between text-emerald-400 mt-3">
                                                                    <span>Less: Deposits Paid</span>
                                                                    <span className="font-mono">-{fmt(depositsPaid)}</span>
                                                                </div>
                                                                {totalAdditionalFees > 0 && (
                                                                    <div className="flex justify-between text-amber-400">
                                                                        <span>Plus: Additional Closing Fees</span>
                                                                        <span className="font-mono">+{fmt(totalAdditionalFees)}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between border-t border-slate-700/50 pt-3 pb-1 mt-2">
                                                                    <span className="text-blue-400 font-bold">Balance Due on Closing</span>
                                                                    <span className="text-blue-400 font-bold font-mono">{fmt(balanceDue)}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between mb-5">
                                                            {sale.data?.paymentSchedule?.some((m: any) => m.milestone === 'Final Settlement') ? (
                                                                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm font-medium w-full justify-center">
                                                                    <Check className="w-5 h-5" /> Final Settlement Sent to Payments Cycle ({fmt(balanceDue)})
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        const existingSchedule = sale.data?.paymentSchedule || [];
                                                                        const newSchedule = [...existingSchedule, {
                                                                            milestone: 'Final Settlement',
                                                                            percentage: 0,
                                                                            amount_due: balanceDue,
                                                                            estimated_date: sale.data?.closingDate || new Date().toISOString().split('T')[0],
                                                                            actual_date: null,
                                                                            currency: region === 'India' ? 'INR' : 'CAD'
                                                                        }];
                                                                        onUpdateSale({
                                                                            ...sale,
                                                                            data: {
                                                                                ...sale.data,
                                                                                paymentSchedule: newSchedule,
                                                                                finalPaymentSettled: true
                                                                            }
                                                                        });
                                                                    }}
                                                                    disabled={balanceDue <= 0}
                                                                    className={`w-full py-2.5 rounded-lg font-bold text-sm transition-colors shadow-lg ${balanceDue <= 0
                                                                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
                                                                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                                                                        }`}
                                                                >
                                                                    Send to Payment Cycle: {fmt(balanceDue)}
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!sale.data?.deedRegistered}
                                                                onChange={(e) => {
                                                                    const checked = e.target.checked;
                                                                    const updated = {
                                                                        ...sale,
                                                                        stage: checked ? 6 : sale.stage,
                                                                        status: checked ? 'Completed' : sale.status,
                                                                        data: { ...(sale.data || {}), deedRegistered: checked }
                                                                    };
                                                                    onUpdateSale(updated);
                                                                }}
                                                                disabled={!(sale.data?.paymentSchedule?.some((m: any) => m.milestone === 'Final Settlement' && m.actual_date) || balanceDue <= 0)}
                                                                id="deed-registered"
                                                                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            />
                                                            <label htmlFor="deed-registered" className={`text-sm ${!(sale.data?.paymentSchedule?.some((m: any) => m.milestone === 'Final Settlement' && m.actual_date) || balanceDue <= 0) ? 'text-slate-500' : 'text-slate-300'}`}>
                                                                Deed Registered & Keys Handed Over {!(sale.data?.paymentSchedule?.some((m: any) => m.milestone === 'Final Settlement' && m.actual_date) || balanceDue <= 0) && '(Requires Final Settlement Paid)'}
                                                            </label>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {sale.stage < stages.length && sale.status !== 'Cancelled' && (() => {
                    const kycGateBlocked = sale.stage === 1 && !sale.data?.kycVerified;
                    const paySchedGateBlocked = sale.stage === 2 && !sale.data?.paymentScheduleConfirmed;

                    // Gate: cannot move to Pre-Closing (stage 4) until ALL payment milestones are cleared
                    const schedule: any[] = sale.data?.paymentSchedule || [];
                    const allPaymentsCleared = schedule.length > 0 && schedule.every((m: any) => !!m.actual_date);
                    const paymentsGateBlocked = sale.stage === 3 && !allPaymentsCleared;
                    const paidCount = schedule.filter((m: any) => !!m.actual_date).length;

                    // Gate: cannot complete sale until deed registered & handed over
                    const closingGateBlocked = sale.stage === 5 && !sale.data?.deedRegistered;

                    const anyGateBlocked = kycGateBlocked || paySchedGateBlocked || paymentsGateBlocked || closingGateBlocked;
                    return (
                        <div className="mt-8 pt-4 border-t border-slate-700/50">
                            {kycGateBlocked && (
                                <div className="mb-3 flex items-center gap-2 px-3 py-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm font-medium">
                                    <span>🔒</span>
                                    <span>Sale confirmation is blocked until Buyer KYC is verified. Expand "Verification" above and check <strong>"Mark KYC as Verified"</strong>.</span>
                                </div>
                            )}
                            {paySchedGateBlocked && (
                                <div className="mb-3 flex items-center gap-2 px-3 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-sm font-medium">
                                    <span>💳</span>
                                    <span>A Payment Schedule must be generated and confirmed before proceeding. Expand "Payment Schedule" above.</span>
                                </div>
                            )}
                            {paymentsGateBlocked && (
                                <div className="mb-3 px-3 py-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                                    <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold mb-1">
                                        <span>🔒</span>
                                        <span>Pre-Closing is locked until all payments are fully cleared.</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full transition-all"
                                                style={{ width: schedule.length ? `${Math.round((paidCount / schedule.length) * 100)}%` : '0%' }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-400 whitespace-nowrap">
                                            {paidCount} / {schedule.length} instalments cleared
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Go to the <strong className="text-slate-300">Buyers</strong> page, expand this buyer, and clear all cheques to unlock Pre-Closing.</p>
                                </div>
                            )}
                            {closingGateBlocked && (
                                <div className="mb-3 flex items-center gap-2 px-3 py-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm font-medium">
                                    <span>🔒</span>
                                    <span>You must confirm the Deed is Registered and Keys Handed Over before finalizing the sale.</span>
                                </div>
                            )}
                            <div className="flex justify-end">
                                <button
                                    disabled={anyGateBlocked}
                                    onClick={() => {
                                        if (anyGateBlocked) return;
                                        onUpdateSale({ ...sale, stage: sale.stage + 1 });
                                        setExpandedStage(sale.stage + 1 < stages.length ? sale.stage + 1 : stages.length - 1);
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${anyGateBlocked
                                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                                        }`}
                                >
                                    {kycGateBlocked ? '🔒 KYC Required to Proceed'
                                        : paySchedGateBlocked ? '💳 Confirm Payment Schedule First'
                                            : paymentsGateBlocked ? '🔒 Clear All Payments First'
                                                : closingGateBlocked ? '🔒 Key Handover Required'
                                                    : 'Mark Next Stage Complete'}
                                </button>
                            </div>
                        </div>
                    );
                })()}
                {sale.stage >= stages.length && (
                    <div className="mt-8 pt-4 border-t border-slate-700/50 text-center text-emerald-500 font-medium">
                        <CheckCircle2 className="w-5 h-5 mx-auto mb-2" />
                        Sale Fully Closed
                    </div>
                )}
            </motion.div>

            {/* ── CANCEL CONFIRMATION MODAL ── */}
            {showCancelModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel p-6 w-full max-w-md"
                    >
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 text-xl">🚫</div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Cancel Sale — Cooling-off Period</h3>
                                <p className="text-xs text-slate-400 font-mono">{sale.id}</p>
                            </div>
                        </div>

                        <p className="text-slate-300 text-sm mb-5">
                            The buyer is exercising the <strong className="text-white">10-day cooling-off right</strong>. This will permanently cancel the sale and the unit will be marked available again. <strong className="text-rose-400">This cannot be undone.</strong>
                        </p>

                        <div className="mb-4">
                            <label className="block text-xs font-medium text-slate-400 mb-1">Cancellation Reason</label>
                            <textarea
                                rows={2}
                                defaultValue="Buyer exercised 10-day cooling-off right."
                                id="cancel-reason-input"
                                className="w-full bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500 resize-none"
                            />
                        </div>

                        <div
                            className={`flex items-center gap-3 p-3 rounded-lg border mb-6 transition-colors cursor-pointer ${refundDeposit ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/50 border-slate-700/50'
                                }`}
                            onClick={() => setRefundDeposit(prev => !prev)}
                        >
                            <input type="checkbox" checked={refundDeposit} readOnly
                                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 pointer-events-none" />
                            <div>
                                <p className={`text-sm font-semibold ${refundDeposit ? 'text-emerald-400' : 'text-slate-300'}`}>
                                    {refundDeposit ? '✓ Refund Deposit / Earnest Money' : 'Refund Deposit / Earnest Money'}
                                </p>
                                <p className="text-xs text-slate-500">Check to initiate a full refund of the booking deposit to the buyer.</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium glass-panel hover:bg-slate-700 text-slate-300 transition-colors"
                            >
                                Keep Sale
                            </button>
                            <button
                                onClick={() => {
                                    const reason = (document.getElementById('cancel-reason-input') as HTMLTextAreaElement)?.value ||
                                        'Buyer exercised 10-day cooling-off right.';
                                    onUpdateSale({
                                        ...sale,
                                        status: 'Cancelled',
                                        data: { ...(sale.data || {}), cancelReason: reason, refundDeposit }
                                    });
                                    setShowCancelModal(false);
                                }}
                                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors font-semibold"
                            >
                                {refundDeposit ? '🔄 Cancel & Refund Deposit' : 'Cancel Sale'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
