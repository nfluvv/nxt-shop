import { z } from "zod"
import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js"

const DEFAULT_COUNTRY = "RU" as const

export const checkoutSchema = z.object({
  name: z.string().trim().min(2, "name_min").max(100, "name_max"),
  phone: z
    .string()
    .trim()
    .min(1, "phone_required")
    .refine((v) => isValidPhoneNumber(v, DEFAULT_COUNTRY), "phone_invalid")
    .transform(
      (v) => parsePhoneNumberFromString(v, DEFAULT_COUNTRY)?.number ?? v
    ),
  deliveryMethodId: z.string().min(1, "delivery_required"),
  address: z.string().trim().max(300, "address_max").optional(),
  comment: z.string().trim().max(500, "comment_max").optional(),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>

export type CheckoutError =
  | "unauthorized"
  | "validation"
  | "empty_cart"
  | "items_changed"
  | "invalid_delivery"
  | "address_required"

export type CheckoutResult =
  { ok: true; number: number } | { ok: false; error: CheckoutError }
