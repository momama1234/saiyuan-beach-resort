import { render } from '@testing-library/react'

jest.mock('next-intl/server', () => ({
    getMessages: jest.fn().mockResolvedValue({}),
    setRequestLocale: jest.fn(),
    getTranslations: jest.fn().mockResolvedValue((key: string) => key)
}))

jest.mock('@/features/property/helpers', () => ({
    fetchPropertyImages: jest.fn()
}))

jest.mock('@/lib/api', () => ({
    getDataWithToken: jest.fn().mockResolvedValue(null)
}))

jest.mock('@/lib/seo-server', () => ({
    getHomepageSchemas: jest.fn().mockReturnValue([])
}))

jest.mock('@/lib/seo', () => ({
    generateSEOMetadata: jest.fn().mockReturnValue({}),
    getAlternateLocales: jest.fn().mockReturnValue([]),
    SEO_CONFIG: { home: { en: {} } }
}))

jest.mock('@/lib/seo-schema', () => ({
    SEOSchemaGenerator: { generateFAQSchema: jest.fn().mockReturnValue({}) }
}))

jest.mock('@/lib/structured-data', () => ({
    generateHotelStructuredData: jest.fn().mockReturnValue({}),
    generateOrganizationStructuredData: jest.fn().mockReturnValue({})
}))

jest.mock('@/components/Carousel', () => () => null)
jest.mock('@/components/HomepageContent', () => () => null)
jest.mock('@/components/HomepageFooter', () => () => null)
jest.mock('@/components/Logo', () => () => null)
jest.mock('@/components/menu/MenuWrapper', () => () => null)
jest.mock('@/components/SEOSchema', () => () => null)
jest.mock('@/components/StructuredData', () => () => null)

import { fetchPropertyImages } from '@/features/property/helpers'

import HomePage from '../[locale]/page'
import RootPage from '../page'

const mockFetchPropertyImages = fetchPropertyImages as jest.MockedFunction<typeof fetchPropertyImages>

afterEach(() => {
    document.head.querySelectorAll('link[rel="preload"]').forEach((el) => el.remove())
})

describe('RootPage hero preload hint', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders a preload link for the first hero image when API returns images', async () => {
        mockFetchPropertyImages.mockResolvedValue(['https://cdn.test/hero-1.jpg', 'https://cdn.test/hero-2.jpg'])

        const jsx = await RootPage()
        render(jsx)

        const link = document.querySelector('link[rel="preload"][as="image"]')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', 'https://cdn.test/hero-1.jpg')
    })

    it('does not render a preload link when API returns no images', async () => {
        mockFetchPropertyImages.mockResolvedValue([])

        const jsx = await RootPage()
        render(jsx)

        expect(document.querySelector('link[rel="preload"][as="image"]')).not.toBeInTheDocument()
    })
})

describe('HomePage (locale) hero preload hint', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders a preload link for the first hero image when API returns images', async () => {
        mockFetchPropertyImages.mockResolvedValue(['https://cdn.test/locale-hero-1.jpg'])

        const jsx = await HomePage({ params: Promise.resolve({ locale: 'en' }) })
        render(jsx)

        const link = document.querySelector('link[rel="preload"][as="image"]')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', 'https://cdn.test/locale-hero-1.jpg')
    })

    it('does not render a preload link when API returns no images', async () => {
        mockFetchPropertyImages.mockResolvedValue([])

        const jsx = await HomePage({ params: Promise.resolve({ locale: 'en' }) })
        render(jsx)

        expect(document.querySelector('link[rel="preload"][as="image"]')).not.toBeInTheDocument()
    })
})
