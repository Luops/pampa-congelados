import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this"
);

async function getAuthFromCookie(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      role: payload.role as number,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  console.log(`[Middleware] ${req.method} ${req.nextUrl.pathname}`);

  // Rotas que precisam de autenticação
  const protectedRoutes = ["/dashboard", "/admin"];
  const adminRoutes = ["/dashboard", "/admin", "/api/admin"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  const isAdminRoute = adminRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute || isAdminRoute) {
    const authUser = await getAuthFromCookie(req);

    // Verificar autenticação
    if (!authUser) {
      console.log("[Middleware] Usuário não autenticado");

      if (req.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/", req.url));
    }

    console.log(
      `[Middleware] Usuário autenticado: ${authUser.email}, Role: ${authUser.role}`
    );

    // Verificar permissões de admin para rotas administrativas
    if (isAdminRoute) {
      // CORREÇÃO: Usar a mesma variável que auth-server.ts
      const adminRole = parseInt(
        process.env.NEXT_PUBLIC_ROLE_ADMIN_ENCRYPTED || "202507"
      );

      console.log(
        `[Middleware] Comparando roles - Usuário: ${authUser.role}, Admin: ${adminRole}`
      );

      if (authUser.role !== adminRole) {
        console.log(
          `[Middleware] Usuário ${authUser.email} não tem permissões de admin (${authUser.role} !== ${adminRole})`
        );

        if (req.nextUrl.pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Acesso negado: permissões de administrador necessárias" },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL("/", req.url));
      }

      console.log(`[Middleware] Admin verificado: ${authUser.email}`);
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/auth/:path*",
  ],
};
