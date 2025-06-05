// online-courses/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtHelper } from './lib/jwt';
// ИЗМЕНЕНО: Удалены импорты abac и ABACResourceType
// import { abac } from './lib/abac';
// import { ABACResourceType } from './types';
import { UserRole, User } from './types'; // Добавлен импорт User для типизации
import { TokenPayload } from './lib/jwt';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('jwt_token')?.value;

  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/pricing',
    '/api/auth/send-magic-link',
    '/api/auth/verify-magic-link',
    '/api/auth/logout',
    '/auth/magic-link',
    '/dashboard/unauthorized',
    '/dashboard/error',
  ];

  const requestPath = request.nextUrl.pathname;

  // 1. Проверка публичных путей и внутренних путей Next.js
  if (
    publicPaths.includes(requestPath) ||
    requestPath.startsWith('/_next') ||
    requestPath.startsWith('/favicon.ico') ||
    requestPath.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  // 2. Проверка токена
  if (!token) {
    console.log(`Middleware: No token found for "${requestPath}". Redirecting to /login.`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const decodedToken: TokenPayload | null = await jwtHelper.verifyToken(token);

  if (!decodedToken) {
    console.log(`Middleware: Invalid token for "${requestPath}". Redirecting to /login.`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Получаем данные пользователя из токена
  const user: User = { // Типизируем user
    id: decodedToken.userId,
    role: decodedToken.role as UserRole,
    username: decodedToken.username,
    email: decodedToken.email,
    emailVerified: true, // Предполагаем true, так как токен валиден
    createdAt: new Date(), // Заглушка, если нет в токене
    updatedAt: new Date(), // Заглушка, если нет в токене
  };

  // --- 3. Специальная обработка для корневого /dashboard ---
  if (requestPath === '/dashboard') {
    let redirectPath = '/dashboard/unauthorized';
    switch (user.role) { // Используем user.role
      case 'student':
        redirectPath = '/dashboard/student';
        break;
      case 'teacher':
        redirectPath = '/dashboard/teacher';
        break;
      case 'admin':
        redirectPath = '/dashboard/admin';
        break;
      default:
        console.warn(`Middleware: Unrecognized user role: ${user.role}. Redirecting to /dashboard/unauthorized.`);
        break;
    }
    console.log(`Middleware: Root /dashboard accessed. Redirecting ${user.role} to: ${redirectPath}`);
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // --- 4. Прямая логика авторизации (заменяет OPA) ---
  let hasAccess = false;

  // Логика для дашбордов
  if (requestPath.startsWith('/dashboard')) {
    if (requestPath === '/dashboard/unauthorized' || requestPath === '/dashboard/error') {
      hasAccess = true; // Разрешаем доступ к этим страницам для всех аутентифицированных
    } else if (user.role === 'admin' && requestPath.startsWith('/dashboard/admin')) {
      hasAccess = true;
    } else if (user.role === 'teacher' && requestPath.startsWith('/dashboard/teacher')) {
      hasAccess = true;
    } else if (user.role === 'student' && requestPath.startsWith('/dashboard/student')) {
      hasAccess = true;
    }
  }
  // Логика для API-маршрутов
  else if (requestPath.startsWith('/api')) {
    const method = request.method;

    if (requestPath === '/api/auth/me' && method === 'GET') {
      hasAccess = true; // /api/auth/me доступен всем аутентифицированным
    } else if (requestPath === '/api/courses' && method === 'GET') {
      hasAccess = true; // Все аутентифицированные могут просматривать курсы
    } else if (requestPath.startsWith('/api/courses') && method === 'POST' && user.role === 'teacher') {
      hasAccess = true; // Преподаватели могут создавать курсы
    } else if (requestPath.startsWith('/api/users/roles') && method === 'POST' && user.role === 'admin') {
      hasAccess = true; // Администраторы могут управлять ролями
    } else if (requestPath.startsWith('/api/ai/recommendations') && method === 'GET' && user.role === 'student') {
      hasAccess = true; // Студенты могут получать рекомендации ИИ
    } else if (requestPath.startsWith('/api/payment/') && method === 'POST') {
      hasAccess = true; // Платежные API доступны всем аутентифицированным
    } else if (requestPath === '/api/payment/webhook' && method === 'POST') {
      hasAccess = true; // Webhook ЮKassa доступен для POST-запросов (без авторизации)
    } else if (requestPath.startsWith('/api/subscription/status') && method === 'GET') {
      hasAccess = true; // Статус подписки доступен всем аутентифицированным
    } else if (requestPath.startsWith('/api/users/invite') && method === 'POST' && user.role === 'admin') {
      hasAccess = true; // Приглашения только для админов
    }
    // Добавьте здесь другую логику для API-маршрутов
  }
  // Логика для других защищенных UI-маршрутов (например, /protected)
  else if (requestPath.startsWith('/protected')) {
    // Пример: только админы могут видеть /protected/admin-page
    if (requestPath === '/protected/admin-page' && user.role === 'admin') {
      hasAccess = true;
    } else if (requestPath === '/protected/student-page' && user.role === 'student') {
      hasAccess = true;
    } else if (requestPath === '/protected/all-users-page' && user.id) {
        hasAccess = true; // Пример: страница для всех аутентифицированных
    }
  }
  // Если ни одно из явных правил не сработало, доступ остается запрещенным (hasAccess = false)

  if (!hasAccess) {
    console.warn(`Middleware: Access denied for user ${user.id} (${user.role}) to ${request.method} ${requestPath}`);
    if (requestPath.startsWith('/api')) {
      return NextResponse.json({ message: 'Доступ запрещен' }, { status: 403 });
    } else {
      return NextResponse.redirect(new URL('/dashboard/unauthorized', request.url));
    }
  }

  // Если все проверки пройдены, разрешаем запрос.
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Next.js middleware перехватывает все запросы, кроме перечисленных здесь
    '/((?!api/auth/send-magic-link|api/auth/verify-magic-link|api/auth/logout|login|register|pricing|auth/magic-link|_next/static|_next/image|favicon.ico).*)',
  ],
};
