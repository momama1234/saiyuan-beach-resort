'use server'

// Use environment variable directly instead of importing from config
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/v1'

// Basic type definitions
type BookingErrorType = 'NO_AVAILABILITY' | 'VALIDATION_ERROR' | 'ROOM_CONFLICT' | 'SYSTEM_ERROR' | 'UNKNOWN_ERROR'

type BookingAlternative = Record<string, unknown>

interface BookingErrorDetails {
    alternatives?: BookingAlternative[]
    requestedRoomClassId?: string
    availableCount?: number
    hasAlternatives?: boolean
}

interface BookingError {
    message: string
    type: BookingErrorType
    statusCode: number
    details?: BookingErrorDetails
}

interface ApiErrorResponse extends BookingErrorDetails {
    message: string | string[]
}

/**
 * Get the headers for the API (property ID comes from JWT token in backend)
 * @param accessToken - The access token to use for the API
 * @returns The headers for the API
 */
async function getHeaders() {
    const headers = new Headers()

    // Add x-api-key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_API_KEY
    if (apiKey) {
        headers.set('x-api-key', apiKey)
    }

    // Add public key from environment variables
    const publicKey = process.env.NEXT_PUBLIC_API_PUBLIC_KEY
    if (publicKey) {
        headers.set('x-public-key', publicKey)
    }
    return headers
}

/**
 * Get the data from the API
 *
 * @param path - The path to get the data from
 * @param signal
 */
export async function getDataWithToken<T>(path: string, signal?: AbortSignal, revalidate?: number) {
    return await callApiWithToken<T>('GET', path, undefined, signal, revalidate)
}

/**
 * Post data to the API
 *
 * @param path - The path to post the data to
 * @param data - The data to post
 * @param signal - The signal to abort the request
 */
export async function postData<T = unknown>(path: string, data: object, signal?: AbortSignal) {
    return await callApiWithToken<T>('POST', path, data, signal)
}

/**
 * Patch data to the API
 *
 * @param path - The path to patch the data to
 * @param data - The data to patch
 * @param signal
 */
export async function patchData<T = unknown>(path: string, data: object, signal?: AbortSignal) {
    return await callApiWithToken<T>('PATCH', path, data, signal)
}

/**
 * Put data to the API
 *
 * @param path - The path to put the data to
 * @param data - The data to put
 * @param signal
 */
export async function putData<T = unknown>(path: string, data: object, signal?: AbortSignal) {
    return await callApiWithToken<T>('PUT', path, data, signal)
}

/**
 * Delete data from the API
 *
 * @param path - The path to delete the data from
 * @param data - The data to delete
 * @param signal
 */
export async function deleteData<T = unknown>(path: string, data?: object, signal?: AbortSignal) {
    return await callApiWithToken<T>('DELETE', path, data, signal)
}

/**
 * Call the API with the headers
 *
 * @param method - The method to call
 * @param path - The url to call
 * @param data - The data to call
 * @param signal
 */
