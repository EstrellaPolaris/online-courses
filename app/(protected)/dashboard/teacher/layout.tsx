// Панель управления с разделением по ролям
// Макет дашборда с ABAC-проверкой (проверка JWT и OPA)

// online-courses/app/(protected)/dashboard/teacher/layout.tsx
import React from 'react';

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Здесь может быть специфичная для преподавателя навигация или сайдбар */}
      {children}
    </div>
  );
}