// =============================================================================
// src/app/api/auth/me/route.ts - VERIFICAR USUÁRIO ATUAL
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, isUserAdmin } from "@/utils/auth-server";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Verificar se é admin usando a função do banco
    const isAdmin = await isUserAdmin(authUser.userId);

    const userObject = {
      id: authUser.userId,
      name: authUser.name,
      email: authUser.email,
      isAdmin,
      role: authUser.role
    };

    console.log("[Auth Me] Usuário autenticado:", userObject);

    return NextResponse.json({
      success: true,
      user: userObject,
    });
  } catch (error) {
    console.error("[Auth Me] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}