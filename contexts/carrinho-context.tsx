"use client"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart, Trash2, Plus, Check } from "lucide-react"

interface ItemCarrinho {
  id: number
  nome: string
  preco: string
  precoNumerico: number
  categoria: string
  imagem: string
  quantidade: number
  peso: string
}

interface CarrinhoState {
  itens: ItemCarrinho[]
  total: number
  quantidadeTotal: number
}

type CarrinhoAction =
  | { type: "ADICIONAR_ITEM"; payload: Omit<ItemCarrinho, "quantidade"> & { quantidade?: number } }
  | { type: "REMOVER_ITEM"; payload: number }
  | { type: "ATUALIZAR_QUANTIDADE"; payload: { id: number; quantidade: number } }
  | { type: "LIMPAR_CARRINHO" }
  | { type: "CARREGAR_CARRINHO"; payload: ItemCarrinho[] }

interface CarrinhoContextType {
  state: CarrinhoState
  adicionarItem: (item: Omit<ItemCarrinho, "quantidade"> & { quantidade?: number }) => void
  removerItem: (id: number) => void
  atualizarQuantidade: (id: number, quantidade: number) => void
  limparCarrinho: () => void
  obterQuantidadeItem: (id: number) => number
}

const CarrinhoContext = createContext<CarrinhoContextType | undefined>(undefined)

// Função para converter preço string para número
const converterPreco = (preco: string): number => {
  return Number.parseFloat(preco.replace("R$", "").replace(",", ".").trim())
}

// Função para calcular totais
const calcularTotais = (itens: ItemCarrinho[]) => {
  const quantidadeTotal = itens.reduce((acc, item) => acc + item.quantidade, 0)
  const total = itens.reduce((acc, item) => acc + item.precoNumerico * item.quantidade, 0)
  return { quantidadeTotal, total }
}

const carrinhoReducer = (state: CarrinhoState, action: CarrinhoAction): CarrinhoState => {
  switch (action.type) {
    case "ADICIONAR_ITEM": {
      const { quantidade = 1, ...item } = action.payload
      const precoNumerico = item.precoNumerico || converterPreco(item.preco)
      const itemExistente = state.itens.find((i) => i.id === item.id)

      let novosItens: ItemCarrinho[]

      if (itemExistente) {
        // Se o item já existe, atualiza a quantidade
        novosItens = state.itens.map((i) => (i.id === item.id ? { ...i, quantidade: i.quantidade + quantidade } : i))
      } else {
        // Se é um novo item, adiciona ao carrinho
        novosItens = [...state.itens, { ...item, quantidade, precoNumerico }]
      }

      const { quantidadeTotal, total } = calcularTotais(novosItens)

      return {
        itens: novosItens,
        total,
        quantidadeTotal,
      }
    }

    case "REMOVER_ITEM": {
      const novosItens = state.itens.filter((item) => item.id !== action.payload)
      const { quantidadeTotal, total } = calcularTotais(novosItens)

      return {
        itens: novosItens,
        total,
        quantidadeTotal,
      }
    }

    case "ATUALIZAR_QUANTIDADE": {
      const { id, quantidade } = action.payload

      if (quantidade <= 0) {
        // Se quantidade é 0 ou negativa, remove o item
        const novosItens = state.itens.filter((item) => item.id !== id)
        const { quantidadeTotal, total } = calcularTotais(novosItens)

        return {
          itens: novosItens,
          total,
          quantidadeTotal,
        }
      }

      const novosItens = state.itens.map((item) => (item.id === id ? { ...item, quantidade } : item))
      const { quantidadeTotal, total } = calcularTotais(novosItens)

      return {
        itens: novosItens,
        total,
        quantidadeTotal,
      }
    }

    case "LIMPAR_CARRINHO":
      return {
        itens: [],
        total: 0,
        quantidadeTotal: 0,
      }

    case "CARREGAR_CARRINHO": {
      const { quantidadeTotal, total } = calcularTotais(action.payload)
      return {
        itens: action.payload,
        total,
        quantidadeTotal,
      }
    }

    default:
      return state
  }
}

