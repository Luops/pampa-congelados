import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers"; // A função cookies() é importada daqui

export async function GET(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "As variáveis de ambiente do Supabase não estão configuradas." },
      { status: 500 }
    );
  }

  // A função cookies() é chamada aqui. O Next.js gerencia isso internamente.
  const cookieStore = cookies();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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

  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = Number(searchParams.get("limit")) || 8;
    const offset = Number(searchParams.get("offset")) || 0;
    const searchQuery = searchParams.get("q") || "";

    let query = supabase
      .from("products")
      .select(
        "id, product_name, description, price, promo_price, image_url, stock_quantity, created_at"
      )
      .order("created_at", { ascending: false });

    if (searchQuery) {
      query = query.ilike("product_name", `%${searchQuery}%`);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error("Erro do Supabase ao buscar produtos:", error);
      return NextResponse.json(
        { error: "Falha ao buscar produtos." },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro inesperado ao buscar produtos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}