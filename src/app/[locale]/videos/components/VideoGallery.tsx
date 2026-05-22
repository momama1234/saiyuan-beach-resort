'use client'

import { useMemo, useState } from 'react'

import type { PublicGalleryVideo } from '@/constants/property-video'

import GalleryLightbox from './GalleryLightbox'
import GalleryThumbnail from './GalleryThumbnail'

interface VideoGalleryProps {
    videos: PublicGalleryVideo[]
    labels: {
        featured: string
        gallery: string
        emptyTitle: string
        emptyDescription: string
        uploadPending: string
    }
}

interface GalleryVideoGroups {
    featuredVideo: PublicGalleryVideo | null
    galleryVideos: PublicGalleryVideo[]
    orderedVideos: PublicGalleryVideo[]
    firstGalleryVideoIndex: number
}

const groupGalleryVideos = (videos: PublicGalleryVideo[]): GalleryVideoGroups => {
    const featuredVideo = videos.find((video) => video.isFeatured) ?? null
    const featuredVideoId = featuredVideo?.id
    const galleryVideos = videos.filter((video) => video.id !== featuredVideoId)
    const orderedVideos = featuredVideo ? [featuredVideo, ...galleryVideos] : galleryVideos
    const firstGalleryVideoIndex = featuredVideo ? 1 : 0

    return { featuredVideo, galleryVideos, orderedVideos, firstGalleryVideoIndex }
}

export default function VideoGallery({ videos, labels }: VideoGalleryProps): React.JSX.Element {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const { featuredVideo, galleryVideos, orderedVideos, firstGalleryVideoIndex } = useMemo(
        () => groupGalleryVideos(videos),
        [videos]
    )

    if (videos.length === 0) {
        return (
            <section className="flex min-h-[360px] items-center justify-center bg-[#faf7f2] px-6 py-16 text-center">
                <div className="max-w-xl">
                    <h2 className="font-dm-serif text-2xl text-[#2d1f0f] md:text-3xl">{labels.emptyTitle}</h2>
                    <p className="mt-4 text-base leading-7 text-[#8c7560]">{labels.emptyDescription}</p>
                </div>
            </section>
        )
    }

    return (
        <main className="bg-[#faf7f2]">
            <section className="mx-auto flex w-full max-w-screen-2xl flex-col gap-12 px-4 py-10 md:px-12 md:py-14">
                {featuredVideo && (
                    <div className="flex flex-col gap-5">
                        <h2 className="flex items-center gap-3 text-[11px] font-medium tracking-[0.3em] text-[#c45a1a] uppercase">
                            <span className="h-px w-7 flex-shrink-0 bg-[#c45a1a]" aria-hidden="true" />
                            {labels.featured}
                        </h2>
                        <GalleryThumbnail video={featuredVideo} onClick={() => setSelectedIndex(0)} featured />
                    </div>
                )}

                {galleryVideos.length > 0 && (
                    <div className="flex flex-col gap-7">
                        <div className="flex items-center gap-5">
                            <span className="h-px flex-1 bg-[#e0d5c5]" aria-hidden="true" />
                            <h2 className="flex-shrink-0 text-[11px] font-medium tracking-[0.3em] text-[#8c7560] uppercase">
                                {labels.gallery}
                            </h2>
                            <span className="h-px flex-1 bg-[#e0d5c5]" aria-hidden="true" />
                        </div>
                        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">
                            {galleryVideos.map((video, index) => (
                                <GalleryThumbnail
                                    key={video.id}
                                    video={video}
                                    onClick={() => setSelectedIndex(index + firstGalleryVideoIndex)}
                                    className="gallery-item"
                                />
                            ))}
                        </div>
                    </div>
                )}
            </section>
            <GalleryLightbox
                videos={orderedVideos}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
                uploadLabel={labels.uploadPending}
            />
        </main>
    )
}
