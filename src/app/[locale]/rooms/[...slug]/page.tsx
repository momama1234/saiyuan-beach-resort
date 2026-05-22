import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import BookNowButton from '@/components/content/BookNowButton'
import RoomContent from '@/components/content/RoomContent'
import PageTemplate from '@/components/PageTemplate'
import SEOSchema from '@/components/SEOSchema'
import { HOTEL_INFO } from '@/constants/hotel'
import { getDataWithToken } from '@/lib/api'
import { getAlternateLocales } from '@/lib/seo'
import { SEOSchemaGenerator } from '@/lib/seo-schema'
import { SEOServerUtils } from '@/lib/seo-server'
import { PropertyInfo } from '@/types/property-info'
import type { DisplayImageVariants } from '@/types/room-management'

// Types for room data
interface RoomClass {
    id: number
    name: string
    note?: string
    slug: string
    description?: string
    basePrice: number
    numberOfGuests?: number
    maximumNumberOfGuests?: number
    numberOfAdults?: number
    numberOfChildren?: number
    totalRoomCount: number
    primaryImage?: {
        id: number
        imageUrl: string
        url?: string
        displayImage?: DisplayImageVariants
        urls: {
            original: string
            optimized: string
            thumbnail: string
            large: string
        }
    }
    pricing: {
        startingPrice: number
        displayText: string
    }
}

interface RoomImage {
    id?: number
    imageUrl?: string
    url?: string
    isPrimary?: boolean
    category?: number
    displayImage?: DisplayImageVariants
    urls?: {
        original?: string
        optimized?: string
        thumbnail?: string
        large?: string | null
    }
}

interface EnhancedRoom extends RoomClass {
    roomType?: string
    title?: string
    features?: Array<{ text: string; isHighlighted?: boolean }> | string
    details?: Array<{ label: string; value: string }> | string
    additionalInfo?: string
    images?: string[] | RoomImage[]
}

function getRoomImageUrl(image: RoomImage, variant: 'hero' | 'card' = 'hero'): string {
    if (variant === 'card') {
        return image.displayImage?.card?.url || image.displayImage?.hero?.url || image.imageUrl || image.url || ''
    }
    return image.displayImage?.hero?.url || image.displayImage?.card?.url || image.imageUrl || image.url || ''
}

function getOrderedRoomImages(images?: string[] | RoomImage[], variant: 'hero' | 'card' = 'hero'): string[] {
    if (!Array.isArray(images)) {
        return []
    }

    if (images.every((image) => typeof image === 'string')) {
        return images.filter((image): image is string => Boolean(image))
    }

    return [...images]
        .sort((left, right) => {
            if (typeof left === 'string' || typeof right === 'string') {
                return 0
            }

            return Number(Boolean(right.isPrimary)) - Number(Boolean(left.isPrimary))
        })
        .map((image) => (typeof image === 'string' ? image : getRoomImageUrl(image, variant)))
        .filter(Boolean)
}

// Helper function to safely parse JSON strings
function safeJsonParse<T>(value: T | string, fallback: T): T {
    if (typeof value === 'string') {
        try {
            return JSON.parse(value)
        } catch {
            return fallback
        }
    }
    return value
}

interface RoomDetailPageProps {
    params: Promise<{ locale: string; slug: string[] }>
}

