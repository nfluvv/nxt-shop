import Image from "next/image"
import Link from "next/link"

interface Banner {
  id: string
  imageUrl: string
  title: string | null
  link: string | null
}

export function HomeBanners({ banners }: { banners: Banner[] }) {
  if (banners.length === 0) return null

  return (
    <div className="-mx-4 flex snap-x snap-mandatory scrollbar-none gap-3 overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden">
      {banners.map((banner, i) => {
        const content = (
          <>
            <Image
              src={banner.imageUrl}
              alt={banner.title ?? ""}
              fill
              priority={i === 0}
              sizes="90vw"
              className="object-cover"
            />
            {banner.title && (
              <>
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                <p className="absolute right-4 bottom-3 left-4 text-lg leading-tight font-black text-white">
                  {banner.title}
                </p>
              </>
            )}
          </>
        )

        const className =
          "relative aspect-2/1 w-[88%] shrink-0 snap-center overflow-hidden rounded-2xl bg-muted"

        return banner.link ? (
          <Link key={banner.id} href={banner.link} className={className}>
            {content}
          </Link>
        ) : (
          <div key={banner.id} className={className}>
            {content}
          </div>
        )
      })}
    </div>
  )
}
