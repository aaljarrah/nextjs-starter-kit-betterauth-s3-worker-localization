import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from './lib/i18n'
import { auth } from '@/lib/auth'


// Create the i18n middleware
const handleI18nRouting = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
})

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle API routes first - no auth or i18n needed
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Apply i18n routing first
  const response = handleI18nRouting(request)
  
  // Extract locale from pathname (e.g., /en/dashboard -> en)
  const pathnameLocale = pathname.split('/')[1]
  const locale = locales.includes(pathnameLocale as (typeof locales)[number]) ? pathnameLocale : defaultLocale

  // Define public routes that don't require authentication
  const publicRoutes = [`/${locale}/login`, `/${locale}/register`]
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  if (isPublicRoute) {
    return response
  }

  // // Check authentication for protected routes
  // try {
  //   const session = await auth.api.getSession({
  //     headers: request.headers
  //   })

  //   if (!session) {
  //     // Redirect to login if not authenticated
  //     const loginUrl = new URL(`/${locale}/login`, request.url)
  //     loginUrl.searchParams.set('redirect', pathname)
  //     return NextResponse.redirect(loginUrl)
  //   }

  //   return response
  // } catch (error) {
  //   console.error('Auth middleware error:', error)
  //   // On auth error, redirect to login
  //   const loginUrl = new URL(`/${locale}/login`, request.url)
  //   loginUrl.searchParams.set('redirect', pathname)
  //   return NextResponse.redirect(loginUrl)
  // }
}

export const config = {
  // Match only internationalized pathnames
  runtime: 'nodejs', // Now stable!
  matcher: [
    // Match all pathnames except for
    // - /api routes  
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - /.*\..*$ (files with extensions)
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
}
