import { render, screen } from '@testing-library/react'
import type { ImgHTMLAttributes } from 'react'

import RoomImagesCarousel from '../RoomImagesCarousel'

jest.mock('swiper/css', () => ({}))
jest.mock('swiper/css/navigation', () => ({}))
jest.mock('swiper/css/pagination', () => ({}))

jest.mock('swiper/react', () => ({
    Swiper: ({ children }: { children: React.ReactNode }) => <div data-testid="swiper">{children}</div>,
    SwiperSlide: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

jest.mock('swiper/modules', () => ({
    Navigation: {},
    Pagination: {},
    A11y: {},
    Autoplay: {}
}))

jest.mock('next/image', () => ({
    __esModule: true,
    default: ({
        src,
        alt,
        fill: _fill,
        sizes: _sizes,
        quality: _quality,
        priority: _priority,
        ...props
    }: { src: string; alt: string; fill?: boolean; sizes?: string; quality?: number; priority?: boolean } & ImgHTMLAttributes<HTMLImageElement>) => (
        <img src={src} alt={alt} {...props} />
    )
}))

jest.mock('next-intl', () => ({
    useTranslations: () => (key: string, vars?: Record<string, unknown>) => {
        if (key === 'roomImageAlt' && vars) {
            return `${vars.roomName} room image ${vars.index}`
        }
        return key
    }
}))

describe('RoomImagesCarousel', () => {
    it('renders the correct number of images', () => {
        render(
            <RoomImagesCarousel
                images={['a.jpg', 'b.jpg', 'c.jpg']}
                roomName="Deluxe Room"
            />
        )

        const imgs = screen.getAllByRole('img')
        expect(imgs).toHaveLength(3)
    })

    it('renders each image with alt text containing the room name and 1-based index', () => {
        render(
            <RoomImagesCarousel
                images={['a.jpg', 'b.jpg', 'c.jpg']}
                roomName="Sea View Suite"
            />
        )

        expect(screen.getByAltText('Sea View Suite room image 1')).toBeInTheDocument()
        expect(screen.getByAltText('Sea View Suite room image 2')).toBeInTheDocument()
        expect(screen.getByAltText('Sea View Suite room image 3')).toBeInTheDocument()
    })

    it('renders the ImageOff empty state when images array is empty', () => {
        render(<RoomImagesCarousel images={[]} roomName="Garden Room" />)

        expect(screen.queryByRole('img')).not.toBeInTheDocument()
        expect(screen.getByText('No images available')).toBeInTheDocument()
    })
})
