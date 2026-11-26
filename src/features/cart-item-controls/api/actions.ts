"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { prisma } from "@/shared/server/db/prisma"
import { getCurrentUser } from "@/entities/user/server"

const updateSchema = z.object({
  cartItemId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
})

const removeSchema = z.object({
  cartItemId: z.string().min(1),
})

export type CartActionResult =
  { ok: true } | { ok: false; error: "unauthorized" | "not_found" }

export async function updateCartQuantity(
  input: unknown
): Promise<CartActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: "unauthorized" }

  const { cartItemId, quantity } = updateSchema.parse(input)

  const item = await prisma.cartItem.findFirst({
    where: { id: cartItemId, userId: user.id },
    select: { quantity: true, variant: { select: { stock: true } } },
  })
  if (!item) return { ok: false, error: "not_found" }

  const next =
    quantity > item.quantity ? Math.min(quantity, item.variant.stock) : quantity

  if (next !== item.quantity && next >= 1) {
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: next },
    })
  }

  revalidatePath("/cart")
  return { ok: true }
}

export async function removeFromCart(
  input: unknown
): Promise<CartActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: "unauthorized" }

  const { cartItemId } = removeSchema.parse(input)

  await prisma.cartItem.deleteMany({
    where: { id: cartItemId, userId: user.id },
  })

  revalidatePath("/cart")
  return { ok: true }
}
