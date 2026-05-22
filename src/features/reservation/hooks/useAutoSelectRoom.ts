import type { ReadonlyURLSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { RoomSelection } from '@/features/reservation/stores/room-selection-store'
import { hasOtherSelectedRoomClasses } from '@/features/reservation/utils/reservation-session'
import { AvailableRoomClass } from '@/types/room-management'

interface UseAutoSelectRoomParams {
    queryParams: ReadonlyURLSearchParams
    roomClasses: AvailableRoomClass[]
    selectedRooms: RoomSelection
    updateRoomQuantity: (_roomClassId: number, _quantity: number) => void
    updatePlanQuantity: (_roomClassId: number, _ratePlanId: number, _quantity: number, _occupancyOptionId?: number) => void
    resetReservationSession: () => Promise<void>
}

export const useAutoSelectRoom = ({
    queryParams,
    roomClasses,
    selectedRooms,
    updateRoomQuantity,
    updatePlanQuantity,
    resetReservationSession
}: UseAutoSelectRoomParams): void => {
    const isResettingRef = useRef(false)
    const appliedAutoSelectKeyRef = useRef<string | null>(null)

    useEffect(() => {
        const ratePlanId = queryParams.get('ratePlanId')
        const roomClassId = queryParams.get('roomClassId')
        const quantity = parseInt(queryParams.get('quantity') || '1', 10)
        const autoSelectKey = ratePlanId
            ? `ratePlan:${ratePlanId}`
            : roomClassId
              ? `roomClass:${roomClassId}:quantity:${quantity}`
              : null

        if (!autoSelectKey) {
            appliedAutoSelectKeyRef.current = null
            return
        }

        if (appliedAutoSelectKeyRef.current === autoSelectKey || roomClasses.length === 0) {
            return
        }

        if (ratePlanId) {
            const planId = parseInt(ratePlanId, 10)
            const match = findRoomClassByRatePlan(roomClasses, planId)
            if (!match) return

            const { roomClass, occupancyOptionId } = match

            const shouldResetSelection = hasOtherSelectedRoomClasses(selectedRooms, roomClass.id)
            if (shouldResetSelection) {
                if (!isResettingRef.current) {
                    isResettingRef.current = true
                    void (async () => {
                        try {
                            await resetReservationSession()
                            updatePlanQuantity(roomClass.id, planId, 1, occupancyOptionId)
                            appliedAutoSelectKeyRef.current = autoSelectKey
                        } finally {
                            isResettingRef.current = false
                        }
                    })()
                }
                return
            }

            if (selectedRooms[roomClass.id]) {
                appliedAutoSelectKeyRef.current = autoSelectKey
                return
            }

            if (!isResettingRef.current) {
                updatePlanQuantity(roomClass.id, planId, 1, occupancyOptionId)
                appliedAutoSelectKeyRef.current = autoSelectKey
            }
            return
        }

        if (roomClassId) {
            const targetRoomClass = roomClasses.find((room) => room.id === parseInt(roomClassId, 10))

            if (targetRoomClass) {
                const shouldResetSelection = hasOtherSelectedRoomClasses(selectedRooms, targetRoomClass.id)

                if (shouldResetSelection) {
                    if (!isResettingRef.current) {
                        isResettingRef.current = true
                        void (async () => {
                            try {
                                await resetReservationSession()
                                updateRoomQuantity(targetRoomClass.id, quantity)
                                appliedAutoSelectKeyRef.current = autoSelectKey
                            } finally {
                                isResettingRef.current = false
                            }
                        })()
                    }
                    return
                }

                if (selectedRooms[targetRoomClass.id]) {
                    appliedAutoSelectKeyRef.current = autoSelectKey
                    return
                }

                if (!isResettingRef.current) {
                    updateRoomQuantity(targetRoomClass.id, quantity)
                    appliedAutoSelectKeyRef.current = autoSelectKey
                }
            }
        }
    }, [queryParams, roomClasses, selectedRooms, updateRoomQuantity, updatePlanQuantity, resetReservationSession])
}

const findRoomClassByRatePlan = (roomClasses: AvailableRoomClass[], ratePlanId: number) => {
    for (const roomClass of roomClasses) {
        const plan = roomClass.ratePlans?.find((rp) => rp.id === ratePlanId)
        if (plan) {
            const defaultOption = plan.occupancyOptions?.find((o) => o.isDefault)
            return {
                roomClass,
                occupancyOptionId: defaultOption?.id
            }
        }
    }
    return null
}
