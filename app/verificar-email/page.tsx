// app/verify-email/page.tsx
// Não use "use client" aqui! Este é um Server Component.

import { Suspense } from "react";
import VerifyEmailContent from "./VerifyEmailContent"; // Importe o novo componente

export default function VerifyEmailPage() {
  return (
    // Envolva o componente cliente em Suspense.
    // Isso garante que o componente client-side não será renderizado no servidor
    // e evitará o erro de pré-renderização.
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
