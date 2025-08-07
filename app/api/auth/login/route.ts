// =============================================================================
// src/app/api/auth/login/route.ts - API DE LOGIN
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { decryptRole } from "@/utils/crypto";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this"
);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log("[Login] Tentativa de login para:", email);

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = createServerComponentClient({
      cookies: () => cookieStore,
    });

    // 1. Autenticar com Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError || !authData.user) {
      console.log("[Login] Erro na autenticação:", authError?.message);
      return NextResponse.json(
        { success: false, error: "Email ou senha incorretos" },
        { status: 401 }
      );
    }

    // 2. Buscar dados do usuário na tabela users
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (userError || !userData) {
      console.error("[Login] Erro ao buscar dados do usuário:", userError);
      return NextResponse.json(
        { success: false, error: "Erro ao carregar dados do usuário" },
        { status: 500 }
      );
    }

    // 3. Descriptografar role
    let userRole = 0;
    if (userData.role) {
      try {
        if (typeof userData.role === "string" && userData.role.includes(":")) {
          userRole = decryptRole(userData.role);
        } else {
          userRole = parseInt(userData.role.toString());
        }
      } catch (error) {
        console.error("[Login] Erro ao descriptografar role:", error);
        userRole = 0;
      }
    }

    console.log("[Login] Role descriptografada:", userRole);

    // 4. Criar token JWT
    const token = await new SignJWT({
      userId: authData.user.id,
      email: authData.user.email,
      name: userData.name,
      role: userRole,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    // 5. Definir cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: userData.name,
        phone: userData.phone,
        city: userData.city,
        neighborhood: userData.neighborhood,
        address: userData.address,
        isAdmin:
          userRole ===
          parseInt(process.env.NEXT_PUBLIC_ROLE_ADMIN_ENCRYPTED || "202507"),
        created_at: authData.user.created_at,
        role: userRole || 0,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    console.log("[Login] Login realizado com sucesso para:", email);

    return response;
  } catch (error) {
    console.error("[Login] Erro no login:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
