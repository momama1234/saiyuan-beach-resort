import { useState } from 'react'

import { CreateReservationResponse } from '@/features/reservation/types'
import { postData } from '@/lib/api'
import { AvailableRoomClass } from '@/types/room-management'

interface GuestInfo {
    firstName: string
    lastName: string
    email: string
    phone: string
    specialRequests?: string
    estimatedArrival?: string
}

interface BookingDetails {
    checkInDate: string
    checkOutDate: string
    adults: string
    children: string
    infants: string
}

interface SelectedRoomItem {
    roomClass: AvailableRoomClass
    quantity: number
}

interface UseReservationProps {
    onSuccess?: (_response: CreateReservationResponse) => void
    onError?: (_error: string) => void
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

export function useReservation({ onSuccess, onError }: UseReservationProps = {}) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const createReservation = async (
        bookingDetails: BookingDetails,
        guestInfo: GuestInfo,
        selectedRooms: SelectedRoomItem[],
        locale?: string
    ) => {
        setIsSubmitting(true)

        try {
            // สร้าง rooms array สำหรับ bulk reservation
            const rooms = selectedRooms.map(({ roomClass, quantity }) => ({
                roomClassId: roomClass.id.toString(),
                numberOfRooms: quantity,
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
                ...(locale ? { locale } : {})
            }

            const response = await postData<CreateReservationResponse>('/open/reservations', reservationData)

            onSuccess?.(response)

            return response
        } catch (error) {
            console.error('Error creating reservation:', error)

            let errorMessage = 'เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง'

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

            onError?.(errorMessage)
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        createReservation,
        isSubmitting
    }
}
