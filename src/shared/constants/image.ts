export const IMAGE_CATEGORY = {
    PROPERTY: 1,
    ROOM_CLASS: 2,
    RESORT_AND_BEACH: 3,
    RESTAURANT: 4,
    SWIMMING_POOL: 5
} as const

export type ImageCategory = (typeof IMAGE_CATEGORY)[keyof typeof IMAGE_CATEGORY]
