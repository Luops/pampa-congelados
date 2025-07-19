// Exemplo de como sua rota GET deve ser. Adapte-a se já existir.
import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";

// A URL de conexão do seu banco de dados
const connectionString = process.env.DATABASE_URL;

export async function GET(req: NextRequest) {
  // Verifique se a variável de ambiente está definida
  if (!connectionString) {
    return NextResponse.json(
      { error: "A URL de conexão do banco de dados não está configurada." },
      { status: 500 }
    );
  }
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    // Obtém os parâmetros de URL para paginação e pesquisa
    const searchParams = req.nextUrl.searchParams;
    const limit = Number(searchParams.get("limit")) || 8;
    const offset = Number(searchParams.get("offset")) || 0;
    const searchQuery = searchParams.get("q") || "";

    // Constrói a query SQL dinamicamente
    let query = `
      SELECT
        id,
        product_name,
        description,
        price,
        promo_price,
        image_url,
        stock_quantity,
        created_at
      FROM products
    `;

    const values: string[] = [];
    let whereClause = "";

    if (searchQuery) {
      whereClause = `WHERE product_name ILIKE $1`;
      values.push(`%${searchQuery}%`);
    }

    query += `
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset};
    `;

    // Executa a query
    const { rows } = await client.query(query, values);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return NextResponse.json(
      { error: "Falha ao buscar produtos." },
      { status: 500 }
    );
  }
}
