import pandas as pd
import sqlite3
import json
import os
from pathlib import Path

DATA_DIR = Path(__file__).parent / "Data"
DB_PATH = DATA_DIR / "upward.db"

def _get_conn():
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")  # Write-Ahead Logging — safe concurrent access
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

# ---------------------------------------------------------------------------
# Legacy EXCEL_FILES mapping — kept for reference / init_db column seeding
# ---------------------------------------------------------------------------
EXCEL_FILES = {
    "Property": ["Properties", "Units", "UnitFees", "UnitLeaseInfo", "Upgrades"],
    "People": ["Buyers", "JointBuyers", "Brokers"],
    "Transactions": ["Sales", "Commissions", "Cancellations"],
    "Financials": ["PaymentSchedules", "PaymentInstallments", "NSFEvents", "NSFConfigurations", "EscrowAccounts", "EscrowLedger"],
    "Construction": ["Milestones", "FundReleaseRequests", "CloseoutDocs", "PunchList"],
    "System": ["Users", "YardiSyncLogs", "AuditLogs"],
}

# Table name = "<file_name>__<sheet_name>"
def _tbl(file_name: str, sheet_name: str) -> str:
    return f"{file_name}__{sheet_name}".replace("-", "_")

def _ensure_table(conn, table: str):
    conn.execute(f"""
        CREATE TABLE IF NOT EXISTS "{table}" (
            _rowid INTEGER PRIMARY KEY AUTOINCREMENT,
            _json TEXT NOT NULL DEFAULT '{{}}'
        )
    """)
    conn.commit()

def init_db():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    # Migrate any existing Excel data into SQLite on first run
    conn = _get_conn()
    for file_name, sheets in EXCEL_FILES.items():
        xlsx_path = DATA_DIR / f"{file_name}.xlsx"
        for sheet in sheets:
            table = _tbl(file_name, sheet)
            _ensure_table(conn, table)
            # If an Excel file exists and the table is empty, migrate the data
            row_count = conn.execute(f'SELECT COUNT(*) FROM "{table}"').fetchone()[0]
            if xlsx_path.exists() and row_count == 0:
                try:
                    df = pd.read_excel(xlsx_path, sheet_name=sheet, engine='openpyxl')
                    if not df.empty:
                        for _, row in df.iterrows():
                            record = {k: (None if pd.isna(v) else v) for k, v in row.items()}
                            conn.execute(f'INSERT INTO "{table}" (_json) VALUES (?)', (json.dumps(record),))
                        conn.commit()
                        print(f"Migrated {len(df)} rows from {file_name}.xlsx [{sheet}] → SQLite table {table}")
                except Exception as e:
                    print(f"Could not migrate {file_name}.xlsx [{sheet}]: {e}")
    conn.close()

def get_dataframe(file_name: str, sheet_name: str) -> pd.DataFrame:
    table = _tbl(file_name, sheet_name)
    try:
        conn = _get_conn()
        _ensure_table(conn, table)
        rows = conn.execute(f'SELECT _json FROM "{table}" ORDER BY _rowid').fetchall()
        conn.close()
        if not rows:
            return pd.DataFrame()
        records = [json.loads(r[0]) for r in rows]
        return pd.DataFrame(records)
    except Exception as e:
        print(f"get_dataframe error [{table}]: {e}")
        return pd.DataFrame()

def save_dataframe(df: pd.DataFrame, file_name: str, sheet_name: str):
    """Full replace — use only for initial seeding when you intentionally want to wipe the table."""
    table = _tbl(file_name, sheet_name)
    try:
        conn = _get_conn()
        _ensure_table(conn, table)
        # Replace ALL rows atomically using a transaction
        conn.execute("BEGIN")
        conn.execute(f'DELETE FROM "{table}"')
        for _, row in df.iterrows():
            record = {k: (None if pd.isna(v) else v) for k, v in row.items()}
            conn.execute(f'INSERT INTO "{table}" (_json) VALUES (?)', (json.dumps(record),))
        conn.execute("COMMIT")
        conn.close()
    except Exception as e:
        print(f"save_dataframe error [{table}]: {e}")
        try:
            conn.execute("ROLLBACK")
            conn.close()
        except Exception:
            pass

def upsert_dataframe(df: pd.DataFrame, file_name: str, sheet_name: str, id_field: str = "id"):
    """
    Non-destructive merge: update existing records matched by id_field,
    insert new ones. Never deletes existing rows not in df.
    This is safe to call anytime without wiping user-entered data.
    """
    table = _tbl(file_name, sheet_name)
    try:
        conn = _get_conn()
        _ensure_table(conn, table)

        # Load existing records indexed by id_field value
        existing_rows = conn.execute(f'SELECT _rowid, _json FROM "{table}"').fetchall()
        existing_map = {}  # id_value -> _rowid
        for row in existing_rows:
            try:
                rec = json.loads(row[1])
                if id_field in rec:
                    existing_map[str(rec[id_field])] = row[0]
            except Exception:
                pass

        conn.execute("BEGIN")
        for _, row in df.iterrows():
            record = {k: (None if pd.isna(v) else v) for k, v in row.items()}
            record_id = str(record.get(id_field, ""))
            if record_id and record_id in existing_map:
                # UPDATE existing row
                conn.execute(
                    f'UPDATE "{table}" SET _json = ? WHERE _rowid = ?',
                    (json.dumps(record), existing_map[record_id])
                )
            else:
                # INSERT new row
                conn.execute(f'INSERT INTO "{table}" (_json) VALUES (?)', (json.dumps(record),))
        conn.execute("COMMIT")
        conn.close()
    except Exception as e:
        print(f"upsert_dataframe error [{table}]: {e}")
        try:
            conn.execute("ROLLBACK")
            conn.close()
        except Exception:
            pass

def upsert_record(file_name: str, sheet_name: str, record: dict, id_field: str = "id"):
    """Upsert a single record by id_field. Used by the API for single-row saves."""
    df = pd.DataFrame([record])
    upsert_dataframe(df, file_name, sheet_name, id_field)
