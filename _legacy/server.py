import os
import platform
import subprocess
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

import db
from utils import detect_pendrive, ensure_folder_structure, get_db_path, get_pdf_folder
from pdf_generator import generate_invoice_pdf

app = FastAPI()

def get_paths():
    pendrive = detect_pendrive()
    if not pendrive:
        desktop = os.path.join(os.path.expanduser("~"), "Desktop")
        pendrive = desktop
    return ensure_folder_structure(pendrive)

def get_main_db():
    paths = get_paths()
    db_path = get_db_path(paths, "bill")
    db.create_schema(db_path)
    return db_path

# --- Models ---
class ProductModel(BaseModel):
    id: Optional[int] = None
    name: str
    default_rate: float
    active: int = 1

class BillItemModel(BaseModel):
    product_name: str
    quantity: int
    rate: float
    amount: float

class BillModel(BaseModel):
    customer_name: Optional[str] = ""
    items: List[BillItemModel]

# --- Products API ---
@app.get("/api/products")
async def get_products():
    return db.get_products(get_main_db())

@app.post("/api/products")
async def save_product(p: ProductModel):
    pid = db.save_product(get_main_db(), p.dict(exclude_unset=True))
    return {"status": "success", "id": pid}

@app.delete("/api/products/{pid}")
async def delete_product(pid: int):
    db.delete_product(get_main_db(), pid)
    return {"status": "success"}

# --- Bills API ---
@app.post("/api/bills")
async def create_bill(bill: BillModel):
    paths = get_paths()
    db_path = get_main_db()
    pdf_folder = get_pdf_folder(paths, "bill")
    
    if len(bill.items) == 0:
        raise HTTPException(status_code=400, detail="Bill has no items.")
        
    try:
        bill_id, bill_number, timestamp, total_amount = db.save_bill(
            db_path, bill.customer_name, [i.dict() for i in bill.items]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail="Unable to generate bill.")
        
    pdf_path = os.path.join(pdf_folder, f"{bill_number}.pdf")
    bill_data = {
        "bill_number": bill_number,
        "timestamp": timestamp,
        "customer_name": bill.customer_name,
        "total_amount": total_amount
    }
    
    try:
        generate_invoice_pdf(bill_data, [i.dict() for i in bill.items], pdf_path)
        
        # Open PDF
        if platform.system() == "Darwin": subprocess.Popen(["open", pdf_path])
        elif platform.system() == "Windows": os.startfile(pdf_path)
        else: subprocess.Popen(["xdg-open", pdf_path])
    except Exception as e:
        print("PDF failed:", e)
        
    return {"status": "success", "bill_number": bill_number, "id": bill_id}

@app.get("/api/bills")
async def get_bills(date: Optional[str] = None):
    # Expect date=YYYY-MM-DD
    if not date:
        date = datetime.now().strftime("%Y-%m-%d")
    return db.get_bills_by_date(get_main_db(), date)

@app.get("/api/bills/{bill_id}")
async def get_bill_detail(bill_id: int):
    bill = db.get_bill(get_main_db(), bill_id)
    if not bill:
        raise HTTPException(status_code=404, detail="Not found")
    return bill

# --- Summaries API ---
@app.get("/api/summaries/daily")
async def get_daily(date: Optional[str] = None):
    if not date: date = datetime.now().strftime("%Y-%m-%d")
    return db.get_daily_summary(get_main_db(), date)

@app.get("/api/summaries/monthly")
async def get_monthly(year: str, month: str):
    return db.get_monthly_summary(get_main_db(), year, month)

@app.get("/api/summaries/yearly")
async def get_yearly(year: str):
    return db.get_yearly_summary(get_main_db(), year)

# ── Serve Static Files ────────────────────────────────────────────────────
os.makedirs("static", exist_ok=True)
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
