// online-courses/lib/jwt.ts
import { SignJWT, jwtVerify } from 'jose';

// Минимально допустимая длина секрета для HS256 — 32 байта
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_that_is_at_least_32_characters_long';
const JWT_EXPIRES_IN = 60 * 60; // 1 час (в секундах)

const encoder = new TextEncoder();
const defaultSecretKey = encoder.encode(JWT_SECRET); // Дефолтный секретный ключ

export type TokenPayload = {
  userId: string;
  role: string;
  username: string;
  email: string;
  type?: string; // НОВОЕ: Добавлено для индикации типа токена (например, 'magic_link')
};

export const jwtHelper = {
  // ИЗМЕНЕНО: Добавлен опциональный параметр secretOverride
  generateToken: async (payload: TokenPayload, secretOverride?: string): Promise<string> => {
    console.log('JWT: Generating token for payload:', payload);
    // Используем переданный секрет или дефолтный
    const usedSecretKey = secretOverride ? encoder.encode(secretOverride) : defaultSecretKey;

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${JWT_EXPIRES_IN}s`)
      .sign(usedSecretKey); // Используем выбранный секретный ключ

    return token;
  },

  // ИЗМЕНЕНО: Добавлен опциональный параметр secretOverride
  verifyToken: async (token: string, secretOverride?: string): Promise<TokenPayload | null> => {
    try {
      console.log('JWT: Verifying token with jose');
      // Используем переданный секрет или дефолтный
      const usedSecretKey = secretOverride ? encoder.encode(secretOverride) : defaultSecretKey;
      const { payload } = await jwtVerify(token, usedSecretKey); // Используем выбранный секретный ключ

      if (
        typeof payload === 'object' &&
        'userId' in payload &&
        'role' in payload &&
        'username' in payload &&
        'email' in payload
      ) {
        return payload as TokenPayload;
      }

      return null;
    } catch (error) {
      console.error('JWT: Token verification failed:', (error as Error).message);
      return null;
    }
  },
};
