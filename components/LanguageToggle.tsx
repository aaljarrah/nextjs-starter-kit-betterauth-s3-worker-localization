'use client'

import * as React from 'react'
import { Languages } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'

export function LanguageToggle() {
  const t = useTranslations('language')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-input bg-transparent hover:bg-accent hover:text-accent-foreground">
        <Languages className="h-4 w-4" />
        <span className="sr-only">Toggle language</span>
      </button>
    )
  }

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en'
    const currentPath = pathname.replace(`/${locale}`, '') || '/'
    router.push(`/${newLocale}${currentPath}`)
  }

  const currentLanguage = locale === 'en' ? t('english') : t('arabic')
  const nextLanguage = locale === 'en' ? t('arabic') : t('english')

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center justify-center min-w-[2.25rem] h-9 px-2 rounded-md border border-input bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium"
      aria-label={`${t('switch')} - ${nextLanguage}`}
      title={`${t('switch')} - ${nextLanguage}`}
    >
      <Languages className="h-4 w-4 mr-1" />
      <span className="hidden sm:inline-block">{locale.toUpperCase()}</span>
      <span className="sr-only">{t('switch')} - {nextLanguage}</span>
    </button>
  )
}
