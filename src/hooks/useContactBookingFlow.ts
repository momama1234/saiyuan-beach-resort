import { useCallback, useState } from 'react'

import { postData } from '@/lib/api'
import { RoomSelection } from '@/types/booking'
import { AvailableRoomClass } from '@/types/room-management'

import { useRoomAvailability } from './useRoomAvailability'

interface BookingDetails {
    checkInDate: string
    checkOutDate: string
    adults: string
    children: string
    infants?: string
}

interface GuestInfo {
    firstName: string
    lastName: string
    email: string
    phone: string
    estimatedArrivalTime?: string
    customerMessage?: string
}

interface UseContactBookingFlowReturn {
    bookingDetails: BookingDetails
    guestInfo: GuestInfo
    selectedRooms: RoomSelection
    roomClasses: AvailableRoomClass[]
    isLoading: boolean
    isSubmitting: boolean
    updateBookingDetails: (_details: Partial<BookingDetails>) => void
    updateGuestInfo: (_field: keyof GuestInfo, _value: string) => void
    updateRoomQuantity: (_roomClassId: number, _quantity: number) => void
    fetchRoomAvailability: (_params: {
        checkIn: string
        checkOut: string
        adults: string
        children: string
    }) => Promise<AvailableRoomClass[]>
    submitContactBooking: () => Promise<void>
}

const initialBookingDetails: BookingDetails = {
    checkInDate: '',
    checkOutDate: '',
    adults: '1',
    children: '0',
    infants: '0'
}

const initialGuestInfo: GuestInfo = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    estimatedArrivalTime: '',
    customerMessage: ''
}

export function useContactBookingFlow(): UseContactBookingFlowReturn {
    const [bookingDetails, setBookingDetails] = useState<BookingDetails>(initialBookingDetails)
    const [guestInfo, setGuestInfo] = useState<GuestInfo>(initialGuestInfo)
    const [selectedRooms, setSelectedRooms] = useState<RoomSelection>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const roomAvailability = useRoomAvailability()

    const updateBookingDetails = useCallback((details: Partial<BookingDetails>) => {
        setBookingDetails((prev) => ({ ...prev, ...details }))
    }, [])

    const updateGuestInfo = useCallback((field: keyof GuestInfo, value: string) => {
        setGuestInfo((prev) => ({ ...prev, [field]: value }))
    }, [])

    const updateRoomQuantity = useCallback((roomClassId: number, quantity: number) => {
        setSelectedRooms((prev) => {
            const newSelection = { ...prev }
            if (quantity > 0) {
                newSelection[roomClassId] = quantity
            } else {
                delete newSelection[roomClassId]
            }
            return newSelection
        })
    }, [])

    const fetchRoomAvailability = useCallback(
        async (params: { checkIn: string; checkOut: string; adults: string; children: string }) => {
            const searchParams = new URLSearchParams({
                checkIn: params.checkIn,
                checkOut: params.checkOut,
                adults: params.adults,
                children: params.children
            })
            return await roomAvailability.fetchAvailableRooms(searchParams)
        },
        [roomAvailability.fetchAvailableRooms]
    )

    const submitContactBooking = useCallback(async () => {
        if (!bookingDetails.checkInDate || !bookingDetails.checkOutDate) {
            throw new Error('Please select check-in and check-out dates')
        }

        if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email) {
            throw new Error('Please fill in all required guest information')
        }

        const totalRooms = Object.values(selectedRooms).reduce((sum, qty) => sum + qty, 0)

        if (totalRooms === 0) {
            throw new Error('Please select at least one room')
        }

        const rooms = Object.entries(selectedRooms)
            .filter(([_, quantity]) => quantity > 0)
            .map(([roomClassId, quantity]) => {
                const roomClassIdNum = parseInt(roomClassId, 10)
                if (isNaN(roomClassIdNum)) {
                    return null
                }
                return {
                    quantity: quantity,
                    roomClassId: roomClassIdNum
                }
            })
            .filter((item): item is { quantity: number; roomClassId: number } => item !== null)

        if (rooms.length === 0) {
            throw new Error('Please select at least one room')
        }

        const contactBookingData = {
            firstName: guestInfo.firstName,
            lastName: guestInfo.lastName,
            email: guestInfo.email,
            phone: guestInfo.phone || undefined,
            checkInDate: bookingDetails.checkInDate,
            checkOutDate: bookingDetails.checkOutDate,
            numberOfAdults: parseInt(bookingDetails.adults) || 1,
            numberOfChildren: parseInt(bookingDetails.children) || 0,
            numberOfInfants: parseInt(bookingDetails.infants || '0') || 0,
            numberOfRooms: totalRooms,
            estimatedArrivalTime: guestInfo.estimatedArrivalTime || undefined,
            customerMessage: guestInfo.customerMessage || undefined,
            rooms: rooms
        }

        setIsSubmitting(true)
        try {
            await postData('/contact-booking', contactBookingData)
        } finally {
            setIsSubmitting(false)
        }
    }, [bookingDetails, guestInfo, selectedRooms])

    return {
        bookingDetails,
        guestInfo,
        selectedRooms,
        roomClasses: roomAvailability.roomClasses,
        isLoading: roomAvailability.isLoading,
        isSubmitting,
        updateBookingDetails,
        updateGuestInfo,
        updateRoomQuantity,
        fetchRoomAvailability,
        submitContactBooking
    }
}
