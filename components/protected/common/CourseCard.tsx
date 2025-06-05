// Карточка курса (используется и студентом, и преподавателем)

// online-courses/components/protected/common/CourseCard.tsx
import React from 'react';
import Link from 'next/link';
import { Button } from '../../ui/Button'; // Import Button
import { CourseStatus } from '@/types'; // Import CourseStatus

interface CourseCardProps {
  id: string;
  title: string;
  instructorId: string; // Changed from 'instructor' to 'instructorId' for consistency with DB
  progress?: number; // Optional for student dashboard
  image?: string;
  status?: CourseStatus; // Optional for instructor dashboard, explicitly typed
  students?: number; // Optional for instructor dashboard
}

export const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  instructorId, // Use instructorId
  progress,
  //image,
  status,
  students
}) => {
  // Mock instructor name based on ID for display
  const instructorName = instructorId === 'teacher456' ? 'Преподаватель Тест' : instructorId;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden transform transition-transform duration-300 hover:scale-103 hover:shadow-lg">

      <div className="p-5">
        <h4 className="text-xl font-bold text-gray-800 mb-2">{title}</h4>
        <p className="text-sm text-gray-600 mb-3">Преподаватель: {instructorName}</p> {/* Use instructorName */}
        {progress !== undefined && (
          <>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-700">Прогресс: {progress}%</p>
            <Link href={`/dashboard/student/courses/${id}`} className="mt-4 block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300">
              Продолжить обучение
            </Link>
          </>
        )}
        {status !== undefined && (
          <div className="mt-2">
            <p className="text-sm text-gray-700 mb-2">Студентов: {students}</p>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800' // Use 'published'
              }`}
            >
              {status === 'published' ? 'Опубликован' : 'Черновик'} {/* Display localized status */}
            </span>
            <div className="flex justify-end space-x-2 mt-3">
              <Button size="sm" variant="secondary">Редактировать</Button>
              <Button size="sm" variant="danger">Удалить</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
