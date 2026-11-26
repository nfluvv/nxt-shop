"use client"

import { useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/shared/client/ui"
import { cn } from "@/shared/client/lib/utils"
import { useTranslations } from "next-intl"
import { formatPrice } from "@/shared/client/lib/format-price"
import { addToCart } from "../api/add-to-cart"
import toast from "react-hot-toast"

interface VariantDTO {
  id: string
  size: string | null
  color: string | null
  colorHex: string | null
  priceDelta: number
  stock: number
}

interface Props {
  price: number
  oldPrice: number | null
  currency: string
  variants: VariantDTO[]
}

interface FormValues {
  color: string | null
  size: string | null
}

const LOW_STOCK = 5

const haptic = (type: "success" | "error") =>
  window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type)

export function PurchasePanel({ price, oldPrice, currency, variants }: Props) {
  const t = useTranslations("product")
  const queryClient = useQueryClient()

  const initial = variants.find((v) => v.stock > 0) ?? variants[0]
  const { control, setValue, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      color: initial?.color ?? null,
      size: initial?.size ?? null,
    },
  })
  const color = useWatch({ control, name: "color" })
  const size = useWatch({ control, name: "size" })

  const addMutation = useMutation({
    mutationFn: (variantId: string) => addToCart({ variantId, quantity: 1 }),
    onSuccess: (res) => {
      if (res.ok) {
        toast.success(t("added"))
        haptic("success")
        queryClient.invalidateQueries({ queryKey: ["cart"] })
      } else {
        toast.error(t(`errors.${res.error}`))
        haptic("error")
      }
    },
    onError: () => haptic("error"),
  })

  const colors = useMemo(
    () =>
      [
        ...new Map(
          variants.filter((v) => v.color).map((v) => [v.color!, v.colorHex])
        ).entries(),
      ].map(([name, hex]) => ({
        name,
        hex,
        available: variants.some((v) => v.color === name && v.stock > 0),
      })),
    [variants]
  )

  const variantsOfColor = variants.filter((v) => v.color === color)
  const hasSizes = variants.some((v) => v.size)

  const selected = variants.find((v) => v.color === color && v.size === size)
  const finalPrice = price + (selected?.priceDelta ?? 0)
  const discounted = oldPrice && oldPrice > price
  const outOfStock = !selected || selected.stock < 1

  const onSubmit = handleSubmit(() => {
    if (!selected || outOfStock) return
    addMutation.mutate(selected.id)
  })

  const pickColor = (next: string) => {
    setValue("color", next)
    const sameSize = variants.find(
      (v) => v.color === next && v.size === size && v.stock > 0
    )
    const firstAvailable = variants.find((v) => v.color === next && v.stock > 0)
    setValue(
      "size",
      (sameSize ?? firstAvailable ?? variants.find((v) => v.color === next))
        ?.size ?? null
    )
  }

  const chip = (active: boolean, disabled = false) =>
    cn(
      "min-w-11 rounded-xl border px-3.5 py-2 text-sm transition-colors",
      active ? "border-primary bg-primary/10 font-medium" : "border-border/50",
      disabled && "text-muted-foreground/50 line-through opacity-60"
    )

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <p className="flex items-baseline gap-3">
        <span className="text-2xl font-bold">
          {formatPrice(finalPrice, currency)}
        </span>
        {discounted && (
          <span className="text-base text-muted-foreground line-through">
            {formatPrice(oldPrice!, currency)}
          </span>
        )}
      </p>

      {colors.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm text-muted-foreground">
            {t("color")}: <span className="text-foreground">{color}</span>
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((c) => (
              <button
                key={c.name}
                type="button"
                aria-label={c.name}
                onClick={() => pickColor(c.name)}
                className={cn(
                  "h-9 w-9 rounded-full border-2 p-0.5 transition-colors",
                  color === c.name ? "border-primary" : "border-transparent",
                  !c.available && "opacity-40"
                )}
              >
                <span
                  className="block h-full w-full rounded-full border border-border/60"
                  style={{ background: c.hex ?? "var(--muted)" }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {hasSizes && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm text-muted-foreground">{t("size")}</h3>
          <div className="flex flex-wrap gap-2">
            {variantsOfColor.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={v.stock < 1}
                onClick={() => setValue("size", v.size)}
                className={chip(size === v.size, v.stock < 1)}
              >
                {v.size}
              </button>
            ))}
          </div>
        </div>
      )}

      <p
        className={cn(
          "text-sm",
          outOfStock
            ? "text-destructive"
            : selected!.stock <= LOW_STOCK
              ? "text-orange-500"
              : "text-muted-foreground"
        )}
      >
        {outOfStock
          ? t("outOfStock")
          : selected!.stock <= LOW_STOCK
            ? t("lowStock", { count: selected!.stock })
            : t("inStock")}
      </p>

      <div className="sticky bottom-0 -mx-4 bg-background/95 px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
        <Button
          type="submit"
          disabled={outOfStock || addMutation.isPending}
          className="h-12 w-full rounded-xl text-base"
        >
          {addMutation.isPending ? t("adding") : t("addToCart")}
        </Button>
      </div>
    </form>
  )
}
