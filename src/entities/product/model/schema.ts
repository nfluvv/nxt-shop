import { z } from "zod"

export const productSortSchema = z.enum(["new", "price_asc", "price_desc"])

export const productFiltersSchema = z.object({
  q: z.string().trim().min(1).max(100).optional(),
  category: z.string().optional(),
  collection: z.string().optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  inStock: z.boolean().optional(),
  sort: productSortSchema.default("new"),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export type ProductFilters = z.infer<typeof productFiltersSchema>
