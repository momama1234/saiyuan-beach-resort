'use client'

import { ChevronLeft, ChevronRight, PlayCircle, X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useRef } from 'react'

import { type PublicGalleryVideo,VIDEO_SOURCE } from '@/constants/property-video'
import { cn } from '@/lib/utils'

import { buildYouTubeEmbedUrl } from './gallery-video-embed-url'
import { getYouTubeThumbnailUrl } from './gallery-video-thumbnail-url'

interface GalleryLightboxProps {
    videos: PublicGalleryVideo[]
    selectedIndex: number | null
    onSelect: (selectedIndex: number | null) => void
    uploadLabel: string
}

interface GalleryVideoPlayerProps {
    video: PublicGalleryVideo
    uploadLabel: string
}

interface LightboxNavigationButtonProps {
    direction: 'previous' | 'next'
    isEnabled: boolean
    onClick: () => void
}

interface ThumbnailStripItemProps {
    video: PublicGalleryVideo
    index: number
    isSelected: boolean
    onClick: () => void
}

const PLAYER_CLASS_NAME = 'aspect-video max-h-[62vh] w-full bg-neutral-950 object-contain'

const getSelectedVideo = (videos: PublicGalleryVideo[], selectedIndex: number | null): PublicGalleryVideo | null => {
    if (selectedIndex === null) {
        return null
    }

    return videos[selectedIndex] ?? null
}

const getStripThumbnailSrc = (video: PublicGalleryVideo): string | null => {
    if (video.source === VIDEO_SOURCE.YOUTUBE) {
        return getYouTubeThumbnailUrl(video.videoId)
    }

    return video.thumbnailUrl
}

const GalleryVideoPlayer = ({ video, uploadLabel }: GalleryVideoPlayerProps): React.JSX.Element => {
    if (video.source === VIDEO_SOURCE.YOUTUBE) {
        return (
            <iframe
                className={PLAYER_CLASS_NAME}
                src={buildYouTubeEmbedUrl(video.videoId)}
                title="YouTube gallery video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            />
        )
    }

    if (video.source === VIDEO_SOURCE.UPLOAD && video.mediaUrl) {
        return (
            <video
                className={PLAYER_CLASS_NAME}
                controls
                autoPlay
                preload="auto"
                src={video.mediaUrl}
                aria-label={uploadLabel}
            />
        )
    }

    return (
        <div className={cn(PLAYER_CLASS_NAME, 'flex flex-col items-center justify-center gap-3 text-center')}>
            <PlayCircle className="h-12 w-12 text-[#0a6570]" aria-hidden="true" />
            <span className="px-6 text-sm text-neutral-300">{uploadLabel}</span>
        </div>
    )
}

const ThumbnailStripItem = ({ video, index, isSelected, onClick }: ThumbnailStripItemProps): React.JSX.Element => {
    const src = getStripThumbnailSrc(video)

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'relative aspect-video w-[88px] flex-shrink-0 overflow-hidden rounded-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
                isSelected
                    ? 'scale-[1.06] opacity-100 ring-2 ring-[#c45a1a] ring-offset-1 ring-offset-neutral-900'
                    : 'opacity-50 hover:opacity-80'
            )}
            aria-label={video.title ?? `Video ${index + 1}`}
            aria-current={isSelected ? 'true' : undefined}>
            {src ? (
                <Image
                    src={src}
                    alt={video.title ?? ''}
                    fill
                    className="object-cover"
                    sizes="88px"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-800">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-white/30" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            )}
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span
                    className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full bg-black/50 transition-colors',
                        isSelected && 'bg-[#c45a1a]/80'
                    )}>
                    <svg viewBox="0 0 24 24" fill="white" className="ml-0.5 h-2.5 w-2.5" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </span>
            </span>
        </button>
    )
}

