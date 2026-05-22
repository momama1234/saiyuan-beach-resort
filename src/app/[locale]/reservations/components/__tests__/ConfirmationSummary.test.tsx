import { render, screen } from '@testing-library/react'

import { ConfirmationSummary } from '../ConfirmationSummary'

const useSelectedRoomsPricingMock = jest.fn()

jest.mock('next-intl', () => ({
    useTranslations: () => {
        const translate = (key: string) => key
        translate.rich = (key: string) => key
        return translate
    }
}))

jest.mock('@/features/reservation/hooks/useSelectedRoomsPricing', () => ({
    useSelectedRoomsPricing: () => useSelectedRoomsPricingMock()
}))

jest.mock('@/features/reservation/stores/booking-details-store', () => ({
    useBookingDetails: () => ({
        checkInDate: '2026-04-21',
        checkOutDate: '2026-04-23',
        adults: '2',
        children: '0',
        infants: '0'
    }),
    useBookingDetailsActions: () => ({
        calculateNights: () => 2,
        calculateTotalGuests: () => 2,
        formatDate: (dateString: string) => dateString
    })
}))

jest.mock('@/features/reservation/stores/guest-info-store', () => ({
    useGuestInfoStore: (selector: (state: Record<string, string>) => unknown) =>
        selector({
            firstName: 'Ada',
            lastName: 'Lovelace',
            email: 'ada@example.com',
            phone: '+66812345678',
            specialRequests: '',
            estimatedArrival: ''
        })
}))

jest.mock('@/features/reservation/stores/room-selection-store', () => ({
    useRoomSelectionActions: () => ({
        getSelectedRoomsList: () => [
            {
                roomClass: {
                    id: 1,
                    name: 'Anda Deluxe Room'
                },
                quantity: 1
            }
        ]
    })
}))

function mockRoomsPricing(isIncludeVat: boolean) {
    useSelectedRoomsPricingMock.mockReturnValue({
        rooms: [
            {
                roomClass: {
                    id: 1,
                    name: 'Anda Deluxe Room'
                },
                ratePlanId: 1,
                quantity: 1,
                pricePerRoom: 9000,
                roomTotal: 9000,
                nights: 2,
                pricingBreakdown: {
                    roomCost: 9000,
                    taxAmount: 990,
                    serviceCharge: 900,
                    subtotal: 10890,
                    grandTotal: 10890,
                    isIncludeVat,
                    vatRate: 10,
                    depositAmount: 0
                }
            }
        ],
        grandTotal: 10890,
        totalRooms: 1
    })
}

describe('ConfirmationSummary', () => {
    beforeEach(() => {
        useSelectedRoomsPricingMock.mockReset()
    })

    it('shows included VAT label from the reservation pricing breakdown in step 3', () => {
        mockRoomsPricing(true)

        render(
            <ConfirmationSummary
                checkInTime="14:00"
                checkOutTime="12:00"
                isDepositEnabled={false}
                policyCancellationNoticeDays={7}
            />
        )

        expect(screen.getByText('VAT included (10%)')).toBeInTheDocument()
        expect(screen.getByText('฿990.00')).toBeInTheDocument()
        expect(screen.getByText('฿10,890.00')).toBeInTheDocument()
    })

    it('shows excluded VAT label from the reservation pricing breakdown in step 3', () => {
        mockRoomsPricing(false)

        render(
            <ConfirmationSummary
                checkInTime="14:00"
                checkOutTime="12:00"
                isDepositEnabled={false}
                policyCancellationNoticeDays={7}
            />
        )

        expect(screen.getByText('VAT excluded (10%)')).toBeInTheDocument()
        expect(screen.getByText('฿990.00')).toBeInTheDocument()
        expect(screen.getByText('฿10,890.00')).toBeInTheDocument()
    })
})
