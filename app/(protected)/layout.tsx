// online-courses/app/(protected)/layout.tsx
// Этот Layout будет использоваться для всех страниц в группе маршрутов (protected)

import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtHelper } from '@/lib/jwt';
// ИЗМЕНЕНО: Удален импорт UserRole, так как user больше не объявляется здесь явно
// import { UserRole } from '@/types';
import { TokenPayload } from '@/lib/jwt'; // Добавлен импорт TokenPayload для явной типизации decodedToken

// ЭТОТ КОМПОНЕНТ ДОЛЖЕН БЫТЬ SERVER COMPONENT по умолчанию,
// если не указано 'use client'. Мы делаем его асинхронным,
// чтобы получить куки и проверить JWT.
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get('jwt_token')?.value;

  if (!token) {
    // Если нет токена, перенаправляем на страницу входа
    redirect('/login');
  }

  // ИЗМЕНЕНО: Явно типизируем decodedToken
  const decodedToken: TokenPayload | null = await jwtHelper.verifyToken(token);

  if (!decodedToken) {
    // Если токен невалиден, перенаправляем на страницу входа
    redirect('/login');
  }

  // ===========================================================================
  // ИЗМЕНЕНО: Удалено объявление переменной 'user',
  // так как она не использовалась в этом layout.tsx.
  // Логика аутентификации и перенаправления уже полагается на decodedToken.
  //
  // const user: User = {
  //   id: decodedToken.userId,
  //   role: decodedToken.role as UserRole,
  //   username: decodedToken.username,
  //   email: decodedToken.email,
  //   emailVerified: true,
  //   createdAt: new Date(),
  //   updatedAt: new Date(),
  // };
  // ===========================================================================


  // Если пользователь аутентифицирован, отображаем содержимое страницы
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Здесь можно добавить общие элементы макета для защищенных страниц,
          например, навигационную панель, боковое меню и т.д.
          Если вам нужны данные пользователя в дочерних клиентских компонентах,
          их можно передать через React Context или напрямую как пропсы. */}
      {children}
    </div>
  );
}
