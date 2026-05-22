import type { RoomFeature } from '@/types/room-management'

import RoomFacilities from './components/RoomFacilities'
import RoomImagesCarousel from './components/RoomImagesCarousel'
import RoomInfo from './components/RoomInfo'
import RoomLabels from './components/RoomLabels'
import SeeDetailMore from './components/SeeDetailMore'

export interface RoomType {
    images: string[]
    labels: string[]
    name: string
    id: string
    size: string
    guests: number
    bed: string
    features: RoomFeature[]
    createdBy?: string
    createdAt?: string
}

export default function RoomCardSold({ room }: { room: RoomType }) {
    return (
        <div className="flex h-[480px] w-full flex-col rounded-xl bg-white p-4 shadow-md sm:h-[520px] md:h-[600px]">
            {/* Image Section */}
            <div className="relative w-full flex-shrink-0">
                <RoomImagesCarousel images={room.images} roomName={room.name} />

                <div className="pointer-events-none absolute top-2 left-2 z-10">
                    <RoomLabels labels={room.labels} />
                </div>
            </div>

            {/* Room Info Section - Takes remaining space */}
            <div className="mt-1 flex min-h-0 w-full flex-grow flex-col space-y-3">
                <RoomInfo name={room.name} size={room.size} guests={room.guests} bed={room.bed} />
                <RoomFacilities features={room.features} />
            </div>

            {/* See Detail More - Always at bottom */}
            <div className="mt-auto flex-shrink-0 pt-2">
                <SeeDetailMore room={room} />
            </div>
        </div>
    )
}
