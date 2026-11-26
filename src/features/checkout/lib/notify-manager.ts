import "server-only"

import { prisma } from "@/shared/server/db/prisma"
import { formatPrice } from "@/shared/client/lib/format-price"
import {
  escapeHtml,
  sendTelegramMessage,
} from "@/shared/server/telegram/send-message"

interface OrderForMessage {
  id: string
  number: number
  contactName: string
  contactPhone: string
  address: string | null
  comment: string | null
  total: number
  currency: string
  deliveryMethod: { name: string }
  items: {
    title: string
    size: string | null
    color: string | null
    price: number
    quantity: number
  }[]
}

export async function notifyManager(
  order: OrderForMessage,
  username: string | null
) {
  const chatId = process.env.ADMIN_CHAT_ID
  if (!chatId) {
    console.warn("ADMIN_CHAT_ID не задан, уведомление пропущено")
    return
  }

  const lines = order.items.map((i) => {
    const variant = [i.color, i.size].filter(Boolean).join(", ")
    return `• ${escapeHtml(i.title)}${variant ? ` (${escapeHtml(variant)})` : ""} × ${i.quantity} — ${formatPrice(i.price * i.quantity, order.currency)}`
  })

  const text = [
    `🛍 <b>Новый заказ #${order.number}</b>`,
    `Клиент: ${escapeHtml(order.contactName)}${username ? ` (@${escapeHtml(username)})` : ""} | <code>${escapeHtml(order.contactPhone)}</code>`,
    `Доставка: ${escapeHtml(order.deliveryMethod.name)}${order.address ? ` — ${escapeHtml(order.address)}` : ""}`,
    "",
    "Товары:",
    ...lines,
    "",
    `<b>Итого: ${formatPrice(order.total, order.currency)}</b>`,
    ...(order.comment ? ["", `Комментарий: ${escapeHtml(order.comment)}`] : []),
  ].join("\n")

  await sendTelegramMessage(chatId, text)

  await prisma.order.update({
    where: { id: order.id },
    data: { adminNotifiedAt: new Date() },
  })
}
