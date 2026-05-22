import { AvailableRoomClass } from './room-management'

export interface SelectedRoom {
    readonly roomClass: AvailableRoomClass
    readonly quantity: number
}

export interface RoomSelection {
    [roomClassId: number]: number
}

export interface RoomSelectionByPlan {
    [roomClassId: number]: {
        [ratePlanId: number]: {
            quantity: number
            occupancyOptionId?: number
        }
    }
}
