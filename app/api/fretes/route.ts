// src/app/api/fretes/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Frete = {
  id?: string;
  cidade: string;
  estado: string;
  valor_entrega: number;
};

// GET: Listar fretes ou buscar por cidade/estado
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cidade = searchParams.get("cidade");
  const estado = searchParams.get("estado");

  if (cidade && estado) {
    const { data, error } = await supabase
      .from("fretes")
      .select("*")
      .eq("cidade", cidade)
      .eq("estado", estado)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Erro ao buscar frete por cidade/estado:", error);
      return NextResponse.json(
        { error: "Erro ao buscar dados do frete." },
        { status: 500 }
      );
    }
    return NextResponse.json(data || null);
  } else {
    const { data, error } = await supabase
      .from("fretes")
      .select("*")
      .order("cidade", { ascending: true });

    if (error) {
      console.error("Erro ao listar fretes:", error);
      return NextResponse.json(
        { error: "Erro ao listar fretes." },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
  }
}

// POST: Adicionar um novo frete
export async function POST(request: Request) {
  const body = (await request.json()) as Frete;
  const { cidade, estado, valor_entrega } = body;

  if (!cidade || !estado || valor_entrega === undefined) {
    return NextResponse.json(
      { error: "Cidade, estado e valor_entrega são obrigatórios." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("fretes")
    .insert([{ cidade, estado, valor_entrega }])
    .select();

  if (error) {
    console.error("Erro ao adicionar frete:", error);
    if (error.code === "23505") {
      return NextResponse.json(
        {
          error: "Já existe um frete cadastrado para esta cidade e estado.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao adicionar frete." },
      { status: 500 }
    );
  }

  return NextResponse.json(data[0], { status: 201 });
}

// PUT: Atualizar um frete existente
export async function PUT(request: Request) {
  const body = (await request.json()) as Frete;
  const { id, cidade, estado, valor_entrega } = body;

  if (!id || !cidade || !estado || valor_entrega === undefined) {
    return NextResponse.json(
      {
        error:
          "ID, cidade, estado e valor_entrega são obrigatórios para atualização.",
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("fretes")
    .update({ cidade, estado, valor_entrega })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Erro ao atualizar frete:", error);
    if (error.code === "23505") {
      return NextResponse.json(
        {
          error: "Já existe outro frete cadastrado para esta cidade e estado.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao atualizar frete." },
      { status: 500 }
    );
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: "Frete não encontrado para atualização." },
      { status: 404 }
    );
  }

  return NextResponse.json(data[0], { status: 200 });
}

// DELETE: Remover um frete
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "ID do frete é obrigatório para exclusão." },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("fretes").delete().eq("id", id);

  if (error) {
    console.error("Erro ao deletar frete:", error);
    return NextResponse.json(
      { error: "Erro ao deletar frete." },
      { status: 500 }
    );
  }

  return new Response(null, { status: 204 }); // No Content
}
