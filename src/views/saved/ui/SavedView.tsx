import { getTranslations } from "next-intl/server"
import { Container } from "@/shared/client/ui"
import { AuthGate } from "@/features/telegram-auth"
import { ProductCard } from "@/entities/product"
import { getSavedProducts } from "@/entities/product/server"
import { getCurrentUser } from "@/entities/user/server"
import { EmptySaved } from "@/widgets/empty-saved"

export async function SavedView() {
  const t = await getTranslations("saved")

  const user = await getCurrentUser()
  if (!user) return <AuthGate />

  const products = await getSavedProducts(user.id)

  if (products.length === 0) return <EmptySaved />

  return (
    <main className="py-2">
      <Container className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">{t("title")}</h1>

        <div className="grid grid-cols-2 gap-x-3 gap-y-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Container>
    </main>
  )
}
