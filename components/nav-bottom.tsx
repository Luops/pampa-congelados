"use client";

import React, { useState } from "react";
import { Home, ShoppingCart } from "lucide-react";
import { useCarrinho } from "@/contexts/carrinho-context";
import { Button } from "@/components/ui/button";
import CarrinhoBottom from "./carrinho-bottom";
import { useRouter } from "next/navigation";

function NavBottom() {
  const { state } = useCarrinho();
  const router = useRouter();

  const [corCarrinho, setCorCarrinho] = useState("white");

  const formatarPreco = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white border-t border-gray-200 flex justify-around items-center h-16 shadow-md">
      {/* Botão Home */}
      <Button
        variant="ghost"
        className="flex flex-col items-center gap-1 text-gray-700 hover:text-blue-600"
        onClick={() => router.push("/")}
      >
        <Home className="h-5 w-5" />
        <span className="text-xs">Início</span>
      </Button>

      {/* Botão Carrinho */}

      <CarrinhoBottom />
    </nav>
  );
}

export default NavBottom;
