import PageTemplate from '@/components/PageTemplate'
import SEOSchema from '@/components/SEOSchema'
import { generateSEOMetadata, getAlternateLocales } from '@/lib/seo'
import { getContactPageSchemas } from '@/lib/seo-server'

import { ContactPageClient } from './components/ContactPageClient'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    return generateSEOMetadata({
        title: 'Contact Us | Saiyuan Beach Resort',
        description: 'Get in touch with Saiyuan Beach Resort on Koh Libong. Contact us for reservations, inquiries, or any assistance.',
        canonical: locale === 'en' ? '/contact' : `/${locale}/contact`,
        locale,
        alternateLocales: getAlternateLocales('/contact')
    })
}

export default function ContactPage() {
    const schemas = getContactPageSchemas()
    return (
        <>
            <SEOSchema schema={schemas} />
            <PageTemplate images={['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1920&q=85']} showCarouselControls={false} scrollable={false}>
                <ContactPageClient />
            </PageTemplate>
        </>
    )
}
