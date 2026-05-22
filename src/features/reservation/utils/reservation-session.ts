import { RoomSelection } from '@/features/reservation/stores/room-selection-store'

export interface ReservationContextSnapshot {
    checkIn: string
    checkOut: string
    adults: string
    children: string
    roomClassId: string
}

export const buildReservationContextKey = ({
    checkIn,
    checkOut,
    adults,
    children,
    roomClassId
}: ReservationContextSnapshot): string => {
    return [checkIn, checkOut, adults, children, roomClassId].join('|')
}

export const hasOtherSelectedRoomClasses = (selectedRooms: RoomSelection, roomClassId: number): boolean => {
    return Object.entries(selectedRooms).some(([selectedRoomClassId, quantity]) => {
        return quantity > 0 && Number(selectedRoomClassId) !== roomClassId
    })
}
