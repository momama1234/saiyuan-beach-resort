import { act, renderHook } from '@testing-library/react'

import { createBulkPendingBookings } from '@/features/reservation/api/pending-booking.api'
import { useRoomAvailabilityStore } from '@/features/reservation/stores/room-availability-store'
import { useRoomSelectionStore } from '@/features/reservation/stores/room-selection-store'
import { useStepNavigationStore } from '@/features/reservation/stores/step-navigation-store'

import { useReservationNavigation } from '../useReservationNavigation'

const mockBack = jest.fn()
const mockResetReservationSession = jest.fn().mockResolvedValue(undefined)
const mockCreateBulkPendingBookings = createBulkPendingBookings as jest.MockedFunction<typeof createBulkPendingBookings>

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        back: mockBack,
        push: jest.fn()
    })
}))

jest.mock('next-intl', () => ({
    useLocale: () => 'en'
}))

jest.mock('../useReservationSessionReset', () => ({
    useReservationSessionReset: () => ({
        resetReservationSession: mockResetReservationSession
    })
}))

jest.mock('@/features/reservation/api/pending-booking.api', () => ({
    createBulkPendingBookings: jest.fn()
}))

const makeRoomClass = (id: number, name: string, availableRooms: number) => ({
    id,
    propertyId: 1,
    name,
    basePrice: '0',
    availableRooms,
    images: []
})

describe('useReservationNavigation', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useStepNavigationStore.setState({ currentStep: 1 })
        useRoomSelectionStore.setState({
            selectedRooms: {},
            selectedRoomsByPlan: {},
            roomClasses: []
        })
        useRoomAvailabilityStore.setState({
            roomClasses: [],
            soldOutRoomClasses: [],
            isLoading: false,
            error: null
        })
    })

    it('resets the reservation session before leaving from step 1', async () => {
        const { result } = renderHook(() => useReservationNavigation())

        await act(async () => {
            await result.current.handleBack()
        })

        expect(mockResetReservationSession).toHaveBeenCalledTimes(1)
        expect(mockBack).toHaveBeenCalledTimes(1)
    })

    it('moves back to step 1 when backing from step 2 without resetting the session', async () => {
        useStepNavigationStore.setState({ currentStep: 2 })

        const { result } = renderHook(() => useReservationNavigation())

        await act(async () => {
            await result.current.handleBack()
        })

        expect(mockResetReservationSession).not.toHaveBeenCalled()
        expect(mockBack).not.toHaveBeenCalled()
        expect(useStepNavigationStore.getState().currentStep).toBe(1)
    })

    describe('handleNext on step 1 — availability check', () => {
        const roomClass = makeRoomClass(42, 'Anda Deluxe Room', 2)

        beforeEach(() => {
            // User has selected 1 room of roomClass 42
            useRoomSelectionStore.setState({
                selectedRooms: { 42: 1 },
                selectedRoomsByPlan: { 42: { 10: { quantity: 1 } } },
                roomClasses: [roomClass]
            })
            mockCreateBulkPendingBookings.mockResolvedValue([])
        })

        it('proceeds to step 2 when refreshed data shows the room is available', async () => {
            // refreshAvailability will update store with fresh room class that still has rooms
            useRoomAvailabilityStore.setState({
                roomClasses: [makeRoomClass(42, 'Anda Deluxe Room', 2)],
                soldOutRoomClasses: [],
                isLoading: false,
                error: null
            })

            // Mock refreshAvailability to return the available room
            jest.spyOn(useRoomAvailabilityStore.getState().actions, 'refreshAvailability')
                .mockResolvedValue([makeRoomClass(42, 'Anda Deluxe Room', 2)])

            const { result } = renderHook(() => useReservationNavigation())

            await act(async () => {
                await result.current.handleNext()
            })

            expect(mockCreateBulkPendingBookings).toHaveBeenCalledTimes(1)
            expect(useStepNavigationStore.getState().currentStep).toBe(2)
        })

        it('calls onReservationError and does NOT proceed when room is sold out', async () => {
            jest.spyOn(useRoomAvailabilityStore.getState().actions, 'refreshAvailability')
                .mockResolvedValue([]) // room class 42 not in available list = sold out

            const onReservationError = jest.fn()
            const { result } = renderHook(() => useReservationNavigation({ onReservationError }))

            await act(async () => {
                await result.current.handleNext()
            })

            expect(mockCreateBulkPendingBookings).not.toHaveBeenCalled()
            expect(useStepNavigationStore.getState().currentStep).toBe(1)
            expect(onReservationError).toHaveBeenCalledWith(
                'Not enough rooms available for room class 42'
            )
        })

        it('calls onReservationError when available count is less than selected quantity', async () => {
            // User selected 2 rooms but only 1 is now available
            useRoomSelectionStore.setState({
                selectedRooms: { 42: 2 },
                selectedRoomsByPlan: { 42: { 10: { quantity: 2 } } },
                roomClasses: [roomClass]
            })

            jest.spyOn(useRoomAvailabilityStore.getState().actions, 'refreshAvailability')
                .mockResolvedValue([makeRoomClass(42, 'Anda Deluxe Room', 1)]) // only 1 available

            const onReservationError = jest.fn()
            const { result } = renderHook(() => useReservationNavigation({ onReservationError }))

            await act(async () => {
                await result.current.handleNext()
            })

            expect(mockCreateBulkPendingBookings).not.toHaveBeenCalled()
            expect(useStepNavigationStore.getState().currentStep).toBe(1)
            expect(onReservationError).toHaveBeenCalledWith(
                'Not enough rooms available for room class 42'
            )
        })
    })
})
