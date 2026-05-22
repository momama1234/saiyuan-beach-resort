export type RoomClass = {
    id: number
    name: string
    basePrice: number
    inventoryDailyRates?: InventoryDailyRate[]
    image?: string
    ratePlans?: RatePlan[]
}

export type InventoryDailyRate = {
    id: number
    date: string
    currency: string
    price: number
}

export type AvailableRoomClass = {
    id: number
    name: string
    basePrice: number
    description?: string
    image?: string
    inventoryDailyRates?: InventoryDailyRate[]
    availability?: { date: string; count: number }[]
    availableRoomCount?: number
    totalRoomCount?: number
    ratePlans?: RatePlan[]
}

export type Price = {
    totalDays: number
    totalPrice: number
    dailyPrices: { date: string; price: number }[]
}

export type RatePlanPromotion = {
    promotionId: number
    accentColor: 'primary' | 'secondary'
    anchorTotal: number | null
    savePercent: number | null
}

export type RatePlan = {
    id: number
    name: string
    description?: string
    isDefault: boolean
    occupancyOptions: OccupancyOption[]
    prices?: Price
    promotion?: RatePlanPromotion | null
}

export type OccupancyOption = {
    id: number
    occupancy: number
    rate: number
    isDefault: boolean
}

export type Floor = {
    id: number
    name: string
}

export type AvailableRoom = {
    id: number
    name?: string
    roomName?: string
    roomNumber?: string
    roomStatusId: number
    roomClass: RoomClass
    floors?: Floor
    roomStatuses?: {
        id: number
        name: string
    }
}

export type RoomInformation = {
    id: number
    roomNumber: string
    roomName: string
    roomClass: RoomClass
    floors: Floor
    roomStatuses: {
        id: number
        name: string
    }
}
