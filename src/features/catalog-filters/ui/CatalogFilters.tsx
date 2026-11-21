"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
} from "@/shared/client/ui"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/shared/client/lib/utils"

interface Props {
  categories: { id: string; slug: string; name: string }[]
  facets: { sizes: string[]; colors: { name: string; hex: string | null }[] }
}

const SORTS = ["new", "price_asc", "price_desc"] as const

export function CatalogFilters({ categories, facets }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations("catalog")
  const [, startTransition] = useTransition()

  const apply = (mutate: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString())
    mutate(params)
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  const [search, setSearch] = useState(searchParams.get("query") ?? "")

  useEffect(() => {
    const id = setTimeout(() => {
      const value = search.trim()
      if (value === (searchParams.get("query") ?? "")) return

      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set("query", value)
      else params.delete("query")

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      })
    }, 400)

    return () => clearTimeout(id)
  }, [search, searchParams, pathname, router, startTransition])
  
  const activeCategory = searchParams.get("category")

  const [open, setOpen] = useState(false)
  const [sort, setSort] = useState("new")
  const [sizes, setSizes] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [inStock, setInStock] = useState(false)

  const syncDraftFromUrl = () => {
    setSort(searchParams.get("sort") ?? "new")
    setSizes(searchParams.getAll("size"))
    setColors(searchParams.getAll("color"))
    setMinPrice(searchParams.get("minPrice") ?? "")
    setMaxPrice(searchParams.get("maxPrice") ?? "")
    setInStock(searchParams.get("inStock") === "1")
  }

  const handleOpenChange = (next: boolean) => {
    if (next) syncDraftFromUrl()
    setOpen(next)
  }

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  const submit = () => {
    apply((p) => {
      p.delete("sort"); p.delete("size"); p.delete("color")
      p.delete("minPrice"); p.delete("maxPrice"); p.delete("inStock")
      if (sort !== "new") p.set("sort", sort)
      sizes.forEach((s) => p.append("size", s))
      colors.forEach((c) => p.append("color", c))
      if (minPrice) p.set("minPrice", minPrice)
      if (maxPrice) p.set("maxPrice", maxPrice)
      if (inStock) p.set("inStock", "1")
    })
    setOpen(false)
  }

  const reset = () => {
    apply((p) => {
      ;["sort", "size", "color", "minPrice", "maxPrice", "inStock"].forEach((k) =>
        p.delete(k)
      )
    })
    setOpen(false)
  }

  const activeCount =
    searchParams.getAll("size").length +
    searchParams.getAll("color").length +
    (searchParams.get("sort") ? 1 : 0) +
    (searchParams.get("minPrice") || searchParams.get("maxPrice") ? 1 : 0) +
    (searchParams.get("inStock") ? 1 : 0)

  const chip = (active: boolean) =>
    cn(
      "rounded-xl px-3.5 py-1.5 text-sm transition-colors",
      active && "border-primary bg-primary/15 font-medium"
    )

  return (
    <div className="flex flex-col gap-3 pt-2"> 
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-none">
        <button type="button" onClick={() => apply((p) => p.delete("category"))} className={cn(chip(!activeCategory), "shrink-0")}>
          {t("allCategories")}
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => apply((p) => p.set("category", c.slug))}
            className={cn(chip(activeCategory === c.slug), "shrink-0")}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="flex gap-2 pb-1">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-xl pr-10 pl-10 shadow-none"
          />
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSearch("")}
              className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 rounded-lg"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="relative h-10 w-10 rounded-xl border-border/50 bg-muted/30 p-0 shadow-none"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                  {activeCount}
                </span>
              )}
            </Button>
          </DialogTrigger>

          <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-sm overflow-y-auto rounded-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <DialogHeader>
              <DialogTitle>{t("filters.title")}</DialogTitle>
            </DialogHeader>

            <Section title={t("filters.sort")}>
              {SORTS.map((s) => (
                <button key={s} type="button" onClick={() => setSort(s)} className={chip(sort === s)}>
                  {t(`sort.${s}`)}
                </button>
              ))}
            </Section>

            {facets.sizes.length > 0 && (
              <Section title={t("filters.size")}>
                {facets.sizes.map((s) => (
                  <button key={s} type="button" onClick={() => toggle(sizes, setSizes, s)} className={chip(sizes.includes(s))}>
                    {s}
                  </button>
                ))}
              </Section>
            )}

            {facets.colors.length > 0 && (
              <Section title={t("filters.color")}>
                {facets.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => toggle(colors, setColors, c.name)}
                    className={cn(chip(colors.includes(c.name)), "flex items-center gap-2")}
                  >
                    {c.hex && (
                      <span className="h-3.5 w-3.5 rounded-full border" style={{ background: c.hex }} />
                    )}
                    {c.name}
                  </button>
                ))}
              </Section>
            )}

            <Section title={t("filters.price")}>
              <div className="flex w-full gap-2">
                <Input type="number" inputMode="numeric" min={0} placeholder={t("filters.from")} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="h-10 rounded-xl" />
                <Input type="number" inputMode="numeric" min={0} placeholder={t("filters.to")} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="h-10 rounded-xl" />
              </div>
            </Section>

            <button type="button" onClick={() => setInStock((v) => !v)} className={cn(chip(inStock), "self-start")}>
              {t("filters.inStock")}
            </button>

            <div className="mt-2 flex gap-2">
              <Button variant="outline" onClick={reset} className="h-11 flex-1 rounded-xl">
                {t("filters.reset")}
              </Button>
              <Button onClick={submit} className="h-11 flex-1 rounded-xl">
                {t("filters.apply")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}