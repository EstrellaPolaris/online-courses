import CourseClient from './CourseClient';

export default function CoursePage({ params }: { params: { id: string } }) {
  return <CourseClient courseId={params.id} />;
}
