import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/isAdmin";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");

  const { authorized, reason, user } = await isAdmin(token);

  if (!authorized) {
    return NextResponse.json({ error: reason }, { status: 403 });
  }

  // Acesso liberado
  return NextResponse.json({
    message: "Acesso concedido à rota protegida",
    user,
  });
}
