import { type ClassValue, clsx } from 'clsx'
import { addDays, startOfDay } from 'date-fns'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names and Tailwind CSS classes into a single string
 * Uses clsx to handle conditional classes and tailwind-merge to resolve conflicts
 *
 * This utility combines the power of clsx (for conditional class handling) and
 * tailwind-merge (for intelligent Tailwind class deduplication). When multiple
 * Tailwind classes conflict (e.g., 'px-2' and 'px-4'), the last one wins.
 *
 * @param inputs - Variable number of class values (strings, objects, arrays, etc.)
 * @returns A merged string of class names with conflicts resolved
 *
 * @example
 * // Simple class merging
 * cn('px-2 py-1', 'bg-blue-500')
 * // Returns: 'px-2 py-1 bg-blue-500'
 *
 * @example
 * // Tailwind class conflict resolution (last one wins)
 * cn('px-2 py-1', 'px-4')
 * // Returns: 'py-1 px-4'
 *
 * @example
 * // Conditional classes with objects
 * cn('base-class', { 'active-class': isActive, 'disabled-class': isDisabled })
 * // Returns: 'base-class active-class' (if isActive=true, isDisabled=false)
 *
 * @example
 * // Combining with component props
 * cn('default-button-styles', props.className)
 * // Allows props.className to override default styles
 *
 * @example
 * // Complex conditional with arrays and objects
 * cn(
 *   'base',
 *   ['array-class-1', 'array-class-2'],
 *   { 'conditional': true, 'hidden': false },
 *   undefined,
 *   'final-class'
 * )
 * // Returns: 'base array-class-1 array-class-2 conditional final-class'
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Build an API URL with path parameters and query parameters
 * @param basePath - The base API path with optional :param placeholders
 * @param params - Parameters as URLSearchParams, object, or Record
 * @returns The complete URL with path params replaced and query string appended
 *
 * @example
 * // Query parameters only
 * buildApiUrl('/api/rooms', { checkIn: '2024-01-01', adults: '2' })
 * // Returns: '/api/rooms?checkIn=2024-01-01&adults=2'
 *
 * @example
 * // Path parameters with query parameters
 * buildApiUrl('/comment/post/:postId/comment/:commentId', {
 *   postId: '123',
 *   commentId: '456',
 *   includeReplies: 'true'
 * })
 * // Returns: '/comment/post/123/comment/456?includeReplies=true'
 *
 * @example
 * // Path parameters only
 * buildApiUrl('/users/:userId/posts/:postId', { userId: '1', postId: '42' })
 * // Returns: '/users/1/posts/42'
 *
 * @example
 * // URLSearchParams with duplicate keys (combined into comma-separated values)
 * const params = new URLSearchParams()
 * params.append('tag', 'javascript')
 * params.append('tag', 'typescript')
 * buildApiUrl('/api/posts', params)
 * // Returns: '/api/posts?tag=javascript,typescript'
 */
