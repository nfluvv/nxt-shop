"use client"

import { useEffect, useRef } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
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
  const sentinel = useRef<HTMLDivElement>(null)

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["products", filters],
      initialPageParam: undefined as string | undefined,
      queryFn: ({ pageParam }) =>
        loadMoreProducts({ ...filters, cursor: pageParam }),
      getNextPageParam: (last) => last.nextCursor ?? undefined,
      initialData: {
        pages: [{ items: initialItems, nextCursor: initialCursor }],
        pageParams: [undefined],
      },
      staleTime: 60_000,
    })

  const items = data.pages.flatMap((p) => p.items)

  useEffect(() => {
    const node = sentinel.current
    if (!hasNextPage || !node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage()
      },
      { rootMargin: "400px" }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <>
      <div className="grid grid-cols-2 gap-x-3 gap-y-5">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {hasNextPage && <div ref={sentinel} className="h-10" />}
    </>
  )
}
