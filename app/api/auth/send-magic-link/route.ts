// online-courses/app/api/auth/send-magic-link/route.ts
// POST: Отправка Magic Link на email

import { NextRequest, NextResponse } from 'next/server';
import { authHelper } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { email } = await req.json() as { email?: string };
  
  if (!email) {
    return NextResponse.json({ success: false, message: 'Email не указан' }, { status: 400 });
  }

  try {
    const result = await authHelper.sendMagicLink(email);
    if (result.success) {
      return NextResponse.json({ success: true, message: result.message }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, message: result.message }, { status: 500 });
    }
  } catch (error) {
    console.error('API /auth/send-magic-link error:', error);
    return NextResponse.json({ success: false, message: 'Ошибка сервера при отправке ссылки' }, { status: 500 });
  }
}
