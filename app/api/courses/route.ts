// API для управления курсами
// GET: Получение списка курсов; POST: Создание нового курса

// online-courses/app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { Course } from '../../../types';

// GET: Получение списка курсов
export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get('role');
  const instructorId = req.nextUrl.searchParams.get('instructorId');

  try {
    let courses: Course[] = [];
    if (role === 'teacher' && instructorId) {
      courses = await db.getCoursesByInstructor(instructorId);
    } else {
      courses = await db.getAllCourses(); // Получить все опубликованные курсы для студентов
    }
    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error('API /courses GET error:', error);
    return NextResponse.json({ message: 'Ошибка при получении курсов' }, { status: 500 });
  }
}

// POST: Создание нового курса
export async function POST(req: NextRequest) {
  const { title, description, instructorId, price } = await req.json() as { title?: string; description?: string; instructorId?: string; price?: number };

  if (!title || !instructorId || price === undefined) { // Check for undefined price
    return NextResponse.json({ message: 'Отсутствуют необходимые поля для создания курса' }, { status: 400 });
  }

  try {
    const newCourse: Course = {
      id: `course_${Date.now()}`, // Mock ID
      title,
      description: description || '', // Ensure description is string
      instructorId,
      price,
      status: 'draft',
      currency: '',
      category: 'programming',
      isPublished: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      chapters: [],
      studentsEnrolled: 0,
      isArchived: false,
      students: undefined
    };
    
    await db.createCourse(newCourse);
    return NextResponse.json({ success: true, message: 'Курс успешно создан', course: newCourse }, { status: 201 });
  } catch (error) {
    console.error('API /courses POST error:', error);
    return NextResponse.json({ success: false, message: 'Ошибка при создании курса' }, { status: 500 });
  }
}