import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { Button, Container } from "@/shared/client/ui"
import { formatPrice } from "@/shared/client/lib/format-price"
import { AuthGate } from "@/features/telegram-auth"
import { getCurrentUser } from "@/entities/user/api/queries"
import { getUserCart } from "@/entities/cart/api/queries"
import { CartItem } from "@/entities/cart"
import { CartItemControls } from "@/features/cart-item-controls"
import { EmptyCart } from '@/widgets/empty-cart'

export async function CartView() {
  const t = await getTranslations("cart")

  const user = await getCurrentUser()
  if (!user) return <AuthGate />

  const cart = await getUserCart(user.id)

  if (cart.items.length === 0) return <EmptyCart />

  const canCheckout = cart.subtotal > 0

  return (
    <main className="flex flex-1 flex-col py-2">
      <Container className="flex flex-1 flex-col gap-4">
        <h1 className="text-3xl font-bold">{t("title")}</h1>

        {cart.hasIssues && (
          <p className="rounded-xl bg-orange-500/10 px-3.5 py-2.5 text-sm text-orange-600">
            {t("issues")}
          </p>
        )}

        <ul className="flex flex-1 flex-col gap-5">
          {cart.items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              actions={
                <CartItemControls
                  cartItemId={item.id}
                  quantity={item.quantity}
                  stock={item.stock}
                />
              }
            />
          ))}
        </ul>

        <div className="flex flex-col gap-3 border-t border-border/50 pt-3 pb-4">
          <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground">{t("total")}</span>
            <span className="text-xl font-bold">
              {formatPrice(cart.subtotal, cart.currency)}
            </span>
          </div>

          <Button
            asChild={canCheckout}
            disabled={!canCheckout}
            className="h-12 w-full rounded-xl text-base"
          >
            {canCheckout ? <Link href="/checkout">{t("checkout")}</Link> : t("checkout")}
          </Button>
        </div>
      </Container>
    </main>
  )
}