"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler } from "react-hook-form";
import { ProductFormValues, productSchema } from "../../../../../../lib/schema";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import {
  Package,
  ShoppingCart,
  Info,
  Snowflake,
  MessageCircle,
  Loader2,
  PackageX,
} from "lucide-react";
import { DashboardAside } from "../../../../../../components/dashboard/DashboardAside";
import { useParams } from "next/navigation";
import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Define a interface para as props da página, incluindo o ID
interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function EditProductPage() {
  const router = useRouter();

  const params = useParams();
  const id = params.id as string; // Obtenha o ID da URL

  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  const [productNotFound, setProductNotFound] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    // Valores padrão vazios até que os dados do produto sejam carregados
    defaultValues: {
      productName: "",
      description: "",
      reviews: { quantityStarsByPerson: 0, quantityReviews: 0 },
      price: 0.0,
      promoPrice: undefined,
      quantityStock: 0,
      ingredients: "",
      preparation: "",
      nutritionalInfo: {
        calories: 0,
        proteins: 0,
        carbohydrates: 0,
        fats: 0,
      },
      details: {
        weight: "",
        validity: "",
        storageTemperature: "",
        yield: "",
      },
      imageFile: undefined,
    },
  });

  // useEffect para carregar os dados do produto quando a página é montada
  useEffect(() => {
    if (!id) {
      setIsLoadingProduct(false); // Se não houver ID, é uma página de criação
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/edit/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setProductNotFound(true); // Se for 404, seta o estado de 'não encontrado'
            return;
          }
          throw new Error("Erro desconhecido ao buscar o produto.");
        }
        const productData = await res.json();
        console.log("Dados do produto recebidos:", productData);

        // Tratamento para campos JSON
        let nutritionalInfo = productData.nutritional_info;
        let details = productData.details;
        let ingredientsString = productData.ingredients;
        let preparationString = productData.preparation;

        try {
          if (typeof nutritionalInfo === "string") {
            nutritionalInfo = JSON.parse(nutritionalInfo);
          }
          if (typeof details === "string") {
            details = JSON.parse(details);
          } // ... (lógica de parsing para ingredients e preparation, que está correta) // NOVO BLOCO: Converter os valores de nutritionalInfo para number
          if (nutritionalInfo) {
            nutritionalInfo.calories =
              parseFloat(nutritionalInfo.calories) || 0;
            nutritionalInfo.proteins =
              parseFloat(nutritionalInfo.proteins) || 0;
            nutritionalInfo.carbohydrates =
              parseFloat(nutritionalInfo.carbohydrates) || 0;
            nutritionalInfo.fats = parseFloat(nutritionalInfo.fats) || 0;
          }
        } catch (parseError) {
          // ... (código de tratamento de erro)
        }

        // Formatar os dados para preencher o formulário
        const formattedData = {
          productName: productData.product_name,
          description: productData.description,
          reviews: {
            quantityStarsByPerson: productData.reviews_stars_by_person,
            quantityReviews: productData.reviews_count,
          },
          price: productData.price,
          promoPrice: productData.promo_price,
          quantityStock: productData.stock_quantity,
          ingredients: ingredientsString,
          preparation: preparationString,
          nutritionalInfo: nutritionalInfo,
          details: details,
          imageFile: undefined,
        };

        form.reset(formattedData); // Preenche o formulário com os dados
        setImagePreviewUrl(productData.image_url); // Define a URL da imagem para pré-visualização
        toast.success("Dados do produto carregados com sucesso!");
      } catch (error: any) {
        toast.error(`Erro ao carregar produto: ${error.message}`);
        console.error("Erro ao buscar produto:", error);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [id, form]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      form.setValue("imageFile", selectedFile);
      setImagePreviewUrl(URL.createObjectURL(selectedFile));
      form.clearErrors("imageFile");
    } else {
      form.setValue("imageFile", undefined);
      setImagePreviewUrl(null);
    }
  };

  // Lógica de submissão unificada para criar e editar
  const onSubmit: SubmitHandler<ProductFormValues> = async (values) => {
    setIsSubmittingForm(true);
    let imageUrl = imagePreviewUrl; // Mantém a imagem atual por padrão

    try {
      // 1. Fazer upload da nova imagem apenas se uma nova for selecionada
      if (values.imageFile) {
        toast.info("Enviando nova imagem...", { duration: 2000 });
        const formData = new FormData();
        formData.append("file", values.imageFile);

        const res = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (!res.ok || !data.imageUrl) {
          throw new Error(data.error || "Falha ao fazer upload da imagem.");
        }
        imageUrl = data.imageUrl;
        toast.success("Nova imagem enviada com sucesso!");
      }

      // 2. Preparar os dados do produto com a URL da imagem (antiga ou nova)
      const productDataForAPI = {
        product_name: values.productName,
        image_url: imageUrl,
        description: values.description,
        reviews_stars_by_person: values.reviews?.quantityStarsByPerson || 0,
        reviews_count: values.reviews?.quantityReviews || 0,
        price: values.price,
        promo_price: values.promoPrice,
        stock_quantity: values.quantityStock,
        ingredients: values.ingredients,
        preparation: values.preparation,
        nutritional_info: JSON.stringify(values.nutritionalInfo),
        details: JSON.stringify(values.details),
      };

      // 3. Enviar os dados do produto para o backend (agora é PATCH)
      toast.info("Editando produto...", { duration: 2000 });
      const productRes = await fetch(`/api/products/edit/${id}`, {
        method: "PATCH", // Método alterado para PATCH
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productDataForAPI),
      });

      if (!productRes.ok) {
        const errorData = await productRes.json();
        throw new Error(errorData.error || "Falha ao editar produto.");
      }

      const result = await productRes.json();
      console.log("Produto editado com sucesso!", result);
      toast.success("Produto editado com sucesso!");
      setEditSuccess(true);
    } catch (error: any) {
      console.error("Erro no processo de edição:", error);
      toast.error(
        `Erro ao editar produto: ${
          error.message || "Ocorreu um erro inesperado."
        }`
      );
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Se estiver carregando, mostre uma tela de loading
  if (isLoadingProduct) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </main>
    );
  }

  // Mostra uma mensagem de erro amigável se o produto não for encontrado
  if (productNotFound) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center text-center p-4">
        <PackageX className="h-24 w-24 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Produto Não Encontrado
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          O produto com o ID especificado não pôde ser encontrado no catálogo.
        </p>
        <Button onClick={() => (window.location.href = "/dashboard")}>
          Voltar para o Dashboard
        </Button>
      </main>
    );
  }

  return (
    <>
      <Dialog open={editSuccess} onOpenChange={setEditSuccess}>
        <DialogTrigger asChild>
          <Button>Fechar</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] flex flex-col items-center justify-center gap-10">
          <DialogHeader>
            <DialogTitle>Produto Editado com Sucesso!</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <Link
              href={`/dashboard`}
              className="bg-blue-600 rounded-xl px-2 py-4 shadow-lg text-white hover:bg-blue-500 transition-colors duration-300 ease-in-out"
            >
              Retornar para a página de Dashboard.
            </Link>
          </DialogDescription>
        </DialogContent>
      </Dialog>
      <main className="container max-[1023px]:mx-auto xl:mx-auto p-4 md:p-8 max-w-3xl mt-12">
        <DashboardAside />
        <div className="w-full flex flex-col lg:ml-[40%] xl:ml-0 xl:items-center">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-700 mb-6">
            Edição de Produto
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Edite os campos para atualizar os dados do produto.
          </p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 bg-white p-6 md:p-8 rounded-lg shadow-lg"
            >
              {/* Informações Básicas */}
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-500" />
                  Informações Gerais
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Produto</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Bolo de Chocolate"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Campo para Upload de Imagem */}
                  <FormField
                    control={form.control}
                    name="imageFile"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Imagem do Produto</FormLabel>
                        <FormControl>
                          <Input
                            {...fieldProps}
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:border-0 file:rounded-md file:py-2 file:px-4 file:mr-4"
                          />
                        </FormControl>
                        <FormMessage />
                        {imagePreviewUrl && (
                          <div className="my-2">
                            <p className="text-sm text-gray-600">
                              Pré-visualização:
                            </p>
                            <img
                              src={imagePreviewUrl}
                              alt="Prévia da Imagem"
                              className="w-32 h-32 object-cover rounded-md shadow-sm mt-2"
                            />
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o produto em detalhes..."
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <Separator />

              {/* Preços e Estoque */}
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-green-500" />
                  Preços e Estoque
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="promoPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Promocional (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Opcional"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantityStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade em Estoque</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <Separator />

              {/* Ingredientes e Modo de Preparo */}
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-purple-500" />
                  Preparo e Composição
                </h2>
                <FormField
                  control={form.control}
                  name="ingredients"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ingredientes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: farinha de trigo; açúcar; ovos"
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-gray-500 mt-1">
                        *Separe cada ingrediente com um ponto e vírgula (`;`).
                      </p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preparation"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Modo de Preparo</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Pré-aqueça o forno; Misture os ingredientes secos"
                          {...field}
                          rows={5}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-gray-500 mt-1">
                        *Separe cada etapa do preparo com um ponto e vírgula
                        (`;`).
                      </p>
                    </FormItem>
                  )}
                />
              </section>

              <Separator />

              {/* Informações Nutricionais */}
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Snowflake className="h-5 w-5 text-yellow-500" />
                  Informações Nutricionais (por porção)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nutritionalInfo.calories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calorias (kcal)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nutritionalInfo.proteins"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proteínas (g)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nutritionalInfo.carbohydrates"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Carboidratos (g)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nutritionalInfo.fats"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gorduras (g)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <Separator />

              {/* Detalhes do Produto */}
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-orange-500" />
                  Detalhes Adicionais
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="details.weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso/Volume</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 500g, 1L" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="details.validity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Validade</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: 12 meses, 30/12/2025"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="details.storageTemperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temperatura de Armazenamento</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: -18°C, Ambiente" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="details.yield"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rendimento</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: 4 porções, 10 fatias"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3 flex items-center justify-center gap-2"
                disabled={isSubmittingForm}
              >
                {isSubmittingForm && (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                )}
                {isSubmittingForm ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Button onClick={() => router.back()} className="w-full">
                Voltar
              </Button>
            </form>
          </Form>
        </div>
      </main>
    </>
  );
}
