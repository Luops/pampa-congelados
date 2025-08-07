// app/auth/confirm/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Separate the component that uses useSearchParams
function AuthConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Confirmando seu email...");
  const supabase = createClientComponentClient();

  useEffect(() => {
    // A função getSession() tentará ler a sessão dos cookies (que o middleware deveria ter setado)
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session) {
          // Se há uma sessão, o email foi confirmado e o usuário está logado.
          setMessage(
            "Email confirmado com sucesso! Redirecionando para o dashboard..."
          );
          // Redirecione para a rota que um usuário logado deve acessar
          setTimeout(() => router.push("/dashboard"), 2000);
        } else {
          // Se não há sessão, verifica se há mensagens de erro do Supabase na URL
          const errorDescription = searchParams.get("error_description");
          if (errorDescription) {
            setMessage(
              `Erro na confirmação: ${decodeURIComponent(
                errorDescription
              )}. Por favor, tente fazer login.`
            );
          } else {
            // Caso genérico: sessão não encontrada e sem erro específico do Supabase na URL.
            // Isso pode acontecer se o link expirou, já foi usado, ou o middleware falhou silenciosamente.
            setMessage(
              "Não foi possível confirmar o email automaticamente. Por favor, tente fazer login."
            );
          }
          setTimeout(() => router.push("/login"), 5000);
        }
      })
      .catch((err) => {
        console.error("Erro ao obter sessão na página de confirmação:", err);
        setMessage(
          "Ocorreu um erro ao verificar sua sessão. Por favor, tente fazer login."
        );
        setTimeout(() => router.push("/login"), 5000);
      });

    // Opcional: Limpar os parâmetros da URL para uma aparência mais limpa
    const urlWithoutParams = window.location.origin + window.location.pathname;
    if (window.location.href !== urlWithoutParams) {
      router.replace(urlWithoutParams, { shallow: true });
    }
  }, [searchParams, router, supabase.auth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Confirmação de Email
        </h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        {/* Adicione um spinner se ainda estiver processando, ou um ícone de sucesso/erro */}
        {message.includes("Confirmando") && ( // Condição simples para exibir spinner
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        )}
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function AuthConfirmLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Confirmação de Email
        </h2>
        <p className="mt-2 text-sm text-gray-600">Carregando...</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
}

// Main component wrapped with Suspense
export default function AuthConfirmPage() {
  return (
    <Suspense fallback={<AuthConfirmLoading />}>
      <AuthConfirmContent />
    </Suspense>
  );
}
