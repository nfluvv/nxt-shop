import "server-only"

import { prisma } from "@/shared/server/db/prisma"

interface Options {
  byUserId?: string
}

export async function cancelOrder(orderId: string, { byUserId }: Options = {}) {
  return prisma.$transaction(async (tx) => {
    const res = await tx.order.updateMany({
      where: {
        id: orderId,
        ...(byUserId && { userId: byUserId }),
        status: { in: byUserId ? ["NEW"] : ["NEW", "CONFIRMED"] },
      },
      data: { status: "CANCELLED" },
    })
    if (res.count !== 1) return { ok: false as const }

    const items = await tx.orderItem.findMany({
      where: { orderId, variantId: { not: null } },
      select: { variantId: true, quantity: true },
    })
    for (const i of items) {
      await tx.productVariant.update({
        where: { id: i.variantId! },
        data: { stock: { increment: i.quantity } },
      })
    }

    return { ok: true as const }
  })
}
