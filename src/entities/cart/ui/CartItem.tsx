import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { cn } from "@/shared/client/lib/utils"
import { formatPrice } from "@/shared/client/lib/format-price"
import type { UserCart } from "../api/queries"

type CartItemData = UserCart["items"][number]

interface Props {
  item: CartItemData
  actions: React.ReactNode
}

export function CartItem({ item, actions }: Props) {
  const t = useTranslations("cart")
  const unavailable = item.status === "unavailable"

  const variantLabel = [item.color, item.size].filter(Boolean).join(" · ")

  return (
    <li className="flex gap-3">
      <Link
        href={`/product/${item.slug}`}
        className={cn(
          "relative aspect-3/4 w-24 shrink-0 overflow-hidden rounded-xl bg-muted",
          unavailable && "opacity-50"
        )}
      >
        {item.image && (
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="96px"
            className="object-cover"
          />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          href={`/product/${item.slug}`}
          className={cn("line-clamp-2 text-sm leading-tight", unavailable && "text-muted-foreground")}
        >
          {item.title}
        </Link>

        {variantLabel && (
          <p className="mt-0.5 text-xs text-muted-foreground">{variantLabel}</p>
        )}

        {item.status === "limited" && (
          <p className="mt-1 text-xs text-orange-500">
            {t("limited", { count: item.stock })}
          </p>
        )}
        {unavailable && (
          <p className="mt-1 text-xs text-destructive">{t("unavailable")}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <p className={cn("font-semibold", unavailable && "text-muted-foreground line-through")}>
              {formatPrice(item.unitPrice * (unavailable ? item.quantity : item.payableQuantity), item.currency)}
            </p>
            {item.payableQuantity > 1 && (
              <p className="text-xs text-muted-foreground">
                {formatPrice(item.unitPrice, item.currency)} × {item.payableQuantity}
              </p>
            )}
          </div>

          {actions}
        </div>
      </div>
    </li>
  )
}