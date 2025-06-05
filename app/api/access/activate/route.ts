// online-courses/app/api/access/activate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Предполагаем, что клиент БД доступен
import { AccessToken } from '@/types'; // Предполагаем, что типы корректно определены

export async function GET(req: NextRequest) {
  const tokenString = req.nextUrl.searchParams.get('token');

  if (!tokenString) {
    return NextResponse.json({ message: 'Activation token is missing.' }, { status: 400 });
  }

  try {
    const accessToken: AccessToken | null = await db.getAccessTokenByTokenString(tokenString);

    if (!accessToken) {
      return NextResponse.json({ message: 'Invalid or expired activation link.' }, { status: 404 });
    }

    // Проверяем, использован ли токен или истек ли его срок действия
    if (accessToken.status !== 'pending') {
      let message = 'This activation link has already been used or is expired.';
      if (accessToken.status === 'active') { // <-- ИЗМЕНЕНО: 'activated' на 'active'
        message = 'This link has already been activated.';
      } else if (accessToken.status === 'expired') {
        message = 'This link has expired.';
      } else if (accessToken.status === 'revoked') {
        message = 'This link has been revoked.';
      }
      return NextResponse.json({ message }, { status: 409 }); // 409 Conflict
    }

    // Проверяем, истек ли срок действия токена на основе expiresAt (если установлен)
    if (accessToken.expiresAt && new Date() > accessToken.expiresAt) {
      // Обновляем статус токена на expired в БД
      await db.updateAccessToken({ ...accessToken, status: 'expired' });
      return NextResponse.json({ message: 'This activation link has expired.' }, { status: 409 });
    }

    // Активируем токен
    const updatedToken = await db.updateAccessToken({
      ...accessToken,
      status: 'active', // <-- ИЗМЕНЕНО: 'activated' на 'active'
      activatedAt: new Date(),
    });

    // Выполняем действия в зависимости от entityType (например, предоставляем доступ к курсу, добавляем слоты для студентов)
    if (updatedToken.entityType === 'course_access') {
      // Предполагаем, что entityId - это ID курса
      await db.addCourseToStudent(updatedToken.userId, updatedToken.entityId);
      return NextResponse.json({ success: true, message: 'Course access granted successfully!' }, { status: 200 });
    } else if (updatedToken.entityType === 'platform_tier_access') {
      // Предполагаем, что accessDetails содержит studentSlots
      const studentSlots = updatedToken.accessDetails?.studentSlots || 0;
      await db.addStudentSlotsToTeacher(updatedToken.userId, studentSlots);
      return NextResponse.json({ success: true, message: 'Platform access granted successfully!' }, { status: 200 });
    } else {
      return NextResponse.json({ success: true, message: 'Token activated, but no specific action defined.' }, { status: 200 });
    }

  } catch (error) {
    console.error('Access token activation error:', error);
    return NextResponse.json({ message: 'An error occurred during activation.' }, { status: 500 });
  }
}
