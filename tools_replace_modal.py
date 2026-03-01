import sys
import re

file_path = 'c:/Upward-Go/Frontend/src/components/BuyerFlowModal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace the entire idx === 2 block
# We can find it using string boundaries
start_marker = "{idx === 2 && ("
end_marker = "{idx === 3 && ("

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Could not find markers")
    sys.exit(1)

# We need to compute the total percentage dynamically
new_block = """{idx === 2 && (() => {
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
                                                                    newSchedule.push({ milestone_name: 'Down Payment', percentage: 0.25, estimated_date: '', actual_date: '' });
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
                                                                            <th className="px-2 py-2 text-right">Total Amt</th>
                                                                            <th className="px-2 py-2">Est. Date</th>
                                                                            <th className="px-2 py-2 text-center w-8"></th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-slate-800/80">
                                                                        {schedule.map((item: any, i: number) => {
                                                                            const amount = basePrice * (parseFloat(item.percentage) || 0);
                                                                            const tax = amount * taxRate;
                                                                            const totalAmt = amount + tax;
                                                                             
                                                                            return (
                                                                            <tr key={i} className="hover:bg-slate-800/30">
                                                                                <td className="px-2 py-2">
                                                                                    <input 
                                                                                        type="text" 
                                                                                        value={item.milestone_name} 
                                                                                        disabled={sale.data?.paymentScheduleConfirmed}
                                                                                        onChange={(e) => {
                                                                                            const newSched = [...schedule];
                                                                                            newSched[i] = { ...newSched[i], milestone_name: e.target.value };
                                                                                            handleSaleDataChange('paymentSchedule', newSched);
                                                                                        }}
                                                                                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:border-blue-500 disabled:opacity-50"
                                                                                    />
                                                                                </td>
                                                                                <td className="px-2 py-2">
                                                                                    <div className="flex items-center gap-1">
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
                                                                                    </div>
                                                                                </td>
                                                                                <td className="px-2 py-2 text-right font-mono text-slate-300">
                                                                                    {Number(amount).toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                                                </td>
                                                                                <td className="px-2 py-2 text-right font-mono text-rose-300/80">
                                                                                    {Number(tax).toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                                                </td>
                                                                                <td className="px-2 py-2 text-right font-mono text-emerald-400 font-medium">
                                                                                    C${Number(totalAmt).toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                                                </td>
                                                                                <td className="px-2 py-2">
                                                                                    <input type="date" value={item.estimated_date || ''} disabled={sale.data?.paymentScheduleConfirmed} onChange={(e) => {
                                                                                        const newSched = [...schedule];
                                                                                        newSched[i] = { ...newSched[i], estimated_date: e.target.value };
                                                                                        handleSaleDataChange('paymentSchedule', newSched);
                                                                                    }} className="w-[110px] bg-slate-900 border border-slate-700 rounded px-1 py-1 text-[11px] text-slate-300 disabled:opacity-50" />
                                                                                </td>
                                                                                <td className="px-2 py-2 text-center">
                                                                                    {!sale.data?.paymentScheduleConfirmed && (
                                                                                        <button 
                                                                                            onClick={() => {
                                                                                                const newSched = schedule.filter((_: any, idx: number) => idx !== i);
                                                                                                handleSaleDataChange('paymentSchedule', newSched);
                                                                                            }}
                                                                                            className="w-6 h-6 flex items-center justify-center rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-colors"
                                                                                        >
                                                                                            <span className="text-sm rounded-full leading-none font-bold" style={{marginTop: '-2px'}}>&times;</span>
                                                                                        </button>
                                                                                    )}
                                                                                </td>
                                                                            </tr>
                                                                        )})}
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
                                                                        const finalizeSchedule = schedule.map((item: any) => {
                                                                            const amt = basePrice * (parseFloat(item.percentage) || 0);
                                                                            const tx = amt * taxRate;
                                                                            return {
                                                                                ...item,
                                                                                amount_due: amt + tx,
                                                                                base_amount_due: amt,
                                                                                tax_amount: tx
                                                                            }
                                                                        });
                                                                        handleSaleDataChange('paymentSchedule', finalizeSchedule);
                                                                        handleSaleDataChange('paymentScheduleConfirmed', true);
                                                                        
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
                                                                    className={`w-full py-2 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                                                                        is100Pct 
                                                                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                                                                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                                                    }`}
                                                                >
                                                                    {is100Pct ? '✓ Confirm Payment Schedule' : 'Total must be exactly 100% to confirm'}
                                                                </button>
                                                            )}

                                                            {sale.data?.paymentScheduleConfirmed && (
                                                                <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                                                    <span className="text-emerald-400 text-sm">✓</span>
                                                                    <span className="text-emerald-400 text-sm font-medium">Schedule confirmed. Buyer can now view & pay instalments on the Buyers page.</span>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </>
                                            );
                                            })()}
                                            """

new_content = content[:start_idx] + new_block + content[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
print("BuyerFlowModal.tsx updated successfully.")
