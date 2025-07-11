import { writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { mkdirSync, existsSync } from "fs";
import { supabase } from "../../../lib/supabaseClient";

// Proteção contra variáveis ausentes
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  throw new Error("Variáveis de ambiente do Supabase não configuradas.");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo recebido." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const filePath = `slider/${fileName}`; // subpasta opcional, remove se quiser na raiz

    const { data, error } = await supabase.storage
      .from("images")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Erro no upload:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Obter a URL pública
    const { data: publicData } = supabase.storage
      .from("images")
      .getPublicUrl(filePath);

    return NextResponse.json({ imageUrl: publicData.publicUrl });
  } catch (error) {
    console.error("Erro inesperado no upload:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
