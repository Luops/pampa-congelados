// src/app/api/categories/create/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Importe o cliente Supabase

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Category name is required and must be a non-empty string.' }, { status: 400 });
    }

    const categoryNameTrimmed = name.trim();

    // 1. Verificar se a categoria já existe (case-insensitive)
    const { data: existingCategories, error: fetchError } = await supabase
      .from('categories')
      .select('id, name')
      .ilike('name', categoryNameTrimmed); // 'ilike' para busca case-insensitive

    if (fetchError) {
      console.error("Supabase error checking existing category:", fetchError.message);
      return NextResponse.json({ error: 'Failed to check existing category', details: fetchError.message }, { status: 500 });
    }

    if (existingCategories && existingCategories.length > 0) {
      return NextResponse.json({ error: 'Category already exists', category: existingCategories[0] }, { status: 409 });
    }

    // 2. Inserir a nova categoria
    const { data: newCategory, error: insertError } = await supabase
      .from('categories')
      .insert({ name: categoryNameTrimmed })
      .select('id, name') // Retorna a categoria inserida
      .single(); // Espera um único resultado

    if (insertError) {
      console.error("Supabase error inserting new category:", insertError.message);
      return NextResponse.json({ error: 'Failed to create category', details: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Category created successfully', category: newCategory }, { status: 201 });

  } catch (err: any) {
    console.error("Unexpected error creating category:", err.message);
    return NextResponse.json({ error: 'An unexpected error occurred', details: err.message }, { status: 500 });
  }
}