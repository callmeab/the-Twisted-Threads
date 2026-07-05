import * as nodemailer from 'nodemailer';
import { getStoreOwnerNotificationTemplate, getCustomerConfirmationTemplate } from './email-templates';

// These should be configured in the Firebase Functions .env file
const GMAIL_USER = process.env.GMAIL_USER || 'twistedthread45@gmail.com';
const GMAIL_PASS = process.env.GMAIL_PASS; 

const STORE_OWNER_EMAIL = 'twistedthread45@gmail.com';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
});

export async function sendOrderNotification(order: any): Promise<void> {
  if (!GMAIL_PASS) {
    console.warn('[EmailService] GMAIL_PASS is not set. Skipping store owner notification.');
    return;
  }

  const mailOptions = {
    from: `"The Twisted Threads" <${GMAIL_USER}>`,
    to: STORE_OWNER_EMAIL,
    subject: `New Order Received - #${order.orderNumber}`,
    html: getStoreOwnerNotificationTemplate(order),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.info(`[EmailService] Order notification sent to store owner for order ${order.orderNumber}`);
  } catch (error) {
    console.error('[EmailService] Failed to send order notification:', error);
  }
}

export async function sendOrderConfirmation(order: any): Promise<void> {
  if (!GMAIL_PASS) {
    console.warn('[EmailService] GMAIL_PASS is not set. Skipping customer confirmation.');
    return;
  }

  const customerEmail = order.customerInfo?.email;
  if (!customerEmail) {
    console.info(`[EmailService] No email provided for order ${order.orderNumber}. Skipping confirmation.`);
    return;
  }

  const mailOptions = {
    from: `"The Twisted Threads" <${GMAIL_USER}>`,
    to: customerEmail,
    subject: `Order Confirmation - #${order.orderNumber}`,
    html: getCustomerConfirmationTemplate(order),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.info(`[EmailService] Order confirmation sent to customer ${customerEmail} for order ${order.orderNumber}`);
  } catch (error) {
    console.error('[EmailService] Failed to send order confirmation:', error);
  }
}
