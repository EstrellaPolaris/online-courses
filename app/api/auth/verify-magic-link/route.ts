// online-courses/app/api/auth/verify-magic-link/route.ts
// GET: Верификация Magic Link токена и выдача JWT

import { NextRequest, NextResponse } from 'next/server';
import { authHelper } from '@/lib/auth';
import { jwtHelper } from '@/lib/jwt';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ success: false, message: 'Токен отсутствует' }, { status: 400 });
  }

  try {
    const authResult = await authHelper.verifyMagicLink(token);

    if (authResult) {
      // Генерируем сессионный JWT (с более длительным сроком действия)
      const sessionToken = await jwtHelper.generateToken(authResult);
      
      const response = NextResponse.json({ success: true, message: 'Вход выполнен успешно' }, { status: 200 });
      // Устанавливаем JWT в httpOnly cookie для безопасности
      response.cookies.set('jwt_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 неделя
        path: '/',
      });
      return response;
    } else {
      return NextResponse.json({ success: false, message: 'Недействительный или истекший токен' }, { status: 401 });
    }
  } catch (error) {
    console.error('API /auth/verify-magic-link error:', error);
    return NextResponse.json({ success: false, message: 'Ошибка сервера при верификации токена' }, { status: 500 });
  }
}
