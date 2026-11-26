import "server-only"

import { prisma } from "@/shared/server/db/prisma"

export const getActiveBanners = () =>
  prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    take: 10,
    select: { id: true, imageUrl: true, title: true, link: true },
  })
