// online-courses/app/api/yookassa/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { YookassaWebhookNotification, CreateAccessTokenData } from '@/types';
import { db } from '@/lib/db';
import crypto from 'crypto';

const YOOKASSA_WEBHOOK_SECRET = process.env.YOOKASSA_WEBHOOK_SECRET;
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL;

// Вспомогательная функция для проверки подписи вебхука
function verifyYookassaSignature(body: string, signatureHeader: string, secret: string): boolean {
  if (!signatureHeader || !secret) {
    console.warn('Webhook: Missing signature header or secret for verification.');
    return false;
  }
  const [algo, hash] = signatureHeader.split('=');
  const expectedHash = crypto.createHmac(algo, secret)
    .update(body)
    .digest('hex');
  return expectedHash === hash;
}

// РЕАЛИЗАЦИЯ: Функция для отправки email через внешний API
// Вам нужно будет заменить URL и API-ключ на данные вашего сервиса рассылки (например, SendGrid, Mailgun)
async function sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
  console.log(`--- SENDING EMAIL VIA API ---`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  // console.log(`Content: ${htmlContent}`); // Закомментировано для краткости логов
  console.log(`-----------------------------`);

  try {
    const response = await fetch('https://api.emailservice.com/send', { // ЗАМЕНИТЕ НА РЕАЛЬНЫЙ URL ВАШЕГО СЕРВИСА
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer YOUR_EMAIL_SERVICE_API_KEY` // ЗАМЕНИТЕ НА ВАШ РЕАЛЬНЫЙ API-КЛЮЧ
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: 'no-reply@your-platform.com' }, // ЗАМЕНИТЕ НА ВАШ АДРЕС ОТПРАВИТЕЛЯ
        subject: subject,
        content: [{ type: 'text/html', value: htmlContent }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to send email. Status: ${response.status}, Response: ${errorText}`);
      throw new Error(`Email sending failed: ${response.statusText}`);
    }

    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    // В реальном приложении здесь можно добавить логику для повторной попытки или уведомления администратора
  }
}

