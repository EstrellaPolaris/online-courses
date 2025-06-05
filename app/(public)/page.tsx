// online-courses/app/page.tsx
import React from 'react';
import Link from 'next/link';

// Public landing page
export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center p-8">
      <h1 className="text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
        Ваш путь к <span className="text-blue-700">знаниям</span> и <span className="text-green-600">успеху</span>
      </h1>
      <p className="text-xl text-gray-700 max-w-3xl mb-10">
        Современная платформа для онлайн-обучения, где студенты находят лучшие курсы, а преподаватели делятся своим опытом и монетизируют знания.
      </p>
      <div className="space-x-6">
        <Link href="/register" className="bg-blue-600 text-white text-xl font-semibold px-8 py-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">
          Начать обучение
        </Link>
        <Link href="/pricing" className="bg-green-600 text-white text-xl font-semibold px-8 py-4 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105">
          Стать преподавателем
        </Link>
      </div>

      <div className="mt-20 w-full max-w-6xl">
        <h2 className="text-4xl font-bold text-gray-800 mb-12">Почему выбирают нас?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-200 transform transition-transform duration-300 hover:scale-105">
            <div className="text-5xl text-blue-600 mb-4">💡</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Персонализация с ИИ</h3>
            <p className="text-gray-600">Индивидуальные траектории обучения, адаптированные под ваши цели и темп.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg border border-green-200 transform transition-transform duration-300 hover:scale-105">
            <div className="text-5xl text-green-600 mb-4">🧑‍🏫</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Удобство для преподавателей</h3>
            <p className="text-gray-600">Мощные инструменты для создания, управления и монетизации курсов.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg border border-purple-200 transform transition-transform duration-300 hover:scale-105">
            <div className="text-5xl text-purple-600 mb-4">🔒</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Безопасность по ГОСТу</h3>
            <p className="text-gray-600">Соответствие требованиям ИБ РФ, защита данных на всех уровнях.</p>
          </div>
        </div>
      </div>
    </div>
  );
}