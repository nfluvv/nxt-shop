import Link from "next/link"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { CheckCircle2 } from "lucide-react"
import { Button, Container } from "@/shared/client/ui"
import { formatPrice } from "@/shared/client/lib/format-price"
import { AuthGate } from "@/features/telegram-auth"
import { getCurrentUser } from "@/entities/user/server"
import { getOrderByNumber } from "@/entities/order/server"

export async function CheckoutSuccessView({ number }: { number: number }) {
  const t = await getTranslations("checkout")

  const user = await getCurrentUser()
  if (!user) return <AuthGate />

  const order = await getOrderByNumber(user.id, number)
  if (!order) notFound()

  return (
    <main className="py-2">
      <Container className="flex flex-col items-center gap-5 py-12 text-center">
        <CheckCircle2 className="h-14 w-14 text-primary" />

        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-black">
            {t("successTitle", { number: order.number })}
          </h1>
          <p className="text-sm text-muted-foreground">{t("successText")}</p>
        </div>

        <p className="text-lg font-bold">
          {formatPrice(order.total, order.currency)}
        </p>

        <div className="flex w-full flex-col gap-2">
          <Button asChild className="h-12 rounded-xl">
            <Link href="/orders">{t("toOrders")}</Link>
          </Button>
          <Button asChild variant="ghost" className="h-12 rounded-xl">
            <Link href="/">{t("toHome")}</Link>
          </Button>
        </div>
      </Container>
    </main>
  )
}
