import { fireEvent, render, screen } from '@testing-library/react'

import type { PreCheckinBookingItem } from '../../types/manage-booking-types'
import { BookingDetails } from '../BookingDetails'

const mockBooking: PreCheckinBookingItem = {
    id: 1,
    guestFirstName: 'Emily',
    guestLastName: 'Davis',
    guestEmail: 'emily@example.com',
    checkInDate: '2025-01-10',
    checkOutDate: '2025-01-12',
    roomClass: { name: 'Deluxe' }
}

describe('BookingDetails', () => {
    it('renders guest name and dates when provided', () => {
        render(<BookingDetails booking={mockBooking} />)

        expect(screen.getByText('Emily Davis')).toBeInTheDocument()
        expect(screen.getByText('2025-01-10 – 2025-01-12 · Deluxe')).toBeInTheDocument()
    })

    it('renders Booking #id when name is missing', () => {
        const bookingWithoutName: PreCheckinBookingItem = {
            ...mockBooking,
            guestFirstName: undefined,
            guestLastName: undefined
        }
        render(<BookingDetails booking={bookingWithoutName} />)

        expect(screen.getByText('Booking #1')).toBeInTheDocument()
    })

    it('renders as button when asButton is true and calls onClick when clicked', () => {
        const handleClick = jest.fn()
        render(
            <BookingDetails
                booking={mockBooking}
                asButton
                onClick={handleClick}
            />
        )

        const button = screen.getByRole('button', { name: /select booking 1/i })
        expect(button).toBeInTheDocument()
        fireEvent.click(button)
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('applies custom className', () => {
        const { container } = render(<BookingDetails booking={mockBooking} className="custom-class" />)
        const wrapper = container.querySelector('.custom-class')
        expect(wrapper).toBeInTheDocument()
    })
})