const LightboxNavigationButton = ({
    direction,
    isEnabled,
    onClick
}: LightboxNavigationButtonProps): React.JSX.Element => {
    const Icon = direction === 'previous' ? ChevronLeft : ChevronRight
    const label = direction === 'previous' ? 'Previous video' : 'Next video'

    return (
        <button
            type="button"
            className={cn(
                'flex h-11 w-11 items-center justify-center transition focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none',
                isEnabled ? 'text-white hover:bg-white/10' : 'cursor-not-allowed text-white/30'
            )}
            aria-label={label}
            disabled={!isEnabled}
            onClick={onClick}>
            <Icon className="h-7 w-7" aria-hidden="true" />
        </button>
    )
}

export default function GalleryLightbox({
    videos,
    selectedIndex,
    onSelect,
    uploadLabel
}: GalleryLightboxProps): React.JSX.Element | null {
    const selectedVideo = getSelectedVideo(videos, selectedIndex)
    const isOpen = selectedVideo !== null
    const canGoPrevious = selectedIndex !== null && selectedIndex > 0
    const canGoNext = selectedIndex !== null && selectedIndex < videos.length - 1
    const stripRef = useRef<HTMLDivElement>(null)

    const goPrevious = useCallback(() => {
        if (canGoPrevious && selectedIndex !== null) {
            onSelect(selectedIndex - 1)
        }
    }, [canGoPrevious, onSelect, selectedIndex])

    const goNext = useCallback(() => {
        if (canGoNext && selectedIndex !== null) {
            onSelect(selectedIndex + 1)
        }
    }, [canGoNext, onSelect, selectedIndex])

    useEffect(() => {
        if (selectedIndex === null || !stripRef.current) {
            return
        }

        const item = stripRef.current.children[selectedIndex] as HTMLElement | undefined
        item?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }, [selectedIndex])

    useEffect(() => {
        if (!isOpen) {
            return
        }

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) {
            return
        }

        const handleKeyDown = (event: KeyboardEvent): void => {
            switch (event.key) {
                case 'Escape':
                    onSelect(null)
                    return
                case 'ArrowLeft':
                    goPrevious()
                    return
                case 'ArrowRight':
                    goNext()
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [goNext, goPrevious, isOpen, onSelect])

    if (!isOpen || selectedVideo === null) {
        return null
    }

    return (
        <div
            className="fixed inset-0 z-[9999] flex flex-col bg-neutral-950/95 text-white"
            role="dialog"
            aria-modal="true"
            aria-label={selectedVideo.title ?? 'Gallery video'}>
            <header className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 md:px-6">
                <div className="min-w-0">
                    {selectedVideo.title && (
                        <h2 className="truncate text-base font-semibold md:text-lg">{selectedVideo.title}</h2>
                    )}
                </div>
                <button
                    type="button"
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-white transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                    aria-label="Close video"
                    onClick={() => onSelect(null)}>
                    <X className="h-5 w-5" aria-hidden="true" />
                </button>
            </header>

            <div className="grid min-h-0 flex-1 grid-cols-[auto_1fr_auto] items-center gap-2 px-2 pb-2 md:gap-4 md:px-6">
                <LightboxNavigationButton direction="previous" isEnabled={canGoPrevious} onClick={goPrevious} />

                <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-4">
                    <GalleryVideoPlayer video={selectedVideo} uploadLabel={uploadLabel} />
                    {selectedVideo.description ? (
                        <p className="w-full max-w-3xl text-sm leading-6 break-words whitespace-pre-wrap text-neutral-200 md:text-base">
                            {selectedVideo.description}
                        </p>
                    ) : null}
                </div>

                <LightboxNavigationButton direction="next" isEnabled={canGoNext} onClick={goNext} />
            </div>

            {videos.length > 1 && (
                <div className="flex-shrink-0 border-t border-white/10 bg-neutral-900/80">
                    <div
                        ref={stripRef}
                        className="flex gap-2 overflow-x-auto px-4 py-3 [&::-webkit-scrollbar]:hidden"
                        style={{ scrollbarWidth: 'none' }}>
                        {videos.map((video, index) => (
                            <ThumbnailStripItem
                                key={video.id}
                                video={video}
                                index={index}
                                isSelected={index === selectedIndex}
                                onClick={() => onSelect(index)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}