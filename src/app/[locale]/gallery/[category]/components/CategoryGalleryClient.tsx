'use client'

import GalleryGrid from '@/components/GalleryGrid'
import { useRouter } from '@/i18n/routing'

interface CategoryGalleryClientProps {
    images: Array<{
        src: string
        alt: string
        title?: string
    }>
    categoryName: string
}

const CategoryGalleryClient = ({ images, categoryName }: CategoryGalleryClientProps): React.JSX.Element => {
    const router = useRouter()

    const handleBack = () => {
        router.push('/gallery')
    }

    return <GalleryGrid images={images} isHideDetails={true} categoryName={categoryName} onBack={handleBack} />
}

export default CategoryGalleryClient
