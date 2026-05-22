import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'

import Carousel from '@/components/Carousel'
import HomepageContent from '@/components/HomepageContent'
import HomepageFooter from '@/components/HomepageFooter'
import Logo from '@/components/Logo'
import MenuWrapper from '@/components/menu/MenuWrapper'
import SEOSchema from '@/components/SEOSchema'
import { fetchPropertyImages } from '@/features/property/helpers'
import { getDataWithToken } from '@/lib/api'
import { getHomepageSchemas } from '@/lib/seo-server'
import { PropertyInfo } from '@/types/property-info'

// Fallback images if API fails
const fallbackImages = [
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1920&q=85',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=85',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1920&q=85',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=85',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1920&q=85',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&q=85'
]

// This page renders when the user is at the root path
// and shows English content by default (no locale prefix)
const RootPage = async (): Promise<React.JSX.Element> => {
    // Set default locale to English for root path
    const locale = 'en'
    setRequestLocale(locale)

    // Get messages for the locale
    const messages = await getMessages()

    // Fetch property images from API
    const propertyImages = await fetchPropertyImages()
    const images = propertyImages.length > 0 ? propertyImages : fallbackImages

    // Generate SEO schemas for homepage (Server-side for optimal SEO)
    const schemas = getHomepageSchemas()
    const propertyInfo = await getDataWithToken<PropertyInfo>('/open/property-info')
    return (
        <NextIntlClientProvider messages={messages}>
            {propertyImages.length > 0 && (
                <link rel="preload" as="image" href={propertyImages[0]} fetchPriority="high" />
            )}
            {/* SEO Structured Data - Server-side rendered for optimal SEO */}
            <SEOSchema schema={schemas} />

            <div
                id="page-template"
                className="fixed top-0 left-0 h-screen w-full overflow-hidden md:relative md:top-0 md:left-0">
                <MenuWrapper />
                <Logo />
                <HomepageContent
                    description={propertyInfo?.description ?? ''}
                    name={propertyInfo?.name ?? 'Saiyuan Beach Resort'}
                />
                <Carousel images={images} />
            </div>
            <HomepageFooter />
        </NextIntlClientProvider>
    )
}

export default RootPage
