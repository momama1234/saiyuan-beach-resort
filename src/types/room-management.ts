import type { InventoryDailyRate } from '@/shared/types/room-management'
export type {
    AvailableRoom,
    Floor,
    InventoryDailyRate,
    RoomClass,
    RoomInformation
} from '@/shared/types/room-management'

// Extended types specific to Saiyuan Beach Resort
export type RoomFeature = {
    image?: RoomFeatureImage[]
    name: string
    isHighlighted: boolean
}

export type RoomFeatureImage = {
    id: number
    url: string
    name: string
}

export type DisplayImageVariant = {
    url: string
    width: number
    height: number
}

export type DisplayImageVariants = {
    thumbnail: DisplayImageVariant
    card: DisplayImageVariant
    hero: DisplayImageVariant
    original: DisplayImageVariant
}

export type AvailableRoomClass = {
    id: number
    propertyId: number
    name: string
    basePrice: string
    description?: string
    inventoryDailyRates?: InventoryDailyRate[]
    numberOfRooms?: number
    availableRooms?: number
    images: string[]
    displayImages?: DisplayImageVariants[]
    prices?: Price
    numberOfAdults?: number | null
    numberOfChildren?: number | null
    numberOfInfants?: number | null
    petAllowed?: boolean
    features?: RoomFeature[]
    ratePlans?: RatePlan[]
    roomSize?: number | null
    bedConfiguration?: string | null
}

export type RatePlanDiscountRules = {
    maxDiscountPercent: number | null
    losDiscounts: { minNights: number; discountPercent: number }[]
    advanceDiscounts: { minDaysAhead: number; discountPercent: number }[]
}

export type PromotionAccent = 'primary' | 'secondary'

export type RatePlanPromotion = {
    promotionId: number
    accentColor: PromotionAccent
    anchorTotal: number | null
    savePercent: number | null
}

export type RatePlan = {
    id: number
    name: string
    description?: string
    isDefault: boolean
    features?: RatePlanFeature[]
    occupancyOptions: OccupancyOption[]
    prices?: Price
    discountRules?: RatePlanDiscountRules
    promotion?: RatePlanPromotion | null
}

export type RatePlanFeature = {
    id: number
    label: string
    image?: RatePlanFeatureImage[]
}

export type RatePlanFeatureImage = {
    id: number
    url: string
    name: string
}

export type OccupancyOption = {
    id: number
    occupancy: number
    rate: number
    isDefault: boolean
}

export type Price = {
    roomClassId: number
    checkInDate: string
    checkOutDate: string
    totalDays: number
    dailyPrices: DailyPrice[]
    totalPrice: number
}

export type DailyPrice = {
    date: string
    price: number
}

export type Image = {
    id: number
    url: string
    categoryId: number
    displayImage?: DisplayImageVariants
}
