// online-courses/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtHelper } from '@/lib/jwt';
import { User, UserRole } from '@/types'; // Импортируем UserRole
import { TokenPayload } from '@/lib/jwt'; // Импортируем TokenPayload для явного типизирования

// GET: Текущий пользователь
export async function GET(req: NextRequest) {
  const token = req.cookies.get('jwt_token')?.value;
  console.log('Token from cookie:', token);
  if (!token) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }

  try {
    const decoded: TokenPayload | null = await jwtHelper.verifyToken(token);
    
    // ИЗМЕНЕНО: Добавлена проверка на username и email
    if (
      !decoded ||
      typeof decoded.userId !== 'string' ||
      typeof decoded.role !== 'string' ||
      typeof decoded.username !== 'string' || // НОВОЕ: Проверка username
      typeof decoded.email !== 'string'       // НОВОЕ: Проверка email
    ) {
      return NextResponse.json({ message: 'Недействительный токен или некорректные данные' }, { status: 401 });
    }

    // В реальном приложении здесь будет запрос к БД для получения полных данных пользователя
    // const user = await db.getUserById(decoded.userId);
    const mockUser: User = {
      id: decoded.userId,
      username: decoded.username, // ИЗМЕНЕНО: Используем username из токена
      email: decoded.email,       // ИЗМЕНЕНО: Используем email из токена
      role: decoded.role as UserRole,
      emailVerified: true,
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date(),
    };

    return NextResponse.json(mockUser, { status: 200 });
  } catch (error) {
    console.error('API /auth/me error:', error);
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
  }
}
