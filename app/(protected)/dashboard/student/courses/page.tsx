// Страница "Мои курсы" (студент)

// online-courses/app/(protected)/dashboard/student/courses/page.tsx

'use client';
import React, { useState, useEffect } from 'react';
import { CourseCard } from '@/components/protected/common/CourseCard'; // Corrected path
import { Course } from '@/types';

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Explicitly typed
  const [error, setError] = useState<string>(''); // Explicitly typed

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/courses');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data: Course[] = await response.json(); // Explicitly type data
        setCourses(data.map((c: Course) => ({ ...c, progress: Math.floor(Math.random() * 100) }))); // Explicitly type c
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) { // err can still be 'any' from fetch API, but handle it
        setError(err instanceof Error ? err.message : String(err)); // Safely cast to string
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <div className="text-center text-gray-600">Загрузка курсов...</div>;
  if (error) return <div className="text-center text-red-600">Ошибка: {error}</div>;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Все Мои Курсы</h2>
      {courses.length === 0 ? (
        <p className="text-gray-600">У вас пока нет записанных курсов.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              instructorId={course.instructorId} // Pass instructorId directly
              progress={course.progress}
              image={`https://placehold.co/400x200/${Math.floor(Math.random()*16777215).toString(16)}/FFFFFF?text=${course.title.split(' ')[0]}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}