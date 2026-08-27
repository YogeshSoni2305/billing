"""
utils.py – Helper utilities for Bharat Textiles Billing Software
"""
import os
import platform
import psutil
from datetime import datetime


SHOP_NAME = "SAGAR ELECTRICALS"
SHOP_ADDRESS = "21/1, SM Rd, Phase-1, Jalahalli West"
SHOP_CITY = "Bengaluru, Karnataka 560015"
FOLDER_NAME = "SagarElectricals"


def detect_pendrive():
    """
    Disabled auto detection for safety.
    Returns None.
    """
    return None


def get_base_path(storage_root=None):
    """Return the BharatTextiles root folder path inside Documents."""
    return os.path.join(os.path.expanduser("~"), "Documents", FOLDER_NAME)


def get_local_fallback_path():
    """
    Returns the local Documents path.
    """
    return os.path.join(os.path.expanduser("~"), "Documents")


def ensure_folder_structure(pendrive_path=None):
    """
    Create the required folder structure in ~/Documents/BharatTextiles.
    Returns a dict of all important paths.
    """
    base = get_base_path()
    paths = {
        "base": base,
        "bills": os.path.join(base, "bills"),
        "receipts": os.path.join(base, "receipts"),
        "daily_reports": os.path.join(base, "daily_reports"),
        "database": os.path.join(base, "data"),
    }
    for key, path in paths.items():
        os.makedirs(path, exist_ok=True)
    return paths


def get_db_path(paths, mode):
    """
    Returns the path to the correct database based on mode.
    mode: 'bill' | 'receipt'
    """
    if mode == "bill":
        return os.path.join(paths["database"], "bill.db")
    else:
        return os.path.join(paths["database"], "receipt.db")


def get_pdf_folder(paths, mode):
    """Returns the folder where PDFs should be saved based on mode."""
    if mode == "bill":
        return paths["bills"]
    else:
        return paths["receipts"]


def generate_bill_number(db_path, mode):
    """
    Auto-generate next bill number.
    Format: BILL-0001 for bill mode, RCP-0001 for receipt mode.
    """
    import sqlite3
    prefix = "BILL" if mode == "bill" else "RCP"
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM invoices")
        count = cur.fetchone()[0]
        conn.close()
        return f"{prefix}-{count + 1:04d}"
    except Exception:
        return f"{prefix}-0001"


def get_current_datetime():
    """Returns formatted current date and time strings."""
    now = datetime.now()
    return now.strftime("%d-%m-%Y"), now.strftime("%I:%M %p")


def get_today_str():
    """Returns today's date in YYYY-MM-DD format (for DB queries)."""
    return datetime.now().strftime("%Y-%m-%d")


def get_assets_dir():
    """Returns the absolute path to the assets directory."""
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")


def get_ganesha_path():
    return os.path.join(get_assets_dir(), "ganesha.png")
