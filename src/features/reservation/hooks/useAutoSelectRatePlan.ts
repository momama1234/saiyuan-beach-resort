import { useEffect, useRef } from 'react'

import { RoomSelectionByPlan } from '@/features/reservation/stores/room-selection-store'
import { AvailableRoomClass } from '@/types/room-management'

interface UseAutoSelectRatePlanParams {
    initialRatePlanId: number | undefined
    roomClasses: AvailableRoomClass[]
    nights: number
    selectedRoomsByPlan: RoomSelectionByPlan
    updatePlanQuantity: (_roomClassId: number, _ratePlanId: number, _quantity: number, _occupancyOptionId?: number) => void
}

export const useAutoSelectRatePlan = ({
    initialRatePlanId,
    roomClasses,
    nights,
    selectedRoomsByPlan,
    updatePlanQuantity
}: UseAutoSelectRatePlanParams): void => {
    const appliedRatePlanIdRef = useRef<number | null>(null)

    useEffect(() => {
        if (!initialRatePlanId) {
            appliedRatePlanIdRef.current = null
            return
        }

        if (appliedRatePlanIdRef.current === initialRatePlanId || roomClasses.length === 0) return

        for (const roomClass of roomClasses) {
            const ratePlan = roomClass.ratePlans?.find((rp) => rp.id === initialRatePlanId)
            if (ratePlan) {
                const losDiscounts = ratePlan.discountRules?.losDiscounts ?? []
                const promoMinNights =
                    ratePlan.promotion && losDiscounts.length > 0
                        ? Math.min(...losDiscounts.map((t) => t.minNights))
                        : null

                // Don't auto-select a locked promo — user can't interact with it
                if (promoMinNights != null && nights < promoMinNights) return

                // Don't auto-select if user already has any selection for this room class
                const hasExistingSelection = Object.values(selectedRoomsByPlan[roomClass.id] ?? {}).some(
                    (s) => s.quantity > 0
                )
                if (hasExistingSelection) {
                    appliedRatePlanIdRef.current = initialRatePlanId
                    return
                }

                const occupancyOption =
                    ratePlan.occupancyOptions.find((o) => o.isDefault) ?? ratePlan.occupancyOptions[0]
                updatePlanQuantity(roomClass.id, ratePlan.id, 1, occupancyOption?.id)
                appliedRatePlanIdRef.current = initialRatePlanId
                return
            }
        }
    }, [roomClasses, initialRatePlanId, nights, selectedRoomsByPlan, updatePlanQuantity])
}
