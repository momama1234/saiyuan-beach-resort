export const VIDEO_SOURCE = {
    YOUTUBE: 1,
    VIMEO: 2,
    UPLOAD: 3
} as const

export const VIDEO_SOURCE_VALUES = Object.values(VIDEO_SOURCE) as number[]

export type VideoSourceCode = (typeof VIDEO_SOURCE)[keyof typeof VIDEO_SOURCE]

export interface PublicGalleryVideo {
    id: number
    source: number
    videoId: string
    title: string | null
    description: string | null
    isFeatured: boolean
    mediaUrl: string | null
    thumbnailUrl: string | null
}
