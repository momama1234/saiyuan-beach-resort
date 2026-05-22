import { format } from 'date-fns'

import type { DailyPrice as APIDailyPrice } from '@/types/room-management'
import { AvailableRoomClass } from '@/types/room-management'

/**
 * Format price for display
 * @param price - The price to format
 * @returns Formatted price string
 */
export const formatPrice = (price: number): string => {
    const options = {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }

    return price.toLocaleString('en-US', options)
}

/**
 * Format price with exactly 2 decimal places for totals and summaries
 * @param price - The price to format
 * @returns Formatted price string with 2 decimal places
 */
export const formatPriceFixed2 = (price: number): string => {
    const options = {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }

    return price.toLocaleString('en-US', options)
}

/**
 * Price information for a specific day (for legacy compatibility)
 */
export type DailyPrice = {
    date: Date
    price: string
    formattedDate: string
}

/**
 * Convert API daily prices to display format
 * @param apiDailyPrices - Daily prices from API
 * @returns Array of daily prices in display format
 */
export const convertAPIToDailyPrice = (apiDailyPrices: APIDailyPrice[]): DailyPrice[] => {
    return apiDailyPrices.map((apiPrice) => ({
        date: new Date(apiPrice.date),
        price: apiPrice.price.toString(),
        formattedDate: format(new Date(apiPrice.date), 'dd/MM/yyyy')
    }))
}

/**
 * Get room prices for display from API response
 * API returns prices object with all the necessary data
 * @param roomClass - The room class with prices object
 * @returns Array of daily prices for display
 */
export const getRoomPricesForDisplay = (roomClass: AvailableRoomClass): DailyPrice[] => {
    if (!roomClass.prices || !roomClass.prices.dailyPrices) {
        return []
    }

    return convertAPIToDailyPrice(roomClass.prices.dailyPrices)
}

/**
 * Get total price from API response
 * @param roomClass - The room class with prices object
 * @returns Total price from API or null if not found
 */
export const getTotalPriceFromAPI = (roomClass: AvailableRoomClass): number | null => {
    return roomClass.prices?.totalPrice || null
}

/**
 * Get number of nights from API response
 * @param roomClass - The room class with prices object
 * @returns Number of nights from API or null if not found
 */
export const getNightsFromAPI = (roomClass: AvailableRoomClass): number | null => {
    return roomClass.prices?.totalDays || null
}

/**
 * Group consecutive prices with the same value to reduce display redundancy
 * @param prices - Array of daily prices
 * @returns Grouped prices with subtotals
 */
export const groupConsecutivePrices = (prices: DailyPrice[]) => {
    if (prices.length === 0) return []

    const groups: Array<{
        price: string
        nights: number
        subtotal: number
        startDate: string
        endDate: string
    }> = []

    let currentPrice = prices[0]?.price || 'undefined'
    let currentCount = 1
    let currentSubtotal = Number(prices[0]?.price)
    let startDate = prices[0]?.formattedDate || 'undefined'

    for (let i = 1; i < prices.length; i++) {
        if (prices[i]?.price === currentPrice) {
            currentCount++
            currentSubtotal += Number(prices[i]?.price)
        } else {
            groups.push({
                price: currentPrice,
                nights: currentCount,
                subtotal: currentSubtotal,
                startDate,
                endDate: prices[i - 1]?.formattedDate || 'undefined'
            })

            currentPrice = prices[i]?.price || 'undefined'
            currentCount = 1
            currentSubtotal = Number(prices[i]?.price)
            startDate = prices[i]?.formattedDate || 'undefined'
        }
    }

    // Add the last group
    groups.push({
        price: currentPrice,
        nights: currentCount,
        subtotal: currentSubtotal,
        startDate,
        endDate: prices[prices.length - 1]?.formattedDate || 'undefined'
    })

    return groups
}
