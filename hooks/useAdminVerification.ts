// =============================================================================
// src/hooks/useAdminVerification.ts - HOOK PARA VERIFICAÇÃO NO FRONTEND
// =============================================================================

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface AdminVerification {
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAdminVerification(): AdminVerification {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const verifyAdmin = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/verify");
      const result = await response.json();

      if (response.ok) {
        setIsAdmin(result.isAdmin);
      } else {
        setIsAdmin(false);
        setError(result.error || "Erro ao verificar permissões");
      }
    } catch (err) {
      setIsAdmin(false);
      setError("Erro de conexão");
      console.error("Erro ao verificar admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      verifyAdmin();
    } else {
      setIsAdmin(false);
      setLoading(false);
      setError(null);
    }
  }, [user]);

  return {
    isAdmin,
    loading,
    error,
    refetch: verifyAdmin,
  };
}