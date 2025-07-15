"use client";

import { useState } from "react";
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

interface ProdutoDetalhado {
  id: number;
  nome: string;
  descricao: string;
  preco: string;
  categoria: string;
  imagem: string;
  imagens?: string[];
  ingredientes: string[];
  informacoesNutricionais: {
    calorias: string;
    proteinas: string;
    carboidratos: string;
    gorduras: string;
  };
  modoPreparo: string[];
  tempoPreparo: string;
  porcoes: string;
  temperatura: string;
  validade: string;
  peso: string;
  avaliacao: number;
  totalAvaliacoes: number;
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

  const { adicionarItem, obterQuantidadeItem } = useCarrinho();
  const quantidadeNoCarrinho = obterQuantidadeItem(produto?.id || 0);

  if (!produto) return null;

  const imagens = produto.imagens || [produto.imagem];

  const incrementarQuantidade = () => setQuantidade((prev) => prev + 1);
  const decrementarQuantidade = () =>
    setQuantidade((prev) => Math.max(1, prev - 1));

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
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
      });
      // Resetar quantidade para 1 após adicionar
      setQuantidade(1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] max-w-4xl max-h-[90vh] flex flex-col items-center overflow-y-auto lg:px-5">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">
            {produto.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 w-[88vw] lg:w-full">
          {/* Galeria de Imagens */}
          <div className="space-y-4 w-full flex flex-col">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 max-h-[550px]">
              <Image
                src={imagens[imagemAtual] || "/placeholder.svg"}
                alt={produto.nome}
                fill
                className="w-full object-cover"
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
          <div className="space-y-4 max-[420px]:w-[85vw]">
            <div>
              <p className="text-gray-600 mb-4">{produto.descricao}</p>

              {/* Avaliação */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">{renderStars(produto.avaliacao)}</div>
                <span className="text-sm text-gray-600">
                  {produto.avaliacao}/5 ({produto.totalAvaliacoes} avaliações)
                </span>
              </div>

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
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={decrementarQuantidade}
                    disabled={quantidade <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">
                    {quantidade}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={incrementarQuantidade}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col items-center gap-2 mb-4">
                <Button
                  className="w-full flex-1 bg-blue-600 hover:bg-blue-700 py-4"
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
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {produto.ingredientes.map((ingrediente, index) => (
                  <li key={index}>{ingrediente}</li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="preparo" className="mt-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Modo de Preparo:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                {produto.modoPreparo.map((passo, index) => (
                  <li key={index}>{passo}</li>
                ))}
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="nutricional" className="mt-4">
            <div className="space-y-4">
              <h4 className="font-semibold">
                Informações Nutricionais (por porção):
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-gray-600">Calorias</div>
                  <div className="font-semibold">
                    {produto.informacoesNutricionais.calorias}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-gray-600">Proteínas</div>
                  <div className="font-semibold">
                    {produto.informacoesNutricionais.proteinas}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-gray-600">Carboidratos</div>
                  <div className="font-semibold">
                    {produto.informacoesNutricionais.carboidratos}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-gray-600">Gorduras</div>
                  <div className="font-semibold">
                    {produto.informacoesNutricionais.gorduras}
                  </div>
                </div>
              </div>
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
      </DialogContent>
    </Dialog>
  );
}
