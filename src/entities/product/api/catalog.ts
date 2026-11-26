import "server-only"

import { prisma } from "@/shared/server/db/prisma"
import type { ProductFilters } from "../model/schema"
import { findCards } from "../lib/card"
import { buildOrderBy, buildWhere } from "../lib/catalog-filters"

export async function getProducts(filters: ProductFilters, userId?: string) {
  const rows = await findCards({
    where: buildWhere(filters),
    orderBy: buildOrderBy(filters.sort),
    take: filters.limit + 1,
    cursor: filters.cursor,
    userId,
  })

  const hasMore = rows.length > filters.limit
  const items = hasMore ? rows.slice(0, -1) : rows

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  }
}

export async function getProductFacets(category?: string) {
  const variants = await prisma.productVariant.findMany({
    where: {
      isActive: true,
      product: {
        isActive: true,
        ...(category && {
          category: {
            OR: [{ slug: category }, { parent: { slug: category } }],
          },
        }),
      },
    },
    select: { size: true, color: true, colorHex: true },
    distinct: ["size", "color"],
  })

  const sizes = [
    ...new Set(variants.map((v) => v.size).filter(Boolean)),
  ] as string[]
  const colors = [
    ...new Map(
      variants
        .filter((v) => v.color)
        .map((v) => [v.color!, { name: v.color!, hex: v.colorHex }])
    ).values(),
  ]
  return { sizes, colors }
}
