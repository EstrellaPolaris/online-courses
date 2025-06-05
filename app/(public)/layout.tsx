// Общий layout для гостевых маршрутов

import React from 'react';
//import Link from 'next/link'; // Explicitly import Link

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased">
      {/* Public Navigation (can be part of a separate Header component) */}
      {/* Удалено, так как навигация уже есть в корневом layout.tsx */}
      <main>
        {children}
      </main>
    </div>
  );
}