import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import PageContentComponent from '@/components/content/PageContent'
import PageTemplate from '@/components/PageTemplate'
import { fetchPageByPath } from '@/lib/page-content'
import { generateSEOMetadata } from '@/lib/seo'

interface CatchAllPageProps {
    params: Promise<{ locale: string; slug: string[] }>
}

export async function generateMetadata({ params }: CatchAllPageProps): Promise<Metadata> {
    const { locale, slug } = await params
    const content = await fetchPageByPath(slug, locale)

    if (!content) {
        return {
            title: 'Page Not Found',
            description: 'The requested page could not be found.'
        }
    }

    const slugPath = slug.join('/')
    const canonicalPath = locale === 'en' ? `/${slugPath}` : `/${locale}/${slugPath}`

    return generateSEOMetadata({
        title: content.title || 'Saiyuan Beach Resort',
        description:
            content.subtitle || 'Experience luxury at Saiyuan Beach Resort on pristine Libong Island, Trang, Thailand.',
        canonical: canonicalPath,
        locale
    })
}

export default async function CatchAllPage({ params }: CatchAllPageProps) {
    const { locale, slug } = await params
    const content = await fetchPageByPath(slug, locale)

    if (!content) {
        notFound()
    }

    const sectionImages = content.sections.flatMap((s) => s.images ?? []).slice(0, 3)
    const images = sectionImages.map((img) => img.heroSrc ?? img.src)
    const mobileImages = sectionImages.map((img) => img.src)

    return (
        <PageTemplate images={images} mobileImages={mobileImages}>
            <PageContentComponent
                title={content.title}
                subtitle={content.subtitle}
                sections={content.sections}
            />
        </PageTemplate>
    )
}
