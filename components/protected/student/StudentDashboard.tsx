'use client';
import React, { useState, useEffect } from 'react';
import { CourseCard } from '../common/CourseCard';
import { AIRecommendations } from '@/components/protected/common/AIRecommendations';
import { Course, User, Notification } from '@/types';
import Link from 'next/link';

export function StudentDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [errorCourses, setErrorCourses] = useState('');
  const [errorNotifications, setErrorNotifications] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        if (response.ok) {
          const userData: User = await response.json();
          setUserId(userData.id);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch user data for dashboard', response.status, errorText);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };
    fetchUser();

    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const response = await fetch('/api/courses');
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data: Course[] = await response.json();
        setCourses(data.map((c) => ({ ...c, progress: Math.floor(Math.random() * 100) })));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setErrorCourses(err.message);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();

    const fetchNotifications = async () => {
      try {
        setLoadingNotifications(true);
        const mockNotifications: Notification[] = [
          { id: 1, text: 'Новое объявление в курсе "Основы ИИ".', type: 'info' },
          { id: 2, text: 'Задание "Модуль 3" скоро истекает в курсе "Продвинутый JavaScript".', type: 'warning' },
        ];
        setNotifications(mockNotifications);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setErrorNotifications(err.message);
      } finally {
        setLoadingNotifications(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-6">
          Добро пожаловать, <span className="text-blue-700">Уважаемый Студент!</span>
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Здесь вы можете отслеживать свой прогресс, получать уведомления и управлять своими курсами.
        </p>

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
              {notifications.map((notification) => (
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
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  instructorId={course.instructorId}
                  progress={course.progress}
                  image={`https://placehold.co/400x200/${Math.floor(Math.random() * 16777215).toString(16)}/FFFFFF?text=Курс`}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">У вас пока нет записанных курсов.</p>
          )}
        </div>

        {userId && <AIRecommendations userId={userId} />}
      </div>

      <div className="lg:col-span-1 space-y-8">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">
            <i className="lucide lucide-link inline-block mr-2"></i> Быстрые Ссылки
          </h3>
          <ul className="space-y-3">
            <li>
              <Link href="/dashboard/student/courses" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200">
                <i className="lucide lucide-calendar-days mr-2"></i> Мой Календарь
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200">
                <i className="lucide lucide-message-square mr-2"></i> Сообщения
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200">
                <i className="lucide lucide-award mr-2"></i> Мои Достижения
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200">
                <i className="lucide lucide-settings mr-2"></i> Настройки Профиля
              </Link>
            </li>
          </ul>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">
            <i className="lucide lucide-calendar-check inline-block mr-2"></i> Предстоящие События
          </h3>
          <ul className="space-y-4">
            <li className="border-b pb-3 border-gray-200 last:border-b-0">
              <p className="font-semibold text-gray-800">Вебинар: Будущее ИИ</p>
              <p className="text-sm text-gray-600">Курс: Основы ИИ</p>
              <p className="text-xs text-gray-500">10 Июня, 18:00 МСК</p>
            </li>
            <li className="border-b pb-3 border-gray-200 last:border-b-0">
              <p className="font-semibold text-gray-800">Дедлайн: Задание по JS</p>
              <p className="text-sm text-gray-600">Курс: Продвинутый JavaScript</p>
              <p className="text-xs text-gray-500">12 Июня, 23:59 МСК</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
