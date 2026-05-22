import { render, screen } from '@testing-library/react'

import SpecialOffersPage from '../page'

const enTranslations: Record<string, string> = {
    title: 'Special Offers & Packages',
    subtitle: 'Promotions and Packages',
    bookNow: 'BOOK NOW',
    emptyTitle: 'No Special Offers Right Now',
    emptyDescription: 'Check back soon — exclusive deals are always on the horizon.',
    emptyButton: 'Book Direct',
}

const thTranslations: Record<string, string> = {
    title: 'โปรโมชั่นและแพ็กเกจพิเศษ',
    subtitle: 'ดีลสุดพิเศษที่ออกแบบมาเพื่อการพักผ่อนที่สมบูรณ์แบบของคุณ',
    bookNow: 'จองเลย',
    emptyTitle: 'ยังไม่มีโปรโมชั่นในขณะนี้',
    emptyDescription: 'กลับมาตรวจสอบเร็วๆ นี้ — ดีลสุดพิเศษกำลังจะมาถึง',
    emptyButton: 'จองโดยตรง',
}

const getTranslationsMock = jest.fn()

jest.mock('next-intl/server', () => ({
    setRequestLocale: jest.fn(),
    getTranslations: (...args: unknown[]) => getTranslationsMock(...args),
}))

jest.mock('@/components/menu/MenuWrapper', () => () => null)
jest.mock('@/components/SEOSchema', () => () => null)

jest.mock('@/constants/hotel', () => ({
    HOTEL_INFO: { url: 'https://saiyuanbeachresort.com', name: 'Saiyuan Beach Resort' }
}))

jest.mock('@/lib/seo-schema', () => ({
    SEOSchemaGenerator: {
        generateBreadcrumbSchema: jest.fn(() => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [] })),
        generateOrganizationSchema: jest.fn(() => ({ '@context': 'https://schema.org', '@type': 'Organization' }))
    }
}))

jest.mock('@/lib/api', () => ({
    getDataWithToken: jest.fn().mockResolvedValue([]),
}))

jest.mock('@/lib/seo', () => ({
    generateSEOMetadata: jest.fn(),
    getAlternateLocales: jest.fn(() => []),
    SEO_CONFIG: { specialOffers: { en: {} } },
}))

describe('SpecialOffersPage', () => {
    it('renders an <h1> with the correct English text for locale en', async () => {
        getTranslationsMock.mockResolvedValue((key: string) => enTranslations[key] ?? key)

        const element = await SpecialOffersPage({ params: Promise.resolve({ locale: 'en' }) })
        render(element)

        const h1 = screen.getByRole('heading', { level: 1 })
        expect(h1).toBeInTheDocument()
        expect(h1).toHaveTextContent('Special Offers & Packages')
    })

    it('renders an <h1> with the correct Thai text for locale th', async () => {
        getTranslationsMock.mockResolvedValue((key: string) => thTranslations[key] ?? key)

        const element = await SpecialOffersPage({ params: Promise.resolve({ locale: 'th' }) })
        render(element)

        const h1 = screen.getByRole('heading', { level: 1 })
        expect(h1).toBeInTheDocument()
        expect(h1).toHaveTextContent('โปรโมชั่นและแพ็กเกจพิเศษ')
    })
})
