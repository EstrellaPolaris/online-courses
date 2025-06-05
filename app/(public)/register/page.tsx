// Страница регистрации

// online-courses/app/register/page.tsx
'use client';

import React, { useState } from 'react';

// Register page (by invitation)
export default function RegisterPage() {
  const [inviteCode, setInviteCode] = useState<string>(''); // Explicitly typed
  const [email, setEmail] = useState<string>(''); // Explicitly typed
  const [password, setPassword] = useState<string>(''); // Explicitly typed
  const [message, setMessage] = useState<string>(''); // Explicitly typed
  const [error, setError] = useState<string>(''); // Explicitly typed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Mock registration logic
    if (inviteCode === 'TEACHER_INVITE_2040' && email && password) {
      // In a real app, this would hit a backend API to validate invite and create user
      console.log('Attempting registration with:', { inviteCode, email, password });
      setMessage('Регистрация успешна! Теперь вы можете войти.');
      // Optionally redirect to login page
      // router.push('/login');
    } else {
      setError('Неверный код приглашения или не все поля заполнены.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Регистрация</h2>
        <p className="text-gray-600 mb-4 text-center">
          Регистрация для преподавателей осуществляется по приглашению. Пожалуйста, введите ваш код приглашения.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && <p className="text-green-600 text-center">{message}</p>}
          {error && <p className="text-red-600 text-center">{error}</p>}
          <div>
            <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-1">
              Код приглашения
            </label>
            <input
              type="text"
              id="inviteCode"
              name="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Введите код приглашения"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ваш email"
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
              placeholder="Придумайте пароль"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300"
          >
            Зарегистрироваться
          </button>
        </form>
      </div>
    </div>
  );
}