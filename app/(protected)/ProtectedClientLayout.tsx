// app/(protected)/ProtectedClientLayout.tsx
'use client';

import React from 'react';
import { UserContext } from '@/context/UserContext';
import Link from 'next/link';
import { User } from '@/types'; // Импортируем тип User

export default function ProtectedClientLayout({
  user,
  children,
}: {
  user: User; // User теперь гарантированно не null, т.к. редирект происходит в серверном layout
  children: React.ReactNode;
}) {
  return (
    <UserContext.Provider value={user}>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-gray-800 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/dashboard" className="text-2xl font-bold">
              Панель Управления
            </Link>
            <nav className="space-x-4">
              {/* Рендеринг ссылок на основе роли пользователя */}
              {user.role === 'student' && (
                <>
                  <Link href="/dashboard/student/courses" className="hover:text-gray-300">
                    Мои Курсы
                  </Link>
                  <Link href="/dashboard/student/tests" className="hover:text-gray-300">
                    Тесты
                  </Link>
                </>
              )}
              {user.role === 'teacher' && (
                <>
                  <Link href="/dashboard/teacher/materials" className="hover:text-gray-300">
                    Материалы
                  </Link>
                  <Link href="/dashboard/teacher/students" className="hover:text-gray-300">
                    Студенты
                  </Link>
                </>
              )}
              {user.role === 'admin' && (
                <>
                  <Link href="/dashboard/admin/roles" className="hover:text-gray-300">
                    Роли
                  </Link>
                  <Link href="/dashboard/admin/audit" className="hover:text-gray-300">
                    Аудит
                  </Link>
                </>
              )}
              <form action="/api/auth/logout" method="POST" className="inline">
                <button
                  type="submit"
                  className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-300"
                >
                  Выйти
                </button>
              </form>
            </nav>
          </div>
        </header>
        <main className="container mx-auto p-6">{children}</main>
      </div>
    </UserContext.Provider>
  );
}
