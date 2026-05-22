'use client'
import '@/features/gallery/styles/lightgallery-custom.css'

import lgFullscreen from 'lightgallery/plugins/fullscreen'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgZoom from 'lightgallery/plugins/zoom'
import LightGallery from 'lightgallery/react'
import { useCallback, useMemo, useRef, useState } from 'react'

interface Album {
    id: string
    name: string
    cover: string
    imageCount: number
}

interface GalleryImage {
    id: string
    src: string
    alt: string
    albumId: string
}

const albums: Album[] = [
    { id: '1', name: 'Resort Views', cover: '🏖️', imageCount: 12 },
    { id: '2', name: 'Rooms & Villas', cover: '🏡', imageCount: 18 },
    { id: '3', name: 'Dining', cover: '🍽️', imageCount: 8 },
    { id: '4', name: 'Activities', cover: '🚤', imageCount: 15 },
    { id: '5', name: 'Beach Life', cover: '🌊', imageCount: 20 },
    { id: '6', name: 'Sunset Views', cover: '🌅', imageCount: 10 }
]

const sampleImages: GalleryImage[] = [
    { id: '1', src: '🏖️', alt: 'Beach view 1', albumId: '1' },
    { id: '2', src: '🌴', alt: 'Palm trees', albumId: '1' },
    { id: '3', src: '🏨', alt: 'Resort building', albumId: '1' },
    { id: '4', src: '🏊‍♂️', alt: 'Swimming pool', albumId: '1' },
    { id: '5', src: '🛏️', alt: 'Bedroom', albumId: '2' },
    { id: '6', src: '🛋️', alt: 'Living room', albumId: '2' },
    { id: '7', src: '🚿', alt: 'Bathroom', albumId: '2' },
    { id: '8', src: '🌺', alt: 'Villa garden', albumId: '2' },
    { id: '9', src: '🍤', alt: 'Seafood dish', albumId: '3' },
    { id: '10', src: '🍹', alt: 'Tropical drink', albumId: '3' },
    { id: '11', src: '🎣', alt: 'Fishing', albumId: '4' },
    { id: '12', src: '🤿', alt: 'Snorkeling', albumId: '4' }
]

const Gallery = (): React.JSX.Element => {
    const [selectedAlbum, setSelectedAlbum] = useState<string>('1')
    const lightGalleryRef = useRef<{ openGallery: (index: number) => void } | null>(null)

    const getImagesForAlbum = useCallback((albumId: string) => {
        return sampleImages.filter((img) => img.albumId === albumId)
    }, [])

    const selectedAlbumData = albums.find((album) => album.id === selectedAlbum)
    const albumImages = useMemo(() => getImagesForAlbum(selectedAlbum), [selectedAlbum, getImagesForAlbum])

    const emojiToDataUrl = useCallback((emoji: string): string => {
        if (typeof document === 'undefined') return ''

        try {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) return ''

            canvas.width = 400
            canvas.height = 400

            ctx.fillStyle = '#f3f4f6'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            ctx.font = '200px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(emoji, canvas.width / 2, canvas.height / 2)

            return canvas.toDataURL('image/png')
        } catch (error) {
            console.error('Error converting emoji to data URL:', error)
            return ''
        }
    }, [])

    const handleImageClick = (imageId: string) => {
        const imageIndex = albumImages.findIndex((img) => img.id === imageId)
        if (imageIndex === -1) {
            console.warn('Image not found:', imageId)
            return
        }

        if (lightGalleryRef.current) {
            try {
                lightGalleryRef.current.openGallery(imageIndex)
            } catch (error) {
                console.error('Error opening lightgallery:', error)
            }
        } else {
            console.warn('LightGallery not initialized yet')
        }
    }

    const lightGalleryItems = useMemo(() => {
        return albumImages
            .map((image) => {
                const isEmoji = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(image.src)
                const imageSrc = isEmoji ? emojiToDataUrl(image.src) : image.src

                if (!imageSrc) return null

                return {
                    src: imageSrc,
                    thumb: imageSrc,
                    subHtml: `<div class="lg-sub-html"><p>${image.alt}</p></div>`
                }
            })
            .filter((item): item is NonNullable<typeof item> => item !== null)
    }, [albumImages, emojiToDataUrl])

    return (
        <>
            {/* Gallery Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid min-h-[600px] grid-cols-1 gap-8 lg:grid-cols-4">
                    {/* Left Column - Albums */}
                    <div className="lg:col-span-1">
                        <h2 className="mb-6 text-2xl font-bold text-gray-800">Albums</h2>
                        <div className="space-y-4">
                            {albums.map((album) => (
                                <div
                                    key={album.id}
                                    onClick={() => setSelectedAlbum(album.id)}
                                    className={`
                             cursor-pointer rounded-lg bg-white p-4 shadow-md transition-all duration-200
                             ${
                                 selectedAlbum === album.id
                                     ? 'border-2 border-orange-500 shadow-lg'
                                     : 'border border-gray-200 hover:shadow-lg'
                             }
                         `}>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-4xl">{album.cover}</div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800">{album.name}</h3>
                                            <p className="text-sm text-gray-500">{album.imageCount} photos</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Images */}
                    <div className="lg:col-span-3">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800">{selectedAlbumData?.name}</h2>
                            <span className="text-gray-500">{albumImages.length} photos</span>
                        </div>

                        {/* Image Grid */}
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                            {albumImages.map((image) => (
                                <div
                                    key={image.id}
                                    onClick={() => handleImageClick(image.id)}
                                    className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-200 hover:shadow-lg">
                                    <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                        <div className="text-6xl">{image.src}</div>
                                    </div>
                                    <div className="p-3">
                                        <p className="truncate text-sm text-gray-600">{image.alt}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {albumImages.length === 0 && (
                            <div className="rounded-lg bg-white p-12 text-center shadow-md">
                                <div className="mb-4 text-6xl">📷</div>
                                <h3 className="mb-2 text-xl font-semibold text-gray-600">No photos yet</h3>
                                <p className="text-gray-500">This album is empty. Check back later for updates!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* LightGallery Component */}
            {lightGalleryItems.length > 0 && (
                <LightGallery
                    key={`gallery-${selectedAlbum}`}
                    onInit={(detail) => {
                        if (detail && detail.instance) {
                            lightGalleryRef.current = detail.instance
                        }
                    }}
                    speed={500}
                    plugins={[lgThumbnail, lgZoom, lgFullscreen]}
                    elementClassNames="hidden"
                    mode="lg-slide"
                    closable={true}
                    loop={true}
                    escKey={true}
                    keyPress={true}
                    controls={true}
                    download={true}
                    counter={true}
                    enableSwipe={true}
                    enableDrag={true}
                    dynamic={true}
                    galleryId={`gallery-main-${selectedAlbum}`}
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
            )}
        </>
    )
}

export default Gallery
