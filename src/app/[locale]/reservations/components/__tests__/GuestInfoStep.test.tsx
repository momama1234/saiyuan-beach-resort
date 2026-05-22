import { PendingBookingStatus } from '@/shared/constants/pending-booking'
import { render, screen,waitFor } from '@testing-library/react'

import { useBookingDetailsStore } from '@/features/reservation/stores/booking-details-store'
import { usePendingBookingStore } from '@/features/reservation/stores/pending-booking-store'
import { useRoomSelectionStore } from '@/features/reservation/stores/room-selection-store'
import type { AvailableRoomClass } from '@/types/room-management'

import { GuestInfoStep } from '../GuestInfoStep'

jest.mock('next-intl', () => ({
    useTranslations: () => {
        const translate = (key: string) => key
        translate.rich = (key: string) => key
        return translate
    }
}))

jest.mock('../../../../../features/reservation/utils/pending-booking-session', () => ({
    cancelPendingBookings: jest.fn().mockResolvedValue(undefined)
}))

jest.mock('../../../../../features/reservation/hooks/usePendingBooking', () => ({
    usePendingBooking: () => ({
        pendingBooking: null,
        timeRemaining: 0,
        isExpired: true,
        isLoading: false,
        error: null,
        refresh: jest.fn(),
        cancel: jest.fn()
    })
}))

jest.mock('../../../../../features/reservation/hooks/useSelectedRoomsPricing', () => ({
    useSelectedRoomsPricing: () => ({
        rooms: [],
        grandTotal: 0,
        totalRooms: 1
    })
}))

jest.mock('../BookingReviewCard', () => ({
    BookingReviewCard: () => <div data-testid="booking-review-card" />
}))

jest.mock('../GuestInfoForm', () => ({
    GuestInfoForm: () => <div data-testid="guest-info-form" />
}))

import { cancelPendingBookings } from '../../../../../features/reservation/utils/pending-booking-session'

const mockCancelPendingBookings = cancelPendingBookings as jest.MockedFunction<typeof cancelPendingBookings>

describe('GuestInfoStep', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        const roomClass = {
            id: 17,
            propertyId: 3,
            name: 'Anda Premium Room',
            basePrice: '6500',
            images: [],
            numberOfRooms: 1,
            availableRooms: 1
        } satisfies AvailableRoomClass

        useBookingDetailsStore.getState().actions.initialize({
            initialBookingDetails: {
                checkInDate: '2026-04-04',
                checkOutDate: '2026-04-05',
                adults: '2',
                children: '0',
                infants: '0'
            },
            vatRate: 7,
            isIncludeVat: true,
            isDepositEnabled: false,
            depositType: 0
        })

        useRoomSelectionStore.setState({
            selectedRooms: { 17: 1 },
            selectedRoomsByPlan: {
                17: {
                    301: {
                        quantity: 1
                    }
                }
            },
            roomClasses: [roomClass]
        })

        usePendingBookingStore.setState({
            pendingBookingIds: ['pending-1'],
            pendingBookingData: [
                {
                    id: 'pending-1',
                    roomClassId: 17,
                    propertyId: 3,
                    ratePlanId: 301,
                    checkInDate: '2026-04-04',
                    checkOutDate: '2026-04-05',
                    adultCount: 2,
                    childCount: 0,
                    infantCount: 0,
                    status: PendingBookingStatus.PENDING,
                    lockedAt: '2026-04-04T00:00:00.000Z',
                    expiresAt: '2026-04-04T00:10:00.000Z',
                    timeRemaining: 600000,
                    createdAt: '2026-04-04T00:00:00.000Z',
                    updatedAt: '2026-04-04T00:00:00.000Z'
                }
            ],
            isLocked: true
        })
    })

    it('cancels expired pending bookings through the shared helper and shows the alert', async () => {
        render(
            <GuestInfoStep
                isDepositEnabled={false}
                checkInTime="14:00"
                checkOutTime="12:00"
                policyCancellationNoticeDays={7}
            />
        )

        await waitFor(() => {
            expect(mockCancelPendingBookings).toHaveBeenCalledTimes(1)
            expect(mockCancelPendingBookings).toHaveBeenCalledWith(['pending-1'])
            expect(screen.getByRole('alertdialog')).toBeInTheDocument()
        })
    })
})
