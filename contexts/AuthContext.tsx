"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

type User = {
  id: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: () => {},
  register: async () => ({ success: false }),
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há um usuário logado no localStorage
    const checkLoggedUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    checkLoggedUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Buscar o usuário na tabela users
      const { data: userData, error } = await supabase
        .from("users")
        .select("id, email, password")
        .eq("email", email)
        .single();

      if (error || !userData) {
        return { success: false, error: "Email ou senha incorretos" };
      }

      // Verificar a senha com hash
      const isPasswordValid = await bcrypt.compare(password, userData.password);

      if (!isPasswordValid) {
        return { success: false, error: "Email ou senha incorretos" };
      }

      // Criar objeto do usuário (sem a senha)
      const userObject = {
        id: userData.id,
        email: userData.email,
      };

      // Salvar no estado e localStorage
      setUser(userObject);
      localStorage.setItem("user", JSON.stringify(userObject));

      return { success: true };
    } catch (error) {
      console.error("Erro no login:", error);
      return { success: false, error: "Erro interno do servidor" };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Verificar se o email já existe
      const { data: existingUser } = await supabase
        .from("users")
        .select("email")
        .eq("email", email)
        .single();

      if (existingUser) {
        return { success: false, error: "Este email já está cadastrado" };
      }

      // Gerar hash da senha
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Inserir novo usuário
      const { data: newUser, error } = await supabase
        .from("users")
        .insert([{ email, password: hashedPassword }])
        .select("id, email")
        .single();

      if (error) {
        console.error("Erro ao criar usuário:", error);
        return { success: false, error: "Erro ao criar conta" };
      }

      // Fazer login automaticamente após o registro
      const userObject = {
        id: newUser.id,
        email: newUser.email,
      };

      setUser(userObject);
      localStorage.setItem("user", JSON.stringify(userObject));

      return { success: true };
    } catch (error) {
      console.error("Erro no registro:", error);
      return { success: false, error: "Erro interno do servidor" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
