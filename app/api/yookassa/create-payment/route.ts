// online-courses/app/api/yookassa/create-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { YookassaPaymentRequestPayload } from '@/types';
import { db } from '@/lib/db'; // Мок БД
import { v4 as uuidv4 } from 'uuid'; // Для Idempotency-Key

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
const YOOKASSA_GATEWAY_ID_PLATFORM = process.env.YOOKASSA_GATEWAY_ID_PLATFORM;
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL;

// Для сплит-платежей: это должен быть динамический запрос из БД!
// Здесь для примера хардкодим.
const TEACHER_SUBMERCHANTS = {
  'teacher456': {
    account_id: process.env.YOOKASSA_TEACHER_1_SUBMERCHANT_ID || 'mock_teacher_shop_id_1',
    gateway_id: process.env.YOOKASSA_TEACHER_1_GATEWAY_ID || 'mock_teacher_gateway_id_1',
  },
  // Добавьте других преподавателей по мере необходимости
};

// Вспомогательная функция для кодирования базовой аутентификации
function getAuthHeader() {
  const credentials = `${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

export async function POST(req: NextRequest) {
  if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY || !YOOKASSA_GATEWAY_ID_PLATFORM || !NEXT_PUBLIC_APP_URL) {
    console.error('Missing Yookassa environment variables.');
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  try {
    const {
      amount, // number
      description, // string
      courseId, // string (для сценариев курса)
      userId, // string (ID текущего пользователя, который платит)
      scenario, // 'student_buys_my_course' | 'teacher_buys_platform_access' | 'student_buys_teacher_course_split'
      teacherId, // string (ID преподавателя для сплит-платежей)
      platformAccessTier, // string (для уровня доступа преподавателя)
    } = await req.json();

    if (!amount || !description || !userId || !scenario) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const value = amount.toFixed(2); // Форматируем сумму до 2 знаков после запятой
    const returnUrl = `${NEXT_PUBLIC_APP_URL}/dashboard/payment-success`; // URL для редиректа после успешной оплаты

    const paymentRequest: YookassaPaymentRequestPayload = {
      amount: { value, currency: 'RUB' },
      confirmation: { type: 'redirect', return_url: returnUrl },
      capture: true, // Автоматическое зачисление платежа после подтверждения
      description: description,
      metadata: {
        userId,
        scenario,
        courseId,
        teacherId,
        platformAccessTier,
        courseTitle: description, // Используем описание как название курса
        studentEmail: (await db.getUserById(userId))?.email, // Получаем email для чека
      },
      receipt: { // Пример данных для чека
        customer: {
          email: (await db.getUserById(userId))?.email,
          phone: '+79991234567', // Замените на реальный телефон пользователя
        },
        items: [
          {
            description: description,
            quantity: '1.00',
            amount: { value, currency: 'RUB' },
            vat_code: 1, // Без НДС, измените при необходимости
          },
        ],
      },
    };

    // --- Настройка получателей для разных сценариев ---
    if (scenario === 'student_buys_teacher_course_split') {
      if (!teacherId || !courseId) {
        return NextResponse.json({ message: 'Missing teacherId or courseId for split payment' }, { status: 400 });
      }
      const course = await db.getCourseById(courseId);
      if (!course) {
        return NextResponse.json({ message: 'Course not found for split payment' }, { status: 404 });
      }

      const platformSharePercent = 0.1; // 10% платформе
      const teacherSharePercent = 0.9;  // 90% преподавателю

      const platformAmount = (amount * platformSharePercent).toFixed(2);
      const teacherAmount = (amount * teacherSharePercent).toFixed(2);

      const teacherSubmerchant = TEACHER_SUBMERCHANTS[teacherId as keyof typeof TEACHER_SUBMERCHANTS]; // В продакшене из БД
      if (!teacherSubmerchant) {
          return NextResponse.json({ message: `Teacher submerchant data not found for ${teacherId}` }, { status: 404 });
      }

      paymentRequest.recipients = [
        {
          account_id: YOOKASSA_SHOP_ID,
          gateway_id: YOOKASSA_GATEWAY_ID_PLATFORM,
          amount: { value: platformAmount, currency: 'RUB' },
        },
        {
          account_id: teacherSubmerchant.account_id,
          gateway_id: teacherSubmerchant.gateway_id,
          amount: { value: teacherAmount, currency: 'RUB' },
        },
      ];
      // Для сплит-платежей ЮKassa может потребовать более строгих правил для receipts.
      // Обычно receipts в таких случаях отправляются каждым субмерчантом отдельно.
      // Для упрощения примера, оставим общий receipt, но в реале проверьте доку ЮKassa.
    } else {
      // Для стандартных платежей (студент покупает курс платформы / преподаватель покупает доступ)
      // Получатель по умолчанию - ваш YOOKASSA_SHOP_ID
      paymentRequest.recipients = [
        {
          account_id: YOOKASSA_SHOP_ID,
          gateway_id: YOOKASSA_GATEWAY_ID_PLATFORM,
          amount: { value, currency: 'RUB' },
        },
      ];
    }

    console.log('Sending payment request to Yookassa:', JSON.stringify(paymentRequest, null, 2));

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
        'Idempotency-Key': uuidv4(), // Важный ключ для предотвращения повторных операций
      },
      body: JSON.stringify(paymentRequest),
    });

    const data = await response.json();
    console.log('Yookassa API response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('Yookassa error response:', data);
      return NextResponse.json({ message: data.description || 'Failed to create payment' }, { status: response.status });
    }

    if (data.confirmation && data.confirmation.confirmation_url) {
      return NextResponse.json({ confirmationUrl: data.confirmation.confirmation_url }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Payment created, but no confirmation URL received.' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error creating Yookassa payment:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}