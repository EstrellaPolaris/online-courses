// online-courses/app/(public)/auth/magic-link/page.tsx
'use client'; // <--- Это важно!

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function MagicLinkVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Проверка токена...');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError('Токен отсутствует в ссылке.');
      setMessage('');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/auth/verify-magic-link?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setMessage(data.message || 'Вход выполнен успешно! Перенаправление на дашборд...');
          router.push('/dashboard');
        } else {
          setError(data.message || 'Недействительный или истекший токен. Пожалуйста, запросите новую ссылку.');
          setMessage('');
        }
      } catch (err) {
        console.error('Magic link verification failed:', err);
        setError('Произошла ошибка сети при проверке токена.');
        setMessage('');
      }
    };

    verifyToken();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Вход через Magic Link
        </h2>
        {message && (
          <p className="mt-4 text-center text-lg text-blue-600">{message}</p>
        )}
        {error && (
          <p className="mt-4 text-center text-lg text-red-600">{error}</p>
        )}
        {!message && !error && (
          <p className="mt-4 text-center text-lg text-gray-600">Пожалуйста, подождите...</p>
        )}
      </div>
    </div>
  );
}
