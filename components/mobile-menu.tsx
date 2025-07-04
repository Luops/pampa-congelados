"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Phone,
  Home,
  Package,
  Info,
  MessageCircle,
  Snowflake,
  X,
} from "lucide-react";
import { useSwipe } from "@/hooks/use-swipe";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { href: "#inicio", label: "Início", icon: Home },
    { href: "#produtos", label: "Produtos", icon: Package },
    { href: "#sobre", label: "Sobre", icon: Info },
    { href: "#contato", label: "Contato", icon: MessageCircle },
  ];

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handlePhoneCall = () => {
    window.open("tel:+5513999999999", "_self");
    setIsOpen(false);
  };

  // Hook de swipe para fechar o menu arrastando para a esquerda
  const {
    ref: swipeRef,
    isDragging,
    dragOffset,
  } = useSwipe(
    {
      onSwipeLeft: handleClose, // Fechar arrastando para a esquerda
    },
    {
      threshold: 100,
      preventDefaultTouchmoveEvent: true,
    }
  );

  // Calcular transform baseado no drag
  const getTransform = () => {
    if (!isDragging) return isOpen ? "translateX(0)" : "translateX(-100%)";

    // Durante o drag, aplicar o offset mas limitar para não ir além dos limites
    const clampedOffset = Math.min(0, dragOffset);
    return `translateX(${clampedOffset}px)`;
  };

  return (
    <>
      {/* Botão Hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-blue-700"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="!h-8 !w-8" />
        <span className="sr-only">Abrir menu</span>
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
          onClick={handleClose}
          style={{
            opacity: isDragging ? Math.max(0.3, 1 + dragOffset / 320) : 1,
          }}
        />
      )}

      {/* Sidebar do Menu - Lado Esquerdo */}
      <div
        ref={swipeRef}
        className={`fixed top-0 left-0 h-full w-80 bg-white z-50 transition-transform duration-300 ease-in-out ${
          isDragging ? "" : isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          transform: isDragging ? getTransform() : undefined,
        }}
      >
        {/* Indicador de Swipe */}
        <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-1 h-12 bg-gray-300 rounded-r-full opacity-50 md:hidden" />

        {/* Header do Menu */}
        <div className="p-6 bg-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">Pampa Congelados</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-blue-700"
            onClick={handleClose}
          >
            <X className="!h-8 !w-8" />
          </Button>
        </div>

        {/* Conteúdo do Menu */}
        <div className="flex flex-col h-full">
          {/* Dica de Swipe */}
          <div className="px-6 py-2 bg-blue-50 border-b">
            <p className="text-xs text-blue-600 text-center">
              💡 Deslize para a esquerda para fechar
            </p>
          </div>

          {/* Navegação */}
          <nav className="flex-1 p-6">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </a>
                );
              })}
            </div>

            <div className="border-t border-gray-200 my-6"></div>

            {/* Informações de Contato */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Contato
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <div>
                    <p className="font-medium">(13) 99999-9999</p>
                    <p className="text-xs text-gray-500">WhatsApp</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <div>
                    <p className="font-medium">(13) 3333-3333</p>
                    <p className="text-xs text-gray-500">Fixo</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 my-6"></div>

            {/* Horário de Funcionamento */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Horário
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Segunda a Sexta: 8h às 18h</p>
                <p>Sábado: 8h às 14h</p>
                <p className="text-red-500">Domingo: Fechado</p>
              </div>
            </div>
          </nav>

          {/* Botões de Ação */}
          <div className="p-6 border-t bg-gray-50">
            <div className="space-y-3">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handlePhoneCall}
              >
                <Phone className="h-4 w-4 mr-2" />
                Ligar Agora
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  window.open("https://wa.me/5513999999999", "_blank");
                  handleClose();
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
