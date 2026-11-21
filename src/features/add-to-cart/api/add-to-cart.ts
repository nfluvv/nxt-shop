"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { prisma } from "@/shared/server/db/prisma"
import { getCurrentUser } from "@/entities/user/api/queries"

const schema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(20).default(1),
})

export type AddToCartResult =
  | { ok: true; quantity: number }
  | { ok: false; error: "unauthorized" | "out_of_stock" }

export async function addToCart(input: unknown): Promise<AddToCartResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: "unauthorized" }

  const { variantId, quantity } = schema.parse(input)

  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, isActive: true, product: { isActive: true } },
    select: { stock: true },
  })
  if (!variant || variant.stock < 1) return { ok: false, error: "out_of_stock" }

  const existing = await prisma.cartItem.findUnique({
    where: { userId_variantId: { userId: user.id, variantId } },
    select: { quantity: true },
  })
  const next = Math.min((existing?.quantity ?? 0) + quantity, variant.stock)

  await prisma.cartItem.upsert({
    where: { userId_variantId: { userId: user.id, variantId } },
    update: { quantity: next },
    create: { userId: user.id, variantId, quantity: next },
  })

  revalidatePath("/cart")
  return { ok: true, quantity: next }
}