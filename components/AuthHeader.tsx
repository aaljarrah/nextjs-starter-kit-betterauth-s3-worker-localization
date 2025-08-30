import { getTranslations } from 'next-intl/server'
import { LogOut, User } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageToggle } from '@/components/LanguageToggle'
import { getCurrentUser } from '@/lib/auth-server'
import { SignOutButton } from './SignOutButton'

export async function AuthHeader() {
  const t = await getTranslations()
  const user = await getCurrentUser()

  return (
    <header className="fixed top-4 right-4 flex gap-2 z-50">
      {user && (
        <div className="flex items-center gap-2 bg-card border border-border rounded-md px-3 py-1 shadow-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-card-foreground">
            {user.email}
          </span>
          <SignOutButton title={t('auth.logout')}>
            <LogOut className="h-4 w-4" />
          </SignOutButton>
        </div>
      )}
      <ThemeToggle />
      <LanguageToggle />
    </header>
  )
}
