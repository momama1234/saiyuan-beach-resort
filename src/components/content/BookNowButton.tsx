'use client'

import { useLocale } from 'next-intl'

import { generateBookingUrlWithReservation, useReservation } from '@/contexts/ReservationContext'

interface BookNowButtonProps {
    roomClassId: number
    isContactBooking: boolean
}

const BookNowButton = ({ roomClassId, isContactBooking }: BookNowButtonProps): React.JSX.Element => {
    const { reservationData } = useReservation()
    const locale = useLocale()

    return (
        <div className="px-6 py-4">
            <button
                type="button"
                className="w-full cursor-pointer rounded-sm bg-[#0E7C86] py-3 text-sm font-semibold tracking-wider text-white uppercase transition-colors hover:bg-[#0a6570]"
                onClick={(e) => {
                    e.preventDefault()
                    const bookingUrl = generateBookingUrlWithReservation(
                        roomClassId,
                        reservationData,
                        isContactBooking,
                        locale
                    )
                    window.open(bookingUrl, '_blank')
                }}>
                Book Now
            </button>
        </div>
    )
}

export default BookNowButton
