// online-courses/lib/auth.ts
// Хелпер для аутентификации (Magic Link + JWT)

import { jwtHelper, TokenPayload } from './jwt';
import { db } from './db';
import { User, UserRole } from '@/types'; // User и UserRole теперь явно используются

const MAGIC_LINK_EXPIRES_IN_MINUTES = parseInt(process.env.MAGIC_LINK_EXPIRES_IN_MINUTES || '15');
const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET || 'another_super_secret_for_magic_links_at_least_32_chars'; // Секрет для подписи токенов

export const authHelper = {
  // НОВЫЙ МЕТОД: Отправка Magic Link
  sendMagicLink: async (email: string): Promise<{ success: boolean; message: string }> => {
    console.log(`Auth: Attempting to send magic link to ${email}`);
    // ИЗМЕНЕНО: Явно типизируем user как User | null
    let user: User | null = await db.getUserByEmail(email);

    // Если пользователя нет, создаем его (можно настроить, чтобы требовать регистрацию)
    if (!user) {
      console.log(`Auth: User with email ${email} not found. Creating new user.`);
      // Для простоты, username будет такой же как email, роль 'student'
      user = await db.createUser({
        username: email.split('@')[0], // Простой username из email
        email: email,
        role: 'student',
        emailVerified: false, // Пока не подтверждено по ссылке
        platformAccessTier: 'free',
        studentSlotsAvailable: 0,
      });
      if (!user) {
        return { success: false, message: 'Не удалось создать пользователя.' };
      }
      console.log(`Auth: New user created with ID: ${user.id}`);
    }

    const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRES_IN_MINUTES * 60 * 1000);
    // Генерируем одноразовый токен для Magic Link (можно использовать JWT или простой UUID)
    // Для безопасности, лучше использовать JWT для токена, который будет храниться в БД
    // ИЗМЕНЕНО: Передаем MAGIC_LINK_SECRET
    const magicToken = await jwtHelper.generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      type: 'magic_link', // Индикация типа токена
    }, MAGIC_LINK_SECRET); // <--- ПЕРЕДАЕМ MAGIC_LINK_SECRET

    // Сохраняем токен в БД
    await db.createMagicLinkToken(user.id, magicToken, expiresAt);

    // В реальном приложении здесь будет отправка email
    const magicLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/magic-link?token=${magicToken}`;
    console.log(`\n--- MAGIC LINK EMAIL SIMULATION ---`);
    console.log(`To: ${email}`);
    console.log(`Subject: Your Magic Login Link`);
    console.log(`Body: Click this link to log in: ${magicLinkUrl}`);
    console.log(`Token expires in ${MAGIC_LINK_EXPIRES_IN_MINUTES} minutes.`);
    console.log(`-----------------------------------\n`);

    return { success: true, message: 'Ссылка для входа отправлена на ваш email.' };
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
      // ИЗМЕНЕНО: Передаем MAGIC_LINK_SECRET для верификации
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
