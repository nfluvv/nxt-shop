import "server-only"

import { prisma } from "@/shared/server/db/prisma"
import { cardSelect, toCard } from "../lib/card"

export const getSavedProducts = async (userId: string) => {
  const rows = await prisma.savedProduct.findMany({
    where: { userId, product: { isActive: true } },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { product: { select: cardSelect(userId) } },
  })

  return rows.map(({ product }) => toCard(product))
}
