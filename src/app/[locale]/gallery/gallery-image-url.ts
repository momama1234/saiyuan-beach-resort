import type { Image } from '@/types/room-management'

export function getGalleryPreviewImageUrl(image: Image): string {
    return image.displayImage?.thumbnail?.url || image.displayImage?.card?.url || image.displayImage?.hero?.url || image.url
}

export function getGalleryFullImageUrl(image: Image): string {
    return image.displayImage?.original?.url || image.displayImage?.hero?.url || image.url
}
