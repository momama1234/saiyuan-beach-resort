/**
 * Server-side SEO Schema utilities
 * For use in Server Components and Server Actions - RECOMMENDED for SEO
 */

import { getBreadcrumbForPage, HOTEL_FAQ, HOTEL_INFO, WEBSITE_INFO } from '@/constants/hotel'

import { type ArticleInfo, BaseStructuredData, type FAQInfo, type HotelInfo, SEOSchemaGenerator } from './seo-schema'

/**
 * Generate schemas for different page types - SERVER SIDE ONLY
 * Use this in Server Components for optimal SEO
 */
export class SEOServerUtils {
    /**
     * Generate schemas for homepage
     */
    static getHomepageSchemas(hotelInfo: HotelInfo = HOTEL_INFO) {
        return SEOSchemaGenerator.generateMultipleSchemas({
            hotel: hotelInfo,
            website: WEBSITE_INFO,
            organization: hotelInfo
        })
    }

    /**
     * Generate schemas for rooms/accommodation pages
     */
    static getRoomsPageSchemas(pathname: string = '/rooms', hotelInfo: HotelInfo = HOTEL_INFO) {
        return SEOSchemaGenerator.generateMultipleSchemas({
            hotel: hotelInfo,
            organization: hotelInfo,
            breadcrumb: getBreadcrumbForPage(pathname)
        })
    }

    /**
     * Generate schemas for individual room detail pages
     */
    static getRoomDetailPageSchemas(
        roomInfo: {
            name: string
            title?: string
            description?: string
            price?: number | string
            images?: string[]
            features?: Array<{ text: string }> | string[]
            maxGuests?: number
            slug: string
        },
        hotelInfo: HotelInfo = HOTEL_INFO
    ) {
        const roomTitle = roomInfo.title || roomInfo.name
        const roomImages = roomInfo.images || []

        // Enhanced hotel info with room-specific details
        const enhancedHotelInfo: HotelInfo = {
            ...hotelInfo,
            name: `${roomTitle} - ${hotelInfo.name}`,
            description:
                roomInfo.description ||
                `Experience luxury in our ${roomTitle} at ${hotelInfo.name}. Modern amenities with authentic Thai hospitality.`,
            images: roomImages.length > 0 ? roomImages : hotelInfo.images
        }

        // Create breadcrumb for room detail page
        const breadcrumb = {
            items: [
                { name: 'Home', url: hotelInfo.url },
                { name: 'Rooms', url: `${hotelInfo.url}/rooms` },
                { name: roomTitle, url: `${hotelInfo.url}/rooms/${roomInfo.slug}` }
            ]
        }

        // Generate Product schema for the room
        const roomProduct = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: roomTitle,
            description: roomInfo.description || `Luxurious ${roomTitle} with modern amenities and Thai hospitality`,
            image: roomImages.length > 0 ? roomImages : hotelInfo.images,
            brand: {
                '@type': 'Brand',
                name: hotelInfo.name
            },
            category: 'Hotel Room',
            ...(typeof roomInfo.price === 'number' && {
                offers: {
                    '@type': 'Offer',
                    price: roomInfo.price,
                    priceCurrency: 'THB',
                    availability: 'https://schema.org/InStock',
                    seller: {
                        '@type': 'Organization',
                        name: hotelInfo.name
                    }
                }
            }),
            ...(roomInfo.maxGuests && {
                numberOfRooms: '1',
                occupancy: {
                    '@type': 'QuantitativeValue',
                    maxValue: roomInfo.maxGuests,
                    unitText: 'person'
                }
            })
        }

        const schemas = SEOSchemaGenerator.generateMultipleSchemas({
            hotel: enhancedHotelInfo,
            organization: hotelInfo,
            breadcrumb: breadcrumb
        })

        // Add room product schema (cast to BaseStructuredData)
        schemas.push(roomProduct as BaseStructuredData)

