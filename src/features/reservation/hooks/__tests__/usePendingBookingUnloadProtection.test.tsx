import { PendingBookingStatus } from '@/shared/constants/pending-booking'
import { act, renderHook } from '@testing-library/react'

import { usePendingBookingStore } from '@/features/reservation/stores/pending-booking-store'

import { cancelPendingBookingsBySessionKeepalive } from '../../api/pending-booking.api'
import { usePendingBookingUnloadProtection } from '../usePendingBookingUnloadProtection'

jest.mock('../../api/pending-booking.api', () => ({
    cancelPendingBookingsBySessionKeepalive: jest.fn()
}))

const mockCancelPendingBookingsBySessionKeepalive =
    cancelPendingBookingsBySessionKeepalive as jest.MockedFunction<typeof cancelPendingBookingsBySessionKeepalive>

describe('usePendingBookingUnloadProtection', () => {
    beforeEach(() => {
        jest.clearAllMocks()

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
            isLocked: true,
            sessionId: 'session-123'
        })
    })

    it('prompts before unload while a pending booking lock exists', () => {
        renderHook(() => usePendingBookingUnloadProtection())

        const event = new Event('beforeunload', { cancelable: true }) as BeforeUnloadEvent
        Object.defineProperty(event, 'returnValue', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: undefined
        })

        act(() => {
            window.dispatchEvent(event)
        })

        expect(event.defaultPrevented).toBe(true)
        expect(event.returnValue).toBe('')
    })

    it('releases pending booking locks on pagehide and clears persisted lock state', () => {
        renderHook(() => usePendingBookingUnloadProtection())

        act(() => {
            window.dispatchEvent(new Event('pagehide'))
        })

        expect(mockCancelPendingBookingsBySessionKeepalive).toHaveBeenCalledTimes(1)
        expect(mockCancelPendingBookingsBySessionKeepalive).toHaveBeenCalledWith('session-123')
        expect(usePendingBookingStore.getState().pendingBookingIds).toEqual([])
        expect(usePendingBookingStore.getState().pendingBookingData).toEqual([])
        expect(usePendingBookingStore.getState().isLocked).toBe(false)
        expect(usePendingBookingStore.getState().sessionId).toBeNull()
    })
})
