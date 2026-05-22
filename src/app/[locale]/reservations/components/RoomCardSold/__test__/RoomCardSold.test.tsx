import { render, screen } from '@testing-library/react'

import RoomCardSold, { RoomType } from '../index'

jest.mock('../components/RoomImagesCarousel', () => ({
    __esModule: true,
    default: ({ images, roomName }: { images: string[]; roomName: string }) => (
        <div>
            {images.map((image, index) => (
                <img key={index} src={image} alt={`${roomName} room image ${index + 1}`} />
            ))}
        </div>
    )
}))

jest.mock('../components/RoomLabels', () => ({
    __esModule: true,
    default: ({ labels }: { labels: string[] }) => (
        <div>
            {labels.map((label, index) => (
                <span key={index}>{label}</span>
            ))}
        </div>
    )
}))

jest.mock('../components/RoomInfo', () => ({
    __esModule: true,
    default: ({
        name,
        size,
        guests,
        bed
    }: {
        name: string
        size: string
        guests: number
        bed: string
        rating?: { score: string; label: string }
    }) => (
        <div>
            <h2 className="truncate text-2xl font-bold">{name}</h2>
            <div className="mt-1 flex gap-2 text-sm text-gray-600">
                <span>{size}</span>
                <span>Max {guests} adults</span>
                <span>{bed}</span>
            </div>
        </div>
    )
}))

jest.mock('../components/RoomFacilities', () => ({
    __esModule: true,
    default: ({ features }: { features: Array<{ name: string; image?: Array<{ url: string }> }> }) => (
        <div>
            {features.map((feature, index) => (
                <span key={index}>{feature.name}</span>
            ))}
        </div>
    )
}))

describe('RoomCardSold', () => {
    it('renders room card sold with correct information', () => {
        const room: RoomType = {
            id: '1',
            name: 'Deluxe Room',
            images: ['image1.jpg', 'image2.jpg'],
            labels: ['Available', 'New'],
            size: '20m²',
            guests: 2,
            bed: '2 Double Beds',
            features: [
                { name: 'Wi-Fi', isHighlighted: true, image: [{ id: 1, url: 'wifi.png', name: 'wifi.png' }] },
                { name: 'Air Conditioning', isHighlighted: false }
            ]
        }

        render(<RoomCardSold room={room} />)

        expect(screen.getByText('Deluxe Room')).toBeInTheDocument()
        expect(screen.getByText('20m²')).toBeInTheDocument()
        expect(screen.getByText('Max 2 adults')).toBeInTheDocument()
        expect(screen.getByText('2 Double Beds')).toBeInTheDocument()
        expect(screen.getByText('Wi-Fi')).toBeInTheDocument()
        expect(screen.getByText('Air Conditioning')).toBeInTheDocument()
    })

    it('renders image slides equal to images length', () => {
        const room: RoomType = {
            id: '2',
            name: 'Sea View Suite',
            images: ['imgA.jpg', 'imgB.jpg', 'imgC.jpg'],
            labels: ['Popular'],
            size: '35m²',
            guests: 3,
            bed: '1 King Bed',
            features: [{ name: 'Wi-Fi', isHighlighted: false }]
        }

        render(<RoomCardSold room={room} />)
        const imgs = screen.getAllByRole('img')
        expect(imgs.length).toBe(room.images.length)
    })

    it('handles empty labels gracefully', () => {
        const room: RoomType = {
            id: '3',
            name: 'Garden Room',
            images: ['a.jpg'],
            labels: [],
            size: '18m²',
            guests: 2,
            bed: '1 Queen Bed',
            features: [{ name: 'Wi-Fi', isHighlighted: false }]
        }

        render(<RoomCardSold room={room} />)
        expect(screen.queryByText('Available')).not.toBeInTheDocument()
        expect(screen.queryByText('New')).not.toBeInTheDocument()
    })

    it('renders long room name and applies truncate class', () => {
        const longName = 'Very Long Deluxe Ocean View Presidential Suite With Extended Title'
        const room: RoomType = {
            id: '5',
            name: longName,
            images: ['i.jpg'],
            labels: ['Hot'],
            size: '40m²',
            guests: 2,
            bed: '1 King Bed',
            features: [{ name: 'Wi-Fi', isHighlighted: false }]
        }

        render(<RoomCardSold room={room} />)
        const heading = screen.getByText(longName)
        expect(heading).toHaveClass('truncate')
    })
})

test('renders room card sold with correct labels', () => {
    const room: RoomType = {
        id: '1',
        name: 'Deluxe Room',
        images: ['image1.jpg', 'image2.jpg'],
        labels: ['Available', 'New'],
        size: '20m²',
        guests: 2,
        bed: '2 Double Beds',
        features: [{ name: 'Wi-Fi', isHighlighted: false }]
    }

    render(<RoomCardSold room={room} />)

    expect(screen.getByText('Available')).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()
})
