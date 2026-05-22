import { render, screen } from '@testing-library/react'

import RoomContent from './RoomContent'

const baseProps = {
    title: 'Deluxe Room',
    description: 'Sea-view',
    features: [{ text: 'Wi-Fi' }, { text: 'Minibar' }],
    details: [{ label: 'Beds', value: '1 King' }]
}

describe('RoomContent', () => {
    it('renders title and description', () => {
        render(<RoomContent {...baseProps} />)

        expect(screen.getByRole('heading', { level: 1, name: 'Deluxe Room' })).toBeInTheDocument()
        expect(screen.getByText('Sea-view')).toBeInTheDocument()
    })

    it('renders all features', () => {
        render(<RoomContent {...baseProps} />)

        expect(screen.getByText('Wi-Fi')).toBeInTheDocument()
        expect(screen.getByText('Minibar')).toBeInTheDocument()
    })

    it('renders all details', () => {
        render(<RoomContent {...baseProps} />)

        expect(screen.getByText(/Beds/)).toBeInTheDocument()
        expect(screen.getByText(/1 King/)).toBeInTheDocument()
    })

    it('renders note when provided', () => {
        render(<RoomContent {...baseProps} note="Free breakfast included" />)

        expect(screen.getByText('Free breakfast included')).toBeInTheDocument()
    })

    it('renders price when provided', () => {
        render(<RoomContent {...baseProps} price="From $200/night" />)

        expect(screen.getByText('From $200/night')).toBeInTheDocument()
    })

    it('does not render price/note section when neither is provided', () => {
        render(<RoomContent {...baseProps} />)

        expect(screen.queryByText(/From \$/)).not.toBeInTheDocument()
    })
})
