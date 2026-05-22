import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { CreateReservationResponse } from '@/features/reservation/types'

import { BookingDetails } from './booking-details-store'
import { GuestInfoState } from './guest-info-store'
import { SelectedRoomPlanItem } from './room-selection-store'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/v1'

async function postReservation(data: object): Promise<CreateReservationResponse> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    const apiKey = process.env.NEXT_PUBLIC_API_KEY
    if (apiKey) headers['x-api-key'] = apiKey
    const publicKey = process.env.NEXT_PUBLIC_API_PUBLIC_KEY
    if (publicKey) headers['x-public-key'] = publicKey

    const response = await fetch(`${API_URL}/open/reservations`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        cache: 'no-store'
    })

    if (!response.ok) {
        let errorMessage = `Booking failed (${response.status})`
        try {
            const err = await response.json()
            errorMessage = (Array.isArray(err.message) ? err.message[0] : err.message) || errorMessage
        } catch { /* ignore parse error */ }
        throw new Error(errorMessage)
    }

    return response.json()
}

export interface ReservationState {
    isSubmitting: boolean
    error: string | null
    lastBookingId: number | null
}

export interface ReservationActions {
    createReservation: (
        _bookingDetails: BookingDetails,
        _guestInfo: GuestInfoState,
        _selectedRooms: SelectedRoomPlanItem[],
        _pendingBookingIds: string[],
        _locale?: string
    ) => Promise<CreateReservationResponse>
    setIsSubmitting: (_submitting: boolean) => void
    setError: (_error: string | null) => void
    clearError: () => void
}

export interface ReservationStore extends ReservationState {
    actions: ReservationActions
}

// Constants from shared package
const BOOKING_SOURCE = {
    WEBSITE: 2
}

const BOOKING_STATUS = {
    PENDING: 1
}

const PAYMENT_STATUS = {
    PENDING: 1
}

/**
 * Format arrival time for backend
 * @param timeValue
 * @param checkInDate
 * @returns
 */
const formatArrivalTimeForBackend = (timeValue: string, checkInDate: string): string => {
    if (!timeValue) return ''

    // If it's in HH:MM format, combine with check-in date
    if (timeValue.match(/^\d{2}:\d{2}$/)) {
        return `${checkInDate}T${timeValue}:00.000Z`
    }

    // Legacy support for old dropdown values - convert to specific times
    const checkInDateObj = new Date(checkInDate)
    let hours = 14 // Default check-in time

    switch (timeValue) {
        case 'morning':
            hours = 9 // 9:00 AM
            break
        case 'afternoon':
            hours = 15 // 3:00 PM
            break
        case 'evening':
            hours = 19 // 7:00 PM
            break
        case 'late':
            hours = 22 // 10:00 PM
            break
        default:
            return ''
    }

    checkInDateObj.setHours(hours, 0, 0, 0)
    return checkInDateObj.toISOString()
}

export const useReservationStore = create<ReservationStore>()(
    devtools(
        (set) => ({
            // State
            isSubmitting: false,
            error: null,
            lastBookingId: null,

            // Actions
            actions: {
                createReservation: async (bookingDetails, guestInfo, selectedRooms, pendingBookingIds, locale) => {
                    set({ isSubmitting: true, error: null }, false, 'createReservation/start')

                    try {
                        // Create rooms array for bulk reservation
                        const rooms = selectedRooms.map((item) => ({
                            roomClassId: item.roomClass.id.toString(),
                            numberOfRooms: item.quantity,
                            ratePlanId: item.ratePlanId,
                            occupancyOptionId: item.occupancyOptionId,
                            adults: parseInt(bookingDetails.adults),
                            children: parseInt(bookingDetails.children),
                            infants: parseInt(bookingDetails.infants)
                        }))

                        const reservationData = {
                            checkIn: bookingDetails.checkInDate,
                            checkOut: bookingDetails.checkOutDate,
                            rooms,
                            guestFirstName: guestInfo.firstName,
                            guestLastName: guestInfo.lastName,
                            guestEmail: guestInfo.email,
                            guestPhone: guestInfo.phone,
                            guestSpecialRequests: guestInfo.specialRequests || '',
                            guestEstimatedArrival: formatArrivalTimeForBackend(
                                guestInfo.estimatedArrival || '',
                                bookingDetails.checkInDate
                            ),
                            bookingSourceId: BOOKING_SOURCE.WEBSITE,
                            bookingStatusId: BOOKING_STATUS.PENDING,
                            paymentStatusId: PAYMENT_STATUS.PENDING,
                            paymentProviderId: 1,
                            pendingBookingIds,
                            ...(locale ? { locale } : {})
                        }

                        const response = await postReservation(reservationData)

                        set(
                            {
                                isSubmitting: false,
                                lastBookingId: response.bookingId
                            },
                            false,
                            'createReservation/success'
                        )

                        return response
                    } catch (error) {
                        console.error('Error creating reservation:', error)

                        let errorMessage = 'There was an error creating the reservation. Please try again later.'

                        if (error instanceof Error) {
                            if (error.message.startsWith('BOOKING_ERROR:')) {
                                try {
                                    const errorData = JSON.parse(error.message.replace('BOOKING_ERROR:', ''))
                                    errorMessage = errorData.message || errorMessage
                                } catch (parseError) {
                                    console.error('Error parsing booking error:', parseError)
                                }
                            } else {
                                errorMessage = error.message
                            }
                        }

                        set({ error: errorMessage, isSubmitting: false }, false, 'createReservation/error')
                        throw error
                    }
                },

                setIsSubmitting: (submitting) => {
                    set({ isSubmitting: submitting }, false, 'setIsSubmitting')
                },

                setError: (error) => {
                    set({ error }, false, 'setError')
                },

                clearError: () => {
                    set({ error: null }, false, 'clearError')
                }
            }
        }),
        { name: 'ReservationStore' }
    )
)

// Custom hooks for state
export const useIsSubmitting = () => useReservationStore((state) => state.isSubmitting)
export const useReservationError = () => useReservationStore((state) => state.error)
export const useLastBookingId = () => useReservationStore((state) => state.lastBookingId)

// Custom hook for actions
export const useReservationActions = () => useReservationStore((state) => state.actions)
