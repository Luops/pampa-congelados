import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Chamada dentro de cada rota (GET, PATCH, etc.)
function getSupabaseClient() {
  const cookieStore = cookies(); // Chama cookies() dentro de uma função para garantir o contexto da requisição

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set(name, value, options);
      },
      remove(name: string, options: any) {
        cookieStore.delete(name, options);
      },
    },
  });
}

// Rota para deletar um produto pelo ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "ID do produto não fornecido para atualização." },
      { status: 400 }
    );
  }

  // Crie uma nova instância do cliente Supabase para esta requisição
  const supabase = getSupabaseClient();
  try {
    // Consulta SQL para buscar o produto. Use $1 para evitar SQL Injection.
    const { data: error, count } = await supabase
      .from("products")
      .delete({ count: "exact" }) // Adiciona { count: 'exact' } para obter a contagem de linhas afetadas
      .eq("id", id); // Filtra pelo ID

    if (error) {
      console.error("Erro do Supabase ao deletar produto:", error);
      return NextResponse.json(
        { error: "Falha ao deletar o produto." },
        { status: 500 }
      );
    }

    // Se count for 0, significa que nenhum produto com esse ID foi encontrado e deletado.
    if (count === 0) {
      console.log("Produto não encontrado para exclusão.");
      return NextResponse.json(
        { error: "Produto não encontrado para exclusão." },
        { status: 404 }
      );
    }

    // Retorna uma resposta de sucesso
    return NextResponse.json(
      { message: "Produto deletado com sucesso!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    return NextResponse.json(
      { error: "Falha ao deletar o produto." },
      { status: 500 }
    );
  }
}
