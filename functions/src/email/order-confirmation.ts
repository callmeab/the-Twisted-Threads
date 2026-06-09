import * as nodemailer from 'nodemailer';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface OrderDoc {
  orderNumber: string;
  customerInfo: { fullName: string; email: string; phone: string };
  items: OrderItem[];
  shippingAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    stateProvince: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  orderNotes?: string;
  estimatedDelivery?: { toDate?: () => Date } | Date | string;
  createdAt?: { toDate?: () => Date } | Date | string;
}

const STORE_NAME = process.env.STORE_NAME ?? 'The Twisted Threads';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? 'concierge@thetwistedthreads.com';

function formatPkr(amount: number): string {
  return `PKR ${amount.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function toDate(value: OrderDoc['createdAt']): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate();
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return new Date(value);
  }
  return new Date();
}

function paymentLabel(method: string): string {
  return method === 'COD' ? 'Cash on Delivery (COD)' : 'Bank Transfer';
}

export function buildOrderConfirmationHtml(order: OrderDoc): string {
  const createdAt = toDate(order.createdAt);
  const delivery = order.estimatedDelivery ? toDate(order.estimatedDelivery) : null;

  const itemRows = order.items
    .map(item => {
      const variant = [item.selectedSize, item.selectedColor].filter(Boolean).join(' / ');
      const lineTotal = item.price * item.quantity;
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eee;">
            <strong>${item.name}</strong>
            ${variant ? `<br><span style="color:#666;font-size:13px;">${variant}</span>` : ''}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:right;">${formatPkr(lineTotal)}</td>
        </tr>`;
    })
    .join('');

  const address = order.shippingAddress;
  const addressLines = [
    address.addressLine1,
    address.addressLine2,
    `${address.city}, ${address.stateProvince} ${address.postalCode}`,
    address.country,
  ]
    .filter(Boolean)
    .join('<br>');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f7f5;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#1a1a2e;padding:32px;text-align:center;">
            <h1 style="margin:0;color:#c9956c;font-size:22px;letter-spacing:.05em;">✦ ${STORE_NAME}</h1>
            <p style="margin:8px 0 0;color:#f5f0eb;font-size:14px;">Order Confirmation</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;font-size:16px;color:#1a1a2e;">Dear ${order.customerInfo.fullName},</p>
            <p style="margin:0 0 24px;color:#555;line-height:1.6;">
              Thank you for your order! We've received it and will begin processing shortly.
              A copy of your order details is below.
            </p>

            <table width="100%" style="background:#fafaf9;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:16px 20px;">
                  <table width="100%">
                    <tr>
                      <td><span style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">Order Number</span><br>
                          <strong style="font-size:18px;color:#1a1a2e;">${order.orderNumber}</strong></td>
                      <td align="right"><span style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">Order Date</span><br>
                          <strong style="color:#1a1a2e;">${createdAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:.1em;color:#888;margin:0 0 12px;">Order Items</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <thead>
                <tr style="border-bottom:2px solid #1a1a2e;">
                  <th align="left" style="padding:8px 0;font-size:12px;color:#888;">Product</th>
                  <th style="padding:8px;font-size:12px;color:#888;">Qty</th>
                  <th align="right" style="padding:8px 0;font-size:12px;color:#888;">Total</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>

            <table width="100%" style="margin-bottom:24px;">
              <tr><td style="padding:4px 0;color:#666;">Subtotal</td><td align="right">${formatPkr(order.subtotal)}</td></tr>
              <tr><td style="padding:4px 0;color:#666;">Shipping &amp; fees</td><td align="right">${formatPkr(order.shippingCost)}</td></tr>
              <tr><td style="padding:8px 0;font-weight:bold;font-size:16px;color:#1a1a2e;">Order Total</td>
                  <td align="right" style="font-weight:bold;font-size:16px;color:#1a1a2e;">${formatPkr(order.total)}</td></tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td width="50%" valign="top" style="padding-right:12px;">
                  <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:.1em;color:#888;margin:0 0 8px;">Shipping Address</h2>
                  <p style="margin:0;color:#444;line-height:1.6;">${addressLines}</p>
                  <p style="margin:8px 0 0;color:#666;font-size:13px;">Phone: ${order.customerInfo.phone}</p>
                </td>
                <td width="50%" valign="top" style="padding-left:12px;">
                  <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:.1em;color:#888;margin:0 0 8px;">Payment</h2>
                  <p style="margin:0;color:#444;">${paymentLabel(order.paymentMethod)}</p>
                  ${delivery ? `<p style="margin:8px 0 0;color:#666;font-size:13px;">Est. delivery: ${delivery.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>` : ''}
                </td>
              </tr>
            </table>

            ${order.orderNotes ? `<p style="margin:0 0 24px;padding:12px 16px;background:#fff7ed;border-radius:8px;color:#9a3412;font-size:13px;"><strong>Order notes:</strong> ${order.orderNotes}</p>` : ''}

            <p style="margin:0;color:#888;font-size:13px;line-height:1.6;">
              Track your order anytime at our website using your order number and email address.
              Questions? Reply to this email or contact us at
              <a href="mailto:${SUPPORT_EMAIL}" style="color:#c9956c;">${SUPPORT_EMAIL}</a>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;color:#aaa;font-size:12px;">© ${new Date().getFullYear()} ${STORE_NAME}. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildOrderConfirmationText(order: OrderDoc): string {
  const items = order.items
    .map(i => `  - ${i.name} x${i.quantity}: ${formatPkr(i.price * i.quantity)}`)
    .join('\n');

  return `
${STORE_NAME} — Order Confirmation

Dear ${order.customerInfo.fullName},

Thank you for your order!

Order Number: ${order.orderNumber}
Payment: ${paymentLabel(order.paymentMethod)}
Total: ${formatPkr(order.total)}

Items:
${items}

Shipping to:
${order.shippingAddress.addressLine1}
${order.shippingAddress.city}, ${order.shippingAddress.stateProvince}
${order.shippingAddress.country}

Questions? Contact ${SUPPORT_EMAIL}
`.trim();
}

function createTransporter(): nodemailer.Transporter | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  });
}

export async function sendOrderConfirmationEmail(order: OrderDoc): Promise<boolean> {
  const to = order.customerInfo.email;
  const subject = `Order Confirmed — ${order.orderNumber} | ${STORE_NAME}`;
  const html = buildOrderConfirmationHtml(order);
  const text = buildOrderConfirmationText(order);
  const from = process.env.SMTP_FROM ?? `"${STORE_NAME}" <${process.env.SMTP_USER ?? SUPPORT_EMAIL}>`;

  const transporter = createTransporter();

  if (!transporter) {
    console.warn('[Email] SMTP not configured. Order confirmation email preview:');
    console.info({ to, subject, text });
    return false;
  }

  await transporter.sendMail({ from, to, subject, html, text });
  console.info(`[Email] Order confirmation sent to ${to} for ${order.orderNumber}`);
  return true;
}
