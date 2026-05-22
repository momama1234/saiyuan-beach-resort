/**
 * SEO Schema utilities for hotel/accommodation websites
 * Based on Google Structured Data guidelines
 * Reference: https://developers.google.com/search/docs/appearance/structured-data/search-gallery
 */

// Base interfaces for structured data
interface BaseStructuredData {
    '@context': 'https://schema.org'
    '@type': string
    [key: string]: unknown // Allow additional properties for different schema types
}

type StructuredDataPayload = BaseStructuredData & Record<string, unknown>

interface _ImageObject {
    '@type': 'ImageObject'
    url: string
    width?: number
    height?: number
    alt?: string
}

interface _ContactPoint {
    '@type': 'ContactPoint'
    telephone: string
    contactType: string
    availableLanguage?: string[]
}

interface _Address {
    '@type': 'PostalAddress'
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
}

interface _GeoCoordinates {
    '@type': 'GeoCoordinates'
    latitude: number
    longitude: number
}

interface _AggregateRating {
    '@type': 'AggregateRating'
    ratingValue: number
    reviewCount: number
    bestRating?: number
    worstRating?: number
}

interface _Review {
    '@type': 'Review'
    author: {
        '@type': 'Person'
        name: string
    }
    reviewRating: {
        '@type': 'Rating'
        ratingValue: number
        bestRating?: number
        worstRating?: number
    }
    reviewBody: string
    datePublished?: string
}

// Hotel/Accommodation specific interfaces
interface HotelInfo {
    name: string
    description: string
    url: string
    telephone: string
    email?: string
    logo?: string
    images: string[]
    address: {
        streetAddress: string
        locality: string
        region: string
        postalCode: string
        country: string
    }
    coordinates?: {
        latitude: number
        longitude: number
    }
    rating?: {
        value: number
        count: number
        bestRating?: number
        worstRating?: number
    }
    reviews?: Array<{
        author: string
        rating: number
        text: string
        date?: string
    }>
    socialMedia?: {
        facebook?: string
        instagram?: string
        twitter?: string
        youtube?: string
    }
    amenities?: string[]
    checkInTime?: string
    checkOutTime?: string
    priceRange?: string
}

interface ArticleInfo {
    headline: string
    description: string
    url: string
    datePublished: string
    dateModified?: string
    author: {
        name: string
        url?: string
    }
    publisher: {
        name: string
        logo: string
    }
    image: string
    articleBody?: string
}

interface FAQInfo {
    questions: Array<{
        question: string
        answer: string
    }>
}

interface BreadcrumbInfo {
    items: Array<{
        name: string
        url: string
    }>
}

// Schema generation functions
export class SEOSchemaGenerator {
    /**
     * Generate LocalBusiness schema for hotel
     * Suitable for: Hotel homepage, contact page, about page
     */
    static generateHotelSchema(hotelInfo: HotelInfo): BaseStructuredData {
        const schema: StructuredDataPayload = {
            '@context': 'https://schema.org',
            '@type': 'LodgingBusiness',
            name: hotelInfo.name,
            description: hotelInfo.description,
            url: hotelInfo.url,
            telephone: hotelInfo.telephone,
            address: {
                '@type': 'PostalAddress',
                streetAddress: hotelInfo.address.streetAddress,
                addressLocality: hotelInfo.address.locality,
                addressRegion: hotelInfo.address.region,
                postalCode: hotelInfo.address.postalCode,
                addressCountry: hotelInfo.address.country
            },
            image: hotelInfo.images.map((img) => ({
                '@type': 'ImageObject',
                url: img
            }))
        }

        // Add optional fields
        if (hotelInfo.email) {
            schema.email = hotelInfo.email
        }

        if (hotelInfo.coordinates) {
            schema.geo = {
                '@type': 'GeoCoordinates',
                latitude: hotelInfo.coordinates.latitude,
                longitude: hotelInfo.coordinates.longitude
            }
        }

        if (hotelInfo.rating) {
            schema.aggregateRating = {
                '@type': 'AggregateRating',
                ratingValue: hotelInfo.rating.value,
                reviewCount: hotelInfo.rating.count,
                bestRating: hotelInfo.rating.bestRating || 5,
                worstRating: hotelInfo.rating.worstRating || 1
            }
        }

        if (hotelInfo.reviews && hotelInfo.reviews.length > 0) {
            schema.review = hotelInfo.reviews.map((review) => ({
                '@type': 'Review',
                author: {
                    '@type': 'Person',
                    name: review.author
                },
                reviewRating: {
                    '@type': 'Rating',
                    ratingValue: review.rating,
                    bestRating: 5,
                    worstRating: 1
                },
                reviewBody: review.text,
                ...(review.date && { datePublished: review.date })
            }))
        }

        if (hotelInfo.amenities && hotelInfo.amenities.length > 0) {
            schema.amenityFeature = hotelInfo.amenities.map((amenity) => ({
                '@type': 'LocationFeatureSpecification',
                name: amenity
            }))
        }

        if (hotelInfo.checkInTime) {
            schema.checkinTime = hotelInfo.checkInTime
        }

        if (hotelInfo.checkOutTime) {
            schema.checkoutTime = hotelInfo.checkOutTime
        }

        if (hotelInfo.priceRange) {
            schema.priceRange = hotelInfo.priceRange
        }

        return schema
    }

