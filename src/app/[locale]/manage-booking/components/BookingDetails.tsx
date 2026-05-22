'use client'

import React from 'react'

import type { PreCheckinBookingItem } from '../types/manage-booking-types'

export interface BookingDetailsProps {
    booking: PreCheckinBookingItem
    /** Optional: render as button for selection (e.g. in results list) */
    asButton?: boolean
    onClick?: () => void
    /** Optional aria-label when asButton */
    ariaLabel?: string
    className?: string
}

export function BookingDetails({
    booking,
    asButton = false,
    onClick,
    ariaLabel,
    className = ''
}: BookingDetailsProps) {
    const displayName =
        [booking.guestFirstName, booking.guestLastName].filter(Boolean).join(' ') ||
        `Booking #${booking.id}`
    const subtitle = [
        booking.checkInDate && booking.checkOutDate && `${booking.checkInDate} – ${booking.checkOutDate}`,
        booking.roomClass?.name && ` · ${booking.roomClass.name}`
    ]
        .filter(Boolean)
        .join('')

    const content = (
        <>
            <div className="font-medium text-gray-900">{displayName}</div>
            {subtitle && (
                <div className="mt-1 text-sm text-gray-500">{subtitle}</div>
            )}
        </>
    )

    if (asButton) {
        return (
            <button
                type="button"
                onClick={onClick}
                className={`w-full rounded-lg border border-gray-200 p-4 text-left transition hover:border-teal-200 hover:bg-orange-50/50 ${className}`}
                aria-label={ariaLabel ?? `Select booking ${booking.id}`}
            >
                {content}
            </button>
        )
    }

    return (
        <div className={`rounded-lg bg-gray-50 p-4 ${className}`}>
            {content}
        </div>
    )
}
