// =============================================================================
// src/utils/auth-server.ts - UTILITÁRIOS DE VERIFICAÇÃO SERVER-SIDE COM DEBUG
// =============================================================================

import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { decryptRole, mapKnownRoles } from "@/utils/crypto";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this"
);

export interface AuthUser {
  userId: string;
  name: string;
  role: number;
  email: string;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      console.log("[getAuthUser] Token não encontrado");
      return null;
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    const user = {
      userId: payload.userId as string,
      name: payload.name as string,
      role: payload.role as number,
      email: payload.email as string,
    };

    console.log(`[getAuthUser] Usuário encontrado: ${user.email}, Role: ${user.role}`);
    return user;
  } catch (error) {
    console.error("[getAuthUser] Erro ao verificar token:", error);
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("Não autenticado");
  }
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  const adminRole = parseInt(
    process.env.NEXT_PUBLIC_ROLE_ADMIN_ENCRYPTED || "202507"
  );

  console.log(`[requireAdmin] Comparando roles - Usuário: ${user.role}, Admin: ${adminRole}`);

  if (user.role !== adminRole) {
    throw new Error("Acesso negado: permissões de administrador necessárias");
  }

  return user;
}

export async function isUserAdmin(userId?: string): Promise<boolean> {
  try {
    // Se não foi fornecido userId, usa o usuário atual do token
    if (!userId) {
      const user = await getAuthUser();
      if (!user) {
        console.log("[isUserAdmin] Usuário não encontrado no token");
        return false;
      }
      userId = user.userId;
    }

    console.log(`[isUserAdmin] Verificando admin para userId: ${userId}`);

    // Busca diretamente no banco para garantir dados atualizados
    const cookieStore = cookies();
    const supabase = createServerComponentClient({
      cookies: () => cookieStore,
    });

    const { data: userData, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (error || !userData) {
      console.log(`[isUserAdmin] Erro ao buscar usuário no banco:`, error);
      return false;
    }

    console.log(`[isUserAdmin] Dados do usuário no banco:`, userData);

    // Descriptografa a role OU usa valor direto se for número
    let userRole = 0;
    if (userData.role) {
      try {
        // Primeiro tentar mapear roles conhecidas
        userRole = mapKnownRoles(userData.role);
        
        if (userRole === 0) {
          // Se não foi mapeada, tentar descriptografar
          if (typeof userData.role === "string" && userData.role.includes(":")) {
            // Role está no formato criptografado correto
            userRole = decryptRole(userData.role);
            console.log(`[isUserAdmin] Role descriptografada: ${userRole}`);
          } else {
            // Role é um número simples ou hash
            userRole = decryptRole(userData.role);
            console.log(`[isUserAdmin] Role processada: ${userRole}`);
          }
        }
      } catch (error) {
        console.error("[isUserAdmin] Erro ao processar role:", error);
        return false;
      }
    }

    const adminRole = parseInt(
      process.env.NEXT_PUBLIC_ROLE_ADMIN_ENCRYPTED || "202507"
    );

    console.log(`[isUserAdmin] Comparação final - Usuário: ${userRole}, Admin: ${adminRole}`);
    const isAdmin = userRole === adminRole;
    console.log(`[isUserAdmin] Resultado: ${isAdmin}`);

    return isAdmin;
  } catch (error) {
    console.error("[isUserAdmin] Erro ao verificar se usuário é admin:", error);
    return false;
  }
}

// Função para verificar permissões específicas
export async function hasPermission(permission: string): Promise<boolean> {
  try {
    const user = await getAuthUser();
    if (!user) return false;

    const isAdmin = await isUserAdmin(user.userId);

    // Admins têm todas as permissões
    if (isAdmin) return true;

    // Aqui você pode implementar lógica de permissões específicas
    // Por exemplo, verificar em uma tabela de permissões

    return false;
  } catch (error) {
    console.error("Erro ao verificar permissão:", error);
    return false;
  }
}