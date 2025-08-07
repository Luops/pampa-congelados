// app/api/avaliar-produto/route.ts
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

    // --- 1. Verificação do Usuário (mantida, é uma boa prática) ---
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
      return NextResponse.json(
        { error: "Usuário não autorizado ou inválido. Verifique seu login." },
        { status: 401 }
      );
    }
    console.log("[API Avaliar Produto] Usuário verificado com sucesso:", userData);

    // --- 2. Verificar se a avaliação já existe ---
    console.log("[API Avaliar Produto] Verificando avaliação existente para user_id:", userId, "e produto_id:", productId);
    const { data: existingRating, error: fetchError } = await supabase
      .from("avaliacoes")
      .select("id, nota") // Seleciona o ID e a nota para saber qual é a avaliação atual
      .eq("user_id", userId)
      .eq("produto_id", productId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 é "No rows found" para single()
      console.error("[API Avaliar Produto] Erro ao buscar avaliação existente:", fetchError.message, fetchError);
      return NextResponse.json(
        { error: `Erro ao verificar avaliação existente: ${fetchError.message}` },
        { status: 500 }
      );
    }

    let message = "";
    if (existingRating) {
      // --- 3. Se a avaliação existe, atualiza ---
      console.log(`[API Avaliar Produto] Avaliação existente encontrada (ID: ${existingRating.id}), atualizando nota de ${existingRating.nota} para ${rating}...`);
      const { error: updateError } = await supabase
        .from("avaliacoes")
        .update({ nota: rating, updated_at: new Date().toISOString() }) // Adicione `updated_at` se tiver na sua tabela
        .eq("id", existingRating.id);

      if (updateError) {
        console.error("[API Avaliar Produto] Erro ao atualizar avaliação:", updateError.message, updateError);
        return NextResponse.json(
          { error: `Erro ao atualizar avaliação: ${updateError.message}` },
          { status: 500 }
        );
      }
      message = "Avaliação atualizada com sucesso!";
      console.log("[API Avaliar Produto] Avaliação atualizada com sucesso!");

    } else {
      // --- 4. Se a avaliação NÃO existe, insere ---
      console.log("[API Avaliar Produto] Nenhuma avaliação existente, inserindo nova...");
      const { error: insertError } = await supabase.from("avaliacoes").insert({
        produto_id: productId,
        user_id: userId,
        nota: rating,
        product_name: product_name || null,
      });

      if (insertError) {
        // Embora tenhamos verificado antes, a constraint UNIQUE ainda pode ser acionada por corrida.
        // É bom manter o tratamento, mas não deveria ser mais o caminho principal para atualizações.
        if (insertError.code === "23505") {
          console.warn("[API Avaliar Produto] Violação de UNIQUE constraint durante inserção: Usuário já avaliou este produto. (Isso não deveria acontecer se a busca funcionou)");
          message = "Você já avaliou este produto. Sua avaliação foi atualizada."; // Mensagem ajustada para o caso improvável
        } else {
          console.error("[API Avaliar Produto] Erro ao inserir avaliação no Supabase:", insertError.message, insertError);
          return NextResponse.json(
            { error: `Erro ao enviar avaliação: ${insertError.message}` },
            { status: 500 }
          );
        }
      } else {
        message = "Avaliação enviada com sucesso!";
        console.log("[API Avaliar Produto] Nova avaliação inserida com sucesso!");
      }
    }

    // --- 5. Opcional: Recalcular média e total de avaliações do produto (no banco de dados) ---
    // Esta é uma etapa crucial para manter os dados `avaliacao` e `totalAvaliacoes` no seu produto atualizados.
    // O ideal é que isso seja feito com uma função de banco de dados (trigger ou stored procedure)
    // para garantir atomicidade e consistência.
    // Exemplo de como você faria aqui no lado do servidor (menos ideal para consistência em alta escala):

    // Primeiro, busque todas as avaliações para este produto
    const { data: productRatings, error: productRatingsError } = await supabase
        .from('avaliacoes')
        .select('nota')
        .eq('produto_id', productId);

    if (productRatingsError) {
        console.error("Erro ao buscar avaliações para recalcular média:", productRatingsError);
        // Não é um erro crítico para a avaliação em si, mas os totais podem estar desatualizados
    } else {
        const totalRatings = productRatings.length;
        const sumRatings = productRatings.reduce((sum, current) => sum + current.nota, 0);
        const averageRating = totalRatings > 0 ? (sumRatings / totalRatings) : 0;

        // Atualize a tabela `products` (ou onde quer que você armazene `reviews_stars_by_person` e `reviews_count`)
        const { error: updateProductError } = await supabase
            .from('products')
            .update({
                reviews_stars_by_person: averageRating, // Média da avaliação
                reviews_count: totalRatings              // Total de avaliações
            })
            .eq('id', productId);

        if (updateProductError) {
            console.error("Erro ao atualizar reviews_stars_by_person/reviews_count do produto:", updateProductError);
        } else {
            console.log(`[API Avaliar Produto] Média do produto ${productId} atualizada para ${averageRating}, total de ${totalRatings} avaliações.`);
        }
    }


    return NextResponse.json({ message: message });

  } catch (error: any) {
    console.error(
      "[API Avaliar Produto] Erro inesperado no bloco try/catch:",
      error.message,
      error
    );
    return NextResponse.json(
      { error: `Erro interno do servidor: ${error.message}` },
      { status: 500 }
    );
  }
}