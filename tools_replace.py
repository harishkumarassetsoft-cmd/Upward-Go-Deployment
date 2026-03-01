import sys

with open('c:/Upward-Go/Frontend/src/pages/SalesList.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if i == 0:
        new_lines.append(line)
        new_lines.append("import BuyerFlowModal from '../components/BuyerFlowModal';\n")
        continue

    # Remove the state variables we don't need anymore
    if 'const [expandedStage' in line or 'const [showCancelModal' in line or 'const [refundDeposit' in line or 'const [paySchedRegion' in line or 'const [paySchedLoadingSchedule' in line or 'const [paySchedHasGovAid' in line or '// Payment Schedule step state' in line:
        continue

    if '{/* ── SALE DETAIL MODAL ── */}' in line:
        skip = True
        new_lines.append("""            {/* ── SALE DETAIL MODAL ── */}
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
""")
        continue

    if '{/* ── NEW SALE MODAL ── */}' in line:
        skip = False
    
    if not skip:
        new_lines.append(line)

with open('c:/Upward-Go/Frontend/src/pages/SalesList.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("Updated SalesList.tsx successfully")
