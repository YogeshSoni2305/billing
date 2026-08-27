from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch

def draw_copy(c, x_offset, y_offset, copy_type, bill_data, items):
    width, height = A4
    
    # Store Header
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(x_offset + (width/2), y_offset - 40, "SAGAR ELECTRICALS")
    
    c.setFont("Helvetica", 10)
    c.drawCentredString(x_offset + (width/2), y_offset - 55, "Your Trusted Electrical Partner")
    
    # Copy Type Label
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(x_offset + (width/2), y_offset - 80, f"--- {copy_type} ---")
    
    # Bill Info
    c.setFont("Helvetica", 10)
    y = y_offset - 110
    c.drawString(x_offset + 50, y, f"Bill No: {bill_data['bill_number']}")
    
    date_part, time_part = bill_data['timestamp'].split(" ")
    c.drawString(x_offset + width - 150, y, f"Date: {date_part}")
    c.drawString(x_offset + width - 150, y - 15, f"Time: {time_part}")
    
    y -= 30
    
    if copy_type == "MERCHANT COPY":
        c.drawString(x_offset + 50, y, f"Customer Name: {bill_data.get('customer_name') or '__________________'}")
        y -= 20

    # Table Header
    y -= 10
    c.setFont("Helvetica-Bold", 10)
    c.drawString(x_offset + 50, y, "Product")
    c.drawString(x_offset + 300, y, "Qty")
    c.drawString(x_offset + 370, y, "Rate")
    c.drawString(x_offset + 460, y, "Amount")
    
    c.line(x_offset + 50, y - 5, x_offset + width - 50, y - 5)
    
    # Items
    y -= 20
    c.setFont("Helvetica", 10)
    for item in items:
        c.drawString(x_offset + 50, y, item['product_name'])
        c.drawString(x_offset + 300, y, str(item['quantity']))
        c.drawString(x_offset + 370, y, f"Rs. {item['rate']:.2f}")
        c.drawString(x_offset + 460, y, f"Rs. {item['amount']:.2f}")
        y -= 20
        
    c.line(x_offset + 50, y, x_offset + width - 50, y)
    
    # Total
    y -= 20
    c.setFont("Helvetica-Bold", 12)
    c.drawString(x_offset + 350, y, "TOTAL:")
    c.drawString(x_offset + 460, y, f"Rs. {bill_data['total_amount']:.2f}")
    
def generate_invoice_pdf(bill_data, items, output_path):
    # Two copies on the same A4 page (top half and bottom half)
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4
    
    # Top Half - Customer Copy
    draw_copy(c, 0, height, "CUSTOMER COPY", bill_data, items)
    
    # Middle cut line
    c.setDash(6, 3)
    c.line(0, height/2, width, height/2)
    c.setDash(1, 0) # reset
    
    # Bottom Half - Merchant Copy
    draw_copy(c, 0, height/2, "MERCHANT COPY", bill_data, items)
    
    c.save()
