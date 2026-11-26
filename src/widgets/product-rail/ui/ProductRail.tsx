import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { ProductCard, type ProductCardData } from "@/entities/product"
import { cn } from "@/shared/client/lib/utils"

interface Props {
  title: string
  products: ProductCardData[]
  href?: string
  hrefLabel?: string
  accent?: boolean
}

export function ProductRail({
  title,
  products,
  href,
  hrefLabel,
  accent,
}: Props) {
  if (products.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2
          className={cn(
            "text-xl font-black tracking-tight",
            accent && "text-foreground"
          )}
        >
          {title}
        </h2>

        {href && (
          <Link
            href={href}
            className="flex items-center text-sm text-muted-foreground active:opacity-70"
          >
            {hrefLabel}
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="-mx-4 flex scrollbar-none gap-3 overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden">
        {products.map((p) => (
          <div key={p.id} className="w-40 shrink-0">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  )
}
