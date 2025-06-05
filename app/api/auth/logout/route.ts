// POST: Завершение сессии (удаление JWT)

// online-courses/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';

// POST: Завершение сессии
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Выход выполнен успешно' }, { status: 200 });
  // Удаляем JWT cookie
  response.cookies.set('jwt_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0, // Немедленное истечение
    path: '/',
  });
  return response;
}