// online-courses/app/(public)/auth/magic-link/loading.tsx
import React from 'react';

// Компонент, который будет отображаться во время загрузки (например, во время Suspense)
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg text-center">
        <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
          Загрузка...
        </h2>
        <p className="mt-2 text-gray-600">
          Пожалуйста, подождите, пока мы проверяем вашу ссылку для входа.
        </p>
        {/* Простой индикатор загрузки */}
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    </div>
  );
}
