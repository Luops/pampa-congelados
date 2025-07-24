"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Phone,
  MapPin,
  User,
  MessageSquare,
  Clock,
  CreditCard,
  Truck,
  CheckCircle,
  Edit3,
} from "lucide-react";
import Image from "next/image";
import { useCarrinho } from "@/contexts/carrinho-context";
import { useToast } from "@/hooks/use-toast";

interface ModalConfirmacaoPedidoProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DadosCliente {
  nome: string;
  telefone: string;
  endereco: string;
  complemento: string;
  observacoes: string;
  formaPagamento: string;
  troco: string;
  tipoEntrega: "entrega" | "retirada";
}

export default function ModalConfirmacaoPedido({
  isOpen,
  onClose,
}: ModalConfirmacaoPedidoProps) {
  const { state, limparCarrinho } = useCarrinho();
  const { toast } = useToast();

  const [etapa, setEtapa] = useState<"dados" | "confirmacao">("dados");
  const [dadosCliente, setDadosCliente] = useState<DadosCliente>({
    nome: "",
    telefone: "",
    endereco: "",
    complemento: "",
    observacoes: "",
    formaPagamento: "dinheiro",
    troco: "",
    tipoEntrega: "entrega", // valor padrão
  });

  const [errors, setErrors] = useState<Partial<DadosCliente>>({});

  const formatarPreco = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const calcularTaxaEntrega = () => {
    // Taxa fixa de R$ 5,00 - pode ser dinâmica baseada no endereço
    // Se o tipo de entrega for retirada, a taxa é 0
    if (dadosCliente.tipoEntrega === "retirada") {
      return 0;
    }
    return state.total >= 50 ? 0 : 5;
  };
  const totalComEntrega = state.total + calcularTaxaEntrega();

  const validarDados = (): boolean => {
    const novosErrors: Partial<DadosCliente> = {};

    if (!dadosCliente.nome.trim()) {
      novosErrors.nome = "Nome é obrigatório";
    }

    if (!dadosCliente.telefone.trim()) {
      novosErrors.telefone = "Telefone é obrigatório";
    } else {
      // Regex para (DD) 9XXXX-XXXX ou (DD) XXXX-XXXX
      // Permite o '9' inicial opcional para celulares.
      // O '9' é obrigatório se o número tiver 11 dígitos, opcional se tiver 10.
      const telefoneNumeros = dadosCliente.telefone.replace(/\D/g, "");
      if (telefoneNumeros.length < 10 || telefoneNumeros.length > 11) {
        novosErrors.telefone =
          "Telefone deve ter 10 ou 11 dígitos (DDD + número)";
      } else if (telefoneNumeros.length === 11 && telefoneNumeros[2] !== "9") {
        // Se tem 11 dígitos, o terceiro dígito (após o DDD) deve ser '9'
        novosErrors.telefone =
          "Celular com 11 dígitos deve começar com 9 (ex: (DD) 9XXXX-XXXX)";
      }
    }

    if (!dadosCliente.endereco.trim()) {
      novosErrors.endereco = "Endereço é obrigatório";
    }

    // Validação de endereço apenas se for entrega
    if (
      dadosCliente.tipoEntrega === "entrega" &&
      !dadosCliente.endereco.trim()
    ) {
      novosErrors.endereco = "Endereço é obrigatório para entrega";
    }

    if (
      dadosCliente.formaPagamento === "dinheiro" &&
      !dadosCliente.troco.trim()
    ) {
      novosErrors.troco = "Informe o valor para troco";
    } else if (
      dadosCliente.formaPagamento === "dinheiro" &&
      parseFloat(dadosCliente.troco.replace(",", ".")) < totalComEntrega
    ) {
      novosErrors.troco = "O troco deve ser maior ou igual ao total do pedido.";
    }

    setErrors(novosErrors);
    return Object.keys(novosErrors).length === 0;
  };

  const formatarTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, ""); // Remove tudo que não é dígito

    if (numeros.length <= 2) {
      return numeros; // Se tiver 2 ou menos dígitos, retorna como está (ex: "11")
    }
    if (numeros.length <= 6) {
      return `(${numeros.substring(0, 2)}) ${numeros.substring(2)}`; // Ex: (11) 9999
    }
    if (numeros.length <= 10) {
      // Para números de 8 dígitos (sem o 9 inicial)
      return `(${numeros.substring(0, 2)}) ${numeros.substring(
        2,
        6
      )}-${numeros.substring(6)}`; // Ex: (11) 9999-9999
    }
    if (numeros.length <= 11) {
      // Para números de 9 dígitos (com o 9 inicial)
      return `(${numeros.substring(0, 2)}) ${numeros.substring(
        2,
        7
      )}-${numeros.substring(7)}`; // Ex: (11) 99999-9999
    }
    return `(${numeros.substring(0, 2)}) ${numeros.substring(
      2,
      7
    )}-${numeros.substring(7, 11)}`; // Limita a 11 dígitos
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarTelefone(e.target.value);
    setDadosCliente((prev) => ({ ...prev, telefone: valorFormatado }));
  };

  const handleProximaEtapa = () => {
    if (validarDados()) {
      setEtapa("confirmacao");
    }
  };

  const gerarMensagemWhatsApp = () => {
    let mensagem = "🛒 *NOVO PEDIDO - FREEZEFOOD*\n\n";

    // Dados do cliente
    mensagem += "👤 *DADOS DO CLIENTE*\n";
    mensagem += `Nome: ${dadosCliente.nome}\n`;
    mensagem += `Telefone: ${dadosCliente.telefone}\n`;

    // Tipo de Entrega
    mensagem += `Tipo de Entrega: ${
      dadosCliente.tipoEntrega === "entrega"
        ? "Entrega 🚚"
        : "Retirada no Local 🏠"
    }\n`;

    if (dadosCliente.tipoEntrega === "entrega") {
      mensagem += `Endereço: ${dadosCliente.endereco}\n`;
      if (dadosCliente.complemento) {
        mensagem += `Complemento: ${dadosCliente.complemento}\n`;
      }
    } else {
      mensagem += `Local de Retirada: Rua Exemplo, 123 - Centro\n`; // Adicione aqui o endereço fixo da loja para retirada
    }
    mensagem += "\n";

    // Itens do pedido
    mensagem += "📦 *ITENS DO PEDIDO*\n";
    state.itens.forEach((item, index) => {
      mensagem += `${index + 1}. ${item.quantidade}x ${item.nome}\n`;
      mensagem += `   ${formatarPreco(
        item.precoNumerico
      )} cada = ${formatarPreco(item.precoNumerico * item.quantidade)}\n`;
    });
    mensagem += "\n";

    // Resumo financeiro
    mensagem += "💰 *RESUMO FINANCEIRO*\n";
    mensagem += `Subtotal: ${formatarPreco(state.total)}\n`;
    const taxaEntrega = calcularTaxaEntrega();
    if (taxaEntrega > 0) {
      mensagem += `Taxa de entrega: ${formatarPreco(taxaEntrega)}\n`;
    } else if (dadosCliente.tipoEntrega === "entrega") {
      mensagem += `Taxa de entrega: GRÁTIS ✅\n`;
    } else {
      // Para retirada, não mostra taxa de entrega, pois já está implícito no tipo de entrega
      mensagem += `(Retirada no local, sem taxa de entrega)\n`;
    }
    mensagem += `*TOTAL: ${formatarPreco(totalComEntrega)}*\n\n`;

    // Forma de pagamento
    mensagem += "💳 *PAGAMENTO*\n";
    if (dadosCliente.formaPagamento === "dinheiro") {
      mensagem += `Forma: Dinheiro 💵\n`;
      mensagem += `Troco para: R$ ${dadosCliente.troco}\n`;
    } else if (dadosCliente.formaPagamento === "pix") {
      mensagem += `Forma: PIX 📱\n`;
    } else if (dadosCliente.formaPagamento === "cartao") {
      mensagem += `Forma: Cartão 💳\n`;
    }
    mensagem += "\n";

    // Observações
    if (dadosCliente.observacoes) {
      mensagem += "📝 *OBSERVAÇÕES*\n";
      mensagem += `${dadosCliente.observacoes}\n\n`;
    }

    mensagem += "⏰ *Tempo estimado de entrega: 30-45 minutos*\n\n";
    mensagem += "Confirma o pedido? 😊";

    return encodeURIComponent(mensagem);
  };

  const enviarPedido = () => {
    const mensagem = gerarMensagemWhatsApp();
    const numeroWhatsApp = "5551989386458";
    const url = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;

    // Abrir WhatsApp
    window.open(url, "_blank");

    // Limpar carrinho e fechar modal
    limparCarrinho();
    onClose();

    // Toast de sucesso
    toast({
      variant: "success",
      title: (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>Pedido enviado!</span>
        </div>
      ),
      description:
        "Seu pedido foi enviado via WhatsApp. Aguarde nossa confirmação!",
    });
  };

  const handleClose = () => {
    setEtapa("dados");
    setDadosCliente({
      nome: "",
      telefone: "",
      endereco: "",
      complemento: "",
      observacoes: "",
      formaPagamento: "dinheiro",
      troco: "",
      tipoEntrega: "entrega",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-600" />
            {etapa === "dados" ? "Finalizar Pedido" : "Confirmar Pedido"}
          </DialogTitle>
        </DialogHeader>

        {etapa === "dados" ? (
          /* ETAPA 1: DADOS DO CLIENTE */
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Resumo Rápido */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {state.quantidadeTotal}{" "}
                      {state.quantidadeTotal === 1 ? "item" : "itens"}
                    </p>
                    <p className="font-semibold text-blue-600">
                      {formatarPreco(totalComEntrega)}
                    </p>
                  </div>
                  {dadosCliente.tipoEntrega === "entrega" && (
                    <Badge variant="secondary">
                      {calcularTaxaEntrega() === 0
                        ? "Entrega Grátis"
                        : `+${formatarPreco(calcularTaxaEntrega())} entrega`}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Dados Pessoais */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <h3 className="font-semibold">Dados Pessoais</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={dadosCliente.nome}
                      onChange={(e) =>
                        setDadosCliente((prev) => ({
                          ...prev,
                          nome: e.target.value,
                        }))
                      }
                      placeholder="Seu nome completo"
                      className={`${
                        errors.nome ? "border-red-500" : ""
                      } focus:!ring-0`}
                      autoComplete="off"
                    />
                    {errors.nome && (
                      <p className="text-red-500 text-xs mt-1">{errors.nome}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      value={dadosCliente.telefone}
                      onChange={handleTelefoneChange}
                      placeholder="(DD) 9XXXX-XXXX"
                      maxLength={15}
                      className={`${
                        errors.telefone ? "border-red-500" : ""
                      } focus:!ring-0`}
                    />
                    {errors.telefone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.telefone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tipo de Entrega */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="h-4 w-4 text-gray-500" />
                  <h3 className="font-semibold">Tipo de Entrega</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={
                      dadosCliente.tipoEntrega === "entrega"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setDadosCliente((prev) => ({
                        ...prev,
                        tipoEntrega: "entrega",
                      }))
                    }
                    className="h-12"
                  >
                    🚚 Entrega com taxa
                  </Button>
                  <Button
                    type="button"
                    variant={
                      dadosCliente.tipoEntrega === "retirada"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setDadosCliente((prev) => ({
                        ...prev,
                        tipoEntrega: "retirada",
                      }))
                    }
                    className="h-12"
                  >
                    🏠 Retirada no local
                  </Button>
                </div>
              </div>

              {/* Se for entrega, exibir Endereço de Entrega */}
              {dadosCliente.tipoEntrega === "entrega" ? (
                <>
                  <div>
                    <Label htmlFor="endereco">Endereço Completo *</Label>
                    <Input
                      id="endereco"
                      value={dadosCliente.endereco}
                      onChange={(e) =>
                        setDadosCliente((prev) => ({
                          ...prev,
                          endereco: e.target.value,
                        }))
                      }
                      placeholder="Rua, número, bairro, cidade"
                      className={`${
                        errors.endereco ? "border-red-500" : ""
                      } focus:!ring-0`}
                    />
                    {errors.endereco && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.endereco}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      value={dadosCliente.complemento}
                      onChange={(e) =>
                        setDadosCliente((prev) => ({
                          ...prev,
                          complemento: e.target.value,
                        }))
                      }
                      placeholder="Apartamento, bloco, referência..."
                      className="focus:!ring-0"
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-600">
                  Retirada no local: Rua Exemplo, 123 - Centro
                </p>
              )}

              {/* Forma de Pagamento */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <h3 className="font-semibold">Forma de Pagamento</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    type="button"
                    variant={
                      dadosCliente.formaPagamento === "dinheiro"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setDadosCliente((prev) => ({
                        ...prev,
                        formaPagamento: "dinheiro",
                      }))
                    }
                    className="h-12"
                  >
                    💵 Dinheiro
                  </Button>
                  <Button
                    type="button"
                    variant={
                      dadosCliente.formaPagamento === "pix"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setDadosCliente((prev) => ({
                        ...prev,
                        formaPagamento: "pix",
                      }))
                    }
                    className="h-12"
                  >
                    📱 PIX
                  </Button>
                  <Button
                    type="button"
                    variant={
                      dadosCliente.formaPagamento === "cartao"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setDadosCliente((prev) => ({
                        ...prev,
                        formaPagamento: "cartao",
                      }))
                    }
                    className="h-12"
                  >
                    💳 Cartão
                  </Button>
                </div>

                {dadosCliente.formaPagamento === "dinheiro" && (
                  <div>
                    <Label htmlFor="troco">Troco para quanto? *</Label>
                    <Input
                      id="troco"
                      value={dadosCliente.troco}
                      onChange={(e) =>
                        setDadosCliente((prev) => ({
                          ...prev,
                          troco: e.target.value,
                        }))
                      }
                      placeholder="Ex: 50,00"
                      className={`${
                        errors.troco ? "border-red-500" : ""
                      } focus:!ring-0`}
                      type="number" // Garante que apenas números sejam digitados
                      step="0.01" // Permite centavos
                    />
                    {errors.troco && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.troco}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Observações */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  <h3 className="font-semibold">Observações</h3>
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações do Pedido</Label>
                  <Textarea
                    id="observacoes"
                    value={dadosCliente.observacoes}
                    onChange={(e) =>
                      setDadosCliente((prev) => ({
                        ...prev,
                        observacoes: e.target.value,
                      }))
                    }
                    placeholder="Alguma observação especial sobre o pedido..."
                    rows={3}
                    className="focus:!ring-0"
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          /* ETAPA 2: CONFIRMAÇÃO */
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Dados do Cliente */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Dados do Cliente
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEtapa("dados")}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Nome:</strong> {dadosCliente.nome}
                  </p>
                  <p>
                    <strong>Telefone:</strong> {dadosCliente.telefone}
                  </p>
                  <p>
                    <strong>Tipo de Entrega:</strong>{" "}
                    {dadosCliente.tipoEntrega === "entrega"
                      ? "Entrega"
                      : "Retirada no Local"}
                  </p>
                  {dadosCliente.tipoEntrega === "entrega" ? (
                    <>
                      <p>
                        <strong>Endereço:</strong> {dadosCliente.endereco}
                      </p>
                      {dadosCliente.complemento && (
                        <p>
                          <strong>Complemento:</strong>{" "}
                          {dadosCliente.complemento}
                        </p>
                      )}
                    </>
                  ) : (
                    <p>
                      <strong>Local de Retirada:</strong> Rua Exemplo, 123 -
                      Centro
                    </p>
                  )}
                  <p>
                    <strong>Pagamento:</strong>{" "}
                    {dadosCliente.formaPagamento === "dinheiro"
                      ? `Dinheiro (troco para R$ ${dadosCliente.troco})`
                      : dadosCliente.formaPagamento === "pix"
                      ? "PIX"
                      : "Cartão"}
                  </p>
                  {dadosCliente.observacoes && (
                    <p>
                      <strong>Observações:</strong> {dadosCliente.observacoes}
                    </p>
                  )}
                </div>
              </div>

              {/* Itens do Pedido */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Itens do Pedido
                </h3>
                <div className="space-y-3">
                  {state.itens.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 border rounded-lg"
                    >
                      <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={
                            item.imagem || "/placeholder.svg?height=48&width=48"
                          }
                          alt={item.nome}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.nome}</h4>
                        <p className="text-xs text-gray-500">
                          {item.categoria}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <div className="text-sm">
                            <span className="font-medium">
                              {item.quantidade}x
                            </span>
                            <span className="text-gray-600 ml-1">
                              {item.preco}
                            </span>
                          </div>
                          <span className="font-semibold text-blue-600">
                            {formatarPreco(
                              item.precoNumerico * item.quantidade
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumo Final */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Resumo do Pedido</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({state.quantidadeTotal} itens)</span>
                    <span>{formatarPreco(state.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de entrega</span>
                    <span
                      className={
                        calcularTaxaEntrega() === 0
                          ? "text-green-600 font-medium"
                          : ""
                      }
                    >
                      {dadosCliente.tipoEntrega === "retirada"
                        ? "N/A (Retirada)"
                        : calcularTaxaEntrega() === 0
                        ? "GRÁTIS"
                        : formatarPreco(calcularTaxaEntrega())}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600">
                      {formatarPreco(totalComEntrega)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tempo de Entrega */}
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                <Clock className="h-4 w-4" />
                <span>
                  Tempo estimado de entrega:{" "}
                  <strong>
                    {dadosCliente.tipoEntrega === "entrega"
                      ? "30-45 minutos"
                      : "Aguarde confirmação para retirada"}
                  </strong>
                </span>
              </div>
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {etapa === "dados" ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleProximaEtapa}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Continuar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEtapa("dados")}>
                Voltar
              </Button>
              <Button
                onClick={enviarPedido}
                className="bg-green-600 hover:bg-green-700"
              >
                <Phone className="h-4 w-4 mr-2" />
                Enviar Pedido
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
