import { useCallback } from 'react'

import { useRoomSelectionActions } from '@/features/reservation/stores/room-selection-store'

import { usePendingBookingSessionReset } from './usePendingBookingSessionReset'

interface UseReservationSessionResetReturn {
    resetReservationSession: () => Promise<void>
}

/**
 * Clears the current reservation session both in UI state and on the backend.
 * Used when the user changes reservation context or exits the flow.
 */
export const useReservationSessionReset = (): UseReservationSessionResetReturn => {
    const roomSelectionActions = useRoomSelectionActions()
    const { resetPendingBookingSession } = usePendingBookingSessionReset()

    const resetReservationSession = useCallback(async () => {
        await resetPendingBookingSession()
        roomSelectionActions.clearSelections()
    }, [resetPendingBookingSession, roomSelectionActions])

    return {
        resetReservationSession
    }
}
