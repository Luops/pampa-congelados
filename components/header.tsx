"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Phone, Snowflake } from "lucide-react"
import CarrinhoSidebar from "./carrinho-sidebar"
import MobileMenu from "./mobile-menu"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 bg-blue-600 text-white transition-all duration-300 `}
    >
      <div className="container mx-auto px-4 py-4">
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
              href="#inicio"
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

            {/* Botão de telefone - Apenas Desktop */}
            <Button variant="secondary" className="hidden lg:flex">
              <Phone className="h-4 w-4 mr-2" />
              (13) 99999-9999
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
