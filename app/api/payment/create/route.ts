// online-courses/app/api/payment/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { YookassaClient } from '@/lib/yookassa';
// ИЗМЕНЕНО: YookassaConfirmationType удален из импорта
import { YookassaAmount } from '@/types'; // Import necessary types

// Генерация платёжной ссылки через ЮKassa
export async function POST(req: NextRequest) {
  const { amount, description, userId, itemId } = await req.json() as { amount?: number; description?: string; userId?: string; itemId?: string };

  if (!amount || !description || !userId || !itemId) {
    return NextResponse.json({ message: 'Отсутствуют необходимые параметры' }, { status: 400 });
  }

  try {
    const payment = await YookassaClient.createPayment({
      amount: { value: amount.toFixed(2), currency: 'RUB' } as YookassaAmount, // Type assertion
      // ИЗМЕНЕНО: Использован строковый литерал 'redirect' напрямую
      confirmation: { type: 'redirect', return_url: `${req.nextUrl.origin}/dashboard/student/payments/success?paymentId={payment_id}` },
      description: description,
      metadata: { userId, itemId, type: 'course_purchase' },
      capture: true, // Автоматический захват платежа
    });

    if (payment && payment.confirmation && payment.confirmation.confirmation_url) {
      return NextResponse.json({ success: true, paymentLink: payment.confirmation.confirmation_url, paymentId: payment.id }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, message: 'Не удалось создать платежную ссылку' }, { status: 500 });
    }
  } catch (error) {
    console.error('Yookassa create payment error:', error);
    return NextResponse.json({ success: false, message: 'Ошибка при создании платежа' }, { status: 500 });
  }
}
