'use client'

import { useCallback } from 'react'

import {
    usePendingBookingActions,
    usePendingBookingIds
} from '@/features/reservation/stores/pending-booking-store'
import { useStepNavigationActions } from '@/features/reservation/stores/step-navigation-store'
import { cancelPendingBookings } from '@/features/reservation/utils/pending-booking-session'

interface UsePendingBookingSessionResetReturn {
    resetPendingBookingSession: () => Promise<void>
}

/**
 * Cancels any active pending bookings for the current tab and returns the flow to step 1.
 *
 * This is intentionally narrower than the full reservation session reset:
 * it keeps the selected rooms and booking details intact so the user can
 * return to room selection without losing their choices.
 */
export const usePendingBookingSessionReset = (): UsePendingBookingSessionResetReturn => {
    const pendingBookingIds = usePendingBookingIds()
    const pendingBookingActions = usePendingBookingActions()
    const stepNavigationActions = useStepNavigationActions()

    const resetPendingBookingSession = useCallback(async () => {
        const pendingBookingIdsToCancel = [...pendingBookingIds]
        await cancelPendingBookings(pendingBookingIdsToCancel)
        pendingBookingActions.clearPendingBooking()
        stepNavigationActions.setCurrentStep(1)
    }, [pendingBookingActions, pendingBookingIds, stepNavigationActions])

    return {
        resetPendingBookingSession
    }
}
