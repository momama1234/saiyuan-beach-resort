import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { JSX } from 'react'

import Logo from '@/components/Logo'
import MenuWrapper from '@/components/menu/MenuWrapper'
import { getDataWithToken } from '@/lib/api'
import { generateSEOMetadata, getAlternateLocales } from '@/lib/seo'
import { createSlugFromName } from '@/lib/utils'
import { Image } from '@/types/room-management'

import { getGalleryFullImageUrl } from '../gallery-image-url'
import CategoryGalleryClient from './components/CategoryGalleryClient'

interface CategoryGalleryProps {
    params: Promise<{ locale: string; category: string }>
}

interface GalleryCategory {
    id: number
    name: string
    label: string
    description: string | null
    displayOrder: number
    isActive: boolean
}

export async function generateMetadata({ params }: CategoryGalleryProps) {
    const { locale, category } = await params
    const categoryTitle = category
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

    return generateSEOMetadata({
        title: `${categoryTitle} Gallery | Saiyuan Beach Resort`,
        description: `Explore our ${categoryTitle} photo gallery at Saiyuan Beach Resort on Koh Libong Island.`,
        canonical: locale === 'en' ? `/gallery/${category}` : `/${locale}/gallery/${category}`,
        locale,
        alternateLocales: getAlternateLocales(`/gallery/${category}`)
    })
}

const CategoryGallery = async ({ params }: CategoryGalleryProps): Promise<JSX.Element> => {
    const { locale, category } = await params

    setRequestLocale(locale)

    const categories = await getDataWithToken<GalleryCategory[]>('/open/gallery-categories')

    if (!categories || !Array.isArray(categories)) {
        notFound()
    }

    const activeCategories = categories.filter((cat) => cat.isActive)
    const matchedCategory = activeCategories.find((cat) => createSlugFromName(cat.name) === category)

    if (!matchedCategory) {
        notFound()
    }

    const images = await getDataWithToken<Image[]>(`/open/images-by-category/${matchedCategory.id}`)

    return (
        <div className="bg-black">
            <div className="relative h-screen w-full">
                <MenuWrapper />
                <Logo />
                <div className="relative z-10 h-dvh w-full p-0">
                    {images && images.length > 0 ? (
                        <CategoryGalleryClient
                            images={images.map((image: Image) => {
                                const src = getGalleryFullImageUrl(image)
                                const filename = src.split('/').pop()?.split('?')[0] || `Image ${image.id}`
                                const displayName =
                                    filename.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '').replace(/[-_]/g, ' ') ||
                                    `Image ${image.id}`

                                return {
                                    src,
                                    alt: displayName,
                                    title: displayName
                                }
                            })}
                            categoryName={matchedCategory.label || matchedCategory.name}
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-gray-500">No images found for this category</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CategoryGallery
