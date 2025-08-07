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
  MessageSquare,
  Instagram,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa"; // Importando ícones de exemplo
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
  ingredientes?: string[];
  informacoesNutricionais?: {
    calorias?: string;
    proteinas?: string;
    carboidratos?: string;
    gorduras?: string;
  };
  modoPreparo?: string[];
  tempoPreparo?: string;
  porcoes?: string;
  temperatura?: string;
  validade?: string;
  peso?: string;
  avaliacao?: number; // Média de todas as avaliações
  totalAvaliacoes?: number; // Total de avaliações
  // Adicione um campo para armazenar a avaliação do USUÁRIO ESPECÍFICO, se vier do backend
  userSpecificRating?: number; // Novo campo para a avaliação do usuário
}

interface ProdutoModalProps {
  produto: ProdutoDetalhado | null;
  isOpen: boolean;
  onClose: () => void;
  // Opcional: callback para atualizar o produto na lista principal após a avaliação
  onRatingSuccess?: (
    productId: number,
    newAvgRating: number,
    newTotalRatings: number
  ) => void;
}

export default function ProdutoModal({
  produto,
  isOpen,
  onClose,
  onRatingSuccess,
}: ProdutoModalProps) {
  const [imagemAtual, setImagemAtual] = useState(0);
  const [quantidade, setQuantidade] = useState(1);
  const [isFavorito, setIsFavorito] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingMessage, setRatingMessage] = useState<string | null>(null);
  const [loadingRating, setLoadingRating] = useState(true);
  const [showShareOptions, setShowShareOptions] = useState(false); // Novo estado para controlar a visibilidade das opções de compartilhamento

  const { user, loading } = useAuth();
  const isLoggedIn = !!user;

  const { adicionarItem, obterQuantidadeItem } = useCarrinho();
  const quantidadeNoCarrinho = obterQuantidadeItem(produto?.id || 0);

  useEffect(() => {
    const fetchUserRating = async () => {
      if (!produto || !user || !isOpen) {
        setLoadingRating(false);
        return;
      }

      setLoadingRating(true);
      try {
        if (produto.userSpecificRating !== undefined) {
          setUserRating(produto.userSpecificRating);
        } else {
          setUserRating(0);
        }
      } catch (error) {
        console.error("Erro ao buscar avaliação do usuário:", error);
        setUserRating(0);
      } finally {
        setLoadingRating(false);
      }
    };

    if (isOpen) {
      fetchUserRating();
    } else {
      setUserRating(0);
      setRatingMessage(null);
      setQuantidade(1);
      setImagemAtual(0);
      setShowShareOptions(false); // Reseta o estado do compartilhamento ao fechar o modal
    }
  }, [isOpen, produto, user]);

  if (!produto) return null;
  console.log("Produto no modal: ", produto);

  const imagens = produto.imagens || [produto.imagem];

  const incrementarQuantidade = () => setQuantidade((prev) => prev + 1);
  const decrementarQuantidade = () =>
    setQuantidade((prev) => Math.max(1, prev - 1));

  const handleStarClick = async (selectedRating: number) => {
    if (loading || loadingRating) {
      setRatingMessage("Aguarde a verificação do status...");
      return;
    }
    if (!isLoggedIn) {
      setRatingMessage("Você precisa estar logado para avaliar.");
      return;
    }

    setUserRating(selectedRating);
    setRatingMessage("Enviando avaliação...");

    try {
      const response = await fetch("/api/avaliar-produto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: produto.id,
          rating: selectedRating,
          userId: user?.id,
          product_name: produto.nome,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao enviar avaliação.");
      }

      setRatingMessage(
        data.message || "Avaliação enviada/atualizada com sucesso!"
      );

      if (
        onRatingSuccess &&
        data.newAvgRating !== undefined &&
        data.newTotalRatings !== undefined
      ) {
        onRatingSuccess(produto.id, data.newAvgRating, data.newTotalRatings);
      }

      setTimeout(() => {
        setRatingMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error("Erro ao enviar avaliação:", error.message);
      setRatingMessage(`Erro ao enviar avaliação: ${error.message}`);
      setTimeout(() => setRatingMessage(null), 5000);
    }
  };

  const renderStars = (rating: number) => {
    const currentRating = isLoggedIn && userRating > 0 ? userRating : rating;

    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < currentRating ? "text-yellow-400 fill-current" : "text-gray-300"
        } ${isLoggedIn ? "cursor-pointer hover:text-yellow-500" : ""}`}
        onClick={isLoggedIn ? () => handleStarClick(i + 1) : undefined}
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
      setQuantidade(1);
    }
  };

  const formatUpperCase = (str: string): string => {
    if (!str) {
      return "";
    }
    let formattedStr = str.toLowerCase();
    formattedStr = formattedStr.charAt(0).toUpperCase() + formattedStr.slice(1);
    formattedStr = formattedStr.replace(/(\.\s*)([a-z])/g, (match, p1, p2) => {
      return p1 + p2.toUpperCase();
    });
    return formattedStr;
  };

  const formatSemiColonList = (items: string[] | undefined): string[] => {
    if (!items || items.length === 0) {
      return [];
    }
    return items.map((item) => {
      return item
        .split(";")
        .map((part) => {
          const trimmedPart = part.trim();
          if (!trimmedPart) {
            return "";
          }
          return (
            trimmedPart.charAt(0).toUpperCase() +
            trimmedPart.slice(1).toLowerCase()
          );
        })
        .join("; ");
    });
  };

  const formattedIngredientes = formatSemiColonList(produto.ingredientes);
  const formattedModoPreparo = formatSemiColonList(produto.modoPreparo);

  // --- Funções de Compartilhamento ---
  const handleShareClick = () => {
    setShowShareOptions((prev) => !prev); // Alterna a visibilidade das opções de compartilhamento
  };

  const getShareUrl = () => {
    // Retorna a URL atual do produto. Adapte se você tiver URLs específicas para produtos.
    // Ex: `window.location.origin}/produtos/${produto.id}`
    return typeof window !== "undefined"
      ? window.location.href
      : "https://seusite.com/produto-exemplo";
  };

  const shareOnWhatsApp = () => {
    const text = `Confira este produto incrível: ${produto.nome}! Preço: ${
      produto.preco
    }. Saiba mais: ${getShareUrl()}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      text
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const shareOnInstagram = () => {
    // O compartilhamento direto para o feed do Instagram via URL é limitado e não muito funcional
    // para web apps. Geralmente, requer a API oficial ou compartilhamento de imagem.
    // Para stories, o link pode ser aberto, mas o usuário precisa adicionar manualmente.
    // Uma alternativa é copiar a URL para a área de transferência e instruir o usuário.

    const shareUrl = getShareUrl();
    const caption = `Olha que legal esse produto: ${produto.nome}!`;

    // Opção 1: Abrir Instagram (o usuário terá que colar a URL manualmente)
    // window.open("https://www.instagram.com/", "_blank");
    // alert("Copie o link e cole na sua história ou post do Instagram: " + shareUrl);

    // Opção 2: Usar a Web Share API (se disponível e para Android/iOS)
    if (navigator.share) {
      navigator
        .share({
          title: produto.nome,
          text: caption,
          url: shareUrl,
        })
        .then(() => console.log("Compartilhado com sucesso!"))
        .catch((error) => console.error("Erro ao compartilhar:", error));
    } else {
      // Fallback para navegadores que não suportam a Web Share API
      // Abre uma nova aba para o Instagram, o usuário terá que copiar e colar o link.
      window.open("https://www.instagram.com/", "_blank");
      alert(`Copie o link e cole no seu Instagram: ${shareUrl}\n\n${caption}`);
    }
  };
  // --- Fim das Funções de Compartilhamento ---

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

              {/* Avaliação Exibida do Produto e Interativa */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {renderStars(produto.avaliacao || 0)}
                </div>
                <span className="text-sm text-gray-600">
                  {produto.avaliacao}/5 ({produto.totalAvaliacoes} avaliações)
                </span>
              </div>
              {/* Mensagem de feedback para a avaliação */}
              {ratingMessage && (
                <p className="mt-2 text-sm text-center text-gray-700">
                  {ratingMessage}
                </p>
              )}

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

              {/* Botões de Ação e Compartilhamento */}
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
                <div className="flex gap-3 relative">
                  {" "}
                  {/* Adicionado relative para posicionamento dos botões de compartilhamento */}
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
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShareClick}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  {/* Opções de Compartilhamento (WhatsApp e Instagram) */}
                  {showShareOptions && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex gap-2 p-2 bg-white border rounded-md shadow-lg z-10">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={shareOnWhatsApp}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <FaWhatsapp className="h-4 w-4" />{" "}
                        {/* Ícone para WhatsApp */}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={shareOnInstagram}
                        className="bg-pink-500 hover:bg-pink-600 text-white"
                      >
                        <Instagram className="h-4 w-4" />{" "}
                        {/* Ícone para Instagram */}
                      </Button>
                    </div>
                  )}
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
