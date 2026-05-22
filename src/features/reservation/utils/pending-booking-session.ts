'use client'

import { cancelPendingBooking } from '@/features/reservation/api/pending-booking.api'

/**
 * Cancels a batch of pending bookings.
 * This helper intentionally has no UI or store side effects.
 */
export const cancelPendingBookings = async (pendingBookingIds: readonly string[]): Promise<void> => {
    if (pendingBookingIds.length === 0) {
        return
    }

    await Promise.allSettled(pendingBookingIds.map((pendingBookingId) => cancelPendingBooking(pendingBookingId)))
}
