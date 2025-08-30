import { getRequestConfig } from 'next-intl/server'

// Can be imported from a shared config
export const locales = ['en', 'ar'] as const
export const defaultLocale = 'en' as const

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  // Note: Don't use notFound() here as it causes routing issues
  // The middleware should handle invalid locales before they get here
  // Fallback to default locale if invalid
  const validLocale = locale && locales.includes(locale as (typeof locales)[number]) 
    ? locale 
    : defaultLocale

  try {
    const messages = (await import(`../messages/${validLocale}.json`)).default
    return { 
      locale: validLocale,
      messages 
    }
  } catch (error) {
    console.error(`Failed to load messages for locale: ${validLocale}`, error)
    return { 
      locale: validLocale,
      messages: {} 
    }
  }
})
