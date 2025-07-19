import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";

// A URL de conexão do seu banco de dados
const connectionString = process.env.DATABASE_URL;

// Rota para deletar um produto pelo ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();

    // Verifica se o ID é válido
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "ID de produto inválido." },
        { status: 400 }
      );
    }

 // Consulta SQL para buscar o produto. Use $1 para evitar SQL Injection.
    const query = "DELETE FROM products WHERE id = $1";
    const values = [id];


    // Executa a query SQL para deletar o produto
    const result = await client.query(query, values);

    // Verifica se alguma linha foi afetada (produto foi deletado)
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Produto não encontrado." },
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
