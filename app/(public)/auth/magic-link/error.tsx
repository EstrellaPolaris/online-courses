// online-courses/app/(public)/auth/magic-link/error.tsx
'use client'; // Этот компонент должен быть клиентским компонентом

import { useEffect } from 'react';

// Error Boundary для обработки ошибок на странице Magic Link
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Опционально: Зарегистрировать ошибку в службе отчетности об ошибках
    console.error("Error Boundary caught an error on Magic Link page:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg text-center">
        <h2 className="mt-6 text-2xl font-extrabold text-red-600">
          Упс! Что-то пошло не так.
        </h2>
        <p className="mt-2 text-gray-700">
          Произошла ошибка при обработке вашей ссылки для входа.
        </p>
        <p className="text-sm text-gray-500">
          {error.message}
        </p>
        <button
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={
            // Попытаться восстановиться, повторно отрисовав сегмент маршрута
            () => reset()
          }
        >
          Попробовать снова
        </button>
        <p className="mt-4 text-sm text-gray-600">
          Если проблема сохраняется, пожалуйста, запросите новую ссылку для входа.
        </p>
      </div>
    </div>
  );
}
