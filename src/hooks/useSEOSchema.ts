/**
 * React hooks for managing SEO structured data
 *
 * WARNING: These hooks are for CLIENT-SIDE usage only and should be avoided for SEO!
 * For optimal SEO, use server-side utilities from '@/lib/seo-server' instead.
 *
 * Use these hooks ONLY when:
 * 1. You need dynamic schema updates after page load (rare)
 * 2. You're working with client-only components that need schema
 * 3. You're building interactive features that modify schema
 *
 * For standard SEO needs, use server-side utilities instead.
 */

import { useEffect } from 'react'

import {
    type ArticleInfo,
    type BaseStructuredData,
    type BreadcrumbInfo,
    type FAQInfo,
    type HotelInfo,
    SEOSchemaGenerator
} from '@/lib/seo-schema'

/**
 * Hook to inject structured data into document head
 * Useful for dynamic schema injection
 */
export function useSEOSchema(schema: BaseStructuredData | BaseStructuredData[], enabled: boolean = true) {
    useEffect(() => {
        if (!enabled || typeof window === 'undefined') return

        const schemaArray = Array.isArray(schema) ? schema : [schema]
        const scripts: HTMLScriptElement[] = []

        schemaArray.forEach((schemaItem, index) => {
            const script = document.createElement('script')
            script.type = 'application/ld+json'
            script.textContent = JSON.stringify(schemaItem, null, 0)
            script.id = `structured-data-${index}-${Date.now()}`

            document.head.appendChild(script)
            scripts.push(script)
        })

        // Cleanup function
        return () => {
            scripts.forEach((script) => {
                if (script.parentNode) {
                    script.parentNode.removeChild(script)
                }
            })
        }
    }, [schema, enabled])
}

/**
 * Hook to generate hotel schema with current page data
 */
export function useHotelSchema(hotelInfo: HotelInfo) {
    return SEOSchemaGenerator.generateHotelSchema(hotelInfo)
}

/**
 * Hook to generate article schema with current article data
 */
export function useArticleSchema(articleInfo: ArticleInfo) {
    return SEOSchemaGenerator.generateArticleSchema(articleInfo)
}

/**
 * Hook to generate FAQ schema
 */
export function useFAQSchema(faqInfo: FAQInfo) {
    return SEOSchemaGenerator.generateFAQSchema(faqInfo)
}

/**
 * Hook to generate breadcrumb schema from current path
 */
export function useBreadcrumbSchema(breadcrumbInfo: BreadcrumbInfo) {
    return SEOSchemaGenerator.generateBreadcrumbSchema(breadcrumbInfo)
}

/**
 * Hook to generate multiple schemas at once
 * Useful for pages that need multiple schema types
 */
export function useMultipleSchemas(schemas: {
    hotel?: HotelInfo
    article?: ArticleInfo
    faq?: FAQInfo
    breadcrumb?: BreadcrumbInfo
}): BaseStructuredData[] {
    const result: BaseStructuredData[] = []

    if (schemas.hotel) {
        result.push(SEOSchemaGenerator.generateHotelSchema(schemas.hotel))
    }

    if (schemas.article) {
        result.push(SEOSchemaGenerator.generateArticleSchema(schemas.article))
    }

    if (schemas.faq) {
        result.push(SEOSchemaGenerator.generateFAQSchema(schemas.faq))
    }

    if (schemas.breadcrumb) {
        result.push(SEOSchemaGenerator.generateBreadcrumbSchema(schemas.breadcrumb))
    }

    return result
}

/**
 * Hook for generating schema for current page based on pathname
 */
export function usePageSchema(pathname: string, hotelInfo: HotelInfo) {
    const schemas: BaseStructuredData[] = []

    // Always include organization schema
    schemas.push(SEOSchemaGenerator.generateOrganizationSchema(hotelInfo))

    // Add page-specific schemas
    switch (pathname) {
        case '/':
            // Homepage
            schemas.push(SEOSchemaGenerator.generateHotelSchema(hotelInfo))
            schemas.push(
                SEOSchemaGenerator.generateWebSiteSchema({
                    name: hotelInfo.name,
                    url: hotelInfo.url
                })
            )
            break

        case '/rooms':
        case '/accommodations':
            // Rooms page
            schemas.push(SEOSchemaGenerator.generateHotelSchema(hotelInfo))
            break

        case '/contact':
            // Contact page
            schemas.push(SEOSchemaGenerator.generateHotelSchema(hotelInfo))
            break

        default:
            // Other pages - just basic hotel info
            if (hotelInfo) {
                schemas.push(SEOSchemaGenerator.generateHotelSchema(hotelInfo))
            }
    }

    return schemas
}
