"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/shared/server/db/prisma"
import { getCurrentUser } from "@/entities/user/server"
import {
  checkoutSchema,
  type CheckoutError,
  type CheckoutResult,
} from "../model/schema"
import { notifyManager } from "../lib/notify-manager"

class CheckoutAbort extends Error {
  constructor(public code: CheckoutError) {
    super(code)
  }
}

export async function createOrder(input: unknown): Promise<CheckoutResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: "unauthorized" }

  const parsed = checkoutSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "validation" }
  const data = parsed.data

  try {
    const order = await prisma.$transaction(async (tx) => {
      const delivery = await tx.deliveryMethod.findFirst({
        where: { id: data.deliveryMethodId, isActive: true },
      })
      if (!delivery) throw new CheckoutAbort("invalid_delivery")

      const address = data.address?.trim() || null
      if (delivery.needAddress && !address) {
        throw new CheckoutAbort("address_required")
      }

      const cart = await tx.cartItem.findMany({
        where: { userId: user.id },
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
      if (cart.length === 0) throw new CheckoutAbort("empty_cart")

      const lines = cart.map(({ quantity, variant: v }) => ({
        variantId: v.id,
        title: v.product.title,
        size: v.size,
        color: v.color,
        imageUrl: v.product.images[0]?.url ?? null,
        price: v.product.price + v.priceDelta, // снимок цены
        currency: v.product.currency,
        quantity,
        stock: v.stock,
        sellable: v.isActive && v.product.isActive,
      }))

      if (lines.some((l) => !l.sellable || l.quantity > l.stock)) {
        throw new CheckoutAbort("items_changed")
      }

      const removed = await tx.cartItem.deleteMany({
        where: { userId: user.id, id: { in: cart.map((c) => c.id) } },
      })
      if (removed.count !== cart.length) throw new CheckoutAbort("empty_cart")

      for (const l of lines) {
        const res = await tx.productVariant.updateMany({
          where: {
            id: l.variantId,
            isActive: true,
            stock: { gte: l.quantity },
          },
          data: { stock: { decrement: l.quantity } },
        })
        if (res.count !== 1) throw new CheckoutAbort("items_changed")
      }

      const itemsTotal = lines.reduce((s, l) => s + l.price * l.quantity, 0)

      const created = await tx.order.create({
        data: {
          userId: user.id,
          contactName: data.name,
          contactPhone: data.phone,
          deliveryMethodId: delivery.id,
          deliveryPrice: delivery.price,
          address,
          comment: data.comment || null,
          itemsTotal,
          total: itemsTotal + delivery.price,
          currency: lines[0].currency,
          items: {
            create: lines.map((l) => ({
              variantId: l.variantId,
              title: l.title,
              size: l.size,
              color: l.color,
              imageUrl: l.imageUrl,
              price: l.price,
              quantity: l.quantity,
            })),
          },
        },
        select: {
          id: true,
          number: true,
          contactName: true,
          contactPhone: true,
          address: true,
          comment: true,
          total: true,
          currency: true,
          deliveryMethod: { select: { name: true } },
          items: {
            select: {
              title: true,
              size: true,
              color: true,
              price: true,
              quantity: true,
            },
          },
        },
      })

      await tx.user.update({
        where: { id: user.id },
        data: { phone: data.phone },
      })

      return created
    })

    await notifyManager(order, user.username).catch((e) =>
      console.error(`[order #${order.number}] manager notify failed`, e)
    )

    revalidatePath("/cart")
    return { ok: true, number: order.number }
  } catch (e) {
    if (e instanceof CheckoutAbort) return { ok: false, error: e.code }
    throw e
  }
}
