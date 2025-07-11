// app/verify-email/VerifyEmailContent.tsx
"use client"; // Esta diretiva é crucial AQUI!

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext"; // Ajuste o caminho conforme necessário

export default function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams(); // Continua usando aqui
  const { verifyEmail, resendEmailVerification } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      handleVerification(token);
    } else {
      setStatus("error");
      setMessage("Token de verificação não fornecido.");
    }
  }, [searchParams, verifyEmail]); // Adicione verifyEmail como dependência

  const handleVerification = async (token: string) => {
    try {
      const result = await verifyEmail(token);

      if (result.success) {
        setStatus("success");
        setMessage(
          "Email verificado com sucesso! Você pode fazer login agora."
        );
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setStatus("error");
        // Se o erro for 'Email já foi verificado', você pode não mostrar o form de reenviar
        setMessage(result.error || "Erro ao verificar email");
        // Se o erro indicar que o email já foi verificado, talvez não precise do campo de email para reenviar
        // if (result.error?.includes("já foi verificado")) {
        //   // Opcional: preencher o email se puder recuperar da URL ou do estado
        // }
      }
    } catch (error) {
      setStatus("error");
      setMessage("Erro interno do servidor.");
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage("Por favor, insira seu email.");
      return;
    }

    setIsResending(true);

    try {
      const result = await resendEmailVerification(email);

      if (result.success) {
        setMessage(
          "Email de verificação enviado! Verifique sua caixa de entrada."
        );
      } else {
        setMessage(result.error || "Erro ao enviar email.");
      }
    } catch (error) {
      setMessage("Erro interno do servidor.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verificação de Email
          </h2>
        </div>

        {status === "loading" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verificando seu email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="rounded-full h-12 w-12 bg-green-100 mx-auto flex items-center justify-center">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-green-800">
              Email Verificado!
            </h3>
            <p className="mt-2 text-sm text-gray-600">{message}</p>
            <p className="mt-4 text-sm text-gray-500">
              Redirecionando para login em alguns segundos...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="rounded-full h-12 w-12 bg-red-100 mx-auto flex items-center justify-center">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-red-800">
              Erro na Verificação
            </h3>
            <p className="mt-2 text-sm text-gray-600">{message}</p>

            {/* Formulário para reenviar email */}
            <div className="mt-6 border-t pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">
                Reenviar Email de Verificação
              </h4>
              <form onSubmit={handleResendVerification} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isResending}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isResending ? "Enviando..." : "Reenviar Email"}
                </button>
              </form>
            </div>

            <div className="mt-6">
              <button
                onClick={() => router.push("/login")}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                Voltar para Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
