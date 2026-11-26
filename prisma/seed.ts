import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

const rub = (n: number) => n * 100

const COLORS = {
  Чёрный: "#111111",
  Белый: "#f5f5f5",
  Серый: "#9ca3af",
  Синий: "#1e3a8a",
  Бежевый: "#d6c7a1",
  Зелёный: "#3f6212",
} as const
type ColorName = keyof typeof COLORS

const SIZES = {
  apparel: ["XS", "S", "M", "L", "XL"],
  shoes: ["40", "41", "42", "43", "44"],
  onesize: [null],
} as const
type Kind = keyof typeof SIZES

const categories = [
  {
    slug: "clothes",
    name: "Одежда",
    children: [
      { slug: "tshirts", name: "Футболки" },
      { slug: "hoodies", name: "Худи" },
      { slug: "pants", name: "Брюки" },
    ],
  },
  {
    slug: "shoes",
    name: "Обувь",
    children: [{ slug: "sneakers", name: "Кроссовки" }],
  },
  {
    slug: "accessories",
    name: "Аксессуары",
    children: [
      { slug: "bags", name: "Сумки" },
      { slug: "caps", name: "Кепки" },
    ],
  },
]

interface SeedProduct {
  slug: string
  title: string
  description: string
  category: string
  price: number // в рублях
  oldPrice?: number
  kind: Kind
  colors: ColorName[]
  soldOut?: boolean
}

const products: SeedProduct[] = [
  {
    slug: "basic-tee",
    title: "Базовая футболка оверсайз",
    description: "Плотный хлопок 220 г/м², свободный крой.",
    category: "tshirts",
    price: 2490,
    kind: "apparel",
    colors: ["Чёрный", "Белый", "Серый"],
  },
  {
    slug: "graphic-tee",
    title: "Футболка с принтом",
    description: "Хлопок, принт шелкографией.",
    category: "tshirts",
    price: 2990,
    oldPrice: 3990,
    kind: "apparel",
    colors: ["Белый", "Бежевый"],
  },
  {
    slug: "long-sleeve",
    title: "Лонгслив в рубчик",
    description: "Мягкий трикотаж в рубчик.",
    category: "tshirts",
    price: 3290,
    kind: "apparel",
    colors: ["Чёрный", "Синий"],
  },
  {
    slug: "classic-hoodie",
    title: "Худи Classic",
    description: "Футер с начёсом, кенгуру-карман.",
    category: "hoodies",
    price: 5990,
    kind: "apparel",
    colors: ["Чёрный", "Серый", "Зелёный"],
  },
  {
    slug: "zip-hoodie",
    title: "Зип-худи",
    description: "Молния YKK, плотный футер.",
    category: "hoodies",
    price: 6490,
    oldPrice: 7990,
    kind: "apparel",
    colors: ["Серый", "Синий"],
  },
  {
    slug: "cargo-pants",
    title: "Карго-брюки",
    description: "Широкий крой, боковые карманы.",
    category: "pants",
    price: 5490,
    kind: "apparel",
    colors: ["Чёрный", "Бежевый", "Зелёный"],
  },
  {
    slug: "straight-jeans",
    title: "Джинсы прямые",
    description: "Плотный деним, прямой силуэт.",
    category: "pants",
    price: 5990,
    kind: "apparel",
    colors: ["Синий", "Чёрный"],
    soldOut: true,
  },
  {
    slug: "runner-sneakers",
    title: "Кроссовки Runner",
    description: "Лёгкая подошва, сетчатый верх.",
    category: "sneakers",
    price: 8990,
    oldPrice: 10990,
    kind: "shoes",
    colors: ["Белый", "Чёрный"],
  },
  {
    slug: "court-sneakers",
    title: "Кеды Court",
    description: "Кожа, вулканизированная подошва.",
    category: "sneakers",
    price: 7490,
    kind: "shoes",
    colors: ["Белый", "Бежевый"],
  },
  {
    slug: "city-backpack",
    title: "Рюкзак City",
    description: 'Водоотталкивающая ткань, отсек для ноутбука 15".',
    category: "bags",
    price: 4490,
    kind: "onesize",
    colors: ["Чёрный", "Серый"],
  },
  {
    slug: "tote-bag",
    title: "Шоппер из канваса",
    description: "Плотный канвас, внутренний карман.",
    category: "bags",
    price: 1490,
    kind: "onesize",
    colors: ["Бежевый", "Чёрный"],
  },
  {
    slug: "dad-cap",
    title: "Кепка Dad Cap",
    description: "Хлопок, регулируемый ремешок.",
    category: "caps",
    price: 1790,
    oldPrice: 2290,
    kind: "onesize",
    colors: ["Чёрный", "Синий", "Зелёный"],
  },
]

