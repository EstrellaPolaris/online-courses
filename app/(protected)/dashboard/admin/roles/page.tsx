// online-courses/app/(protected)/dashboard/admin/roles/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { User, UserRole } from '@/types';

export default function AdminRolesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<{ [key: string]: UserRole }>({});

  useEffect(() => {
    // Mock fetching users
    const fetchUsers = async () => {
      setLoading(true);
      // В реальном приложении здесь будет API-вызов для получения всех пользователей
      const mockUsers: User[] = [
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
      ];
      setUsers(mockUsers);
      const initialRoles = mockUsers.reduce((acc, user) => {
        acc[user.id] = user.role;
        return acc;
      }, {} as { [key: string]: UserRole });
      setSelectedRole(initialRoles);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleRoleChange = (userId: string, role: UserRole) => {
    setSelectedRole((prev) => ({ ...prev, [userId]: role }));
  };

  const handleUpdateRole = async (userId: string) => {
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/users/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole: selectedRole[userId] }),
      });
      const data: { message: string; success: boolean } = await response.json();
      if (response.ok) {
        setMessage(`Роль пользователя ${users.find(u => u.id === userId)?.username} успешно обновлена.`);
        setUsers(users.map(u => u.id === userId ? { ...u, role: selectedRole[userId], updatedAt: new Date() } : u));
      } else {
        setError(data.message || 'Ошибка при обновлении роли.');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError('Произошла ошибка сети при обновлении роли.');
      console.error('Update role error:', err);
    }
  };

  if (loading) return <div className="text-center text-gray-600">Загрузка пользователей...</div>;
  if (error) return <div className="text-center text-red-600">Ошибка: {error}</div>;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Управление Ролями Пользователей</h2>
      <p className="text-gray-600 mb-8">Здесь администратор может назначать и изменять роли пользователей.</p>

      {message && <p className="text-green-600 text-center mb-4">{message}</p>}
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      {users.length === 0 ? (
        <p className="text-gray-600">Пользователи не найдены.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-200">
              <tr>
                <th scope="col" className="py-3 px-6 text-left text-sm font-medium text-gray-700 uppercase tracking-wider rounded-tl-lg">Имя пользователя</th>
                <th scope="col" className="py-3 px-6 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Email</th>
                <th scope="col" className="py-3 px-6 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Текущая роль</th>
                <th scope="col" className="py-3 px-6 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Новая роль</th>
                <th scope="col" className="py-3 px-6 text-left text-sm font-medium text-gray-700 uppercase tracking-wider rounded-tr-lg">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user: User) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-800 font-medium">{user.username}</td>
                  <td className="py-4 px-6 text-gray-700">{user.email}</td>
                  <td className="py-4 px-6 text-gray-700">{user.role}</td>
                  <td className="py-4 px-6">
                    <select
                      value={selectedRole[user.id] || user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="student">Студент</option>
                      <option value="teacher">Преподаватель</option>
                      <option value="admin">Администратор</option>
                    </select>
                  </td>
                  <td className="py-4 px-6">
                    <Button
                      onClick={() => handleUpdateRole(user.id)}
                      disabled={selectedRole[user.id] === user.role}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Обновить
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
