import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/reservations/success',
                '/th/reservations/success',
                '/contact-booking/success',
                '/th/contact-booking/success',
                '/manage-booking',
                '/th/manage-booking'
            ]
        },
        sitemap: `${siteUrl}/sitemap.xml`
    }
}
