// ./app/(protected)/dashboard/admin/audit/page.tsx
'use client';
import React from 'react';
import { AuditLogEntry } from '@/types'; // Убедитесь, что AuditLogEntry импортируется

export default function AdminAuditPage() {
  const auditLogs: AuditLogEntry[] = [
    {
      id: 'log1',
      timestamp: new Date('2025-06-01T10:00:00Z'), // Преобразуем строку в объект Date
      userId: 'admin789',
      action: 'LOGIN',
      details: { description: 'Успешный вход администратора' } // 'description' лучше поместить в details
    },
    {
      id: 'log2',
      timestamp: new Date('2025-06-01T10:05:30Z'), // Преобразуем строку в объект Date
      userId: 'teacher456',
      action: 'COURSE_CREATED',
      entityType: 'course',
      entityId: 'course_abc',
      details: { description: 'Преподаватель создал новый курс "Введение в Web3"' }
    },
    {
      id: 'log3',
      timestamp: new Date('2025-06-01T10:10:15Z'), // Преобразуем строку в объект Date
      userId: 'user123',
      action: 'COURSE_ENROLL',
      entityType: 'course',
      entityId: 'course_xyz',
      details: { description: 'Студент записался на курс "Основы ИИ"' }
    },
    {
      id: 'log4',
      timestamp: new Date('2025-06-01T10:15:45Z'), // Преобразуем строку в объект Date
      userId: 'admin789',
      action: 'ROLE_UPDATE',
      entityType: 'user',
      entityId: 'user123',
      details: { description: 'Администратор изменил роль user123 на "teacher"', newRole: 'teacher' }
    },
    // Добавьте больше тестовых данных по необходимости
  ];

  // В реальном приложении здесь будет логика для получения данных аудита,
  // фильтрации, пагинации и т.д.

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Журнал аудита</h1>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID записи
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Время
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Пользователь
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действие
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Тип сущности
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID сущности
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Описание
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {auditLogs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {log.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.timestamp.toLocaleString()} {/* Форматируем Date для отображения */}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.userId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.action}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.entityType || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.entityId || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {log.details?.description || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}