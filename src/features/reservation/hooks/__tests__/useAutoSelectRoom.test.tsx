import { render, waitFor } from '@testing-library/react'
import type { ReadonlyURLSearchParams } from 'next/navigation'

import type { AvailableRoomClass } from '@/types/room-management'

import { useAutoSelectRoom } from '../useAutoSelectRoom'

interface TestProps {
    queryParams: ReadonlyURLSearchParams
    roomClasses: AvailableRoomClass[]
    selectedRooms: Record<number, number>
    updateRoomQuantity: jest.Mock
    updatePlanQuantity: jest.Mock
    resetReservationSession: jest.Mock
}

const TestComponent = (props: TestProps): null => {
    useAutoSelectRoom(props)
    return null
}

const roomClasses: AvailableRoomClass[] = [
    {
        id: 17,
        name: 'Room A',
        ratePlans: [
            { id: 100, name: 'Standard Rate', isDefault: true, occupancyOptions: [{ id: 200, occupancy: 2, rate: 5000, isDefault: true }] }
        ]
    } as AvailableRoomClass,
    {
        id: 18,
        name: 'Room B',
        ratePlans: [
            { id: 101, name: 'Standard Rate', isDefault: true, occupancyOptions: [{ id: 201, occupancy: 2, rate: 6000, isDefault: true }] },
            { id: 102, name: 'Premium Rate', isDefault: false, occupancyOptions: [{ id: 202, occupancy: 2, rate: 8000, isDefault: true }] }
        ]
    } as AvailableRoomClass
]

const createParams = (query: string): ReadonlyURLSearchParams => {
    return new URLSearchParams(query) as unknown as ReadonlyURLSearchParams
}

describe('useAutoSelectRoom', () => {
    it('clears stale selection from another room class before selecting the target room', async () => {
        const updateRoomQuantity = jest.fn()
        const updatePlanQuantity = jest.fn()
        const resetReservationSession = jest.fn().mockResolvedValue(undefined)

        render(
            <TestComponent
                queryParams={createParams('roomClassId=18&quantity=2')}
                roomClasses={roomClasses}
                selectedRooms={{ 17: 1 }}
                updateRoomQuantity={updateRoomQuantity}
                updatePlanQuantity={updatePlanQuantity}
                resetReservationSession={resetReservationSession}
            />
        )

        expect(resetReservationSession).toHaveBeenCalledTimes(1)
        return waitFor(() => {
            expect(updateRoomQuantity).toHaveBeenCalledWith(18, 2)
        })
    })

    it('keeps the current selection when the target room is already selected', () => {
        const updateRoomQuantity = jest.fn()
        const updatePlanQuantity = jest.fn()
        const resetReservationSession = jest.fn().mockResolvedValue(undefined)

        render(
            <TestComponent
                queryParams={createParams('roomClassId=17&quantity=2')}
                roomClasses={roomClasses}
                selectedRooms={{ 17: 1 }}
                updateRoomQuantity={updateRoomQuantity}
                updatePlanQuantity={updatePlanQuantity}
                resetReservationSession={resetReservationSession}
            />
        )

        expect(resetReservationSession).not.toHaveBeenCalled()
        expect(updateRoomQuantity).not.toHaveBeenCalled()
    })

    it('selects the target room when there is no existing selection', () => {
        const updateRoomQuantity = jest.fn()
        const updatePlanQuantity = jest.fn()
        const resetReservationSession = jest.fn().mockResolvedValue(undefined)

        render(
            <TestComponent
                queryParams={createParams('roomClassId=18&quantity=3')}
                roomClasses={roomClasses}
                selectedRooms={{}}
                updateRoomQuantity={updateRoomQuantity}
                updatePlanQuantity={updatePlanQuantity}
                resetReservationSession={resetReservationSession}
            />
        )

        expect(resetReservationSession).not.toHaveBeenCalled()
        expect(updateRoomQuantity).toHaveBeenCalledWith(18, 3)
    })
})

