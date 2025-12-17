/**
 * Smart Xerox V2 - Advanced Backend
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Google Sheet with 4 Tabs: "Users", "Orders", "Payments", "Admin"
 * 2. Setup Headers:
 *    - Users: [user_id, full_name, mobile_number, email, login_provider, created_at]
 *    - Orders: [order_id, user_id, file_names, print_type, pages, copies, amount_total, amount_paid, order_status, created_at, instructions]
 *    - Payments: [payment_id, order_id, payment_method, transaction_id, amount, payment_time]
 *    - Admin: [admin_id, username, password] (Add one row manually: [1, admin, admin123])
 * 3. Deploy as Web App (Execute as Me, Access: Anyone)
 */

const SHEET_IDS = {
  users: "Users",
  orders: "Orders",
  payments: "Payments",
  admin: "Admin"
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "register_user") {
      return registerUser(ss, data);
    } else if (action === "login_user") {
      return loginUser(ss, data); // Returns user profile
    } else if (action === "create_order") {
      return createOrder(ss, data);
    } else if (action === "update_order_status") {
      return updateOrderStatus(ss, data);
    } else if (action === "admin_login") {
      return adminLogin(ss, data);
    }

    return response({ status: "error", message: "Invalid Action" });

  } catch (err) {
    return response({ status: "error", message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}


function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === "get_user_orders") {
    return getUserOrders(ss, e.parameter.user_id);
  } else if (action === "get_all_orders") {
    return getAllOrders(ss);
  } else if (action === "login_user") {
    // New: Handle login via GET to allow fetching user data from frontend
    return loginUser(ss, { mobile: e.parameter.mobile });
  }

  return response({ status: "success", message: "V2 Backend Ready" });
}


// --- Action Handlers ---

function registerUser(ss, data) {
  const sheet = ss.getSheetByName(SHEET_IDS.users);
  const users = sheet.getDataRange().getValues();
  // Check if exists
  for (let i = 1; i < users.length; i++) {
    if (users[i][2] == data.mobile || (data.email && users[i][3] == data.email)) {
      // User exists, return profile
      return response({ 
        status: "success", 
        user: { id: users[i][0], name: users[i][1], mobile: users[i][2], email: users[i][3] } 
      });
    }
  }
  
  const newUser = [
    data.id || Utilities.getUuid(),
    data.name,
    data.mobile,
    data.email || "",
    data.provider,
    new Date().toISOString()
  ];
  sheet.appendRow(newUser);
  
  return response({ 
    status: "success", 
    user: { id: newUser[0], name: newUser[1], mobile: newUser[2], email: newUser[3] } 
  });
}

function loginUser(ss, data) {
  // Simple check by mobile
  const sheet = ss.getSheetByName(SHEET_IDS.users);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][2] == data.mobile) {
      return response({ 
        status: "success", 
        user: { id: rows[i][0], name: rows[i][1], mobile: rows[i][2], email: rows[i][3] } 
      });
    }
  }
  return response({ status: "error", message: "User not found" });
}

function createOrder(ss, data) {
  const oSheet = ss.getSheetByName(SHEET_IDS.orders);
  const pSheet = ss.getSheetByName(SHEET_IDS.payments);
  
  const o = data.order;
  // [order_id, user_id, file_names, print_type, pages, copies, amount_total, amount_paid, order_status, created_at, instructions]
  const orderRow = [
    o.order_id,
    o.user_id,
    o.file_names.join(", "),
    o.print_type,
    o.pages,
    o.copies,
    o.amount_total,
    o.amount_paid,
    "Received",
    new Date().toISOString(),
    o.instructions
  ];
  oSheet.appendRow(orderRow);
  
  // Add Payment Record
  // [payment_id, order_id, payment_method, transaction_id, amount, payment_time]
  const payRow = [
    Utilities.getUuid(),
    o.order_id,
    data.payment.method,
    data.payment.txn_id,
    data.payment.amount,
    new Date().toISOString()
  ];
  pSheet.appendRow(payRow);
  
  // Send Email (Optional, quota limits apply)
  try {
    MailApp.sendEmail({
      to: "SessionUser@example.com", // REPLACE WITH OWNER ADDR
      subject: `V2 Order: ${o.order_id}`,
      htmlBody: `New Order from User ${o.user_id}. Amount: ${o.amount_total}`
    });
  } catch(e) {}

  return response({ status: "success", order_id: o.order_id });
}

function getUserOrders(ss, userId) {
  const sheet = ss.getSheetByName(SHEET_IDS.orders);
  const rows = sheet.getDataRange().getValues();
  const results = [];
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] == userId) { // Match User ID
      results.push({
        order_id: rows[i][0],
        files: rows[i][2],
        print_type: rows[i][3],
        pages: rows[i][4],
        copies: rows[i][5],
        total: rows[i][6],
        paid: rows[i][7],
        status: rows[i][8],
        date: rows[i][9],
        instructions: rows[i][10]
      });
    }
  }
  // Sort desc date
  results.reverse();
  return response({ status: "success", data: results });
}

function getAllOrders(ss) {
  // Admin only
  const sheet = ss.getSheetByName(SHEET_IDS.orders);
  const rows = sheet.getDataRange().getValues();
  // Simply return all (skipping header)
  const results = rows.slice(1).map(r => ({
    order_id: r[0], user_id: r[1], files: r[2], total: r[6], status: r[8], date: r[9]
  })).reverse();
  return response({ status: "success", data: results });
}

function updateOrderStatus(ss, data) {
  const sheet = ss.getSheetByName(SHEET_IDS.orders);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == data.order_id) {
      sheet.getRange(i + 1, 9).setValue(data.status); // Col 9 is status
      return response({ status: "success" });
    }
  }
  return response({ status: "error", message: "Order not found" });
}

function adminLogin(ss, data) {
  const sheet = ss.getSheetByName(SHEET_IDS.admin);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] == data.username && rows[i][2] == data.password) {
       return response({ status: "success", token: "admin_ok" });
    }
  }
  return response({ status: "error" });
}

function response(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
