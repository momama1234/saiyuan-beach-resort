import './globals.css'

import clsx from 'clsx'
import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Cormorant } from 'next/font/google'
import Script from 'next/script'
import { setRequestLocale } from 'next-intl/server'

import { TooltipProvider } from '@/components/ui/tooltip'
import { OPEN_PROPERTY_INFO_API_PATH } from '@/constants/path'
import { ReservationProvider } from '@/contexts/ReservationContext'
import { routing } from '@/i18n/routing'
import { getDataWithToken } from '@/lib/api'
import { PropertyInfo } from '@/types/property-info'

// Global dynamic rendering configuration to handle API calls gracefully
export const dynamic = 'force-dynamic'
export const revalidate = 0

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['200', '300', '400', '500', '600', '700', '800'],
    variable: '--font-plus-jakarta-sans',
    display: 'swap',
    fallback: ['system-ui', 'sans-serif']
})

const cormorant = Cormorant({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-cormorant',
    display: 'swap',
    fallback: ['Georgia', 'serif']
})

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#0E7C86',
    colorScheme: 'light',
    viewportFit: 'cover'
}

const baseIcons = {
    icon: [
        { url: '/images/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
        { url: '/images/favicon.svg', type: 'image/svg+xml' },
        { url: '/images/favicon.ico' }
    ],
    shortcut: '/images/favicon.ico',
    apple: { url: '/images/apple-touch-icon.png', sizes: '180x180' }
} satisfies NonNullable<Metadata['icons']>

function getMetadataIcons(faviconUrl?: string | null): NonNullable<Metadata['icons']> {
    if (!faviconUrl) {
        return baseIcons
    }

    return {
        icon: [{ url: faviconUrl }],
        shortcut: [{ url: faviconUrl }],
        apple: baseIcons.apple
    }
}

const baseMetadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://saiyuanbeachresort.com'),
    title: {
        template: '%s | Saiyuan Beach Resort',
        default: 'Saiyuan Beach Resort — Libong Island, Thailand'
    },
    description:
        'Experience the serene beauty of Libong Island at Saiyuan Beach Resort. Beachfront villas, ocean teal horizons, and authentic Thai hospitality in Trang, Thailand.',
    keywords: ['Saiyuan Beach Resort', 'Libong Island', 'Trang Thailand', 'beachfront resort', 'luxury villas', 'island getaway'],
    robots: {
        index: true,
        follow: true
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        siteName: 'Saiyuan Beach Resort'
    },
    twitter: {
        card: 'summary_large_image',
        creator: '@saiyuanresort'
    },
    manifest: '/images/site.webmanifest'
}

async function getPropertyInfoMetadata(): Promise<PropertyInfo | null> {
    try {
        return await getDataWithToken<PropertyInfo>(OPEN_PROPERTY_INFO_API_PATH, undefined, 300)
    } catch (error) {
        console.error('Failed to fetch property info metadata for favicon', error)
        return null
    }
}

export async function generateMetadata(): Promise<Metadata> {
    const propertyInfo = await getPropertyInfoMetadata()

    return {
        ...baseMetadata,
        icons: getMetadataIcons(propertyInfo?.faviconUrl)
    }
}

// Generate static params for all locales
export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }))
}

interface RootLayoutProps {
    children: React.ReactNode
    params?: Promise<{ locale?: string }>
}

const RootLayout = async ({ children, params }: RootLayoutProps): Promise<React.JSX.Element> => {
    // Get locale from params or default to 'en' for root path
    const locale = params ? (await params).locale || 'en' : 'en'
    const propertyInfo = await getPropertyInfoMetadata()

    // Enable static rendering
    setRequestLocale(locale)

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                {propertyInfo?.faviconUrl ? (
                    <>
                        <link rel="icon" href={propertyInfo.faviconUrl} />
                        <link rel="shortcut icon" href={propertyInfo.faviconUrl} />
                    </>
                ) : null}
            </head>
            <body
                className={clsx('antialiased', plusJakartaSans.variable, cormorant.variable)}
                style={{
                    fontFamily: 'var(--font-plus-jakarta-sans), system-ui, sans-serif'
                }}
                suppressHydrationWarning>
                {process.env.NEXT_PUBLIC_REACT_SCAN_ENABLED === 'true' && (
                    <Script
                        src="//unpkg.com/react-scan/dist/auto.global.js"
                        strategy="afterInteractive"
                        crossOrigin="anonymous"
                    />
                )}
                <TooltipProvider>
                    <ReservationProvider>{children}</ReservationProvider>
                </TooltipProvider>
            </body>
        </html>
    )
}

export default RootLayout
