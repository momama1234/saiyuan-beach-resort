import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useLocale } from 'next-intl'

import { useRouter } from '@/i18n/routing'

import LanguageSwitcher from './LanguageSwitcher'

// Mock next-intl
jest.mock('next-intl', () => ({
    useLocale: jest.fn(() => 'en')
}))

// Mock @/i18n/routing to get a controllable useRouter jest.fn
jest.mock('@/i18n/routing', () => ({
    Link: () => null,
    redirect: jest.fn(),
    usePathname: jest.fn(() => '/'),
    useRouter: jest.fn(() => ({ replace: jest.fn(), push: jest.fn() }))
}))

// Mock tooltip components to avoid portal issues in tests
jest.mock('@/components/ui/tooltip', () => ({
    Tooltip: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip">{children}</div>,
    TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="tooltip-trigger">{children}</div>
    ),
    TooltipContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-content">{children}</div>
}))

const mockFetch = jest.fn()
global.fetch = mockFetch

beforeEach(() => {
    ;(useLocale as jest.Mock).mockReturnValue('en')
    ;(useRouter as jest.Mock).mockReturnValue({ replace: jest.fn(), push: jest.fn() })
    mockFetch.mockResolvedValue({
        json: () =>
            Promise.resolve([
                { code: 'en', nativeName: 'English', flag: '🇺🇸' },
                { code: 'th', nativeName: 'ไทย', flag: '🇹🇭' }
            ])
    })
})

afterEach(() => {
    jest.clearAllMocks()
})

describe('LanguageSwitcher', () => {
    it('should render the current language button', async () => {
        render(<LanguageSwitcher />)

        await waitFor(() => {
            expect(screen.getByRole('combobox')).toBeInTheDocument()
        })
    })

    it('should display English when locale is en', async () => {
        render(<LanguageSwitcher />)

        await waitFor(() => {
            expect(screen.getByText('🇺🇸')).toBeInTheDocument()
            expect(screen.getByText('English')).toBeInTheDocument()
        })
    })

    it('should display Thai when locale is th', async () => {
        ;(useLocale as jest.Mock).mockReturnValue('th')

        render(<LanguageSwitcher />)

        await waitFor(() => {
            expect(screen.getByText('🇹🇭')).toBeInTheDocument()
            expect(screen.getByText('ไทย')).toBeInTheDocument()
        })
    })

    it('should open dropdown on click when multiple languages supported', async () => {
        render(<LanguageSwitcher />)

        await waitFor(() => {
            expect(screen.getByRole('combobox')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByRole('combobox'))

        expect(screen.getByText('ไทย')).toBeInTheDocument()
    })

    it('should call router.replace when a different language is selected', async () => {
        const replaceMock = jest.fn()
        ;(useRouter as jest.Mock).mockReturnValue({ replace: replaceMock, push: jest.fn() })

        render(<LanguageSwitcher />)

        await waitFor(() => {
            expect(screen.getByRole('combobox')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByRole('combobox'))
        fireEvent.click(screen.getByText('ไทย'))

        expect(replaceMock).toHaveBeenCalledWith('/', { locale: 'th' })
    })

    it('should not show combobox when only one language is supported', async () => {
        mockFetch.mockResolvedValue({
            json: () => Promise.resolve([{ code: 'en', nativeName: 'English', flag: '🇺🇸' }])
        })

        render(<LanguageSwitcher />)

        await waitFor(() => {
            expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
        })
    })

    it('should apply custom className', () => {
        const { container } = render(<LanguageSwitcher className="custom-class" />)

        const wrapper = container.querySelector('.custom-class')
        expect(wrapper).toBeInTheDocument()
    })
})
