// online-courses/app/(protected)/dashboard/unauthorized/page.tsx
import React from 'react';
import Link from 'next/link'; // Импортируем Link

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-md w-full">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Доступ запрещен</h1>
        <p className="text-lg text-gray-700 mb-6">
          У вас нет прав для просмотра этой страницы.
        </p>
        <p className="text-md text-gray-600 mb-8">
          Пожалуйста, войдите с соответствующими учетными данными или обратитесь к администратору.
        </p>
        <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-300">
          Вернуться на страницу входа
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;