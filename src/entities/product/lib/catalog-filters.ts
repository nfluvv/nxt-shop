import "server-only"

import type { Prisma } from "@prisma/client"
import type { ProductFilters } from "../model/schema"

export function buildWhere(f: ProductFilters): Prisma.ProductWhereInput {
  const variantFilter: Prisma.ProductVariantWhereInput = {
    isActive: true,
    ...(f.sizes?.length && { size: { in: f.sizes } }),
    ...(f.colors?.length && { color: { in: f.colors } }),
    ...(f.inStock && { stock: { gt: 0 } }),
  }
  const hasVariantFilter = f.sizes?.length || f.colors?.length || f.inStock

  return {
    isActive: true,
    ...(f.q && {
      OR: [
        { title: { contains: f.q, mode: "insensitive" } },
        { description: { contains: f.q, mode: "insensitive" } },
      ],
    }),
    ...(f.category && {
      category: {
        OR: [{ slug: f.category }, { parent: { slug: f.category } }],
      },
    }),
    ...(f.collection && {
      collections: {
        some: { collection: { slug: f.collection, isActive: true } },
      },
    }),
    ...((f.minPrice != null || f.maxPrice != null) && {
      price: { gte: f.minPrice, lte: f.maxPrice },
    }),
    ...(hasVariantFilter && { variants: { some: variantFilter } }),
  }
}

export function buildOrderBy(
  sort: ProductFilters["sort"]
): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price_asc":
      return [{ price: "asc" }, { id: "asc" }]
    case "price_desc":
      return [{ price: "desc" }, { id: "asc" }]
    default:
      return [{ createdAt: "desc" }, { id: "asc" }]
  }
}
