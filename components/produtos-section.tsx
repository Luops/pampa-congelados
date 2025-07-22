"use client";

import type React from "react";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, X, Minus, Plus } from "lucide-react";
import Image from "next/image";
import ProdutoModal from "./produto-modal";
import { useCarrinho } from "@/contexts/carrinho-context";

interface Produto {
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

const produtos: Produto[] = [
  {
    id: 1,
    nome: "Coxinha de Frango",
    descricao:
      "Coxinha tradicional com recheio cremoso de frango desfiado e temperos especiais",
    preco: "R$ 2,50",
    categoria: "Salgados",
    imagem: "/placeholder.svg?height=200&width=200",
    imagens: [
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
    ],
    ingredientes: [
      "Farinha de trigo",
      "Frango desfiado",
      "Cebola",
      "Alho",
      "Temperos naturais",
      "Óleo vegetal",
      "Sal",
    ],
    informacoesNutricionais: {
      calorias: "180 kcal",
      proteinas: "12g",
      carboidratos: "15g",
      gorduras: "8g",
    },
    modoPreparo: [
      "Retire do freezer 10 minutos antes de fritar",
      "Aqueça o óleo a 180°C",
      "Frite por 3-4 minutos até dourar",
      "Escorra em papel absorvente",
      "Sirva quente",
    ],
    tempoPreparo: "5 min",
    porcoes: "1 unidade",
    temperatura: "-18°C",
    validade: "6 meses congelado",
    peso: "80g",
    avaliacao: 5,
    totalAvaliacoes: 127,
  },
  {
    id: 2,
    nome: "Pastel de Queijo",
    descricao: "Pastel crocante com queijo derretido e massa artesanal",
    preco: "R$ 3,00",
    categoria: "Salgados",
    imagem: "/placeholder.svg?height=200&width=200",
    ingredientes: [
      "Farinha de trigo",
      "Queijo mussarela",
      "Ovos",
      "Óleo vegetal",
      "Sal",
      "Fermento",
    ],
    informacoesNutricionais: {
      calorias: "220 kcal",
      proteinas: "10g",
      carboidratos: "18g",
      gorduras: "12g",
    },
    modoPreparo: [
      "Retire do freezer",
      "Aqueça o óleo a 180°C",
      "Frite por 4-5 minutos",
      "Vire uma vez durante a fritura",
      "Sirva imediatamente",
    ],
    tempoPreparo: "6 min",
    porcoes: "1 unidade",
    temperatura: "-18°C",
    validade: "6 meses congelado",
    peso: "100g",
    avaliacao: 4,
    totalAvaliacoes: 89,
  },
  {
    id: 3,
    nome: "Empada de Palmito",
    descricao: "Empada artesanal com recheio de palmito",
    preco: "R$ 4,00",
    categoria: "Salgados",
    imagem: "/placeholder.svg?height=200&width=200",
    ingredientes: [
      "Farinha de trigo",
      "Palmito",
      "Ovos",
      "Cebola",
      "Azeitonas",
      "Requeijão",
      "Sal",
    ],
    informacoesNutricionais: {
      calorias: "250 kcal",
      proteinas: "8g",
      carboidratos: "20g",
      gorduras: "15g",
    },
    modoPreparo: [
      "Retire do freezer",
      "Aqueça o forno a 180°C",
      "Asse por 20-25 minutos",
      "Sirva quente",
    ],
    tempoPreparo: "25 min",
    porcoes: "1 unidade",
    temperatura: "-18°C",
    validade: "6 meses congelado",
    peso: "120g",
    avaliacao: 4.5,
    totalAvaliacoes: 63,
  },
  {
    id: 4,
    nome: "Quibe Assado",
    descricao: "Quibe tradicional assado com carne temperada",
    preco: "R$ 3,50",
    categoria: "Salgados",
    imagem: "/placeholder.svg?height=200&width=200",
    ingredientes: [
      "Trigo para quibe",
      "Carne moída",
      "Cebola",
      "Hortelã",
      "Especiarias árabes",
      "Azeite",
      "Sal",
    ],
    informacoesNutricionais: {
      calorias: "200 kcal",
      proteinas: "15g",
      carboidratos: "10g",
      gorduras: "10g",
    },
    modoPreparo: [
      "Retire do freezer",
      "Aqueça o forno a 180°C",
      "Asse por 30-35 minutos",
      "Sirva com limão",
    ],
    tempoPreparo: "35 min",
    porcoes: "1 unidade",
    temperatura: "-18°C",
    validade: "6 meses congelado",
    peso: "100g",
    avaliacao: 4.2,
    totalAvaliacoes: 48,
  },
  {
    id: 5,
    nome: "Torta de Frango",
    descricao: "Torta individual com frango e catupiry",
    preco: "R$ 8,00",
    categoria: "Tortas",
    imagem: "/placeholder.svg?height=200&width=200",
    ingredientes: [
      "Farinha de trigo",
      "Frango desfiado",
      "Catupiry",
      "Ovos",
      "Cebola",
      "Azeitonas",
      "Sal",
    ],
    informacoesNutricionais: {
      calorias: "350 kcal",
      proteinas: "20g",
      carboidratos: "25g",
      gorduras: "20g",
    },
    modoPreparo: [
      "Retire do freezer",
      "Aqueça o forno a 180°C",
      "Asse por 25-30 minutos",
      "Sirva quente",
    ],
    tempoPreparo: "30 min",
    porcoes: "1 unidade",
    temperatura: "-18°C",
    validade: "6 meses congelado",
    peso: "200g",
    avaliacao: 4.7,
    totalAvaliacoes: 92,
  },
  {
    id: 6,
    nome: "Lasanha Bolonhesa",
    descricao: "Lasanha congelada para 4 pessoas",
    preco: "R$ 25,00",
    categoria: "Pratos Prontos",
    imagem: "/placeholder.svg?height=200&width=200",
    ingredientes: [
      "Massa de lasanha",
      "Carne moída",
      "Molho de tomate",
      "Queijo mussarela",
      "Presunto",
      "Requeijão",
      "Cebola",
    ],
    informacoesNutricionais: {
      calorias: "450 kcal",
      proteinas: "30g",
      carboidratos: "35g",
      gorduras: "25g",
    },
    modoPreparo: [
      "Retire do freezer",
      "Aqueça o forno a 180°C",
      "Asse por 40-45 minutos",
      "Sirva quente",
    ],
    tempoPreparo: "45 min",
    porcoes: "4 pessoas",
    temperatura: "-18°C",
    validade: "6 meses congelado",
    peso: "800g",
    avaliacao: 4.3,
    totalAvaliacoes: 75,
  },
  {
    id: 7,
    nome: "Risole de Camarão",
    descricao: "Risole crocante com recheio de camarão",
    preco: "R$ 4,50",
    categoria: "Salgados",
    imagem: "/placeholder.svg?height=200&width=200",
    ingredientes: [
      "Farinha de trigo",
      "Camarão",
      "Cebola",
      "Alho",
      "Salsa",
      "Requeijão",
      "Sal",
    ],
    informacoesNutricionais: {
      calorias: "230 kcal",
      proteinas: "14g",
      carboidratos: "16g",
      gorduras: "12g",
    },
    modoPreparo: [
      "Retire do freezer",
      "Aqueça o óleo a 180°C",
      "Frite por 3-4 minutos",
      "Sirva quente",
    ],
    tempoPreparo: "4 min",
    porcoes: "1 unidade",
    temperatura: "-18°C",
    validade: "6 meses congelado",
    peso: "90g",
    avaliacao: 4.6,
    totalAvaliacoes: 58,
  },
  {
    id: 8,
    nome: "Torta de Palmito",
    descricao: "Torta salgada com palmito e azeitonas",
    preco: "R$ 12,00",
    categoria: "Tortas",
    imagem: "/placeholder.svg?height=200&width=200",
    ingredientes: [
      "Farinha de trigo",
      "Palmito",
      "Azeitonas",
      "Ovos",
      "Cebola",
      "Requeijão",
      "Sal",
    ],
    informacoesNutricionais: {
      calorias: "400 kcal",
      proteinas: "18g",
      carboidratos: "30g",
      gorduras: "22g",
    },
    modoPreparo: [
      "Retire do freezer",
      "Aqueça o forno a 180°C",
      "Asse por 30-35 minutos",
      "Sirva quente",
    ],
    tempoPreparo: "35 min",
    porcoes: "2 pessoas",
    temperatura: "-18°C",
    validade: "6 meses congelado",
    peso: "300g",
    avaliacao: 4.4,
    totalAvaliacoes: 69,
  },
  {
    id: 9,
    nome: "Strogonoff de Carne",
    descricao: "Strogonoff congelado para 3 pessoas",
    preco: "R$ 22,00",
    categoria: "Pratos Prontos",
    imagem: "/placeholder.svg?height=200&width=200",
    ingredientes: [
      "Carne",
      "Champignon",
      "Creme de leite",
      "Cebola",
      "Mostarda",
      "Ketchup",
      "Arroz",
    ],
    informacoesNutricionais: {
      calorias: "500 kcal",
      proteinas: "35g",
      carboidratos: "40g",
      gorduras: "25g",
    },
    modoPreparo: [
      "Retire do freezer",
      "Aqueça em fogo baixo",
      "Sirva com arroz",
    ],
    tempoPreparo: "20 min",
    porcoes: "3 pessoas",
    temperatura: "-18°C",
    validade: "6 meses congelado",
    peso: "600g",
    avaliacao: 4.1,
    totalAvaliacoes: 52,
  },
  {
    id: 10,
    nome: "Brigadeiro Gourmet",
    descricao: "Brigadeiros artesanais diversos sabores",
    preco: "R$ 2,00",
    categoria: "Doces",
    imagem: "/placeholder.svg?height=200&width=200",
    ingredientes: [
      "Leite condensado",
      "Chocolate em pó",
      "Manteiga",
      "Chocolate granulado",
      "Sabores variados",
    ],
    informacoesNutricionais: {
      calorias: "120 kcal",
      proteinas: "2g",
      carboidratos: "20g",
      gorduras: "4g",
    },
    modoPreparo: ["Pronto para consumo"],
    tempoPreparo: "0 min",
    porcoes: "1 unidade",
    temperatura: "5°C",
    validade: "7 dias",
    peso: "20g",
    avaliacao: 4.9,
    totalAvaliacoes: 150,
  },
  {
    id: 11,
    nome: "Torta de Chocolate",
    descricao: "Torta doce de chocolate com cobertura",
    preco: "R$ 18,00",
    categoria: "Doces",
    imagem: "/placeholder.svg?height=200&width=200",
    ingredientes: [
      "Farinha de trigo",
      "Chocolate",
      "Ovos",
      "Açúcar",
      "Manteiga",
      "Leite",
      "Fermento",
    ],
    informacoesNutricionais: {
      calorias: "450 kcal",
      proteinas: "8g",
      carboidratos: "50g",
      gorduras: "25g",
    },
    modoPreparo: ["Pronto para consumo"],
    tempoPreparo: "0 min",
    porcoes: "6 pessoas",
    temperatura: "5°C",
    validade: "5 dias",
    peso: "500g",
    avaliacao: 4.8,
    totalAvaliacoes: 110,
  },
  {
    id: 12,
    nome: "Escondidinho de Carne",
    descricao: "Escondidinho tradicional congelado",
    preco: "R$ 20,00",
    categoria: "Pratos Prontos",
    imagem: "/placeholder.svg?height=200&width=200",
    ingredientes: [
      "Carne moída",
      "Purê de batata",
      "Queijo mussarela",
      "Cebola",
      "Alho",
      "Azeite",
      "Sal",
    ],
    informacoesNutricionais: {
      calorias: "400 kcal",
      proteinas: "25g",
      carboidratos: "30g",
      gorduras: "20g",
    },
    modoPreparo: [
      "Retire do freezer",
      "Aqueça no microondas ou forno",
      "Sirva quente",
    ],
    tempoPreparo: "15 min",
    porcoes: "2 pessoas",
    temperatura: "-18°C",
    validade: "6 meses congelado",
    peso: "400g",
    avaliacao: 4.0,
    totalAvaliacoes: 45,
  },
];

export default function ProdutosSection() {
  const [pesquisa, setPesquisa] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todas");
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(
    null
  );
  const [modalAberto, setModalAberto] = useState(false);
  const [quantidades, setQuantidades] = useState<Record<number, number>>({});

  const { adicionarItem } = useCarrinho();

  // Função para obter quantidade de um produto específico
  const obterQuantidadeProduto = (produtoId: number): number => {
    return quantidades[produtoId] || 1;
  };

  // Função para atualizar quantidade de um produto
  const atualizarQuantidadeProduto = (
    produtoId: number,
    novaQuantidade: number
  ) => {
    if (novaQuantidade < 1) return;
    setQuantidades((prev) => ({
      ...prev,
      [produtoId]: novaQuantidade,
    }));
  };

  // Extrair categorias únicas dos produtos
  const categorias = useMemo(() => {
    const categoriasUnicas = Array.from(
      new Set(produtos.map((produto) => produto.categoria))
    );
    return ["Todas", ...categoriasUnicas];
  }, []);

  // Filtrar produtos baseado na pesquisa e categoria
  const produtosFiltrados = useMemo(() => {
    return produtos.filter((produto) => {
      const matchPesquisa =
        produto.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
        produto.descricao.toLowerCase().includes(pesquisa.toLowerCase());

      const matchCategoria =
        categoriaSelecionada === "Todas" ||
        produto.categoria === categoriaSelecionada;

      return matchPesquisa && matchCategoria;
    });
  }, [pesquisa, categoriaSelecionada]);

  const limparFiltros = () => {
    setPesquisa("");
    setCategoriaSelecionada("Todas");
  };

  const abrirModal = (produto: Produto) => {
    setProdutoSelecionado(produto);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setProdutoSelecionado(null);
  };

  const adicionarAoCarrinhoRapido = (
    produto: Produto,
    event: React.MouseEvent
  ) => {
    event.stopPropagation(); // Evita abrir o modal
    const quantidade = obterQuantidadeProduto(produto.id);
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
    setQuantidades((prev) => ({
      ...prev,
      [produto.id]: 1,
    }));
  };

  return (
    <section id="produtos" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Nossos Produtos
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Uma seleção especial de salgados, tortas e pratos prontos, todos
            preparados com ingredientes frescos e muito carinho.
          </p>
        </div>

        {/* Filtros e Pesquisa */}
        <div className="mb-8 space-y-6">
          {/* Barra de Pesquisa */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Pesquisar produtos..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
              {pesquisa && (
                <button
                  onClick={() => setPesquisa("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filtro por Categorias */}
          <div className="flex flex-wrap justify-center gap-2">
            {categorias.map((categoria) => (
              <Button
                key={categoria}
                variant={
                  categoriaSelecionada === categoria ? "default" : "outline"
                }
                size="sm"
                onClick={() => setCategoriaSelecionada(categoria)}
                className={`${
                  categoriaSelecionada === categoria
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
                }`}
              >
                {categoria}
              </Button>
            ))}
          </div>

          {/* Indicadores de Filtros Ativos */}
          {(pesquisa || categoriaSelecionada !== "Todas") && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-gray-600">Filtros ativos:</span>
              {pesquisa && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Pesquisa: "{pesquisa}"
                  <button onClick={() => setPesquisa("")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {categoriaSelecionada !== "Todas" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Categoria: {categoriaSelecionada}
                  <button onClick={() => setCategoriaSelecionada("Todas")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={limparFiltros}
                className="text-blue-600 hover:text-blue-700"
              >
                Limpar todos
              </Button>
            </div>
          )}
        </div>

        {/* Contador de Resultados */}
        <div className="text-center mb-6">
          <p className="text-gray-600">
            {produtosFiltrados.length === produtos.length
              ? `Mostrando todos os ${produtos.length} produtos`
              : `Encontrados ${produtosFiltrados.length} de ${produtos.length} produtos`}
          </p>
        </div>

        {/* Grid de Produtos */}
        {produtosFiltrados.length > 0 ? (
          <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {produtosFiltrados.map((produto) => (
              <Card
                key={produto.id}
                className="flex flex-row-reverse hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => abrirModal(produto)}
              >
                <div className="relative w-[45%] sm:w-[40%] overflow-hidden">
                  <Image
                    src={produto.imagem || "/placeholder.svg"}
                    alt={produto.nome}
                    width={300}
                    height={200}
                    className="w-full h-[168px] sm:h-48 object-cover"
                  />
                </div>
                <CardContent className="relative flex flex-col w-[70%] mt-1 p-2 sm:p-3">
                  <h3 className="text-md sm:text-lg font-semibold mb-2 line-clamp-1">
                    {produto.nome}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
                    {produto.descricao}
                  </p>
                  <div className="flex items-center text-xs sm:text-md gap-2 mb-1 sm:mb-3">
                    a partir de
                    <span className="font-bold text-blue-600">
                      {produto.preco}
                    </span>
                  </div>
                  <Badge className="absolute -top-5 left-2 bg-blue-600">
                    {produto.categoria}
                  </Badge>

                  {/* Controles de Quantidade e Botão Adicionar */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          atualizarQuantidadeProduto(
                            produto.id,
                            obterQuantidadeProduto(produto.id) - 1
                          );
                        }}
                        disabled={obterQuantidadeProduto(produto.id) <= 1}
                        className="h-4 sm:h-8 w-4 sm:w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="px-3 py-1 min-w-[2rem] text-center text-sm font-medium">
                        {obterQuantidadeProduto(produto.id)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          atualizarQuantidadeProduto(
                            produto.id,
                            obterQuantidadeProduto(produto.id) + 1
                          );
                        }}
                        className="h-4 sm:h-8 w-4 sm:w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      onClick={(e) => adicionarAoCarrinhoRapido(produto, e)}
                      className="text-[10px] p-2 h-fit sm:p-3 sm:text-sm"
                    >
                      Adicionar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              Tente ajustar sua pesquisa ou selecionar uma categoria diferente.
            </p>
            <Button variant="outline" onClick={limparFiltros}>
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
      <ProdutoModal
        produto={produtoSelecionado}
        isOpen={modalAberto}
        onClose={fecharModal}
      />
    </section>
  );
}
