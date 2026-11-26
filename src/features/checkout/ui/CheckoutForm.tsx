"use client"

import { useForm, useWatch, type FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { z } from "zod"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useTranslations } from "next-intl"
import { Button, Input } from "@/shared/client/ui"
import { cn } from "@/shared/client/lib/utils"
import { formatPrice } from "@/shared/client/lib/format-price"
import { checkoutSchema, type CheckoutError } from "../model/schema"
import { createOrder } from "../api/create-order"

interface DeliveryOption {
  id: string
  name: string
  price: number
  needAddress: boolean
}

interface Props {
  deliveries: DeliveryOption[]
  subtotal: number
  currency: string
  defaults: { name: string; phone: string }
}

type FormInput = z.input<typeof checkoutSchema>
type FormOutput = z.output<typeof checkoutSchema>
type Field = "name" | "phone" | "address" | "comment"

const TOAST_ID = "checkout"

const haptic = (type: "success" | "error") =>
  window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type)

export function CheckoutForm({
  deliveries,
  subtotal,
  currency,
  defaults,
}: Props) {
  const t = useTranslations("checkout")
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    register,
    control,
    setValue,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(checkoutSchema),
    mode: "onTouched",
    defaultValues: {
      name: defaults.name,
      phone: defaults.phone,
      deliveryMethodId: deliveries[0]?.id ?? "",
      address: undefined,
      comment: undefined,
    },
  })

  const deliveryId = useWatch({ control, name: "deliveryMethodId" })
  const delivery = deliveries.find((d) => d.id === deliveryId)
  const total = subtotal + (delivery?.price ?? 0)

  const validationText = (key?: string) =>
    key
      ? t(`validation.${key}` as Parameters<typeof t>[0])
      : t("errors.validation")

  const showError = (message: string) => {
    toast.error(message, { id: TOAST_ID })
    haptic("error")
  }

  const orderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (res) => {
      if (res.ok) {
        toast.dismiss(TOAST_ID)
        haptic("success")
        queryClient.invalidateQueries({ queryKey: ["cart"] })
        router.replace(`/checkout/success/${res.number}`)
        return
      }

      showError(t(`errors.${res.error}` satisfies `errors.${CheckoutError}`))

      if (res.error === "address_required") {
        setError("address", { type: "server", message: "address_required" })
      }
      if (res.error === "items_changed" || res.error === "empty_cart") {
        router.replace("/cart")
      }
    },
    onError: () => showError(t("errors.network")),
  })

  const onValid = (values: FormOutput) => {
    if (orderMutation.isPending || !delivery) return

    if (delivery.needAddress && !values.address?.trim()) {
      setError("address", { type: "required", message: "address_required" })
      showError(validationText("address_required"))
      return
    }

    orderMutation.mutate({
      ...values,
      address: delivery.needAddress ? values.address : undefined,
    })
  }

  const onInvalid = (errs: FieldErrors<FormInput>) => {
    const first = Object.values(errs).find((e) => e?.message)
    showError(validationText(first?.message as string | undefined))
  }

  const fieldClass = (f: Field) =>
    cn("h-11 rounded-xl", errors[f] && "border-destructive")

  const fieldError = (f: Field) =>
    errors[f]?.message ? (
      <p role="alert" className="-mt-1 text-xs text-destructive">
        {validationText(errors[f]?.message as string)}
      </p>
    ) : null

  return (
    <form
      onSubmit={handleSubmit(onValid, onInvalid)}
      noValidate
      className="flex flex-1 flex-col gap-5"
    >
      <Section title={t("contacts")}>
        <Input
          placeholder={t("name")}
          autoComplete="name"
          aria-invalid={!!errors.name}
          className={fieldClass("name")}
          {...register("name")}
        />
        {fieldError("name")}

        <Input
          placeholder={t("phone")}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          aria-invalid={!!errors.phone}
          className={fieldClass("phone")}
          {...register("phone")}
        />
        {fieldError("phone")}
      </Section>

      <Section title={t("delivery")}>
        {deliveries.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() =>
              setValue("deliveryMethodId", d.id, { shouldValidate: true })
            }
            className={cn(
              "flex min-h-12 items-center justify-between rounded-xl border px-4 text-left text-sm transition-colors active:bg-muted",
              deliveryId === d.id
                ? "border-primary bg-primary/10"
                : "border-border/50"
            )}
          >
            <span>{d.name}</span>
            <span className="text-muted-foreground">
              {d.price === 0 ? t("free") : formatPrice(d.price, currency)}
            </span>
          </button>
        ))}

        {delivery?.needAddress && (
          <>
            <Input
              placeholder={t("address")}
              autoComplete="street-address"
              aria-invalid={!!errors.address}
              className={fieldClass("address")}
              {...register("address", { setValueAs: (v) => v || undefined })}
            />
            {fieldError("address")}
          </>
        )}
      </Section>

      <Section title={t("comment")}>
        <textarea
          maxLength={500}
          rows={3}
          placeholder={t("commentPlaceholder")}
          className="w-full resize-none rounded-xl border border-border/50 bg-transparent px-3.5 py-2.5 text-sm outline-none focus-visible:border-primary/40"
          {...register("comment", { setValueAs: (v) => v || undefined })}
        />
        {fieldError("comment")}
      </Section>

      <p className="text-xs text-muted-foreground">{t("paymentNote")}</p>

      <div className="-mx-4 mt-auto flex flex-col gap-3 border-t border-border/50 bg-background/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="flex items-baseline justify-between">
          <span className="text-muted-foreground">{t("total")}</span>
          <span className="text-xl font-bold">
            {formatPrice(total, currency)}
          </span>
        </div>
        <Button
          type="submit"
          disabled={orderMutation.isPending}
          className="h-12 w-full rounded-xl text-base"
        >
          {orderMutation.isPending ? t("submitting") : t("submit")}
        </Button>
      </div>
    </form>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      {children}
    </section>
  )
}
