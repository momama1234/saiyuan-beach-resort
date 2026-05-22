import type { DisplayImageVariants } from './room-management'

// Type สำหรับ API response ที่มี slug
export interface RoomClassWithSlug {
    id: number
    name: string
    slug: string
    description?: string
    images?: string[]
    primaryImage?: {
        id: number
        imageUrl: string
        url?: string
        displayImage?: DisplayImageVariants
    } | null
    amenities?: string[]
    maxOccupancy?: number
    basePrice?: number
}
