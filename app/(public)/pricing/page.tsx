//Страница тарифов

// online-courses/app/pricing/page.tsx
import React from 'react';
import Link from 'next/link';

// Pricing page
export default function PricingPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 p-8 flex flex-col items-center">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-12 text-center">
        Выберите свой <span className="text-blue-700">тариф</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl w-full">
        {/* Student Plan */}
        <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-blue-400 flex flex-col justify-between transform transition-transform duration-300 hover:scale-105">
          <div>
            <h2 className="text-3xl font-bold text-blue-700 mb-4">Студент</h2>
            <p className="text-gray-600 mb-6">Доступ ко всем курсам и материалам.</p>
            <div className="text-5xl font-extrabold text-gray-900 mb-6">
              ₽ 999 <span className="text-xl font-medium text-gray-500">/ месяц</span>
            </div>
            <ul className="text-gray-700 space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✔</span> Неограниченный доступ к библиотеке курсов
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✔</span> Персонализированные рекомендации ИИ
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✔</span> Поддержка интеллектуального ассистента
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✔</span> Сертификаты о прохождении
              </li>
            </ul>
          </div>
          <Link href="/register" className="block w-full text-center bg-blue-600 text-white text-xl font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300">
            Выбрать тариф
          </Link>
        </div>

        {/* Instructor Plan */}
        <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-green-400 flex flex-col justify-between transform transition-transform duration-300 hover:scale-105">
          <div>
            <h2 className="text-3xl font-bold text-green-700 mb-4">Преподаватель</h2>
            <p className="text-gray-600 mb-6">Размещение курсов и доступ к аналитике.</p>
            <div className="text-5xl font-extrabold text-gray-900 mb-6">
              ₽ 1999 <span className="text-xl font-medium text-gray-500">/ месяц</span>
            </div>
            <ul className="text-gray-700 space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✔</span> Неограниченное размещение курсов
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✔</span> Расширенная аналитика по студентам
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✔</span> Инструменты для создания контента с ИИ
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✔</span> Приоритетная техническая поддержка
              </li>
            </ul>
          </div>
          <Link href="/register" className="block w-full text-center bg-green-600 text-white text-xl font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors duration-300">
            Выбрать тариф
          </Link>
        </div>
      </div>
    </div>
  );
}