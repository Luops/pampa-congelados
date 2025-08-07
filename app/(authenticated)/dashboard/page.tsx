// app/(authenticated)/dashboard/page.tsx
"use client";

import React from "react";

// Components
import { AdminGuard } from "@/components/AdminGuard";
import { DashboardAside } from "@/components/dashboard/DashboardAside";
import ProductList from "@/components/dashboard/ProductList";

// Componente de Loading personalizado
function DashboardLoading() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <p className="text-center font-bold uppercase">
        Verificando permissões...
      </p>
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

// Componente de Acesso Negado personalizado
function AccessDenied() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Acesso Restrito
        </h2>
        <p className="text-gray-600 mb-6">
          Você precisa ter permissões de administrador para acessar esta página.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Voltar ao Início
        </a>
      </div>
    </div>
  );
}

function Dashboard() {
  const [refreshFlag, setRefreshFlag] = React.useState(false);

  return (
    <AdminGuard loading={<DashboardLoading />} fallback={<AccessDenied />}>
      <main className="flex min-h-screen">
        <div className="flex-grow">
          <DashboardAside />
          <ProductList />
        </div>
      </main>
    </AdminGuard>
  );
}

export default Dashboard;
