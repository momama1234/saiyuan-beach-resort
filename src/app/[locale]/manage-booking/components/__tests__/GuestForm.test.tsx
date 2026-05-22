import { render, screen } from '@testing-library/react'

import type { PreCheckinBookingDetail, RoomGuestSlot,RoomGuestsState } from '../../types/manage-booking-types'
import { GuestForm } from '../GuestForm'

const mockRoomGuests: RoomGuestsState[] = [
    {
        bookingRoomId: 1,
        roomLabel: 'Room 101',
        roomClassName: 'Deluxe',
        occupancy: { numberOfAdults: 1, numberOfChildren: 0, numberOfInfants: 0 },
        guests: [
            {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                guestType: 'adult',
                isMainGuest: true
            }
        ]
    }
]

const mockBookingDetail: PreCheckinBookingDetail = {
    bookingId: 1,
    checkInDate: '2025-01-10',
    checkOutDate: '2025-01-12',
    bookingRooms: []
}

const defaultProps = {
    bookingDetail: mockBookingDetail,
    roomGuests: mockRoomGuests,
    isGuestExpanded: () => true,
    setGuestExpanded: jest.fn(),
    updateRoomGuest: jest.fn(),
    guestEstimatedArrival: '',
    onGuestEstimatedArrivalChange: jest.fn(),
    guestSpecialRequests: '',
    onGuestSpecialRequestsChange: jest.fn(),
    onSubmit: jest.fn(),
    isLoading: false,
    onOpenScanModal: jest.fn(),
    onBackToSearch: jest.fn(),
    isSubmitDisabled: true
}

describe('GuestForm', () => {
    it('renders loading state when bookingDetail is null', () => {
        render(<GuestForm {...defaultProps} bookingDetail={null} />)
        expect(screen.getByText('loadingBookingDetail')).toBeInTheDocument()
    })

    it('renders guest form content when bookingDetail is provided', () => {
        render(<GuestForm {...defaultProps} />)
        expect(screen.getByText(/Room 101/)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'backToSearch' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'submitGuest' })).toBeInTheDocument()
    })

    it('renders estimated arrival and special requests fields', () => {
        render(<GuestForm {...defaultProps} />)
        expect(screen.getByLabelText('estimatedArrival')).toBeInTheDocument()
        expect(screen.getByLabelText('specialRequests')).toBeInTheDocument()
    })
})
