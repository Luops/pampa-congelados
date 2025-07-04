"use client"
import { ShoppingCart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

interface CarrinhoToastProps {
  produtoNome: string
  quantidade: number
  onVerCarrinho?: () => void
  onContinuarComprando?: () => void
}

export function mostrarToastCarrinho({
  produtoNome,
  quantidade,
  onVerCarrinho,
  onContinuarComprando,
}: CarrinhoToastProps) {
  const { toast } = useToast()

  return toast({
    variant: "success",
    title: "✅ Produto adicionado ao carrinho!",
    description: `${quantidade}x ${produtoNome}`,
    action: onVerCarrinho ? (
      <ToastAction altText="Ver carrinho" onClick={onVerCarrinho}>
        <ShoppingCart className="h-4 w-4 mr-1" />
        Ver carrinho
      </ToastAction>
    ) : undefined,
  })
}

export function mostrarToastRemocao(produtoNome: string) {
  const { toast } = useToast()

  return toast({
    variant: "destructive",
    title: "🗑️ Produto removido",
    description: `${produtoNome} foi removido do carrinho`,
  })
}

export function mostrarToastCarrinhoLimpo(quantidadeItens: number) {
  const { toast } = useToast()

  return toast({
    variant: "destructive",
    title: "🧹 Carrinho limpo",
    description: `${quantidadeItens} ${quantidadeItens === 1 ? "produto foi removido" : "produtos foram removidos"}`,
  })
}

export function mostrarToastQuantidadeAtualizada(
  produtoNome: string,
  quantidade: number,
  acao: "aumentada" | "diminuida" | "atualizada",
) {
  const { toast } = useToast()

  const emojis = {
    aumentada: "➕",
    diminuida: "➖",
    atualizada: "🔄",
  }

  const titulos = {
    aumentada: "Quantidade aumentada",
    diminuida: "Quantidade diminuída",
    atualizada: "Quantidade atualizada",
  }

  return toast({
    variant: acao === "aumentada" ? "success" : "default",
    title: `${emojis[acao]} ${titulos[acao]}`,
    description: `${produtoNome} - ${quantidade} ${quantidade === 1 ? "unidade" : "unidades"}`,
  })
}
