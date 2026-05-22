import { parseRatePlanIdParam } from '../search-params'

describe('parseRatePlanIdParam', () => {
    it('returns the number for a valid positive integer string', () => {
        expect(parseRatePlanIdParam('42')).toBe(42)
        expect(parseRatePlanIdParam('1')).toBe(1)
    })

    it('returns undefined for undefined input', () => {
        expect(parseRatePlanIdParam(undefined)).toBeUndefined()
    })

    it('returns undefined for an empty string', () => {
        expect(parseRatePlanIdParam('')).toBeUndefined()
    })

    it('returns undefined for NaN input', () => {
        expect(parseRatePlanIdParam('abc')).toBeUndefined()
        expect(parseRatePlanIdParam('12abc')).toBeUndefined()
    })

    it('returns undefined for zero', () => {
        expect(parseRatePlanIdParam('0')).toBeUndefined()
    })

    it('returns undefined for negative numbers', () => {
        expect(parseRatePlanIdParam('-5')).toBeUndefined()
    })

    it('returns undefined for floats', () => {
        expect(parseRatePlanIdParam('3.14')).toBeUndefined()
    })
})
