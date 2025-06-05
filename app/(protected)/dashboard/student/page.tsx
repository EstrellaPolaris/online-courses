// Главная страница дашборда студента

// online-courses/app/(protected)/dashboard/student/page.tsx
'use client';
import React from 'react';
import { StudentDashboard } from '@/components/protected/student/StudentDashboard'; // Corrected path

export default function StudentDashboardPage() {
  return <StudentDashboard />;
}