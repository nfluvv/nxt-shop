export interface ProductCardData {
  id: string
  slug: string
  title: string
  price: number
  oldPrice: number | null
  currency: string
  image: string | null
  inStock: boolean
  isSaved: boolean
}
