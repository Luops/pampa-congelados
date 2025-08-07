// =============================================================================
// src/components/AdminGuard.tsx - COMPONENTE PROTETOR
// =============================================================================

"use client";

import { ReactNode } from "react";
import { useAdminVerification } from "@/hooks/useAdminVerification";

interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
}

export function AdminGuard({
  children,
  fallback = <div>Acesso negado: Permissões de administrador necessárias</div>,
  loading = <div>Verificando permissões...</div>,
}: AdminGuardProps) {
  const { isAdmin, loading: isLoading } = useAdminVerification();

  if (isLoading) {
    return <>{loading}</>;
  }

  if (!isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
