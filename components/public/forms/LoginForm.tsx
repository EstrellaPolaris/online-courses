// Форма входа


// online-courses/components/public/forms/LoginForm.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '../../ui/Button'; // Assuming Button component is in ui folder
// import { useRouter } from 'next/navigation'; // Для перенаправления

export default function LoginForm() {
  const [username, setUsername] = useState<string>(''); // Explicitly typed
  const [password, setPassword] = useState<string>(''); // Explicitly typed
  const [error, setError] = useState<string>(''); // Explicitly typed
  // const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data: { message: string; success: boolean } = await response.json(); // Explicitly typed
      if (response.ok) {
        console.log('Login successful');
        // router.push('/dashboard'); // Перенаправляем на дашборд после успешного входа
        window.location.href = '/dashboard'; // Используем window.location для полной перезагрузки и применения middleware
      } else {
        setError(data.message || 'Ошибка входа');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) { // err can still be 'any' from fetch API, but handle it
      setError('Произошла ошибка при попытке входа.');
      console.error('Login error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Имя пользователя (или email)
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Введите ваше имя пользователя"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Пароль
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Введите ваш пароль"
          required
        />
      </div>
      <Button type="submit" className="w-full">
        Войти
      </Button>
    </form>
  );
}
