"use client"

import { useTransition } from "react"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/shared/client/ui"
import { cn } from "@/shared/client/lib/utils"
import { removeFromCart, updateCartQuantity } from "../api/actions"

interface Props {
  cartItemId: string
  quantity: number
  stock: number
}

const haptic = () =>
  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light")

export function CartItemControls({ cartItemId, quantity, stock }: Props) {
  const [isPending, startTransition] = useTransition()

  const change = (next: number) => {
    haptic()
    startTransition(async () => {
      await updateCartQuantity({ cartItemId, quantity: next })
    })
  }

  const remove = () => {
    haptic()
    startTransition(async () => {
      await removeFromCart({ cartItemId })
    })
  }

  return (
    <div className={cn("flex items-center gap-1", isPending && "opacity-60")}>
      <div className="flex items-center rounded-xl border border-border/50">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isPending || quantity <= 1}
          onClick={() => change(quantity - 1)}
          className="h-8 w-8 rounded-l-xl rounded-r-none"
        >
          <Minus className="h-3.5 w-3.5" />
          <span className="sr-only">−</span>
        </Button>

        <span className="min-w-6 text-center text-sm tabular-nums">{quantity}</span>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isPending || quantity >= stock}
          onClick={() => change(quantity + 1)}
          className="h-8 w-8 rounded-l-none rounded-r-xl"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="sr-only">+</span>
        </Button>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={isPending}
        onClick={remove}
        className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Удалить</span>
      </Button>
    </div>
  )
}