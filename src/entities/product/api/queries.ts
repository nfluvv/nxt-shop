import "server-only";
import type { Prisma } from "@prisma/client"
import { prisma } from "@/shared/server/db/prisma"
import type { ProductFilters } from "../model/schema"
import type { ProductCardData } from "../model/types"

function buildWhere(f: ProductFilters): Prisma.ProductWhereInput {
  const variantFilter: Prisma.ProductVariantWhereInput = {
    isActive: true,
    ...(f.sizes?.length && { size: { in: f.sizes } }),
    ...(f.colors?.length && { color: { in: f.colors } }),
    ...(f.inStock && { stock: { gt: 0 } }),
  };
  const hasVariantFilter = f.sizes?.length || f.colors?.length || f.inStock;

  return {
    isActive: true,
    ...(f.q && {
      OR: [
        { title: { contains: f.q, mode: "insensitive" } },
        { description: { contains: f.q, mode: "insensitive" } },
      ],
    }),
    ...(f.category && {
      category: { OR: [{ slug: f.category }, { parent: { slug: f.category } }] },
    }),
    ...(f.collection && {
      collections: { some: { collection: { slug: f.collection, isActive: true } } },
    }),
    ...((f.minPrice != null || f.maxPrice != null) && {
      price: { gte: f.minPrice, lte: f.maxPrice },
    }),
    ...(hasVariantFilter && { variants: { some: variantFilter } }),
  };
}

function buildOrderBy(sort: ProductFilters["sort"]): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price_asc":
      return [{ price: "asc" }, { id: "asc" }];
    case "price_desc":
      return [{ price: "desc" }, { id: "asc" }];
    default:
      return [{ createdAt: "desc" }, { id: "asc" }];
  }
}

const cardSelect = (userId?: string) =>
  ({
    id: true,
    slug: true,
    title: true,
    price: true,
    oldPrice: true,
    currency: true,
    images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
    variants: { where: { isActive: true }, select: { stock: true } },
    savedBy: { where: { userId: userId ?? "" }, select: { userId: true } },
  }) satisfies Prisma.ProductSelect

type CardRow = Prisma.ProductGetPayload<{ select: ReturnType<typeof cardSelect> }>

function toCard({ images, variants, savedBy, ...p }: CardRow): ProductCardData {
  return {
    ...p,
    image: images[0]?.url ?? null,
    inStock: variants.some((v) => v.stock > 0),
    isSaved: savedBy.length > 0,
  }
}

export async function getProducts(filters: ProductFilters, userId?: string) {
  const rows = await prisma.product.findMany({
    where: buildWhere(filters),
    orderBy: buildOrderBy(filters.sort),
    take: filters.limit + 1,
    ...(filters.cursor && { cursor: { id: filters.cursor }, skip: 1 }),
    select: cardSelect(userId),
  })

  const hasMore = rows.length > filters.limit
  const page = hasMore ? rows.slice(0, -1) : rows

  return {
    items: page.map(toCard),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  }
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      category: { select: { slug: true, name: true } },
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        where: { isActive: true },
        orderBy: [{ color: "asc" }, { size: "asc" }],
      },
    },
  });
  if (!product) return null
  return { ...product, inStock: product.variants.some((v) => v.stock > 0) }
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    select: { id: true, slug: true, name: true },
  })
}

export async function getProductFacets(category?: string) {
  const variants = await prisma.productVariant.findMany({
    where: {
      isActive: true,
      product: {
        isActive: true,
        ...(category && {
          category: { OR: [{ slug: category }, { parent: { slug: category } }] },
        }),
      },
    },
    select: { size: true, color: true, colorHex: true },
    distinct: ["size", "color"],
  });

  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[];
  const colors = [
    ...new Map(
      variants.filter((v) => v.color).map((v) => [v.color!, { name: v.color!, hex: v.colorHex }]),
    ).values(),
  ];
  return { sizes, colors };
}

export const isProductSaved = async (userId: string, productId: string) => {
  const row = await prisma.savedProduct.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { userId: true },
  })
  return row !== null
}

export const getSavedProducts = async (userId: string) => {
  const rows = await prisma.savedProduct.findMany({
    where: { userId, product: { isActive: true } },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { product: { select: cardSelect(userId) } },
  })

  return rows.map(({ product }) => toCard(product))
}