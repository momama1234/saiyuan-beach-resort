// Must mock api before store imports — api.ts uses 'use server' which hangs Jest
jest.mock('../../../../../lib/api', () => ({
    getDataWithToken: jest.fn(),
}))

import { render, screen } from '@testing-library/react'
import React from 'react'

jest.mock('next-intl', () => ({
    useTranslations: () => {
        const t = (key: string) => key
        t.rich = (key: string) => key
        return t
    }
}))

jest.mock('next/navigation', () => ({
    useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
    useSearchParams: () => new URLSearchParams('checkIn=2026-06-01&checkOut=2026-06-02&adults=2&children=0')
}))

jest.mock('../../../../../features/reservation/stores/room-availability-store', () => ({
    useAvailableRoomClasses: () => [],
    useSoldOutRoomClasses: () => [],
    useRoomAvailabilityActions: () => ({
        fetchAvailableRooms: jest.fn(),
    }),
}))

jest.mock('../../../../../features/reservation/stores/booking-details-store', () => ({
    useBookingDetails: () => ({ checkInDate: null, checkOutDate: null }),
    useBookingDetailsActions: () => ({ initialize: jest.fn() }),
}))

jest.mock('../../../../../features/reservation/stores/room-selection-store', () => ({
    useRoomSelectionActions: () => ({
        setRoomClasses: jest.fn(),
        updateRoomQuantity: jest.fn(),
        updatePlanQuantity: jest.fn(),
    }),
    useSelectedRooms: () => ({}),
    useSelectedRoomsByPlan: () => ({}),
}))

jest.mock('../../../../../features/reservation/stores/step-navigation-store', () => ({
    useCurrentStep: () => 1,
    useStepNavigationActions: () => ({
        goToNext: jest.fn(),
        goToPrev: jest.fn(),
        goToStep: jest.fn(),
    }),
}))

jest.mock('../../../../../features/reservation/hooks/useAutoSelectRatePlan', () => ({
    useAutoSelectRatePlan: jest.fn(),
}))

jest.mock('../../../../../features/reservation/utils/reservation-session', () => ({
    buildReservationContextKey: () => 'test-key',
}))

jest.mock('../BookingSummary', () => ({ BookingSummary: () => <div /> }))
jest.mock('../ConfirmationSummary', () => ({ ConfirmationSummary: () => <div /> }))
jest.mock('../GuestInfoStep', () => ({ GuestInfoStep: () => <div /> }))
jest.mock('../NavigationButtons', () => ({
    NavigationButtons: () => <div data-testid="navigation-buttons" />
}))
jest.mock('../PaymentCancelledModal', () => ({ PaymentCancelledModal: () => <div /> }))
jest.mock('../ProgressIndicator', () => ({ ProgressIndicator: () => <div /> }))
jest.mock('../StepHeader', () => ({ StepHeader: () => <div /> }))
jest.mock('../RoomSelectionGrid', () => ({ RoomSelectionGrid: () => <div /> }))
jest.mock('../../../../../features/reservation/hooks/useAutoSelectRoom', () => ({
    useAutoSelectRoom: () => undefined
}))
jest.mock('../../../../../features/reservation/hooks/useReservationSessionReset', () => ({
    useReservationSessionReset: () => ({ resetReservationSession: jest.fn() })
}))

import Reservations from '../Reservations'

const defaultProps = {
    vatRate: 7,
    serviceCharge: 10,
    isIncludeVat: true,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    isDepositEnabled: false,
    depositType: 0,
    policyCancellationNoticeDays: 7
}

describe('Navigation bar sticky', () => {
    it('wrapper div has sticky class (not md:sticky) so bar sticks on mobile too', () => {
        const { container } = render(<Reservations {...defaultProps} />)
        const navButtons = screen.getByTestId('navigation-buttons')
        const wrapper = navButtons.parentElement!
        expect(wrapper.className).toContain('sticky')
        expect(wrapper.className).not.toContain('md:sticky')
    })
})
