// src/app/api/products/create/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Este erro deve ser pego na inicialização do servidor, mas é bom garantir.
  console.error(
    "Environment variables SUPABASE_URL and SUPABASE_ANON_KEY must be defined."
  );
  // Em produção, considere uma forma mais robusta de lidar com isso, talvez jogando um erro fatal.
  throw new Error(
    "As variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY devem estar definidas."
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Dados recebidos no backend:", body); // LOG DOS DADOS RECEBIDOS

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
      nutritional_info,
      details,
      category,
    } = body;

    // Validação de Dados (melhorar se necessário)
    if (
      !product_name ||
      !image_url ||
      !description ||
      price === undefined ||
      stock_quantity === undefined
    ) {
      console.error("Validação falhou: Dados mínimos do produto ausentes."); // LOG DE ERRO DE VALIDAÇÃO
      return NextResponse.json(
        { error: "Dados mínimos do produto ausentes." },
        { status: 400 }
      );
    }

    // Tente fazer o parse dos JSONs. Se falhar, o catch geral pegará.
    let parsedNutritionalInfo;
    let parsedDetails;
    try {
      parsedNutritionalInfo = JSON.parse(nutritional_info);
      parsedDetails = JSON.parse(details);
    } catch (parseError: any) {
      console.error(
        "Erro ao fazer parse de JSON (nutritional_info ou details):",
        parseError.message
      ); // LOG DE ERRO DE PARSE
      return NextResponse.json(
        {
          error:
            "Formato JSON inválido para informações nutricionais ou detalhes.",
        },
        { status: 400 }
      );
    }

    // LOG DOS DADOS FINAIS ANTES DA INSERÇÃO
    console.log("Dados formatados para Supabase:", {
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
      nutritional_info: parsedNutritionalInfo,
      details: parsedDetails,
      category,
      created_at: new Date().toISOString(),
    });

    const { data, error } = await supabase
      .from("products") // VERIFIQUE O NOME DA TABELA: 'products'
      .insert([
        {
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
          nutritional_info: parsedNutritionalInfo,
          details: parsedDetails,
          category,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Erro ao inserir produto no Supabase:", error); // LOG DE ERRO DO SUPABASE
      return NextResponse.json(
        { error: "Falha ao cadastrar produto.", details: error.message },
        { status: 500 }
      );
    }

    console.log("Produto cadastrado com sucesso no Supabase:", data); // LOG DE SUCESSO
    return NextResponse.json(
      { message: "Produto cadastrado com sucesso!", product: data[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erro geral na API de criação de produto (catch):", error); // LOG DE ERROS GERAIS
    return NextResponse.json(
      { error: "Erro interno do servidor.", details: error.message },
      { status: 500 }
    );
  }
}
