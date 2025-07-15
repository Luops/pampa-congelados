"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CarrinhoSidebar from "./carrinho-sidebar";
import MobileMenu from "./mobile-menu";
import { useAuth } from "../contexts/AuthContext";

import { useRouter } from "next/navigation";

// Icons
import { CircleUserRound } from "lucide-react";

export default function Header() {
  const { user, loading } = useAuth(); // Pegar o usuário
  const { logout } = useAuth(); // Fazer logout

  const router = useRouter();

  const adminRole = Number(process.env.NEXT_PUBLIC_ROLE_ADMIN);

  const [isScrolled, setIsScrolled] = useState(false);

  const handleViewProfile = () => {
    // Implement your navigation logic here
    // e.g., router.push(`/profile/${user?.id}`);
    console.log("Ver Perfil clicked!");
    // For now, let's just go to a generic profile page
    router.push("/profile"); // Assuming you have a /profile route
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 bg-blue-600 text-white transition-all duration-300 `}
    >
      <div className="container mx-auto px-4 py-2">
        <div className="w-full flex items-center justify-center">
          {/* Logo e Menu Mobile - Lado Esquerdo */}
          <div className="w-full flex items-center justify-center gap-3">
            {/* Menu Hambúrguer - Apenas Mobile */}
            <div className="lg:hidden">
              <MobileMenu />
            </div>

            {/* Logo */}
            <div className="w-full flex items-center justify-center space-x-2">
              <h1 className="text-2xl font-bold">Pampa Congelados</h1>
            </div>
          </div>

          {/* Navegação Desktop - Centro */}
          <nav className="hidden lg:flex space-x-6">
            <a
              href="/"
              className="hover:text-blue-200 transition-colors py-2 px-3 rounded-md hover:bg-blue-700/50"
            >
              Início
            </a>
            <a
              href="#produtos"
              className="hover:text-blue-200 transition-colors py-2 px-3 rounded-md hover:bg-blue-700/50"
            >
              Produtos
            </a>
            <a
              href="#sobre"
              className="hover:text-blue-200 transition-colors py-2 px-3 rounded-md hover:bg-blue-700/50"
            >
              Sobre
            </a>
            <a
              href="#contato"
              className="hover:text-blue-200 transition-colors py-2 px-3 rounded-md hover:bg-blue-700/50"
            >
              Contato
            </a>
          </nav>

          {/* Ações do Header - Lado Direito */}
          <div className="flex items-center gap-2">
            {/* Carrinho - Sempre visível */}
            <CarrinhoSidebar />

            {user ? (
              <div className="hidden lg:flex flex-col items-start justify-start border-l-2 ml-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className="self-start ml-4 flex items-center justify-end p-1 h-auto bg-transparent hover:bg-blue-700" // Adjust sizing and padding as needed
                    >
                      <CircleUserRound className="!h-6 !w-6" />
                      <span className="truncate text-lg">
                        {user.name.split(" ")[0]}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2">
                    <div className="flex flex-col space-y-1">
                      <Button
                        variant="ghost"
                        className="justify-start px-3 py-2 text-sm"
                        onClick={handleViewProfile}
                      >
                        Ver Perfil
                      </Button>
                      <Link
                        href="/dashboard"
                        className={`justify-start px-3 py-2 text-sm hover:bg-gray-100 rounded-sm transition-all duration-200 ${
                          user.role === adminRole ? "" : "hidden"
                        }`}
                      >
                        Dashboard
                      </Link>
                      <Button
                        variant="ghost"
                        className="justify-start px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={logout}
                      >
                        Sair
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <Link href="/login" className="hidden lg:flex">
                Entrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
