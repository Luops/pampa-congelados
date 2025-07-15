// lib/schema.ts
import { z } from "zod";

export const productSchema = z
  .object({
    productName: z
      .string()
      .min(3, "Nome do produto deve ter no mínimo 3 caracteres."),
    imageFile:
      typeof window === "undefined"
        ? z.any().optional()
        : z.instanceof(File).optional(),

    description: z
      .string()
      .min(10, "Descrição deve ter no mínimo 10 caracteres."),

    reviews: z
      .object({
        quantityStarsByPerson: z.number().min(0).max(5).default(0),
        quantityReviews: z.number().min(0).default(0),
      })
      .default({ quantityStarsByPerson: 0, quantityReviews: 0 }),

    // PRIMEIRO: Garanta que 'price' seja um número válido ou um fallback seguro.
    price: z.preprocess((val) => {
      // Tenta converter para número, se falhar, retorna NaN para a validação subsequente pegar.
      const num = Number(val);
      return isNaN(num) ? undefined : num; // Retorna undefined para que a próxima validação de 'number' falhe
    }, z.number().min(0.01, "Preço deve ser maior que zero.")),

    promoPrice: z.preprocess(
      (val) => {
        // Lida com string vazia ou undefined/null convertendo para undefined
        if (val === "" || val === null || val === undefined) {
          return undefined;
        }
        const num = Number(val);
        return isNaN(num) ? undefined : num;
      },
      z.number().min(0).optional().nullable() // Opcional e pode ser nulo
    ),

    quantityStock: z.preprocess(
      (val) => Number(val),
      z.number().int().min(0, "Estoque deve ser um número inteiro positivo.")
    ),
    ingredients: z
      .string()
      .min(1, "Ingredientes são obrigatórios.")
      .transform((s) =>
        s
          .split(";")
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
      ),
    preparation: z
      .string()
      .min(1, "Modo de preparo é obrigatório.")
      .transform((s) =>
        s
          .split(";")
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
      ),

    nutritionalInfo: z.object({
      calories: z.preprocess(
        (val) => Number(val),
        z.number().min(0, "Calorias devem ser >= 0.")
      ),
      proteins: z.preprocess(
        (val) => Number(val),
        z.number().min(0, "Proteínas devem ser >= 0.")
      ),
      carbohydrates: z.preprocess(
        (val) => Number(val),
        z.number().min(0, "Carboidratos devem ser >= 0.")
      ),
      fats: z.preprocess(
        (val) => Number(val),
        z.number().min(0, "Gorduras devem ser >= 0.")
      ),
    }),

    details: z.object({
      weight: z.string().min(1, "Peso é obrigatório."),
      validity: z.string().min(1, "Validade é obrigatória."),
      storageTemperature: z
        .string()
        .min(1, "Temperatura de armazenamento é obrigatória."),
      yield: z.string().min(1, "Rendimento é obrigatório."),
    }),
  })
  .superRefine((data, ctx) => {
    // Use superRefine para validações que dependem de múltiplos campos
    // Agora você pode ter certeza que data.price foi preprocessado
    if (
      data.promoPrice !== undefined &&
      data.promoPrice !== null &&
      data.price !== undefined
    ) {
      if (data.promoPrice >= data.price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Preço promocional deve ser menor que o preço normal.",
          path: ["promoPrice"], // Associa o erro ao campo promoPrice
        });
      }
    }
  });

export type ProductFormValues = z.infer<typeof productSchema>;
