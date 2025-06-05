//  API для управления подписками
// GET: Проверка статуса и продление подписки пользователя

// online-courses/app/api/subscription/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Subscription } from '@/types';

// Проверка и продление подписки
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ message: 'Отсутствует ID пользователя' }, { status: 400 });
  }

  try {
    const subscription: Subscription | null = await db.getUserSubscription(userId);

    if (subscription && subscription.isActive && subscription.endDate > new Date()) {
      return NextResponse.json({ success: true, isActive: true, endDate: subscription.endDate.toISOString() }, { status: 200 });
    } else {
      return NextResponse.json({ success: true, isActive: false, message: 'Подписка не активна или истекла' }, { status: 200 });
    }
  } catch (error) {
    console.error('API /subscription/status error:', error);
    return NextResponse.json({ success: false, message: 'Ошибка сервера при проверке подписки' }, { status: 500 });
  }
}