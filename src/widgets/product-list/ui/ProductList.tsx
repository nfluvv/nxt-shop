"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import {
  ProductCard,
  type ProductCardData,
  type ProductFilters,
} from "@/entities/product"
import { loadMoreProducts } from "../api/load-more"

interface Props {
  initialItems: ProductCardData[]
  initialCursor: string | null
  filters: Omit<ProductFilters, "cursor">
}

export function ProductList({ initialItems, initialCursor, filters }: Props) {
  const [items, setItems] = useState(initialItems)
  const [cursor, setCursor] = useState(initialCursor)
  const [isPending, startTransition] = useTransition()
  const sentinel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cursor || !sentinel.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || isPending) return
        startTransition(async () => {
          const res = await loadMoreProducts({ ...filters, cursor })
          setItems((prev) => [...prev, ...res.items])
          setCursor(res.nextCursor)
        })
      },
      { rootMargin: "400px" }
    )

    observer.observe(sentinel.current)
    return () => observer.disconnect()
  }, [cursor, isPending, filters])

  return (
    <>
      <div className="grid grid-cols-2 gap-x-3 gap-y-5">
        {items.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
          />
        ))}
      </div>
      {cursor && <div ref={sentinel} className="h-10" />}
    </>
  )
}