"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react"; // Adicionar useCallback
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
  cep: string;
  cidade: string;
  estado: string;
  complemento: string;
  observacoes: string;
  formaPagamento: string;
  troco: string;
  tipoEntrega: "entrega" | "retirada";
}

// Função para consultar o CEP usando a API ViaCEP (mantida)
async function consultarCep(cep: string) {
  const cepNumeros = cep.replace(/\D/g, "");
  if (cepNumeros.length !== 8) {
    return null; // CEP inválido para consulta
  }

  try {
    const response = await fetch(
      `https://viacep.com.br/ws/${cepNumeros}/json/`
    );
    const data = await response.json();

    if (data.erro) {
      return null; // CEP não encontrado pela API
    }

    return {
      logradouro: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      estado: data.uf,
    };
  } catch (error) {
    console.error("Erro ao consultar CEP:", error);
    return null;
  }
}

// Nova função para buscar a taxa de entrega da sua API
async function buscarTaxaEntrega(
  cidade: string,
  estado: string
): Promise<number | null> {
  try {
    const response = await fetch(
      `/api/fretes?cidade=${encodeURIComponent(
        cidade
      )}&estado=${encodeURIComponent(estado)}`
    );
    if (!response.ok) {
      // Se a resposta não for 2xx, tenta ler o erro
      const errorData = await response.json();
      console.error(
        "Erro ao buscar taxa de entrega:",
        errorData.error || response.statusText
      );
      return null;
    }
    const data = await response.json();
    // Se a API retornar null (não encontrado), ou se o objeto não tiver valor_entrega
    if (!data || data.valor_entrega === undefined) {
      return null;
    }
    return data.valor_entrega;
  } catch (error) {
    console.error("Erro de rede ou ao processar taxa de entrega:", error);
    return null;
  }
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
    cep: "",
    cidade: "",
    estado: "",
    complemento: "",
    observacoes: "",
    formaPagamento: "dinheiro",
    troco: "",
    tipoEntrega: "entrega",
  });

  const [errors, setErrors] = useState<Partial<DadosCliente>>({});
  const [taxaEntregaCalculada, setTaxaEntregaCalculada] = useState<
    number | null
  >(null); // Pode ser null enquanto não carrega ou se não encontrar
  const [isFetchingTaxa, setIsFetchingTaxa] = useState(false); // Novo estado para controlar o loading da taxa

  // CEP de Origem (do seu negócio em Gravataí, RS)
  const CEP_ORIGEM_NEGOCIO = "94000-000"; // Exemplo de CEP de Gravataí. Ajuste para o CEP exato do seu negócio.

  // Efeito para consultar o CEP do cliente sempre que ele for alterado e o tipo de entrega for "entrega"
  useEffect(() => {
    const buscarDadosCep = async () => {
      if (
        dadosCliente.tipoEntrega === "entrega" &&
        dadosCliente.cep.replace(/\D/g, "").length === 8
      ) {
        const dados = await consultarCep(dadosCliente.cep);
        if (dados) {
          setDadosCliente((prev) => ({
            ...prev,
            cidade: dados.cidade,
            estado: dados.estado,
            endereco:
              prev.endereco ||
              `${dados.logradouro}, ${dados.bairro || ""}`.trim(), // Preenche endereço se estiver vazio
          }));
        } else {
          setDadosCliente((prev) => ({
            ...prev,
            cidade: "",
            estado: "",
          }));
          toast({
            variant: "destructive",
            title: "CEP não encontrado ou inválido",
            description: "Por favor, verifique o CEP digitado.",
          });
        }
      } else {
        setDadosCliente((prev) => ({ ...prev, cidade: "", estado: "" }));
      }
    };
    buscarDadosCep();
  }, [dadosCliente.cep, dadosCliente.tipoEntrega, toast]);

  // Função para calcular a taxa de entrega (agora busca da API)
  const calcularTaxaEntrega = useCallback(async () => {
    if (dadosCliente.tipoEntrega === "retirada") {
      setTaxaEntregaCalculada(0);
      return;
    }

    // Se o total do carrinho for >= 200, a entrega é grátis
    if (state.total >= 200) {
      setTaxaEntregaCalculada(0);
      return;
    }

    if (dadosCliente.cidade && dadosCliente.estado) {
      setIsFetchingTaxa(true);
      const taxa = await buscarTaxaEntrega(
        dadosCliente.cidade,
        dadosCliente.estado
      );
      setIsFetchingTaxa(false);

      if (taxa !== null) {
        setTaxaEntregaCalculada(taxa);
      } else {
        // Se a cidade/estado não for encontrada na sua tabela de fretes
        setTaxaEntregaCalculada(null); // Indica que não há taxa definida
        toast({
          variant: "destructive",
          title: "Entrega indisponível para esta região",
          description:
            "Não foi possível calcular o frete para sua cidade. Por favor, entre em contato para verificar a possibilidade de entrega.",
        });
      }
    } else {
      setTaxaEntregaCalculada(null); // Reseta se não houver cidade/estado
    }
  }, [
    dadosCliente.tipoEntrega,
    dadosCliente.cidade,
    dadosCliente.estado,
    state.total,
    toast,
  ]);

  // Use useEffect para atualizar taxaEntregaCalculada sempre que as dependências mudarem
  useEffect(() => {
    calcularTaxaEntrega();
  }, [calcularTaxaEntrega]); // Dependência: a própria função callback

  const totalComEntrega =
    state.total + (taxaEntregaCalculada !== null ? taxaEntregaCalculada : 0); // Usa 0 se a taxa for null

  const formatarPreco = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const validarDados = (): boolean => {
    const novosErrors: Partial<DadosCliente> = {};

    if (!dadosCliente.nome.trim()) {
      novosErrors.nome = "Nome é obrigatório";
    }

    if (!dadosCliente.telefone.trim()) {
      novosErrors.telefone = "Telefone é obrigatório";
    } else {
      const telefoneNumeros = dadosCliente.telefone.replace(/\D/g, "");
      if (telefoneNumeros.length < 10 || telefoneNumeros.length > 11) {
        novosErrors.telefone =
          "Telefone deve ter 10 ou 11 dígitos (DDD + número)";
      } else if (telefoneNumeros.length === 11 && telefoneNumeros[2] !== "9") {
        novosErrors.telefone =
          "Celular com 11 dígitos deve começar com 9 (ex: (DD) 9XXXX-XXXX)";
      }
    }

    if (dadosCliente.tipoEntrega === "entrega") {
      if (!dadosCliente.endereco.trim()) {
        novosErrors.endereco = "Endereço é obrigatório para entrega";
      }
      if (!dadosCliente.cep.trim()) {
        novosErrors.cep = "CEP é obrigatório para entrega";
      } else if (!/^\d{5}-\d{3}$/.test(dadosCliente.cep)) {
        novosErrors.cep = "CEP inválido. Use o formato XXXXX-XXX";
      } else if (!dadosCliente.cidade || !dadosCliente.estado) {
        novosErrors.cep =
          "Não foi possível encontrar o endereço para este CEP. Verifique o CEP ou digite o endereço completo manualmente.";
      } else if (taxaEntregaCalculada === null) {
        novosErrors.endereco =
          "Entrega indisponível para esta região. Por favor, verifique o CEP ou entre em contato.";
      }
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
    const numeros = valor.replace(/\D/g, "");

    if (numeros.length <= 2) {
      return numeros;
    }
    if (numeros.length <= 6) {
      return `(${numeros.substring(0, 2)}) ${numeros.substring(2)}`;
    }
    if (numeros.length <= 10) {
      return `(${numeros.substring(0, 2)}) ${numeros.substring(
        2,
        6
      )}-${numeros.substring(6)}`;
    }
    if (numeros.length <= 11) {
      return `(${numeros.substring(0, 2)}) ${numeros.substring(
        2,
        7
      )}-${numeros.substring(7)}`;
    }
    return `(${numeros.substring(0, 2)}) ${numeros.substring(
      2,
      7
    )}-${numeros.substring(7, 11)}`;
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarTelefone(e.target.value);
    setDadosCliente((prev) => ({ ...prev, telefone: valorFormatado }));
  };

  const formatarCep = (valor: string) => {
    const numeros = valor.replace(/\D/g, "");
    if (numeros.length > 5) {
      return `${numeros.substring(0, 5)}-${numeros.substring(5, 8)}`;
    }
    return numeros;
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarCep(e.target.value);
    setDadosCliente((prev) => ({ ...prev, cep: valorFormatado }));
  };

  const handleProximaEtapa = () => {
    if (validarDados()) {
      setEtapa("confirmacao");
    }
  };

  const gerarMensagemWhatsApp = () => {
    let mensagem = "🛒 *NOVO PEDIDO - FREEZEFOOD*\n\n";

    mensagem += "👤 *DADOS DO CLIENTE*\n";
    mensagem += `Nome: ${dadosCliente.nome}\n`;
    mensagem += `Telefone: ${dadosCliente.telefone}\n`;

    mensagem += `Tipo de Entrega: ${
      dadosCliente.tipoEntrega === "entrega"
        ? "Entrega 🚚"
        : "Retirada no Local 🏠"
    }\n`;

    if (dadosCliente.tipoEntrega === "entrega") {
      mensagem += `Endereço: ${dadosCliente.endereco}\n`;
      mensagem += `CEP: ${dadosCliente.cep}\n`;
      if (dadosCliente.cidade) {
        mensagem += `Cidade: ${dadosCliente.cidade} - ${dadosCliente.estado}\n`;
      }
      if (dadosCliente.complemento) {
        mensagem += `Complemento: ${dadosCliente.complemento}\n`;
      }
    } else {
      mensagem += `Local de Retirada: Rua Exemplo, 123 - Centro (CEP: ${CEP_ORIGEM_NEGOCIO})\n`;
    }
    mensagem += "\n";

    mensagem += "📦 *ITENS DO PEDIDO*\n";
    state.itens.forEach((item, index) => {
      mensagem += `${index + 1}. ${item.quantidade}x ${item.nome}\n`;
      mensagem += `   ${formatarPreco(
        item.precoNumerico
      )} cada = ${formatarPreco(item.precoNumerico * item.quantidade)}\n`;
    });
    mensagem += "\n";

    mensagem += "💰 *RESUMO FINANCEIRO*\n";
    mensagem += `Subtotal: ${formatarPreco(state.total)}\n`;
    const taxaEntrega =
      taxaEntregaCalculada !== null ? taxaEntregaCalculada : 0;
    if (dadosCliente.tipoEntrega === "entrega") {
      if (taxaEntrega > 0) {
        mensagem += `Taxa de entrega: ${formatarPreco(taxaEntrega)}\n`;
      } else {
        mensagem += `Taxa de entrega: GRÁTIS ✅\n`;
      }
    } else {
      mensagem += `(Retirada no local, sem taxa de entrega)\n`;
    }
    mensagem += `*TOTAL: ${formatarPreco(totalComEntrega)}*\n\n`;

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

    window.open(url, "_blank");

    limparCarrinho();
    onClose();

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
      cep: "",
      cidade: "",
      estado: "",
      complemento: "",
      observacoes: "",
      formaPagamento: "dinheiro",
      troco: "",
      tipoEntrega: "entrega",
    });
    setErrors({});
    setTaxaEntregaCalculada(null); // Limpar a taxa calculada ao fechar
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
                      {isFetchingTaxa
                        ? "Calculando..."
                        : dadosCliente.cep.replace(/\D/g, "").length > 0 &&
                          (!dadosCliente.cidade || !dadosCliente.estado)
                        ? "Entrega Indisponível"
                        : taxaEntregaCalculada === 0
                        ? "Entrega Grátis"
                        : taxaEntregaCalculada !== null
                        ? `+${formatarPreco(taxaEntregaCalculada)} entrega`
                        : "Calculamos a taxa de entrega"}
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
                    onClick={() => {
                      setDadosCliente((prev) => ({
                        ...prev,
                        tipoEntrega: "entrega",
                      }));
                    }}
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
                    onClick={() => {
                      setDadosCliente((prev) => ({
                        ...prev,
                        tipoEntrega: "retirada",
                        cep: "",
                        endereco: "",
                        complemento: "",
                        cidade: "",
                        estado: "",
                      }));
                    }}
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
                    <Label htmlFor="cep">CEP *</Label>
                    <Input
                      id="cep"
                      value={dadosCliente.cep}
                      onChange={handleCepChange}
                      placeholder="94900-000"
                      maxLength={9}
                      className={`${
                        errors.cep ? "border-red-500" : ""
                      } focus:!ring-0`}
                    />
                    {errors.cep && (
                      <p className="text-red-500 text-xs mt-1">{errors.cep}</p>
                    )}
                    {dadosCliente.cidade && dadosCliente.estado && (
                      <p className="text-xs text-gray-500 mt-1">
                        Cidade: {dadosCliente.cidade} - {dadosCliente.estado}
                      </p>
                    )}
                    {isFetchingTaxa &&
                      dadosCliente.cep.replace(/\D/g, "").length === 8 && (
                        <p className="text-xs text-blue-500 mt-1">
                          Calculando taxa de entrega...
                        </p>
                      )}
                    {!isFetchingTaxa &&
                      taxaEntregaCalculada === null &&
                      dadosCliente.cidade && (
                        <p className="text-xs text-red-500 mt-1">
                          Não foi possível calcular o frete para esta cidade.
                        </p>
                      )}
                  </div>
                  <div>
                    <Label htmlFor="endereco">Endereço *</Label>
                    <Input
                      id="endereco"
                      value={dadosCliente.endereco}
                      onChange={(e) =>
                        setDadosCliente((prev) => ({
                          ...prev,
                          endereco: e.target.value,
                        }))
                      }
                      placeholder="Rua Alvorada, 123"
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
                  Retirada no local: Rua Exemplo, 123 - Centro (CEP:{" "}
                  {CEP_ORIGEM_NEGOCIO})
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
                      type="number"
                      step="0.01"
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
                    <div className="flex flex-col">
                      <span>
                        <strong>Endereço:</strong> {dadosCliente.endereco}
                      </span>
                      <span>
                        <strong>CEP:</strong> {dadosCliente.cep}
                      </span>
                      {dadosCliente.cidade && dadosCliente.estado && (
                        <span>
                          <strong>Cidade:</strong> {dadosCliente.cidade} -{" "}
                          {dadosCliente.estado}
                        </span>
                      )}
                      {dadosCliente.complemento && (
                        <span>
                          <strong>Complemento:</strong>{" "}
                          {dadosCliente.complemento}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p>
                      <strong>Local de Retirada:</strong> Rua Exemplo, 123 -
                      Centro (CEP: {CEP_ORIGEM_NEGOCIO})
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
                    <span>Taxa de Entrega:</span>
                    <span>
                      {isFetchingTaxa
                        ? "Calculando..."
                        : taxaEntregaCalculada === 0
                        ? "GRÁTIS"
                        : taxaEntregaCalculada !== null
                        ? formatarPreco(taxaEntregaCalculada)
                        : "Indisponível"}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-lg text-blue-700">
                    <span>Total:</span>
                    <span>{formatarPreco(totalComEntrega)}</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2 pt-4">
          {etapa === "dados" ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-auto"
              >
                Voltar ao Carrinho
              </Button>
              <Button
                type="button"
                onClick={handleProximaEtapa}
                className="w-full sm:w-auto"
                disabled={
                  isFetchingTaxa ||
                  (dadosCliente.tipoEntrega === "entrega" &&
                    taxaEntregaCalculada === null)
                }
              >
                Próxima Etapa
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEtapa("dados")}
                className="w-full sm:w-auto"
              >
                Editar Dados
              </Button>
              <Button
                type="button"
                onClick={enviarPedido}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
              >
                Enviar Pedido via WhatsApp
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
