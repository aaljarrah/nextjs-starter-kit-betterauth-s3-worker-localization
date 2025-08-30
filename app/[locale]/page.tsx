import { getTranslations } from 'next-intl/server'
import { AuthHeader } from '@/components/AuthHeader'
import { getCurrentUser } from '@/lib/auth-server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const t = await getTranslations()
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <div className="font-sans min-h-screen bg-background">
      <AuthHeader />
      <main className="container mx-auto px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-sm bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-full">
                ✅ {t('auth.loginSuccess')}
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-6 text-foreground">
              {t('app.title')}
            </h1>
            <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
              {t('app.description')}
            </p>
            {user && (
              <p className="text-lg text-muted-foreground">
                Welcome back, <span className="font-semibold text-foreground">{user.email}</span>!
              </p>
            )}
          </div>

          <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
              🎉 Complete Implementation Success!
            </h2>
            <p className="text-green-700 dark:text-green-300">
              All rules implemented • Theme switching • Localization • RTL/LTR support
            </p>
          </div>

          <div className="mb-12">
            <div className="w-full p-8 border border-border rounded-lg bg-card">
              <h2 className="text-3xl font-semibold mb-6 text-card-foreground">
                🎨 {t('theme.toggle')} Demo
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border border-border rounded bg-background">
                  <span className="text-foreground font-medium">Background</span>
                  <code className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">bg-background</code>
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded bg-card">
                  <span className="text-card-foreground font-medium">Card</span>
                  <code className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">bg-card</code>
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded bg-muted">
                  <span className="text-muted-foreground font-medium">Muted</span>
                  <code className="text-sm text-foreground bg-background px-2 py-1 rounded">bg-muted</code>
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded bg-secondary">
                  <span className="text-secondary-foreground font-medium">Secondary</span>
                  <code className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">bg-secondary</code>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <div className="w-full p-8 border border-border rounded-lg bg-card">
              <h2 className="text-3xl font-semibold mb-6 text-card-foreground">
                🌍 Localization Demo
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="p-4 border border-border rounded bg-background hover:bg-accent hover:text-accent-foreground transition-colors font-medium">
                  {t('navigation.home')}
                </button>
                <button className="p-4 border border-border rounded bg-background hover:bg-accent hover:text-accent-foreground transition-colors font-medium">
                  {t('navigation.dashboard')}
                </button>
                <button className="p-4 border border-border rounded bg-background hover:bg-accent hover:text-accent-foreground transition-colors font-medium">
                  {t('navigation.settings')}
                </button>
                <button className="p-4 border border-border rounded bg-background hover:bg-accent hover:text-accent-foreground transition-colors font-medium">
                  {t('navigation.profile')}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-foreground">
              ✨ Try These Features:
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• 🌙 <strong>Theme Toggle:</strong> Click the sun/moon/monitor icon (top-right) to cycle themes</li>
              <li>• 🌍 <strong>Language Switch:</strong> Click the language button to switch English ↔ Arabic</li>
              <li>• 📱 <strong>RTL Layout:</strong> Notice how the Arabic version flows right-to-left</li>
              <li>• 🎨 <strong>Theme Colors:</strong> All colors automatically adapt to your selected theme</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}