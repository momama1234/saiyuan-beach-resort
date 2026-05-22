import { fireEvent, render, screen } from '@testing-library/react'
import type { ImgHTMLAttributes } from 'react'

import { type PublicGalleryVideo,VIDEO_SOURCE } from '@/constants/property-video'

import VideoGallery from './VideoGallery'

jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ alt, src, ...props }: ImgHTMLAttributes<HTMLImageElement>) => <img alt={alt} src={src} {...props} />
}))

window.HTMLElement.prototype.scrollIntoView = jest.fn()

const labels = {
    featured: 'Featured',
    gallery: 'Gallery',
    emptyTitle: 'No videos',
    emptyDescription: 'Videos will appear here.',
    uploadPending: 'Upload pending'
}

const videos: PublicGalleryVideo[] = [
    {
        id: 9,
        source: VIDEO_SOURCE.YOUTUBE,
        videoId: 'later-video',
        title: 'Later video',
        description: null,
        isFeatured: false,
        mediaUrl: null,
        thumbnailUrl: null
    },
    {
        id: 3,
        source: VIDEO_SOURCE.YOUTUBE,
        videoId: 'featured-video',
        title: 'Featured video',
        description: null,
        isFeatured: true,
        mediaUrl: null,
        thumbnailUrl: null
    },
    {
        id: 5,
        source: VIDEO_SOURCE.UPLOAD,
        videoId: 'upload-video',
        title: 'Uploaded video',
        description: 'Walk through the uploaded tour.',
        isFeatured: false,
        mediaUrl: 'https://cdn.example.com/upload.mp4',
        thumbnailUrl: null
    }
]

describe('VideoGallery', () => {
    it('renders thumbnail buttons in lightbox navigation order without loading players initially', () => {
        render(<VideoGallery videos={videos} labels={labels} />)

        expect(document.querySelector('iframe')).not.toBeInTheDocument()
        expect(document.querySelector('video')).not.toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Featured' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Gallery' })).toBeInTheDocument()

        const thumbnailButtons = screen.getAllByRole('button', { name: /Play / })
        expect(thumbnailButtons.map((button) => button.getAttribute('aria-label'))).toEqual([
            'Play Featured video',
            'Play Later video',
            'Play Uploaded video'
        ])
    })

    it('opens the shared lightbox for the clicked thumbnail', () => {
        render(<VideoGallery videos={videos} labels={labels} />)

        fireEvent.click(screen.getByRole('button', { name: 'Play Uploaded video' }))

        const player = document.querySelector('video')
        expect(player).toBeInTheDocument()
        expect(player).toHaveAttribute('src', 'https://cdn.example.com/upload.mp4')
        expect(screen.getByRole('button', { name: 'Previous video' })).not.toBeDisabled()
        expect(screen.getByRole('button', { name: 'Next video' })).toBeDisabled()
    })

    it('opens featured videos first, navigates in visual order, and removes the player when closed', () => {
        render(<VideoGallery videos={videos} labels={labels} />)

        fireEvent.click(screen.getByRole('button', { name: 'Play Featured video' }))

        const iframe = screen.getByTitle('YouTube gallery video') as HTMLIFrameElement
        expect(iframe.src).toContain('/embed/featured-video')
        expect(iframe.src).toContain('autoplay=1')

        fireEvent.click(screen.getByRole('button', { name: 'Next video' }))

        const nextIframe = screen.getByTitle('YouTube gallery video') as HTMLIFrameElement
        expect(nextIframe.src).toContain('/embed/later-video')

        fireEvent.click(screen.getByRole('button', { name: 'Close video' }))

        expect(document.querySelector('iframe')).not.toBeInTheDocument()
        expect(document.querySelector('video')).not.toBeInTheDocument()
    })

    it('omits the featured section when no video is featured and opens grid items in API order', () => {
        const unfeaturedVideos = videos.map((video) => ({ ...video, isFeatured: false }))

        render(<VideoGallery videos={unfeaturedVideos} labels={labels} />)

        expect(screen.queryByRole('heading', { name: 'Featured' })).not.toBeInTheDocument()
        expect(
            screen.getAllByRole('button', { name: /Play / }).map((button) => button.getAttribute('aria-label'))
        ).toEqual(['Play Later video', 'Play Featured video', 'Play Uploaded video'])

        fireEvent.click(screen.getByRole('button', { name: 'Play Later video' }))

        const iframe = screen.getByTitle('YouTube gallery video') as HTMLIFrameElement
        expect(iframe.src).toContain('/embed/later-video')
        expect(screen.getByRole('button', { name: 'Previous video' })).toBeDisabled()
    })
})
