import "server-only"

import { prisma } from "@/shared/server/db/prisma"

export const getDeliveryMethods = () =>
  prisma.deliveryMethod.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, price: true, needAddress: true },
  })
