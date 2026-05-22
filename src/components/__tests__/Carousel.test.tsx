import { fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'

import Carousel from '../Carousel'

jest.mock('framer-motion', () => ({
    motion: {
        img: ({ drag, dragConstraints, onDragEnd, initial, animate, transition, sizes, ...props }: any) => (
            <img data-testid="carousel-image" {...props} />
        )
    }
}))

const mockImages = ['/image1.jpg', '/image2.jpg', '/image3.jpg']

describe('Carousel', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        act(() => {
            jest.runOnlyPendingTimers()
        })
        jest.useRealTimers()
    })

    it('renders all images', () => {
        render(<Carousel images={mockImages} />)

        const images = screen.getAllByTestId('carousel-image')
        expect(images).toHaveLength(3)
    })

    it('renders first image as visible initially', () => {
        render(<Carousel images={mockImages} />)

        const images = screen.getAllByTestId('carousel-image')
        expect(images[0]).toHaveClass('opacity-100')
        expect(images[1]).toHaveClass('opacity-0')
        expect(images[2]).toHaveClass('opacity-0')
    })

    it('navigates to next slide when next button is clicked', () => {
        render(<Carousel images={mockImages} />)

        const nextButton = screen.getByLabelText('Next slide')
        fireEvent.click(nextButton)

        const images = screen.getAllByTestId('carousel-image')
        expect(images[0]).toHaveClass('opacity-0')
        expect(images[1]).toHaveClass('opacity-100')
    })

    it('navigates to previous slide when previous button is clicked', () => {
        render(<Carousel images={mockImages} />)

        const prevButton = screen.getByLabelText('Previous slide')
        fireEvent.click(prevButton)

        const images = screen.getAllByTestId('carousel-image')
        expect(images[0]).toHaveClass('opacity-0')
        expect(images[2]).toHaveClass('opacity-100')
    })

    it('toggles autoplay when play/pause button is clicked', () => {
        render(<Carousel images={mockImages} />)

        const playButton = screen.getByLabelText('Play slideshow')
        fireEvent.click(playButton)

        expect(screen.getByLabelText('Pause slideshow')).toBeInTheDocument()
    })

    it('auto-advances slides when autoplay is enabled', async () => {
        render(<Carousel images={mockImages} autoPlayInterval={1000} />)

        const playButton = screen.getByLabelText('Play slideshow')
        fireEvent.click(playButton)

        const images = screen.getAllByTestId('carousel-image')
        expect(images[0]).toHaveClass('opacity-100')

        act(() => {
            jest.advanceTimersByTime(1000)
        })

        expect(images[1]).toHaveClass('opacity-100')
    })

    it('wraps around to first image after last image', () => {
        render(<Carousel images={mockImages} />)

        const nextButton = screen.getByLabelText('Next slide')

        fireEvent.click(nextButton)
        fireEvent.click(nextButton)
        fireEvent.click(nextButton)

        const images = screen.getAllByTestId('carousel-image')
        expect(images[0]).toHaveClass('opacity-100')
    })

    it('applies custom className', () => {
        const customClass = 'custom-carousel-class'
        const { container } = render(<Carousel images={mockImages} className={customClass} />)

        expect(container.firstChild).toHaveClass(customClass)
    })

    it('renders with correct alt text for images', () => {
        render(<Carousel images={mockImages} />)

        const images = screen.getAllByTestId('carousel-image')
        images.forEach((img, index) => {
            expect(img).toHaveAttribute('alt', `slide-${index}`)
        })
    })

    it('has accessible button labels', () => {
        render(<Carousel images={mockImages} />)

        expect(screen.getByLabelText('Previous slide')).toBeInTheDocument()
        expect(screen.getByLabelText('Play slideshow')).toBeInTheDocument()
        expect(screen.getByLabelText('Next slide')).toBeInTheDocument()
    })
})
