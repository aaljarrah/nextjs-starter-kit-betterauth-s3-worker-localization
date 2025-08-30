// import type { Metadata } from "next"; // Unused for now
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { locales } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import { ThemeProvider } from "@/components/ThemeProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!locales.includes(locale as 'en' | 'ar')) {
    notFound();
  }

  try {
    const messages = await getMessages({ locale });
    
    return (
      <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning={true}>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    );
  } catch (error: unknown) {
    console.error(`getMessages() failed for locale "${locale}":`, error)
    // Fallback without messages - load empty messages for the locale
    const fallbackMessages = {};
    return (
      <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning={true}>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <NextIntlClientProvider messages={fallbackMessages} locale={locale}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div style={{ padding: '20px' }}>
                <h1>Layout FALLBACK (getMessages failed)</h1>
                <p>Locale: {locale}</p>
                <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
                {children}
              </div>
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    );
  }
}