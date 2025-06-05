// Страницы, связанные с подписками
// Состояние подписки
// online-courses/app/(protected)/subscription/status/page.tsx
'use client'; // Используйте, если это клиентский компонент. Если он серверный и не имеет интерактивности, можете удалить.
import React from 'react'; // <--- ДОБАВЬТЕ ЭТУ СТРОКУ, ЕСЛИ ЕЕ НЕТ

// Типизация пропсов для страницы статуса подписки
interface SubscriptionStatusPageProps {
  // params обычно пустой для таких страниц, если нет динамических сегментов
  params: object;
  // searchParams для передачи статуса, ID подписки и т.д.
  searchParams: {
    status?: 'success' | 'pending' | 'failed'; // Например, статус подписки
    subscriptionId?: string; // ID подписки
    message?: string; // Дополнительное сообщение
    [key: string]: string | string[] | undefined; // Для любых других возможных параметров
  };
}

export default function SubscriptionStatusPage({ searchParams }: SubscriptionStatusPageProps) {
  const { status, subscriptionId, message } = searchParams;

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return {
          title: 'Подписка успешно оформлена!',
          description: 'Спасибо за оформление подписки. Ваш доступ активирован.',
          icon: (
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          ),
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
        };
      case 'pending':
        return {
          title: 'Подписка в процессе оформления...',
          description: 'Ваш платеж обрабатывается. Как только он будет подтвержден, ваша подписка активируется.',
          icon: (
            <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          ),
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
        };
      case 'failed':
        return {
          title: 'Ошибка оформления подписки',
          description: 'К сожалению, при оформлении подписки произошла ошибка. Пожалуйста, попробуйте еще раз или свяжитесь со службой поддержки.',
          icon: (
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          ),
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
        };
      default:
        return {
          title: 'Статус подписки',
          description: 'Произошла неизвестная ошибка или статус не передан.',
          icon: (
            <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          ),
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
        };
    }
  };

  const { title, description, icon, bgColor, textColor } = getStatusMessage();

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${bgColor}`}>
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        {icon}
        <h1 className={`text-3xl font-bold ${textColor} mb-2`}>{title}</h1>
        <p className="text-gray-700 mb-4">{description}</p>
        {subscriptionId && (
          <p className="text-sm text-gray-500">ID подписки: {subscriptionId}</p>
        )}
        {message && (
          <p className="text-sm text-gray-500">Сообщение: {message}</p>
        )}
        <a
          href="/dashboard" // Или /dashboard/teacher/subscription
          className="mt-6 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Перейти в личный кабинет
        </a>
      </div>
    </div>
  );
}