// =============================================================================
// src/contexts/AuthContext.tsx - CONTEXT SEGURO
// =============================================================================

"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type User_Model = {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  city?: string;
  neighborhood?: string;
  address?: string;
  isAdmin: boolean; // Ao invés de role numérica
  created_at?: string;
  role: string;
};

export type RegisterData = {
  name: string;
  phone: string;
  city: string;
  neighborhood: string;
  address: string;
  email: string;
  password: string;
  role: string;
};

type AuthContextType = {
  user: User_Model | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string; user?: User_Model }>;
  sendEmailVerification: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: async () => ({ success: false }),
  register: async () => ({ success: false }),
  sendEmailVerification: async () => ({ success: false }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User_Model | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticação no carregamento
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUser(result.user);
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: "Erro interno do servidor" };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Erro ao fazer logout" };
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return { success: true, user: result.user };
      }

      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: "Erro interno do servidor durante o registro" };
    } finally {
      setLoading(false);
    }
  };

  const sendEmailVerification = async (email: string) => {
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        return { success: true, message: result.message };
      }

      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: "Erro interno do servidor" };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      register, 
      sendEmailVerification 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export const useIsAuthenticated = () => {
  const { user, loading } = useAuth();
  return { isAuthenticated: !!user, user, loading };
};