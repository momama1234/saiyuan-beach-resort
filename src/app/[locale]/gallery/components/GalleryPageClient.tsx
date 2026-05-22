'use client'

import '@/features/gallery/styles/lightgallery-custom.css'

import lgFullscreen from 'lightgallery/plugins/fullscreen'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgZoom from 'lightgallery/plugins/zoom'
import { useEffect, useRef, useState } from 'react'

import { Image as ImageType } from '@/types/room-management'

import { getGalleryFullImageUrl, getGalleryPreviewImageUrl } from '../gallery-image-url'
import { GalleryItem } from './GalleryItem'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/v1'
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ''
const PUBLIC_KEY = process.env.NEXT_PUBLIC_API_PUBLIC_KEY || ''

interface GalleryPageClientProps {
    galleryItems: Array<{
        id: number
        image: string
        title: string
        description: string
        category: string
    }>
}

export default function GalleryPageClient({ galleryItems }: GalleryPageClientProps) {
    const lgContainerRef = useRef<HTMLDivElement>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lgInstanceRef = useRef<any>(null)
    const [loadingCategoryId, setLoadingCategoryId] = useState<number | null>(null)
    const scrollYRef = useRef(0)

    useEffect(() => {
        const container = lgContainerRef.current
        if (!container) return

        const lockScroll = () => {
            scrollYRef.current = window.scrollY
            document.body.style.overflow = 'hidden'
            document.body.style.position = 'fixed'
            document.body.style.top = `-${scrollYRef.current}px`
            document.body.style.width = '100%'
        }
        const unlockScroll = () => {
            document.body.style.overflow = ''
            document.body.style.position = ''
            document.body.style.top = ''
            document.body.style.width = ''
            window.scrollTo(0, scrollYRef.current)
        }

        container.addEventListener('lgBeforeOpen', lockScroll)
        container.addEventListener('lgAfterClose', unlockScroll)
        return () => {
            container.removeEventListener('lgBeforeOpen', lockScroll)
            container.removeEventListener('lgAfterClose', unlockScroll)
            unlockScroll()
            lgInstanceRef.current?.destroy()
        }
    }, [])

    const handleCategoryClick = async (categoryId: number) => {
        if (loadingCategoryId !== null) return
        setLoadingCategoryId(categoryId)
        try {
            const res = await fetch(`${API_URL}/open/images-by-category/${categoryId}`, {
                headers: {
                    'x-api-key': API_KEY,
                    'x-public-key': PUBLIC_KEY
                },
                cache: 'no-cache'
            })
            const images: ImageType[] = await res.json()
            const items = images
                .filter((img) => img.displayImage || img.url)
                .map((img) => ({
                    src: getGalleryFullImageUrl(img),
                    thumb: getGalleryPreviewImageUrl(img),
                    subHtml: ''
                }))

            if (!lgContainerRef.current || items.length === 0) return

            // Destroy previous instance before creating new one with fresh items
            lgInstanceRef.current?.destroy()

            const { default: lightGallery } = await import('lightgallery')

            lgInstanceRef.current = lightGallery(lgContainerRef.current, {
                dynamic: true,
                dynamicEl: items,
                plugins: [lgThumbnail, lgZoom, lgFullscreen],
                speed: 500,
                loop: true,
                counter: true,
                controls: true,
                enableSwipe: true,
                enableDrag: true,
                closable: true,
                escKey: true,
                keyPress: true,
                download: false,
                mobileSettings: {
                    controls: true,
                    showCloseIcon: true,
                    download: false,
                    counter: true
                }
            })

            lgInstanceRef.current.openGallery(0)
        } catch (e) {
            console.error('Failed to load gallery images:', e)
        } finally {
            setLoadingCategoryId(null)
        }
    }

    const totalItems = galleryItems.length

    return (
        <>
            <div ref={lgContainerRef} className="hidden" />
            <div id="gallery-grid" className="grid flex-1 grid-cols-2 gap-0 bg-black md:grid-cols-3">
                {galleryItems.map((item, index) => {
                    const mobileRemainder = totalItems % 2
                    const desktopRemainder = totalItems % 3
                    const isLastRowMobile = mobileRemainder !== 0 && index >= totalItems - mobileRemainder
                    const isLastRowDesktop = desktopRemainder !== 0 && index >= totalItems - desktopRemainder

                    let mobileSpanClass = ''
                    let desktopSpanClass = ''

                    if (isLastRowMobile && mobileRemainder === 1) {
                        mobileSpanClass = 'col-span-2 md:col-span-1'
                    }

                    if (isLastRowDesktop) {
                        if (desktopRemainder === 1) {
                            desktopSpanClass = 'md:col-span-3'
                        } else if (desktopRemainder === 2 && index === totalItems - 2) {
                            desktopSpanClass = 'md:col-span-2'
                        }
                    }

                    const spanClass = [mobileSpanClass, desktopSpanClass].filter(Boolean).join(' ')

                    return (
                        <GalleryItem
                            key={item.id}
                            item={item}
                            className={spanClass}
                            isLoading={loadingCategoryId === item.id}
                            onClick={() => handleCategoryClick(item.id)}
                        />
                    )
                })}
            </div>
        </>
    )
}
