// POST: Выдача/проверка ролей пользователей (только для админа)

// online-courses/app/api/users/roles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@/types';

// Выдача/проверка ролей
export async function POST(req: NextRequest) {
  const { userId, newRole } = await req.json() as { userId?: string; newRole?: UserRole }; // Explicitly type

  if (!userId || !newRole || !['student', 'teacher', 'admin'].includes(newRole)) {
    return NextResponse.json({ message: 'Неверные данные для обновления роли' }, { status: 400 });
  }

  try {
    await db.updateUserRole(userId, newRole);
    return NextResponse.json({ success: true, message: `Роль пользователя ${userId} обновлена на ${newRole}` }, { status: 200 });
  } catch (error) {
    console.error('API /users/roles error:', error);
    return NextResponse.json({ success: false, message: 'Ошибка при обновлении роли' }, { status: 500 });
  }
}