const banners = [
  { title: "Новая коллекция", link: "/?collection=new", seed: "banner-new" },
  { title: "Скидки до 30%", link: "/?collection=sale", seed: "banner-sale" },
  {
    title: "Худи и свитшоты",
    link: "/?category=hoodies",
    seed: "banner-hoodies",
  },
]

const deliveryMethods = [
  {
    code: "pickup",
    name: "Самовывоз",
    price: 0,
    needAddress: false,
    sortOrder: 0,
  },
  {
    code: "courier",
    name: "Курьер",
    price: rub(300),
    needAddress: true,
    sortOrder: 1,
  },
  {
    code: "cdek",
    name: "СДЭК (пункт выдачи)",
    price: rub(250),
    needAddress: true,
    sortOrder: 2,
  },
]

const img = (seed: string, w = 800, h = 1066) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`

async function seedCategories() {
  const ids = new Map<string, string>()

  for (const [i, c] of categories.entries()) {
    const parent = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, sortOrder: i },
      create: { slug: c.slug, name: c.name, sortOrder: i },
    })
    ids.set(c.slug, parent.id)

    for (const [j, ch] of c.children.entries()) {
      const child = await prisma.category.upsert({
        where: { slug: ch.slug },
        update: { name: ch.name, sortOrder: j, parentId: parent.id },
        create: {
          slug: ch.slug,
          name: ch.name,
          sortOrder: j,
          parentId: parent.id,
        },
      })
      ids.set(ch.slug, child.id)
    }
  }
  return ids
}

async function seedProducts(categoryIds: Map<string, string>) {
  const ids = new Map<string, string>()

  for (const [pi, p] of products.entries()) {
    const data = {
      title: p.title,
      description: p.description,
      categoryId: categoryIds.get(p.category)!,
      price: rub(p.price),
      oldPrice: p.oldPrice ? rub(p.oldPrice) : null,
      currency: "RUB",
      isActive: true,
    }

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: { slug: p.slug, ...data },
    })
    ids.set(p.slug, product.id)

    await prisma.productImage.deleteMany({ where: { productId: product.id } })
    await prisma.productVariant.deleteMany({ where: { productId: product.id } })

    await prisma.productImage.createMany({
      data: [0, 1, 2].map((n) => ({
        productId: product.id,
        url: img(`${p.slug}-${n}`),
        sortOrder: n,
      })),
    })

    const variants = p.colors.flatMap((color, ci) =>
      SIZES[p.kind].map((size, si) => ({
        productId: product.id,
        sku: `${p.slug}-${color}-${size ?? "os"}`
          .toLowerCase()
          .replace(/\s+/g, "-"),
        size,
        color,
        colorHex: COLORS[color],
        // псевдослучайные, но стабильные остатки; часть вариантов в нуле
        stock: p.soldOut
          ? 0
          : (pi * 7 + ci * 5 + si * 3) % 9 === 0
            ? 0
            : ((pi + ci + si) % 6) + 1,
      }))
    )
    await prisma.productVariant.createMany({ data: variants })
  }
  return ids
}

async function seedCollections(productIds: Map<string, string>) {
  const defs = [
    {
      slug: "new",
      title: "Новинки",
      sortOrder: 0,
      slugs: products.slice(0, 6).map((p) => p.slug),
    },
    {
      slug: "hits",
      title: "Хиты",
      sortOrder: 1,
      slugs: ["classic-hoodie", "runner-sneakers", "basic-tee", "cargo-pants"],
    },
    {
      slug: "sale",
      title: "Скидки",
      sortOrder: 2,
      slugs: products.filter((p) => p.oldPrice).map((p) => p.slug),
    },
  ]

  for (const d of defs) {
    const collection = await prisma.collection.upsert({
      where: { slug: d.slug },
      update: { title: d.title, sortOrder: d.sortOrder, isActive: true },
      create: { slug: d.slug, title: d.title, sortOrder: d.sortOrder },
    })
    await prisma.collectionProduct.deleteMany({
      where: { collectionId: collection.id },
    })
    await prisma.collectionProduct.createMany({
      data: d.slugs.map((slug, i) => ({
        collectionId: collection.id,
        productId: productIds.get(slug)!,
        sortOrder: i,
      })),
    })
  }
}

async function seedBanners() {
  await prisma.banner.deleteMany()
  await prisma.banner.createMany({
    data: banners.map((b, i) => ({
      title: b.title,
      link: b.link,
      imageUrl: img(b.seed, 1200, 600),
      sortOrder: i,
    })),
  })
}

async function seedDelivery() {
  for (const d of deliveryMethods) {
    await prisma.deliveryMethod.upsert({
      where: { code: d.code },
      update: d,
      create: d,
    })
  }
}

async function main() {
  const categoryIds = await seedCategories()
  const productIds = await seedProducts(categoryIds)
  await seedCollections(productIds)
  await seedBanners()
  await seedDelivery()
  console.log(
    `✔ Seed: ${products.length} товаров, ${categoryIds.size} категорий`
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