    /**
     * Generate Organization schema
     * Suitable for: Footer, about page, contact page
     */
    static generateOrganizationSchema(hotelInfo: HotelInfo): BaseStructuredData {
        const schema: StructuredDataPayload = {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: hotelInfo.name,
            url: hotelInfo.url,
            contactPoint: {
                '@type': 'ContactPoint',
                telephone: hotelInfo.telephone,
                contactType: 'customer service',
                availableLanguage: ['Thai', 'English']
            }
        }

        if (hotelInfo.logo) {
            schema.logo = {
                '@type': 'ImageObject',
                url: hotelInfo.logo
            }
        }

        if (hotelInfo.socialMedia) {
            const sameAs = []
            if (hotelInfo.socialMedia.facebook) sameAs.push(hotelInfo.socialMedia.facebook)
            if (hotelInfo.socialMedia.instagram) sameAs.push(hotelInfo.socialMedia.instagram)
            if (hotelInfo.socialMedia.twitter) sameAs.push(hotelInfo.socialMedia.twitter)
            if (hotelInfo.socialMedia.youtube) sameAs.push(hotelInfo.socialMedia.youtube)

            if (sameAs.length > 0) {
                schema.sameAs = sameAs
            }
        }

        return schema
    }

    /**
     * Generate Article schema
     * Suitable for: Blog posts, news articles, guides
     */
    static generateArticleSchema(articleInfo: ArticleInfo): BaseStructuredData {
        return {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: articleInfo.headline,
            description: articleInfo.description,
            url: articleInfo.url,
            datePublished: articleInfo.datePublished,
            dateModified: articleInfo.dateModified || articleInfo.datePublished,
            author: {
                '@type': 'Person',
                name: articleInfo.author.name,
                ...(articleInfo.author.url && { url: articleInfo.author.url })
            },
            publisher: {
                '@type': 'Organization',
                name: articleInfo.publisher.name,
                logo: {
                    '@type': 'ImageObject',
                    url: articleInfo.publisher.logo
                }
            },
            image: {
                '@type': 'ImageObject',
                url: articleInfo.image
            },
            ...(articleInfo.articleBody && { articleBody: articleInfo.articleBody })
        }
    }

    /**
     * Generate FAQ schema
     * Suitable for: FAQ page, help sections
     */
    static generateFAQSchema(faqInfo: FAQInfo): BaseStructuredData {
        return {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqInfo.questions.map((q) => ({
                '@type': 'Question',
                name: q.question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: q.answer
                }
            }))
        }
    }

    /**
     * Generate Breadcrumb schema
     * Suitable for: All pages with navigation breadcrumbs
     */
    static generateBreadcrumbSchema(breadcrumbInfo: BreadcrumbInfo): BaseStructuredData {
        return {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbInfo.items.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                item: item.url
            }))
        }
    }

    /**
     * Generate WebSite schema with search action
     * Suitable for: Homepage
     */
    static generateWebSiteSchema(siteInfo: { name: string; url: string; searchUrl?: string }): BaseStructuredData {
        const schema: StructuredDataPayload = {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: siteInfo.name,
            url: siteInfo.url
        }

        if (siteInfo.searchUrl) {
            schema.potentialAction = {
                '@type': 'SearchAction',
                target: `${siteInfo.searchUrl}?q={search_term_string}`,
                'query-input': 'required name=search_term_string'
            }
        }

        return schema
    }

    /**
     * Helper function to generate JSON-LD script tag
     */
    static generateJSONLD(schema: BaseStructuredData | BaseStructuredData[]): string {
        const schemaArray = Array.isArray(schema) ? schema : [schema]

        return schemaArray
            .map((s) => `<script type="application/ld+json">${JSON.stringify(s, null, 2)}</script>`)
            .join('\n')
    }

    /**
     * Helper function to generate multiple schemas at once
     * Server-side usage for better SEO
     */
    static generateMultipleSchemas(configs: {
        hotel?: HotelInfo
        website?: { name: string; url: string; searchUrl?: string }
        organization?: HotelInfo
        article?: ArticleInfo
        faq?: FAQInfo
        breadcrumb?: BreadcrumbInfo
    }): BaseStructuredData[] {
        const schemas: BaseStructuredData[] = []

        if (configs.hotel) {
            schemas.push(this.generateHotelSchema(configs.hotel))
        }

        if (configs.website) {
            schemas.push(this.generateWebSiteSchema(configs.website))
        }

        if (configs.organization) {
            schemas.push(this.generateOrganizationSchema(configs.organization))
        }

        if (configs.article) {
            schemas.push(this.generateArticleSchema(configs.article))
        }

        if (configs.faq) {
            schemas.push(this.generateFAQSchema(configs.faq))
        }

        if (configs.breadcrumb) {
            schemas.push(this.generateBreadcrumbSchema(configs.breadcrumb))
        }

        return schemas
    }
}

// Convenience functions for common use cases
export const createHotelSchema = (hotelInfo: HotelInfo) => SEOSchemaGenerator.generateHotelSchema(hotelInfo)

export const createOrganizationSchema = (hotelInfo: HotelInfo) =>
    SEOSchemaGenerator.generateOrganizationSchema(hotelInfo)

export const createArticleSchema = (articleInfo: ArticleInfo) => SEOSchemaGenerator.generateArticleSchema(articleInfo)

export const createFAQSchema = (faqInfo: FAQInfo) => SEOSchemaGenerator.generateFAQSchema(faqInfo)

export const createBreadcrumbSchema = (breadcrumbInfo: BreadcrumbInfo) =>
    SEOSchemaGenerator.generateBreadcrumbSchema(breadcrumbInfo)

export const createWebSiteSchema = (siteInfo: { name: string; url: string; searchUrl?: string }) =>
    SEOSchemaGenerator.generateWebSiteSchema(siteInfo)

// Export types for use in components
export type { ArticleInfo, BaseStructuredData, BreadcrumbInfo, FAQInfo, HotelInfo }
