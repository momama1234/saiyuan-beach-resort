'use client'

import Image from 'next/image'

import { type PublicGalleryVideo,VIDEO_SOURCE } from '@/constants/property-video'
import { cn } from '@/lib/utils'

import { getYouTubeThumbnailUrl } from './gallery-video-thumbnail-url'

interface GalleryThumbnailProps {
    video: PublicGalleryVideo
    onClick: () => void
    featured?: boolean
    className?: string
}

const getPlayLabel = (title: string | null): string => {
    return title ? `Play ${title}` : 'Play video'
}

const getThumbnailSrc = (video: PublicGalleryVideo): string | null => {
    if (video.source === VIDEO_SOURCE.YOUTUBE) {
        return getYouTubeThumbnailUrl(video.videoId)
    }

    return video.thumbnailUrl
}

export default function GalleryThumbnail({
    video,
    onClick,
    featured = false,
    className
}: GalleryThumbnailProps): React.JSX.Element {
    const thumbnailSrc = getThumbnailSrc(video)
    const playLabel = getPlayLabel(video.title)

    return (
        <button
            type="button"
            className={cn(
                'group flex w-full flex-col gap-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a1a] focus-visible:ring-offset-4 focus-visible:ring-offset-[#faf7f2]',
                !featured && 'bg-white shadow-sm transition-shadow duration-300 hover:shadow-md',
                className
            )}
            aria-label={playLabel}
            onClick={onClick}>
            <span className="relative flex aspect-video w-full overflow-hidden bg-[#f0e8dc]">
                {thumbnailSrc ? (
                    <Image
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                        src={thumbnailSrc}
                        alt={video.title ?? 'Gallery video thumbnail'}
                        width={1280}
                        height={720}
                    />
                ) : (
                    <div
                        data-testid="gallery-thumbnail-upload-placeholder"
                        className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#c45a1a]/40 bg-[#c45a1a]/5">
                            <svg
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="ml-0.5 h-5 w-5 text-[#c45a1a]"
                                aria-hidden="true">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                        {video.title ? (
                            <>
                                <span
                                    data-testid="gallery-thumbnail-title"
                                    className="text-sm font-medium text-[#4a3826]">
                                    {video.title}
                                </span>
                                {video.description && (
                                    <span className="line-clamp-2 text-xs leading-relaxed text-[#8c7560]">
                                        {video.description}
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className="text-xs font-medium text-[#8c7560]">Play video</span>
                        )}
                    </div>
                )}

                <span className="pointer-events-none absolute inset-0 bg-[#c45a1a] opacity-0 transition-opacity duration-300 group-hover:opacity-[0.08]" />

                {thumbnailSrc && (
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <span
                            className={cn(
                                'flex items-center justify-center rounded-full border border-white/50 bg-black/20 transition-all duration-300 group-hover:scale-110 group-hover:border-white/70 group-hover:bg-black/35',
                                featured ? 'h-20 w-20' : 'h-14 w-14'
                            )}>
                            <svg
                                viewBox="0 0 24 24"
                                fill="white"
                                className={cn('ml-0.5', featured ? 'h-8 w-8' : 'h-5 w-5')}
                                aria-hidden="true">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </span>
                    </span>
                )}

                {featured && (video.title || video.description) && (
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-8 pt-20 pb-8">
                        {video.title && (
                            <span
                                data-testid="gallery-thumbnail-title"
                                className="font-dm-serif block text-2xl text-white italic md:text-4xl">
                                {video.title}
                            </span>
                        )}
                        {video.description && (
                            <span className="mt-2 line-clamp-2 block text-sm leading-relaxed text-white/80">
                                {video.description}
                            </span>
                        )}
                    </span>
                )}

                {!featured && thumbnailSrc && (video.title || video.description) && (
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-4 pt-10 pb-4">
                        {video.title && (
                            <span
                                data-testid="gallery-thumbnail-title"
                                className="line-clamp-1 block text-sm font-semibold text-white md:text-base">
                                {video.title}
                            </span>
                        )}
                        {video.description && (
                            <span className="mt-0.5 line-clamp-1 block text-xs leading-relaxed text-white/75">
                                {video.description}
                            </span>
                        )}
                    </span>
                )}
            </span>
        </button>
    )
}
