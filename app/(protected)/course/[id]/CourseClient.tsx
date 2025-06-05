'use client';

type CourseClientProps = {
  courseId: string;
};

export default function CourseClient({ courseId }: CourseClientProps) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Страница курса: {courseId}</h1>
      <p>Здесь будет отображаться детальная информация о курсе.</p>
    </div>
  );
}
