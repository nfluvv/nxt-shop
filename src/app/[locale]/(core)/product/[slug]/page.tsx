import type { Metadata } from "next"
import { getProductBySlug } from "@/entities/product/api/queries"
import { ProductView } from "@/views/product"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  return { title: product?.title ?? "Товар" }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  return <ProductView slug={slug} />
}