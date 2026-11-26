"use server"

import { productFiltersSchema } from "@/entities/product"
import { getProducts } from "@/entities/product/server"
import { getCurrentUser } from "@/entities/user/server"

export async function loadMoreProducts(input: unknown) {
  const filters = productFiltersSchema.parse(input)
  const user = await getCurrentUser()
  return getProducts(filters, user?.id)
}
