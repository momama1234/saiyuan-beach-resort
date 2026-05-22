import type { DisplayImageVariants } from '@/types/room-management'

export const DEFAULT_PROMOTION_IMAGE_URL = '/images/default-image.jpg'

export type PromotionImageSource = {
    imageUrl?: string | null
    displayImage?: DisplayImageVariants | null
}

export function getPromotionImageUrl(promotion: PromotionImageSource): string {
    return promotion.displayImage?.card?.url || DEFAULT_PROMOTION_IMAGE_URL
}

export function shouldBypassNextImageOptimization(src: string): boolean {
    try {
        const url = new URL(src)
        return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
        return false
    }
}
