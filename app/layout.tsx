import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CarrinhoProvider } from "@/contexts/carrinho-context";
import { Toaster } from "@/components/ui/toaster";
import SwipeTutorial from "@/components/swipe-tutorial";
import NavBottom from "@/components/nav-bottom";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:
    "Pampa Congelados - Congelados de Qualidade | Salgados e Pratos Prontos",
  description:
    "Loja de congelados com salgados artesanais, tortas e pratos prontos. Qualidade caseira com a praticidade que você precisa. Entrega em Mongaguá e região.",
  keywords:
    "congelados, salgados, tortas, pratos prontos, Mongaguá, delivery, comida caseira",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <CarrinhoProvider>
          {children}
          <Toaster />
          <SwipeTutorial />
          <NavBottom />
        </CarrinhoProvider>
      </body>
    </html>
  );
}
