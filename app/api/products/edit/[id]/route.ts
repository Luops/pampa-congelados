// Importe o cliente do PostgreSQL
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "ID do produto não fornecido." },
      { status: 400 }
    );
  }

  // Crie uma nova instância do cliente Supabase para esta requisição
  const supabase = getSupabaseClient();
  try {
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id) // Filtra pelo ID
      .single(); // Usa .single() para esperar um único resultado ou nulo

    if (error) {
      console.error("Erro do Supabase ao buscar produto:", error);
      // O erro.code 'PGRST116' é comum quando .single() não encontra linhas
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Produto não encontrado." },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Falha ao buscar o produto." },
        { status: 500 }
      );
    }

    if (!product) {
      // Confirma que um produto foi encontrado
      return NextResponse.json(
        { error: "Produto não encontrado." },
        { status: 404 }
      );
    }

    // Retorne os dados do produto
    return NextResponse.json(product, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao buscar produto:", error);
    return NextResponse.json(
      {
        error: "Falha ao buscar o produto.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
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
    const body = await request.json();

    // Campos que você espera no body para atualização
    const {
      product_name,
      image_url,
      description,
      reviews_stars_by_person,
      reviews_count,
      price,
      promo_price,
      stock_quantity,
      ingredients,
      preparation,
      nutritional_info, // Supabase client lida com objetos JSON/JSONB diretamente
      details, // Supabase client lida com objetos JSON/JSONB diretamente
      category,
    } = body;

    // Constrói o objeto de atualização com os campos recebidos
    const updateData: { [key: string]: any } = {};
    if (product_name !== undefined) updateData.product_name = product_name;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (description !== undefined) updateData.description = description;
    if (reviews_stars_by_person !== undefined)
      updateData.reviews_stars_by_person = reviews_stars_by_person;
    if (reviews_count !== undefined) updateData.reviews_count = reviews_count;
    if (price !== undefined) updateData.price = price;
    if (promo_price !== undefined) updateData.promo_price = promo_price;
    if (stock_quantity !== undefined)
      updateData.stock_quantity = stock_quantity;
    if (ingredients !== undefined) updateData.ingredients = ingredients;
    if (preparation !== undefined) updateData.preparation = preparation;
    if (nutritional_info !== undefined)
      updateData.nutritional_info = nutritional_info;
    if (details !== undefined) updateData.details = details;
    if (category !== undefined) updateData.category = category;

    // Usa o builder de query do Supabase para atualizar o produto
    const { data: updatedProduct, error } = await supabase
      .from("products")
      .update(updateData) // Objeto com os campos a serem atualizados
      .eq("id", id) // Filtra pelo ID
      .select() // Retorna o registro atualizado
      .single(); // Espera um único registro atualizado

    if (error) {
      console.error("Erro do Supabase no processo de edição (PATCH):", error);
      return NextResponse.json(
        { error: "Falha ao editar o produto." },
        { status: 500 }
      );
    }

    if (!updatedProduct) {
      return NextResponse.json(
        { error: "Produto não encontrado para atualização." },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProduct, { status: 200 });
    
  } catch (error: any) {
    console.error("Erro no processo de edição (PATCH):", error);
    return NextResponse.json(
      { error: "Falha ao editar o produto." },
      { status: 500 }
    );
  }
}