        return schemas
    }

    /**
     * Generate schemas for contact page
     */
    static getContactPageSchemas(hotelInfo: HotelInfo = HOTEL_INFO) {
        return SEOSchemaGenerator.generateMultipleSchemas({
            hotel: {
                ...hotelInfo,
                description: `Contact ${hotelInfo.name} for reservations, inquiries, or special requests. Our friendly staff is available 24/7 to assist you.`
            },
            organization: hotelInfo,
            breadcrumb: getBreadcrumbForPage('/contact')
        })
    }

    /**
     * Generate schemas for FAQ page
     */
    static getFAQPageSchemas(faqInfo: FAQInfo = HOTEL_FAQ, hotelInfo: HotelInfo = HOTEL_INFO) {
        return SEOSchemaGenerator.generateMultipleSchemas({
            faq: faqInfo,
            organization: hotelInfo,
            breadcrumb: getBreadcrumbForPage('/faq')
        })
    }

    /**
     * Generate schemas for blog/article pages
     */
    static getArticlePageSchemas(articleInfo: ArticleInfo, hotelInfo: HotelInfo = HOTEL_INFO) {
        const breadcrumb = {
            items: [
                { name: 'Home', url: WEBSITE_INFO.url },
                { name: 'Blog', url: `${WEBSITE_INFO.url}/blog` },
                { name: articleInfo.headline, url: articleInfo.url }
            ]
        }

        return SEOSchemaGenerator.generateMultipleSchemas({
            article: articleInfo,
            organization: hotelInfo,
            breadcrumb: breadcrumb
        })
    }

    /**
     * Generate schemas for about page
     */
    static getAboutPageSchemas(hotelInfo: HotelInfo = HOTEL_INFO) {
        return SEOSchemaGenerator.generateMultipleSchemas({
            hotel: hotelInfo,
            organization: hotelInfo,
            breadcrumb: getBreadcrumbForPage('/about')
        })
    }

    /**
     * Generate schemas for amenities/facilities page
     */
    static getAmenitiesPageSchemas(hotelInfo: HotelInfo = HOTEL_INFO) {
        return SEOSchemaGenerator.generateMultipleSchemas({
            hotel: hotelInfo,
            organization: hotelInfo,
            breadcrumb: getBreadcrumbForPage('/amenities')
        })
    }

    /**
     * Generate schemas for dining/restaurant page
     */
    static getDiningPageSchemas(hotelInfo: HotelInfo = HOTEL_INFO) {
        return SEOSchemaGenerator.generateMultipleSchemas({
            hotel: hotelInfo,
            organization: hotelInfo,
            breadcrumb: getBreadcrumbForPage('/dining')
        })
    }

    /**
     * Generate schemas automatically based on pathname
     * Use this for dynamic routing
     */
    static getSchemasByPathname(pathname: string, hotelInfo: HotelInfo = HOTEL_INFO) {
        switch (pathname) {
            case '/':
                return this.getHomepageSchemas(hotelInfo)

            case '/rooms':
            case '/accommodations':
            case '/suites':
                return this.getRoomsPageSchemas(pathname, hotelInfo)

            case '/contact':
                return this.getContactPageSchemas(hotelInfo)

            case '/faq':
            case '/help':
                return this.getFAQPageSchemas(undefined, hotelInfo)

            case '/about':
            case '/about-us':
                return this.getAboutPageSchemas(hotelInfo)

            case '/amenities':
            case '/facilities':
                return this.getAmenitiesPageSchemas(hotelInfo)

            case '/dining':
            case '/restaurant':
                return this.getDiningPageSchemas(hotelInfo)

            default:
                // Default schemas for other pages
                return SEOSchemaGenerator.generateMultipleSchemas({
                    organization: hotelInfo,
                    breadcrumb: getBreadcrumbForPage(pathname)
                })
        }
    }

    /**
     * Generate base organization schema for layout
     * Use this in root layout for all pages
     */
    static getLayoutSchemas(hotelInfo: HotelInfo = HOTEL_INFO) {
        return [SEOSchemaGenerator.generateOrganizationSchema(hotelInfo)]
    }
}

/**
 * Convenience functions for server components
 */
export const getHomepageSchemas = () => SEOServerUtils.getHomepageSchemas()
export const getRoomsPageSchemas = (pathname?: string) => SEOServerUtils.getRoomsPageSchemas(pathname)
export const getRoomDetailPageSchemas = (roomInfo: Parameters<typeof SEOServerUtils.getRoomDetailPageSchemas>[0]) =>
    SEOServerUtils.getRoomDetailPageSchemas(roomInfo)
export const getContactPageSchemas = () => SEOServerUtils.getContactPageSchemas()
export const getFAQPageSchemas = () => SEOServerUtils.getFAQPageSchemas()
export const getAboutPageSchemas = () => SEOServerUtils.getAboutPageSchemas()
export const getAmenitiesPageSchemas = () => SEOServerUtils.getAmenitiesPageSchemas()
export const getDiningPageSchemas = () => SEOServerUtils.getDiningPageSchemas()
export const getLayoutSchemas = () => SEOServerUtils.getLayoutSchemas()

export const getSchemasByPathname = (pathname: string) => SEOServerUtils.getSchemasByPathname(pathname)

export const getArticlePageSchemas = (articleInfo: ArticleInfo) => SEOServerUtils.getArticlePageSchemas(articleInfo)
