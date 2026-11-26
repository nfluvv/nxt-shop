import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { Search } from "lucide-react"
import { Container } from "@/shared/client/ui"
import { AuthGate } from "@/features/telegram-auth"
import { productFiltersSchema } from "@/entities/product"
import {
  getDiscountedProducts,
  getNewProducts,
  getPopularProducts,
  getProducts,
} from "@/entities/product/server"
import { getCategories } from "@/entities/category/server"
import { getActiveBanners } from "@/entities/banner/server"
import { getCurrentUser } from "@/entities/user/server"
import { HomeBanners } from "@/widgets/home-banners"
import { CategoryRail } from "@/widgets/category-rail"
import { ProductRail } from "@/widgets/product-rail"
import { ProductList } from "@/widgets/product-list"

export async function MainView() {
  const t = await getTranslations("main")

  const user = await getCurrentUser()
  if (!user) return <AuthGate />

  const feedFilters = productFiltersSchema.parse({})

  const [banners, categories, newItems, sale, popular, feed] =
    await Promise.all([
      getActiveBanners(),
      getCategories(),
      getNewProducts(),
      getDiscountedProducts(),
      getPopularProducts(),
      getProducts(feedFilters, user.id),
    ])

  return (
    <main className="py-2">
      <Container className="flex flex-col gap-7">
        <Link
          href="/catalog"
          className="flex h-10 items-center gap-2.5 rounded-xl border border-border/50 bg-muted/30 px-3.5 text-sm text-muted-foreground/70 active:bg-muted/60"
        >
          <Search className="h-4 w-4" />
          {t("search")}
        </Link>

        <HomeBanners banners={banners} />
        <CategoryRail categories={categories} />

        <ProductRail
          title={t("new")}
          products={newItems}
          href="/catalog?sort=new"
          hrefLabel={t("all")}
        />
        <ProductRail
          title={t("sale")}
          products={sale}
          href="/catalog?collection=sale"
          hrefLabel={t("all")}
        />
        <ProductRail
          title={t("popular")}
          products={popular}
          href="/catalog"
          hrefLabel={t("all")}
        />

        {feed.items.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-black tracking-tight">{t("forYou")}</h2>
            <ProductList
              initialItems={feed.items}
              initialCursor={feed.nextCursor}
              filters={feedFilters}
            />
          </section>
        )}
      </Container>
    </main>
  )
}
