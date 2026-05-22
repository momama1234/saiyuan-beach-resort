export type LosDiscount = { minNights: number; discountPercent: number | string }
export type AdvanceDiscount = { minDaysAhead: number; discountPercent: number | string }

export type RatePlanDiscountRules = {
    maxDiscountPercent?: number | string | null
    losDiscounts?: LosDiscount[]
    advanceDiscounts?: AdvanceDiscount[]
}

/**
 * Returns the applicable LOS discount percent for a given number of nights (best tier).
 */
export function getLosDiscountPercent(nights: number, tiers: LosDiscount[]): number {
    const sorted = [...tiers].sort((a, b) => b.minNights - a.minNights)
    const match = sorted.find(t => nights >= t.minNights)
    return match ? Number(match.discountPercent) : 0
}

/**
 * Returns the applicable advance booking discount percent for a given number of days ahead (best tier).
 */
export function getAdvanceDiscountPercent(daysAhead: number, tiers: AdvanceDiscount[]): number {
    const sorted = [...tiers].sort((a, b) => b.minDaysAhead - a.minDaysAhead)
    const match = sorted.find(t => daysAhead >= t.minDaysAhead)
    return match ? Number(match.discountPercent) : 0
}

/**
 * Calculates the total stacked discount percent, capped by maxDiscountPercent.
 * checkInDate: ISO string of arrival date
 * bookingDate: ISO string of when the booking is made (defaults to today)
 */
export function calculateRatePlanDiscountPercent(
    nights: number,
    checkInDate: string,
    rules: RatePlanDiscountRules,
    bookingDate?: string
): number {
    if (!rules) return 0

    const { losDiscounts = [], advanceDiscounts = [], maxDiscountPercent } = rules

    const los = getLosDiscountPercent(nights, losDiscounts)

    const bookingMs = bookingDate ? new Date(bookingDate).getTime() : Date.now()
    const checkInMs = new Date(checkInDate).getTime()
    const daysAhead = Math.max(0, Math.floor((checkInMs - bookingMs) / (1000 * 60 * 60 * 24)))
    const advance = getAdvanceDiscountPercent(daysAhead, advanceDiscounts)

    const stacked = los + advance

    if (maxDiscountPercent != null) {
        return Math.min(stacked, Number(maxDiscountPercent))
    }

    return stacked
}
