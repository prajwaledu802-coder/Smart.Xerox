/**
 * Smart Xerox V2 - Core Application Logic
 * Integrates Glassmorphism UI, OTP Simulation, and Relational Data Sync.
 */

// CONFIGURATION
// The Real Web App URL
const GAS_ENDPOINT = "https://script.google.com/macros/s/AKfycbxPMg7DfX5NrIZ2GdCQ01UoJXJ7IrFSVfzLDmC1UM6GkPsigzsNJQf64_lzlTiKyQh0/exec";
const WHATSAPP_NUMBER = "919916220476";

// STATE STORE
const Store = {
  user: JSON.parse(localStorage.getItem('sx_user')) || null,
  prices: {
    xerox_bw: { single: 2, double: 3 },
    print_bw: { single: 3, double: 4 },
    print_color: { single: 5, double: 10 }
  }
};

// --- CORE APP ---
const App = {
  init() {
    this.updateNav();
    this.globalListeners();
    const path = window.location.pathname;

    // Protect Routes
    if ((path.includes('dashboard') || path.includes('order')) && !Store.user) {
      window.location.href = 'login.html';
    }
  },

  updateNav() {
    const navAuth = document.getElementById('nav-auth');
    if (!navAuth) return;

    if (Store.user) {
      navAuth.innerHTML = `
        <a href="index.html">Home</a>
        <a href="order.html">New Order</a>
        <a href="dashboard.html" class="active" style="color: var(--secondary);">Hi, ${Store.user.name.split(' ')[0]}</a>
        <a href="#" onclick="Auth.logout()">Logout</a>
      `;
    } else {
      navAuth.innerHTML = `
        <a href="index.html">Home</a>
        <a href="services.html">Services</a>
        <a href="login.html" class="btn btn-primary btn-sm" style="color: var(--dark);">Login</a>
        <a href="signup.html" class="btn btn-outline btn-sm">Sign Up</a>
      `;
    }
  },

  globalListeners() {
    const toggle = document.querySelector('.nav-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        document.querySelector('.nav-links').classList.toggle('show');
      });
    }
  }
};

// --- AUTHENTICATION ---
const Auth = {

  // Handles both Login (GET) and Signup (POST)
  async processLogin(userData, callback) {
    try {

      // 1. SIGNUP FLOW (POST)
      if (userData.isSignup) {
        // Use no-cors for POST (Fire and Forget)
        await fetch(GAS_ENDPOINT, {
          method: 'POST', mode: 'no-cors',
          body: JSON.stringify({ action: 'register_user', ...userData })
        });
        // We assume success and create a local session.
        // For reliability, we assign a temp ID. The backend will generate its own,
        // but since we can't read it in no-cors, this is the trade-off.
        Store.user = { id: 'u-' + Date.now(), ...userData };
        this.finishAuth(callback);

      }
      // 2. LOGIN FLOW (GET)
      else {
        // Use GET to actually fetch the profile from Backend
        const url = `${GAS_ENDPOINT}?action=login_user&mobile=${userData.mobile}`;
        const res = await fetch(url);
        const json = await res.json();

        if (json.status === 'success') {
          Store.user = json.user; // Use REAL profile from Sheet
          this.finishAuth(callback);
        } else {
          alert('User not found! Please Sign Up first.');
        }
      }

    } catch (e) {
      console.error(e);
      // Fallback for demo if offline or error
      // alert('Connection Error. Logging in locally.');
      // Store.user = { id: 'temp', ...userData };
      // this.finishAuth(callback);
      alert('Login failed. Please check internet or try Signup.');
    }
  },

  finishAuth(callback) {
    localStorage.setItem('sx_user', JSON.stringify(Store.user));
    if (callback) {
      callback();
    } else {
      window.location.href = 'dashboard.html';
    }
  },

  logout() {
    localStorage.removeItem('sx_user');
    window.location.href = 'index.html';
  }
};

// --- API & ORDER ACTIONS ---
const API = {
  async createOrder(payload) {
    // Fire and Forget POST
    await fetch(GAS_ENDPOINT, {
      method: 'POST', mode: 'no-cors',
      body: JSON.stringify({ action: 'create_order', ...payload })
    });

    this.sendToWhatsApp(payload.order);
    return { status: 'success' };
  },

  async fetchOrders(userId) {
    if (!userId) return [];
    try {
      const url = `${GAS_ENDPOINT}?action=get_user_orders&user_id=${userId}`;
      const res = await fetch(url);
      const json = await res.json();
      return json.data || [];
    } catch (e) { return []; }
  },

  sendToWhatsApp(order) {
    const text = `*New Order: ${order.order_id.split('-')[0]}*%0A` +
      `User: ${Store.user.name}%0A` +
      `Type: ${order.print_type}%0A` +
      `Files: ${order.file_names.length} file(s)%0A` +
      `Total: ₹${order.amount_total} (Paid: ₹${order.amount_paid})%0A` +
      `Instructions: ${order.instructions || 'None'}`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;

    setTimeout(() => window.open(url, '_blank'), 500);
  }
};

// Export
window.App = App;
window.Auth = Auth;
window.API = API;
window.Store = Store;
document.addEventListener('DOMContentLoaded', App.init);
