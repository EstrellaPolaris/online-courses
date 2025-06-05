// online-courses/app/api/ai/recommendations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Course } from '@/types';

// GET: Получение персонализированных рекомендаций курсов
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ message: 'Отсутствует ID пользователя' }, { status: 400 });
  }

  try {
    // В реальном приложении здесь будет вызов LLM или другой AI-модели
    // const userLearningHistory = await db.getUserLearningHistory(userId);
    // const aiRecommendations = await callAIModel(userLearningHistory);

    // Mock AI recommendations
    const allCourses = await db.getAllCourses();
    const recommendations: Course[] = allCourses.filter(course => course.id !== 'course_123').slice(0, 3); // Исключаем уже взятые и берем 3 случайных

    return NextResponse.json(recommendations, { status: 200 });
  } catch (error) {
    console.error('API /ai/recommendations error:', error);
    return NextResponse.json({ message: 'Ошибка при получении рекомендаций ИИ' }, { status: 500 });
  }
}