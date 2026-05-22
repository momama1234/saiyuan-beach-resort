import { render, screen } from '@testing-library/react'

import { LosPreviewCard } from '../LosPreviewCard'

const ratePlan = {
    id: 1,
    name: 'Standard Rate',
    description: 'Standard',
    isDefault: true,
    features: [
        {
            id: 10,
            label: 'Breakfast included',
            image: [{ id: 101, url: 'https://cdn.example.com/breakfast.svg', name: 'breakfast.svg' }]
        },
        {
            id: 11,
            label: 'Free cancellation'
        }
    ],
    occupancyOptions: [{ id: 201, occupancy: 2, rate: 3000, isDefault: true }],
    discountRules: undefined
}

const occupancyOption = ratePlan.occupancyOptions[0]!

const baseProps = {
    ratePlan,
    previewNights: 3,
    occupancyOption,
    checkIn: new Date('2026-05-15'),
    onConfirm: jest.fn().mockResolvedValue(undefined),
    onClose: jest.fn()
}

describe('LosPreviewCard', () => {
    it('renders LOS feature icon with explicit width and height', () => {
        render(<LosPreviewCard {...baseProps} />)

        const icon = screen.getByAltText('Breakfast included')
        expect(icon).toHaveAttribute('src', 'https://cdn.example.com/breakfast.svg')
        expect(icon).toHaveAttribute('width', '14')
        expect(icon).toHaveAttribute('height', '14')
    })

    it('falls back to checkmark icon when no image url', () => {
        render(<LosPreviewCard {...baseProps} />)
        expect(screen.getByText('Free cancellation')).toBeInTheDocument()
    })
})
