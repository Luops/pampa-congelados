"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ProductFormValues, productSchema } from "../../../../../lib/schema"; // Verifique seu caminho real!
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
import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { DashboardAside } from "../../../../../components/dashboard/DashboardAside";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList, // Adicionado para o Combobox
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Package,
  ShoppingCart,
  Info,
  Snowflake,
  MessageCircle,
  Loader2,
  Check, // Adicionado para o Combobox
  ChevronsUpDown, // Adicionado para o Combobox
} from "lucide-react";

import { cn } from "@/lib/utils"; // Certifique-se de que este caminho está correto para sua utilidade cn

// Define a interface para as categorias
interface Category {
  id: string; // Ou number, dependendo do seu backend
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();

  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  // New states for categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [openCategoryCombobox, setOpenCategoryCombobox] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState(""); // State for new category input

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: "",
      description: "",
      category: "",
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
        cookingTime: "",
      },
    },
  });

  // Fetch categories on component mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoadingCategories(true);
        const res = await fetch("/api/categories"); // Sua rota para buscar categorias
        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data: Category[] = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Erro ao carregar categorias.");
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []); // Empty dependency array means this runs once on mount

  // Function to handle image file change
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

  // Function to handle creating a new category
  const handleCreateNewCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("O nome da nova categoria não pode ser vazio.");
      return;
    }

    setIsSubmittingForm(true); // Disable form submission while adding category
    try {
      toast.info(`Criando nova categoria: "${newCategoryName}"...`, {
        duration: 3000,
      });
      const res = await fetch("/api/categories/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Falha ao criar nova categoria.");
      }

      const newCategory: Category = data.category; // Assuming your API returns the created category
      setCategories((prev) => [...prev, newCategory]);
      form.setValue("category", newCategory.name); // Set the new category in the form
      toast.success(`Categoria "${newCategory.name}" criada e selecionada!`);
      setNewCategoryName(""); // Clear the new category input
      setOpenCategoryCombobox(false); // Close the combobox
    } catch (error: any) {
      console.error("Error creating new category:", error);
      toast.error(
        `Erro ao criar categoria: ${
          error.message || "Ocorreu um erro inesperado."
        }`
      );
    } finally {
      setIsSubmittingForm(false); // Re-enable form submission
    }
  };

  const onSubmit: SubmitHandler<ProductFormValues> = async (values) => {
    setIsSubmittingForm(true); // Ativa o loading
    let imageUrl = "";

    try {
      // 1. Validar e fazer upload da imagem, se houver
      if (values.imageFile) {
        toast.info("Enviando imagem...", { duration: 2000 });
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
        toast.success("Imagem enviada com sucesso!");
      } else {
        toast.error("É necessário selecionar uma imagem para o produto.");
        setIsSubmittingForm(false);
        return;
      }

      // 2. Prepare product data with image URL and category
      const productDataForAPI = {
        product_name: values.productName,
        image_url: imageUrl,
        description: values.description,
        category: values.category, // Use the category from the form state
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

      // 3. Enviar os dados do produto para o backend
      toast.info("Cadastrando produto...", { duration: 2000 });
      const productRes = await fetch("/api/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productDataForAPI),
      });

      if (!productRes.ok) {
        const errorData = await productRes.json();
        throw new Error(errorData.error || "Falha ao cadastrar produto.");
      }

      const result = await productRes.json();
      console.log("Produto cadastrado com sucesso!", result);
      toast.success("Produto cadastrado com sucesso!");

      setCreateSuccess(true);

      // Limpar o formulário e pré-visualização da imagem
      form.reset();
      setImagePreviewUrl(null);
    } catch (error: any) {
      console.error("Erro no processo de cadastro:", error);
      toast.error(
        `Erro ao cadastrar produto: ${
          error.message || "Ocorreu um erro inesperado."
        }`
      );
    } finally {
      setIsSubmittingForm(false); // Desativa o loading
    }
  };

  return (
    <>
      <Dialog open={createSuccess} onOpenChange={setCreateSuccess}>
        <DialogTrigger asChild>
          <Button>Fechar</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] flex flex-col items-center justify-center gap-10">
          <DialogHeader>
            <DialogTitle>Produto Criado com Sucesso!</DialogTitle>
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
      <main className="container max-[1023px]:mx-auto xl:mx-auto pb-16 py-6 px-4 md:p-8 max-w-3xl mt-12">
        <DashboardAside />
        <div className="w-full flex flex-col lg:ml-[40%] xl:ml-0 xl:items-center">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
            Cadastro de Produto
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Preencha os campos abaixo para adicionar um novo produto ao
            catálogo.
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
                {/* Campo de Categoria com Combobox */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="flex flex-col mt-4">
                      <FormLabel>Categoria</FormLabel>
                      <Popover
                        open={openCategoryCombobox}
                        onOpenChange={setOpenCategoryCombobox}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-[200px] justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={loadingCategories || isSubmittingForm}
                            >
                              {field.value
                                ? categories.find(
                                    (category) => category.name === field.value
                                  )?.name
                                : loadingCategories
                                ? "Carregando categorias..."
                                : "Selecione a categoria"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput
                              placeholder="Buscar categoria ou adicionar nova..."
                              value={newCategoryName} // Bind to new state for new category input
                              onValueChange={(currentValue) =>
                                setNewCategoryName(currentValue)
                              } // Update new category name
                            />
                            <CommandList>
                              <CommandEmpty>
                                <div className="text-center p-2">
                                  Nenhuma categoria encontrada.
                                </div>
                              </CommandEmpty>
                              <CommandGroup>
                                {categories.map((category) => (
                                  <CommandItem
                                    value={category.name}
                                    key={category.id}
                                    onSelect={() => {
                                      form.setValue("category", category.name);
                                      setOpenCategoryCombobox(false);
                                      setNewCategoryName(""); // Clear new category input when selecting existing
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        category.name === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {category.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                              {newCategoryName.trim() &&
                                !categories.some(
                                  (cat) =>
                                    cat.name.toLowerCase() ===
                                    newCategoryName.trim().toLowerCase()
                                ) && (
                                  <CommandGroup heading="Adicionar nova">
                                    <CommandItem
                                      onSelect={handleCreateNewCategory}
                                      className="text-blue-600 cursor-pointer flex items-center"
                                    >
                                      <span className="mr-2">+</span> Adicionar
                                      "{newCategoryName}"
                                      {isSubmittingForm && (
                                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                      )}
                                    </CommandItem>
                                  </CommandGroup>
                                )}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            } // Ensure number type
                          />
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
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined
                              )
                            } // Allow undefined
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
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value, 10))
                            } // Ensure integer type
                          />
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
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
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
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
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
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
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
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
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
                  <FormField
                    control={form.control}
                    name="details.cookingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preparo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Em até 10min." {...field} />
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
                {isSubmittingForm ? "Cadastrando..." : "Cadastrar Produto"}
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
