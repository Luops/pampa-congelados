"use client"

import { useCarrinho } from "@/contexts/carrinho-context"

export default function CarrinhoDebug() {
  const { state } = useCarrinho()

  // Só mostra em desenvolvimento
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h4 className="font-bold mb-2">Debug Carrinho:</h4>
      <p>Itens: {state.itens.length}</p>
      <p>Quantidade Total: {state.quantidadeTotal}</p>
      <p>Total: R$ {state.total.toFixed(2)}</p>
      <details className="mt-2">
        <summary className="cursor-pointer">Ver itens</summary>
        <pre className="mt-2 text-xs overflow-auto max-h-32">{JSON.stringify(state.itens, null, 2)}</pre>
      </details>
    </div>
  )
}
