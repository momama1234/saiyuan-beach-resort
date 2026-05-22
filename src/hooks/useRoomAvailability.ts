import { useCallback, useState } from 'react'

import { getDataWithToken } from '@/lib/api'
import { AvailableRoomClass } from '@/types/room-management'

interface UseRoomAvailabilityProps {
    onSuccess?: (_roomClasses: AvailableRoomClass[]) => void
    onError?: (_error: string) => void
}

export function useRoomAvailability({ onSuccess, onError }: UseRoomAvailabilityProps = {}) {
    const [roomClasses, setRoomClasses] = useState<AvailableRoomClass[]>([])
    const [soldOutRoomClasses, setSoldOutRoomClasses] = useState<AvailableRoomClass[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const fetchAvailableRooms = useCallback(
        async (searchParams: URLSearchParams) => {
            setIsLoading(true)

            try {
                const grouped = await getDataWithToken<{
                    availableRoomClasses: AvailableRoomClass[]
                    soldOutRoomClasses: AvailableRoomClass[]
                }>(`/open/room-class-available?${searchParams.toString()}`)

                setRoomClasses(grouped.availableRoomClasses)
                setSoldOutRoomClasses(grouped.soldOutRoomClasses)
                onSuccess?.(grouped.availableRoomClasses)

                return grouped.availableRoomClasses
            } catch (error) {
                console.error('Error fetching room classes:', error)
                const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการค้นหาห้องพัก'
                onError?.(errorMessage)
                throw error
            } finally {
                setIsLoading(false)
            }
        },
        [onSuccess, onError]
    )

    const refreshAvailability = useCallback(
        async (params: { checkIn: string; checkOut: string }) => {
            const searchParams = new URLSearchParams({
                checkIn: params.checkIn,
                checkOut: params.checkOut
            })

            return fetchAvailableRooms(searchParams)
        },
        [fetchAvailableRooms]
    )

    return {
        roomClasses,
        soldOutRoomClasses,
        isLoading,
        fetchAvailableRooms,
        refreshAvailability,
        setRoomClasses,
        setSoldOutRoomClasses
    }
}
