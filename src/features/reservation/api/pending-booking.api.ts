import { PendingBookingStatus } from '@/shared/constants/pending-booking'

/**
 * Pending Booking API Client
 * Handles communication with backend pending booking endpoints
 */

export interface CreateBulkPendingBookingDto {
    sessionId: string
    propertyId: number
    checkInDate: string
    checkOutDate: string
    adultCount: number
    childCount?: number
    infantCount?: number
    rooms: Array<{
        roomClassId: number
        ratePlanId: number
        quantity: number
    }>
}

export interface CreatePendingBookingDto {
    roomClassId: number
    propertyId: number
    ratePlanId: number
    checkInDate: string
    checkOutDate: string
    adultCount: number
    childCount?: number
    infantCount?: number
}

export interface PendingBookingResponse {
    id: string
    roomClassId: number
    propertyId: number
    ratePlanId: number
    checkInDate: string
    checkOutDate: string
    adultCount: number
    childCount: number
    infantCount: number
    status: PendingBookingStatus
    lockedAt: string
    expiresAt: string
    timeRemaining: number
    createdAt: string
    updatedAt: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/v1'

/**
 * Create a new pending booking  (lock a room)
 */
export async function createPendingBooking(data: CreatePendingBookingDto): Promise<PendingBookingResponse> {
    const response = await fetch(`${API_BASE_URL}/api/bookings/pending`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create pending booking')
    }

    return response.json()
}

/**
 * Get pending booking status by ID
 */
export async function getPendingBooking(id: string): Promise<PendingBookingResponse> {
    const response = await fetch(`${API_BASE_URL}/api/bookings/pending/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('PENDING_BOOKING_NOT_FOUND')
        }
        const error = await response.json()
        throw new Error(error.message || 'Failed to get pending booking')
    }

    return response.json()
}

/**
 * Confirm a pending booking (convert to actual booking)
 */
export async function confirmPendingBooking(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/bookings/pending/${id}/confirm`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to confirm pending booking')
    }
}

/**
 * Create multiple pending bookings atomically in a single request
 */
export async function createBulkPendingBookings(data: CreateBulkPendingBookingDto): Promise<PendingBookingResponse[]> {
    const response = await fetch(`${API_BASE_URL}/api/bookings/pending/bulk`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create bulk pending bookings')
    }

    return response.json()
}

/**
 * Cancel all pending bookings belonging to a session
 */
export async function cancelPendingBookingsBySession(sessionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/bookings/pending?sessionId=${encodeURIComponent(sessionId)}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to cancel pending bookings by session')
    }
}

/**
 * Fire-and-forget variant used during page unload.
 * Uses keepalive so the browser can continue the request while closing the page.
 */
export function cancelPendingBookingsBySessionKeepalive(sessionId: string): void {
    void fetch(`${API_BASE_URL}/api/bookings/pending?sessionId=${encodeURIComponent(sessionId)}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        keepalive: true
    }).catch(() => {
        // Ignore unload cleanup failures and rely on backend expiry as a fallback.
    })
}

/**
 * Cancel a pending booking (release the lock)
 */
export async function cancelPendingBooking(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/bookings/pending/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to cancel pending booking')
    }
}
