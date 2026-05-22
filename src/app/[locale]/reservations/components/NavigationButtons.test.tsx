import { PendingBookingStatus } from '@/shared/constants/pending-booking'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { useGuestInfoStore } from '@/features/reservation/stores/guest-info-store'
import { usePendingBookingStore } from '@/features/reservation/stores/pending-booking-store'
import { useReservationStore } from '@/features/reservation/stores/reservation-store'
import { useRoomAvailabilityStore } from '@/features/reservation/stores/room-availability-store'
import { useRoomSelectionStore } from '@/features/reservation/stores/room-selection-store'
import { useStepNavigationStore } from '@/features/reservation/stores/step-navigation-store'

import { cancelPendingBooking } from '../../../../features/reservation/api/pending-booking.api'
import { NavigationButtons } from './NavigationButtons'

jest.mock('next-intl', () => ({
    useTranslations: () => {
        const translate = (key: string) => key
        translate.rich = (key: string) => key
        return translate
    },
    useLocale: () => 'en'
}))

jest.mock('../../../../features/reservation/api/pending-booking.api', () => ({
    cancelPendingBooking: jest.fn().mockResolvedValue(undefined)
}))

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        back: jest.fn(),
        push: jest.fn()
    })
}))

const mockCancelPendingBooking = cancelPendingBooking as jest.MockedFunction<typeof cancelPendingBooking>

describe('NavigationButtons', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useStepNavigationStore.setState({ currentStep: 2 })
        useGuestInfoStore.setState({ isGuestInfoValid: true })
        useRoomSelectionStore.setState({
            selectedRooms: { 1: 1 },
            selectedRoomsByPlan: {},
            roomClasses: []
        })
        usePendingBookingStore.setState({
            pendingBookingIds: ['pending-1'],
            pendingBookingData: [
                {
                    id: 'pending-1',
                    roomClassId: 1,
                    propertyId: 1,
                    ratePlanId: 10,
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
        useRoomAvailabilityStore.setState({ isLoading: false })
        useReservationStore.setState({ isSubmitting: false, error: null, lastBookingId: null })
    })

    it('opens a back confirmation dialog on step 2 before returning to room selection', () => {
        render(<NavigationButtons />)

        fireEvent.click(screen.getByRole('button', { name: 'back' }))

        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText('backConfirmDialog.title')).toBeInTheDocument()
        expect(screen.getByText('backConfirmDialog.description')).toBeInTheDocument()
    })

    it('disables the back button on step 1', () => {
        useStepNavigationStore.setState({ currentStep: 1 })
        render(<NavigationButtons />)

        expect(screen.getByRole('button', { name: 'back' })).toBeDisabled()
    })

    it('confirms back navigation from the dialog', async () => {
        render(<NavigationButtons />)

        fireEvent.click(screen.getByRole('button', { name: 'back' }))
        fireEvent.click(screen.getByRole('checkbox'))
        fireEvent.click(screen.getByRole('button', { name: 'backConfirmDialog.continueButton' }))

        await waitFor(() => {
            expect(mockCancelPendingBooking).toHaveBeenCalledTimes(1)
            expect(mockCancelPendingBooking).toHaveBeenCalledWith('pending-1')
            expect(useStepNavigationStore.getState().currentStep).toBe(1)
            expect(usePendingBookingStore.getState().pendingBookingIds).toEqual([])
            expect(usePendingBookingStore.getState().isLocked).toBe(false)
            expect(useRoomSelectionStore.getState().selectedRooms).toEqual({ 1: 1 })
        })
    })
})
