import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Container } from "@/shared/client/ui"
import { AuthGate } from "@/features/telegram-auth"
import { CheckoutForm } from "@/features/checkout"
import { getCurrentUser } from "@/entities/user/server"
import { getUserCart } from "@/entities/cart/server"
import { getDeliveryMethods } from "@/entities/delivery/server"

export async function CheckoutView() {
  const t = await getTranslations("checkout")

  const user = await getCurrentUser()
  if (!user) return <AuthGate />

  const [cart, deliveries] = await Promise.all([
    getUserCart(user.id),
    getDeliveryMethods(),
  ])

  if (cart.items.length === 0 || cart.hasIssues) redirect("/cart")

  return (
    <main className="flex flex-1 flex-col py-2">
      <Container className="flex flex-1 flex-col gap-4">
        <h1 className="text-3xl font-black">{t("title")}</h1>
        <CheckoutForm
          deliveries={deliveries}
          subtotal={cart.subtotal}
          currency={cart.currency}
          // defaults={{ name: user.name ?? "", phone: user.phone ?? "" }}
          defaults={{ name: user.name ?? "", phone: "" }}
        />
      </Container>
    </main>
  )
}
