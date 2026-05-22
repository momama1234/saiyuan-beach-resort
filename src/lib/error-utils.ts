const BOOKING_ERROR_PREFIX = 'BOOKING_ERROR:'

/**
 * Extracts user-facing message from API errors.
 * If the error is in BOOKING_ERROR format, returns only the `message` field.
 * Otherwise returns the error message or fallback.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message.startsWith(BOOKING_ERROR_PREFIX)) {
        try {
            const jsonStr = error.message.slice(BOOKING_ERROR_PREFIX.length)
            const data = JSON.parse(jsonStr) as { message?: string }
            return typeof data.message === 'string' ? data.message : fallback
        } catch {
            return fallback
        }
    }
    return error instanceof Error ? error.message : fallback
}
