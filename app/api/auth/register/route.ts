// =============================================================================
// src/app/api/auth/register/route.ts - REGISTRO SEGURO CORRIGIDO
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { encryptRole } from "@/utils/crypto";

export async function POST(request: NextRequest) {
  try {
    const { name, phone, city, neighborhood, address, email, password, role } =
      await request.json();

    console.log("[Register] Dados recebidos:", { name, email, role });

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, error: "Dados obrigatórios não fornecidos" },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = createServerComponentClient({
      cookies: () => cookieStore,
    });

    // 1. Criar usuário no Supabase Auth
    console.log("[Register] Criando usuário no Supabase Auth...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error("[Register] Erro no Supabase Auth:", authError);
      return NextResponse.json(
        { success: false, error: authError.message || "Erro ao criar conta" },
        { status: 400 }
      );
    }

    if (!authData.user) {
      console.error("[Register] Usuário não criado no Supabase Auth");
      return NextResponse.json(
        { success: false, error: "Falha ao criar usuário" },
        { status: 400 }
      );
    }

    // 2. Criptografar role e salvar dados do usuário
    console.log("[Register] Criptografando role:", role);
    const encryptedRole = encryptRole(role);
    console.log("[Register] Role criptografada:", encryptedRole);

    const userData = {
      id: authData.user.id,
      name,
      phone,
      city,
      neighborhood,
      address,
      email,
      role: encryptedRole,
    };

    console.log("[Register] Inserindo dados do usuário:", userData);

    const { error: insertError } = await supabase
      .from("users")
      .insert([userData]);

    if (insertError) {
      console.error("[Register] Erro ao criar perfil:", insertError);
      return NextResponse.json(
        { success: false, error: "Erro ao criar perfil do usuário" },
        { status: 500 }
      );
    }

    // 3. Determinar se o usuário é admin
    const adminRole = parseInt(
      process.env.NEXT_PUBLIC_ROLE_ADMIN_ENCRYPTED || "202507"
    );

    const userRole = parseInt(process.env.ROLE_USER_ENCRYPTED || "102030");

    console.log(
      "[Register] Comparando roles - Recebido:",
      role,
      "Admin:",
      adminRole,
      "User:",
      userRole
    );

    const userObject = {
      id: authData.user.id,
      email: authData.user.email!,
      name,
      phone,
      city,
      neighborhood,
      address,
      isAdmin: role === adminRole,
      created_at: authData.user.created_at,
    };

    console.log("[Register] Usuário criado com sucesso:", userObject);

    return NextResponse.json({
      success: true,
      user: userObject,
      message: "Conta criada com sucesso! Verifique seu email.",
    });
  } catch (error) {
    console.error("[Register] Erro no registro:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
