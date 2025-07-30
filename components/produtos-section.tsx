"use client";

import type React from "react";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, X, Minus, Plus } from "lucide-react";
import Image from "next/image";
import ProdutoModal from "./produto-modal";
import { useCarrinho } from "@/contexts/carrinho-context";

interface ProdutoApi {
  id: number;
  product_name: string;
  image_url: string;
  description: string;
  reviews_stars_by_person?: number; // Avaliação em estrelas
  reviews_count?: number; // Total de avaliações
  price: string;
  promo_price?: string; // Preço promocional (se existir na DB)
  stock_quantity?: number; // Quantidade em estoque (se existir na DB)
  ingredients?: string[] | string; // Pode vir como array ou string JSON escapada
  preparation?: string[] | string; // Pode vir como array ou string JSON escapada
  nutritional_info?:
    | {
        // Informações Nutricionais (se for JSONB na DB)
        calories?: string;
        proteins?: string;
        carbohydrates?: string;
        fats?: string;
      }
    | string; // Pode vir como objeto ou string JSON escapada
  details?:
    | {
        // Detalhes adicionais (se for JSONB na DB)
        yield?: string;
        weight?: string;
        validity?: string;
        storageTemperature?: string;
        cookingTime?: string; // Add this if your DB has a field for preparation time
      }
    | string; // Pode vir como objeto ou string JSON escapada
  category?: string; // Para mapear para 'categoria'
  created_at?: string; // Data de criação
  avaliacao?: number; // Avaliação em estrelas
  total_avaliacoes?: number; // Total de avaliações
}

// Sua interface 'Produto' existente, que será preenchida a partir de 'ProdutoApi'
interface Produto {
  id: number;
  nome: string; // Mapeia de product_name
  descricao: string; // Mapeia de description
  preco: string; // Mapeia de price
  promoPreco?: string; // Mapeia de promo_price
  categoria?: string; // Mapeia de category
  imagem: string; // Mapeia de image_url
  imagens?: string[]; // Pode ser populado com image_url se não houver coluna para múltiplas imagens
  ingredientes?: string[]; // Mapeia de ingredients
  informacoesNutricionais?: {
    // Now an object to match ProdutoDetalhado
    calorias?: string;
    proteinas?: string;
    carboidratos?: string;
    gorduras?: string;
  };
  modoPreparo?: string[]; // Mapeia de preparation
  tempoPreparo?: string; // Mapeia de details.preparationTime
  porcoes?: string; // Mapeia de details.yield
  temperatura?: string; // Mapeia de details.storageTemperature
  validade?: string; // Mapeia de details.validity
  peso?: string; // Mapeia de details.weight
  avaliacao?: number; // Mapeia de reviews_stars_by_person
  totalAvaliacoes?: number; // Mapeia de reviews_count
}

