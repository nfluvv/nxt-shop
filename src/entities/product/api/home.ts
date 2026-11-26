import "server-only"

import type { Prisma } from "@prisma/client"
import { prisma } from "@/shared/server/db/prisma"
import { findCards } from "../lib/card"

interface Options {
  limit?: number
  userId?: string
}

const DEFAULT_LIMIT = 10

const sellable = {
  isActive: true,
  variants: { some: { isActive: true, stock: { gt: 0 } } },
} satisfies Prisma.ProductWhereInput

export const getNewProducts = ({
  limit = DEFAULT_LIMIT,
  userId,
}: Options = {}) =>
  findCards({
    where: sellable,
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    take: limit,
    userId,
  })

export const getDiscountedProducts = ({
  limit = DEFAULT_LIMIT,
  userId,
}: Options = {}) =>
  findCards({
    where: {
      ...sellable,
      oldPrice: { not: null },
      price: { lt: prisma.product.fields.oldPrice },
    },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    take: limit,
    userId,
  })

export const getPopularProducts = ({
  limit = DEFAULT_LIMIT,
  userId,
}: Options = {}) =>
  findCards({
    where: sellable,
    orderBy: [
      { savedBy: { _count: "desc" } },
      { createdAt: "desc" },
      { id: "asc" },
    ],
    take: limit,
    userId,
  })
