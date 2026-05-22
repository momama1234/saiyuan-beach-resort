'use client'

import { useCallback,useEffect, useRef, useState } from 'react'

import type { PendingBookingResponse } from '../api/pending-booking.api'
import { cancelPendingBooking,getPendingBooking } from '../api/pending-booking.api'

interface UsePendingBookingResult {
    pendingBooking: PendingBookingResponse | null
    timeRemaining: number
    isExpired: boolean
    isLoading: boolean
    error: string | null
    refresh: () => Promise<void>
    cancel: () => Promise<void>
}

/**
 * Hook to manage pending booking state and countdown
 * @param pendingBookingId - ID of the pending booking
 */
export function usePendingBooking(pendingBookingId: string | null): UsePendingBookingResult {
    const [pendingBooking, setPendingBooking] = useState<PendingBookingResponse | null>(null)
    const [timeRemaining, setTimeRemaining] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    // Fetch pending booking data
    const refresh = useCallback(async () => {
        if (!pendingBookingId) return

        setIsLoading(true)
        setError(null)

        try {
            const data = await getPendingBooking(pendingBookingId)
            setPendingBooking(data)
            setTimeRemaining(data.timeRemaining)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch pending booking')
            setPendingBooking(null)
        } finally {
            setIsLoading(false)
        }
    }, [pendingBookingId])

    // Cancel pending booking
    const cancel = useCallback(async () => {
        if (!pendingBookingId) return

        setIsLoading(true)
        setError(null)

        try {
            await cancelPendingBooking(pendingBookingId)
            setPendingBooking(null)
            setTimeRemaining(0)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to cancel pending booking')
        } finally {
            setIsLoading(false)
        }
    }, [pendingBookingId])

    // Initial fetch
    useEffect(() => {
        if (pendingBookingId) {
            refresh()
        }
    }, [pendingBookingId, refresh])

    // Countdown timer using actual expiration time (prevents drift)
    useEffect(() => {
        if (!pendingBooking || new Date(pendingBooking.expiresAt).getTime() <= Date.now()) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
            return
        }

        const calculateTimeRemaining = () => {
            const now = Date.now()
            const expiresAt = new Date(pendingBooking.expiresAt).getTime()
            const diff = Math.max(0, expiresAt - now)

            setTimeRemaining(diff)

            if (diff <= 0 && intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }

        // Initial calculation
        calculateTimeRemaining()

        intervalRef.current = setInterval(calculateTimeRemaining, 1000)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }
    }, [pendingBooking])

    const isExpired = timeRemaining <= 0 && pendingBooking !== null

    return {
        pendingBooking,
        timeRemaining,
        isExpired,
        isLoading,
        error,
        refresh,
        cancel
    }
}
