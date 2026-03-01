import sqlite3
import json
import re

def fix_db():
    conn = sqlite3.connect('Data/upward.db')
    c = conn.cursor()
    c.execute('SELECT _rowid, _json FROM "Transactions__Sales"')
    rows = c.fetchall()
    
    fixed_count = 0
    for rowid, json_str in rows:
        try:
            data = json.loads(json_str)
            while isinstance(data, str):
                data = json.loads(data)
                
            if isinstance(data, dict) and 'data' in data:
                while isinstance(data['data'], str):
                    data['data'] = json.loads(data['data'])
                    
                if 'paymentSchedule' in data['data'] and data['data'].get('paymentScheduleConfirmed'):
                    schedule = data['data']['paymentSchedule']
                    price = data.get('price') or data['data'].get('salePrice')
                    if not price:
                        continue
                    
                    if isinstance(price, str):
                        price_str = re.sub(r'[^0-9.]', '', price)
                        price_val = float(price_str) if price_str else 0.0
                    elif isinstance(price, dict):
                        price_val = 0.0
                    else:
                        price_val = float(price)
                    
                    tax_rate = data['data'].get('taxRate', 0.13)
                    if data['data'].get('paymentScheduleRegion') == 'India':
                        tax_rate = 0.05
                        
                    earnest = data['data'].get('earnestMoney', '0')
                    if isinstance(earnest, str):
                        earnest_str = re.sub(r'[^0-9.]', '', earnest)
                        earnest_val = float(earnest_str) if earnest_str else 0.0
                    elif isinstance(earnest, dict):
                        earnest_val = 0.0
                    else:
                        earnest_val = float(earnest)

                    fixed = False
                    for i, item in enumerate(schedule):
                        # only fix if amount_due is missing or 0
                        if not item.get('amount_due'):
                            fixed = True
                            pct = float(item.get('percentage', 0))
                            amt = price_val * pct
                            tx = amt * tax_rate
                            final = amt + tx
                            if i == 0 and item.get('milestone_name') in ['Deposit 1', 'Buyer Down Payment', 'Deposit Amount'] and earnest_val > 0:
                                final -= earnest_val
                            
                            item['amount_due'] = final
                            item['base_amount_due'] = amt
                            item['tax_amount'] = tx
                    
                    if fixed:
                        print(f"Fixing row {rowid}, ID: {data.get('id')}")
                        # Stringify data.data again as the backend expects it
                        data['data'] = json.dumps(data['data'])
                        c.execute('UPDATE "Transactions__Sales" SET _json = ? WHERE _rowid = ?', (json.dumps(data), rowid))
                        fixed_count += 1
        except Exception as e:
            print(f"Error on row {rowid}: {e}")
            
    conn.commit()
    conn.close()
    print(f"Done fixing {fixed_count} records.")

if __name__ == "__main__":
    fix_db()
