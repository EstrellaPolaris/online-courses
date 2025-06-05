// app/(protected)/dashboard/student/tests/page.tsx
'use client';
import React from 'react';
import { StudentTestOverview } from '@/types'; // ИМПОРТИРУЕМ НОВЫЙ ТИП

export default function StudentTestsPage() {
  const tests: StudentTestOverview[] = [ // Используем новый тип
    { id: '1', title: 'Тест по Модулю 1: Введение в ИИ', course: 'Основы Искусственного Интеллекта', status: 'Пройден', score: '85%' },
    { id: '2', title: 'Задание: Реализация алгоритма сортировки', course: 'Продвинутый JavaScript', status: 'На проверке', score: '-' },
    { id: '3', title: 'Тест по Модулю 2: Нейронные сети', course: 'Основы Искусственного Интеллекта', status: 'Предстоит', score: '-' },
    { id: '4', title: 'Финалный проект: Создание чат-бота', course: 'Продвинутый Python', status: 'Предстоит', score: '-' },
  ];

  // В реальном приложении здесь будет логика для получения данных тестов,
  // фильтрации, пагинации и т.д.

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Мои тесты и задания</h1>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Название
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Курс
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Балл
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tests.map((test) => (
              <tr key={test.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {test.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {test.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {test.course}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    test.status === 'Пройден' ? 'bg-green-100 text-green-800' :
                    test.status === 'На проверке' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {test.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {test.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}