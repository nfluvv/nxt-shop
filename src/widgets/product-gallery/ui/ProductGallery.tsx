"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/shared/client/lib/utils"

interface Props {
  images: { id: string; url: string }[]
  title: string
}

export function ProductGallery({ images, title }: Props) {
  const [index, setIndex] = useState(0)

  if (images.length === 0) {
    return <div className="aspect-3/4 rounded-2xl bg-muted" />
  }

  return (
    <div className="relative">
      <div
        onScroll={(e) => {
          const el = e.currentTarget
          setIndex(Math.round(el.scrollLeft / el.clientWidth))
        }}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {images.map((img, i) => (
          <div
            key={img.id}
            className="relative aspect-3/4 w-full shrink-0 snap-center bg-muted"
          >
            <Image
              src={img.url}
              alt={`${title} — ${i + 1}`}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
          {images.map((img, i) => (
            <span
              key={img.id}
              className={cn(
                "h-1.5 rounded-full bg-background/80 transition-all",
                i === index ? "w-4" : "w-1.5 opacity-60"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}