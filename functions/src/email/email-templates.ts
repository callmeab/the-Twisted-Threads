export function getStoreOwnerNotificationTemplate(order: any): string {
  const itemsHtml = order.items
    .map(
      (item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <strong>${item.product.name}</strong><br>
          <span style="color: #666; font-size: 13px;">${item.product.category} | Size: ${item.selectedSize || 'N/A'}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">Rs ${item.product.price}</td>
      </tr>
    `
    )
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #B76E79;">
        <h1 style="color: #4a154b; margin: 0;">New Order Received!</h1>
        <p style="margin-top: 5px; color: #666;">Order #${order.orderNumber}</p>
      </div>
      
      <div style="padding: 20px;">
        <h2 style="color: #B76E79; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Customer Details</h2>
        <p><strong>Name:</strong> ${order.customerInfo.fullName}</p>
        <p><strong>Email:</strong> ${order.customerInfo.email || 'Not Provided'}</p>
        <p><strong>WhatsApp:</strong> ${order.customerInfo.whatsappNumber}</p>
        <p><strong>Phone:</strong> ${order.customerInfo.phone}</p>
        
        <h2 style="color: #B76E79; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">Shipping Address</h2>
        <p>${order.shippingAddress.addressLine1}</p>
        <p>${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 : ''}</p>
        <p>${order.shippingAddress.city}, ${order.shippingAddress.stateProvince} ${order.shippingAddress.postalCode}</p>
        <p>${order.shippingAddress.country}</p>

        <h2 style="color: #B76E79; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">Order Summary</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="padding: 12px; border-bottom: 2px solid #ddd; text-align: left;">Item</th>
              <th style="padding: 12px; border-bottom: 2px solid #ddd; text-align: center;">Qty</th>
              <th style="padding: 12px; border-bottom: 2px solid #ddd; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px; text-align: right;"><strong>Subtotal:</strong></td>
              <td style="padding: 12px; text-align: right;">Rs ${order.subtotal}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 12px; text-align: right;"><strong>Shipping & Fees:</strong></td>
              <td style="padding: 12px; text-align: right;">Rs ${order.shippingCost}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 12px; text-align: right; font-size: 18px;"><strong>Total:</strong></td>
              <td style="padding: 12px; text-align: right; font-size: 18px; color: #B76E79;"><strong>Rs ${order.total}</strong></td>
            </tr>
          </tfoot>
        </table>

        <h2 style="color: #B76E79; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">Payment & Notes</h2>
        <p><strong>Method:</strong> ${order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Bank Transfer'}</p>
        ${order.orderNotes ? `<p><strong>Notes:</strong> ${order.orderNotes}</p>` : ''}
      </div>
    </div>
  `;
}

export function getCustomerConfirmationTemplate(order: any): string {
  const itemsHtml = order.items
    .map(
      (item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <strong>${item.product.name}</strong><br>
          <span style="color: #666; font-size: 13px;">${item.product.category} | Size: ${item.selectedSize || 'N/A'}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">Rs ${item.product.price}</td>
      </tr>
    `
    )
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="text-align: center; padding: 20px 0;">
        <h1 style="color: #B76E79; margin: 0; font-size: 28px; letter-spacing: 2px;">THE TWISTED THREADS</h1>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 8px;">
        <h2 style="color: #4a154b; margin: 0 0 10px 0;">Thank You For Your Order!</h2>
        <p style="margin: 0; color: #666; font-size: 16px;">Order #${order.orderNumber}</p>
        <p style="margin-top: 15px; font-size: 15px;">Hi ${order.customerInfo.fullName}, we've received your order and are getting it ready to be shipped.</p>
      </div>
      
      <div style="padding: 20px;">
        <h3 style="color: #B76E79; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr>
              <th style="padding: 12px; border-bottom: 2px solid #ddd; text-align: left; color: #666;">Item</th>
              <th style="padding: 12px; border-bottom: 2px solid #ddd; text-align: center; color: #666;">Qty</th>
              <th style="padding: 12px; border-bottom: 2px solid #ddd; text-align: right; color: #666;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px; text-align: right; color: #666;">Subtotal:</td>
              <td style="padding: 12px; text-align: right;">Rs ${order.subtotal}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 12px; text-align: right; color: #666;">Shipping & Fees:</td>
              <td style="padding: 12px; text-align: right;">Rs ${order.shippingCost}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 12px; text-align: right; font-size: 18px;"><strong>Total:</strong></td>
              <td style="padding: 12px; text-align: right; font-size: 18px; color: #B76E79;"><strong>Rs ${order.total}</strong></td>
            </tr>
          </tfoot>
        </table>

        <div style="background-color: #fafafa; padding: 20px; border-radius: 8px; margin-top: 30px;">
          <h3 style="margin: 0 0 10px 0; color: #4a154b; font-size: 16px;">Delivery Information</h3>
          <p style="margin: 0; color: #666;">
            ${order.shippingAddress.addressLine1}<br>
            ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br>' : ''}
            ${order.shippingAddress.city}, ${order.shippingAddress.stateProvince} ${order.shippingAddress.postalCode}<br>
            ${order.shippingAddress.country}
          </p>
        </div>

        <p style="text-align: center; color: #888; font-size: 14px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
          If you have any questions, reply to this email or contact us via WhatsApp.<br>
          <a href="https://wa.me/923316903634" style="color: #B76E79; text-decoration: none;">Message us on WhatsApp</a>
        </p>
      </div>
    </div>
  `;
}
