import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Database } from "@/types/supabase";

export async function POST(request: Request) {
  const { productId, rating, userId, product_name } = await request.json();

  console.log("[API Avaliar Produto] Recebidos:", { productId, rating, userId, product_name });

  if (!productId || typeof rating !== "number" || rating < 1 || rating > 5) {
    console.error("[API Avaliar Produto] Dados de avaliação inválidos.");
    return NextResponse.json(
      { error: "Dados de avaliação inválidos." },
      { status: 400 }
    );
  }

  if (!userId) {
    console.error("[API Avaliar Produto] ID do usuário é obrigatório.");
    return NextResponse.json(
      { error: "ID do usuário é obrigatório." },
      { status: 400 }
    );
  }

  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // --- 1. Verificação do Usuário ---
    console.log("[API Avaliar Produto] Verificando usuário na tabela 'users' com ID:", userId);
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      console.error(
        "[API Avaliar Produto] Erro ao verificar usuário ou usuário não encontrado:",
        userError?.message || "Usuário não encontrado."
      );
      // Certifique-se de que a mensagem de erro aqui é descritiva para o frontend
      return NextResponse.json(
        { error: "Usuário não autorizado ou inválido. Verifique seu login." }, // Mensagem mais amigável
        { status: 401 }
      );
    }
    console.log("[API Avaliar Produto] Usuário verificado com sucesso:", userData);

    // --- 2. Inserção da Avaliação ---
    console.log("[API Avaliar Produto] Tentando inserir avaliação...");
    const { error: insertError } = await supabase.from("avaliacoes").insert({
      produto_id: productId,
      user_id: userId,
      nota: rating,
      product_name: product_name || null,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        console.warn("[API Avaliar Produto] Violação de UNIQUE constraint: Usuário já avaliou este produto.");
        return NextResponse.json(
          { error: "Você já avaliou este produto." },
          { status: 409 } // Conflict
        );
      }
      console.error(
        "[API Avaliar Produto] Erro ao inserir avaliação no Supabase:",
        insertError.message,
        insertError // Log completo do objeto de erro
      );
      // Retorne uma mensagem de erro mais detalhada do Supabase se disponível
      return NextResponse.json(
        { error: `Erro ao enviar avaliação: ${insertError.message}` },
        { status: 500 }
      );
    }

    console.log("[API Avaliar Produto] Avaliação enviada com sucesso!");
    return NextResponse.json({ message: "Avaliação enviada com sucesso!" });
  } catch (error: any) {
    console.error(
      "[API Avaliar Produto] Erro inesperado no bloco try/catch:",
      error.message,
      error // Log completo do objeto de erro
    );
    // Certifique-se de que o erro é stringificado para ser enviado corretamente
    return NextResponse.json(
      { error: `Erro interno do servidor: ${error.message}` },
      { status: 500 }
    );
  }
}