export async function POST(req: NextRequest) {
  if (!YOOKASSA_WEBHOOK_SECRET || !NEXT_PUBLIC_APP_URL) {
    console.error('Missing Yookassa webhook secret or app URL environment variable.');
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  const rawBody = await req.text(); // Получаем сырое тело запроса для проверки подписи
  const signature = req.headers.get('YooKassa-Signature');

  // Проверка подписи вебхука
  if (!verifyYookassaSignature(rawBody, signature || '', YOOKASSA_WEBHOOK_SECRET)) {
    console.warn('Webhook: Invalid Yookassa signature.');
    return NextResponse.json({ message: 'Invalid signature' }, { status: 403 });
  }

  let notification: YookassaWebhookNotification;
  try {
    notification = JSON.parse(rawBody);
  } catch (error) {
    console.error('Webhook: Error parsing JSON body:', error);
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  console.log('Received Yookassa webhook:', JSON.stringify(notification, null, 2));

  // Обработка только успешных платежей
  if (notification.event === 'payment.succeeded' && notification.object.status === 'succeeded') {
    const paymentId = notification.object.id;
    const { userId, courseId, scenario, teacherId, platformAccessTier, studentEmail, courseTitle } = notification.object.metadata || {};

    if (!userId || !scenario) {
      console.error('Webhook: Missing essential metadata in successful payment:', notification.object.metadata);
      return NextResponse.json({ message: 'Missing metadata' }, { status: 400 });
    }

    try {
      let accessToken;
      const user = await db.getUserById(userId);
      if (!user) {
        console.error(`Webhook: User ${userId} not found.`);
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      let emailSubject = '';
      let emailContent = '';
      let redirectPath = '';

      switch (scenario) {
        case 'student_buys_my_course':
          if (!courseId) {
            console.error('Webhook: Missing courseId for student_buys_my_course scenario.');
            return NextResponse.json({ message: 'Missing courseId' }, { status: 400 });
          }
          await db.addCourseToStudent(userId, courseId);
          accessToken = await db.createAccessToken({
            userId,
            entityType: 'course_access',
            entityId: courseId,
            yookassaPaymentId: paymentId,
            accessDetails: { type: 'lifetime' }
          } as CreateAccessTokenData);

          emailSubject = `Поздравляем с покупкой курса "${courseTitle || 'Ваш курс'}"!`;
          emailContent = `<p>Уважаемый ${user.username},</p>
                          <p>Спасибо за покупку курса "${courseTitle || 'Ваш курс'}" на нашей платформе!</p>
                          <p>Вы получили пожизненный доступ к материалам курса.</p>
                          <p>Для доступа к курсу, пожалуйста, перейдите в свой личный кабинет: <a href="${NEXT_PUBLIC_APP_URL}/dashboard/student/courses">${NEXT_PUBLIC_APP_URL}/dashboard/student/courses</a></p>
                          <p>С уважением,<br>Команда LMS</p>`;
          redirectPath = '/dashboard/student/courses';
          break;

        case 'teacher_buys_platform_access':
          if (!platformAccessTier) {
            console.error('Webhook: Missing platformAccessTier for teacher_buys_platform_access scenario.');
            return NextResponse.json({ message: 'Missing platformAccessTier' }, { status: 400 });
          }
          let slotsToAdd = 0;
          switch (platformAccessTier) {
            case 'basic': slotsToAdd = 10; break;
            case 'pro': slotsToAdd = 50; break;
            case 'enterprise': slotsToAdd = 1000; break;
            default: break;
          }
          await db.addStudentSlotsToTeacher(userId, slotsToAdd);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          user.platformAccessTier = platformAccessTier as any;
          user.studentSlotsAvailable = (user.studentSlotsAvailable || 0) + slotsToAdd;
          await db.updateUser(user);

          accessToken = await db.createAccessToken({
            userId,
            entityType: 'platform_tier_access',
            entityId: platformAccessTier,
            yookassaPaymentId: paymentId,
            accessDetails: { studentSlots: slotsToAdd }
          } as CreateAccessTokenData);

          emailSubject = `Ваш доступ к платформе "${platformAccessTier}" успешно активирован!`;
          emailContent = `<p>Уважаемый ${user.username},</p>
                          <p>Поздравляем! Ваш тариф "${platformAccessTier}" на платформе успешно активирован.</p>
                          <p>Вам добавлено ${slotsToAdd} слотов для студентов.</p>
                          <p>Вы можете начать создавать и продавать свои курсы. Перейдите в свой личный кабинет преподавателя: <a href="${NEXT_PUBLIC_APP_URL}/dashboard/teacher/materials">${NEXT_PUBLIC_APP_URL}/dashboard/teacher/materials</a></p>
                          <p>С уважением,<br>Команда LMS</p>`;
          redirectPath = '/dashboard/teacher/materials';
          break;

        case 'student_buys_teacher_course_split':
          if (!courseId || !teacherId) {
            console.error('Webhook: Missing courseId or teacherId for split payment scenario.');
            return NextResponse.json({ message: 'Missing courseId or teacherId' }, { status: 400 });
          }
          await db.addCourseToStudent(userId, courseId);
          accessToken = await db.createAccessToken({
            userId,
            entityType: 'course_access',
            entityId: courseId,
            yookassaPaymentId: paymentId,
            accessDetails: { type: 'lifetime' }
          } as CreateAccessTokenData);

          emailSubject = `Поздравляем с покупкой курса "${courseTitle || 'Ваш курс'}"!`;
          emailContent = `<p>Уважаемый ${user.username},</p>
                          <p>Спасибо за покупку курса "${courseTitle || 'Ваш курс'}" на нашей платформе!</p>
                          <p>Вы получили пожизненный доступ к материалам курса.</p>
                          <p>Для доступа к курсу, пожалуйста, перейдите в свой личный кабинет: <a href="${NEXT_PUBLIC_APP_URL}/dashboard/student/courses">${NEXT_PUBLIC_APP_URL}/dashboard/student/courses</a></p>
                          <p>С уважением,<br>Команда LMS</p>`;
          redirectPath = '/dashboard/student/courses';
          // Здесь также можно добавить логику для отслеживания заработка преподавателя
          break;

        default:
          console.warn('Webhook: Unknown scenario:', scenario);
          return NextResponse.json({ message: 'Unknown scenario' }, { status: 400 });
      }

      // После успешной обработки, можно отправить email пользователю с ссылкой на активацию
      if (accessToken && studentEmail) {
        const activationLink = `${NEXT_PUBLIC_APP_URL}/api/access/activate?token=${accessToken.token}`;
        console.log(`Webhook: Access granted for user ${userId}. Activation link: ${activationLink}`);
        console.log(`Webhook: User should be redirected to ${redirectPath}`);
        
        // Отправка email с информацией о покупке и ссылкой на активацию/дашборд
        await sendEmail(studentEmail, emailSubject, emailContent + `<p>Вы будете перенаправлены на: <a href="${NEXT_PUBLIC_APP_URL}${redirectPath}">${NEXT_PUBLIC_APP_URL}${redirectPath}</a></p>`);
      }


      return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });

    } catch (error) {
      console.error('Webhook: Error processing payment success:', error);
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  } else if (notification.event === 'payment.canceled' || notification.object.status === 'canceled') {
    console.log(`Webhook: Payment ${notification.object.id} was canceled.`);
    return NextResponse.json({ message: 'Payment canceled' }, { status: 200 });
  }

  // Для других типов уведомлений, которые не интересны в данном примере
  return NextResponse.json({ message: 'Notification type not handled' }, { status: 200 });
}
