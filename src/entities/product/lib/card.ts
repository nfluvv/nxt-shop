import "server-only"

import type { Prisma } from "@prisma/client"
import { prisma } from "@/shared/server/db/prisma"
import type { ProductCardData } from "../model/types"

export const cardSelect = (userId?: string) =>
  ({
    id: true,
    slug: true,
    title: true,
    price: true,
    oldPrice: true,
    currency: true,
    images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
    variants: { where: { isActive: true }, select: { stock: true } },
    savedBy: { where: { userId: userId ?? "" }, select: { userId: true } },
  }) satisfies Prisma.ProductSelect

export type CardRow = Prisma.ProductGetPayload<{
  select: ReturnType<typeof cardSelect>
}>

export function toCard({
  images,
  variants,
  savedBy,
  ...p
}: CardRow): ProductCardData {
  return {
    ...p,
    image: images[0]?.url ?? null,
    inStock: variants.some((v) => v.stock > 0),
    isSaved: savedBy.length > 0,
  }
}

interface FindCardsArgs {
  where: Prisma.ProductWhereInput
  orderBy: Prisma.ProductOrderByWithRelationInput[]
  take: number
  cursor?: string
  userId?: string
}

export async function findCards({
  where,
  orderBy,
  take,
  cursor,
  userId,
}: FindCardsArgs): Promise<ProductCardData[]> {
  const rows = await prisma.product.findMany({
    where,
    orderBy,
    take,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    select: cardSelect(userId),
  })
  return rows.map(toCard)
}
