'use client'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import { ImageOff } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { CSSProperties, useState } from 'react'
import { A11y, Autoplay, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

interface Props {
    images: string[]
    roomName: string
    navColor?: string
    paginationColor?: string
    paginationBottom?: string
}

export default function RoomImagesCarousel({
    images,
    roomName,
    navColor = '#f96800ff',
    paginationColor = '#d60000ff',
    paginationBottom = '8px'
}: Props) {
    const t = useTranslations('Reservations')
    const [failedIndices, setFailedIndices] = useState<Set<number>>(new Set())

    if (!images || images.length === 0) {
        return (
            <div className="relative flex h-48 w-full flex-col items-center justify-center rounded-lg bg-gray-100 sm:h-64 md:h-72">
                <ImageOff className="mb-2 h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-500">No images available</p>
            </div>
        )
    }

    return (
        <div className="carousel-dark-nav">
        <style>{`
            .carousel-dark-nav .swiper-button-prev,
            .carousel-dark-nav .swiper-button-next {
                width: 32px;
                height: 32px;
                background: rgba(201, 201, 201, 0.85);
                border-radius: 50%;
            }
            .carousel-dark-nav .swiper-button-prev::after,
            .carousel-dark-nav .swiper-button-next::after {
                font-size: 12px;
                font-weight: 700;
                color: #000000ff;
            }
        `}</style>
        <Swiper
            modules={[Navigation, Pagination, A11y, Autoplay]}
            navigation
            autoplay={{ delay: 8000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            pagination={{ type: 'fraction' }}
            spaceBetween={8}
            slidesPerView={1}
            loop={images.length > 1}
            className="relative h-48 w-full rounded-lg sm:h-64 md:h-72"
            style={{
                ['--swiper-navigation-color' as keyof CSSProperties]: navColor,
                ['--swiper-pagination-color' as keyof CSSProperties]: paginationColor,
                ['--swiper-pagination-bottom' as keyof CSSProperties]: paginationBottom
            }}>
            {images.map((src, i) => (
                <SwiperSlide key={i} className="relative h-full w-full">
                    {failedIndices.has(i) ? (
                        <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-gray-100">
                            <ImageOff className="mb-2 h-12 w-12 text-gray-400" />
                        </div>
                    ) : (
                        <Image
                            src={src}
                            alt={t('roomImageAlt', { roomName, index: i + 1 })}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            quality={85}
                            priority={i === 0}
                            className="rounded-lg object-cover"
                            onError={() =>
                                setFailedIndices((prev) => new Set(prev).add(i))
                            }
                        />
                    )}
                </SwiperSlide>
            ))}
        </Swiper>
        </div>
    )
}
