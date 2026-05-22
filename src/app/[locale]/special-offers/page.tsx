import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'

import MenuWrapper from '@/components/menu/MenuWrapper'
import SEOSchema from '@/components/SEOSchema'
import { HOTEL_INFO } from '@/constants/hotel'
import { OPEN_PROMOTIONS_API_PATH } from '@/constants/path'
import { getDataWithToken } from '@/lib/api'
import { generateSEOMetadata, getAlternateLocales, SEO_CONFIG } from '@/lib/seo'
import { SEOSchemaGenerator } from '@/lib/seo-schema'
import type { DisplayImageVariants } from '@/types/room-management'

import { getPromotionImageUrl, shouldBypassNextImageOptimization } from './promotion-image-url'

interface SpecialOffersPageProps {
    params: Promise<{ locale: string }>
}

interface PromotionTranslation {
    locale: string
    title: string
    discountHeadline: string | null
    subtitle: string
    features: string[]
}

interface DiscountRules {
    maxDiscountPercent: string | null
    losDiscounts: { id: number; minNights: number; discountPercent: string }[]
    advanceDiscounts: { id: number; minDaysAhead: number; discountPercent: string }[]
}

interface Promotion {
    id: number
    imageUrl: string | null
    displayImage?: DisplayImageVariants | null
    discountLabel: string | null
    ratePlanId: number | null
    displayOrder: number
    translations: PromotionTranslation[]
    discountRules: DiscountRules | null
}

export async function generateMetadata({ params }: SpecialOffersPageProps) {
    const { locale } = await params
    const config =
        SEO_CONFIG.specialOffers[locale as keyof typeof SEO_CONFIG.specialOffers] || SEO_CONFIG.specialOffers.en

    return generateSEOMetadata({
        ...config,
        canonical: locale === 'en' ? '/special-offers' : `/${locale}/special-offers`,
        locale,
        alternateLocales: getAlternateLocales('/special-offers'),
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=85'
    })
}