export function buildApiUrl(
    basePath: string,
    params?: URLSearchParams | Record<string, string | number | boolean | undefined | null> | null
): string {
    if (!params) {
        return basePath
    }

    // If params is URLSearchParams, combine duplicate keys into comma-separated values
    if (params instanceof URLSearchParams) {
        // Group duplicate keys into comma-separated values
        const consolidatedParams = new URLSearchParams()
        const processedKeys = new Set<string>()

        for (const [key] of params.entries()) {
            if (!processedKeys.has(key)) {
                // Get all values for this key
                const allValues = params.getAll(key)
                // Combine them with commas
                consolidatedParams.set(key, allValues.join(','))
                processedKeys.add(key)
            }
        }

        const queryString = consolidatedParams.toString()
        return queryString ? `${basePath}?${queryString}` : basePath
    }

    // Extract path parameter names from the basePath (e.g., :postId, :commentId)
    const pathParamMatches = basePath.match(/:\w+/g) || []
    const pathParamNames = pathParamMatches.map((match) => match.slice(1)) // Remove ':' prefix

    // Check for duplicate path parameter names
    const uniquePathParamNames = new Set(pathParamNames)
    if (uniquePathParamNames.size !== pathParamNames.length) {
        const duplicates = pathParamNames.filter((name, index) => pathParamNames.indexOf(name) !== index)
        throw new Error(
            `buildApiUrl: Duplicate path parameter names found: ${[...new Set(duplicates)].join(', ')} in path: ${basePath}`
        )
    }

    // Separate path params from query params
    const pathParams: Record<string, string> = {}
    const queryParams: Record<string, string> = {}

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
            return // Skip empty values
        }

        if (pathParamNames.includes(key)) {
            pathParams[key] = String(value)
        } else {
            queryParams[key] = String(value)
        }
    })

    // Replace path parameters in the basePath
    let finalPath = basePath
    Object.entries(pathParams).forEach(([key, value]) => {
        finalPath = finalPath.replace(`:${key}`, value)
    })

    // Check if any path params were missed
    const remainingPathParams = finalPath.match(/:\w+/g)
    if (remainingPathParams) {
        console.warn(
            `buildApiUrl: Missing values for path parameters: ${remainingPathParams.join(', ')} in path: ${basePath}`
        )
    }

    // Build query string from remaining params
    const searchParams = new URLSearchParams(Object.entries(queryParams).map(([key, value]) => [key, value]))

    const queryString = searchParams.toString()
    return queryString ? `${finalPath}?${queryString}` : finalPath
}

/**
 * Creates a URL-friendly slug from a category name
 *
 * Transforms any string into a clean, lowercase, hyphenated slug suitable for URLs.
 * Handles special characters, spaces, underscores, and ensures proper formatting.
 *
 * Transformation rules:
 * - Converts to lowercase
 * - Replaces '&' with '-and-'
 * - Converts spaces and underscores to hyphens
 * - Removes all special characters except hyphens
 * - Collapses multiple consecutive hyphens into one
 * - Removes leading and trailing hyphens
 *
 * @param name - The string to convert into a slug
 * @returns A URL-friendly slug string, or empty string if input is falsy
 *
 * @example
 * // Ampersand handling
 * createSlugFromName('Resort & Beach')
 * // Returns: 'resort-and-beach'
 *
 * @example
 * // Underscore and space handling
 * createSlugFromName('swimming_pool area')
 * // Returns: 'swimming-pool-area'
 *
 * @example
 * // Simple text
 * createSlugFromName('Restaurant')
 * // Returns: 'restaurant'
 *
 * @example
 * // Special characters removal
 * createSlugFromName('Café & Bar (Downtown)!')
 * // Returns: 'caf-and-bar-downtown'
 *
 * @example
 * // Empty or falsy input
 * createSlugFromName('')
 * // Returns: ''
 */
/**
 * Generates a cryptographically random UUID v4.
 * Uses crypto.getRandomValues() which works in both secure (HTTPS) and
 * non-secure (HTTP) contexts, unlike crypto.randomUUID().
 */
export function generateUUID(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(16))
    bytes[6] = (bytes[6]! & 0x0f) | 0x40 // version 4
    bytes[8] = (bytes[8]! & 0x3f) | 0x80 // variant bits
    return [...bytes]
        .map((b, i) =>
            [4, 6, 8, 10].includes(i)
                ? `-${b.toString(16).padStart(2, '0')}`
                : b.toString(16).padStart(2, '0'),
        )
        .join('')
}

/**
 * Returns the minimum selectable check-in date based on the 12:00 PM rule:
 * - Before 12:00 PM → yesterday is allowed (for same-day late arrivals)
 * - 12:00 PM or later → today is the earliest
 */
export function getMinCheckInDate(): Date {
    const now = new Date()
    return now.getHours() < 12 ? startOfDay(addDays(now, -1)) : startOfDay(now)
}

export function createSlugFromName(name: string): string {
    if (!name) return ''

    return name
        .toLowerCase()
        .replace(/&/g, '-and-') // Convert & to -and-
        .replace(/\s+/g, '-') // Convert spaces to dashes
        .replace(/_/g, '-') // Convert underscores to dashes
        .replace(/[^a-z0-9-]/g, '') // Remove special characters except dashes
        .replace(/-+/g, '-') // Replace multiple dashes with single dash
        .replace(/^-|-$/g, '') // Remove leading and trailing dashes
}
