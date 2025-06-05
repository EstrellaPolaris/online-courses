/*/ online-courses/app/api/auth/login/route.ts
// API для аутентификации

import { NextRequest, NextResponse } from 'next/server';
import { authHelper } from '@/lib/auth';
import { jwtHelper } from '@/lib/jwt';

export const runtime = 'nodejs';

// POST: LDAP + JWT генерация
export async function POST(req: NextRequest) {
  const { username, password } = await req.json() as { username?: string; password?: string };
  
  if (!username || !password) {
    return NextResponse.json({ success: false, message: 'Отсутствуют имя пользователя или пароль' }, { status: 400 });
  }

  try {
    const authResult = await authHelper.login(username, password);
    if (authResult) {
      // ИЗМЕНЕНО: Передаем username и email в generateToken
      const token = await jwtHelper.generateToken({
        userId: authResult.userId,
        role: authResult.role,
        username: authResult.username, // Добавлено
        email: authResult.email,     // Добавлено
      });
      const response = NextResponse.json({ success: true, message: 'Login successful' }, { status: 200 });
      response.cookies.set('jwt_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      return response;
    } else {
      return NextResponse.json({ success: false, message: 'Неверные учетные данные' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ success: false, message: 'Ошибка сервера при входе' }, { status: 500 });
  }
}
*/