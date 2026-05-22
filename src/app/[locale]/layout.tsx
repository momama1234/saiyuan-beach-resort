import { notFound, redirect } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'

import Footer from '@/components/Footer'
import FooterWrapper from '@/components/FooterWrapper'
import { routing } from '@/i18n/routing'

interface LocaleLayoutProps {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }))
}

async function fetchEnabledLocaleCodes(): Promise<string[]> {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/v1'
        const headers: Record<string, string> = {}
        const apiKey = process.env.NEXT_PUBLIC_API_KEY
        const publicKey = process.env.NEXT_PUBLIC_API_PUBLIC_KEY
        if (apiKey) headers['x-api-key'] = apiKey
        if (publicKey) headers['x-public-key'] = publicKey

        const res = await fetch(`${apiUrl}/open/languages`, { headers, cache: 'no-store' })
        if (!res.ok) return [...routing.locales]
        const data: Array<{ code: string }> = await res.json()
        return data.map((l) => l.code)
    } catch {
        // Fail open — if API is unreachable, allow all configured locales
        return [...routing.locales]
    }
}

const LocaleLayout = async ({ children, params }: LocaleLayoutProps): Promise<React.JSX.Element> => {
    const { locale } = await params

    // Ensure that the incoming `locale` is valid in the routing config
    if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
        notFound()
    }

    // For non-default locales, verify the locale is enabled in admin settings.
    // Using cache: 'no-store' so the check reflects admin changes immediately.
    if (locale !== routing.defaultLocale) {
        const enabledCodes = await fetchEnabledLocaleCodes()
        if (!enabledCodes.includes(locale)) {
            redirect('/')
        }
    }

    // Enable static rendering
    setRequestLocale(locale)

    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages()

    return (
        <NextIntlClientProvider messages={messages}>
            {children}
            <FooterWrapper>
                <Footer />
            </FooterWrapper>
        </NextIntlClientProvider>
    )
}

export default LocaleLayout
