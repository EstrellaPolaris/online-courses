// online-courses/components/dashboard/AIRecommendations.tsx
import React, { useState, useEffect } from 'react';
import { CourseCard } from './CourseCard';
import { Course } from '@/types';

interface AIRecommendationsProps {
  userId: string;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({ userId }) => {
  const [recommendations, setRecommendations] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/ai/recommendations?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch AI recommendations');
        }
        const data: Course[] = await response.json();
        setRecommendations(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [userId]);

  if (loading) return <div className="text-center text-gray-600">Загрузка рекомендаций ИИ...</div>;
  if (error) return <div className="text-center text-red-600">Ошибка при загрузке рекомендаций: {error}</div>;

  if (recommendations.length === 0) {
    return <p className="text-gray-500">Пока нет персонализированных рекомендаций.</p>;
  }

  return (
    <div className="mb-8">
      <h3 className="text-2xl font-semibold text-gray-700 mb-4">
        <i className="lucide lucide-sparkles inline-block mr-2"></i> Рекомендации ИИ для вас
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((course) => (
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.title}
            instructorId="ИИ-рекомендация" // Или реальное имя преподавателя
            image={`https://placehold.co/400x200/${Math.floor(Math.random()*16777215).toString(16)}/FFFFFF?text=AI+Rec`}
            progress={0} // Для рекомендаций прогресс неактуален, но нужен для CourseCard
          />
        ))}
      </div>
    </div>
  );
};
