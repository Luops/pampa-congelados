// Importe o cliente do PostgreSQL
import { Client } from "pg";
import { NextRequest, NextResponse } from "next/server";

// A URL de conexão do seu banco de dados
const connectionString = process.env.DATABASE_URL;

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

  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect(); // Conecta ao banco de dados

    // Consulta SQL para buscar o produto. Use $1 para evitar SQL Injection.
    const query = "SELECT * FROM products WHERE id = $1";
    const values = [id];

    const result = await client.query(query, values);
    const product = result.rows[0]; // Pega a primeira linha do resultado

    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado." },
        { status: 404 }
      );
    }

    // Retorne os dados do produto para o frontend
    return NextResponse.json(product, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao buscar produto:", error);
    return NextResponse.json(
      {
        error: "Falha ao buscar o produto.",
      },
      { status: 500 }
    );
  } finally {
    // É crucial fechar a conexão após cada requisição
    await client.end();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Conecte ao banco de dados
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect(); // Conecta ao banco de dados
    const body = await request.json();

    // Prepare a query e os valores
    const query = `
      UPDATE products
      SET
        product_name = $1,
        image_url = $2,
        description = $3,
        reviews_stars_by_person = $4,
        reviews_count = $5,
        price = $6,
        promo_price = $7,
        stock_quantity = $8,
        ingredients = $9,
        preparation = $10,
        nutritional_info = $11,
        details = $12
      WHERE id = $13
      RETURNING *;
    `;

    const values = [
      body.product_name,
      body.image_url,
      body.description,
      body.reviews_stars_by_person,
      body.reviews_count,
      body.price,
      body.promo_price,
      body.stock_quantity,
      body.ingredients,
      body.preparation,
      JSON.stringify(body.nutritional_info), // Garanta que objetos são strings JSON
      JSON.stringify(body.details), // Garanta que objetos são strings JSON
      id,
    ];

    const result = await client.query(query, values);

    // Verifique se o produto foi atualizado
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Produto não encontrado para atualização." },
        { status: 404 }
      );
    }

    const updatedProduct = result.rows[0];

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error: any) {
    console.error("Erro no processo de edição (PATCH):", error);
    return NextResponse.json(
      { error: "Falha ao editar o produto." },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}
