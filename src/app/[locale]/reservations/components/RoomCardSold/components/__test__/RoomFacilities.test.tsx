import { render, screen } from '@testing-library/react'

import RoomFacilities from '../RoomFacilities'

describe('RoomFacilities', () => {
    it('renders feature icon images when provided and falls back to checkmarks', () => {
        const { container } = render(
            <RoomFacilities
                features={[
                    {
                        name: 'Sea view',
                        isHighlighted: true,
                        image: [{ id: 1, url: 'https://cdn.example.com/sea-view.svg', name: 'sea-view.svg' }]
                    },
                    {
                        name: 'Free Wi-Fi',
                        isHighlighted: false
                    }
                ]}
                maxItems={4}
            />
        )

        const icon = screen.getByAltText('Sea view')
        expect(icon).toHaveAttribute('src', 'https://cdn.example.com/sea-view.svg')
        expect(icon).toHaveAttribute('width', '16')
        expect(icon).toHaveAttribute('height', '16')
        expect(screen.getByText('Free Wi-Fi')).toBeInTheDocument()
        expect(container.querySelectorAll('img')).toHaveLength(1)
        expect(container.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(1)
    })

    it('limits the number of displayed features', () => {
        render(
            <RoomFacilities
                features={[
                    { name: 'Feature A', isHighlighted: false },
                    { name: 'Feature B', isHighlighted: false },
                    { name: 'Feature C', isHighlighted: false }
                ]}
                maxItems={2}
            />
        )

        expect(screen.getByText('Feature A')).toBeInTheDocument()
        expect(screen.getByText('Feature B')).toBeInTheDocument()
        expect(screen.queryByText('Feature C')).not.toBeInTheDocument()
    })
})
