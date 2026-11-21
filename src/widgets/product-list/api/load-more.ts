"use server"

import { productFiltersSchema } from "@/entities/product"
import { getProducts } from "@/entities/product/api/queries"
import { getCurrentUser } from "@/entities/user/api/queries"

export async function loadMoreProducts(input: unknown) {
  const filters = productFiltersSchema.parse(input)
  const user = await getCurrentUser()
  return getProducts(filters, user?.id)
}