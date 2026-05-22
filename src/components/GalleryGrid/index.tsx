'use client'

import '@/features/gallery/styles/lightgallery-custom.css'

import lgFullscreen from 'lightgallery/plugins/fullscreen'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgZoom from 'lightgallery/plugins/zoom'
import LightGallery from 'lightgallery/react'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

interface GalleryImage {
    src: string
    alt: string
    title?: string
}

interface GalleryGridProps {
    images: GalleryImage[]
    className?: string
    isHideDetails?: boolean
    categoryName?: string
    onBack?: () => void
}

const GalleryGrid = ({
    images,
    className = '',
    categoryName,
    onBack
}: GalleryGridProps): React.JSX.Element => {
    const [isMobile, setIsMobile] = useState(false)
    const lightGalleryRef = useRef<{ openGallery: (_index: number) => void } | null>(null)
    const scrollYRef = useRef(0)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const handleLgBeforeOpen = () => {
        scrollYRef.current = window.scrollY
        document.body.style.overflow = 'hidden'
        document.body.style.position = 'fixed'
        document.body.style.top = `-${scrollYRef.current}px`
        document.body.style.width = '100%'
    }

    const handleLgAfterClose = () => {
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollYRef.current)
    }

    const handleImageClick = (index: number) => {
        if (lightGalleryRef.current) {
            lightGalleryRef.current.openGallery(index)
        }
    }

    const lightGalleryItems = images.map((image) => ({
        src: image.src,
        thumb: image.src,
        subHtml: ''
    }))

    return (
        <>
            <div className={cn('h-dvh w-full overflow-hidden bg-black', className)}>
                {/* Header — category name + back button */}
                {(categoryName || onBack) && (
                    <div className="fixed top-[42px] right-0 left-0 z-30 border-b border-gray-800 bg-black">
                        <div className="flex items-center gap-3 px-4 py-3">
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className="flex-shrink-0 p-2 text-white transition-colors hover:text-[#E0A458]"
                                    aria-label="Go back">
                                    <ArrowLeft size={20} />
                                </button>
                            )}
                            {categoryName && (
                                <h1 className="flex-1 truncate text-lg font-medium text-white">{categoryName}</h1>
                            )}
                        </div>
                    </div>
                )}

                {/* Photo grid — masonry columns, same on mobile & desktop */}
                <div
                    className={cn(
                        'absolute left-0 right-0 bottom-0 overflow-y-auto bg-black',
                        'columns-2 gap-2 p-2 md:columns-3 lg:columns-4',
                        categoryName || onBack ? 'top-[98px]' : 'top-[42px]'
                    )}>
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="group relative mb-2 cursor-pointer break-inside-avoid overflow-hidden rounded"
                            onClick={() => handleImageClick(index)}>
                            <img
                                src={image.src}
                                alt={image.alt}
                                className="h-auto w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* LightGallery */}
            <LightGallery
                onInit={(detail) => {
                    lightGalleryRef.current = detail.instance
                }}
                onBeforeOpen={handleLgBeforeOpen}
                onAfterClose={handleLgAfterClose}
                speed={500}
                plugins={[lgThumbnail, lgZoom, lgFullscreen]}
                elementClassNames="hidden"
                mode="lg-slide"
                closable={true}
                loop={true}
                escKey={true}
                keyPress={true}
                controls={true}
                download={!isMobile}
                counter={true}
                enableSwipe={true}
                enableDrag={true}
                dynamic={true}
                galleryId="gallery-grid"
                mobileSettings={{
                    controls: true,
                    showCloseIcon: true,
                    download: false,
                    counter: true,
                    thumbnail: true,
                    fullScreen: true
                }}
                dynamicEl={lightGalleryItems}
            />
        </>
    )
}

export default GalleryGrid
