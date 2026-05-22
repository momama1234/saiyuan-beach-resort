import { fireEvent, render, screen, within } from '@testing-library/react'
import type { ImgHTMLAttributes } from 'react'

import type { AvailableRoomClass } from '@/types/room-management'

import { RoomClassCard } from '../RoomCard'

jest.mock('next/image', () => ({
    __esModule: true,
    default: ({
        src,
        alt,
        fill: _fill,
        unoptimized: _unoptimized,
        ...props
    }: { src: string; alt: string; fill?: boolean; unoptimized?: boolean } & ImgHTMLAttributes<HTMLImageElement>) => (
        <img src={src} alt={alt} {...props} />
    )
}))

jest.mock('../RoomCardSold/components/RoomImagesCarousel', () => ({
    __esModule: true,
    default: ({ images }: { images: string[] }) => (
        <div data-testid="room-images-carousel">
            {images.map((src, i) => (
                <img key={i} src={src} alt={`Room image ${i + 1}`} />
            ))}
        </div>
    )
}))

const buildRoomClass = (): AvailableRoomClass =>
    ({
        id: 1,
        propertyId: 10,
        name: 'Anda Premium Room - Standard',
        basePrice: '6500',
        description: 'Premium room for reservations flow tests',
        numberOfRooms: 5,
        availableRooms: 5,
        images: ['room-1.jpg', 'room-2.jpg', 'room-3.jpg'],
        numberOfAdults: 2,
        numberOfChildren: 1,
        numberOfInfants: 0,
        petAllowed: false,
        features: [
            {
                name: 'Sea view',
                isHighlighted: true,
                image: [
                    {
                        id: 301,
                        url: 'https://cdn.example.com/features/sea-view.svg',
                        name: 'sea-view.svg'
                    }
                ]
            }
        ],
        ratePlans: [
            {
                id: 101,
                name: 'Standard Rate',
                description: 'Legacy description fallback',
                isDefault: true,
                features: [
                    {
                        id: 401,
                        label: 'Breakfast included',
                        image: [
                            {
                                id: 501,
                                url: 'https://cdn.example.com/rate-plan-features/breakfast.svg',
                                name: 'breakfast.svg'
                            }
                        ]
                    },
                    {
                        id: 402,
                        label: 'Free cancellation'
                    },
                    {
                        id: 403,
                        label: 'Late check-out'
                    },
                    {
                        id: 404,
                        label: 'Priority support'
                    },
                    {
                        id: 405,
                        label: 'Airport transfer'
                    },
                    {
                        id: 406,
                        label: 'Welcome drink'
                    }
                ],
                occupancyOptions: [
                    {
                        id: 201,
                        occupancy: 2,
                        rate: 6500,
                        isDefault: true
                    }
                ]
            }
        ]
    }) as AvailableRoomClass

