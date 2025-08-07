// =============================================================================
// src/components/AdminOnly.tsx - COMPONENTE CONDICIONAL
// =============================================================================

"use client";

import { ReactNode } from "react";
import { useAdminVerification } from "@/hooks/useAdminVerification";

interface AdminOnlyProps {
  children: ReactNode;
  showLoading?: boolean;
}

export function AdminOnly({ children, showLoading = false }: AdminOnlyProps) {
  const { isAdmin, loading } = useAdminVerification();

  if (loading && showLoading) {
    return <div className="animate-pulse">Carregando...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}