export async function callApiWithToken<T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    data?: object,
    signal?: AbortSignal,
    revalidate?: number
): Promise<T> {
    const headers = await getHeaders()
    const init: RequestInit = {
        method,
        headers
    }
    if (data) {
        if (data instanceof FormData) {
            init.body = data
        } else {
            headers.set('Content-Type', 'application/json')
            init.body = JSON.stringify(data)
        }
    }

    if (revalidate !== undefined) {
        init.next = { revalidate }
    } else {
        init.cache = 'no-cache'
    }

    if (signal) {
        init.signal = signal
    }
    // try {
    const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`
    const response = await fetch(url, init)
    // if (response.status === 401) {
    //     console.log('Response status 401')
    //     if (!session?.refreshToken) {
    //         throw new Error('Refresh token not found')
    //     }

    //     const { newAccessToken, newRefreshToken } = await refreshAccessToken(
    //         session.refreshToken
    //     )
    //     if (newAccessToken) {
    //         console.log('newAccessToken', newAccessToken)
    //         console.log('newRefreshToken', newRefreshToken)

    //         session.refreshToken = newRefreshToken as string
    //         session.accessToken = newAccessToken as string

    //         const newResponse = await fetch(url, init)

    //         return await newResponse.json()
    //     }
    // }

    if (!response.ok) {
        const bookingError = await parseApiError(response)

        // For server actions, we need to encode all error data in the message
        // since Next.js doesn't preserve custom object properties across the boundary
        const errorData = {
            type: bookingError.type,
            message: bookingError.message,
            statusCode: bookingError.statusCode,
            details: bookingError.details
        }

        // Create error with JSON-encoded message that contains all data
        const serializedError = new Error(`BOOKING_ERROR:${JSON.stringify(errorData)}`)

        throw serializedError
    }

    // Handle 204 No Content response (for DELETE operations)
    if (response.status === 204) {
        return {
            message: 'No content',
            statusCode: 204,
            type: 'NO_CONTENT'
        } as unknown as T
    }

    // Check if response has content before trying to parse JSON
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
        return (await response.json()) as T
    }

    // For other successful responses without JSON content, return null
    return null as unknown as T
    // } catch (e) {
    //     throw new Error('Failed to parse response')
    // }
}

/**
 * Get the data from the API
 *
 * @param url - The url to get the data from
 * @param isCache - Whether to cache the data
 * @param signal - The signal to abort the request
 */
export async function getDataResponse(url: string, isCache = true, signal?: AbortSignal) {
    const headers = await getHeaders()
    const init: RequestInit = {
        method: 'GET',
        next: isCache ? { revalidate: 10 } : undefined,
        cache: isCache ? 'force-cache' : 'no-store',
        signal,
        headers
    }
    const response = await fetch(API_URL + url, init)
    return response
}

export async function postDataResponse(url: string, data: object) {
    const headers = await getHeaders()
    const init: RequestInit = {
        method: 'POST',
        headers
    }
    if (data) {
        headers.set('Content-Type', 'application/json')
        init.body = JSON.stringify(data)
    }
    const response = await fetch(API_URL + url, init)
    return response
}

export async function patchDataResponse(url: string, data: object) {
    const headers = await getHeaders()
    const init: RequestInit = {
        method: 'PATCH',
        headers
    }
    if (data) {
        headers.set('Content-Type', 'application/json')
        init.body = JSON.stringify(data)
    }
    const response = await fetch(API_URL + url, init)
    return response
}

export async function putDataResponse(url: string, data: object) {
    const headers = await getHeaders()
    const init: RequestInit = {
        method: 'PUT',
        headers
    }
    if (data) {
        headers.set('Content-Type', 'application/json')
        init.body = JSON.stringify(data)
    }
    const response = await fetch(API_URL + url, init)
    return response
}

/**
 * Parse API error response to extract detailed error information
 */
async function parseApiError(response: Response): Promise<BookingError> {
    try {
        const errorData: ApiErrorResponse = await response.json()

        // Determine error type based on status code and content
        let errorType: BookingErrorType = 'UNKNOWN_ERROR'
        let userMessage = 'An unexpected error occurred. Please try again.'
        // Extract request path for better 409 classification
        let path = ''
        try {
            path = new URL(response.url).pathname.toLowerCase()
        } catch {
            path = ''
        }

        if (response.status === 404) {
            errorType = 'NO_AVAILABILITY'
            // Check if it's a room availability error
            if (errorData.alternatives !== undefined || errorData.hasAlternatives !== undefined) {
                if (errorData.hasAlternatives && errorData.alternatives && errorData.alternatives.length > 0) {
                    userMessage = `No rooms available for your selected room type. We found ${errorData.alternatives.length} alternative room types available for your dates.`
                } else {
                    userMessage =
                        'No rooms available for the selected dates. Please try different dates or contact us for assistance.'
                }
            } else {
                userMessage =
                    typeof errorData.message === 'string' ? errorData.message : errorData.message[0] || userMessage
            }
        } else if (response.status === 400) {
            errorType = 'VALIDATION_ERROR'
            userMessage = typeof errorData.message === 'string' ? errorData.message : errorData.message.join(', ')
        } else if (response.status === 409) {
            const serverMessage =
                typeof errorData.message === 'string' ? errorData.message : errorData.message?.join(', ')

            if (path.includes('booking') || path.includes('reservation')) {
                errorType = 'ROOM_CONFLICT'
                userMessage = serverMessage || 'Room conflict detected. The selected room may no longer be available.'
            } else {
                errorType = 'VALIDATION_ERROR'
                userMessage = serverMessage || 'Conflict detected. Please review your input and try again.'
            }
        } else if (response.status >= 500) {
            errorType = 'SYSTEM_ERROR'
            userMessage = 'Server error occurred. Please try again later or contact support.'
        }

        return {
            message: userMessage,
            type: errorType,
            statusCode: response.status,
            details: {
                alternatives: errorData.alternatives,
                requestedRoomClassId: errorData.requestedRoomClassId,
                availableCount: errorData.availableCount,
                hasAlternatives: errorData.hasAlternatives
            }
        }
    } catch {
        // If we can't parse the error response, return a generic error
        return {
            message: 'An unexpected error occurred. Please try again.',
            type: 'UNKNOWN_ERROR',
            statusCode: response.status
        }
    }
}