describe('RoomClassCard', () => {
    it('uses plus and minus to manage selection without a select button', () => {
        const onUpdateQuantity = jest.fn()
        const onUpdatePlanQuantity = jest.fn()
        const roomClass = buildRoomClass()

        const { rerender } = render(
            <RoomClassCard
                roomClass={roomClass}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                hideRatePlanFeatures
                onUpdateQuantity={onUpdateQuantity}
                selectedQuantity={0}
                onUpdatePlanQuantity={onUpdatePlanQuantity}
                selectedQuantitiesByPlan={{ 101: 0 }}
            />
        )

        expect(screen.queryByRole('button', { name: /select/i })).not.toBeInTheDocument()

        const increaseButton = screen.getByRole('button', { name: 'Increase quantity' })
        const decreaseButton = screen.getByRole('button', { name: 'Decrease quantity' })

        expect(increaseButton).toBeEnabled()
        expect(decreaseButton).toBeDisabled()

        fireEvent.click(increaseButton)

        expect(onUpdatePlanQuantity).toHaveBeenCalledWith(1, 101, 1, 201)

        rerender(
            <RoomClassCard
                roomClass={roomClass}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                hideRatePlanFeatures
                onUpdateQuantity={onUpdateQuantity}
                selectedQuantity={1}
                onUpdatePlanQuantity={onUpdatePlanQuantity}
                selectedQuantitiesByPlan={{ 101: 1 }}
            />
        )

        const updatedDecreaseButton = screen.getByRole('button', { name: 'Decrease quantity' })
        fireEvent.click(updatedDecreaseButton)

        expect(onUpdatePlanQuantity).toHaveBeenLastCalledWith(1, 101, 0, 201)
    })

    it('disables plus when capacity is exhausted', () => {
        const roomClass = {
            ...buildRoomClass(),
            availableRooms: 0
        }

        render(
            <RoomClassCard
                roomClass={roomClass}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                hideRatePlanFeatures
                onUpdateQuantity={jest.fn()}
                selectedQuantity={0}
                onUpdatePlanQuantity={jest.fn()}
                selectedQuantitiesByPlan={{ 101: 0 }}
            />
        )

        expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeDisabled()
    })

    it('renders backend-provided card image URLs directly', () => {
        const roomClass = {
            ...buildRoomClass(),
            images: ['https://cdn.example.com/800x600/2/1/room.webp']
        }

        render(
            <RoomClassCard
                roomClass={roomClass}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                hideRatePlanFeatures
                onUpdateQuantity={jest.fn()}
                selectedQuantity={0}
                onUpdatePlanQuantity={jest.fn()}
                selectedQuantitiesByPlan={{ 101: 0 }}
            />
        )

        expect(screen.getByAltText('Room image 1')).toHaveAttribute(
            'src',
            'https://cdn.example.com/800x600/2/1/room.webp'
        )
    })

    it('renders room feature icon image from API when available', () => {
        const roomClass = {
            ...buildRoomClass(),
            features: [
                {
                    name: 'Sea view',
                    isHighlighted: true,
                    image: [
                        {
                            id: 301,
                            url: 'https://cdn.example.com/features/sea-view.svg',
                            name: 'sea-view.svg'
                        }
                    ]
                },
                { name: 'Balcony', isHighlighted: false },
                { name: 'Wi-Fi', isHighlighted: false },
                { name: 'Smart TV', isHighlighted: false },
                { name: 'Coffee maker', isHighlighted: false }
            ]
        } as AvailableRoomClass

        render(
            <RoomClassCard
                roomClass={roomClass}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                hideRatePlanFeatures
                onUpdateQuantity={jest.fn()}
                selectedQuantity={0}
                onUpdatePlanQuantity={jest.fn()}
                selectedQuantitiesByPlan={{ 101: 0 }}
            />
        )

        // showMoreFeatures button opens the RoomFeaturesDialog
        fireEvent.click(screen.getByRole('button', { name: /showMoreFeatures/i }))

        const dialog = screen.getByRole('dialog')
        const featureIcon = within(dialog).getByAltText('Sea view')
        expect(featureIcon).toHaveAttribute('src', 'https://cdn.example.com/features/sea-view.svg')
        expect(featureIcon).toHaveAttribute('width', '16')
        expect(featureIcon).toHaveAttribute('height', '16')
    })

    it('shows rate plan features when present', () => {
        const describedRoomClass = buildRoomClass()

        render(
            <RoomClassCard
                roomClass={describedRoomClass}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                onUpdateQuantity={jest.fn()}
                selectedQuantity={0}
                onUpdatePlanQuantity={jest.fn()}
                selectedQuantitiesByPlan={{ 101: 0 }}
            />
        )

        expect(screen.getByText('Breakfast included')).toBeInTheDocument()
        expect(screen.getByText('Free cancellation')).toBeInTheDocument()
        expect(screen.getByText('Late check-out')).toBeInTheDocument()
        expect(screen.getByText('Priority support')).toBeInTheDocument()
        expect(screen.queryByText('Airport transfer')).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: /show 2 more/i })).toBeInTheDocument()
        const ratePlanIcon = screen.getByAltText('Breakfast included')
        expect(ratePlanIcon).toHaveAttribute('src', 'https://cdn.example.com/rate-plan-features/breakfast.svg')
        expect(ratePlanIcon).toHaveAttribute('width', '16')
        expect(ratePlanIcon).toHaveAttribute('height', '16')
        expect(screen.queryByText('Legacy description fallback')).not.toBeInTheDocument()
    })

    it('opens all rate plan features in a modal when the list is longer than the preview', () => {
        const roomClass = buildRoomClass()

        render(
            <RoomClassCard
                roomClass={roomClass}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                onUpdateQuantity={jest.fn()}
                selectedQuantity={0}
                onUpdatePlanQuantity={jest.fn()}
                selectedQuantitiesByPlan={{ 101: 0 }}
            />
        )

        expect(screen.queryByText('Airport transfer')).not.toBeInTheDocument()
        expect(screen.queryByText('Welcome drink')).not.toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: /show 2 more/i }))

        const dialog = screen.getByRole('dialog')
        expect(dialog).toBeInTheDocument()
        expect(within(dialog).getByText('Rate Plan Features')).toBeInTheDocument()
        expect(within(dialog).getByText('Priority support')).toBeInTheDocument()
        expect(within(dialog).getByText('Late check-out')).toBeInTheDocument()
        expect(within(dialog).getByText('Airport transfer')).toBeInTheDocument()
        expect(within(dialog).getByText('Welcome drink')).toBeInTheDocument()
    })

    it('falls back to description when no rate plan features are available', () => {
        const roomClass = buildRoomClass()
        const baseRatePlan = roomClass.ratePlans?.[0]

        if (!baseRatePlan) {
            throw new Error('Test setup failed: expected a rate plan')
        }

        const fallbackRoomClass = {
            ...roomClass,
            ratePlans: [
                {
                    ...baseRatePlan,
                    description: 'Pay at hotel',
                    features: []
                }
            ]
        } as AvailableRoomClass

        render(
            <RoomClassCard
                roomClass={fallbackRoomClass}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                onUpdateQuantity={jest.fn()}
                selectedQuantity={0}
                onUpdatePlanQuantity={jest.fn()}
                selectedQuantitiesByPlan={{ 101: 0 }}
            />
        )

        expect(screen.getByText('Pay at hotel')).toBeInTheDocument()
    })

    it('does not render fake fallback text when both features and description are missing', () => {
        const roomClass = buildRoomClass()
        const baseRatePlan = roomClass.ratePlans?.[0]

        if (!baseRatePlan) {
            throw new Error('Test setup failed: expected a rate plan')
        }

        render(
            <RoomClassCard
                roomClass={{
                    ...roomClass,
                    ratePlans: [
                        {
                            ...baseRatePlan,
                            description: undefined,
                            features: []
                        }
                    ]
                }}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                onUpdateQuantity={jest.fn()}
                selectedQuantity={0}
                onUpdatePlanQuantity={jest.fn()}
                selectedQuantitiesByPlan={{ 101: 0 }}
            />
        )

        expect(screen.queryByText('Free breakfast included')).not.toBeInTheDocument()
        expect(screen.queryByText('WiFi included')).not.toBeInTheDocument()
    })

    it('caps quantity at availableRooms and disables plus button after reaching limit', () => {
        const onUpdateQuantity = jest.fn()
        const onUpdatePlanQuantity = jest.fn()
        const roomClass = {
            ...buildRoomClass(),
            numberOfRooms: 5,
            availableRooms: 2
        }

        const { rerender } = render(
            <RoomClassCard
                roomClass={roomClass}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                hideRatePlanFeatures
                onUpdateQuantity={onUpdateQuantity}
                selectedQuantity={0}
                onUpdatePlanQuantity={onUpdatePlanQuantity}
                selectedQuantitiesByPlan={{ 101: 0 }}
            />
        )

        // Plus button should be enabled initially
        expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeEnabled()

        // Select 1 room
        fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }))
        expect(onUpdatePlanQuantity).toHaveBeenCalledWith(1, 101, 1, 201)

        // Rerender with 1 selected
        rerender(
            <RoomClassCard
                roomClass={roomClass}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                hideRatePlanFeatures
                onUpdateQuantity={onUpdateQuantity}
                selectedQuantity={1}
                onUpdatePlanQuantity={onUpdatePlanQuantity}
                selectedQuantitiesByPlan={{ 101: 1 }}
            />
        )

        // Plus should still be enabled (1 of 2 available)
        expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeEnabled()

        // Select 2nd room
        fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }))
        expect(onUpdatePlanQuantity).toHaveBeenCalledWith(1, 101, 2, 201)

        // Rerender with 2 selected (at limit)
        rerender(
            <RoomClassCard
                roomClass={roomClass}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                hideRatePlanFeatures
                onUpdateQuantity={onUpdateQuantity}
                selectedQuantity={2}
                onUpdatePlanQuantity={onUpdatePlanQuantity}
                selectedQuantitiesByPlan={{ 101: 2 }}
            />
        )

        // Plus button should be disabled at availableRooms limit (2), not numberOfRooms (5)
        expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeDisabled()
    })

    it('caps direct input at availableRooms', () => {
        const onUpdateQuantity = jest.fn()
        const onUpdatePlanQuantity = jest.fn()
        const roomClass = {
            ...buildRoomClass(),
            numberOfRooms: 5,
            availableRooms: 2
        }

        render(
            <RoomClassCard
                roomClass={roomClass}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                hideRatePlanFeatures
                onUpdateQuantity={onUpdateQuantity}
                selectedQuantity={1}
                onUpdatePlanQuantity={onUpdatePlanQuantity}
                selectedQuantitiesByPlan={{ 101: 1 }}
            />
        )

        // input is type="text" with aria-label="Room quantity"
        const input = screen.getByLabelText('Room quantity')

        // Try to type 4 (exceeds availableRooms of 2)
        fireEvent.change(input, { target: { value: '4' } })

        // Should be capped at 2 (availableRooms), not 4
        expect(onUpdatePlanQuantity).toHaveBeenCalledWith(1, 101, 2, 201)
    })

    it('initialises selectedRatePlanId from initialRatePlanId when the plan belongs to this room class', () => {
        const roomClass: AvailableRoomClass = {
            ...buildRoomClass(),
            ratePlans: [
                {
                    id: 101,
                    name: 'Standard Rate',
                    isDefault: true,
                    features: [],
                    occupancyOptions: [{ id: 201, occupancy: 2, rate: 6500, isDefault: true }]
                },
                {
                    id: 102,
                    name: 'Promotion Rate',
                    isDefault: false,
                    features: [],
                    occupancyOptions: [{ id: 202, occupancy: 2, rate: 5500, isDefault: true }]
                }
            ]
        }

        render(
            <RoomClassCard
                roomClass={roomClass}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                hideRatePlanFeatures
                onUpdateQuantity={jest.fn()}
                selectedQuantity={0}
                onUpdatePlanQuantity={jest.fn()}
                selectedQuantitiesByPlan={{ 101: 0, 102: 0 }}
                initialRatePlanId={102}
            />
        )

        // The component renders both rate plan names
        expect(screen.getByText('Standard Rate')).toBeInTheDocument()
        expect(screen.getByText('Promotion Rate')).toBeInTheDocument()
    })

    it('falls back to the default rate plan when initialRatePlanId does not match any plan in this room class', () => {
        const roomClass = buildRoomClass()

        render(
            <RoomClassCard
                roomClass={roomClass}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                hideRatePlanFeatures
                onUpdateQuantity={jest.fn()}
                selectedQuantity={0}
                onUpdatePlanQuantity={jest.fn()}
                selectedQuantitiesByPlan={{ 101: 0 }}
                initialRatePlanId={999}
            />
        )

        // Room still renders normally — no crash
        expect(screen.getByText('Standard Rate')).toBeInTheDocument()
    })

    it('renders single-plan mode helper text and full occupancy row when exactly one rate plan is visible', () => {
        const roomClass: AvailableRoomClass = {
            ...buildRoomClass(),
            numberOfAdults: 2,
            numberOfChildren: 1,
            numberOfInfants: 0,
            petAllowed: false
        }

        render(
            <RoomClassCard
                roomClass={roomClass}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                hideRatePlanFeatures
                onUpdateQuantity={jest.fn()}
                selectedQuantity={0}
                onUpdatePlanQuantity={jest.fn()}
                selectedQuantitiesByPlan={{ 101: 0 }}
            />
        )

        expect(screen.getByText('onlyRatePlanAvailable')).toBeInTheDocument()

        const occupancy = screen.getByLabelText('Occupancy')
        expect(within(occupancy).getByText(/Adults:/)).toBeInTheDocument()
        expect(within(occupancy).getByText(/Children:/)).toBeInTheDocument()
        expect(within(occupancy).getByText(/Infants:/)).toBeInTheDocument()
        expect(within(occupancy).getByText(/Pet:/)).toBeInTheDocument()
    })

    it('does not render single-plan mode helper text when multiple rate plans are visible', () => {
        const roomClass: AvailableRoomClass = {
            ...buildRoomClass(),
            ratePlans: [
                {
                    id: 101,
                    name: 'Standard Rate',
                    isDefault: true,
                    features: [],
                    occupancyOptions: [{ id: 201, occupancy: 2, rate: 6500, isDefault: true }]
                },
                {
                    id: 102,
                    name: 'Promotion Rate',
                    isDefault: false,
                    features: [],
                    occupancyOptions: [{ id: 202, occupancy: 2, rate: 5500, isDefault: true }]
                }
            ]
        }

        render(
            <RoomClassCard
                roomClass={roomClass}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                hideRatePlanFeatures
                onUpdateQuantity={jest.fn()}
                selectedQuantity={0}
                onUpdatePlanQuantity={jest.fn()}
                selectedQuantitiesByPlan={{ 101: 0, 102: 0 }}
            />
        )

        expect(screen.queryByText('onlyRatePlanAvailable')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Occupancy')).not.toBeInTheDocument()
    })

    it('renders the "X rate plans available" header in multi-plan mode with the correct count', () => {
        const roomClass: AvailableRoomClass = {
            ...buildRoomClass(),
            ratePlans: [
                {
                    id: 101,
                    name: 'Standard Rate',
                    isDefault: true,
                    features: [],
                    occupancyOptions: [{ id: 201, occupancy: 2, rate: 6500, isDefault: true }]
                },
                {
                    id: 102,
                    name: 'Promotion Rate',
                    isDefault: false,
                    features: [],
                    occupancyOptions: [{ id: 202, occupancy: 2, rate: 5500, isDefault: true }]
                },
                {
                    id: 103,
                    name: 'Flexible Rate',
                    isDefault: false,
                    features: [],
                    occupancyOptions: [{ id: 203, occupancy: 2, rate: 7000, isDefault: true }]
                }
            ]
        }

        render(
            <RoomClassCard
                roomClass={roomClass}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                hideRatePlanFeatures
                onUpdateQuantity={jest.fn()}
                selectedQuantity={0}
                onUpdatePlanQuantity={jest.fn()}
                selectedQuantitiesByPlan={{ 101: 0, 102: 0, 103: 0 }}
            />
        )

        expect(screen.getByText('ratePlansAvailable')).toBeInTheDocument()
    })

    it('does not render the rate-plans-available header in single-plan mode', () => {
        render(
            <RoomClassCard
                roomClass={buildRoomClass()}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                hideRatePlanFeatures
                onUpdateQuantity={jest.fn()}
                selectedQuantity={0}
                onUpdatePlanQuantity={jest.fn()}
                selectedQuantitiesByPlan={{ 101: 0 }}
            />
        )

        expect(screen.queryByText('ratePlansAvailable')).not.toBeInTheDocument()
    })

    it('opens all room features in a modal instead of expanding the card inline', () => {
        const roomClass = {
            ...buildRoomClass(),
            features: [
                { name: 'Sea view', isHighlighted: true },
                { name: 'Balcony', isHighlighted: false },
                { name: 'Wi-Fi', isHighlighted: false },
                { name: 'Smart TV', isHighlighted: false },
                { name: 'Coffee maker', isHighlighted: false },
                { name: 'Workspace', isHighlighted: false }
            ]
        } as AvailableRoomClass

        render(
            <RoomClassCard
                roomClass={roomClass}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                hideRatePlanFeatures
                onUpdateQuantity={jest.fn()}
                selectedQuantity={0}
                onUpdatePlanQuantity={jest.fn()}
                selectedQuantitiesByPlan={{ 101: 0 }}
            />
        )

        expect(screen.queryByText('Workspace')).not.toBeInTheDocument()

        // Component shows "showMoreFeatures" button that opens a modal
        fireEvent.click(screen.getByRole('button', { name: /showMoreFeatures/i }))

        const dialog = screen.getByRole('dialog')
        expect(dialog).toBeInTheDocument()
        expect(within(dialog).getByText('Workspace')).toBeInTheDocument()
        expect(within(dialog).getByText('Room photos and details')).toBeInTheDocument()
    })

    it('does not render the selection summary footer when no rooms are selected', () => {
        render(
            <RoomClassCard
                roomClass={buildRoomClass()}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                hideRatePlanFeatures
                onUpdateQuantity={jest.fn()}
                selectedQuantity={0}
                onUpdatePlanQuantity={jest.fn()}
                selectedQuantitiesByPlan={{ 101: 0 }}
            />
        )

        expect(screen.queryByLabelText('Selection summary')).not.toBeInTheDocument()
    })

    it('renders the selection summary footer with total count and single-plan breakdown', () => {
        render(
            <RoomClassCard
                roomClass={buildRoomClass()}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                hideRatePlanFeatures
                onUpdateQuantity={jest.fn()}
                selectedQuantity={2}
                onUpdatePlanQuantity={jest.fn()}
                selectedQuantitiesByPlan={{ 101: 2 }}
            />
        )

        const footer = screen.getByLabelText('Selection summary')
        expect(within(footer).getByText(/2\s+roomsSelected/)).toBeInTheDocument()
        expect(within(footer).getByText('2× Standard Rate')).toBeInTheDocument()
    })

    it('joins multiple selected plans with " + " in the footer breakdown', () => {
        const roomClass: AvailableRoomClass = {
            ...buildRoomClass(),
            ratePlans: [
                {
                    id: 101,
                    name: 'Standard Rate',
                    isDefault: true,
                    features: [],
                    occupancyOptions: [{ id: 201, occupancy: 2, rate: 6500, isDefault: true }]
                },
                {
                    id: 102,
                    name: 'Promotion Rate',
                    isDefault: false,
                    features: [],
                    occupancyOptions: [{ id: 202, occupancy: 2, rate: 5500, isDefault: true }]
                }
            ]
        }

        render(
            <RoomClassCard
                roomClass={roomClass}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                hideRatePlanFeatures
                onUpdateQuantity={jest.fn()}
                selectedQuantity={3}
                onUpdatePlanQuantity={jest.fn()}
                selectedQuantitiesByPlan={{ 101: 1, 102: 2 }}
            />
        )

        const footer = screen.getByLabelText('Selection summary')
        expect(within(footer).getByText('1× Standard Rate + 2× Promotion Rate')).toBeInTheDocument()
    })

    it('updates the selection summary footer when quantities change', () => {
        const roomClass = buildRoomClass()

        const { rerender } = render(
            <RoomClassCard
                roomClass={roomClass}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                hideRatePlanFeatures
                onUpdateQuantity={jest.fn()}
                selectedQuantity={1}
                onUpdatePlanQuantity={jest.fn()}
                selectedQuantitiesByPlan={{ 101: 1 }}
            />
        )

        expect(within(screen.getByLabelText('Selection summary')).getByText('1× Standard Rate')).toBeInTheDocument()

        rerender(
            <RoomClassCard
                roomClass={roomClass}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                hideRatePlanFeatures
                onUpdateQuantity={jest.fn()}
                selectedQuantity={3}
                onUpdatePlanQuantity={jest.fn()}
                selectedQuantitiesByPlan={{ 101: 3 }}
            />
        )

        expect(within(screen.getByLabelText('Selection summary')).getByText('3× Standard Rate')).toBeInTheDocument()
    })

    it('toggles the inline amenity list between the first 4 features and the full set', () => {
        const roomClass = {
            ...buildRoomClass(),
            features: [
                { name: 'Sea view', isHighlighted: true },
                { name: 'Balcony', isHighlighted: false },
                { name: 'Wi-Fi', isHighlighted: false },
                { name: 'Smart TV', isHighlighted: false },
                { name: 'Coffee maker', isHighlighted: false },
                { name: 'Workspace', isHighlighted: false }
            ]
        } as AvailableRoomClass

        render(
            <RoomClassCard
                roomClass={roomClass}
                checkIn={new Date('2026-04-03')}
                checkOut={new Date('2026-04-04')}
                hideRatePlanFeatures
                onUpdateQuantity={jest.fn()}
                selectedQuantity={0}
                onUpdatePlanQuantity={jest.fn()}
                selectedQuantitiesByPlan={{ 101: 0 }}
            />
        )

        const initialList = screen.getByLabelText('Room amenities')
        expect(within(initialList).getByText('Sea view')).toBeInTheDocument()
        expect(within(initialList).getByText('Balcony')).toBeInTheDocument()
        expect(within(initialList).getByText('Wi-Fi')).toBeInTheDocument()
        expect(within(initialList).getByText('Smart TV')).toBeInTheDocument()
        expect(within(initialList).queryByText('Coffee maker')).not.toBeInTheDocument()
        expect(within(initialList).queryByText('Workspace')).not.toBeInTheDocument()

        // Component opens a modal (not inline toggle) — button has aria-haspopup="dialog"
        const showMoreButton = screen.getByRole('button', { name: /showMoreFeatures/i })
        expect(showMoreButton).toHaveAttribute('aria-haspopup', 'dialog')
        fireEvent.click(showMoreButton)

        const dialog = screen.getByRole('dialog')
        expect(within(dialog).getByText('Coffee maker')).toBeInTheDocument()
        expect(within(dialog).getByText('Workspace')).toBeInTheDocument()
    })
})
