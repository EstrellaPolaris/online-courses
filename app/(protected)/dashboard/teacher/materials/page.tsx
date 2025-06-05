// online-courses/components/protected/teacher/materials/page.tsx
'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useUser } from '@/context/UserContext'; // <-- ИМПОРТ useUser

export default function TeacherMaterialsPage() {
  const user = useUser(); // <-- Получаем пользователя из контекста
  const instructorId = user?.id; // <-- Извлекаем ID преподавателя

  const [courseTitle, setCourseTitle] = useState<string>(''); // Explicitly typed
  const [courseDescription, setCourseDescription] = useState<string>(''); // Explicitly typed
  const [coursePrice, setCoursePrice] = useState<string>(''); // Explicitly typed
  const [message, setMessage] = useState<string>(''); // Explicitly typed
  const [error, setError] = useState<string>(''); // Explicitly typed

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!instructorId) { // Проверяем наличие ID преподавателя
      setError('Ошибка: ID преподавателя недоступен.');
      return;
    }

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: courseTitle,
          description: courseDescription,
          instructorId, // Используем ID из контекста
          price: parseFloat(coursePrice),
        }),
      });

      const data: { message: string; success: boolean } = await response.json(); // Explicitly type data
      if (response.ok) {
        setMessage(data.message);
        setCourseTitle('');
        setCourseDescription('');
        setCoursePrice('');
      } else {
        setError(data.message || 'Ошибка при создании курса');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) { // err can still be 'any' from fetch API, but handle it
      setError('Произошла ошибка сети при создании курса.');
      console.error('Create course error:', err);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Управление Материалами Курсов</h2>
      <p className="text-gray-600 mb-8">Здесь вы можете загружать, редактировать и организовывать учебные материалы.</p>

      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Создать Новый Курс</h3>
        <form onSubmit={handleCreateCourse} className="space-y-4">
          {message && <p className="text-green-600 text-center">{message}</p>}
          {error && <p className="text-red-600 text-center">{error}</p>}
          <div>
            <label htmlFor="courseTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Название курса
            </label>
            <input
              type="text"
              id="courseTitle"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="courseDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Описание курса
            </label>
            <textarea
              id="courseDescription"
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="coursePrice" className="block text-sm font-medium text-gray-700 mb-1">
              Цена (₽)
            </label>
            <input
              type="number"
              id="coursePrice"
              value={coursePrice}
              onChange={(e) => setCoursePrice(e.target.value)}
              step="0.01"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Создать Курс
          </Button>
        </form>
      </div>

      {/* Existing Materials Section (placeholder) */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Существующие Материалы</h3>
        <p className="text-gray-600">Здесь будет список ваших курсов и их материалов. Вы сможете редактировать их или добавлять новые уроки.</p>
        {/* Example: A list of courses with "Edit Materials" button */}
      </div>
    </div>
  );
}