const estadoInicial: CarrinhoState = {
  itens: [],
  total: 0,
  quantidadeTotal: 0,
}

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(carrinhoReducer, estadoInicial)
  const { toast } = useToast()

  // Carregar carrinho do localStorage na inicialização
  useEffect(() => {
    try {
      const carrinhoSalvo = localStorage.getItem("carrinho-freezefood")
      if (carrinhoSalvo) {
        const itens = JSON.parse(carrinhoSalvo)
        if (Array.isArray(itens) && itens.length > 0) {
          dispatch({ type: "CARREGAR_CARRINHO", payload: itens })
        }
      }
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error)
      localStorage.removeItem("carrinho-freezefood")
    }
  }, [])

  // Salvar carrinho no localStorage sempre que mudar
  useEffect(() => {
    try {
      localStorage.setItem("carrinho-freezefood", JSON.stringify(state.itens))
    } catch (error) {
      console.error("Erro ao salvar carrinho:", error)
    }
  }, [state.itens])

  const adicionarItem = (item: Omit<ItemCarrinho, "quantidade"> & { quantidade?: number }) => {
    const quantidadeAnterior = obterQuantidadeItem(item.id)
    const quantidadeAdicionada = item.quantidade || 1

    dispatch({ type: "ADICIONAR_ITEM", payload: item })

    // Toast de sucesso
    toast({
      variant: "success",
      title: (
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>Produto adicionado!</span>
        </div>
      ),
      description:
        quantidadeAnterior > 0
          ? `${item.nome} - Quantidade atualizada para ${quantidadeAnterior + quantidadeAdicionada}`
          : `${quantidadeAdicionada}x ${item.nome} adicionado ao carrinho`,
    })
  }

  const removerItem = (id: number) => {
    const item = state.itens.find((i) => i.id === id)
    dispatch({ type: "REMOVER_ITEM", payload: id })

    if (item) {
      toast({
        variant: "destructive",
        title: (
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            <span>Produto removido</span>
          </div>
        ),
        description: `${item.nome} foi removido do carrinho`,
      })
    }
  }

  const atualizarQuantidade = (id: number, quantidade: number) => {
    const item = state.itens.find((i) => i.id === id)
    const quantidadeAnterior = item?.quantidade || 0

    dispatch({ type: "ATUALIZAR_QUANTIDADE", payload: { id, quantidade } })

    if (item) {
      if (quantidade <= 0) {
        toast({
          variant: "destructive",
          title: (
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Produto removido</span>
            </div>
          ),
          description: `${item.nome} foi removido do carrinho`,
        })
      } else if (quantidade > quantidadeAnterior) {
        toast({
          variant: "success",
          title: (
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Quantidade aumentada</span>
            </div>
          ),
          description: `${item.nome} - ${quantidade} unidades`,
        })
      } else {
        toast({
          title: (
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span>Quantidade atualizada</span>
            </div>
          ),
          description: `${item.nome} - ${quantidade} unidades`,
        })
      }
    }
  }

  const limparCarrinho = () => {
    const quantidadeItens = state.itens.length
    dispatch({ type: "LIMPAR_CARRINHO" })

    if (quantidadeItens > 0) {
      toast({
        variant: "destructive",
        title: (
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            <span>Carrinho limpo</span>
          </div>
        ),
        description: `${quantidadeItens} ${quantidadeItens === 1 ? "produto foi removido" : "produtos foram removidos"}`,
      })
    }
  }

  const obterQuantidadeItem = (id: number): number => {
    const item = state.itens.find((i) => i.id === id)
    return item ? item.quantidade : 0
  }

  // Debug: Log do estado atual
  useEffect(() => {
    console.log("Estado do carrinho:", state)
  }, [state])

  return (
    <CarrinhoContext.Provider
      value={{
        state,
        adicionarItem,
        removerItem,
        atualizarQuantidade,
        limparCarrinho,
        obterQuantidadeItem,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  )
}

export function useCarrinho() {
  const context = useContext(CarrinhoContext)
  if (context === undefined) {
    throw new Error("useCarrinho deve ser usado dentro de um CarrinhoProvider")
  }
  return context
}
