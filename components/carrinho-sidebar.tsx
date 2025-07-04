"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, Trash2, Phone, X } from "lucide-react";
import { useCarrinho } from "@/contexts/carrinho-context";
import { useSwipe } from "@/hooks/use-swipe";
import Image from "next/image";
import ModalConfirmacaoPedido from "./modal-confirmacao-pedido";

export default function CarrinhoSidebar() {
  const { state, atualizarQuantidade, removerItem, limparCarrinho } =
    useCarrinho();
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);

  // Cor do carrinho

  const formatarPreco = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const abrirModalConfirmacao = () => {
    setModalConfirmacaoAberto(true);
    setIsOpen(false);
  };

  const handleLimparCarrinho = () => {
    limparCarrinho();
    setIsOpen(false);
  };

  // Hook de swipe para fechar o carrinho arrastando para a direita
  const {
    ref: swipeRef,
    isDragging,
    dragOffset,
  } = useSwipe(
    {
      onSwipeRight: handleClose, // Fechar arrastando para a direita
    },
    {
      threshold: 100,
      preventDefaultTouchmoveEvent: true,
    }
  );

  // Calcular transform baseado no drag
  const getTransform = () => {
    if (!isDragging) return isOpen ? "translateX(0)" : "translateX(100%)";

    // Durante o drag, aplicar o offset mas limitar para não ir além dos limites
    const clampedOffset = Math.max(0, dragOffset);
    return `translateX(${clampedOffset}px)`;
  };

  return (
    <>
      {/* Botão do Carrinho */}
      <Button
        variant="outline"
        className="relative flex items-center gap-2 bg-transparent border-white/20 hover:bg-white/10 px-4 max-[640px]:hidden"
        onClick={() => setIsOpen(true)}
      >
        <ShoppingCart className={`h-4 w-4 text-white`} />
        <span className="text-sm font-semibold">
          {formatarPreco(state.total)}
        </span>

        {state.quantidadeTotal > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white animate-pulse">
            {state.quantidadeTotal}
          </Badge>
        )}
      </Button>

      {/* Overlay - Só aparece quando isOpen é true */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
          onClick={handleClose}
          style={{
            opacity: isDragging ? Math.max(0.3, 1 - dragOffset / 384) : 1,
          }}
        />
      )}
      {/* */}
      {/* Sidebar do Carrinho - Lado Direito */}
      <div
        ref={swipeRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 ${
          isDragging ? "" : "transition-transform duration-300 ease-in-out"
        } ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{
          transform: isDragging ? getTransform() : undefined,
          willChange: isDragging ? "transform" : undefined, // melhora a performance durante o drag
        }}
      >
        {/* Indicador de Swipe */}
        <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-1 h-12 bg-gray-300 rounded-l-full opacity-50 md:hidden" />

        {/* Header do Carrinho */}
        <div className="p-4 bg-blue-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-white" />
            <span className="font-semibold">
              Carrinho ({state.quantidadeTotal}{" "}
              {state.quantidadeTotal === 1 ? "item" : "itens"})
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-blue-700"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Conteúdo do Carrinho */}
        <div className="flex flex-col h-full">
          {state.itens.length === 0 ? (
            /* Carrinho Vazio */
            <div className="flex flex-col items-center justify-center flex-1 text-center p-6">
              <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Carrinho vazio
              </h3>
              <p className="text-gray-500 mb-4">
                Adicione produtos para começar seu pedido
              </p>
              <Button onClick={handleClose} variant="outline">
                Continuar comprando
              </Button>
            </div>
          ) : (
            <>
              {/* Dica de Swipe */}
              <div className="px-4 py-2 bg-blue-50 border-b">
                <p className="text-xs text-blue-600 text-center">
                  💡 Deslize para a direita para fechar
                </p>
              </div>

              {/* Lista de Produtos */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {state.itens.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={
                            item.imagem || "/placeholder.svg?height=64&width=64"
                          }
                          alt={item.nome}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm leading-tight mb-1">
                          {item.nome}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">
                          {item.categoria}
                        </p>
                        <p className="text-xs text-gray-600 mb-2">
                          {item.preco} cada
                        </p>

                        {/* Controles de Quantidade */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 bg-gray-50 rounded-md p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:bg-red-50 hover:text-red-600"
                              onClick={() =>
                                atualizarQuantidade(
                                  item.id,
                                  item.quantidade - 1
                                )
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantidade}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:bg-green-50 hover:text-green-600"
                              onClick={() =>
                                atualizarQuantidade(
                                  item.id,
                                  item.quantidade + 1
                                )
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-blue-600">
                              {formatarPreco(
                                item.precoNumerico * item.quantidade
                              )}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removerItem(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumo e Ações */}
              <div className="border-t p-4 bg-gray-50">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>
                      Subtotal ({state.quantidadeTotal}{" "}
                      {state.quantidadeTotal === 1 ? "item" : "itens"})
                    </span>
                    <span>{formatarPreco(state.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Taxa de entrega</span>
                    <span>A calcular</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2"></div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600">
                      {formatarPreco(state.total)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={abrirModalConfirmacao}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Finalizar Pedido
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={handleClose}
                    >
                      Continuar comprando
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleLimparCarrinho}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-gray-500 text-center mt-3">
                  💡 Entrega grátis para pedidos acima de R$ 50,00
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de Confirmação */}
      <ModalConfirmacaoPedido
        isOpen={modalConfirmacaoAberto}
        onClose={() => setModalConfirmacaoAberto(false)}
      />
    </>
  );
}
