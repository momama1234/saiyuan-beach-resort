import { render } from '@testing-library/react'

import type { RoomSelectionByPlan } from '@/features/reservation/stores/room-selection-store'
import type { AvailableRoomClass } from '@/types/room-management'

import { useAutoSelectRatePlan } from '../useAutoSelectRatePlan'

interface TestProps {
    initialRatePlanId: number | undefined
    roomClasses: AvailableRoomClass[]
    nights?: number
    selectedRoomsByPlan?: RoomSelectionByPlan
    updatePlanQuantity: jest.Mock
}

const TestComponent = ({ nights = 1, selectedRoomsByPlan = {}, ...props }: TestProps): null => {
    useAutoSelectRatePlan({ nights, selectedRoomsByPlan, ...props })
    return null
}

const buildRoomClass = (id: number, ratePlanId: number, isDefaultOccupancy = true): AvailableRoomClass =>
    ({
        id,
        name: `Room ${id}`,
        ratePlans: [
            {
                id: ratePlanId,
                name: `Rate Plan ${ratePlanId}`,
                isDefault: true,
                occupancyOptions: [
                    { id: 201, occupancy: 2, rate: 5000, isDefault: isDefaultOccupancy },
                    { id: 202, occupancy: 1, rate: 4000, isDefault: !isDefaultOccupancy }
                ]
            }
        ]
    }) as AvailableRoomClass

const buildPromoRoomClass = (): AvailableRoomClass =>
    ({
        id: 1,
        name: 'Deluxe Room',
        ratePlans: [
            {
                id: 14,
                name: 'Special Rate',
                isDefault: false,
                promotion: { accentColor: 'primary', anchorTotal: 20000 } as unknown,
                discountRules: { losDiscounts: [{ minNights: 5, discountPercent: 10 }] } as unknown,
                occupancyOptions: [{ id: 101, occupancy: 2, rate: 5000, isDefault: true }]
            }
        ]
    }) as unknown as AvailableRoomClass

describe('useAutoSelectRatePlan', () => {
    it('auto-selects the room class and rate plan with the default occupancy option', () => {
        const updatePlanQuantity = jest.fn()
        const roomClasses = [buildRoomClass(10, 101), buildRoomClass(11, 102)]

        render(
            <TestComponent
                initialRatePlanId={102}
                roomClasses={roomClasses}
                updatePlanQuantity={updatePlanQuantity}
            />
        )

        expect(updatePlanQuantity).toHaveBeenCalledTimes(1)
        expect(updatePlanQuantity).toHaveBeenCalledWith(11, 102, 1, 201)
    })

    it('falls back to the first occupancy option when none is marked default', () => {
        const updatePlanQuantity = jest.fn()
        const roomClass: AvailableRoomClass = {
            id: 20,
            name: 'Room 20',
            ratePlans: [
                {
                    id: 200,
                    name: 'Plan 200',
                    isDefault: false,
                    occupancyOptions: [
                        { id: 301, occupancy: 2, rate: 6000, isDefault: false },
                        { id: 302, occupancy: 1, rate: 5000, isDefault: false }
                    ]
                }
            ]
        } as AvailableRoomClass

        render(
            <TestComponent
                initialRatePlanId={200}
                roomClasses={[roomClass]}
                updatePlanQuantity={updatePlanQuantity}
            />
        )

        expect(updatePlanQuantity).toHaveBeenCalledWith(20, 200, 1, 301)
    })

    it('does nothing when initialRatePlanId is undefined', () => {
        const updatePlanQuantity = jest.fn()
        const roomClasses = [buildRoomClass(10, 101)]

        render(
            <TestComponent
                initialRatePlanId={undefined}
                roomClasses={roomClasses}
                updatePlanQuantity={updatePlanQuantity}
            />
        )

        expect(updatePlanQuantity).not.toHaveBeenCalled()
    })

    it('does nothing when roomClasses is empty', () => {
        const updatePlanQuantity = jest.fn()

        render(
            <TestComponent
                initialRatePlanId={101}
                roomClasses={[]}
                updatePlanQuantity={updatePlanQuantity}
            />
        )

        expect(updatePlanQuantity).not.toHaveBeenCalled()
    })

    it('does not auto-select a promo rate plan that is locked (nights < promoMinNights)', () => {
        const updatePlanQuantity = jest.fn()

        render(
            <TestComponent
                initialRatePlanId={14}
                roomClasses={[buildPromoRoomClass()]}
                nights={3}
                updatePlanQuantity={updatePlanQuantity}
            />
        )

        expect(updatePlanQuantity).not.toHaveBeenCalled()
    })

    it('auto-selects a promo rate plan when nights meets the minimum', () => {
        const updatePlanQuantity = jest.fn()

        render(
            <TestComponent
                initialRatePlanId={14}
                roomClasses={[buildPromoRoomClass()]}
                nights={5}
                updatePlanQuantity={updatePlanQuantity}
            />
        )

        expect(updatePlanQuantity).toHaveBeenCalledWith(1, 14, 1, 101)
    })

    it('does not auto-select if the room class already has a selection (prevents re-select after deselect)', () => {
        const updatePlanQuantity = jest.fn()

        render(
            <TestComponent
                initialRatePlanId={14}
                roomClasses={[buildPromoRoomClass()]}
                nights={5}
                selectedRoomsByPlan={{ 1: { 99: { quantity: 1 } } }}
                updatePlanQuantity={updatePlanQuantity}
            />
        )

        expect(updatePlanQuantity).not.toHaveBeenCalled()
    })

    it('does not auto-select if user already selected the same plan (idempotency guard)', () => {
        const updatePlanQuantity = jest.fn()

        render(
            <TestComponent
                initialRatePlanId={14}
                roomClasses={[buildPromoRoomClass()]}
                nights={5}
                selectedRoomsByPlan={{ 1: { 14: { quantity: 1 } } }}
                updatePlanQuantity={updatePlanQuantity}
            />
        )

        expect(updatePlanQuantity).not.toHaveBeenCalled()
    })

    it('does nothing when the rate plan is not found in available rooms (e.g. sold out)', () => {
        const updatePlanQuantity = jest.fn()
        const roomClasses = [buildRoomClass(10, 101), buildRoomClass(11, 102)]

        render(
            <TestComponent
                initialRatePlanId={999}
                roomClasses={roomClasses}
                updatePlanQuantity={updatePlanQuantity}
            />
        )

        expect(updatePlanQuantity).not.toHaveBeenCalled()
    })

    it('does not auto-select the deep-linked plan again after the user changes selections elsewhere', () => {
        const updatePlanQuantity = jest.fn()
        const roomClasses = [buildPromoRoomClass(), buildRoomClass(2, 99)]

        const { rerender } = render(
            <TestComponent
                initialRatePlanId={14}
                roomClasses={roomClasses}
                nights={5}
                selectedRoomsByPlan={{}}
                updatePlanQuantity={updatePlanQuantity}
            />
        )

        expect(updatePlanQuantity).toHaveBeenCalledTimes(1)
        expect(updatePlanQuantity).toHaveBeenCalledWith(1, 14, 1, 101)

        rerender(
            <TestComponent
                initialRatePlanId={14}
                roomClasses={roomClasses}
                nights={5}
                selectedRoomsByPlan={{ 2: { 99: { quantity: 1 } } }}
                updatePlanQuantity={updatePlanQuantity}
            />
        )

        expect(updatePlanQuantity).toHaveBeenCalledTimes(1)
    })
})