// Função auxiliar para parsear JSON, se for string
const parseJsonSafely = (jsonStringOrObject: any) => {
  if (typeof jsonStringOrObject === "string") {
    try {
      // Tenta remover aspas externas e barras invertidas antes de parsear
      const cleanedString = jsonStringOrObject
        .replace(/^"|"$/g, "")
        .replace(/\\"/g, '"');
      return JSON.parse(cleanedString);
    } catch (e) {
      console.warn("Falha ao parsear JSON string:", jsonStringOrObject, e);
      return {}; // Retorna um objeto vazio em caso de erro
    }
  }
  return jsonStringOrObject || {}; // Retorna o objeto diretamente ou um objeto vazio se for null/undefined
};

const mapProdutoApiToProduto = (apiProduto: ProdutoApi): Produto => {
  // Use a função parseJsonSafely para lidar com os campos JSONB
  const parsedNutritionalInfo = parseJsonSafely(apiProduto.nutritional_info);
  const parsedDetails = parseJsonSafely(apiProduto.details);

  return {
    id: apiProduto.id,
    nome: apiProduto.product_name,
    descricao: apiProduto.description,
    // Aplica a formatação ao preço principal
    preco: formatarPreco(apiProduto.price),
    // Aplica a formatação ao preço promocional, se existir
    promoPreco: apiProduto.promo_price
      ? formatarPreco(apiProduto.promo_price)
      : undefined,
    categoria: apiProduto.category || "Geral", // Assumindo 'category' no DB
    imagem: apiProduto.image_url,
    imagens: apiProduto.image_url ? [apiProduto.image_url] : [], // Populado com a URL principal por enquanto
    ingredientes: (() => {
      const rawIngredients = apiProduto.ingredients;
      if (typeof rawIngredients === "string") {
        try {
          const parsed = JSON.parse(rawIngredients);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          // Fallback para split se não for um JSON de array válido
          return rawIngredients
            .split(/;|\n/g)
            .map((item) => item.trim())
            .filter((item) => item !== "");
        }
      }
      return Array.isArray(rawIngredients) ? rawIngredients : [];
    })(),
    informacoesNutricionais: {
      // Acesse as propriedades do objeto parseado
      calorias:
        parsedNutritionalInfo.calories || parsedNutritionalInfo.calorias,
      proteinas:
        parsedNutritionalInfo.proteins || parsedNutritionalInfo.proteinas,
      carboidratos:
        parsedNutritionalInfo.carbohydrates ||
        parsedNutritionalInfo.carboidratos,
      gorduras: parsedNutritionalInfo.fats || parsedNutritionalInfo.gorduras,
    },
    // Acesse as propriedades do objeto parseado
    peso: parsedDetails.weight,
    avaliacao: apiProduto.avaliacao,
    totalAvaliacoes: apiProduto.total_avaliacoes,
    modoPreparo: (() => {
      const rawPreparation = apiProduto.preparation;
      if (typeof rawPreparation === "string") {
        try {
          const parsed = JSON.parse(rawPreparation);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          // Fallback para split se não for um JSON de array válido
          return rawPreparation
            .split(/;|\n/g)
            .map((item) => item.trim())
            .filter((item) => item !== "");
        }
      }
      return Array.isArray(rawPreparation) ? rawPreparation : [];
    })(),
    porcoes: parsedDetails.yield,
    temperatura: parsedDetails.storageTemperature,
    validade: parsedDetails.validity,
    tempoPreparo: parsedDetails.cookingTime, // Mapeamento para tempoPreparo
  };
};

// Função auxiliar para formatar o preço
const formatarPreco = (preco: string | number | undefined): string => {
  if (preco === undefined || preco === null) {
    return "R$ 0,00"; // Ou qualquer valor padrão para preço não definido
  }

  // Converte para string se for número
  let precoStr = String(preco);

  // 1. Substituir vírgula por ponto para garantir que seja um formato numérico válido para parseFloat
  precoStr = precoStr.replace(",", ".");

  // 2. Converte para número float
  const precoNumerico = parseFloat(precoStr);

  // 3. Verifica se é um número válido
  if (isNaN(precoNumerico)) {
    return "R$ 0,00"; // Retorna um valor padrão se a conversão falhar
  }

  // 4. Formata para moeda brasileira com 2 casas decimais, usando Intl.NumberFormat
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(precoNumerico);
};

export default function ProdutosSection() {
  // Estados para carregar os produtos do DB
  const [fetchedProducts, setFetchedProducts] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pesquisa, setPesquisa] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todas");
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(
    null
  );
  console.log("Produto que foi selecionado: ", produtoSelecionado);
  const [modalAberto, setModalAberto] = useState(false);
  const [quantidades, setQuantidades] = useState<Record<number, number>>({});

  const { adicionarItem } = useCarrinho();

  // useEffect para buscar os produtos da API quando o componente é montado
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true); // Começa o carregamento
        const response = await fetch("/api/products", { method: "GET" }); // Rota da sua API
        if (!response.ok) {
          throw new Error(`Erro HTTP! status: ${response.status}`);
        }
        const data: ProdutoApi[] = await response.json();
        // Mapeia os dados da API para a interface Produto esperada pelo componente
        const mappedProducts = data.map(mapProdutoApiToProduto);
        setFetchedProducts(mappedProducts);
      } catch (err: any) {
        console.error("Falha ao buscar produtos:", err);
        setError(
          "Não foi possível carregar os produtos. Tente novamente mais tarde."
        );
      } finally {
        setLoading(false); // Finaliza o carregamento
      }
    };

    fetchProducts();
  }, []); // Array de dependências vazio para rodar apenas uma vez na montagem

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

  // Extrair categorias únicas dos produtos carregados (agora fetchedProducts)
  const categorias = useMemo(() => {
    const categoriasUnicas = Array.from(
      new Set(fetchedProducts.map((produto) => produto.categoria))
    );
    return ["Todas", ...categoriasUnicas];
  }, [fetchedProducts]); // Dependência alterada para fetchedProducts

  // Filtrar produtos baseado na pesquisa e categoria (agora fetchedProducts)
  const produtosFiltrados = useMemo(() => {
    return fetchedProducts.filter((produto) => {
      // Usa fetchedProducts aqui
      const matchPesquisa =
        produto.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
        produto.descricao.toLowerCase().includes(pesquisa.toLowerCase());

      const matchCategoria =
        categoriaSelecionada === "Todas" ||
        produto.categoria === categoriaSelecionada;

      return matchPesquisa && matchCategoria;
    });
  }, [pesquisa, categoriaSelecionada, fetchedProducts]); // Dependência alterada para fetchedProducts

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
      ingredientes: produto.ingredientes, // Ensure ingredients are passed
      informacoesNutricionais: produto.informacoesNutricionais, // Ensure nutritional info is passed
      modoPreparo: produto.modoPreparo, // Ensure preparation method is passed
      tempoPreparo: produto.tempoPreparo, // Ensure preparation time is passed
      porcoes: produto.porcoes, // Ensure portions are passed
      temperatura: produto.temperatura, // Ensure temperature is passed
      validade: produto.validade, // Ensure validity is passed
      avaliacao: produto.avaliacao,
      totalAvaliacoes: produto.totalAvaliacoes,
    });

    // Resetar quantidade para 1 após adicionar
    setQuantidades((prev) => ({
      ...prev,
      [produto.id]: 1,
    }));
  };

  // Renderização condicional para estados de carregamento e erro
  if (loading) {
    return (
      <section id="produtos" className="py-20 bg-gray-50 text-center">
        <p className="text-xl text-gray-600">Carregando produtos...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section id="produtos" className="py-20 bg-gray-50 text-center">
        <p className="text-xl text-red-600">{error}</p>
      </section>
    );
  }

  return (
    <section id="produtos" className="py-20 bg-gray-50">
      <div className="container mx-auto px-1 sm:px-0">
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
            {produtosFiltrados.length === fetchedProducts.length // Usa fetchedProducts aqui
              ? `Mostrando todos os ${fetchedProducts.length} produtos`
              : `Encontrados ${produtosFiltrados.length} de ${fetchedProducts.length} produtos`}
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
                <CardContent className="relative flex flex-col !w-[55%] sm:w-[60%] mt-1 p-2 sm:p-3">
                  <h3 className="text-md sm:text-lg font-semibold mb-2 line-clamp-1">
                    {produto.nome}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
                    {produto.descricao}
                  </p>
                  <div className="flex items-center text-xs sm:text-md gap-1 mb-1 sm:mb-3">
                    a partir de
                    {produto.promoPreco ? (
                      <>
                        {/* Preço original riscado */}
                        <span className="font-semibold text-gray-500 line-through">
                          {produto.preco}
                        </span>
                        {/* Preço promocional em destaque */}
                        <span className="font-bold text-red-600">
                          {produto.promoPreco}
                        </span>
                      </>
                    ) : (
                      // Se não houver preço promocional, exibe apenas o preço normal
                      <span className="font-bold text-blue-600">
                        {produto.preco}
                      </span>
                    )}
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
