'use client'

import { addDays, format } from 'date-fns'
import React, { createContext, ReactNode, useContext, useState } from 'react'
import { DateRange } from 'react-day-picker'

interface ReservationData {
    dateRange: DateRange | undefined
    adults: number
    children: number
}

interface ReservationContextType {
    reservationData: ReservationData
    updateReservationData: (_data: Partial<ReservationData>) => void
    setDateRange: (_dateRange: DateRange | undefined) => void
    setAdults: (_adults: number) => void
    setChildren: (_children: number) => void
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined)

interface ReservationProviderProps {
    children: ReactNode
}

export const ReservationProvider: React.FC<ReservationProviderProps> = ({ children }) => {
    const [reservationData, setReservationData] = useState<ReservationData>({
        dateRange: undefined,
        adults: 2,
        children: 0
    })

    const updateReservationData = (data: Partial<ReservationData>) => {
        setReservationData((prev) => ({ ...prev, ...data }))
    }

    const setDateRange = (dateRange: DateRange | undefined) => {
        setReservationData((prev) => ({ ...prev, dateRange }))
    }

    const setAdults = (adults: number) => {
        setReservationData((prev) => ({ ...prev, adults }))
    }

    const setChildren = (children: number) => {
        setReservationData((prev) => ({ ...prev, children }))
    }

    const contextValue: ReservationContextType = {
        reservationData,
        updateReservationData,
        setDateRange,
        setAdults,
        setChildren
    }

    return <ReservationContext.Provider value={contextValue}>{children}</ReservationContext.Provider>
}

export const useReservation = (): ReservationContextType => {
    const context = useContext(ReservationContext)
    if (!context) {
        throw new Error('useReservation must be used within a ReservationProvider')
    }
    return context
}

/**
 * Generate booking URL with reservation data and room class ID
 * @param roomClassId - The room class ID to book
 * @param reservationData - Current reservation data from context
 * @returns URL string for reservations page with parameters
 */
export const generateBookingUrlWithReservation = (
    roomClassId: number,
    reservationData: ReservationData,
    isContactBooking: boolean,
    locale: string = 'en'
): string => {
    const now = new Date()

    let checkInDate: Date
    let checkOutDate: Date

    if (reservationData.dateRange?.from && reservationData.dateRange?.to) {
        checkInDate = reservationData.dateRange.from
        checkOutDate = reservationData.dateRange.to
    } else {
        checkInDate = now
        checkOutDate = addDays(now, 1)
    }

    // Format dates as YYYY-MM-DD using date-fns
    const formatDate = (date: Date): string => {
        return format(date, 'yyyy-MM-dd')
    }

    const params = new URLSearchParams({
        roomClassId: roomClassId.toString(),
        checkIn: formatDate(checkInDate),
        checkOut: formatDate(checkOutDate),
        adults: reservationData.adults.toString(),
        children: reservationData.children.toString()
    })

    const localePrefix = locale === 'en' ? '' : `/${locale}`
    return isContactBooking
        ? `${localePrefix}/contact-booking?${params.toString()}`
        : `${localePrefix}/reservations?${params.toString()}`
}
