import sqlite3
import os
from datetime import datetime

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    default_rate REAL NOT NULL,
    active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_number TEXT UNIQUE NOT NULL,
    timestamp TEXT NOT NULL,
    customer_name TEXT,
    total_amount REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS bill_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    rate REAL NOT NULL,
    amount REAL NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES bills(id)
);
"""

def create_schema(db_path):
    conn = sqlite3.connect(db_path)
    conn.executescript(SCHEMA_SQL)
    conn.commit()
    seed_products_if_empty(conn)
    conn.close()

def seed_products_if_empty(conn):
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM products")
    if cur.fetchone()[0] == 0:
        products = [
            ("1.5mm Wire", 500.0),
            ("2.5mm Wire", 750.0),
            ("4.0mm Wire", 1200.0),
            ("Switch", 120.0),
            ("Socket", 150.0),
            ("MCB", 350.0),
            ("LED Bulb 9W", 100.0),
            ("Ceiling Fan", 1500.0)
        ]
        cur.executemany("INSERT INTO products (name, default_rate) VALUES (?, ?)", products)
        conn.commit()

def generate_bill_number(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM bills")
    count = cur.fetchone()[0]
    conn.close()
    return f"SE-{str(count + 1).zfill(6)}"

# --- Products ---

def get_products(db_path):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM products WHERE active = 1 ORDER BY name ASC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

def save_product(db_path, product):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    if product.get("id"):
        cur.execute("UPDATE products SET name=?, default_rate=?, active=? WHERE id=?", 
                    (product["name"], product["default_rate"], product.get("active", 1), product["id"]))
        pid = product["id"]
    else:
        cur.execute("INSERT INTO products (name, default_rate) VALUES (?, ?)", 
                    (product["name"], product["default_rate"]))
        pid = cur.lastrowid
    conn.commit()
    conn.close()
    return pid

def delete_product(db_path, product_id):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("UPDATE products SET active = 0 WHERE id = ?", (product_id,))
    conn.commit()
    conn.close()

# --- Bills ---

def save_bill(db_path, customer_name, items):
    conn = sqlite3.connect(db_path)
    try:
        cur = conn.cursor()
        
        # Calculate total
        total_amount = sum(item["amount"] for item in items)
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Get count for bill number within transaction to be safe
        cur.execute("SELECT COUNT(*) FROM bills")
        count = cur.fetchone()[0]
        bill_number = f"SE-{str(count + 1).zfill(6)}"
        
        cur.execute("""
            INSERT INTO bills (bill_number, timestamp, customer_name, total_amount)
            VALUES (?, ?, ?, ?)
        """, (bill_number, timestamp, customer_name, total_amount))
        
        bill_id = cur.lastrowid
        
        for item in items:
            cur.execute("""
                INSERT INTO bill_items (bill_id, product_name, quantity, rate, amount)
                VALUES (?, ?, ?, ?, ?)
            """, (bill_id, item["product_name"], item["quantity"], item["rate"], item["amount"]))
            
        conn.commit()
        return bill_id, bill_number, timestamp, total_amount
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def get_bill(db_path, bill_id):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM bills WHERE id = ?", (bill_id,))
    bill = cur.fetchone()
    if not bill: return None
    bill = dict(bill)
    
    cur.execute("SELECT * FROM bill_items WHERE bill_id = ?", (bill_id,))
    bill["items"] = [dict(r) for r in cur.fetchall()]
    conn.close()
    return bill

def get_bills_by_date(db_path, date_str):
    # date_str format YYYY-MM-DD
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM bills WHERE date(timestamp) = date(?) ORDER BY id DESC", (date_str,))
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

# --- Summaries ---

def get_daily_summary(db_path, date_str):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    # List of bills
    cur.execute("SELECT bill_number, timestamp, total_amount FROM bills WHERE date(timestamp) = date(?) ORDER BY id ASC", (date_str,))
    bills = [dict(r) for r in cur.fetchall()]
    
    # Total calculation
    cur.execute("SELECT COUNT(*) as total_bills, SUM(total_amount) as daily_total FROM bills WHERE date(timestamp) = date(?)", (date_str,))
    agg = cur.fetchone()
    conn.close()
    
    return {
        "date": date_str,
        "bills": bills,
        "total_bills": agg["total_bills"] or 0,
        "daily_total": agg["daily_total"] or 0.0
    }

def get_monthly_summary(db_path, year, month):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    
    date_like = f"{year}-{str(month).zfill(2)}-%"
    
    # Group by date
    cur.execute("""
        SELECT date(timestamp) as date, COUNT(*) as bills, SUM(total_amount) as total
        FROM bills
        WHERE timestamp LIKE ?
        GROUP BY date(timestamp)
        ORDER BY date(timestamp) ASC
    """, (date_like,))
    daily_totals = [dict(r) for r in cur.fetchall()]
    
    # Grand total
    cur.execute("SELECT COUNT(*) as total_bills, SUM(total_amount) as monthly_total FROM bills WHERE timestamp LIKE ?", (date_like,))
    agg = cur.fetchone()
    conn.close()
    
    return {
        "year": year,
        "month": month,
        "days": daily_totals,
        "total_bills": agg["total_bills"] or 0,
        "monthly_total": agg["monthly_total"] or 0.0
    }

def get_yearly_summary(db_path, year):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    
    year_like = f"{year}-%"
    
    # Group by month (extract YYYY-MM)
    cur.execute("""
        SELECT strftime('%Y-%m', timestamp) as month, COUNT(*) as bills, SUM(total_amount) as total
        FROM bills
        WHERE timestamp LIKE ?
        GROUP BY strftime('%Y-%m', timestamp)
        ORDER BY month ASC
    """, (year_like,))
    monthly_totals = [dict(r) for r in cur.fetchall()]
    
    # Grand total
    cur.execute("SELECT COUNT(*) as total_bills, SUM(total_amount) as yearly_total FROM bills WHERE timestamp LIKE ?", (year_like,))
    agg = cur.fetchone()
    conn.close()
    
    return {
        "year": year,
        "months": monthly_totals,
        "total_bills": agg["total_bills"] or 0,
        "yearly_total": agg["yearly_total"] or 0.0
    }
