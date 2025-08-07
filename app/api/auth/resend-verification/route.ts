// =============================================================================
// src/app/api/auth/resend-verification/route.ts - REENVIO DE VERIFICAÇÃO
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = createServerComponentClient({
      cookies: () => cookieStore,
    });

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Email de verificação reenviado. Verifique sua caixa de entrada.",
    });
  } catch (error) {
    console.error("Erro ao reenviar verificação:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
