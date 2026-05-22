import { fireEvent, render, screen } from '@testing-library/react'

import { type PublicGalleryVideo,VIDEO_SOURCE } from '@/constants/property-video'

import GalleryLightbox from './GalleryLightbox'

const videos: PublicGalleryVideo[] = [
    {
        id: 1,
        source: VIDEO_SOURCE.YOUTUBE,
        videoId: 'abc123',
        title: 'Beach arrival',
        description: 'See the arrival path from the beach to the lobby.',
        isFeatured: true,
        mediaUrl: null,
        thumbnailUrl: null
    },
    {
        id: 2,
        source: VIDEO_SOURCE.UPLOAD,
        videoId: 'upload-2',
        title: null,
        description: null,
        isFeatured: false,
        mediaUrl: 'https://cdn.example.com/video.mp4',
        thumbnailUrl: null
    },
    {
        id: 3,
        source: VIDEO_SOURCE.UPLOAD,
        videoId: 'upload-3',
        title: 'Fresh upload',
        description: null,
        isFeatured: false,
        mediaUrl: null,
        thumbnailUrl: null
    }
]

const longUnbrokenDescription =
    'ThisDescriptionHasNoNaturalBreakpointsAndShouldStillWrapInsideTheLightboxOnSmallScreens'

const videoWithLongDescription: PublicGalleryVideo = {
    id: 4,
    source: VIDEO_SOURCE.YOUTUBE,
    videoId: 'abc123',
    title: 'Beach arrival',
    description: longUnbrokenDescription,
    isFeatured: true,
    mediaUrl: null,
    thumbnailUrl: null
}

describe('GalleryLightbox', () => {
    beforeAll(() => {
        Element.prototype.scrollIntoView = jest.fn()
    })

    afterEach(() => {
        document.body.style.overflow = ''
    })

    it('renders nothing when selectedIndex is null', () => {
        render(
            <GalleryLightbox videos={videos} selectedIndex={null} onSelect={jest.fn()} uploadLabel="Upload pending" />
        )

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders nothing and leaves body scroll unchanged when selectedIndex is out of range', () => {
        document.body.style.overflow = 'auto'

        render(<GalleryLightbox videos={videos} selectedIndex={99} onSelect={jest.fn()} uploadLabel="Upload pending" />)

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        expect(document.body.style.overflow).toBe('auto')
    })

    it('renders a YouTube iframe for the selected YouTube video and shows its title', () => {
        render(<GalleryLightbox videos={videos} selectedIndex={0} onSelect={jest.fn()} uploadLabel="Upload pending" />)

        const iframe = screen.getByTitle('YouTube gallery video') as HTMLIFrameElement
        expect(iframe.src).toContain('https://www.youtube-nocookie.com/embed/abc123')
        expect(iframe.src).toContain('controls=1')
        expect(iframe.src).toContain('modestbranding=1')
        expect(iframe.src).toContain('rel=0')
        expect(iframe.src).toContain('playsinline=1')
        expect(iframe.src).toContain('autoplay=1')
        expect(screen.getByRole('heading', { name: 'Beach arrival' })).toBeInTheDocument()
        expect(screen.getByText('See the arrival path from the beach to the lobby.')).toBeInTheDocument()
    })

    it('renders a video element for an uploaded video with mediaUrl and omits null metadata', () => {
        render(<GalleryLightbox videos={videos} selectedIndex={1} onSelect={jest.fn()} uploadLabel="Upload pending" />)

        const video = document.querySelector('video')
        expect(video).toBeInTheDocument()
        expect(video).toHaveAttribute('src', 'https://cdn.example.com/video.mp4')
        expect(video).toHaveAttribute('controls')
        expect(video).toHaveAttribute('preload', 'auto')
        expect(screen.queryByRole('heading')).not.toBeInTheDocument()
        expect(screen.queryByText('See the arrival path from the beach to the lobby.')).not.toBeInTheDocument()
    })

    it('keeps long descriptions readable on small screens', () => {
        render(
            <GalleryLightbox
                videos={[videoWithLongDescription]}
                selectedIndex={0}
                onSelect={jest.fn()}
                uploadLabel="Upload pending"
            />
        )

        expect(screen.getByText(longUnbrokenDescription)).toHaveClass('break-words')
    })

    it('renders the upload pending placeholder when an uploaded video has no mediaUrl', () => {
        render(<GalleryLightbox videos={videos} selectedIndex={2} onSelect={jest.fn()} uploadLabel="Upload pending" />)

        expect(document.querySelector('video')).not.toBeInTheDocument()
        expect(screen.getByText('Upload pending')).toBeInTheDocument()
    })

    it('calls onSelect for next and prev clicks and disables edge navigation', () => {
        const onSelect = jest.fn()
        const { rerender } = render(
            <GalleryLightbox videos={videos} selectedIndex={0} onSelect={onSelect} uploadLabel="Upload pending" />
        )

        expect(screen.getByRole('button', { name: 'Previous video' })).toBeDisabled()
        fireEvent.click(screen.getByRole('button', { name: 'Next video' }))
        expect(onSelect).toHaveBeenCalledWith(1)

        rerender(<GalleryLightbox videos={videos} selectedIndex={2} onSelect={onSelect} uploadLabel="Upload pending" />)

        expect(screen.getByRole('button', { name: 'Next video' })).toBeDisabled()
        fireEvent.click(screen.getByRole('button', { name: 'Previous video' }))
        expect(onSelect).toHaveBeenCalledWith(1)
    })

    it('calls onSelect from keyboard navigation and closes on ESC or close button', () => {
        const onSelect = jest.fn()
        render(<GalleryLightbox videos={videos} selectedIndex={1} onSelect={onSelect} uploadLabel="Upload pending" />)

        fireEvent.keyDown(window, { key: 'ArrowRight' })
        fireEvent.keyDown(window, { key: 'ArrowLeft' })
        fireEvent.keyDown(window, { key: 'Escape' })
        fireEvent.click(screen.getByRole('button', { name: 'Close video' }))

        expect(onSelect).toHaveBeenNthCalledWith(1, 2)
        expect(onSelect).toHaveBeenNthCalledWith(2, 0)
        expect(onSelect).toHaveBeenNthCalledWith(3, null)
        expect(onSelect).toHaveBeenNthCalledWith(4, null)
    })

    it('locks body scroll while open and restores the previous overflow when closed', () => {
        document.body.style.overflow = 'auto'

        const { rerender } = render(
            <GalleryLightbox videos={videos} selectedIndex={1} onSelect={jest.fn()} uploadLabel="Upload pending" />
        )

        expect(document.body.style.overflow).toBe('hidden')

        rerender(
            <GalleryLightbox videos={videos} selectedIndex={null} onSelect={jest.fn()} uploadLabel="Upload pending" />
        )

        expect(document.body.style.overflow).toBe('auto')
    })
})
