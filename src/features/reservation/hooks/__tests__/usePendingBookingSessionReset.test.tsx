import { PendingBookingStatus } from '@/shared/constants/pending-booking'
import { act, renderHook } from '@testing-library/react'

import { usePendingBookingStore } from '@/features/reservation/stores/pending-booking-store'
import { useRoomSelectionStore } from '@/features/reservation/stores/room-selection-store'
import { useStepNavigationStore } from '@/features/reservation/stores/step-navigation-store'

import { cancelPendingBooking } from '../../api/pending-booking.api'
import { usePendingBookingSessionReset } from '../usePendingBookingSessionReset'

jest.mock('../../api/pending-booking.api', () => ({
    cancelPendingBooking: jest.fn().mockResolvedValue(undefined)
}))

const mockCancelPendingBooking = cancelPendingBooking as jest.MockedFunction<typeof cancelPendingBooking>

describe('usePendingBookingSessionReset', () => {
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

        useStepNavigationStore.setState({
            currentStep: 3
        })
    })

    it('cancels pending bookings and returns the flow to step 1 without clearing selections', async () => {
        const { result } = renderHook(() => usePendingBookingSessionReset())

        await act(async () => {
            await result.current.resetPendingBookingSession()
        })

        expect(mockCancelPendingBooking).toHaveBeenCalledTimes(2)
        expect(mockCancelPendingBooking).toHaveBeenNthCalledWith(1, 'pending-1')
        expect(mockCancelPendingBooking).toHaveBeenNthCalledWith(2, 'pending-2')
        expect(usePendingBookingStore.getState().pendingBookingIds).toEqual([])
        expect(usePendingBookingStore.getState().pendingBookingData).toEqual([])
        expect(usePendingBookingStore.getState().isLocked).toBe(false)
        expect(useStepNavigationStore.getState().currentStep).toBe(1)
        expect(useRoomSelectionStore.getState().selectedRooms).toEqual({ 17: 1 })
        expect(useRoomSelectionStore.getState().selectedRoomsByPlan).toEqual({
            17: {
                301: {
                    quantity: 1
                }
            }
        })
    })
})
