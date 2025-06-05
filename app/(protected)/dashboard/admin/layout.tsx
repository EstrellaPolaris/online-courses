// Макет для страниц администратора

// online-courses/app/(protected)/dashboard/admin/layout.tsx
import React from 'react';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Здесь может быть специфичная для администратора навигация или сайдбар */}
      {children}
    </div>
  );
}
