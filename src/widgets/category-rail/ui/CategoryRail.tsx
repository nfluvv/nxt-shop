import Image from "next/image"
import Link from "next/link"

interface Category {
  id: string
  slug: string
  name: string
  imageUrl: string | null
}

export function CategoryRail({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null

  return (
    <div className="-mx-4 flex scrollbar-none gap-4 overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden">
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/catalog?category=${c.slug}`}
          className="flex w-16 shrink-0 flex-col items-center gap-1.5 active:opacity-70"
        >
          <span className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-muted text-xl font-black text-muted-foreground">
            {c.imageUrl ? (
              <Image
                src={c.imageUrl}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              c.name.charAt(0)
            )}
          </span>
          <span className="w-full truncate text-center text-xs">{c.name}</span>
        </Link>
      ))}
    </div>
  )
}
