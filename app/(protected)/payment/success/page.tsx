// Страница успешной оплаты

// online-courses/app/(protected)/payment/success/page.tsx
'use client'; // Если этот компонент должен быть клиентским (например, для использования хуков React)
import React from 'react'; // <--- ДОБАВЬТЕ ЭТУ СТРОКУ, ЕСЛИ ЕЕ НЕТ

// В Next.js App Router, `page.tsx` по умолчанию получает `params` и `searchParams`
interface PaymentSuccessPageProps {
  // `params` могут быть пустыми или содержать route segments, если они есть.
  // Для `/payment/success` обычно нет динамических сегментов, поэтому `params` может быть пустым объектом.
  params: object; 
  // `searchParams` содержат параметры запроса URL (например, ?paymentId=...).
  // Для страницы успешной оплаты это очень важно.
  searchParams: {
    paymentId?: string; // ID платежа, который может быть передан в URL
    status?: string;    // Статус, если он передается
    [key: string]: string | string[] | undefined; // Для любых других возможных параметров
  };
}

export default function PaymentSuccessPage({ searchParams }: PaymentSuccessPageProps) {
  const paymentId = searchParams.paymentId;
  const status = searchParams.status;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <svg
          className="w-16 h-16 text-green-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <h1 className="text-3xl font-bold text-green-700 mb-2">Оплата прошла успешно!</h1>
        <p className="text-gray-700 mb-4">
          Спасибо за вашу покупку. Ваш доступ к курсу/продукту скоро будет активирован.
        </p>
        {paymentId && (
          <p className="text-sm text-gray-500">ID платежа: {paymentId}</p>
        )}
        {status && (
          <p className="text-sm text-gray-500">Статус: {status}</p>
        )}
        <a
          href="/dashboard" // Или /dashboard/student/courses
          className="mt-6 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Перейти в личный кабинет
        </a>
      </div>
    </div>
  );
}