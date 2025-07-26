// pages/dashboard/fretes.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, PlusCircle, Save, XCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { DashboardAside } from "@/components/dashboard/DashboardAside";

interface Frete {
  id: string;
  cidade: string;
  estado: string;
  valor_entrega: number;
}

export default function FretesDashboard() {
  const { toast } = useToast();
  const [fretes, setFretes] = useState<Frete[]>([]);
  const [formFrete, setFormFrete] = useState<Partial<Frete>>({
    cidade: "",
    estado: "",
    valor_entrega: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Frete>>({});

  const API_URL = "/api/fretes"; // Sua API Route

  const fetchFretes = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Erro ao buscar fretes");
      }
      const data: Frete[] = await response.json();
      setFretes(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível carregar os fretes.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFretes();
  }, []);

  const validateForm = () => {
    const newErrors: Partial<Frete> = {};
    if (!formFrete.cidade?.trim()) {
      newErrors.cidade = "A cidade é obrigatória.";
    }
    if (!formFrete.estado?.trim() || formFrete.estado?.length !== 2) {
      newErrors.estado =
        "O estado é obrigatório e deve ter 2 caracteres (ex: RS).";
    }
    if (
      formFrete.valor_entrega === undefined ||
      isNaN(formFrete.valor_entrega) ||
      formFrete.valor_entrega < 0
    ) {
      newErrors.valor_entrega =
        "O valor de entrega deve ser um número positivo.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let response;
      let method = "POST";
      let successMessage = "Frete adicionado com sucesso!";

      if (isEditing && formFrete.id) {
        method = "PUT";
        successMessage = "Frete atualizado com sucesso!";
        response = await fetch(API_URL, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formFrete),
        });
      } else {
        response = await fetch(API_URL, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formFrete),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao salvar o frete.");
      }

      toast({
        variant: "success",
        title: "Sucesso!",
        description: successMessage,
      });

      setFormFrete({ cidade: "", estado: "", valor_entrega: 0 });
      setIsEditing(false);
      fetchFretes(); // Atualiza a lista
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar o frete.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (frete: Frete) => {
    setFormFrete(frete);
    setIsEditing(true);
    setErrors({}); // Limpa erros ao editar
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este frete?")) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao remover o frete.");
      }
      toast({
        variant: "success",
        title: "Sucesso!",
        description: "Frete removido com sucesso.",
      });
      fetchFretes(); // Atualiza a lista
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Ocorreu um erro ao remover o frete.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormFrete({ cidade: "", estado: "", valor_entrega: 0 });
    setIsEditing(false);
    setErrors({});
  };

  return (
    <main className="container mx-auto p-4 lg:p-8 lg:pl-[280px] mt-10">
      <DashboardAside />
      <h1 className="text-2xl md:text-3xl font-bold text-center my-6 uppercase">
        Gerenciar Fretes por Cidade
      </h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            {isEditing ? (
              <Edit className="h-5 w-5" />
            ) : (
              <PlusCircle className="h-5 w-5" />
            )}
            {isEditing ? "Editar Frete" : "Adicionar Novo Frete"}
          </CardTitle>
          <CardDescription className="text-[12px] sm:text-sm">
            {isEditing
              ? "Edite as informações do frete selecionado."
              : "Adicione uma nova cidade e seu valor de entrega correspondente."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <Label htmlFor="cidade">Cidade *</Label>
              <Input
                id="cidade"
                value={formFrete.cidade || ""}
                onChange={(e) =>
                  setFormFrete({ ...formFrete, cidade: e.target.value })
                }
                placeholder="Ex: Porto Alegre"
                className={errors.cidade ? "border-red-500" : ""}
              />
              {errors.cidade && (
                <p className="text-red-500 text-xs mt-1">{errors.cidade}</p>
              )}
            </div>
            <div>
              <Label htmlFor="estado">Estado (UF) *</Label>
              <Input
                id="estado"
                value={formFrete.estado || ""}
                onChange={(e) =>
                  setFormFrete({
                    ...formFrete,
                    estado: e.target.value.toUpperCase().slice(0, 2),
                  })
                }
                placeholder="Ex: RS"
                maxLength={2}
                className={errors.estado ? "border-red-500" : ""}
              />
              {errors.estado && (
                <p className="text-red-500 text-xs mt-1">{errors.estado}</p>
              )}
            </div>
            <div>
              <Label htmlFor="valor_entrega">Valor de Entrega (R$) *</Label>
              <Input
                id="valor_entrega"
                type="number"
                step="0.01"
                value={
                  formFrete.valor_entrega !== undefined
                    ? formFrete.valor_entrega
                    : ""
                }
                onChange={(e) =>
                  setFormFrete({
                    ...formFrete,
                    valor_entrega: parseFloat(e.target.value),
                  })
                }
                placeholder="Ex: 15.00"
                className={errors.valor_entrega ? "border-red-500" : ""}
              />
              {errors.valor_entrega && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.valor_entrega}
                </p>
              )}
            </div>
            <div className="col-span-full flex gap-2 justify-center sm:justify-end mt-4">
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  <XCircle className="h-4 w-4 mr-2" /> Cancelar
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? (
                  "Salvando..."
                ) : isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Salvar Alterações
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Frete
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">
            Fretes Cadastrados
          </CardTitle>
          <CardDescription className="text-[12px] sm:text-sm">
            Visualize e gerencie os valores de frete por cidade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && fretes.length === 0 ? (
            <div className="text-center text-gray-500">
              Carregando fretes...
            </div>
          ) : fretes.length === 0 ? (
            <div className="text-center text-gray-500">
              Nenhum frete cadastrado ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">
                      Valor de Entrega
                    </TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fretes.map((frete) => (
                    <TableRow key={frete.id}>
                      <TableCell className="font-medium">
                        {frete.cidade}
                      </TableCell>
                      <TableCell>{frete.estado}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(frete.valor_entrega)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(frete)}
                          className="mr-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(frete.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-gray-500">
          * Para frete grátis, defina o valor como 0,00.
        </CardFooter>
      </Card>
    </main>
  );
}
