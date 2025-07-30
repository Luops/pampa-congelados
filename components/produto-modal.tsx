"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Users,
  Thermometer,
  ChefHat,
  Heart,
  Share2,
  ShoppingCart,
  Star,
  Minus,
  Plus,
} from "lucide-react";
import Image from "next/image";
import { useCarrinho } from "@/contexts/carrinho-context";
import { useAuth } from "@/contexts/AuthContext"; // Importe o useAuth

interface ProdutoDetalhado {
  id: number;
  nome: string;
  descricao: string;
  preco: string;
  categoria: string;
  imagem: string;
  imagens?: string[];
  ingredientes?: string[]; // Aqui está 'ingredientes'
  informacoesNutricionais?: {
    // Aqui está 'informacoesNutricionais'
    calorias?: string;
    proteinas?: string;
    carboidratos?: string;
    gorduras?: string;
  };
  modoPreparo?: string[]; // Aqui está 'modoPreparo'
  tempoPreparo?: string;
  porcoes?: string;
  temperatura?: string;
  validade?: string;
  peso?: string;
  avaliacao?: number;
  totalAvaliacoes?: number;
}

interface ProdutoModalProps {
  produto: ProdutoDetalhado | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProdutoModal({
  produto,
  isOpen,
  onClose,
}: ProdutoModalProps) {
  const [imagemAtual, setImagemAtual] = useState(0);
  const [quantidade, setQuantidade] = useState(1);
  const [isFavorito, setIsFavorito] = useState(false);
  const [userRating, setUserRating] = useState(0); // State for the user's selected rating
  const [ratingMessage, setRatingMessage] = useState<string | null>(null); // Feedback message for rating

  const { user, loading } = useAuth(); // <--- Use o hook useAuth para pegar o usuário e o status de carregamento
  const isLoggedIn = !!user; // Deriva o status de login diretamente do `user` do AuthContext

  const { adicionarItem, obterQuantidadeItem } = useCarrinho();
  const quantidadeNoCarrinho = obterQuantidadeItem(produto?.id || 0);

  if (!produto) return null;
  console.log("Produto no modal: ", produto);

  const imagens = produto.imagens || [produto.imagem];

  const incrementarQuantidade = () => setQuantidade((prev) => prev + 1);
  const decrementarQuantidade = () =>
    setQuantidade((prev) => Math.max(1, prev - 1));

  const renderStars = (rating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 cursor-pointer ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        } ${interactive ? "hover:text-yellow-500" : ""}`}
        onClick={interactive ? () => setUserRating(i + 1) : undefined}
      />
    ));
  };

  const adicionarAoCarrinho = () => {
    if (produto) {
      adicionarItem({
        id: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        precoNumerico: Number.parseFloat(
          produto.preco.replace("R$", "").replace(",", ".").trim()
        ),
        categoria: produto.categoria,
        imagem: produto.imagem,
        peso: produto.peso,
        quantidade: quantidade,
        ingredientes: produto.ingredientes,
        calorias: produto.informacoesNutricionais?.calorias,
      });
      // Resetar quantidade para 1 após adicionar
      setQuantidade(1);
    }
  };

  // Descrição com a primeira letra maiúscula e após cada ponto final.
  const formatUpperCase = (str: string): string => {
    if (!str) {
      return "";
    }

    // 1. Convert the entire string to lowercase first
    let formattedStr = str.toLowerCase();

    // 2. Capitalize the first letter of the entire string
    formattedStr = formattedStr.charAt(0).toUpperCase() + formattedStr.slice(1);

    // 3. Capitalize the first letter after each period followed by a space
    formattedStr = formattedStr.replace(/(\.\s*)([a-z])/g, (match, p1, p2) => {
      return p1 + p2.toUpperCase();
    });

    return formattedStr;
  };

  // Formata cada item de uma lista separada por ponto e vírgula
  // A primeira letra de cada item (ou após um ';') é maiúscula, o resto minúscula.
  const formatSemiColonList = (items: string[] | undefined): string[] => {
    if (!items || items.length === 0) {
      return [];
    }

    return items.map((item) => {
      // Split by semicolon, trim each part, and then format
      return item
        .split(";")
        .map((part) => {
          const trimmedPart = part.trim();
          if (!trimmedPart) {
            return ""; // Return empty for empty parts
          }
          // Apply the same capitalization logic as formatUpperCase
          return (
            trimmedPart.charAt(0).toUpperCase() +
            trimmedPart.slice(1).toLowerCase()
          );
        })
        .join("; "); // Join back with semicolon and a space
    });
  };

  // Enviar avaliação
  const handleRatingSubmit = async () => {
    if (loading) {
      setRatingMessage("Verificando status de login...");
      return;
    }
    if (!isLoggedIn) {
      setRatingMessage("Você precisa estar logado para avaliar.");
      return;
    }
    if (userRating === 0) {
      setRatingMessage("Por favor, selecione uma avaliação antes de enviar.");
      return;
    }

    setRatingMessage("Enviando avaliação...");

    try {
      const response = await fetch("/api/avaliar-produto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: produto.id,
          rating: userRating,
          userId: user?.id, // <--- Mantenha esta linha para enviar o ID do usuário
          product_name: produto.nome,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao enviar avaliação.");
      }

      setRatingMessage("Avaliação enviada com sucesso!");
      setTimeout(() => {
        setRatingMessage(null);
        setUserRating(0);
      }, 3000);
    } catch (error: any) {
      console.error("Erro ao enviar avaliação:", error.message);
      setRatingMessage(`Erro ao enviar avaliação: ${error.message}`);
      setTimeout(() => setRatingMessage(null), 5000);
    }
  };

  // Apply formatting to ingredients and modoPreparo
  const formattedIngredientes = formatSemiColonList(produto.ingredientes);
  const formattedModoPreparo = formatSemiColonList(produto.modoPreparo);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!w-full sm:w-[98vw] max-w-xl max-h-[90vh] flex flex-col items-center overflow-y-auto px-2 sm:px-5 pb-14">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">
            {produto.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 !w-full">
          {/* Galeria de Imagens */}
          <div className="space-y-4 !w-full flex flex-col">
            <div className="!w-full relative aspect-square rounded-lg overflow-hidden bg-gray-100 max-h-[300px]">
              <Image
                src={imagens[imagemAtual] || "/placeholder.svg"}
                alt={produto.nome}
                fill
                className="!w-full object-cover"
              />
              <Badge className="absolute top-2 left-2 bg-blue-600">
                {produto.categoria}
              </Badge>
            </div>

            {imagens.length > 1 && (
              <div className="flex gap-2 overflow-x-auto max-[420px]:w-[85vw]">
                {imagens.map((imagem, index) => (
                  <button
                    key={index}
                    onClick={() => setImagemAtual(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                      imagemAtual === index
                        ? "border-blue-600"
                        : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={imagem || "/placeholder.svg"}
                      alt={`${produto.nome} ${index + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações do Produto */}
          <div className="!w-full space-y-4 max-[420px]:w-[85vw]">
            <div>
              <p className="text-gray-600 mb-4">
                {formatUpperCase(produto.descricao)}
              </p>

              {/* Avaliação Exibida do Produto */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {renderStars(produto.avaliacao || 0)}
                </div>
                <span className="text-sm text-gray-600">
                  {produto.avaliacao}/5 ({produto.totalAvaliacoes} avaliações)
                </span>
              </div>

              {/* Seção para o Usuário Avaliar */}
              {user && (
                <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-semibold mb-2">Avalie este produto:</h4>
                  {isLoggedIn ? (
                    <>
                      <div className="flex items-center gap-1 mb-3">
                        {renderStars(userRating, true)}{" "}
                        {/* Interactive stars */}
                      </div>
                      <Button
                        onClick={handleRatingSubmit}
                        disabled={userRating === 0}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Enviar Avaliação
                      </Button>
                      {ratingMessage && (
                        <p className="mt-2 text-sm text-center text-gray-700">
                          {ratingMessage}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-600 text-center">
                      Você precisa estar logado para avaliar este produto.
                    </p>
                  )}
                </div>
              )}
              {/* Fim da Seção de Avaliação */}
              {/* Preço */}
              <div className="text-3xl font-bold text-blue-600 mb-4">
                {produto.preco}
              </div>

              {/* Informações Rápidas */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{produto.tempoPreparo}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{produto.porcoes}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Thermometer className="h-4 w-4" />
                  <span>{produto.temperatura}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ChefHat className="h-4 w-4" />
                  <span>{produto.peso}</span>
                </div>
              </div>

              {/* Controles de Quantidade */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium">Quantidade:</span>
                <div className="flex items-center border rounded-md h-7">
                  <Button
                    variant="ghost"
                    onClick={decrementarQuantidade}
                    disabled={quantidade <= 1}
                    className="h-full px-2"
                  >
                    <Minus className="!h-full !w-4 text-red-600" />
                  </Button>
                  <span className="!px-0 w-fit text-center">{quantidade}</span>
                  <Button
                    variant="ghost"
                    onClick={incrementarQuantidade}
                    className="h-full px-2"
                  >
                    <Plus className="!h-full hover: !w-4 text-green-700" />
                  </Button>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col items-center gap-2 mb-4">
                <Button
                  className="!w-full flex-1 bg-blue-600 hover:bg-blue-700 py-4"
                  onClick={adicionarAoCarrinho}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {quantidadeNoCarrinho > 0
                    ? `Adicionar mais (${quantidadeNoCarrinho} no carrinho)`
                    : "Adicionar ao Carrinho"}
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsFavorito(!isFavorito)}
                    className={isFavorito ? "text-red-500 border-red-500" : ""}
                  >
                    <Heart
                      className={`h-4 w-4 ${isFavorito ? "fill-current" : ""}`}
                    />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Tabs com Informações Detalhadas */}
        <Tabs defaultValue="ingredientes" className="w-full">
          <TabsList className="flex w-full overflow-x-auto whitespace-nowrap no-scrollbar gap-2 px-1 scroll-mx-2">
            <TabsTrigger
              value="ingredientes"
              className="text-md shrink-0 max-[520px]:ml-36"
            >
              Ingredientes
            </TabsTrigger>
            <TabsTrigger value="preparo" className="text-md shrink-0">
              Preparo
            </TabsTrigger>
            <TabsTrigger value="nutricional" className="text-md shrink-0">
              Nutricional
            </TabsTrigger>
            <TabsTrigger value="detalhes" className="text-md shrink-0">
              Detalhes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ingredientes" className="mt-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Ingredientes:</h4>
              {formattedIngredientes && formattedIngredientes.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {formattedIngredientes.map((ingrediente, index) => (
                    <li key={index}>{ingrediente}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  Informações de ingredientes não disponíveis.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="preparo" className="mt-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Modo de Preparo:</h4>
              {formattedModoPreparo && formattedModoPreparo.length > 0 ? (
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  {formattedModoPreparo.map((passo, index) => (
                    <li key={index}>{passo}</li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-gray-500">
                  Informações de modo de preparo não disponíveis.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="nutricional" className="mt-4">
            <div className="space-y-4">
              <h4 className="font-semibold">
                Informações Nutricionais (por porção):
              </h4>
              {produto.informacoesNutricionais ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm text-gray-600">Calorias (g)</div>
                    <div className="font-semibold">
                      {produto.informacoesNutricionais.calorias || "N/A"}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm text-gray-600">Proteínas (g)</div>
                    <div className="font-semibold">
                      {produto.informacoesNutricionais.proteinas || "N/A"}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm text-gray-600">
                      Carboidratos (g)
                    </div>
                    <div className="font-semibold">
                      {produto.informacoesNutricionais.carboidratos || "N/A"}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm text-gray-600">Gorduras (g)</div>
                    <div className="font-semibold">
                      {produto.informacoesNutricionais.gorduras || "N/A"}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Informações nutricionais não disponíveis.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="detalhes" className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-gray-800">Peso</h5>
                  <p className="text-sm text-gray-600">{produto.peso}</p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-800">Validade</h5>
                  <p className="text-sm text-gray-600">{produto.validade}</p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-800">
                    Temperatura de Armazenamento
                  </h5>
                  <p className="text-sm text-gray-600">{produto.temperatura}</p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-800">Rendimento</h5>
                  <p className="text-sm text-gray-600">{produto.porcoes}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <Button variant={"outline"} onClick={onClose}>
          Voltar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
