import { useCallback } from 'react'

import { useBookingDetailsActions } from '@/features/reservation/stores/booking-details-store'
import { useRoomAvailabilityActions } from '@/features/reservation/stores/room-availability-store'

import { useReservationSessionReset } from './useReservationSessionReset'

/**
 * Custom hook to handle booking details update flow
 *
 * This hook manages the process of updating booking details including:
 * - Saving booking changes
 * - Clearing room selections
 * - Updating URL parameters
 * - Refreshing room availability
 *
 * @returns A callback function to handle booking details updates
 */
export const useBookingDetailsUpdate = () => {
    const bookingDetailsActions = useBookingDetailsActions()
    const roomAvailabilityActions = useRoomAvailabilityActions()
    const { resetReservationSession } = useReservationSessionReset()

    const handleBookingDetailsUpdate = useCallback(async (options?: { roomClassId?: number; ratePlanId?: number }) => {
        try {
            // Save the booking changes and get updated details
            const updatedDetails = bookingDetailsActions.saveBookingChanges()

            // Clear current room selections and pending locks since dates/guests changed
            await resetReservationSession()

            // Update URL with new booking parameters
            const newParams = new URLSearchParams({
                checkIn: updatedDetails.checkInDate,
                checkOut: updatedDetails.checkOutDate,
                adults: updatedDetails.adults,
                children: updatedDetails.children,
                ...(options?.roomClassId ? { roomClassId: String(options.roomClassId) } : {}),
                ...(options?.ratePlanId ? { ratePlanId: String(options.ratePlanId) } : {})
            })

            const newUrl = `${window.location.pathname}?${newParams.toString()}`
            window.history.pushState({}, '', newUrl)

            // Refresh room availability with new parameters
            await roomAvailabilityActions.refreshAvailability({
                checkIn: updatedDetails.checkInDate,
                checkOut: updatedDetails.checkOutDate
            })
        } catch (error) {
            if (error instanceof Error) {
                throw error
            } else {
                throw new Error('Failed to apply booking changes')
            }
        }
    }, [bookingDetailsActions, resetReservationSession, roomAvailabilityActions])

    return handleBookingDetailsUpdate
}
