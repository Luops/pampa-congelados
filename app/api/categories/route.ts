// src/app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Importe o cliente Supabase

export async function GET() {
  try {
    const { data: categories, error } = await supabase
      .from('categories') // Nome da sua tabela no Supabase
      .select('id, name'); // Selecione as colunas que você precisa

    if (error) {
      console.error("Supabase error fetching categories:", error.message);
      return NextResponse.json({ error: 'Failed to fetch categories', details: error.message }, { status: 500 });
    }

    return NextResponse.json(categories, { status: 200 });
  } catch (err: any) {
    console.error("Unexpected error fetching categories:", err.message);
    return NextResponse.json({ error: 'An unexpected error occurred', details: err.message }, { status: 500 });
  }
}