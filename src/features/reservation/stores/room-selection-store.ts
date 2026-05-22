import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { AvailableRoomClass } from '@/types/room-management'

export interface RoomSelection {
    [roomClassId: number]: number
}

export interface RoomSelectionByPlan {
    [roomClassId: number]: {
        [ratePlanId: number]: {
            quantity: number
            occupancyOptionId?: number
        }
    }
}

export interface RoomSelectionState {
    selectedRooms: RoomSelection
    selectedRoomsByPlan: RoomSelectionByPlan
    roomClasses: AvailableRoomClass[]
}

export interface SelectedRoomPlanItem {
    roomClass: AvailableRoomClass
    ratePlanId: number
    quantity: number
    occupancyOptionId?: number
}

export interface RoomSelectionActions {
    setRoomClasses: (_roomClasses: AvailableRoomClass[]) => void
    updateRoomQuantity: (_roomClassId: number, _quantity: number) => void
    updatePlanQuantity: (
        _roomClassId: number,
        _ratePlanId: number,
        _quantity: number,
        _occupancyOptionId?: number
    ) => void
    getSelectedRoomsList: () => Array<{
        roomClass: AvailableRoomClass
        quantity: number
    }>
    getSelectedRoomsPlanList: () => SelectedRoomPlanItem[]
    clearSelections: () => void
}

export interface RoomSelectionStore extends RoomSelectionState {
    actions: RoomSelectionActions
}

export const useRoomSelectionStore = create<RoomSelectionStore>()(
    devtools(
        (set, get) => ({
            // State
            selectedRooms: {},
            selectedRoomsByPlan: {},
            roomClasses: [],

            // Actions
            actions: {
                setRoomClasses: (roomClasses) => {
                    set({ roomClasses }, false, 'setRoomClasses')
                },

                updateRoomQuantity: (roomClassId, quantity) => {
                    set(
                        (state) => {
                            const newSelection = { ...state.selectedRooms }
                            if (quantity > 0) {
                                newSelection[roomClassId] = quantity
                            } else {
                                delete newSelection[roomClassId]
                            }
                            return { selectedRooms: newSelection }
                        },
                        false,
                        `updateRoomQuantity/${roomClassId}`
                    )
                },

                updatePlanQuantity: (roomClassId, ratePlanId, quantity, occupancyOptionId) => {
                    set(
                        (state) => {
                            const next = { ...state.selectedRoomsByPlan }
                            if (!next[roomClassId]) next[roomClassId] = {}

                            const roomClass = state.roomClasses.find((r) => r.id === roomClassId)
                            const capacity = (roomClass?.availableRooms ?? roomClass?.numberOfRooms ?? 0) || 0
                            const currentPlans = next[roomClassId]
                            const otherSum = Object.entries(currentPlans).reduce((s, [rpId, sel]) => {
                                return s + (parseInt(rpId, 10) === ratePlanId ? 0 : sel.quantity || 0)
                            }, 0)

                            if (quantity > 0) {
                                const maxAllowed = Math.max(0, capacity - otherSum)
                                const finalQty = Math.min(quantity, maxAllowed)
                                next[roomClassId][ratePlanId] = { quantity: finalQty, occupancyOptionId }
                            } else {
                                delete next[roomClassId][ratePlanId]
                                if (Object.keys(next[roomClassId]).length === 0) delete next[roomClassId]
                            }

                            // Update aggregated selectedRooms
                            const aggregated: RoomSelection = {}
                            Object.entries(next).forEach(([rcId, plans]) => {
                                aggregated[parseInt(rcId, 10)] = Object.values(plans).reduce(
                                    (s, p) => s + (p.quantity || 0),
                                    0
                                )
                            })

                            return {
                                selectedRoomsByPlan: next,
                                selectedRooms: aggregated
                            }
                        },
                        false,
                        `updatePlanQuantity/${roomClassId}/${ratePlanId}`
                    )
                },

                getSelectedRoomsList: () => {
                    const { selectedRooms, roomClasses } = get()
                    return Object.entries(selectedRooms)
                        .map(([roomClassId, quantity]) => {
                            const roomClass = roomClasses.find((r) => r.id === parseInt(roomClassId))
                            if (!roomClass) return null
                            return { roomClass, quantity }
                        })
                        .filter((item): item is { roomClass: AvailableRoomClass; quantity: number } => item !== null)
                },

                getSelectedRoomsPlanList: () => {
                    const { selectedRoomsByPlan, roomClasses } = get()
                    const result: SelectedRoomPlanItem[] = []

                    Object.entries(selectedRoomsByPlan).forEach(([roomClassId, plans]) => {
                        const roomClass = roomClasses.find((r) => r.id === parseInt(roomClassId, 10))
                        if (!roomClass) return

                        Object.entries(plans).forEach(([ratePlanId, planData]) => {
                            const typedPlanData = planData as { quantity: number; occupancyOptionId?: number }
                            if (typedPlanData.quantity > 0) {
                                result.push({
                                    roomClass,
                                    ratePlanId: parseInt(ratePlanId, 10),
                                    quantity: typedPlanData.quantity,
                                    occupancyOptionId: typedPlanData.occupancyOptionId
                                })
                            }
                        })
                    })

                    return result
                },

                clearSelections: () => {
                    set({ selectedRooms: {}, selectedRoomsByPlan: {} }, false, 'clearSelections')
                }
            }
        }),
        { name: 'RoomSelectionStore' }
    )
)

// Custom hooks for state
export const useSelectedRooms = () => useRoomSelectionStore((state) => state.selectedRooms)
export const useSelectedRoomsByPlan = () => useRoomSelectionStore((state) => state.selectedRoomsByPlan)
export const useRoomClasses = () => useRoomSelectionStore((state) => state.roomClasses)

// Custom hooks for computed values
export const useTotalRooms = () =>
    useRoomSelectionStore((state) => Object.values(state.selectedRooms).reduce((sum, qty) => sum + qty, 0))

// Custom hook for actions
export const useRoomSelectionActions = () => useRoomSelectionStore((state) => state.actions)
