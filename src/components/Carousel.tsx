'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

interface CarouselProps {
    images: string[]
    mobileImages?: string[]
    autoPlayInterval?: number
    className?: string
    isOnHomePage?: boolean
    showControls?: boolean
}

const Carousel = ({
    images,
    mobileImages,
    autoPlayInterval = 2000,
    className = 'relative flex h-[40vh] items-center justify-center md:h-screen',
    isOnHomePage = false,
    showControls = true
}: CarouselProps): React.JSX.Element => {
    const [current, setCurrent] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)

    const nextSlide = useCallback(() => {
        setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }, [images.length])

    useEffect(() => {
        if (!isPlaying) return
        const interval = setInterval(() => {
            nextSlide()
        }, autoPlayInterval)
        return () => clearInterval(interval)
    }, [isPlaying, autoPlayInterval, nextSlide])

    const prevSlide = () => {
        setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }

    const togglePlay = () => {
        setIsPlaying((prev) => !prev)
    }

    return (
        <div className={className}>
            {images.map((image, index) => {
                const mobileImage = mobileImages?.[index]
                return (
                    <motion.img
                        key={index}
                        src={image}
                        srcSet={mobileImage ? `${mobileImage} 800w, ${image} 1600w` : undefined}
                        sizes="(max-width: 640px) 100vw, 100vw"
                        alt={`slide-${index}`}
                        className={`absolute size-full object-cover ${index === current ? 'opacity-100' : 'opacity-0'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: index === current ? 1 : 0 }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = Math.abs(offset.x) * velocity.x
                            if (swipe > 1000) prevSlide()
                            if (swipe < -1000) nextSlide()
                        }}
                    />
                )
            })}
            {showControls && <div
                id="carousel-controls"
                className={cn('absolute bottom-4 right-4 flex gap-1 xl:gap-2', isOnHomePage && 'md:bottom-14')}>
                <button
                    className="cursor-pointer rounded-lg bg-black/70 p-1.5 transition-colors hover:bg-black/80 xl:p-3"
                    onClick={prevSlide}
                    aria-label="Previous slide">
                    <ChevronLeft color="white" className="h-5 w-5 xl:h-6 xl:w-6" />
                </button>
                <button
                    className="cursor-pointer rounded-lg bg-black/70 p-1.5 transition-colors hover:bg-black/80 xl:p-3"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}>
                    {isPlaying ? (
                        <Pause color="white" className="h-5 w-5 xl:h-6 xl:w-6" />
                    ) : (
                        <Play color="white" className="h-4 w-4 xl:h-6 xl:w-6" />
                    )}
                </button>
                <button
                    className="cursor-pointer rounded-lg bg-black/70 p-1.5 transition-colors hover:bg-black/80 xl:p-3"
                    onClick={nextSlide}
                    aria-label="Next slide">
                    <ChevronRight color="white" className="h-5 w-5 xl:h-6 xl:w-6" />
                </button>
            </div>}
        </div>
    )
}

export default Carousel
