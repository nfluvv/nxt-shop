"use client"

import { useState, useTransition } from "react"
import { Bookmark } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/shared/client/lib/utils"
import { setProductSaved } from "../api/set-product-saved"

interface Props {
  productId: string
  isSaved: boolean
  className?: string
}

export function SaveProductButton({ productId, isSaved, className }: Props) {
  const t = useTranslations("saved")
  const [saved, setSaved] = useState(isSaved)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (isPending) return

    const next = !saved
    setSaved(next)
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light")

    startTransition(async () => {
      const res = await setProductSaved({ productId, saved: next })
      if (!res.ok) {
        setSaved(!next)
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("error")
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? t("remove") : t("add")}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-transform active:scale-90",
        className
      )}
    >
      <Bookmark
        className={cn(
          "h-4.5 w-4.5 transition-colors",
          saved ? "fill-primary text-primary" : "text-foreground/70"
        )}
      />
    </button>
  )
}