"use client";

import React, { useState } from "react";
// Import icons directly if not imported already. Link is not from lucide-react.
import { Home, ShoppingCart, CircleUserRound } from "lucide-react";
import Link from "next/link"; // Ensure Link is from next/link for client-side navigation
import { useRouter } from "next/navigation";

import { useCarrinho } from "@/contexts/carrinho-context";
import { Button } from "@/components/ui/button"; // Shadcn Button
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // Shadcn Popover

import CarrinhoBottom from "./carrinho-bottom"; // Assuming this is correct path
import { useAuth } from "@/contexts/AuthContext"; // Assuming this is correct path

function NavBottom() {
  const { user, logout } = useAuth();
  const { state } = useCarrinho();
  const router = useRouter();

  // State for cart icon color (not used in provided snippet, but keeping it)
  const [corCarrinho, setCorCarrinho] = useState("white");

  const formatarPreco = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const handleViewProfile = () => {
    if (user?.id) {
      router.push(`/profile/${user.id}`);
    } else {
      router.push("/login"); // Or handle cases where user is null
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-200 flex justify-around items-center h-16 shadow-md">
      {/* Botão Home */}
      <Button
        variant="ghost"
        className="flex flex-col items-center gap-1 text-gray-700 hover:text-blue-600 focus:text-blue-600"
        onClick={() => router.push("/")}
      >
        <Home className="h-5 w-5" />
        <span className="text-xs">Início</span>
      </Button>

      {/* Botão Perfil / Entrar */}
      {user ? (
        // For logged-in user, show Popover
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost" // Using ghost variant to make it look like an icon button
              className="flex flex-col items-center gap-1 text-gray-700 hover:text-blue-600 focus:text-blue-600 p-0 h-auto ml-8"
            >
              <CircleUserRound className="h-5 w-5" />{" "}
              {/* Mobile size for icon */}
              <span className="text-xs truncate max-w-[60px]">
                {" "}
                {/* Truncate long names, limit width */}
                {user.name.split(" ")[0]}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 mb-2 origin-bottom">
            {" "}
            {/* Added mb-2 for spacing from bottom */}
            <div className="flex flex-col space-y-1">
              <Button
                variant="ghost"
                className="justify-start px-3 py-2 text-sm w-full"
                onClick={handleViewProfile}
              >
                Ver Perfil
              </Button>
              <Button
                variant="ghost"
                className="justify-start px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 w-full"
                onClick={logout}
              >
                Sair
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        // For non-logged-in user, show a simple "Entrar" link
        <Link
          href="/login"
          className="flex flex-col items-center gap-1 text-gray-700 hover:text-blue-600 text-xs ml-8"
        >
          <CircleUserRound className="h-5 w-5" />
          <span>Entrar</span>
        </Link>
      )}

      {/* Botão Carrinho */}
      {/* Assuming CarrinhoBottom handles its own display and logic */}
      <CarrinhoBottom />
    </nav>
  );
}

export default NavBottom;
