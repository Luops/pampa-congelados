import { z } from "zod";

// A interface Product será inferida do seu schema Zod,
// mas para o seu componente, precisamos de campos do banco de dados também.
// Adapte este esquema para refletir as colunas da sua tabela 'products'.

export const productSchema = z.object({
  productName: z.string().min(1, "O nome do produto é obrigatório."),
  description: z
    .string()
    .min(1, "A descrição é obrigatória.")
    .max(500, "A descrição deve ter no máximo 500 caracteres."),
  reviews: z
    .object({
      quantityStarsByPerson: z.coerce.number().min(0).max(5).default(0),
      quantityReviews: z.coerce.number().min(0).default(0),
    })
    .optional(),
  price: z.coerce.number().min(0.01, "O preço deve ser maior que zero."),
  promoPrice: z.coerce.number().min(0).optional(),
  quantityStock: z.coerce
    .number()
    .min(0, "A quantidade não pode ser negativa."),
  ingredients: z.string().min(1, "Os ingredientes são obrigatórios."),
  preparation: z.string().min(1, "O modo de preparo é obrigatório."),
  nutritionalInfo: z
    .object({
      calories: z.coerce
        .number()
        .min(0, "Calorias não pode ser negativa.")
        .default(0),
      proteins: z.coerce
        .number()
        .min(0, "Proteínas não pode ser negativa.")
        .default(0),
      carbohydrates: z.coerce
        .number()
        .min(0, "Carboidratos não pode ser negativa.")
        .default(0),
      fats: z.coerce
        .number()
        .min(0, "Gorduras não pode ser negativa.")
        .default(0),
    })
    .optional(),
  details: z
    .object({
      weight: z.string().optional(),
      validity: z.string().optional(),
      storageTemperature: z.string().optional(),
      yield: z.string().optional(),
      cookingTime: z.string().optional(),
    })
    .optional(),
  imageFile: z.any().optional(), // File type is handled separately
});

// Tipos para os campos complexos
export type NutritionalInfo = z.infer<typeof productSchema>;
export type Details = z.infer<typeof productSchema.shape.details>;
export type ProductFormValues = z.infer<typeof productSchema>;

// O tipo 'Product' que será usado nos componentes
// Ele inclui os campos do banco de dados que não estão no formulário
export type Product = {
  id: string; // O ID vem do banco de dados
  product_name: string;
  description: string;
  reviews_stars_by_person: number | null;
  reviews_count: number | null;
  price: number;
  promo_price: number | null;
  stock_quantity: number;
  ingredients: string;
  preparation: string;
  nutritional_info: any; // Use 'any' por enquanto, ou defina um tipo mais específico se necessário
  details: any; // Use 'any' por enquanto
  image_url: string | null;
  created_at: string;
};
