// utils/auth.ts - Utilitários para trabalhar com dados do usuário
import { cookies } from "next/headers";

export interface UserData {
  id: string;
  name: string;
  role: number;
  email: string;
}

// Função para ler dados do usuário dos cookies (server-side)
export function getUserFromCookies(): UserData | null {
  const cookieStore = cookies();

  const userId = cookieStore.get("user_id")?.value;
  const userName = cookieStore.get("user_name")?.value;
  const userRole = cookieStore.get("user_role")?.value;
  const userEmail = cookieStore.get("user_email")?.value;

  if (!userId || !userRole) {
    return null;
  }

  return {
    id: userId,
    name: userName || "",
    role: parseInt(userRole),
    email: userEmail || "",
  };
}

// Função para limpar cookies do usuário
export function clearUserCookies() {
  const cookieStore = cookies();

  cookieStore.delete("user_id");
  cookieStore.delete("user_name");
  cookieStore.delete("user_role");
  cookieStore.delete("user_email");
}
