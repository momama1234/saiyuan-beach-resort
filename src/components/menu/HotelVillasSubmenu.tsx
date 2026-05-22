import { Link } from '@/i18n/routing'
import { RoomClassWithSlug } from '@/types/room'

interface HotelVillasSubmenuProps {
    isMobile?: boolean
    roomClasses: RoomClassWithSlug[]
}

const groupRoomsByCategory = (rooms: RoomClassWithSlug[]) => {
    const categories = {
        'Saiyuan 1 Bedroom': ['Anda Deluxe Room', 'Anda Premium Room'],
        'Saiyuan Villas': [
            'Phupha Premium Room',
            'Phupha Family Room',
            'Oriental Deluxe Villa',
            'Oriental Beach Front View Villa'
        ],
        'Saiyuan Family': [
            'Family Pool Villa',
            'Family Luxury House',
            'Family Tropical House',
            'Family Timber House',
            'Family Botanical 2BR 1st FLR',
            'Family Botanical 2BR 2nd FLR'
        ]
    }

    const groupedRooms: { [key: string]: RoomClassWithSlug[] } = {
        'Saiyuan 1 Bedroom': [],
        'Saiyuan Villas': [],
        'Saiyuan Family': [],
        Other: []
    }

    rooms.forEach((room) => {
        let assigned = false

        Object.entries(categories).forEach(([categoryName, roomNames]) => {
            const isMatch = roomNames.some((roomName) => {
                const normalizedRoomName = room.name.toLowerCase().trim()
                const normalizedCategoryRoom = roomName.toLowerCase().trim()

                return (
                    normalizedRoomName.includes(normalizedCategoryRoom) ||
                    normalizedCategoryRoom.includes(normalizedRoomName)
                )
            })

            if (isMatch && !assigned) {
                groupedRooms[categoryName]?.push(room)
                assigned = true
            }
        })

        if (!assigned) {
            groupedRooms['Other']?.push(room)
        }
    })

    return groupedRooms
}

const HotelVillasSubmenu = ({ isMobile, roomClasses }: HotelVillasSubmenuProps): React.JSX.Element => {
    const groupedRooms = groupRoomsByCategory(roomClasses)

    return (
        <div
            className={`${
                isMobile
                    ? 'flex flex-col space-y-2 pt-2 pl-4'
                    : 'absolute top-full left-0 z-[200] hidden min-w-[840px] flex-col bg-black/90 py-2 group-hover:flex'
            }`}>
            {!isMobile && (
                <div className="grid grid-cols-3 gap-4">
                    {Object.entries(groupedRooms)
                        .filter(([, rooms]) => rooms.length > 0)
                        .map(([categoryName, rooms]) => (
                            <div key={categoryName} className="flex flex-col px-4">
                                <h3 className="mx-2 border-b border-teal-700/30 py-2 text-[1em] font-normal text-[#0E7C86]">
                                    {categoryName}
                                </h3>
                                {rooms.map((room) => (
                                    <Link
                                        key={room.id}
                                        href={`/rooms/${room.slug || String(room.id)}`}
                                        className="rounded-sm py-2 pl-2 text-[.9em] font-medium text-white transition-colors hover:bg-[#0E7C86]">
                                        {room.name}
                                    </Link>
                                ))}
                            </div>
                        ))}
                </div>
            )}
            {isMobile && (
                <div className="flex flex-col space-y-3">
                    {Object.entries(groupedRooms)
                        .filter(([, rooms]) => rooms.length > 0)
                        .map(([categoryName, rooms]) => (
                            <div key={categoryName} className={`m-0`}>
                                <h3 className="border-b border-teal-700/30 py-2 text-[.9em] font-normal text-[#0E7C86]">
                                    {categoryName}
                                </h3>
                                {rooms.map((room) => (
                                    <Link
                                        key={room.id}
                                        href={`/rooms/${room.slug || String(room.id)}`}
                                        className="block py-1 text-[.85em] font-light text-white/80 transition-colors hover:text-[#0a6570]">
                                        {room.name}
                                    </Link>
                                ))}
                            </div>
                        ))}
                </div>
            )}
        </div>
    )
}

export default HotelVillasSubmenu
