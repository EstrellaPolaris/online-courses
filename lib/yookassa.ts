// online-courses/lib/yookassa.ts
// Клиент для взаимодействия с API ЮKassa
// В реальном приложении здесь используется HTTP-клиент с корректной авторизацией.
import { YookassaPaymentResponse, YookassaWebhookPayload, YookassaAmount, YookassaConfirmation } from '@/types';
import crypto from 'crypto';
const YOOKASSA_API_URL = 'https://api.yookassa.ru/v3/payments';
const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID || 'your_yookassa_shop_id'; // ОБЯЗАТЕЛЬНО УКАЖИТЕ ВАШ shop_id
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY || 'your_yookassa_secret_key'; // ОБЯЗАТЕЛЬНО УКАЖИТЕ ВАШ secret_key
const YOOKASSA_WEBHOOK_SECRET = process.env.YOOKASSA_WEBHOOK_SECRET || 'your_yookassa_webhook_secret';

export const YookassaClient = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createPayment: async (paymentData: { amount: YookassaAmount; confirmation: YookassaConfirmation; description: string; metadata: { [key: string]: any }; capture: boolean }): Promise<YookassaPaymentResponse | null> => {
    console.log('Yookassa: Создание платежа (реальный API)');

    if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
      console.error('Ошибка конфигурации: YOOKASSA_SHOP_ID или YOOKASSA_SECRET_KEY не установлены.');
      throw new Error('Yookassa API keys are not configured.');
    }

    const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');
    
    try {
      const response = await fetch(YOOKASSA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
          'Idempotence-Key': `payment_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`, // Уникальный ключ идемпотентности
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ошибка API ЮKassa при создании платежа:', response.status, errorText);
        throw new Error(`Не удалось создать платеж ЮKassa: ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Ошибка при запросе к API ЮKassa для создания платежа:', error);
      return null; // Или перебросить ошибку, в зависимости от вашей логики обработки
    }
  },

  getPaymentStatus: async (paymentId: string): Promise<YookassaPaymentResponse | null> => {
    console.log(`Yookassa: Получение статуса платежа ${paymentId} (реальный API)`);

    if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
      console.error('Ошибка конфигурации: YOOKASSA_SHOP_ID или YOOKASSA_SECRET_KEY не установлены.');
      throw new Error('Yookassa API keys are not configured.');
    }

    const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');
    
    try {
      const response = await fetch(`${YOOKASSA_API_URL}/${paymentId}`, {
        headers: { 'Authorization': `Basic ${auth}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ошибка API ЮKassa при получении статуса платежа:', response.status, errorText);
        throw new Error(`Не удалось получить статус платежа ЮKassa: ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Ошибка при запросе к API ЮKassa для получения статуса платежа:', error);
      return null; // Или перебросить ошибку
    }
  },

  verifyWebhook: (payload: YookassaWebhookPayload, signature: string): boolean => {
    console.log('Yookassa: Верификация подписи вебхука (реальная)');
    // В реальном приложении здесь будет реальная верификация подписи
    // с использованием YOOKASSA_WEBHOOK_SECRET и алгоритма HMAC-SHA256.
    // Пример: https://yookassa.ru/developers/payments/webhooks/notification-security
    
    if (!YOOKASSA_WEBHOOK_SECRET) {
      console.error('Ошибка конфигурации: YOOKASSA_WEBHOOK_SECRET не установлен.');
      return false;
    }

    const hmac = crypto.createHmac('sha256', YOOKASSA_WEBHOOK_SECRET);
    // ЮКасса ожидает, что в HMAC участвует необработанное JSON-тело уведомления.
    // Если payload уже объект, его нужно обратно преобразовать в строку JSON.
    const payloadString = JSON.stringify(payload); 
    hmac.update(payloadString);
    const expectedSignature = hmac.digest('hex');

    const isValid = expectedSignature === signature;
    if (!isValid) {
      console.warn('Ошибка верификации вебхука ЮKassa: Неверная подпись!');
    }
    return isValid;
  },
};