describe('useAutoSelectRoom — ratePlanId deep-linking', () => {
    it('auto-selects the room class owning the rate plan via updatePlanQuantity', () => {
        const updateRoomQuantity = jest.fn()
        const updatePlanQuantity = jest.fn()
        const resetReservationSession = jest.fn().mockResolvedValue(undefined)

        render(
            <TestComponent
                queryParams={createParams('ratePlanId=102')}
                roomClasses={roomClasses}
                selectedRooms={{}}
                updateRoomQuantity={updateRoomQuantity}
                updatePlanQuantity={updatePlanQuantity}
                resetReservationSession={resetReservationSession}
            />
        )

        expect(updatePlanQuantity).toHaveBeenCalledWith(18, 102, 1, 202)
        expect(updateRoomQuantity).not.toHaveBeenCalled()
    })

    it('uses the default occupancy option from the matched rate plan', () => {
        const updateRoomQuantity = jest.fn()
        const updatePlanQuantity = jest.fn()
        const resetReservationSession = jest.fn().mockResolvedValue(undefined)

        render(
            <TestComponent
                queryParams={createParams('ratePlanId=100')}
                roomClasses={roomClasses}
                selectedRooms={{}}
                updateRoomQuantity={updateRoomQuantity}
                updatePlanQuantity={updatePlanQuantity}
                resetReservationSession={resetReservationSession}
            />
        )

        expect(updatePlanQuantity).toHaveBeenCalledWith(17, 100, 1, 200)
    })

    it('does nothing when ratePlanId does not match any loaded plan', () => {
        const updateRoomQuantity = jest.fn()
        const updatePlanQuantity = jest.fn()
        const resetReservationSession = jest.fn().mockResolvedValue(undefined)

        render(
            <TestComponent
                queryParams={createParams('ratePlanId=999')}
                roomClasses={roomClasses}
                selectedRooms={{}}
                updateRoomQuantity={updateRoomQuantity}
                updatePlanQuantity={updatePlanQuantity}
                resetReservationSession={resetReservationSession}
            />
        )

        expect(updatePlanQuantity).not.toHaveBeenCalled()
        expect(updateRoomQuantity).not.toHaveBeenCalled()
    })

    it('does nothing when ratePlanId is absent', () => {
        const updateRoomQuantity = jest.fn()
        const updatePlanQuantity = jest.fn()
        const resetReservationSession = jest.fn().mockResolvedValue(undefined)

        render(
            <TestComponent
                queryParams={createParams('checkIn=2026-05-01')}
                roomClasses={roomClasses}
                selectedRooms={{}}
                updateRoomQuantity={updateRoomQuantity}
                updatePlanQuantity={updatePlanQuantity}
                resetReservationSession={resetReservationSession}
            />
        )

        expect(updatePlanQuantity).not.toHaveBeenCalled()
        expect(updateRoomQuantity).not.toHaveBeenCalled()
    })

    it('resets stale selection before auto-selecting the rate plan room class', async () => {
        const updateRoomQuantity = jest.fn()
        const updatePlanQuantity = jest.fn()
        const resetReservationSession = jest.fn().mockResolvedValue(undefined)

        render(
            <TestComponent
                queryParams={createParams('ratePlanId=102')}
                roomClasses={roomClasses}
                selectedRooms={{ 17: 1 }}
                updateRoomQuantity={updateRoomQuantity}
                updatePlanQuantity={updatePlanQuantity}
                resetReservationSession={resetReservationSession}
            />
        )

        expect(resetReservationSession).toHaveBeenCalledTimes(1)
        return waitFor(() => {
            expect(updatePlanQuantity).toHaveBeenCalledWith(18, 102, 1, 202)
        })
    })

    it('skips auto-select when room class with the rate plan is already selected', () => {
        const updateRoomQuantity = jest.fn()
        const updatePlanQuantity = jest.fn()
        const resetReservationSession = jest.fn().mockResolvedValue(undefined)

        render(
            <TestComponent
                queryParams={createParams('ratePlanId=101')}
                roomClasses={roomClasses}
                selectedRooms={{ 18: 1 }}
                updateRoomQuantity={updateRoomQuantity}
                updatePlanQuantity={updatePlanQuantity}
                resetReservationSession={resetReservationSession}
            />
        )

        expect(resetReservationSession).not.toHaveBeenCalled()
        expect(updatePlanQuantity).not.toHaveBeenCalled()
    })

    it('does not reset the user selection after the rate-plan deep-link has already been applied once', () => {
        const updateRoomQuantity = jest.fn()
        const updatePlanQuantity = jest.fn()
        const resetReservationSession = jest.fn().mockResolvedValue(undefined)

        const { rerender } = render(
            <TestComponent
                queryParams={createParams('ratePlanId=102')}
                roomClasses={roomClasses}
                selectedRooms={{}}
                updateRoomQuantity={updateRoomQuantity}
                updatePlanQuantity={updatePlanQuantity}
                resetReservationSession={resetReservationSession}
            />
        )

        expect(updatePlanQuantity).toHaveBeenCalledTimes(1)
        expect(updatePlanQuantity).toHaveBeenCalledWith(18, 102, 1, 202)

        rerender(
            <TestComponent
                queryParams={createParams('ratePlanId=102')}
                roomClasses={roomClasses}
                selectedRooms={{ 17: 1, 18: 1 }}
                updateRoomQuantity={updateRoomQuantity}
                updatePlanQuantity={updatePlanQuantity}
                resetReservationSession={resetReservationSession}
            />
        )

        expect(resetReservationSession).not.toHaveBeenCalled()
        expect(updatePlanQuantity).toHaveBeenCalledTimes(1)
        expect(updateRoomQuantity).not.toHaveBeenCalled()
    })
})
