import "server-only"

import { prisma } from "@/shared/server/db/prisma"

export const getOrderByNumber = (userId: string, number: number) =>
  prisma.order.findFirst({
    where: { userId, number },
    select: {
      number: true,
      status: true,
      total: true,
      currency: true,
      createdAt: true,
      deliveryMethod: { select: { name: true } },
      items: {
        select: {
          id: true,
          title: true,
          size: true,
          color: true,
          price: true,
          quantity: true,
        },
      },
    },
  })
