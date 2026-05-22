import { getTranslations, setRequestLocale } from 'next-intl/server'

import Carousel from '@/components/Carousel'
import HomepageContent from '@/components/HomepageContent'
import Logo from '@/components/Logo'
import MenuWrapper from '@/components/menu/MenuWrapper'
import SEOSchema from '@/components/SEOSchema'
import StructuredData from '@/components/StructuredData'
import { OPEN_PROPERTY_INFO_API_PATH } from '@/constants/path'
import { fetchPropertyImages } from '@/features/property/helpers'
import { getDataWithToken } from '@/lib/api'
import { generateSEOMetadata, getAlternateLocales, SEO_CONFIG } from '@/lib/seo'
import { SEOSchemaGenerator } from '@/lib/seo-schema'
import { generateHotelStructuredData, generateOrganizationStructuredData } from '@/lib/structured-data'
import { PropertyInfo } from '@/types/property-info'

interface HomePageProps {
    params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: HomePageProps) {
    const { locale } = await params
    const config = SEO_CONFIG.home[locale as keyof typeof SEO_CONFIG.home] || SEO_CONFIG.home.en

    return generateSEOMetadata({
        ...config,
        canonical: locale === 'en' ? '/' : `/${locale}`,
        locale,
        alternateLocales: getAlternateLocales(''),
        image: '/images/A1.webp'
    })
}

const HomePage = async ({ params }: HomePageProps): Promise<React.JSX.Element> => {
    const { locale } = await params
    const propertyInfo = await getDataWithToken<PropertyInfo>(`${OPEN_PROPERTY_INFO_API_PATH}?locale=${locale}`)
    setRequestLocale(locale)

    const imageUrls = await fetchPropertyImages()
    const t = await getTranslations({ locale, namespace: 'HomepageFAQ' })

    const faqSchema = SEOSchemaGenerator.generateFAQSchema({
        questions: [
            { question: t('q1'), answer: t('a1') },
            { question: t('q2'), answer: t('a2') },
            { question: t('q3'), answer: t('a3') },
            { question: t('q4'), answer: t('a4') },
            { question: t('q5'), answer: t('a5') }
        ]
    })

    return (
        <>
            {imageUrls.length > 0 && (
                <link rel="preload" as="image" href={imageUrls[0]} fetchPriority="high" />
            )}
            <StructuredData data={generateHotelStructuredData()} />
            <StructuredData data={generateOrganizationStructuredData()} />
            <SEOSchema schema={faqSchema} />
            <div
                id="page-template"
                className="relative flex w-full flex-col md:h-screen md:overflow-hidden">
                <MenuWrapper />
                <Logo />
                <Carousel images={imageUrls} isOnHomePage />
                <HomepageContent
                    description={propertyInfo?.description ?? ''}
                    name={propertyInfo?.name ?? 'Saiyuan Beach Resort'}
                />
            </div>
        </>
    )
}

export default HomePage
