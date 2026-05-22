import { FacebookIcon, InstagramIcon } from '@/ui/icons'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'

import MenuWrapper from '@/components/menu/MenuWrapper'
import { OPEN_GALLERY_CATEGORIES_API_PATH, OPEN_IMAGES_BY_CATEGORY_API_PATH } from '@/constants/path'
import { getDataWithToken } from '@/lib/api'
import { generateSEOMetadata, getAlternateLocales, SEO_CONFIG } from '@/lib/seo'
import { createSlugFromName } from '@/lib/utils'
import { Image as ImageType } from '@/types/room-management'

import GalleryPageClient from './components/GalleryPageClient'
import { getGalleryPreviewImageUrl } from './gallery-image-url'

interface GalleryPageProps {
    params: Promise<{ locale: string }>
}

interface GalleryCategory {
    id: number
    name: string
    label: string
    description: string | null
    displayOrder: number
    isActive: boolean
}

export async function generateMetadata({ params }: GalleryPageProps) {
    const { locale } = await params
    const config = SEO_CONFIG.gallery[locale as keyof typeof SEO_CONFIG.gallery] || SEO_CONFIG.gallery.en

    return generateSEOMetadata({
        ...config,
        canonical: locale === 'en' ? '/gallery' : `/${locale}/gallery`,
        locale,
        alternateLocales: getAlternateLocales('/gallery'),
        image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1920&q=85'
    })
}

const GalleryPage = async ({ params }: GalleryPageProps): Promise<React.JSX.Element> => {
    const { locale } = await params
    setRequestLocale(locale)
    const t = await getTranslations('Gallery')

    let galleryItems: Array<{
        id: number
        image: string
        title: string
        description: string
        category: string
    }> = []

    try {
        const categories = await getDataWithToken<GalleryCategory[]>(OPEN_GALLERY_CATEGORIES_API_PATH)

        if (categories && Array.isArray(categories)) {
            // Filter out PROPERTY category (by name) and only show active categories
            const activeCategories = categories.filter((cat) => cat.isActive && cat.name !== 'PROPERTY')

            const itemsWithImages = await Promise.all(
                activeCategories.map(async (category) => {
                    try {
                        // Use limit query parameter - only fetch first image for performance
                        const images = await getDataWithToken<ImageType[]>(
                            `${OPEN_IMAGES_BY_CATEGORY_API_PATH}/${category.id}?limit=1`
                        )

                        const firstImage = images?.[0]

                        // Return null if no images found (will be filtered out)
                        const imageUrl = firstImage ? getGalleryPreviewImageUrl(firstImage) : null
                        if (!imageUrl) {
                            return null
                        }

                        return {
                            id: category.id,
                            image: imageUrl,
                            title: category.label || category.name,
                            description: category.description || '',
                            category: createSlugFromName(category.name)
                        }
                    } catch (error) {
                        console.error(`Failed to load images for category ${category.id}:`, error)

                        // Return null instead of placeholder image
                        return null
                    }
                })
            )

            galleryItems = Array.isArray(itemsWithImages)
                ? itemsWithImages
                      .filter((item): item is NonNullable<typeof item> => item !== null)
                      .filter((item) => item.image !== 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1920&q=85')
                      .sort((a, b) => {
                          const categoryA = activeCategories.find((cat) => cat.id === a.id)
                          const categoryB = activeCategories.find((cat) => cat.id === b.id)
                          return (categoryA?.displayOrder || 0) - (categoryB?.displayOrder || 0)
                      })
                : []
        }
    } catch (error) {
        console.error('Failed to load gallery categories:', error)
        galleryItems = []
    }

    return (
        <div className="flex min-h-screen flex-col bg-black">
            <MenuWrapper />
            {/* Hero Image */}
            <div className="relative h-[400px] w-full flex-shrink-0">
                <Image
                    alt="Saiyuan Beach Resort gallery"
                    className="h-[400px] w-full object-cover"
                    height={400}
                    src="https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1920&q=85"
                    width={1920}
                    priority
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex w-full flex-col items-center justify-center gap-4 bg-black/50 px-12 py-12 text-center font-light text-white">
                        <span className="text-xl font-medium xl:text-3xl">{t('title')}</span>
                        <span className="text-lg font-light xl:text-xl">{t('gallerySubtitle')}</span>
                    </span>
                </div>
            </div>
            {/* EndHero Image */}

            {/* Share bar */}
            <div className="relative flex flex-shrink-0 items-center justify-center space-x-3 bg-[#1a1a1a] py-3">
                <span className="text-base font-light tracking-wide text-white">SHARE @</span>
                <a aria-label="Facebook" className="cursor-pointer text-gray-400 hover:text-white" href="#">
                    <FacebookIcon className="text-lg text-white" />
                </a>
                <a aria-label="Instagram" className="cursor-pointer text-gray-400 hover:text-white" href="#">
                    <InstagramIcon className="text-lg text-white" />
                </a>
            </div>
            {/* End Share bar */}

            {/* Images grid */}
            <GalleryPageClient galleryItems={galleryItems} />
            {/* End Images grid */}
        </div>
    )
}

export default GalleryPage