const SpecialOffersPage = async ({ params }: SpecialOffersPageProps): Promise<React.JSX.Element> => {
    const { locale } = await params
    setRequestLocale(locale)
    const t = await getTranslations('SpecialOffers')

    const breadcrumbSchema = SEOSchemaGenerator.generateBreadcrumbSchema({
        items: [
            { name: 'Home', url: HOTEL_INFO.url },
            { name: 'Special Offers', url: `${HOTEL_INFO.url}/special-offers` }
        ]
    })
    const organizationSchema = SEOSchemaGenerator.generateOrganizationSchema(HOTEL_INFO)

    let promotions: Promotion[] = []

    try {
        const data = await getDataWithToken<Promotion[]>(OPEN_PROMOTIONS_API_PATH)
        if (Array.isArray(data)) {
            promotions = data.sort((a, b) => a.displayOrder - b.displayOrder)
        }
    } catch (error) {
        console.error('Failed to load promotions:', error)
        promotions = []
    }

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <SEOSchema schema={[breadcrumbSchema, organizationSchema]} />
            <MenuWrapper />

            {/* Hero */}
            <div className="relative h-[520px] w-full flex-shrink-0">
                <Image
                    alt="Saiyuan Beach Resort special offers"
                    className="h-[520px] w-full object-cover"
                    height={400}
                    src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=85"
                    width={1920}
                    priority
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="flex w-full flex-col items-center justify-center gap-2 px-12 py-12 text-center font-light text-white">
                        <h1 className="text-lg font-light tracking-[0.2em] text-white uppercase lg:text-xl">
                            {t('title')}
                        </h1>
                        <span className="text-2xl font-semibold lg:text-3xl xl:text-4xl">{t('subtitle')}</span>
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col bg-white pb-8 lg:pb-16">
                <div className="mx-auto w-full max-w-screen-2xl px-2 lg:px-4">
                    {promotions.length === 0 ? (
                        <EmptyState t={t} locale={locale} />
                    ) : (
                        <div className="flex flex-col divide-y divide-gray-100">
                            {promotions.map((promotion, index) => (
                                <PromotionCard
                                    key={promotion.id}
                                    promotion={promotion}
                                    index={index}
                                    locale={locale}
                                    bookNowLabel={t('bookNow')}
                                    t={t}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function getTranslation(promotion: Promotion, locale: string): PromotionTranslation {
    return (
        promotion.translations.find((tr) => tr.locale === locale) ||
        promotion.translations.find((tr) => tr.locale === 'en') ||
        promotion.translations[0] || { locale, title: '', discountHeadline: null, subtitle: '', features: [] }
    )
}

function PromotionCard({
    promotion,
    index,
    locale,
    bookNowLabel,
    t
}: {
    promotion: Promotion
    index: number
    locale: string
    bookNowLabel: string
    t: Awaited<ReturnType<typeof getTranslations<'SpecialOffers'>>>
}) {
    const translation = getTranslation(promotion, locale)
    const isEven = index % 2 === 0
    const imageUrl = getPromotionImageUrl(promotion)

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const checkIn = today.toISOString().split('T')[0]
    const checkOut = tomorrow.toISOString().split('T')[0]

    const defaultGuests = 'adults=2&children=1'
    const bookingHref = promotion.ratePlanId
        ? `/${locale}/reservations?ratePlanId=${promotion.ratePlanId}&checkIn=${checkIn}&checkOut=${checkOut}&${defaultGuests}`
        : `/${locale}/reservations?checkIn=${checkIn}&checkOut=${checkOut}&${defaultGuests}`

    const rules = promotion.discountRules
    const autoFeatures: string[] = []
    if (rules) {
        rules.losDiscounts.forEach((d) =>
            autoFeatures.push(t('losDiscount', { nights: d.minNights, percent: d.discountPercent }))
        )
        rules.advanceDiscounts.forEach((d) =>
            autoFeatures.push(t('advanceDiscount', { days: d.minDaysAhead, percent: d.discountPercent }))
        )
    }
    const allFeatures = [...autoFeatures, ...translation.features]

    const textPanel = (
        <div className="flex w-full flex-col justify-center gap-6 bg-white px-8 py-16 lg:w-1/2 lg:px-24 lg:py-36">
            {translation.title && (
                <h2 className="text-3xl font-bold text-gray-900 lg:text-4xl">
                    {translation.title}
                    {rules?.maxDiscountPercent && (
                        <span className="text-[#c0392b]"> {rules.maxDiscountPercent}% OFF</span>
                    )}
                </h2>
            )}
            {(translation.discountHeadline ?? translation.subtitle) && (
                <p className="text-base leading-relaxed text-gray-600">
                    {translation.discountHeadline ?? translation.subtitle}
                </p>
            )}
            {allFeatures.length > 0 && (
                <div className="flex flex-col gap-3">
                    <p className="text-xs font-bold tracking-widest text-gray-900 uppercase">Price Includes</p>
                    <ul className="flex flex-col gap-2">
                        {allFeatures.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                <span className="mt-0.5 flex-shrink-0 text-gray-400">—</span>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div>
                <Link
                    href={bookingHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block cursor-pointer bg-[#c0392b] px-10 py-3.5 text-sm font-bold tracking-widest text-white uppercase transition-colors duration-200 hover:bg-[#a93226]">
                    {bookNowLabel}
                </Link>
            </div>
        </div>
    )

    const imagePanel = (
        <div className="relative min-h-[500px] w-full flex-shrink-0 overflow-hidden lg:min-h-0 lg:w-1/2">
            <Image
                src={imageUrl}
                alt={translation.title}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized={shouldBypassNextImageOptimization(imageUrl)}
            />
        </div>
    )

    return (
        <div className="flex flex-col items-stretch lg:flex-row">
            {isEven ? (
                <>
                    {textPanel}
                    {imagePanel}
                </>
            ) : (
                <>
                    {imagePanel}
                    {textPanel}
                </>
            )}
        </div>
    )
}

function EmptyState({
    t,
    locale
}: {
    t: Awaited<ReturnType<typeof getTranslations<'SpecialOffers'>>>
    locale: string
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-6 px-8 py-24 text-center">
            <p className="text-3xl font-bold text-gray-900">{t('emptyTitle')}</p>
            <p className="max-w-md text-base text-gray-500">{t('emptyDescription')}</p>
            <Link
                href={`/${locale}/reservations`}
                className="mt-4 inline-block cursor-pointer bg-[#c0392b] px-10 py-3.5 text-sm font-bold tracking-widest text-white uppercase transition-colors duration-200 hover:bg-[#a93226]">
                {t('emptyButton')}
            </Link>
        </div>
    )
}

export default SpecialOffersPage
