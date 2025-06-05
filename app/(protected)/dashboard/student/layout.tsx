// online-courses/app/(protected)/dashboard/student/layout.tsx
import React from 'react';

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Здесь может быть специфичная для студента навигация или сайдбар */}
      {children}
    </div>
  );
}