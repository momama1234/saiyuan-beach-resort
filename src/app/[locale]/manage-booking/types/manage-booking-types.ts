export interface PreCheckinBookingItem {
    id: number
    guestFirstName?: string
    guestLastName?: string
    guestEmail?: string
    checkInDate?: string
    checkOutDate?: string
    bookingStatus?: { name: string }
    roomClass?: { name: string }
}

export type PreCheckinBookingDetailRoom = {
    id: number
    roomName: string | null
    roomNumber: string | null
    roomClassName: string
    occupancy: { numberOfAdults: number; numberOfChildren: number; numberOfInfants: number }
    bookingRoomGuests: Array<{
        guestId: number
        firstName: string
        lastName: string
        email: string | null
        mobilePhone: string | null
        guestType: string
        isMainGuest: boolean
        dateOfBirth?: string | null
        addressLine?: string | null
        city?: string | null
        documentType?: number | null
        documentNumber?: string | null
    }>
}

export type PreCheckinBookingDetail = {
    bookingId: number
    checkInDate: string
    checkOutDate: string
    bookingRooms: PreCheckinBookingDetailRoom[]
}

export type RoomGuestSlot = {
    firstName: string
    lastName: string
    email: string
    phone: string
    guestType: 'adult' | 'child' | 'infant'
    isMainGuest: boolean
    dateOfBirth?: string
    addressLine?: string
    city?: string
    documentNumber?: string
    documentType?: number
}

export type RoomGuestsState = {
    bookingRoomId: number
    roomLabel: string
    roomClassName: string
    occupancy: { numberOfAdults: number; numberOfChildren: number; numberOfInfants: number }
    guests: RoomGuestSlot[]
}

export type ManageBookingStep =
    | 'search'
    | 'results'
    | 'verify_booking_code'
    | 'otp_send'
    | 'otp_verify'
    | 'guest_form'
    | 'view_only'
    | 'success'
