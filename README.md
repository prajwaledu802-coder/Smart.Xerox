# Smart Xerox & Printouts - Deployment Guide

This is a static website connected to a Google Sheet database. Follow these steps to make it live.

## 1. Setup Google Sheet & Backend
1. Go to [Google Sheets](https://sheets.google.com) and create a new Sheet.
2. Rename the first tab/sheet at the bottom to `Orders` (Case sensitive).
3. In the menu, go to **Extensions > Apps Script**.
4. Delete any code in the `Code.gs` file there.
5. Open the file `backend/code.gs` from this project, copy all the code, and paste it into the Google Apps Script editor.
6. **IMPORTANT**: Change the `OWNER_EMAIL` variable at the top of the script to your actual email address.
7. Click the **Save** icon (floppy disk).
8. Click the blue **Deploy** button > **New deployment**.
9. Click the gear icon next to "Select type" and choose **Web app**.
10. Fill in:
    - **Description**: Smart Xerox API
    - **Execute as**: Me (your email)
    - **Who has access**: **Anyone** (This is critical for the website to work!)
11. Click **Deploy**.
12. **Authorize** the script if asked (Click *Review permissions* > Choose account > *Advanced* > *Go to (Script Name) (unsafe)* > *Allow*).
13. **COPY** the "Web app URL" (it looks like `https://script.google.com/macros/s/.../exec`).

## 2. Connect Frontend to Backend
1. Open the file `js/app.js` in this folder.
2. Find the line:
   ```javascript
   const GAS_ENDPOINT = "YOUR_WEB_APP_URL_HERE"; 
   ```
3. Replace `"YOUR_WEB_APP_URL_HERE"` with the URL you copied in Step 1.
   - Example: `const GAS_ENDPOINT = "https://script.google.com/macros/s/AKfycbx.../exec";`
4. Save the file.

## 3. Host the Website (Free)
You can use **GitHub Pages** or **Netlify**.

### Option A: Netlify (Drag & Drop - Easiest)
1. Go to [Netlify Drop](https://app.netlify.com/drop).
2. Drag this entire project folder (`xerox`) and drop it onto the page.
3. Your site will be live immediately! Netlify will give you a random URL (e.g., `modest-wing-123.netlify.app`).
4. You can rename the site in "Site Settings".

### Option B: GitHub Pages
1. Create a repository on GitHub.
2. Upload all these files (`index.html`, `css`, `js`, etc.).
3. Go to Repository **Settings > Pages**.
4. Under "Branch", select `main` (or `master`) and click Save.
5. Your site will be published at `https://yourusername.github.io/reponame/`.

## 4. Test It
1. Open your live website URL.
2. Go to "Order Now".
3. Add an item and click "Submit Order".
4. Check your Google Sheet - a new row should appear instantly!
5. Check your Email - you should get a notification.

## Admin Access
- To mark orders as "Completed", go to the `admin.html` page (e.g. `your-site.com/admin.html`).
- The password is set to `admin123` (Change this in `admin.html` line 67 if you want).
