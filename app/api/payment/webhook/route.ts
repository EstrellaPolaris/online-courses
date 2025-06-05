// POST: Webhook-обработчик от платёжной системы (ЮKassa)


// online-courses/app/api/payment/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { YookassaClient } from '@/lib/yookassa';
import { db } from '@/lib/db'; // Для обновления статуса в БД
import { PaymentStatus, YookassaWebhookPayload } from '@/types';

// Webhook от платёжной системы (ЮKassa)
export async function POST(req: NextRequest) {
  const payload: YookassaWebhookPayload = await req.json(); // Explicitly type payload
  const signature = req.headers.get('YooKassa-Signature'); // Заголовок для верификации

  if (!signature || !YookassaClient.verifyWebhook(payload, signature)) {
    console.warn('Webhook: Invalid signature or missing signature');
    return NextResponse.json({ message: 'Invalid signature' }, { status: 403 });
  }

  const { event, object } = payload;

  if (event === 'payment.succeeded' && object.status === 'succeeded') {
    const paymentId = object.id;
    const userId = object.metadata?.userId as string | undefined; // Explicitly type metadata
    const itemId = object.metadata?.itemId as string | undefined;
    //const amount = parseFloat(object.amount.value);

    if (!userId || !itemId) {
      console.error(`Webhook: Missing userId or itemId in metadata for payment ${paymentId}`);
      return NextResponse.json({ message: 'Missing metadata' }, { status: 400 });
    }

    console.log(`Webhook: Payment succeeded for ${paymentId}, user ${userId}, item ${itemId}`);

    try {
      // Обновляем статус платежа в БД
      await db.updatePaymentStatus(paymentId, 'succeeded' as PaymentStatus);
      // Активируем курс или подписку для пользователя
      // await db.activateCourseOrSubscription(userId, itemId, amount);
      console.log(`Payment ${paymentId} processed and user access granted.`);
    } catch (error) {
      console.error(`Webhook: Error processing payment ${paymentId}:`, error);
      // В реальном приложении здесь будет логика для обработки ошибок и повторных попыток
    }
  } else if (event === 'payment.canceled' || object.status === 'canceled') {
    const paymentId = object.id;
    console.warn(`Webhook: Payment ${paymentId} was canceled.`);
    try {
      await db.updatePaymentStatus(paymentId, object.status as PaymentStatus); // Use object.status directly
    } catch (error) {
      console.error(`Webhook: Error updating status for canceled payment ${paymentId}:`, error);
    }
  }

  return NextResponse.json({ message: 'Webhook processed' }, { status: 200 });
}