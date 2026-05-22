import { OPEN_PROPERTY_GALLERY_IMAGES_API_PATH } from '@/constants/path'
import { getDataWithToken } from '@/lib/api'
import type { DisplayImageVariants } from '@/types/room-management'

interface PropertyGalleryImage {
    id: number
    imageUrl: string
    url: string
    rank: number
    displayImage: DisplayImageVariants
}

/**
 * Fetches guest-facing property gallery images from the public API.
 * @returns Array of image URLs sorted by sortOrder, or empty array if none found
 */
export async function fetchPropertyImages(): Promise<string[]> {
    try {
        const images = await getDataWithToken<PropertyGalleryImage[]>(OPEN_PROPERTY_GALLERY_IMAGES_API_PATH, undefined, 300)

        if (Array.isArray(images) && images.length > 0) {
            return [...images]
                .sort((left, right) => left.rank - right.rank)
                .map((image) => image.displayImage?.hero?.url || image.displayImage?.card?.url || image.url)
                .filter(Boolean)
        }

        return []
    } catch (error) {
        console.error('Error fetching property images:', error)
        return []
    }
}
