import { notFound } from "next/navigation"
import { Container } from "@/shared/client/ui"
import { getProductBySlug, isProductSaved } from "@/entities/product/server"
import { getCurrentUser } from "@/entities/user/server"
import { ProductGallery } from "@/widgets/product-gallery"
import { PurchasePanel } from "@/features/add-to-cart"
import { SaveProductButton } from "@/features/save-product"

export async function ProductView({ slug }: { slug: string }) {
  const [product, user] = await Promise.all([
    getProductBySlug(slug),
    getCurrentUser(),
  ])
  if (!product) notFound()

  const isSaved = user ? await isProductSaved(user.id, product.id) : false

  return (
    <main className="py-2">
      <Container className="flex flex-col gap-4">
        <ProductGallery
          images={product.images.map((i) => ({ id: i.id, url: i.url }))}
          title={product.title}
        />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              {product.category.name}
            </p>
            <h1 className="text-2xl leading-tight font-bold">
              {product.title}
            </h1>
          </div>

          <SaveProductButton
            productId={product.id}
            isSaved={isSaved}
            className="h-10 w-10 shrink-0 rounded-xl bg-muted"
          />
        </div>

        <PurchasePanel
          price={product.price}
          oldPrice={product.oldPrice}
          currency={product.currency}
          variants={product.variants.map((v) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            priceDelta: v.priceDelta,
            stock: v.stock,
          }))}
        />

        {product.description && (
          <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
            {product.description}
          </p>
        )}
      </Container>
    </main>
  )
}
