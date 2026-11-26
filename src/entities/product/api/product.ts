import "server-only"

import { cache } from "react"
import { prisma } from "@/shared/server/db/prisma"

export const getProductBySlug = cache(async (slug: string) => {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      category: { select: { slug: true, name: true } },
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        where: { isActive: true },
        orderBy: [{ color: "asc" }, { size: "asc" }],
      },
    },
  })
  if (!product) return null
  return { ...product, inStock: product.variants.some((v) => v.stock > 0) }
})

export const isProductSaved = async (userId: string, productId: string) => {
  const row = await prisma.savedProduct.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { userId: true },
  })
  return row !== null
}
