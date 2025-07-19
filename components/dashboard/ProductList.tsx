"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import ProductCard from "@/components/dashboard/ProductCard"; // Importe o novo componente
import { Separator } from "@/components/ui/separator";
import { useDebounce } from "use-debounce"; // Para evitar muitas requisições na pesquisa
import { Product } from "@/lib/schema"; // Assumindo que você tem o tipo Product
import { toast } from "sonner";

// Instale com npm install use-debounce

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  const limit = 8;

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        q: debouncedSearchQuery,
      });

      const res = await fetch(`/api/products?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error("Falha ao buscar produtos.");
      }
      const newProducts: Product[] = await res.json();

      setProducts((prevProducts) =>
        offset === 0 ? newProducts : [...prevProducts, ...newProducts]
      );

      setHasMore(newProducts.length === limit);
    } catch (error: any) {
      console.error("Erro na requisição:", error);
      toast.error("Erro ao carregar os produtos.");
    } finally {
      setIsLoading(false);
    }
  }, [offset, debouncedSearchQuery]);

  useEffect(() => {
    setOffset(0); // Reseta o offset quando a pesquisa muda
  }, [debouncedSearchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleShowMore = () => {
    setOffset((prevOffset) => prevOffset + limit);
  };

  const handleProductDelete = (deletedId: string) => {
    // Remove o produto da lista localmente para uma atualização mais rápida
    setProducts((prevProducts) =>
      prevProducts.filter((p) => p.id !== deletedId)
    );
  };

  return (
    <section className="container mx-auto p-4 lg:p-8 lg:pl-[280px]">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-700 mt-10 uppercase font-mono">
        Gerenciar Produtos
      </h1>

      {/* Campo de pesquisa */}
      <div className="relative mb-6">
        <Input
          type="text"
          placeholder="Pesquisar por nome do produto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
      </div>

      <Separator className="my-6" />

      {/* Lista de produtos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onDelete={handleProductDelete}
          />
        ))}
      </div>

      {/* Loading e Botão 'Mostrar Mais' */}
      <div className="flex flex-col justify-center items-center my-8">
        {isLoading && (
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <span className="text-gray-500">Carregando...</span>
          </div>
        )}
        {!isLoading && hasMore && products.length > 0 && (
          <Button onClick={handleShowMore} variant="outline" className="w-[150px]">
            Mostrar Mais
          </Button>
        )}
        {!isLoading && products.length === 0 && (
          <p className="text-center text-gray-500">
            Nenhum produto encontrado.
          </p>
        )}
      </div>
    </section>
  );
}
