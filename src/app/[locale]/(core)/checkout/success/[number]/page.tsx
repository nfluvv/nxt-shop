import { notFound } from "next/navigation"
import { CheckoutSuccessView } from "@/views/checkout-success"

export default async function Page({
  params,
}: {
  params: Promise<{ number: string }>
}) {
  const number = Number((await params).number)
  if (!Number.isInteger(number)) notFound()

  return <CheckoutSuccessView number={number} />
}
