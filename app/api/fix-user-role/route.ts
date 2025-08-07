// =============================================================================
// fix-user-role.ts - SCRIPT PARA CORRIGIR ROLE DO USUÁRIO
// =============================================================================

// Crie uma API route temporária: /api/fix-user-role/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    console.log("[Fix Role] Corrigindo role para:", email);
    
    const cookieStore = cookies();
    const supabase = createServerComponentClient({
      cookies: () => cookieStore,
    });

    // Buscar o usuário
    const { data: userData, error: findError } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("email", email)
      .single();

    if (findError || !userData) {
      return NextResponse.json({
        success: false,
        error: "Usuário não encontrado"
      });
    }

    console.log("[Fix Role] Usuário encontrado:", userData);

    // Atualizar a role para 202507 (admin) como número simples
    const { error: updateError } = await supabase
      .from("users")
      .update({ role: "202507" })
      .eq("id", userData.id);

    if (updateError) {
      console.error("[Fix Role] Erro ao atualizar:", updateError);
      return NextResponse.json({
        success: false,
        error: updateError.message
      });
    }

    console.log("[Fix Role] Role atualizada com sucesso");

    return NextResponse.json({
      success: true,
      message: `Role do usuário ${email} atualizada para 202507`,
      oldRole: userData.role,
      newRole: "202507"
    });

  } catch (error) {
    console.error("[Fix Role] Erro:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// Para usar este script:
// 1. Crie o arquivo /api/fix-user-role/route.ts com este código
// 2. Faça uma requisição POST para /api/fix-user-role
// 3. Com o body: { "email": "fabricio.rioslopes@gmail.com" }