// Fetch room data by slug
async function getRoomBySlug(slug: string): Promise<EnhancedRoom | null> {
    try {
        return await getDataWithToken(`/open/room-classes/slug/${slug}`)
    } catch (error) {
        console.error(`Error fetching room ${slug}:`, error)
        return null
    }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: RoomDetailPageProps): Promise<Metadata> {
    const { locale, slug } = await params
    const slugPath = slug.join('/')
    const room = await getRoomBySlug(slugPath)

    if (!room) {
        return {
            title: 'Room Not Found',
            description: 'The requested room could not be found.'
        }
    }

    const images = getOrderedRoomImages(room.images)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://saiyuanbeachresort.com'
    const canonicalPath = locale === 'en' ? `/rooms/${slugPath}` : `/${locale}/rooms/${slugPath}`
    const alternateLocales = getAlternateLocales(`/rooms/${slugPath}`)

    return {
        title: `${room.title || room.name} | Saiyuan Beach Resort`,
        description:
            room.description ||
            room.additionalInfo ||
            `Experience luxury in our ${room.title || room.name} with modern amenities and authentic Thai hospitality.`,
        keywords: [
            room.name,
            room.title,
            'Saiyuan Beach Resort',
            'Koh Libong',
            'Thailand resort',
            'beach accommodation',
            'luxury hotel',
            'Thai hospitality'
        ]
            .filter(Boolean)
            .join(', '),
        alternates: {
            canonical: `${baseUrl}${canonicalPath}`,
            languages: alternateLocales.reduce(
                (acc, alt) => {
                    acc[alt.locale] = alt.href
                    return acc
                },
                {} as Record<string, string>
            )
        },
        openGraph: {
            title: `${room.title || room.name} | Saiyuan Beach Resort`,
            description:
                room.description || room.additionalInfo || `Experience luxury in our ${room.title || room.name}`,
            images: images.length > 0 ? images : undefined,
            type: 'website'
        },
        twitter: {
            card: 'summary_large_image',
            title: `${room.title || room.name} | Saiyuan Beach Resort`,
            description:
                room.description || room.additionalInfo || `Experience luxury in our ${room.title || room.name}`,
            images: images.length > 0 ? images : undefined
        }
    }
}

const RoomDetailPage = async ({ params }: RoomDetailPageProps): Promise<React.JSX.Element> => {
    const { locale, slug } = await params
    setRequestLocale(locale)

    const room = await getRoomBySlug(slug.join('/'))
    const propertyInfo = await getDataWithToken<PropertyInfo>('/open/property-info')

    if (!room) {
        notFound()
    }

    // Extract images from room data - extract imageUrl from image objects
    const images = getOrderedRoomImages(room.images)
    const mobileImages = getOrderedRoomImages(room.images, 'card')

    // Transform room data to match RoomContent props - handle JSON strings
    const features =
        (safeJsonParse<Array<{ text: string; isHighlighted?: boolean }>>(room.features ?? [], []) || []).sort(
            (left, right) =>
                Number(Boolean(right.isHighlighted)) - Number(Boolean(left.isHighlighted)) ||
                left.text.localeCompare(right.text)
        ) ?? []
    const details = safeJsonParse(room.details, []) || []

    // Prepare room info for SEO schema
    const roomInfo = {
        name: room.name,
        title: room.title,
        description:
            room.description ||
            `Experience luxury and comfort in our ${room.title || room.name}. This accommodation offers modern amenities while maintaining the authentic charm of Thai hospitality.`,
        price: room.basePrice,
        images: images,
        features: features,
        maxGuests: room.maximumNumberOfGuests || room.numberOfGuests,
        slug: slug.join('/')
    }
    // Generate SEO schemas for room detail page (Server-side for optimal SEO)
    const schemas = SEOServerUtils.getRoomDetailPageSchemas(roomInfo, {
        ...HOTEL_INFO,
        telephone: propertyInfo?.phone ?? HOTEL_INFO.telephone,
        email: propertyInfo?.email ?? HOTEL_INFO.email,
    })

    const t = await getTranslations({ locale, namespace: 'RoomsFAQ' })
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
            {/* SEO Structured Data - Server-side rendered for optimal SEO */}
            <SEOSchema schema={schemas} />
            <SEOSchema schema={faqSchema} />

            <PageTemplate
                images={images}
                mobileImages={mobileImages}
                footer={
                    <BookNowButton
                        roomClassId={room.id}
                        isContactBooking={propertyInfo?.isContactBooking ?? false}
                    />
                }>
                <RoomContent
                    title={room.title || room.name}
                    description={
                        room.description ||
                        `Experience luxury and comfort in our ${room.title || room.name}. This accommodation offers modern amenities while maintaining the authentic charm of Thai hospitality.`
                    }
                    features={features}
                    details={details}
                    note={room.note}
                />
            </PageTemplate>
        </>
    )
}

export default RoomDetailPage
