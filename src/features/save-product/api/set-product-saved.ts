"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { prisma } from "@/shared/server/db/prisma"
import { getCurrentUser } from "@/entities/user/server"

const schema = z.object({
  productId: z.string().min(1),
  saved: z.boolean(),
})

export type SetProductSavedResult =
  | { ok: true; saved: boolean }
  | { ok: false; error: "unauthorized" | "not_found" }

export async function setProductSaved(
  input: unknown
): Promise<SetProductSavedResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: "unauthorized" }

  const { productId, saved } = schema.parse(input)

  if (saved) {
    const product = await prisma.product.findFirst({
      where: { id: productId, isActive: true },
      select: { id: true },
    })
    if (!product) return { ok: false, error: "not_found" }

    await prisma.savedProduct.upsert({
      where: { userId_productId: { userId: user.id, productId } },
      update: {},
      create: { userId: user.id, productId },
    })
  } else {
    await prisma.savedProduct.deleteMany({
      where: { userId: user.id, productId },
    })
  }

  revalidatePath("/saved")
  return { ok: true, saved }
}
