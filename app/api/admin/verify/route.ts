// =============================================================================
// src/app/api/admin/verify/route.ts - ENDPOINT PARA VERIFICAR ADMIN
// =============================================================================

import { NextResponse } from "next/server";
import { requireAdmin, isUserAdmin } from "@/utils/auth-server";

export async function GET() {
  try {
    // Método 1: Usar requireAdmin (throws error se não for admin)
    const adminUser = await requireAdmin();

    return NextResponse.json({
      isAdmin: true,
      user: {
        id: adminUser.userId,
        email: adminUser.email,
        role: adminUser.role,
      },
      message: "Usuário tem permissões de administrador",
    });
  } catch (error) {
    return NextResponse.json(
      {
        isAdmin: false,
        error: error instanceof Error ? error.message : "Acesso negado",
      },
      { status: 403 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // Verificar se o usuário atual é admin
    await requireAdmin();

    // Verificar se outro usuário é admin
    const isTargetUserAdmin = await isUserAdmin(userId);

    return NextResponse.json({
      userId,
      isAdmin: isTargetUserAdmin,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    );
  }
}
