import { render, screen } from '@testing-library/react'

const labels: Record<string, string> = {
    resortName: 'Saiyuan Beach Resort',
    description: 'desc',
    quickLinks: 'Quick Links',
    rooms: 'Rooms',
    dining: 'Dining',
    gallery: 'Gallery',
    contact: 'Contact',
    legal: 'Legal',
    policies: 'Policies',
    bookingDisclaimer: 'By booking, you agree to our',
    followUs: 'Follow Us',
    address: 'address',
    phone: 'phone',
    email: 'email',
    newsletter: 'Newsletter',
    newsletterDescription: 'subscribe',
    emailPlaceholder: 'email',
    subscribe: 'subscribe',
    copyright: '© Saiyuan Beach Resort',
    sitemap: 'Sitemap',
    allRightsReserved: 'reserved'
}

jest.mock('next-intl', () => ({
    useTranslations: () => (key: string) => labels[key] ?? key
}))

jest.mock('next-intl/server', () => ({
    getTranslations: jest.fn().mockResolvedValue((key: string) => labels[key] ?? key),
    getLocale: jest.fn().mockResolvedValue('en')
}))

jest.mock('@/i18n/routing', () => ({
    Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>
}))

jest.mock('@/ui/icons', () => ({
    FacebookIcon: () => <span data-testid="facebook" />,
    InstagramIcon: () => <span data-testid="instagram" />
}))

jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ alt }: { alt: string }) => <img alt={alt} />
}))

jest.mock('@/lib/api', () => ({
    getDataWithToken: jest.fn().mockResolvedValue(null)
}))

import Footer from './Footer'

describe('Footer', () => {
    it('renders a single Policies link to /policies', async () => {
        const ResolvedFooter = await Footer()
        render(ResolvedFooter)

        const policiesLink = screen.getByRole('link', { name: 'Policies' })
        expect(policiesLink).toHaveAttribute('href', '/policies')
    })

    it('does not render the deleted refund-policy or cancellation-policy links', async () => {
        const ResolvedFooter = await Footer()
        render(ResolvedFooter)

        const allLinks = screen.getAllByRole('link')
        const hrefs = allLinks.map((a) => a.getAttribute('href'))
        expect(hrefs).not.toContain('/refund-policy')
        expect(hrefs).not.toContain('/cancellation-policy')
    })

    it('does not render privacy-policy or terms-of-service links', async () => {
        const ResolvedFooter = await Footer()
        render(ResolvedFooter)

        const allLinks = screen.getAllByRole('link')
        const hrefs = allLinks.map((a) => a.getAttribute('href'))
        expect(hrefs).not.toContain('/privacy-policy')
        expect(hrefs).not.toContain('/terms-of-service')
    })
})
