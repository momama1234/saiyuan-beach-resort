'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useShallow } from 'zustand/shallow'

import type { PendingBookingResponse } from '../api/pending-booking.api'

interface PendingBookingState {
    // State
    pendingBookingIds: string[]
    pendingBookingData: PendingBookingResponse[]
    isLocked: boolean
    sessionId: string | null

    // Actions
    setPendingBooking: (bookingId: string, data: PendingBookingResponse) => void
    setBulkPendingBookings: (sessionId: string, bookings: PendingBookingResponse[]) => void
    clearPendingBooking: () => void
    updateTimeRemaining: (timeRemaining: number) => void
}

/**
 * Zustand store for pending booking state.
 * Persisted to sessionStorage so each browser tab keeps its own reservation session.
 */
export const usePendingBookingStore = create<PendingBookingState>()(
    persist(
        (set) => ({
            // Initial state
            pendingBookingIds: [],
            pendingBookingData: [],
            isLocked: false,
            sessionId: null,

            // Add a single pending booking
            setPendingBooking: (bookingId, data) =>
                set((state) => ({
                    pendingBookingIds: [...state.pendingBookingIds, bookingId],
                    pendingBookingData: [...state.pendingBookingData, data],
                    isLocked: true
                })),

            // Set all bookings from a bulk create response
            setBulkPendingBookings: (sessionId, bookings) =>
                set({
                    sessionId,
                    pendingBookingIds: bookings.map((b) => b.id),
                    pendingBookingData: bookings,
                    isLocked: true
                }),

            // Clear all pending bookings
            clearPendingBooking: () =>
                set({
                    pendingBookingIds: [],
                    pendingBookingData: [],
                    isLocked: false,
                    sessionId: null
                }),

            // Update time remaining for all bookings
            updateTimeRemaining: (timeRemaining) =>
                set((state) => ({
                    pendingBookingData: state.pendingBookingData.map((booking) => ({
                        ...booking,
                        timeRemaining
                    }))
                }))
        }),
        {
            name: 'pending-booking-storage',
            storage: createJSONStorage(() => sessionStorage),
            version: 2,
            migrate: (persistedState: unknown, version: number) => {
                if (version === 0) {
                    const oldState = persistedState as {
                        pendingBookingId?: string | null
                        pendingBookingData?: PendingBookingResponse | null
                        isLocked?: boolean
                    }

                    return {
                        pendingBookingIds: oldState.pendingBookingId ? [oldState.pendingBookingId] : [],
                        pendingBookingData: oldState.pendingBookingData ? [oldState.pendingBookingData] : [],
                        isLocked: oldState.isLocked || false,
                        sessionId: null
                    }
                }

                if (version === 1) {
                    const v1State = persistedState as {
                        pendingBookingIds?: string[]
                        pendingBookingData?: PendingBookingResponse[]
                        isLocked?: boolean
                    }

                    return { ...v1State, sessionId: null }
                }

                return persistedState
            },
            partialize: (state) => ({
                pendingBookingIds: state.pendingBookingIds,
                pendingBookingData: state.pendingBookingData,
                isLocked: state.isLocked,
                sessionId: state.sessionId
            })
        }
    )
)

// Selectors for better performance
export const usePendingBookingIds = () => usePendingBookingStore((state) => state.pendingBookingIds)
export const usePendingBookingData = () => usePendingBookingStore((state) => state.pendingBookingData)
export const useIsLocked = () => usePendingBookingStore((state) => state.isLocked)
export const useSessionId = () => usePendingBookingStore((state) => state.sessionId)
export const usePendingBookingActions = () =>
    usePendingBookingStore(
        useShallow((state) => ({
            setPendingBooking: state.setPendingBooking,
            setBulkPendingBookings: state.setBulkPendingBookings,
            clearPendingBooking: state.clearPendingBooking,
            updateTimeRemaining: state.updateTimeRemaining
        }))
    )
