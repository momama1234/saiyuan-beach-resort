'use client'

import { useEffect, useRef } from 'react'

import { cancelPendingBookingsBySessionKeepalive } from '@/features/reservation/api/pending-booking.api'
import {
    usePendingBookingActions,
    usePendingBookingIds,
    useSessionId
} from '@/features/reservation/stores/pending-booking-store'

/**
 * Warns before the user leaves an active reservation session and attempts to
 * release locked inventory as soon as the page is being unloaded.
 */
export const usePendingBookingUnloadProtection = (): void => {
    const pendingBookingIds = usePendingBookingIds()
    const sessionId = useSessionId()
    const pendingBookingActions = usePendingBookingActions()
    const hasReleasedLocksRef = useRef(false)

    const hasActivePendingBookings = pendingBookingIds.length > 0 && Boolean(sessionId)

    useEffect(() => {
        if (!hasActivePendingBookings) {
            hasReleasedLocksRef.current = false
        }
    }, [hasActivePendingBookings])

    useEffect(() => {
        if (!hasActivePendingBookings || !sessionId) {
            return
        }

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (hasReleasedLocksRef.current) {
                return
            }

            event.preventDefault()
            event.returnValue = ''
        }

        const handlePageHide = () => {
            if (hasReleasedLocksRef.current) {
                return
            }

            hasReleasedLocksRef.current = true
            pendingBookingActions.clearPendingBooking()
            cancelPendingBookingsBySessionKeepalive(sessionId)
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        window.addEventListener('pagehide', handlePageHide)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
            window.removeEventListener('pagehide', handlePageHide)
        }
    }, [hasActivePendingBookings, pendingBookingActions, sessionId])
}
