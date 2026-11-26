"use client"

import { useEffect, useState, useTransition } from "react"
import { useForm, useWatch } from "react-hook-form"
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

interface FiltersValues {
  sort: string
  sizes: string[]
  colors: string[]
  minPrice: string
  maxPrice: string
  inStock: boolean
}

const SORTS = ["new", "price_asc", "price_desc"] as const

const FILTER_KEYS = ["sort", "size", "color", "minPrice", "maxPrice", "inStock"]

const valuesFromUrl = (sp: URLSearchParams): FiltersValues => ({
  sort: sp.get("sort") ?? "new",
  sizes: sp.getAll("size"),
  colors: sp.getAll("color"),
  minPrice: sp.get("minPrice") ?? "",
  maxPrice: sp.get("maxPrice") ?? "",
  inStock: sp.get("inStock") === "1",
})

export function CatalogFilters({ categories, facets }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations("catalog")
  const [, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  const apply = (mutate: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString())
    mutate(params)
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  const searchForm = useForm<{ query: string }>({
    defaultValues: { query: searchParams.get("query") ?? "" },
  })
  const query = useWatch({ control: searchForm.control, name: "query" })

  useEffect(() => {
    const id = setTimeout(() => {
      const value = (query ?? "").trim()
      if (value === (searchParams.get("query") ?? "")) return

      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set("query", value)
      else params.delete("query")

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      })
    }, 400)

    return () => clearTimeout(id)
  }, [query, searchParams, pathname, router, startTransition])

  const activeCategory = searchParams.get("category")

  const filtersForm = useForm<FiltersValues>({
    defaultValues: valuesFromUrl(searchParams),
  })
  const draft = useWatch({ control: filtersForm.control })

  const draftSizes = draft.sizes ?? []
  const draftColors = draft.colors ?? []
  const draftStock = draft.inStock ?? false

  const handleOpenChange = (next: boolean) => {
    if (next) filtersForm.reset(valuesFromUrl(searchParams))
    setOpen(next)
  }

  const toggle = (name: "sizes" | "colors", v: string) => {
    const list = filtersForm.getValues(name)
    filtersForm.setValue(
      name,
      list.includes(v) ? list.filter((x) => x !== v) : [...list, v]
    )
  }

  const clampPrices = (changed: "minPrice" | "maxPrice") => {
    const min = filtersForm.getValues("minPrice")
    const max = filtersForm.getValues("maxPrice")
    if (!min || !max || Number(min) <= Number(max)) return

    if (changed === "minPrice") filtersForm.setValue("minPrice", max)
    else filtersForm.setValue("maxPrice", min)
  }

  const submit = filtersForm.handleSubmit((values) => {
    const { maxPrice } = values
    const minPrice =
      values.minPrice && maxPrice && Number(values.minPrice) > Number(maxPrice)
        ? maxPrice
        : values.minPrice

    apply((p) => {
      FILTER_KEYS.forEach((k) => p.delete(k))
      if (values.sort !== "new") p.set("sort", values.sort)
      values.sizes.forEach((s) => p.append("size", s))
      values.colors.forEach((c) => p.append("color", c))
      if (minPrice) p.set("minPrice", minPrice)
      if (maxPrice) p.set("maxPrice", maxPrice)
      if (values.inStock) p.set("inStock", "1")
    })
    setOpen(false)
  })

  const reset = () => {
    apply((p) => FILTER_KEYS.forEach((k) => p.delete(k)))
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
      active && "bg-primary/15 font-medium"
    )

  return (
    <div className="flex flex-col gap-3 pt-2">
      <div className="-mx-4 flex scrollbar-none gap-2 overflow-x-auto px-4">
        <button
          type="button"
          onClick={() => apply((p) => p.delete("category"))}
          className={cn(chip(!activeCategory), "shrink-0")}
        >
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
            {...searchForm.register("query")}
            className="h-10 rounded-xl pr-10 pl-10 shadow-none"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => searchForm.setValue("query", "")}
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
              className="relative h-10 w-10 rounded-xl bg-muted/30 p-0 shadow-none"
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

            <form onSubmit={submit} className="flex flex-col gap-4">
              <Section title={t("filters.sort")}>
                {SORTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => filtersForm.setValue("sort", s)}
                    className={chip(draft.sort === s)}
                  >
                    {t(`sort.${s}`)}
                  </button>
                ))}
              </Section>

              {facets.sizes.length > 0 && (
                <Section title={t("filters.size")}>
                  {facets.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggle("sizes", s)}
                      className={chip(draftSizes.includes(s))}
                    >
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
                      onClick={() => toggle("colors", c.name)}
                      className={cn(
                        chip(draftColors.includes(c.name)),
                        "flex items-center gap-2"
                      )}
                    >
                      {c.hex && (
                        <span
                          className="h-3.5 w-3.5 rounded-full border"
                          style={{ background: c.hex }}
                        />
                      )}
                      {c.name}
                    </button>
                  ))}
                </Section>
              )}

              <Section title={t("filters.price")}>
                <div className="flex w-full gap-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={draft.maxPrice || undefined}
                    placeholder={t("filters.from")}
                    {...filtersForm.register("minPrice", {
                      onBlur: () => clampPrices("minPrice"),
                    })}
                    className="h-10 rounded-xl"
                  />
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={draft.minPrice || 0}
                    placeholder={t("filters.to")}
                    {...filtersForm.register("maxPrice", {
                      onBlur: () => clampPrices("maxPrice"),
                    })}
                    className="h-10 rounded-xl"
                  />
                </div>
              </Section>

              <button
                type="button"
                onClick={() => filtersForm.setValue("inStock", !draftStock)}
                className={cn(chip(draftStock), "self-start")}
              >
                {t("filters.inStock")}
              </button>

              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={reset}
                  className="h-11 flex-1 rounded-xl"
                >
                  {t("filters.reset")}
                </Button>
                <Button type="submit" className="h-11 flex-1 rounded-xl">
                  {t("filters.apply")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}
