"use client";

import { Product } from "@/lib/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";

// Interface para as propriedades do componente
interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
}

// O componente do cartão de produto
export default function ProductCard({ product, onDelete }: ProductCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    toast.loading("Deletando produto...");

    try {
      const response = await fetch(`/api/products/delete/${product.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao deletar produto.");
      }

      toast.dismiss(); // Remove o toast de loading
      toast.success("Produto deletado com sucesso!");
      onDelete(product.id); // Chama a função do pai para atualizar a lista
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Erro inesperado ao deletar produto.");
    } finally {
      setIsDeleting(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <Card className="relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
      {/* Imagem do produto */}
      <div className="w-full h-48 md:h-56 overflow-hidden">
        <img
          src={product.image_url || "/placeholder-image.jpg"}
          alt={product.product_name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Conteúdo do cartão */}
      <CardHeader>
        <CardTitle className="truncate">{product.product_name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {product.description}
        </CardDescription>
        <p className="text-xl font-bold mt-2 text-green-600">
          R$ {product.price.toFixed(2)}
        </p>
      </CardHeader>
      <CardContent className="flex justify-between items-center space-x-2">
        <Link href={`/dashboard/produto/editar/${product.id}`} passHref>
          <Button variant="outline" size="icon" className="hover:bg-yellow-100">
            <Pencil className="h-4 w-4 text-yellow-600" />
          </Button>
        </Link>
        <Link href={`/products/${product.id}`} passHref>
          <Button variant="outline" size="icon" className="hover:bg-blue-100">
            <Eye className="h-4 w-4 text-blue-600" />
          </Button>
        </Link>

        {/* Diálogo de confirmação de exclusão */}
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button
            variant="outline"
            size="icon"
            className="hover:bg-red-100"
            onClick={() => setIsDialogOpen(true)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin text-red-600" />
            ) : (
              <Trash2 className="h-4 w-4 text-red-600" />
            )}
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o
                produto{" "}
                <span className="font-bold">"{product.product_name}"</span> do
                seu catálogo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Excluindo..." : "Continuar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
