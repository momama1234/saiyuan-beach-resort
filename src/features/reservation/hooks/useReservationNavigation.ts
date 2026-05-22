import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useShallow } from 'zustand/shallow'

import { createBulkPendingBookings } from '@/features/reservation/api/pending-booking.api'
import { useBookingDetails } from '@/features/reservation/stores/booking-details-store'
import { useIsGuestInfoValid } from '@/features/reservation/stores/guest-info-store'
import { useGuestInfoStore } from '@/features/reservation/stores/guest-info-store'
import { usePendingBookingActions, usePendingBookingIds } from '@/features/reservation/stores/pending-booking-store'
import { useReservationActions } from '@/features/reservation/stores/reservation-store'
import { useRoomAvailabilityActions } from '@/features/reservation/stores/room-availability-store'
import { useRoomSelectionActions, useTotalRooms } from '@/features/reservation/stores/room-selection-store'
import { useCurrentStep, useStepNavigationActions } from '@/features/reservation/stores/step-navigation-store'
import { generateUUID } from '@/lib/utils'

import { useReservationSessionReset } from './useReservationSessionReset'

interface UseReservationNavigationProps {
    onReservationSuccess?: () => void
    onReservationError?: (_error: string) => void
}

interface UseReservationNavigationReturn {
    handleBack: () => Promise<void>
    handleNext: () => Promise<void>
}

/**
 * Custom hook for handling reservation flow navigation
 * Manages step transitions and validation logic
 */
export const useReservationNavigation = ({
    onReservationSuccess,
    onReservationError
}: UseReservationNavigationProps = {}): UseReservationNavigationReturn => {
    const router = useRouter()
    const locale = useLocale()

    // Subscribe to Zustand stores
    const currentStep = useCurrentStep()
    const isGuestInfoValid = useIsGuestInfoValid()
    const bookingDetails = useBookingDetails()
    const totalRooms = useTotalRooms()
    const { resetReservationSession } = useReservationSessionReset()
    const roomAvailabilityActions = useRoomAvailabilityActions()
    const guestInfo = useGuestInfoStore(
        useShallow((state) => ({
            firstName: state.firstName,
            lastName: state.lastName,
            email: state.email,
            phone: state.phone,
            specialRequests: state.specialRequests,
            estimatedArrival: state.estimatedArrival
        }))
    )

    // Get action hooks
    const stepNavigationActions = useStepNavigationActions()
    const roomSelectionActions = useRoomSelectionActions()
    const reservationActions = useReservationActions()
    const pendingBookingActions = usePendingBookingActions()
    const pendingBookingIds = usePendingBookingIds()

    // Navigation handlers
    const handleBack = async () => {
        if (currentStep > 1) {
            stepNavigationActions.goToPreviousStep()
            return
        }

        await resetReservationSession()
        router.back()
    }

    const handleNext = async () => {
        if (currentStep === 1) {
            if (totalRooms === 0) {
                alert('Please select at least one room')
                return
            }

            // Create pending booking to lock the rooms
            try {
                const selectedRoomsList = roomSelectionActions.getSelectedRoomsPlanList()
                if (selectedRoomsList.length === 0) {
                    alert('Please select at least one room')
                    return
                }

                // Refresh availability and verify each selected room class still has enough rooms
                const freshRoomClasses = await roomAvailabilityActions.refreshAvailability(
                    {
                        checkIn: bookingDetails.checkInDate || '',
                        checkOut: bookingDetails.checkOutDate || ''
                    },
                    { silent: true }
                )

                const selectedRooms = roomSelectionActions.getSelectedRoomsList()
                for (const { roomClass, quantity } of selectedRooms) {
                    const fresh = freshRoomClasses.find((rc) => rc.id === roomClass.id)
                    if (!fresh || (fresh.availableRooms ?? 0) < quantity) {
                        throw new Error(`Not enough rooms available for room class ${roomClass.id}`)
                    }
                }

                const sessionId = generateUUID()
                const pendingBookings = await createBulkPendingBookings({
                    sessionId,
                    propertyId: selectedRoomsList[0]!.roomClass.propertyId,
                    checkInDate: bookingDetails.checkInDate || '',
                    checkOutDate: bookingDetails.checkOutDate || '',
                    adultCount: Number(bookingDetails.adults) || 0,
                    childCount: Number(bookingDetails.children) || 0,
                    infantCount: Number(bookingDetails.infants) || 0,
                    rooms: selectedRoomsList.map((selection) => ({
                        roomClassId: selection.roomClass.id,
                        ratePlanId: selection.ratePlanId,
                        quantity: selection.quantity
                    }))
                })

                pendingBookingActions.setBulkPendingBookings(sessionId, pendingBookings)

                // Move to next step
                stepNavigationActions.goToNextStep()
            } catch (error) {
                if (onReservationError) {
                    onReservationError(
                        error instanceof Error ? error.message : 'Failed to lock rooms. Please try again.'
                    )
                } else {
                    alert(error instanceof Error ? error.message : 'Failed to lock rooms. Please try again.')
                }
                console.error('Failed to create pending bookings:', error)
            }
            return
        }

        if (currentStep === 2) {
            if (!isGuestInfoValid) {
                alert('Please fill in all the information')
                return
            }
            stepNavigationActions.goToNextStep()
            return
        }

        if (currentStep === 3) {
            const selectedRoomsList = roomSelectionActions.getSelectedRoomsPlanList()
            if (selectedRoomsList.length === 0) {
                alert('Please select at least one room')
                return
            }

            try {
                const response = await reservationActions.createReservation(
                    bookingDetails,
                    guestInfo,
                    selectedRoomsList,
                    pendingBookingIds,
                    locale
                )

                onReservationSuccess?.()

                const bookingId = response?.bookingId

                // Gateway mode — redirect to Stripe in the same tab.
                // After payment Stripe redirects back to the success page automatically.
                if (response?.paymentUrl) {
                    window.location.href = response.paymentUrl
                    return
                }

                // Manual mode — navigate to the success page directly.
                if (bookingId) {
                    if (response?.paymentId) {
                        router.push(`/reservations/success?booking_id=${bookingId}&payment_id=${response?.paymentId}`)
                    } else {
                        router.push(`/reservations/success?booking_id=${bookingId}`)
                    }
                } else {
                    router.push('/reservations/success')
                }

                // Clear pending booking after successful reservation
                pendingBookingActions.clearPendingBooking()
            } catch (error) {
                const msg = error instanceof Error ? error.message : 'Unknown error'
                onReservationError?.(msg)
            }
        }
    }

    return {
        handleBack,
        handleNext
    }
}
