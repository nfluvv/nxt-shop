import { getTranslations } from "next-intl/server"
import { Container } from "@/shared/client/ui"
import { parseCatalogParams } from "@/entities/product"
import { getProductFacets, getProducts } from "@/entities/product/server"
import { getCategories } from "@/entities/category/server"
import { CatalogFilters } from "@/features/catalog-filters"
import { ProductList } from "@/widgets/product-list"

type RawParams = Record<string, string | string[] | undefined>

export async function CatalogView({
  searchParams,
}: {
  searchParams: Promise<RawParams>
}) {
  const t = await getTranslations("catalog")
  const filters = parseCatalogParams(await searchParams)

  const [{ items, nextCursor }, categories, facets] = await Promise.all([
    getProducts(filters),
    getCategories(),
    getProductFacets(filters.category),
  ])

  return (
    <main className="py-2">
      <Container className="flex flex-col gap-4">
        <CatalogFilters categories={categories} facets={facets} />

        {items.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          <ProductList
            key={JSON.stringify(filters)}
            initialItems={items}
            initialCursor={nextCursor}
            filters={filters}
          />
        )}
      </Container>
    </main>
  )
}
