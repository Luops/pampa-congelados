"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

import type { User_Model } from "@/models/User";

type RegisterData = {
  name: string;
  phone: string;
  city: string;
  neighborhood: string;
  address: string;
  email: string;
  password: string;
  role: number;
};

type User = {
  id: string;
  email: string;
};

type AuthContextType = {
  user: User_Model | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (
    data: RegisterData
  ) => Promise<{ success: boolean; error?: string; user?: User }>;
  sendEmailVerification: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>;
  resendEmailVerification: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: () => {},
  register: async () => ({ success: false }),
  sendEmailVerification: async () => ({ success: false }),
  verifyEmail: async () => ({ success: false }),
  resendEmailVerification: async () => ({ success: false }),
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Função para gerar token de verificação
function generateVerificationToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Função para enviar email de verificação
async function sendVerificationEmail(
  email: string,
  token: string,
  userName: string
) {
  try {
    const verificationLink = `http://localhost:3000/verificar-email?token=${token}`;

    const response = await fetch("/api/send-verification-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        verificationLink,
        userName,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Erro ao enviar email de verificação:", error);
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User_Model | null>(null);
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
        .select("*")
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

      // Verificar se o email foi confirmado
      if (!userData.email_confirmed) {
        return {
          success: false,
          error:
            "Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.",
        };
      }

      // Criar objeto do usuário (sem a senha)
      const userObject: User_Model = {
        id: userData.id,
        created_at: userData.created_at || "",
        name: userData.name ?? "",
        phone: userData.phone ?? "",
        email: userData.email,
        city: userData.city ?? "",
        neighborhood: userData.neighborhood ?? "",
        address: userData.address ?? "",
        password: "",
        role: userData.role ?? 0,
        email_confirmed: userData.email_confirmed ?? false,
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

  const register = async (data: RegisterData) => {
    const { name, phone, city, neighborhood, address, email, password, role } =
      data;

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

      // Gerar token de verificação
      const verificationToken = generateVerificationToken();
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

      // Inserir novo usuário
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            name,
            phone,
            city,
            neighborhood,
            address,
            email,
            password: hashedPassword,
            role,
            email_confirmed: false,
            verification_token: verificationToken,
            verification_token_expiry: tokenExpiry.toISOString(),
          },
        ])
        .select("*")
        .single();

      if (insertError || !newUser) {
        // Check 'insertError'
        console.error("Erro ao criar usuário:", insertError); // Log 'insertError'
        return { success: false, error: "Erro ao criar conta" };
      }

      // Enviar email de verificação
      const emailSent = await sendVerificationEmail(
        email,
        verificationToken,
        name
      );

      if (!emailSent) {
        console.warn("Falha ao enviar email de verificação");
      }

      // Criar objeto do usuário (sem a senha)
      const userObject: User_Model = {
        id: newUser.id,
        created_at: newUser.created_at || "",
        name: newUser.name ?? "",
        phone: newUser.phone ?? "",
        email: newUser.email,
        city: newUser.city ?? "",
        neighborhood: newUser.neighborhood ?? "",
        address: newUser.address ?? "",
        role: newUser.role ?? 0,
        password: "",
        email_confirmed: false,
      };

      return {
        success: true,
        user: userObject,
        message:
          "Conta criada com sucesso! Verifique seu email para ativar a conta.",
      };
    } catch (error) {
      console.error("Erro no registro:", error);
      return { success: false, error: "Erro interno do servidor" };
    } finally {
      setLoading(false);
    }
  };

  const sendEmailVerification = async (email: string) => {
    try {
      // Buscar o usuário
      const { data: userData, error } = await supabase
        .from("users")
        .select("id, name, email_confirmed")
        .eq("email", email)
        .single();

      if (error || !userData) {
        return { success: false, error: "Email não encontrado" };
      }

      if (userData.email_confirmed) {
        return { success: false, error: "Email já foi verificado" };
      }

      // Gerar novo token
      const verificationToken = generateVerificationToken();
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Atualizar token na base de dados
      const { error: updateError } = await supabase
        .from("users")
        .update({
          verification_token: verificationToken,
          verification_token_expiry: tokenExpiry.toISOString(),
        })
        .eq("id", userData.id);

      if (updateError) {
        return { success: false, error: "Erro ao gerar novo token" };
      }

      // Enviar email
      const emailSent = await sendVerificationEmail(
        email,
        verificationToken,
        userData.name
      );

      if (!emailSent) {
        return { success: false, error: "Erro ao enviar email de verificação" };
      }

      return { success: true };
    } catch (error) {
      console.error("Erro ao enviar verificação:", error);
      return { success: false, error: "Erro interno do servidor" };
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      // Buscar usuário pelo token
      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("verification_token", token)
        .single();

      if (error || !userData) {
        return { success: false, error: "Token de verificação inválido" };
      }

      // Verificar se o token não expirou
      const tokenExpiry = new Date(userData.verification_token_expiry);
      if (tokenExpiry < new Date()) {
        return { success: false, error: "Token de verificação expirado" };
      }

      // Verificar se já foi confirmado
      if (userData.email_confirmed) {
        return { success: false, error: "Email já foi verificado" };
      }

      // Atualizar usuário como verificado
      const { error: updateError } = await supabase
        .from("users")
        .update({
          email_confirmed: true,
          verification_token: null,
          verification_token_expiry: null,
        })
        .eq("id", userData.id);

      if (updateError) {
        return { success: false, error: "Erro ao verificar email" };
      }

      return { success: true };
    } catch (error) {
      console.error("Erro na verificação:", error);
      return { success: false, error: "Erro interno do servidor" };
    }
  };

  const resendEmailVerification = async (email: string) => {
    return await sendEmailVerification(email);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        sendEmailVerification,
        verifyEmail,
        resendEmailVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
