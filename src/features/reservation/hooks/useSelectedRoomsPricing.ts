import { useMemo } from 'react'

import { useBookingDetailsActions } from '@/features/reservation/stores/booking-details-store'
import { useAvailableRoomClasses } from '@/features/reservation/stores/room-availability-store'
import { useSelectedRoomsByPlan, useTotalRooms } from '@/features/reservation/stores/room-selection-store'
import { AvailableRoomClass } from '@/types/room-management'

export interface RoomPricingDetail {
    roomClass: AvailableRoomClass
    ratePlanId: number
    quantity: number
    pricePerRoom: number
    roomTotal: number
    nights: number
    pricingBreakdown: {
        roomCost: number
        taxAmount: number
        serviceCharge: number
        subtotal: number
        grandTotal: number
        isIncludeVat: boolean
        vatRate: number
        depositAmount: number
    }
}

export interface RoomsPricing {
    rooms: RoomPricingDetail[]
    grandTotal: number
    totalRooms: number
}

/**
 * Custom hook to calculate pricing for selected rooms
 * Subscribes to room selection and booking details stores
 * Returns memoized pricing information
 */
export const useSelectedRoomsPricing = (): RoomsPricing => {
    const selectedRoomsByPlan = useSelectedRoomsByPlan()
    const roomClasses = useAvailableRoomClasses()
    const totalRooms = useTotalRooms()
    const bookingDetailsActions = useBookingDetailsActions()

    return useMemo(() => {
        let grandTotal = 0
        const roomsPricingDetails: RoomPricingDetail[] = []

        const roomClassesMap = new Map<number, AvailableRoomClass>()
        roomClasses.forEach((rc) => roomClassesMap.set(rc.id, rc))

        Object.entries(selectedRoomsByPlan).forEach(([roomClassIdStr, plans]) => {
            const roomClassId = parseInt(roomClassIdStr, 10)
            const roomClass = roomClassesMap.get(roomClassId)
            if (!roomClass) return

            Object.entries(plans).forEach(([ratePlanIdStr, sel]) => {
                const ratePlanId = parseInt(ratePlanIdStr, 10)
                const selection = sel as { quantity: number; occupancyOptionId?: number }
                const qty = selection.quantity || 0
                if (qty <= 0) return

                const pricingInfo = bookingDetailsActions.getPricingInfo(
                    roomClass,
                    ratePlanId,
                    selection.occupancyOptionId
                )
                if (!pricingInfo) return

                const roomTotal = pricingInfo.pricingBreakdown.roomCost * qty
                grandTotal += pricingInfo.pricingBreakdown.grandTotal * qty

                roomsPricingDetails.push({
                    roomClass,
                    ratePlanId,
                    quantity: qty,
                    pricePerRoom: pricingInfo.pricingBreakdown.roomCost,
                    roomTotal,
                    nights: pricingInfo.nights,
                    pricingBreakdown: pricingInfo.pricingBreakdown
                })
            })
        })

        return {
            rooms: roomsPricingDetails,
            grandTotal,
            totalRooms
        }
    }, [selectedRoomsByPlan, roomClasses, totalRooms, bookingDetailsActions])
}
