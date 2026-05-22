import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import MenuLink from '../MenuLink'

jest.mock('@/i18n/routing', () => ({
    Link: ({ children, href, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    )
}))

const mockMessages = {}

const renderMenuLink = (props: any) => {
    return render(
        <NextIntlClientProvider locale="en" messages={mockMessages}>
            <MenuLink {...props} />
        </NextIntlClientProvider>
    )
}

describe('MenuLink', () => {
    it('renders text correctly', () => {
        renderMenuLink({ text: 'Test Menu Item' })

        expect(screen.getByText('Test Menu Item')).toBeInTheDocument()
    })

    it('renders as link when href is provided', () => {
        renderMenuLink({ text: 'Home', href: '/' })

        const link = screen.getByRole('link')
        expect(link).toHaveAttribute('href', '/')
    })

    it('shows submenu toggle in mobile when items are provided', () => {
        renderMenuLink({
            text: 'Menu with Items',
            items: ['Item 1', 'Item 2'],
            isMobile: true
        })

        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('toggles submenu when mobile toggle is clicked', () => {
        renderMenuLink({
            text: 'Menu with Items',
            items: ['Item 1', 'Item 2'],
            isMobile: true
        })

        const toggleButton = screen.getByRole('button')
        fireEvent.click(toggleButton)

        // Should show minus icon when expanded
        expect(document.querySelector('.lucide-minus')).toBeInTheDocument()
    })

    it('applies mobile styling when isMobile is true', () => {
        const { container } = renderMenuLink({
            text: 'Mobile Menu Item',
            isMobile: true
        })

        expect(container.firstChild).toHaveClass('border-b', 'border-white/10', 'pb-2')
    })

    it('applies desktop styling when isMobile is false', () => {
        const { container } = renderMenuLink({
            text: 'Desktop Menu Item',
            isMobile: false
        })

        expect(container.firstChild).toHaveClass('flex', 'items-center')
    })

    it('shows separator line when not last item in desktop', () => {
        const { container } = renderMenuLink({
            text: 'Menu Item',
            isMobile: false,
            isLast: false
        })

        const element = container.firstChild as HTMLElement
        expect(element.className).toContain("after:content-['']")
    })

    it('does not show separator line when last item in desktop', () => {
        const { container } = renderMenuLink({
            text: 'Last Menu Item',
            isMobile: false,
            isLast: true
        })

        const element = container.firstChild as HTMLElement
        expect(element.className).not.toContain("after:content-['']")
    })

    it('renders hotel villas submenu when isHotelVillas is true', () => {
        const mockRoomClasses = [
            {
                id: '1',
                name: 'Deluxe Room',
                slug: 'deluxe-room',
                description: 'Luxury room',
                images: [],
                amenities: [],
                maxOccupancy: 2,
                basePrice: 1000
            }
        ]

        renderMenuLink({
            text: 'Hotel Villas',
            isHotelVillas: true,
            roomClasses: mockRoomClasses
        })

        expect(screen.getByText('Hotel Villas')).toBeInTheDocument()
    })

    it('handles both link and submenu in mobile', () => {
        renderMenuLink({
            text: 'Menu Item',
            href: '/test',
            items: ['Item 1'],
            isMobile: true
        })

        expect(screen.getByRole('link')).toHaveAttribute('href', '/test')
        expect(screen.getByRole('button')).toBeInTheDocument()
    })
})
