import { fireEvent, render, screen, within } from '@testing-library/react'

import RoomFeaturesDialog from '../RoomFeaturesDialog'

const baseProps = {
    open: true,
    onOpenChange: jest.fn(),
    roomName: 'Premium Room',
    features: [
        {
            name: 'Sea view',
            isHighlighted: true,
            image: [{ id: 1, url: 'https://cdn.example.com/sea-view.svg', name: 'sea-view.svg' }]
        },
        {
            name: 'Free Wi-Fi',
            isHighlighted: false
        }
    ]
}

describe('RoomFeaturesDialog', () => {
    it('renders room feature icon with explicit width and height', () => {
        render(<RoomFeaturesDialog {...baseProps} />)

        const dialog = screen.getByRole('dialog')
        const icon = within(dialog).getByAltText('Sea view')
        expect(icon).toHaveAttribute('src', 'https://cdn.example.com/sea-view.svg')
        expect(icon).toHaveAttribute('width', '16')
        expect(icon).toHaveAttribute('height', '16')
    })

    it('closes when the close button is clicked', () => {
        const onOpenChange = jest.fn()
        render(<RoomFeaturesDialog {...baseProps} onOpenChange={onOpenChange} />)

        fireEvent.click(screen.getByRole('button', { name: /close room features/i }))
        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('renders nothing when closed', () => {
        render(<RoomFeaturesDialog {...baseProps} open={false} />)
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
})
