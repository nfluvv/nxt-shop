import "server-only"

import { prisma } from "@/shared/server/db/prisma"

export type CartItemStatus = "ok" | "limited" | "unavailable"

export const getUserCart = async (userId: string) => {
  const rows = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      quantity: true,
      variant: {
        select: {
          id: true,
          size: true,
          color: true,
          stock: true,
          priceDelta: true,
          isActive: true,
          product: {
            select: {
              slug: true,
              title: true,
              price: true,
              currency: true,
              isActive: true,
              images: {
                orderBy: { sortOrder: "asc" },
                take: 1,
                select: { url: true },
              },
            },
          },
        },
      },
    },
  })

  const items = rows.map(({ id, quantity, variant }) => {
    const { product } = variant
    const sellable = variant.isActive && product.isActive
    const payableQuantity = sellable ? Math.min(quantity, variant.stock) : 0
    const unitPrice = product.price + variant.priceDelta

    const status: CartItemStatus =
      payableQuantity === 0
        ? "unavailable"
        : quantity > variant.stock
          ? "limited"
          : "ok"

    return {
      id,
      variantId: variant.id,
      slug: product.slug,
      title: product.title,
      image: product.images[0]?.url ?? null,
      size: variant.size,
      color: variant.color,
      currency: product.currency,
      unitPrice,
      quantity,
      stock: variant.stock,
      payableQuantity,
      lineTotal: unitPrice * payableQuantity,
      status,
    }
  })

  return {
    items,
    subtotal: items.reduce((sum, i) => sum + i.lineTotal, 0),
    currency: items[0]?.currency ?? "RUB",
    totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
    hasIssues: items.some((i) => i.status !== "ok"),
  }
}

export type UserCart = Awaited<ReturnType<typeof getUserCart>>
