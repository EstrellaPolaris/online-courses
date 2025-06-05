// online-courses/app/(protected)/dashboard/admin/page.tsx
'use client';
import React, { useState } from 'react';
import { User, UserRole } from '@/types'; // Импортируем User и UserRole

export default function AdminDashboardPage() {
  // Мок-данные пользователей, теперь соответствующие интерфейсу User
  const [users, setUsers] = useState<User[]>([
    {
      id: 'user123',
      username: 'student_user',
      email: 'student@example.com',
      role: 'student',
      emailVerified: true, // ДОБАВЛЕНО
      createdAt: new Date('2023-01-01T10:00:00Z'), // ДОБАВЛЕНО
      updatedAt: new Date('2023-01-01T10:00:00Z'), // ДОБАВЛЕНО
      purchasedCourseIds: ['course_react'], // Пример
    },
    {
      id: 'teacher456',
      username: 'teacher_user',
      email: 'teacher@example.com',
      role: 'teacher',
      emailVerified: true, // ДОБАВЛЕНО
      createdAt: new Date('2023-02-15T11:30:00Z'), // ДОБАВЛЕНО
      updatedAt: new Date('2023-02-15T11:30:00Z'), // ДОБАВЛЕНО
      platformAccessTier: 'pro', // Пример
      studentSlotsAvailable: 50, // Пример
    },
    {
      id: 'admin789',
      username: 'admin_user',
      email: 'admin@example.com',
      role: 'admin',
      emailVerified: true, // ДОБАВЛЕНО
      createdAt: new Date('2022-11-20T09:00:00Z'), // ДОБАВЛЕНО
      updatedAt: new Date('2022-11-20T09:00:00Z'), // ДОБАВЛЕНО
    },
    {
      id: 'newuser1',
      username: 'new_student',
      email: 'new@example.com',
      role: 'student',
      emailVerified: false, // Пример: не подтвержден
      createdAt: new Date('2024-05-20T14:00:00Z'), // ДОБАВЛЕНО
      updatedAt: new Date('2024-05-20T14:00:00Z'), // ДОБАВЛЕНО
    },
  ]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('student');

  const handleEditRole = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
  };

  const handleSaveRole = () => {
    if (selectedUser) {
      // В реальном приложении здесь будет API-вызов для обновления роли пользователя
      console.log(`Updating role for user ${selectedUser.id} to ${newRole}`);
      setUsers(users.map(user =>
        user.id === selectedUser.id ? { ...user, role: newRole, updatedAt: new Date() } : user
      ));
      setSelectedUser(null); // Закрыть модальное окно
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Панель администратора</h1>

      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Управление пользователями</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Имя пользователя
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Роль
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditRole(user)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Изменить роль
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Изменить роль пользователя: {selectedUser.username}</h2>
            <div className="mb-4">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Новая роль
              </label>
              <select
                id="role"
                name="role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="student">Студент</option>
                <option value="teacher">Преподаватель</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveRole}
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
