import { fireEvent, render, screen } from '@testing-library/react'
import type { ImgHTMLAttributes } from 'react'

import { type PublicGalleryVideo,VIDEO_SOURCE } from '@/constants/property-video'

import GalleryThumbnail from './GalleryThumbnail'

jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ alt, src, ...props }: ImgHTMLAttributes<HTMLImageElement>) => <img alt={alt} src={src} {...props} />
}))

const youtubeVideo: PublicGalleryVideo = {
    id: 1,
    source: VIDEO_SOURCE.YOUTUBE,
    videoId: 'abc123',
    title: 'Beach arrival',
    description: null,
    isFeatured: false,
    mediaUrl: null,
    thumbnailUrl: null
}

const uploadVideo: PublicGalleryVideo = {
    id: 2,
    source: VIDEO_SOURCE.UPLOAD,
    videoId: 'upload-2',
    title: null,
    description: null,
    isFeatured: false,
    mediaUrl: 'https://cdn.example.com/video.mp4',
    thumbnailUrl: null
}

const uploadVideoWithThumbnail: PublicGalleryVideo = {
    ...uploadVideo,
    thumbnailUrl: 'https://cdn.example.com/thumb.jpg'
}

describe('GalleryThumbnail', () => {
    it('renders a YouTube thumbnail image for YouTube gallery videos', () => {
        render(<GalleryThumbnail video={youtubeVideo} onClick={jest.fn()} />)

        const image = screen.getByRole('img', { name: 'Beach arrival' })
        expect(image).toHaveAttribute('src', 'https://img.youtube.com/vi/abc123/hqdefault.jpg')
        expect(document.querySelector('iframe')).not.toBeInTheDocument()
        expect(document.querySelector('video')).not.toBeInTheDocument()
    })

    it('renders an upload placeholder without an image for upload gallery videos', () => {
        render(<GalleryThumbnail video={uploadVideo} onClick={jest.fn()} />)

        expect(screen.getByTestId('gallery-thumbnail-upload-placeholder')).toBeInTheDocument()
        expect(screen.queryByRole('img')).not.toBeInTheDocument()
        expect(screen.getByText('Play video')).toBeInTheDocument()
        expect(document.querySelector('iframe')).not.toBeInTheDocument()
        expect(document.querySelector('video')).not.toBeInTheDocument()
    })

    it('renders a thumbnail image for upload gallery videos with thumbnailUrl', () => {
        render(<GalleryThumbnail video={uploadVideoWithThumbnail} onClick={jest.fn()} />)

        const image = screen.getByRole('img', { name: 'Gallery video thumbnail' })
        expect(image).toHaveAttribute('src', 'https://cdn.example.com/thumb.jpg')
        expect(screen.queryByTestId('gallery-thumbnail-upload-placeholder')).not.toBeInTheDocument()
        expect(document.querySelector('video')).not.toBeInTheDocument()
    })

    it('renders the title below the thumbnail when present', () => {
        render(<GalleryThumbnail video={youtubeVideo} onClick={jest.fn()} />)

        expect(screen.getByTestId('gallery-thumbnail-title')).toHaveTextContent('Beach arrival')
    })

    it('omits the title row when title is null', () => {
        render(<GalleryThumbnail video={uploadVideo} onClick={jest.fn()} />)

        expect(screen.queryByTestId('gallery-thumbnail-title')).not.toBeInTheDocument()
    })

    it('calls onClick when clicked', () => {
        const onClick = jest.fn()
        render(<GalleryThumbnail video={youtubeVideo} onClick={onClick} />)

        fireEvent.click(screen.getByRole('button', { name: 'Play Beach arrival' }))

        expect(onClick).toHaveBeenCalledTimes(1)
    })
})
