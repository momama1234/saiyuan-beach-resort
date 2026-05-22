import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { LosUpsellBanner } from './LosUpsellBanner'

const baseProps = {
    losDiscounts: [{ minNights: 3, discountPercent: 10 }],
    currentNights: 1,
    pricePerNight: 1000,
    onPreview: jest.fn(),
}

describe('LosUpsellBanner', () => {
    it('renders a wrapper div when a next tier exists', () => {
        const { container } = render(<LosUpsellBanner {...baseProps} />)
        const wrapper = container.firstElementChild
        expect(wrapper).not.toBeNull()
        expect(wrapper?.tagName).toBe('DIV')
    })

    it('renders nothing when no next tier exists', () => {
        const { container } = render(
            <LosUpsellBanner
                {...baseProps}
                currentNights={10}
            />
        )
        expect(container.firstElementChild).toBeNull()
    })

    it('shows banner content when a next tier exists', () => {
        render(<LosUpsellBanner {...baseProps} />)
        expect(screen.getByText(/Stay 2 more nights to save/)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Extend to 3 nights/i })).toBeInTheDocument()
    })

    it('shows no banner content when no next tier exists', () => {
        render(<LosUpsellBanner {...baseProps} currentNights={10} />)
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('calls onPreview when Extend button is clicked', async () => {
        const onPreview = jest.fn()
        render(<LosUpsellBanner {...baseProps} onPreview={onPreview} />)
        await userEvent.click(screen.getByRole('button', { name: /Extend to 3 nights/i }))
        expect(onPreview).toHaveBeenCalledTimes(1)
    })
})
