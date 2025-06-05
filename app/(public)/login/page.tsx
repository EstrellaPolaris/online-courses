// online-courses/app/(public)/login/page.tsx
'use client';

import { useState } from 'react';
// ИЗМЕНЕНО: Удален импорт useRouter, так как он больше не используется на этой странице.
// import { useRouter } from 'next/navigation'; // УДАЛЕНО
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // ИЗМЕНЕНО: Удалена инициализация router, так как он больше не используется на этой странице.
  // const router = useRouter(); // УДАЛЕНО

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/send-magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Ссылка для входа отправлена на ваш email. Проверьте папку "Входящие".');
        // ОПЦИОНАЛЬНО: Можно добавить перенаправление здесь, если нужно.
        // Например: router.push('/check-email');
      } else {
        setError(data.message || 'Ошибка при отправке ссылки. Пожалуйста, попробуйте еще раз.');
      }
    } catch (err) {
      console.error('Login request failed:', err);
      setError('Произошла ошибка сети. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Вход через Magic Link
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Введите ваш email, и мы отправим вам ссылку для входа.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email адрес
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email адрес"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? 'Отправка...' : 'Отправить Magic Link'}
            </button>
          </div>

          {message && (
            <p className="mt-2 text-center text-sm text-green-600">{message}</p>
          )}
          {error && (
            <p className="mt-2 text-center text-sm text-red-600">{error}</p>
          )}
        </form>
        <div className="text-center">
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Нет аккаунта? Зарегистрируйтесь
          </Link>
        </div>
      </div>
    </div>
  );
}
