// POST: Верификация статуса оплаты

// online-courses/app/api/payment/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { YookassaClient } from '@/lib/yookassa';
import { db } from '@/lib/db'; // Для проверки статуса в БД
import { PaymentStatus } from '@/types';

// Верификация оплаты
export async function POST(req: NextRequest) {
  const { paymentId } = await req.json() as { paymentId?: string };

  if (!paymentId) {
    return NextResponse.json({ message: 'Отсутствует ID платежа' }, { status: 400 });
  }

  try {
    // Сначала проверяем статус в нашей БД
    const localPayment = await db.getPaymentById(paymentId);
    if (localPayment && localPayment.status === 'succeeded') {
      return NextResponse.json({ success: true, isPaid: true, status: 'succeeded' }, { status: 200 });
    }

    // Если в нашей БД нет или статус не "succeeded", запрашиваем у ЮKassa
    const yookassaPayment = await YookassaClient.getPaymentStatus(paymentId);

    if (yookassaPayment && yookassaPayment.status === 'succeeded') {
      // Обновляем статус в нашей БД, если он изменился
      if (localPayment?.status !== 'succeeded') {
        await db.updatePaymentStatus(paymentId, 'succeeded' as PaymentStatus);
        // Активируем курс/подписку, если еще не активировано
        // if (yookassaPayment.metadata?.userId && yookassaPayment.metadata?.itemId && yookassaPayment.amount?.value) {
        //   await db.activateCourseOrSubscription(yookassaPayment.metadata.userId as string, yookassaPayment.metadata.itemId as string, parseFloat(yookassaPayment.amount.value));
        // }
      }
      return NextResponse.json({ success: true, isPaid: true, status: 'succeeded' }, { status: 200 });
    } else {
      // Обновляем статус в нашей БД, если он изменился (например, с pending на failed)
      const newStatus = yookassaPayment?.status as PaymentStatus || 'failed';
      if (localPayment?.status !== newStatus) {
        await db.updatePaymentStatus(paymentId, newStatus);
      }
      return NextResponse.json({ success: false, isPaid: false, status: newStatus }, { status: 200 });
    }
  } catch (error) {
    console.error('Verify payment API error:', error);
    return NextResponse.json({ success: false, message: 'Ошибка при верификации платежа' }, { status: 500 });
  }
}