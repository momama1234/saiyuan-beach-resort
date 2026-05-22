import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { OPEN_ROOM_CLASS_AVAILABLE_API_PATH } from '@/constants/path'
import { getDataWithToken } from '@/lib/api'
import { buildApiUrl } from '@/lib/utils'
import { AvailableRoomClass } from '@/types/room-management'

export interface RoomAvailabilityState {
    roomClasses: AvailableRoomClass[]
    soldOutRoomClasses: AvailableRoomClass[]
    isLoading: boolean
    error: string | null
}

export interface RoomAvailabilityActions {
    fetchAvailableRooms: (_searchParams: URLSearchParams, _options?: { silent?: boolean }) => Promise<AvailableRoomClass[]>
    refreshAvailability: (_params: {
        checkIn: string
        checkOut: string
    }, _options?: { silent?: boolean }) => Promise<AvailableRoomClass[]>
    setRoomClasses: (_roomClasses: AvailableRoomClass[]) => void
    setSoldOutRoomClasses: (_roomClasses: AvailableRoomClass[]) => void
    setIsLoading: (_loading: boolean) => void
    setError: (_error: string | null) => void
}

export interface RoomAvailabilityStore extends RoomAvailabilityState {
    actions: RoomAvailabilityActions
}

export const useRoomAvailabilityStore = create<RoomAvailabilityStore>()(
    devtools(
        (set, get) => ({
            // State
            roomClasses: [],
            soldOutRoomClasses: [],
            isLoading: false,
            error: null,

            // Actions
            actions: {
                fetchAvailableRooms: async (searchParams, options) => {
                    if (!options?.silent) {
                        set({ isLoading: true, error: null }, false, 'fetchAvailableRooms/start')
                    }

                    try {
                        const filteredParams = new URLSearchParams(searchParams)
                        filteredParams.delete('adults')
                        filteredParams.delete('children')
                        filteredParams.delete('infants')
                        const url = buildApiUrl(OPEN_ROOM_CLASS_AVAILABLE_API_PATH, filteredParams)
                        const grouped = await getDataWithToken<{
                            availableRoomClasses: AvailableRoomClass[]
                            soldOutRoomClasses: AvailableRoomClass[]
                        }>(url)

                        set(
                            {
                                roomClasses: grouped.availableRoomClasses,
                                soldOutRoomClasses: grouped.soldOutRoomClasses,
                                isLoading: false
                            },
                            false,
                            'fetchAvailableRooms/success'
                        )

                        return grouped.availableRoomClasses
                    } catch (error) {
                        console.error('Error fetching room classes:', error)
                        const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการค้นหาห้องพัก'
                        set({ error: errorMessage, isLoading: false }, false, 'fetchAvailableRooms/error')
                        throw error
                    }
                },

                refreshAvailability: async (params, options) => {
                    const searchParams = new URLSearchParams({
                        checkIn: params.checkIn,
                        checkOut: params.checkOut
                    })

                    return get().actions.fetchAvailableRooms(searchParams, options)
                },

                setRoomClasses: (roomClasses) => {
                    set({ roomClasses }, false, 'setRoomClasses')
                },

                setSoldOutRoomClasses: (roomClasses) => {
                    set({ soldOutRoomClasses: roomClasses }, false, 'setSoldOutRoomClasses')
                },

                setIsLoading: (loading) => {
                    set({ isLoading: loading }, false, 'setIsLoading')
                },

                setError: (error) => {
                    set({ error }, false, 'setError')
                }
            }
        }),
        { name: 'RoomAvailabilityStore' }
    )
)

// Custom hooks for state
export const useAvailableRoomClasses = () => useRoomAvailabilityStore((state) => state.roomClasses)
export const useSoldOutRoomClasses = () => useRoomAvailabilityStore((state) => state.soldOutRoomClasses)
export const useIsLoadingRoomAvailability = () => useRoomAvailabilityStore((state) => state.isLoading)
export const useRoomAvailabilityError = () => useRoomAvailabilityStore((state) => state.error)

// Custom hook for actions
export const useRoomAvailabilityActions = () => useRoomAvailabilityStore((state) => state.actions)
