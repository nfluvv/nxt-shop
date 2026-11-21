import { productFiltersSchema, type ProductFilters } from "./schema"

type RawParams = Record<string, string | string[] | undefined>

const toArray = (v: string | string[] | undefined) =>
  v === undefined ? undefined : Array.isArray(v) ? v : [v]

const toMinor = (v: string | string[] | undefined) =>
  typeof v === "string" && v !== "" ? Number(v) * 100 : undefined

export function parseCatalogParams(raw: RawParams): ProductFilters {
  const parsed = productFiltersSchema.safeParse({
    q: typeof raw.query === "string" ? raw.query : undefined,
    category: typeof raw.category === "string" ? raw.category : undefined,
    collection: typeof raw.collection === "string" ? raw.collection : undefined,
    sizes: toArray(raw.size),
    colors: toArray(raw.color),
    minPrice: toMinor(raw.minPrice),
    maxPrice: toMinor(raw.maxPrice),
    inStock: raw.inStock === "1" ? true : undefined,
    sort: raw.sort,
  })
  return parsed.success ? parsed.data : productFiltersSchema.parse({})
}