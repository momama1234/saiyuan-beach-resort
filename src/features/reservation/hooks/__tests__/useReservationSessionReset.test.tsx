import { act,renderHook } from '@testing-library/react'

import { usePendingBookingStore } from '@/features/reservation/stores/pending-booking-store'
import { useRoomSelectionStore } from '@/features/reservation/stores/room-selection-store'
import { useStepNavigationStore } from '@/features/reservation/stores/step-navigation-store'

import { cancelPendingBooking } from '../../api/pending-booking.api'
import { useReservationSessionReset } from '../useReservationSessionReset'

jest.mock('../../api/pending-booking.api', () => ({
    cancelPendingBooking: jest.fn().mockResolvedValue(undefined)
}))

const mockCancelPendingBooking = cancelPendingBooking as jest.MockedFunction<typeof cancelPendingBooking>

describe('useReservationSessionReset', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        useRoomSelectionStore.setState({
            selectedRooms: { 17: 1 },
            selectedRoomsByPlan: {
                17: {
                    301: {
                        quantity: 1
                    }
                }
            },
            roomClasses: []
        })

        usePendingBookingStore.setState({
            pendingBookingIds: ['pending-1', 'pending-2'],
            pendingBookingData: [],
            isLocked: true
        })

        useStepNavigationStore.setState({
            currentStep: 3
        })
    })

    it('cancels pending bookings and clears reservation state', async () => {
        const { result } = renderHook(() => useReservationSessionReset())

        await act(async () => {
            await result.current.resetReservationSession()
        })

        expect(mockCancelPendingBooking).toHaveBeenCalledTimes(2)
        expect(mockCancelPendingBooking).toHaveBeenNthCalledWith(1, 'pending-1')
        expect(mockCancelPendingBooking).toHaveBeenNthCalledWith(2, 'pending-2')
        expect(useRoomSelectionStore.getState().selectedRooms).toEqual({})
        expect(useRoomSelectionStore.getState().selectedRoomsByPlan).toEqual({})
        expect(usePendingBookingStore.getState().pendingBookingIds).toEqual([])
        expect(usePendingBookingStore.getState().isLocked).toBe(false)
        expect(useStepNavigationStore.getState().currentStep).toBe(1)
    })
})
