'use client'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import { CSSProperties } from 'react'
import { A11y, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { getRoomCardImageUrls } from '@/lib/room-image-url'
import { AvailableRoomClass } from '@/types/room-management'

import RoomCardSold, { RoomType } from './RoomCardSold'
interface RoomCardSoldContainerProps {
    roomsSold: AvailableRoomClass[]
    title: string
}

export default function RoomCardSoldContainer({ roomsSold, title }: RoomCardSoldContainerProps) {
    const toRoomType = (room: AvailableRoomClass): RoomType => {
        const cardImages = getRoomCardImageUrls(room)
        return {
            id: String(room.id),
            name: room.name,
            images:
                cardImages.length > 0
                    ? cardImages
                    : [
                          'https://picsum.photos/seed/room1/800/600',
                          'https://picsum.photos/seed/room2/800/600',
                          'https://picsum.photos/seed/room3/800/600',
                          'https://picsum.photos/seed/room4/800/600',
                          'https://picsum.photos/seed/room5/800/600'
                      ],
            labels: ['Best Seller', 'Free Breakfast'],
            size: room.roomSize ? `${room.roomSize} m²` : '—',
            guests: (room.numberOfAdults ?? 0) + (room.numberOfChildren ?? 0) || 2,
            bed: room.bedConfiguration ?? '—',
            features: room.features ?? []
        }
    }
    return (
        <>
            <div className="mx-auto flex h-auto w-full max-w-6xl flex-col">
                <h1 className="mb-2 text-lg font-semibold whitespace-nowrap">{title}</h1>

                <Swiper
                    modules={[Navigation, A11y]}
                    navigation
                    pagination={{ clickable: true }}
                    spaceBetween={16}
                    slidesPerView={1}
                    loop={false}
                    breakpoints={{
                        640: { slidesPerView: 2, spaceBetween: 16 },
                        1024: { slidesPerView: 3, spaceBetween: 16 }
                    }}
                    className="w-full"
                    style={{
                        ['--swiper-navigation-color' as keyof CSSProperties]: '#ff6600'
                    }}>
                    {roomsSold.map((roomClass) => (
                        <SwiperSlide key={roomClass.id}>
                            <RoomCardSold room={toRoomType(roomClass)} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </>
    )
}
