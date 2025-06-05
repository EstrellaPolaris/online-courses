// POST: Приглашение нового преподавателя/администратора

// online-courses/app/api/users/invite/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateRandomString } from '@/lib/utils';
import { UserRole } from '@/types'; // Import UserRole

// Приглашение преподавателя
export async function POST(req: NextRequest) {
  const { email, role } = await req.json() as { email?: string; role?: UserRole }; // Explicitly type

  if (!email || !role || (role !== 'teacher' && role !== 'admin')) {
    return NextResponse.json({ message: 'Неверные данные для приглашения' }, { status: 400 });
  }

  try {
    const inviteCode = `INVITE_${generateRandomString(16)}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 дней

    // Сохраняем код приглашения в БД
    await db.saveInviteCode(email, role, inviteCode, expiresAt);

    // В реальном приложении здесь будет отправка email с кодом приглашения
    console.log(`Приглашение отправлено на ${email} с кодом: ${inviteCode}`);

    return NextResponse.json({ success: true, message: 'Приглашение успешно отправлено', inviteCode }, { status: 200 });
  } catch (error) {
    console.error('API /users/invite error:', error);
    return NextResponse.json({ success: false, message: 'Ошибка при отправке приглашения' }, { status: 500 });
  }
}