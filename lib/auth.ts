// online-courses/lib/auth.ts
// Хелпер для аутентификации (Magic Link + JWT)

import { jwtHelper, TokenPayload } from './jwt';
import { db } from './db';
import { User, UserRole } from '@/types';
import nodemailer from 'nodemailer';

const MAGIC_LINK_EXPIRES_IN_MINUTES = parseInt(process.env.MAGIC_LINK_EXPIRES_IN_MINUTES || '15', 10);
const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET || 'another_super_secret_for_magic_links_at_least_32_chars'; // Секрет для подписи токенов

// =========================================================
// Конфигурация Nodemailer transporter.
// =========================================================
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: parseInt(process.env.EMAIL_SMTP_PORT || '587', 10),
  secure: process.env.EMAIL_SMTP_PORT === '465',
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASSWORD,
  },
  // Раскомментируйте следующие строки для детального логирования ошибок SMTP
  // logger: true,
  // debug: true,
});

export const authHelper = {
  sendMagicLink: async (email: string): Promise<{ success: boolean; message: string }> => {
    console.log(`Auth: Attempting to send magic link to ${email}`);
    let user: User | null = await db.getUserByEmail(email);

    if (!user) {
      console.log(`Auth: User with email ${email} not found. Creating new user.`);
      user = await db.createUser({
        username: email.split('@')[0],
        email: email,
        role: 'student', // ИСПРАВЛЕНО: Использование строкового литерала
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

    const token = jwtHelper.generateToken(tokenPayload, MAGIC_LINK_SECRET);

    // Сохраняем токен в БД
    await db.createMagicLinkToken(user.id, await token, expiresAt);

    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const magicLinkUrl = `${appUrl}/auth/magic-link?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM_ADDRESS || 'no-reply@ns-tech.es',
      to: email,
      subject: 'Ваша Magic Login Link для LMS Платформы',
      html: `
        <p>Здравствуйте!</p>
        <p>Нажмите на эту ссылку для входа в ваш аккаунт на LMS Платформе:</p>
        <p><a href="${magicLinkUrl}" style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Войти в аккаунт</a></p>
        <p>Эта ссылка действительна в течение ${MAGIC_LINK_EXPIRES_IN_MINUTES} минут. Если вы не запрашивали эту ссылку, проигнорируйте это письмо.</p>
        <p>С уважением,<br/>Команда LMS Платформы</p>
      `,
    };

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
      console.warn("--- MAGIC LINK EMAIL SIMULATION ACTIVE ---");
      console.warn("Auth: SMTP email environment variables are not fully configured.");
      console.log("To:", mailOptions.to);
      console.log("Subject:", mailOptions.subject);
      console.log("Body (SIMULATED):", magicLinkUrl);
      console.log(`Token expires in ${MAGIC_LINK_EXPIRES_IN_MINUTES} minutes.`);
      return { success: true, message: 'Ссылка для входа отправлена на ваш email (симуляция).' };
    }
  },

  verifyMagicLink: async (token: string): Promise<TokenPayload | null> => {
    console.log(`Auth: Attempting to verify magic link token: ${token.substring(0, 10)}...`);
    try {
      // 1. Проверяем токен в БД (теперь более простой запрос)
      const storedToken = await db.getMagicLinkToken(token);

      if (!storedToken) {
        console.warn('Auth: Magic link token NOT FOUND in DB for verification. It might be expired or used, or never saved.');
        return null;
      }
      console.log('Auth: Found stored token in DB:', { id: storedToken.id, userId: storedToken.userId, usedAt: storedToken.usedAt, expiresAt: storedToken.expiresAt, tokenSubstring: storedToken.token.substring(0,10) + '...' });


      // 2. Декодируем JWT из токена Magic Link, используя его специфический секрет
      const decodedMagicLinkPayload: TokenPayload & { type?: string; exp?: number } | null = await jwtHelper.verifyToken(token, MAGIC_LINK_SECRET);

      if (!decodedMagicLinkPayload) {
        console.warn('Auth: Invalid JWT payload in magic link token (decoding failed).');
        await db.invalidateMagicLinkToken(storedToken.id); // Инвалидируем на всякий случай
        return null;
      }
      console.log('Auth: Decoded JWT payload:', decodedMagicLinkPayload);

      if (decodedMagicLinkPayload.type !== 'magic_link') {
        console.warn('Auth: Decoded token is not of type "magic_link".');
        await db.invalidateMagicLinkToken(storedToken.id);
        return null;
      }

      if (decodedMagicLinkPayload.userId !== storedToken.userId) {
        console.warn('Auth: User ID mismatch between decoded token and stored token.');
        await db.invalidateMagicLinkToken(storedToken.id);
        return null;
      }

      // Дополнительные проверки состояния токена после успешного декодирования
      if (storedToken.usedAt) {
        console.warn('Auth: Magic link token already USED (usedAt is set).');
        return null;
      }

      if (storedToken.expiresAt && new Date() > storedToken.expiresAt) {
        console.warn('Auth: Magic link token has EXPIRED (based on DB expiresAt).');
        await db.invalidateMagicLinkToken(storedToken.id); // Инвалидируем
        return null;
      }

      // JWT exp (expiration) - это Unix timestamp в секундах, поэтому умножаем на 1000 для миллисекунд
      if (decodedMagicLinkPayload.exp && decodedMagicLinkPayload.exp * 1000 < Date.now()) {
        console.warn('Auth: Magic link token has EXPIRED (based on JWT exp claim).');
        await db.invalidateMagicLinkToken(storedToken.id); // Инвалидируем
        return null;
      }


      // 3. Инвалидируем токен в БД после успешного использования и всех проверок
      await db.invalidateMagicLinkToken(storedToken.id);
      console.log(`Auth: Magic link token ${storedToken.id} successfully invalidated.`);

      // 4. Получаем актуальные данные пользователя из БД
      const user = await db.getUserById(decodedMagicLinkPayload.userId);
      if (!user) {
        console.warn(`Auth: User ${decodedMagicLinkPayload.userId} not found in DB after magic link verification.`);
        return null;
      }

      if (!user.emailVerified) {
        await db.updateUser({ ...user, emailVerified: true });
        console.log(`Auth: User ${user.id} email verified.`);
      }

      return {
        userId: user.id,
        role: user.role,
        username: user.username,
        email: user.email,
      };

    } catch (error) {
      console.error('Auth: Error verifying magic link token:', error);
      // Дополнительная отладка ошибок JWT
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        console.error('Auth: JWT verification failed: TokenExpiredError (token was expired)');
      } else if (error instanceof Error && error.name === 'JsonWebTokenError') {
        console.error('Auth: JWT verification failed: JsonWebTokenError (e.g., invalid signature, malformed token)');
      } else {
        console.error('Auth: JWT verification failed for unknown reason:', error);
      }
      return null;
    }
  },

  verifyToken: async (token: string): Promise<TokenPayload | null> => {
    const decoded = await jwtHelper.verifyToken(token);
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
