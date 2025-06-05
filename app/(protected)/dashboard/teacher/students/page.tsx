// online-courses/app/(protected)/dashboard/teacher/students/page.tsx
'use client';
import React from 'react';
import { StudentListItem } from '@/types'; // <-- ИМПОРТИРУЕМ НОВЫЙ ТИП

export default function TeacherStudentsPage() {
  // Используем новый тип StudentListItem для массива студентов
  const students: StudentListItem[] = [
    { id: 'student-1', name: 'Иванов А.А.', email: 'ivanov@example.com', course: 'Основы ИИ', progress: '75%' },
    { id: 'student-2', name: 'Смирнова Е.В.', email: 'smirnova@example.com', course: 'Продвинутый JS', progress: '60%' },
    { id: 'student-3', name: 'Кузнецов Д.С.', email: 'kuznetsov@example.com', course: 'Основы ИИ', progress: '90%' },
  ];

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Мои Студенты</h2>
      {students.length === 0 ? (
        <p className="text-gray-600">У вас пока нет студентов, записанных на ваши курсы.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 uppercase tracking-wider rounded-tl-lg">Имя</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Email</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Курс</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 uppercase tracking-wider rounded-tr-lg">Прогресс</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student: StudentListItem) => ( // Используем новый тип StudentListItem
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-800 font-medium">{student.name}</td>
                  <td className="py-4 px-6 text-gray-700">{student.email}</td>
                  <td className="py-4 px-6 text-gray-700">{student.course}</td>
                  <td className="py-4 px-6 text-gray-700">{student.progress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
