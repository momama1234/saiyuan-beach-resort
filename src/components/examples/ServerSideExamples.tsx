/**
 * Server-side SEO Schema examples - RECOMMENDED approach for SEO
 * These examples show the correct way to implement structured data
 */

import Image from 'next/image'

import SEOSchema from '@/components/SEOSchema'
import { HOTEL_FAQ } from '@/constants/hotel'
import type { ArticleInfo } from '@/lib/seo-schema'
import {
    getAboutPageSchemas,
    getArticlePageSchemas,
    getContactPageSchemas,
    getFAQPageSchemas,
    getHomepageSchemas,
    getRoomsPageSchemas
} from '@/lib/seo-server'

/**
 * Example 1: Homepage with complete SEO schema
 * This is a Server Component - optimal for SEO
 */
export default async function HomepageServer() {
    // Server-side schema generation (runs on server, better for SEO)
    const schemas = getHomepageSchemas()

    return (
        <>
            {/* SEO Schema rendered on server - search engines can crawl immediately */}
            <SEOSchema schema={schemas} />

            <main>
                <h1>Welcome to Saiyuan Beach Resort</h1>
                <p>Experience authentic Thai hospitality...</p>

                {/* Your homepage content */}
            </main>
        </>
    )
}

/**
 * Example 2: Rooms page with hotel and breadcrumb schema
 */
export async function RoomsPageServer() {
    const schemas = getRoomsPageSchemas('/rooms')

    return (
        <>
            <SEOSchema schema={schemas} />

            <main>
                <h1>Our Rooms & Suites</h1>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{/* Room cards */}</div>
            </main>
        </>
    )
}

/**
 * Example 3: Contact page with emphasized local business info
 */
export async function ContactPageServer() {
    const schemas = getContactPageSchemas()

    return (
        <>
            <SEOSchema schema={schemas} />

            <main>
                <h1>Contact Us</h1>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div>
                        <h2>Get in Touch</h2>
                        <p>Phone: +66-XX-XXX-XXXX</p>
                        <p>Email: info@saiyuanbeachresort.com</p>
                    </div>
                    <div>
                        <h2>Location</h2>
                        <p>123 Main Street, City, Province</p>
                    </div>
                </div>
            </main>
        </>
    )
}

/**
 * Example 4: FAQ page with structured FAQ data
 */
export async function FAQPageServer() {
    const schemas = getFAQPageSchemas()

    return (
        <>
            <SEOSchema schema={schemas} />

            <main>
                <h1>Frequently Asked Questions</h1>
                <div className="space-y-6">
                    {HOTEL_FAQ.questions.map((item, index) => (
                        <div key={index} className="border-b pb-4">
                            <h3 className="mb-2 text-lg font-semibold">{item.question}</h3>
                            <p className="text-gray-700">{item.answer}</p>
                        </div>
                    ))}
                </div>
            </main>
        </>
    )
}

/**
 * Example 5: Blog article page with article schema
 */
export async function BlogArticleServer({
    article
}: {
    article: {
        title: string
        slug: string
        content: string
        excerpt: string
        publishDate: string
        updateDate?: string
        author: string
        authorSlug: string
        featuredImage: string
    }
}) {
    const articleInfo: ArticleInfo = {
        headline: article.title,
        description: article.excerpt,
        url: `https://thaivis.breathoftravels.com/blog/${article.slug}`,
        datePublished: article.publishDate,
        dateModified: article.updateDate,
        author: {
            name: article.author,
            url: `https://thaivis.breathoftravels.com/author/${article.authorSlug}`
        },
        publisher: {
            name: 'Saiyuan Beach Resort',
            logo: 'https://thaivis.breathoftravels.com/logo.png'
        },
        image: article.featuredImage,
        articleBody: article.content
    }

    const schemas = getArticlePageSchemas(articleInfo)

    return (
        <>
            <SEOSchema schema={schemas} />

            <article>
                <header>
                    <h1 className="mb-4 text-3xl font-bold">{article.title}</h1>
                    <div className="mb-6 text-gray-600">
                        <span>By {article.author}</span> •
                        <time dateTime={article.publishDate}>{new Date(article.publishDate).toLocaleDateString()}</time>
                    </div>
                    <Image
                        src={article.featuredImage}
                        alt={article.title}
                        className="mb-6 h-64 w-full rounded-lg object-cover"
                        width={600}
                        height={256}
                    />
                </header>

                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
            </article>
        </>
    )
}

/**
 * Example 6: About page with detailed hotel information
 */
export async function AboutPageServer() {
    const schemas = getAboutPageSchemas()

    return (
        <>
            <SEOSchema schema={schemas} />

            <main>
                <h1>About Saiyuan Beach Resort</h1>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div>
                        <h2>Our Story</h2>
                        <p>Founded in the heart of Thailand, Saiyuan Beach Resort represents...</p>
                    </div>
                    <div>
                        <h2>Our Mission</h2>
                        <p>To provide exceptional Thai hospitality and authentic experiences...</p>
                    </div>
                </div>
            </main>
        </>
    )
}

/**
 * Example 7: Dynamic page using pathname-based schema
 */
export async function DynamicPageServer({ pathname }: { pathname: string }) {
    // This could be used in a layout or dynamic route
    const { getSchemasByPathname } = await import('@/lib/seo-server')
    const schemas = getSchemasByPathname(pathname)

    return (
        <>
            <SEOSchema schema={schemas} />

            <main>
                <h1>Dynamic Page</h1>
                <p>Schemas generated automatically based on pathname: {pathname}</p>
            </main>
        </>
    )
}

/**
 * Example 8: Layout component with base schemas
 * Use this in your root layout to add organization schema to all pages
 */
export async function SEOLayout({ children }: { children: React.ReactNode; pathname?: string }) {
    const { getLayoutSchemas } = await import('@/lib/seo-server')
    const schemas = getLayoutSchemas()

    return (
        <>
            {/* Base schemas for all pages */}
            <SEOSchema schema={schemas} />

            {children}
        </>
    )
}

/**
 * Example 9: Product/Service page (can be adapted for room types)
 */
export async function ServicePageServer({
    serviceName,
    serviceDescription
}: {
    serviceName: string
    serviceDescription: string
}) {
    const { getRoomsPageSchemas } = await import('@/lib/seo-server')
    const schemas = getRoomsPageSchemas(`/services/${serviceName.toLowerCase()}`)

    return (
        <>
            <SEOSchema schema={schemas} />

            <main>
                <h1>{serviceName}</h1>
                <p>{serviceDescription}</p>

                {/* Service/room details */}
            </main>
        </>
    )
}
