import {
    OPEN_GALLERY_CATEGORIES_API_PATH,
    OPEN_IMAGES_BY_CATEGORY_API_PATH,
    OPEN_ROOM_CLASSES_LIST_API_PATH
} from '@/constants/path'
import { getDataWithToken } from '@/lib/api'
import { RoomClassWithSlug } from '@/types/room'
import { Image as ImageType } from '@/types/room-management'

import Menu from './Menu'

interface GalleryCategory {
    id: number
    name: string
    label: string
    description: string | null
    displayOrder: number
    isActive: boolean
}

async function getRoomClasses(): Promise<RoomClassWithSlug[]> {
    try {
        const isBuild = process.env.NEXT_PHASE === 'phase-production-build'
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), isBuild ? 3000 : 10000)

        const result = await getDataWithToken<RoomClassWithSlug[]>(OPEN_ROOM_CLASSES_LIST_API_PATH, controller.signal)

        clearTimeout(timeoutId)
        return result || []
    } catch (error) {
        console.error('Error fetching room classes:', error)
        return []
    }
}

async function getGalleryCategories(): Promise<GalleryCategory[]> {
    try {
        const isBuild = process.env.NEXT_PHASE === 'phase-production-build'
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), isBuild ? 3000 : 10000)

        const result = await getDataWithToken<GalleryCategory[]>(OPEN_GALLERY_CATEGORIES_API_PATH, controller.signal)

        clearTimeout(timeoutId)

        if (!result || !Array.isArray(result)) {
            return []
        }

        // Filter out PROPERTY category (by name) and only return active categories, sorted by displayOrder
        const activeCategories = result
            .filter((cat) => cat.isActive && cat.name !== 'PROPERTY')
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))

        // Filter out categories that have no images
        const categoriesWithImages = await Promise.all(
            activeCategories.map(async (category) => {
                try {
                    const imageController = new AbortController()
                    const imageTimeoutId = setTimeout(() => imageController.abort(), isBuild ? 2000 : 8000)

                    // Use limit query parameter - only fetch first image for performance
                    const images = await getDataWithToken<ImageType[]>(
                        `${OPEN_IMAGES_BY_CATEGORY_API_PATH}/${category.id}?limit=1`,
                        imageController.signal
                    )

                    clearTimeout(imageTimeoutId)

                    // Return category only if it has at least one image
                    if (images && Array.isArray(images) && images.length > 0 && images[0]?.url) {
                        return category
                    }
                    return null
                } catch (error) {
                    console.error('Error fetching images for category:', category.name, error)

                    // If error fetching images, exclude this category
                    return null
                }
            })
        )

        return categoriesWithImages.filter((cat): cat is GalleryCategory => cat !== null)
    } catch (error) {
        console.error('Error fetching gallery categories:', error)

        return [] // Always return empty array on error to prevent crashes
    }
}

const MenuWrapper = async (): Promise<React.JSX.Element> => {
    const roomClasses = await getRoomClasses()
    const galleryCategories = await getGalleryCategories()
    return <Menu roomClasses={roomClasses} galleryCategories={galleryCategories} />
}

export default MenuWrapper
