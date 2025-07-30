// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Database } from "./types/supabase";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ADMIN_ROLE = Number(process.env.NEXT_PUBLIC_ADMIN_ROLE);
  // *** ADICIONE ESTE LOG AQUI ***
  console.log("[Middleware] NEXT_PUBLIC_ADMIN_ROLE:", ADMIN_ROLE);
  console.log("[Middleware] Tipo do ADMIN_ROLE:", typeof ADMIN_ROLE);
  // ****************************

  // Verifique se o objeto user está sendo retornado e qual seu conteúdo
  console.log(
    "[Middleware] Supabase User Data:",
    user ? `ID: ${user.id}, Email: ${user.email}` : "NÃO LOGADO"
  );

  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!user) {
      console.log(
        "[Middleware] Usuário NÃO logado para rota /dashboard, redirecionando para /login."
      );
      return NextResponse.redirect(new URL("/login", req.url));
    }

    console.log("[Middleware] Usuário logado, verificando role...");
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    // *** ADICIONE ESTES LOGS AQUI ***
    console.log("[Middleware] User ID (do auth.getUser):", user.id);
    console.log("[Middleware] User Data (do DB):", userData);
    console.log("[Middleware] User Data Role (do DB):", userData?.role);
    console.log(
      "[Middleware] Tipo do User Data Role (do DB):",
      typeof userData?.role
    );

    // ****************************

    if (userError) {
      console.error("[Middleware] Erro ao buscar role do usuário:", userError);
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (!userData || userData.role !== ADMIN_ROLE) {
      console.log(
        "[Middleware] Usuário logado MAS não tem role de ADMIN, redirecionando para /."
      );
      return NextResponse.redirect(new URL("/", req.url));
    }

    console.log("[Middleware] Acesso ao dashboard autorizado.");
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/api/admin/:path*",
    "/api/avaliar-produto",
  ],
};
