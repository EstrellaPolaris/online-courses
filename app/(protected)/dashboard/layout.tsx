import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Этот layout теперь просто оборачивает содержимое,
  // основная проверка ABAC уже сделана в (protected)/layout.tsx
  return (
    <>
      {children}
    </>
  );
}