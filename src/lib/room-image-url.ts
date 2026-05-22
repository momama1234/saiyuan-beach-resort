import type { AvailableRoomClass } from '@/types/room-management'

type RoomImageSource = Pick<AvailableRoomClass, 'images' | 'displayImages'>

const DEFAULT_ROOM_IMAGE = '/images/default-image.jpg'

export function getRoomCardImageUrls(room: RoomImageSource): string[] {
    if (room.displayImages && room.displayImages.length > 0) {
        return room.displayImages.map((d) => d.card.url)
    }
    return room.images ?? []
}

export function getRoomCoverImageUrl(room: RoomImageSource): string {
    return room.displayImages?.[0]?.card?.url ?? room.images?.[0] ?? DEFAULT_ROOM_IMAGE
}
