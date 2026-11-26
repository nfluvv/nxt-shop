import { getCurrentUser } from "@/entities/user/server"
import { UserProfile } from "@/widgets/user-profile-card"
import { AuthGate } from "@/features/telegram-auth"
import { getTranslations } from "next-intl/server"
import { Container, SettingsGroup, SettingsRow } from "@/shared/client/ui"
import { User } from "lucide-react"

export async function UserProfileView() {
  const user = await getCurrentUser()
  const t = await getTranslations("profile")

  if (!user) return <AuthGate />

  return (
    <main>
      <Container>
        <UserProfile profile={user} />

        <div className="mt-8 flex flex-col gap-8">
          {user.role === "ADMIN" && (
            <SettingsGroup title={t("admin")}>
              <SettingsRow
                icon={<User className="size-5" />}
                label={t("adminSub")}
                href="/admin"
              />
            </SettingsGroup>
          )}
        </div>
      </Container>
    </main>
  )
}
