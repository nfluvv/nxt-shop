import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { cn } from "@/shared/client/lib/utils"
import { formatPrice } from "@/shared/client/lib/format-price"
import type { ProductCardData } from "../model/types"

interface Props {
  product: ProductCardData
  action?: React.ReactNode
}

export function ProductCard({ product, action }: Props) {
  const t = useTranslations("catalog")
  const discounted = product.oldPrice && product.oldPrice > product.price

  return (
    <div className="relative">
      <Link
        href={`/product/${product.slug}`}
        className="group flex flex-col gap-2 active:opacity-80"
      >
        <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-muted">
          {product.image && (
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className={cn("object-cover", !product.inStock && "opacity-50")}
            />
          )}
          {!product.inStock && (
            <span className="absolute bottom-2 left-2 rounded-full bg-background/90 px-2 py-0.5 text-xs font-medium">
              {t("outOfStock")}
            </span>
          )}
        </div>

        <div className="px-0.5">
          <p className="line-clamp-2 text-sm leading-tight">{product.title}</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="font-semibold">
              {formatPrice(product.price, product.currency)}
            </span>
            {discounted && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.oldPrice!, product.currency)}
              </span>
            )}
          </p>
        </div>
      </Link>

      {action && <div className="absolute top-2 right-2">{action}</div>}
    </div>
  )
}