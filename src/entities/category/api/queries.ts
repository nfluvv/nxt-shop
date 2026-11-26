import "server-only"

import { prisma } from "@/shared/server/db/prisma"

export const getCategories = () =>
  prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    select: { id: true, slug: true, name: true, imageUrl: true },
  })
