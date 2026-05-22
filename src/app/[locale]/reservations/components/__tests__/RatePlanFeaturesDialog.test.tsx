import { fireEvent, render, screen, within } from '@testing-library/react'

import RatePlanFeaturesDialog from '../RatePlanFeaturesDialog'

const baseProps = {
    open: true,
    onOpenChange: jest.fn(),
    ratePlanName: 'Standard Rate',
    features: [
        {
            id: 1,
            label: 'Breakfast included',
            image: [{ id: 101, url: 'https://cdn.example.com/breakfast.svg', name: 'breakfast.svg' }]
        },
        {
            id: 2,
            label: 'Free cancellation'
        }
    ]
}

describe('RatePlanFeaturesDialog', () => {
    it('renders rate plan feature icon with explicit width and height', () => {
        render(<RatePlanFeaturesDialog {...baseProps} />)

        const dialog = screen.getByRole('dialog')
        const icon = within(dialog).getByAltText('Breakfast included')
        expect(icon).toHaveAttribute('src', 'https://cdn.example.com/breakfast.svg')
        expect(icon).toHaveAttribute('width', '16')
        expect(icon).toHaveAttribute('height', '16')
    })

    it('closes when the close button is clicked', () => {
        const onOpenChange = jest.fn()
        render(<RatePlanFeaturesDialog {...baseProps} onOpenChange={onOpenChange} />)

        fireEvent.click(screen.getByRole('button', { name: /close rate plan features/i }))
        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('renders nothing when closed', () => {
        render(<RatePlanFeaturesDialog {...baseProps} open={false} />)
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
})
