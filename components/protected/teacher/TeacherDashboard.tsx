// Компоненты, специфичные для дашборда преподавателя
// Основной компонент дашборда преподавателя

// online-courses/components/protected/teacher/TeacherDashboard.tsx
'use client';
// online-courses/components/protected/teacher/InstructorDashboard.tsx
import React, { useState, useEffect } from 'react';
import { CourseCard } from '../common/CourseCard';
import { Course, Notification } from '../../../types';
import Link from 'next/link';
import { useUser } from '../../../context/UserContext'; // <--- ИМПОРТ useUser

export function TeacherDashboard() {
  const user = useUser(); // <--- ПОЛУЧАЕМ ПОЛЬЗОВАТЕЛЯ ИЗ КОНТЕКСТА
  const instructorId = user?.id; // <--- ИЗВЛЕКАЕМ instructorId

  const [courses, setCourses] = useState<Course[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(true);
  const [loadingNotifications, setLoadingNotifications] = useState<boolean>(true);
  const [errorCourses, setErrorCourses] = useState<string>('');
  const [errorNotifications, setErrorNotifications] = useState<string>('');
  // УДАЛЕНЫ useState для instructorId и useEffect для fetchUser

  useEffect(() => {
    // Проверяем, что instructorId доступен, прежде чем делать запросы
    if (!instructorId) {
      console.warn('InstructorDashboard: instructorId не доступен, пропуск загрузки данных.');
      return;
    }

    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const response = await fetch(`/api/courses?role=teacher&instructorId=${instructorId}`);
        if (!response.ok) throw new Error('Failed to fetch instructor courses');
        const data: Course[] = await response.json();
        setCourses(data.map((c: Course) => ({ ...c, students: Math.floor(Math.random() * 50) + 10 })));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setErrorCourses(err instanceof Error ? err.message : String(err));
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();

    const fetchNotifications = async () => {
      try {
        setLoadingNotifications(true);
        const mockNotifications: Notification[] = [
          { id: 1, text: 'Новая регистрация на курс "Введение в Web3".', type: 'info' },
          { id: 2, text: 'Ожидается проверка задания от студента Иванов А.А.', type: 'warning' },
        ];
        setNotifications(mockNotifications);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setErrorNotifications(err instanceof Error ? err.message : String(err));
      } finally {
        setLoadingNotifications(false);
      }
    };
    fetchNotifications();
  }, [instructorId]); // <--- ЗАВИСИМОСТЬ ОТ instructorId из контекста

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Welcome and notifications section */}
      <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-6">
          Добро пожаловать, <span className="text-green-700">Уважаемый Преподаватель!</span>
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Здесь вы можете управлять своими курсами, отслеживать прогресс студентов и получать важные уведомления.
        </p>

        {/* Notifications section */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">
            <i className="lucide lucide-bell inline-block mr-2"></i> Ваши Уведомления
          </h3>
          {loadingNotifications ? (
            <p className="text-gray-600">Загрузка уведомлений...</p>
          ) : errorNotifications ? (
            <p className="text-red-600">Ошибка: {errorNotifications}</p>
          ) : notifications.length > 0 ? (
            <ul className="space-y-4">
              {notifications.map((notification: Notification) => (
                <li
                  key={notification.id}
                  className={`p-4 rounded-lg shadow-sm flex items-center ${
                    notification.type === 'info' ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-yellow-50 border-l-4 border-yellow-400'
                  }`}
                >
                  <span className="text-xl mr-3">
                    {notification.type === 'info' ? '💡' : '⚠️'}
                  </span>
                  <p className="text-gray-700">{notification.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">У вас нет новых уведомлений.</p>
          )}
        </div>

        {/* My Courses section */}
        <div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">
            <i className="lucide lucide-book-open inline-block mr-2"></i> Мои Курсы
          </h3>
          {loadingCourses ? (
            <p className="text-gray-600">Загрузка курсов...</p>
          ) : errorCourses ? (
            <p className="text-red-600">Ошибка: {errorCourses}</p>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course: Course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  instructorId={course.instructorId}
                  status={course.status}
                  students={course.students}
                  image={`https://placehold.co/400x200/${Math.floor(Math.random()*16777215).toString(16)}/FFFFFF?text=Курс`}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">У вас пока нет созданных курсов.</p>
          )}
        </div>
      </div>

      {/* Sidebar (quick links, calendar etc.) */}
      <div className="lg:col-span-1 space-y-8">
        {/* Quick Links */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">
            <i className="lucide lucide-link inline-block mr-2"></i> Быстрые Ссылки
          </h3>
          <ul className="space-y-3">
            <li>
              <Link href="/dashboard/teacher/materials" className="flex items-center text-green-600 hover:text-green-800 transition-colors duration-200">
                <i className="lucide lucide-folder-open mr-2"></i> Мои Материалы
              </Link>
            </li>
            <li>
              <Link href="/dashboard/teacher/students" className="flex items-center text-green-600 hover:text-green-800 transition-colors duration-200">
                <i className="lucide lucide-users mr-2"></i> Студенты
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center text-green-600 hover:text-green-800 transition-colors duration-200">
                <i className="lucide lucide-bar-chart-2 mr-2"></i> Аналитика
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center text-green-600 hover:text-green-800 transition-colors duration-200">
                <i className="lucide lucide-mail mr-2"></i> Сообщения
              </Link>
            </li>
          </ul>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">
            <i className="lucide lucide-calendar-check inline-block mr-2"></i> Предстоящие События
          </h3>
          <ul className="space-y-4">
            <li className="border-b pb-3 border-gray-200 last:border-b-0">
              <p className="font-semibold text-gray-800">Вебинар: Как создавать вовлекающий контент</p>
              <p className="text-sm text-gray-600">Для преподавателей</p>
              <p className="text-xs text-gray-500">15 Июня, 16:00 МСК</p>
            </li>
            <li className="border-b pb-3 border-gray-200 last:border-b-0">
              <p className="font-semibold text-gray-800">Встреча с ментором</p>
              <p className="text-sm text-gray-600">Индивидуальная консультация</p>
              <p className="text-xs text-gray-500">18 Июня, 11:00 МСК</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}