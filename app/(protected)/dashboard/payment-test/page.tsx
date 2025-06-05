/* eslint-disable @typescript-eslint/no-explicit-any */
// online-courses/app/(protected)/dashboard/payment-test/page.tsx
'use client';

import React, { useState } from 'react';
import { useUser } from '@/context/UserContext'; // Предполагаем, что useUser работает
import { useRouter } from 'next/navigation';

// Добавьте эту страницу в ваш protected layout, например, через Link:
// <Link href="/dashboard/payment-test" className="hover:text-gray-300">Тест Оплаты</Link>

export default function PaymentTestPage() {
  const user = useUser(); // Получаем текущего пользователя из контекста
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!user) {
    return <p>Загрузка данных пользователя...</p>; // Или перенаправление, если пользователь не аутентифицирован
  }

  const handlePayment = async (
    scenario: 'student_buys_my_course' | 'teacher_buys_platform_access' | 'student_buys_teacher_course_split',
    amount: number,
    description: string,
    options?: { courseId?: string; teacherId?: string; platformAccessTier?: string }
  ) => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/yookassa/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description,
          userId: user.id,
          scenario,
          ...options,
        }),
      });

      const data = await response.json();
      if (response.ok && data.confirmationUrl) {
        setMessage('Платеж успешно создан. Перенаправление на страницу оплаты...');
        router.push(data.confirmationUrl); // Перенаправляем пользователя на страницу оплаты ЮKassa
      } else {
        setError(data.message || 'Ошибка при создании платежа.');
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при отправке запроса.');
      console.error('Payment initiation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Тестирование Оплаты ЮKassa</h1>
      <p className="text-gray-600 mb-8">Текущий пользователь: **{user.username}** ({user.role})</p>

      {loading && <p className="text-blue-600 mb-4">Загрузка... Пожалуйста, подождите.</p>}
      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">Ошибка: {error}</p>}

      <div className="space-y-8">
        {/* Сценарий 1: Студент покупает мой курс (деньги идут мне - платформе) */}
        {user.role === 'student' && (
          <div className="border p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Покупка курса платформы</h2>
            <p className="mb-4">Пример: Студент **{user.username}** покупает курс Мой Эксклюзивный Курс.</p>
            <button
              onClick={() =>
                handlePayment(
                  'student_buys_my_course',
                  150.00,
                  'Покупка курса: Мой Эксклюзивный Курс',
                  { courseId: 'course-my-exclusive' }
                )
              }
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Купить курс (150.00 RUB)
            </button>
          </div>
        )}

        {/* Сценарий 2: Преподаватель оплачивает доступ к платформе (слоты учеников) */}
        {user.role === 'teacher' && (
          <div className="border p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Оплата доступа к платформе (Преподаватель)</h2>
            <p className="mb-4">Пример: Преподаватель **{user.username}** покупает Базовый доступ (+10 слотов).</p>
            <button
              onClick={() =>
                handlePayment(
                  'teacher_buys_platform_access',
                  500.00,
                  'Покупка: Доступ к платформе (Базовый - 10 слотов)',
                  { platformAccessTier: 'basic' }
                )
              }
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 mr-4"
            >
              Купить Базовый доступ (500.00 RUB)
            </button>
            {/* Добавьте другие уровни доступа */}
          </div>
        )}

        {/* Сценарий 3: Студент покупает курс у преподавателя (сплит-платеж) */}
        {user.role === 'student' && (
          <div className="border p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Покупка курса преподавателя (Сплит-платеж)</h2>
            <p className="mb-4">Пример: Студент **{user.username}** покупает курс Основы ИИ у преподавателя **teacher456**.</p>
            <button
              onClick={() =>
                handlePayment(
                  'student_buys_teacher_course_split',
                  99.99,
                  'Покупка курса: Основы ИИ (Сплит-платеж)',
                  { courseId: 'course-ai-basics', teacherId: 'teacher456' } // teacherId здесь mock, в реале будет из курса
                )
              }
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Купить курс у Преподавателя (99.99 RUB)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}