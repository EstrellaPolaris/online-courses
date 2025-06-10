// online-courses/lib/auth.ts
// Хелпер для аутентификации (Magic Link + JWT)

import { jwtHelper, TokenPayload } from './jwt';
import { db } from './db';
import { User, UserRole } from '@/types';
import nodemailer from 'nodemailer'; // <-- Импорт Nodemailer

const MAGIC_LINK_EXPIRES_IN_MINUTES = parseInt(process.env.MAGIC_LINK_EXPIRES_IN_MINUTES || '15', 10);
const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET || 'another_super_secret_for_magic_links_at_least_32_chars'; // Секрет для подписи токенов

// =========================================================
// Конфигурация Nodemailer transporter.
// Использует переменные окружения для SMTP-сервера.
// =========================================================
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: parseInt(process.env.EMAIL_SMTP_PORT || '587', 10),
  secure: process.env.EMAIL_SMTP_PORT === '465', // true для порта 465 (SSL/TLS), false для других (STARTTLS)
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASSWORD,
  },
  // Раскомментируйте следующие строки для детального логирования ошибок SMTP, если письма не приходят
  // logger: true,
  // debug: true,
});

export const authHelper = {
  // НОВЫЙ МЕТОД: Отправка Magic Link
  sendMagicLink: async (email: string): Promise<{ success: boolean; message: string }> => {
    console.log(`Auth: Attempting to send magic link to ${email}`);
    let user: User | null = await db.getUserByEmail(email);

    // Если пользователя нет, создаем его
    if (!user) {
      console.log(`Auth: User with email ${email} not found. Creating new user.`);
      // Для простоты, username будет такой же как email, роль 'student'
      // ИСПРАВЛЕНИЕ: Использование строкового литерала 'student' вместо UserRole.Student
      user = await db.createUser({
        username: email.split('@')[0],
        email: email,
        role: 'student', // <-- ИСПРАВЛЕНО: Теперь это строковый литерал
        emailVerified: false,
        platformAccessTier: 'free',
        studentSlotsAvailable: 0,
        hashedPassword: undefined,
        image: undefined,
        teacherEarnings: undefined,
      });
      if (!user) {
        console.error('Auth: Failed to create user.');
        return { success: false, message: 'Не удалось создать пользователя.' };
      }
      console.log(`Auth: New user created with ID: ${user.id}`);
    }

    const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRES_IN_MINUTES * 60 * 1000);

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      type: 'magic_link',
    };

    console.log('JWT: Generating token for payload:', tokenPayload);

    const token = jwtHelper.generateToken(tokenPayload, MAGIC_LINK_SECRET); // Используем jwtHelper.generateToken

    // Сохраняем токен в БД
    await db.createMagicLinkToken(user.id, await token, expiresAt);

    // =========================================================
    // Формирование URL Magic Link.
    // Используем NEXT_PUBLIC_SITE_URL (если задан) или VERCEL_URL.
    // =========================================================
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const magicLinkUrl = `${appUrl}/auth/magic-link?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM_ADDRESS || 'no-reply@ns-tech.es', // Используйте реальный адрес отправителя
      to: email,
      subject: 'Ваша Magic Login Link для LMS Платформы', // Более конкретная тема
      html: `
        <p>Здравствуйте!</p>
        <p>Нажмите на эту ссылку для входа в ваш аккаунт на LMS Платформе:</p>
        <p><a href="${magicLinkUrl}" style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Войти в аккаунт</a></p>
        <p>Эта ссылка действительна в течение ${MAGIC_LINK_EXPIRES_IN_MINUTES} минут. Если вы не запрашивали эту ссылку, проигнорируйте это письмо.</p>
        <p>С уважением,<br/>Команда LMS Платформы</p>
      `,
    };

    // =========================================================
    // Условие для реальной отправки email.
    // Отправляем email только если все SMTP настройки заданы.
    // =========================================================
    if (
      process.env.EMAIL_SMTP_HOST &&
      process.env.EMAIL_SMTP_USER &&
      process.env.EMAIL_SMTP_PASSWORD &&
      process.env.EMAIL_FROM_ADDRESS
    ) {
      try {
        await transporter.sendMail(mailOptions);
        console.log("Auth: Magic link email sent successfully to", email);
        return { success: true, message: 'Ссылка для входа отправлена на ваш email.' };
      } catch (emailError) {
        console.error('Auth: Error sending magic link email:', emailError);
        return { success: false, message: 'Ошибка сервера при отправке ссылки. Пожалуйста, проверьте настройки SMTP и логи Vercel.' };
      }
    } else {
      // Это режим симуляции, если переменные окружения для почты не настроены.
      console.warn("--- MAGIC LINK EMAIL SIMULATION ACTIVE ---");
      console.warn("Auth: SMTP email environment variables are not fully configured.");
      console.log("To:", mailOptions.to);
      console.log("Subject:", mailOptions.subject);
      console.log("Body (SIMULATED):", magicLinkUrl); // Выводим сам URL, а не весь HTML
      console.log(`Token expires in ${MAGIC_LINK_EXPIRES_IN_MINUTES} minutes.`);
      return { success: true, message: 'Ссылка для входа отправлена на ваш email (симуляция).' };
    }
  },

  // НОВЫЙ МЕТОД: Верификация Magic Link токена
  verifyMagicLink: async (token: string): Promise<TokenPayload | null> => {
    console.log(`Auth: Attempting to verify magic link token`);
    try {
      // 1. Проверяем токен в БД
      const storedToken = await db.getMagicLinkToken(token);

      if (!storedToken) {
        console.warn('Auth: Magic link token not found, already used, or expired in DB.');
        return null;
      }

      // 2. Декодируем JWT из токена Magic Link, используя его специфический секрет
      const decodedMagicLinkPayload: TokenPayload & { type?: string } | null = await jwtHelper.verifyToken(token, MAGIC_LINK_SECRET);

      if (!decodedMagicLinkPayload || decodedMagicLinkPayload.type !== 'magic_link' || decodedMagicLinkPayload.userId !== storedToken.userId) {
        console.warn('Auth: Invalid magic link token payload or type mismatch.');
        await db.invalidateMagicLinkToken(storedToken.id); // Инвалидируем на всякий случай
        return null;
      }

      // 3. Инвалидируем токен в БД после использования
      await db.invalidateMagicLinkToken(storedToken.id);
      console.log(`Auth: Magic link token ${storedToken.id} successfully invalidated.`);

      // 4. Получаем актуальные данные пользователя из БД (на случай изменений роли и т.д.)
      const user = await db.getUserById(decodedMagicLinkPayload.userId);
      if (!user) {
        console.warn(`Auth: User ${decodedMagicLinkPayload.userId} not found in DB after magic link verification.`);
        return null;
      }

      // Обновляем emailVerified на true, если это первый вход
      if (!user.emailVerified) {
        await db.updateUser({ ...user, emailVerified: true });
        console.log(`Auth: User ${user.id} email verified.`);
      }

      // Возвращаем полезную нагрузку для генерации сессионного JWT
      return {
        userId: user.id,
        role: user.role,
        username: user.username,
        email: user.email,
      };

    } catch (error) {
      console.error('Auth: Error verifying magic link token:', error);
      return null;
    }
  },

  // verifyToken остается без изменений, он использует jwtHelper.verifyToken с дефолтным секретом JWT
  verifyToken: async (token: string): Promise<TokenPayload | null> => {
    const decoded = await jwtHelper.verifyToken(token); // Использует defaultSecretKey из jwt.ts
    if (decoded && typeof decoded.userId === 'string' && typeof decoded.role === 'string' && typeof decoded.username === 'string' && typeof decoded.email === 'string') {
      return { userId: decoded.userId, role: decoded.role as UserRole, username: decoded.username, email: decoded.email };
    }
    return null;
  },

  logout: async (): Promise<boolean> => {
    console.log('Auth: User session invalidated (mock)');
    return true;
  },
};
