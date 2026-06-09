import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

initializeApp();

const db = getFirestore();

export const onOrderCreated = onDocumentCreated('orders/{orderId}', async event => {
  const snapshot = event.data;
  if (!snapshot) {
    return;
  }

  const order = snapshot.data();
  if (order.whatsappConfirmationSent) {
    return;
  }

  try {
    console.info(`[onOrderCreated] Order ${order.orderNumber} created. Notification is handled client-side.`);
    await snapshot.ref.update({
      whatsappConfirmationSent: true,
      whatsappConfirmationSentAt: new Date(),
    });
  } catch (err) {
    console.error('[onOrderCreated] Failed to update WhatsApp confirmation status:', err);
  }
});

export const trackOrder = onCall(async request => {
  const orderNumber = String(request.data?.orderNumber ?? '').trim();
  const email = String(request.data?.email ?? '').trim().toLowerCase();

  if (!orderNumber || !email) {
    throw new HttpsError('invalid-argument', 'Order number and email are required.');
  }

  const normalizedNumber = orderNumber.toUpperCase();
  const snapshot = await db
    .collection('orders')
    .where('orderNumber', '==', normalizedNumber)
    .limit(1)
    .get();

  if (snapshot.empty) {
    const altSnapshot = await db
      .collection('orders')
      .where('orderNumber', '==', orderNumber)
      .limit(1)
      .get();

    if (altSnapshot.empty) {
      throw new HttpsError('not-found', 'Order not found.');
    }

    const order = altSnapshot.docs[0].data();
    const orderEmail = String(order.customerInfo?.email ?? '').trim().toLowerCase();
    if (orderEmail !== email) {
      throw new HttpsError('permission-denied', 'Email does not match this order.');
    }

    return sanitizeOrderForCustomer(altSnapshot.docs[0].id, order);
  }

  const doc = snapshot.docs[0];
  const order = doc.data();
  const orderEmail = String(order.customerInfo?.email ?? '').trim().toLowerCase();

  if (orderEmail !== email) {
    throw new HttpsError('permission-denied', 'Email does not match this order.');
  }

  return sanitizeOrderForCustomer(doc.id, order);
});

function sanitizeOrderForCustomer(
  orderId: string,
  order: FirebaseFirestore.DocumentData
): Record<string, unknown> {
  const paymentProof = order.paymentProof
    ? {
        fileName: order.paymentProof.fileName,
        fileUrl: order.paymentProof.fileUrl,
        uploadedAt: order.paymentProof.uploadedAt,
        uploadMethod: order.paymentProof.uploadMethod,
      }
    : undefined;

  return {
    orderId,
    orderNumber: order.orderNumber,
    customerInfo: order.customerInfo,
    items: order.items,
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    paymentProof,
    orderNotes: order.orderNotes,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    total: order.total,
    status: order.status,
    paymentStatus: order.paymentStatus,
    trackingNumber: order.trackingNumber,
    createdAt: order.createdAt,
    estimatedDelivery: order.estimatedDelivery,
  };
}
