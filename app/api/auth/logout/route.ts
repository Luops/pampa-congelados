// =============================================================================
// src/app/api/auth/logout/route.ts - API DE LOGOUT
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({
      cookies: () => cookieStore,
    });

    // Fazer logout no Supabase
    await supabase.auth.signOut();

    // Criar response e remover cookie de autenticação
    const response = NextResponse.json({
      success: true,
      message: "Logout realizado com sucesso",
    });

    // Remover o cookie de autenticação
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Remove o cookie
    });

    console.log("[Logout] Logout realizado com sucesso");

    return response;
  } catch (error) {
    console.error("[Logout] Erro no logout:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
