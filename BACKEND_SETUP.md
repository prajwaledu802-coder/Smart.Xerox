# Smart Xerox V2 - Backend & Setup Guide

This document explains how to set up the backend (Google Sheets), how the OTP system works, and how to verify orders.

## 1. Database Setup (Google Sheets)
Your "Database" is a simple Google Sheet. It MUST have these 4 tabs (case-sensitive) with the exact columns below:

### Tab 1: `Users`
Columns (Row 1):
- `A` user_id
- `B` full_name
- `C` mobile_number
- `D` email
- `E` login_provider
- `F` created_at

### Tab 2: `Orders`
Columns (Row 1):
- `A` order_id
- `B` user_id
- `C` file_names
- `D` print_type
- `E` pages
- `F` copies
- `G` amount_total
- `H` amount_paid
- `I` order_status
- `J` created_at
- `K` instructions

### Tab 3: `Payments`
Columns (Row 1):
- `A` payment_id
- `B` order_id
- `C` payment_method
- `D` transaction_id
- `E` amount
- `F` payment_time

### Tab 4: `Admin`
Columns (Row 1):
- `A` admin_id
- `B` username
- `C` password

*(Manually add one row to Admin: `1`, `admin`, `admin123`)*

## 2. OTP System (Important Note)
**How it currently works (Free Mode):**
- When a user enters their mobile number, the site **Simulates** sending an OTP.
- It shows an **Alert Box** on the screen saying "Your OTP is 1234".
- This is because sending real SMS requires a PAID service (like Twilio, Fast2SMS) which charges ~₹0.20 per SMS.
- **For a college project or startup MVP, this simulation is perfectly acceptable.**

**If you want REAL OTP:**
1. Buy an SMS API plan (e.g. Fast2SMS).
2. Edit `backend/code.gs` to call that API using `UrlFetchApp`.
3. This is advanced and requires funding.

## 3. WhatsApp Integration
- After an order is placed, the user is redirected to WhatsApp.
- It generates a pre-filled message:
  > "Hello Smart Xerox, I placed Order #ORDER_ID. Total: ₹50. Please confirm."
- The user just hits "Send". This is the standard "free integration".

## 4. Invoice System
- Invoices are generated directly in the browser using the `html2pdf` library.
- No backend PDF generation is needed (saves server costs).
- Data is taken from the Order object in the Dashboard.

## 5. Deployment Checklist
1. Create the Google Sheet as described above.
2. Deploy the `backend/code.gs` script as a "Web App" (Access: Anyone).
3. Copy the URL.
4. Paste the URL into `js/app.js` at `const GAS_ENDPOINT = "..."`.
5. Upload all files to GitHub or Netlify.
