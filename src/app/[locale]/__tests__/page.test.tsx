import { render, screen } from '@testing-library/react'

import HomePage from '../page'

jest.mock('next-intl/server', () => ({
    setRequestLocale: jest.fn(),
    getTranslations: jest.fn(() =>
        Promise.resolve((key: string) => key)
    )
}))

jest.mock('@/lib/seo', () => ({
    generateSEOMetadata: jest.fn(),
    getAlternateLocales: jest.fn(() => []),
    SEO_CONFIG: { home: { en: {} } }
}))

jest.mock('@/lib/structured-data', () => ({
    generateHotelStructuredData: jest.fn(() => ({})),
    generateOrganizationStructuredData: jest.fn(() => ({}))
}))

jest.mock('@/lib/seo-schema', () => ({
    SEOSchemaGenerator: {
        generateFAQSchema: jest.fn(() => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [] }))
    }
}))

jest.mock('@/components/SEOSchema', () => () => null)
jest.mock('@/components/StructuredData', () => () => null)
jest.mock('@/components/Logo', () => () => null)
jest.mock('@/components/menu/MenuWrapper', () => () => null)
jest.mock('@/components/HomepageContent', () => () => null)
const FooterStub = () => <footer data-testid="shared-footer" />
jest.mock('@/components/Footer', () => FooterStub)

const carouselMock = jest.fn(({ images }) => (
    <div data-testid="carousel-stub" data-image-count={images.length} />
))
jest.mock('@/components/Carousel', () => ({
    __esModule: true,
    default: (props: { images: string[] }) => carouselMock(props)
}))

const getDataWithTokenMock = jest.fn()
jest.mock('@/lib/api', () => ({
    getDataWithToken: (...args: unknown[]) => getDataWithTokenMock(...args)
}))

const fetchPropertyImagesMock = jest.fn()
jest.mock('@/features/property/helpers', () => ({
    fetchPropertyImages: () => fetchPropertyImagesMock()
}))

describe('HomePage', () => {
    beforeEach(() => {
        carouselMock.mockClear()
        getDataWithTokenMock.mockReset()
        fetchPropertyImagesMock.mockReset()
        fetchPropertyImagesMock.mockResolvedValue(['/img/a.jpg', '/img/b.jpg'])
    })

    it('renders the image carousel with property images', async () => {
        getDataWithTokenMock.mockResolvedValue({
            name: 'Saiyuan Beach Resort',
            description: ''
        })

        const element = await HomePage({ params: Promise.resolve({ locale: 'en' }) })
        render(element)

        const stub = screen.getByTestId('carousel-stub')
        expect(stub).toHaveAttribute('data-image-count', '2')
    })

    it('renders the image carousel when /open/property-info has only homepage content', async () => {
        getDataWithTokenMock.mockResolvedValue({
            name: 'Saiyuan Beach Resort',
            description: ''
        })

        const element = await HomePage({ params: Promise.resolve({ locale: 'en' }) })
        render(element)

        const stub = screen.getByTestId('carousel-stub')
        expect(stub).toHaveAttribute('data-image-count', '2')
    })

    it('does not render the shared footer because LocaleLayout owns it', async () => {
        getDataWithTokenMock.mockResolvedValue({
            name: 'Saiyuan Beach Resort',
            description: ''
        })

        const element = await HomePage({ params: Promise.resolve({ locale: 'en' }) })
        render(element)

        expect(screen.queryByTestId('shared-footer')).not.toBeInTheDocument()
    })
})
