// Компонент для отображения рекомендаций ИИ

// online-courses/components/protected/student/AIRecommendations.tsx
import React, { useState, useEffect } from 'react';
import { CourseCard } from '../common/CourseCard';
import { Course } from '../../../types';

interface AIRecommendationsProps {
  userId: string;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({ userId }) => {
  const [recommendations, setRecommendations] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Explicitly typed
  const [error, setError] = useState<string>(''); // Explicitly typed

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/ai/recommendations?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch AI recommendations');
        }
        const data: Course[] = await response.json(); // Explicitly type data
        setRecommendations(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) { // err can still be 'any' from fetch API, but handle it
        setError(err instanceof Error ? err.message : String(err)); // Safely cast to string
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
        {recommendations.map((course: Course) => ( // Explicitly typed
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.title}
            instructorId={course.instructorId} // Use instructorId
            image={`https://placehold.co/400x200/${Math.floor(Math.random()*16777215).toString(16)}/FFFFFF?text=AI+Rec`}
            progress={0} // Для рекомендаций прогресс неактуален, но нужен для CourseCard
          />
        ))}
      </div>
    </div>
  );
};