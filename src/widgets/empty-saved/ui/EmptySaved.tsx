import Link from "next/link"
import { BookmarkOff } from "lucide-react"
import { Button, Container } from "@/shared/client/ui"
import { getTranslations } from "next-intl/server"

export async function EmptySaved() {
  const t = await getTranslations("saved")

  return (
    <main className="py-2">
      <Container className="flex flex-col items-center gap-4 py-20 text-center">
        <BookmarkOff className="h-12 w-12 text-muted-foreground/40" />
        <div>
          <h1 className="text-xl font-bold">{t("emptyTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("emptyText")}</p>
        </div>
        <Button asChild className="h-11 rounded-xl px-6">
          <Link href="/catalog">{t("toCatalog")}</Link>
        </Button>
      </Container>
    </main>
  )
}
