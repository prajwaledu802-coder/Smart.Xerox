/**
 * Smart Xerox Invoice Generator
 * Uses html2pdf.js to render the Invoice DOM to a downloadable PDF.
 */

const InvoiceSystem = {
    generate(order) {
        // 1. Create Invoice HTML
        const element = document.createElement('div');
        element.innerHTML = this.getInvoiceTemplate(order);

        // 2. Options
        const opt = {
            margin: 0.5,
            filename: `Invoice_${order.order_id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        // 3. Save
        // We assume html2pdf is loaded globally from CDN
        html2pdf().set(opt).from(element).save();
    },

    getInvoiceTemplate(order) {
        const date = new Date(order.date).toLocaleDateString();
        const pending = order.total - (order.paid ? order.total * 0.5 : 0); // Logic: if paid advance (50%), remaining is 50%
        const statusText = pending <= 0.1 ? 'PAID IN FULL' : 'PARTIALLY PAID';

        return `
      <div style="padding: 30px; font-family: sans-serif; color: #333; position: relative;">
        <!-- Watermark -->
        <div style="position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 4rem; opacity: 0.1; font-weight: 900;">
          SMART XEROX
        </div>

        <!-- Header -->
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px;">
          <div>
            <h1 style="color: #FFD23F; margin: 0;">Smart Xerox</h1>
            <p style="margin: 5px 0; font-size: 0.9rem;">Start Campus, Near College Gate</p>
            <p style="margin: 0; font-size: 0.9rem;">+91 99162 20476</p>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; color: #888;">INVOICE</h2>
            <p style="margin: 5px 0;"><strong>#${order.order_id.split('-')[0]}</strong></p>
            <p style="margin: 0;">${date}</p>
          </div>
        </div>

        <!-- Bill To -->
        <div style="margin-top: 30px;">
          <p style="font-size: 0.9rem; color: #888; margin-bottom: 5px;">BILL TO</p>
          <h3 style="margin: 0;">${App.user.name}</h3>
          <p style="margin: 5px 0;">${App.user.mobile}</p>
        </div>

        <!-- Table -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 30px;">
          <thead>
            <tr style="background: #f9f9f9; text-align: left;">
              <th style="padding: 10px; border-bottom: 1px solid #ddd;">Item / Description</th>
              <th style="padding: 10px; border-bottom: 1px solid #ddd;">Qty</th>
              <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 15px 10px; border-bottom: 1px solid #eee;">
                <strong>${order.print_type || 'Print Services'}</strong><br>
                <small style="color: #777;">${order.files}</small>
              </td>
              <td style="padding: 15px 10px; border-bottom: 1px solid #eee;">
                ${order.pages} pages x ${order.copies}
              </td>
              <td style="padding: 15px 10px; border-bottom: 1px solid #eee; text-align: right;">
                ₹${order.total}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Totals -->
        <div style="margin-top: 20px; text-align: right;">
          <p>Subtotal: ₹${order.total}</p>
          <p>Advance Paid: -₹${order.paid ? order.total * 0.5 : 0}</p>
          <div style="background: #f0f9ff; display: inline-block; padding: 10px 20px; border-radius: 5px; margin-top: 10px;">
            <h3 style="margin: 0; color: #3B82F6;">Total Due: ₹${pending}</h3>
          </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 50px; text-align: center; font-size: 0.8rem; color: #888; border-top: 1px solid #eee; padding-top: 20px;">
          <p>Thank you for choosing Smart Xerox!</p>
          <p>For any queries, contact support at +91 99162 20476</p>
          <div style="margin-top: 10px; font-weight: bold; color: ${pending <= 0.1 ? 'green' : 'orange'}">
            STATUS: ${statusText}
          </div>
        </div>
      </div>
    `;
    }
};
