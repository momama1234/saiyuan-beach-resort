// api.ts uses 'use server' — mock before store imports
jest.mock('../../../../../lib/api', () => ({
    getDataWithToken: jest.fn(),
}))

import { fireEvent, render, screen, within } from '@testing-library/react'
import React from 'react'

import { useBookingDetailsStore } from '@/features/reservation/stores/booking-details-store'

jest.mock('next-intl', () => ({
    useTranslations: () => {
        const t = (key: string) => {
            const map: Record<string, string> = {
                bookingDetails: 'Booking Details',
                updatePrices: 'Update Prices',
                updating: 'Updating...',
                adults: 'Adults',
                children: 'Children',
                child: 'Child',
                guest: 'Guest',
                guests: 'Guests',
                selectDates: 'Select dates',
                checkInDate: 'Check-in Date',
                checkOutDate: 'Check-out Date',
                checkIn: 'Check-in',
                checkOut: 'Check-out',
                dateChangedNotice: 'Dates changed.',
                close: 'Close',
            }
            return map[key] ?? key
        }
        return t
    }
}))

jest.mock('@/features/reservation/hooks/useBookingDetailsUpdate', () => ({
    useBookingDetailsUpdate: () => jest.fn().mockResolvedValue(undefined)
}))

jest.mock('@/features/reservation/stores/room-availability-store', () => ({
    useRoomAvailabilityActions: () => ({ fetchAvailableRooms: jest.fn() })
}))

jest.mock('@/features/reservation/hooks/useReservationSessionReset', () => ({
    useReservationSessionReset: () => ({ resetReservationSession: jest.fn() })
}))

import { BookingSummary } from '../BookingSummary'

const defaultTempDetails = {
    checkInDate: '',
    checkOutDate: '',
    adults: '2',
    children: '0',
    infants: '0'
}

describe('BookingSummary mobile summary row', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useBookingDetailsStore.setState({
            tempBookingDetails: defaultTempDetails,
            bookingDetails: defaultTempDetails
        })
    })

    it('shows "—" in check-in and check-out triggers when no dates selected', () => {
        render(<BookingSummary />)
        expect(screen.getByTestId('mobile-checkin-trigger')).toHaveTextContent('—')
        expect(screen.getByTestId('mobile-checkout-trigger')).toHaveTextContent('—')
    })

    it('shows "2 Guests" in guest trigger when no children', () => {
        render(<BookingSummary />)
        const guestTrigger = screen.getByTestId('mobile-guest-trigger')
        expect(guestTrigger).toHaveTextContent('2 Guests')
        expect(guestTrigger).not.toHaveTextContent('Child')
    })

    it('shows formatted date in check-in and check-out triggers when dates are set', () => {
        useBookingDetailsStore.setState({
            tempBookingDetails: {
                ...defaultTempDetails,
                checkInDate: '2026-06-01',
                checkOutDate: '2026-06-02'
            },
            bookingDetails: defaultTempDetails
        })
        render(<BookingSummary />)
        expect(screen.getByTestId('mobile-checkin-trigger').textContent).toContain('Jun 01')
        expect(screen.getByTestId('mobile-checkout-trigger').textContent).toContain('Jun 02')
    })

    it('shows "3 Guests" in guest trigger when children = 1', () => {
        useBookingDetailsStore.setState({
            tempBookingDetails: { ...defaultTempDetails, children: '1' },
            bookingDetails: defaultTempDetails
        })
        render(<BookingSummary />)
        const guestTrigger = screen.getByTestId('mobile-guest-trigger')
        expect(guestTrigger.textContent).toContain('3 Guests')
    })

    it('shows "5 Guests" in guest trigger when children = 3', () => {
        useBookingDetailsStore.setState({
            tempBookingDetails: { ...defaultTempDetails, children: '3' },
            bookingDetails: defaultTempDetails
        })
        render(<BookingSummary />)
        const guestTrigger = screen.getByTestId('mobile-guest-trigger')
        expect(guestTrigger.textContent).toContain('5 Guests')
    })

    it('opens date drawer when check-in trigger is clicked', () => {
        render(<BookingSummary />)
        fireEvent.click(screen.getByTestId('mobile-checkin-trigger'))
        expect(screen.getByText('Check-in / Check-out')).toBeInTheDocument()
    })

    it('opens guest drawer when guest trigger is clicked', () => {
        render(<BookingSummary />)
        fireEvent.click(screen.getByTestId('mobile-guest-trigger'))
        expect(screen.getByText('Adults / Children')).toBeInTheDocument()
    })
})

describe('BookingSummary mobile drawer Update Prices button guard', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('disables date drawer Update Prices button when no changes', () => {
        useBookingDetailsStore.setState({
            tempBookingDetails: defaultTempDetails,
            bookingDetails: defaultTempDetails
        })
        render(<BookingSummary />)
        fireEvent.click(screen.getByTestId('mobile-checkin-trigger'))
        const drawer = screen.getByRole('dialog')
        expect(within(drawer).getByText('Update Prices').closest('button')).toBeDisabled()
    })

    it('enables date drawer Update Prices button when dates changed', () => {
        useBookingDetailsStore.setState({
            tempBookingDetails: { ...defaultTempDetails, checkInDate: '2026-06-01', checkOutDate: '2026-06-02' },
            bookingDetails: defaultTempDetails
        })
        render(<BookingSummary />)
        fireEvent.click(screen.getByTestId('mobile-checkin-trigger'))
        const drawer = screen.getByRole('dialog')
        expect(within(drawer).getByText('Update Prices').closest('button')).not.toBeDisabled()
    })

    it('disables guest drawer Update Prices button when no changes', () => {
        useBookingDetailsStore.setState({
            tempBookingDetails: defaultTempDetails,
            bookingDetails: defaultTempDetails
        })
        render(<BookingSummary />)
        fireEvent.click(screen.getByTestId('mobile-guest-trigger'))
        const drawer = screen.getByRole('dialog')
        expect(within(drawer).getByText('Update Prices').closest('button')).toBeDisabled()
    })

    it('enables guest drawer Update Prices button when guest count changed', () => {
        useBookingDetailsStore.setState({
            tempBookingDetails: { ...defaultTempDetails, adults: '3' },
            bookingDetails: defaultTempDetails
        })
        render(<BookingSummary />)
        fireEvent.click(screen.getByTestId('mobile-guest-trigger'))
        const drawer = screen.getByRole('dialog')
        expect(within(drawer).getByText('Update Prices').closest('button')).not.toBeDisabled()
    })
})
