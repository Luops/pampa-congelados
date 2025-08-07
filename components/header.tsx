// src/components/header.tsx
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
import { decryptRole } from "@/utils/crypto";

import { CircleUserRound } from "lucide-react";

export default function Header() {
  const { user, loading, logout } = useAuth();
  
  const router = useRouter();
  const adminRoleNumber = 202507;

  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user && user.role) {
      try {
        const decrypted =
          typeof user.role === "string" ? decryptRole(user.role) : user.role;
        setIsAdmin(decrypted === adminRoleNumber);
      } catch (error) {
        console.error("Erro ao descriptografar a role do usuário:", error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const handleViewProfile = () => {
    console.log("Ver Perfil clicked!");
    router.push("/profile");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 bg-blue-600 text-white transition-all duration-300 `}
    >
      <div className="container mx-auto px-4 py-2">
        <div className="w-full flex items-center justify-between">
          <div className="w-full flex items-center justify-center gap-3">
            <div className="lg:hidden">
              <MobileMenu />
            </div>
            <div className="w-full flex items-center justify-center space-x-2">
              <h1 className="text-xl min-[360px]:text-2xl font-bold text-center">
                Pampa Congelados
              </h1>
            </div>
          </div>
          <nav className="hidden lg:flex space-x-6">
            <Link
              href="/"
              className="hover:text-blue-200 transition-colors py-2 px-3 rounded-md hover:bg-blue-700/50"
            >
              Início
            </Link>
            <Link
              href="#produtos"
              className="hover:text-blue-200 transition-colors py-2 px-3 rounded-md hover:bg-blue-700/50"
            >
              Produtos
            </Link>
            <Link
              href="#sobre"
              className="hover:text-blue-200 transition-colors py-2 px-3 rounded-md hover:bg-blue-700/50"
            >
              Sobre
            </Link>
            <Link
              href="#contato"
              className="hover:text-blue-200 transition-colors py-2 px-3 rounded-md hover:bg-blue-700/50"
            >
              Contato
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <CarrinhoSidebar />
            {loading ? (
              <div className="hidden lg:flex">
                <p className="ml-4">Carregando...</p>
              </div>
            ) : user ? (
              <div className="hidden lg:flex flex-col items-start justify-start border-l-2 ml-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button className="self-start ml-4 flex items-center justify-end p-1 h-auto bg-transparent hover:bg-blue-700">
                      <CircleUserRound className="!h-6 !w-6" />
                      <span className="truncate text-lg">
                        {user.name?.split(" ")[0]}
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
                      {isAdmin && (
                        <Link
                          href="/dashboard"
                          className="justify-start px-3 py-2 text-sm hover:bg-gray-100 rounded-sm transition-all duration-200"
                        >
                          Dashboard
                        </Link>
                      )}
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
