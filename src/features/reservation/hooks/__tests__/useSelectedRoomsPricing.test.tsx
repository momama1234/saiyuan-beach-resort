import { renderHook } from '@testing-library/react'

import { useSelectedRoomsPricing } from '../useSelectedRoomsPricing'

jest.mock('../../stores/booking-details-store', () => ({
    useBookingDetailsActions: jest.fn()
}))

jest.mock('../../stores/room-availability-store', () => ({
    useAvailableRoomClasses: jest.fn()
}))

jest.mock('../../stores/room-selection-store', () => ({
    useSelectedRoomsByPlan: jest.fn(),
    useTotalRooms: jest.fn()
}))

const mockUseBookingDetailsActions = jest.requireMock(
    '../../stores/booking-details-store'
) as {
    useBookingDetailsActions: jest.Mock
}

const mockUseAvailableRoomClasses = jest.requireMock(
    '../../stores/room-availability-store'
) as {
    useAvailableRoomClasses: jest.Mock
}

const mockRoomSelectionStore = jest.requireMock('../../stores/room-selection-store') as {
    useSelectedRoomsByPlan: jest.Mock
    useTotalRooms: jest.Mock
}

describe('useSelectedRoomsPricing', () => {
    it('uses net room totals for each room and calculates VAT/service on the reservation total', () => {
        const roomClass = { id: 1, name: 'Anda Premium Room' } as never
        const getPricingInfo = jest.fn((_: unknown, ratePlanId: number) => {
            if (ratePlanId === 10) {
                return {
                    nights: 1,
                    totalGuests: 2,
                    totalPrice: 1177,
                    hasAPIPrice: true,
                    basePrice: 6500,
                    pricingBreakdown: {
                        roomCost: 1000,
                        taxAmount: 77,
                        serviceCharge: 100,
                        subtotal: 1177,
                        grandTotal: 1177,
                        isIncludeVat: false,
                        vatRate: 7,
                        depositAmount: 0
                    }
                }
            }

            return {
                nights: 1,
                totalGuests: 2,
                totalPrice: 2354,
                hasAPIPrice: true,
                basePrice: 8000,
                pricingBreakdown: {
                    roomCost: 2000,
                    taxAmount: 154,
                    serviceCharge: 200,
                    subtotal: 2354,
                    grandTotal: 2354,
                    isIncludeVat: false,
                    vatRate: 7,
                    depositAmount: 0
                }
            }
        })

        mockUseBookingDetailsActions.useBookingDetailsActions.mockReturnValue({
            getPricingInfo
        })
        mockUseAvailableRoomClasses.useAvailableRoomClasses.mockReturnValue([roomClass])
        mockRoomSelectionStore.useSelectedRoomsByPlan.mockReturnValue({
            1: {
                10: { quantity: 1 },
                11: { quantity: 1 }
            }
        })
        mockRoomSelectionStore.useTotalRooms.mockReturnValue(2)

        const { result } = renderHook(() => useSelectedRoomsPricing())

        expect(result.current.totalRooms).toBe(2)
        expect(result.current.grandTotal).toBe(3531)
        expect(result.current.rooms).toEqual([
            expect.objectContaining({
                ratePlanId: 10,
                pricePerRoom: 1000,
                roomTotal: 1000
            }),
            expect.objectContaining({
                ratePlanId: 11,
                pricePerRoom: 2000,
                roomTotal: 2000
            })
        ])
    })
})
