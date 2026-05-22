/**
 * Pending Booking Status
 * Used by the Hard Lock + Expire system to prevent double bookings
 */
export enum PendingBookingStatus {
    /** Waiting for guest information */
    PENDING = 0,

    /** Confirmed (converted to an actual booking) */
    CONFIRMED = 1,

    /** Expired (time limit exceeded) */
    EXPIRED = 2,

    /** Cancelled by user */
    CANCELLED = 3
}

/**
 * Room lock duration (milliseconds)
 * @default 10 minutes (600,000 ms)
 */
export const PENDING_BOOKING_LOCK_DURATION_MS = 10 * 60 * 1000

/**
 * Room lock duration (minutes)
 * @default 10 minutes
 */
export const PENDING_BOOKING_LOCK_DURATION_MINUTES = 10

/**
 * Warning time before lock expiration (milliseconds)
 * @default 2 minutes (120,000 ms)
 */
export const PENDING_BOOKING_WARNING_TIME_MS = 2 * 60 * 1000
