import { computeCountdown } from './countdown'

describe('computeCountdown', () => {
    const now = new Date('2026-05-04T10:00:00Z')

    it('returns null when no expiresAt', () => {
        expect(computeCountdown(null, now)).toBeNull()
        expect(computeCountdown(undefined, now)).toBeNull()
    })

    it('returns null when expiresAt is unparseable', () => {
        expect(computeCountdown('not a date', now)).toBeNull()
    })

    it('returns minutes when more than 60s remain', () => {
        const exp = new Date(now.getTime() + 5 * 60_000).toISOString()
        expect(computeCountdown(exp, now)).toEqual({ kind: 'minutes', value: 5 })
    })

    it('returns seconds inside the final minute', () => {
        const exp = new Date(now.getTime() + 30_000).toISOString()
        expect(computeCountdown(exp, now)).toEqual({ kind: 'seconds', value: 30 })
    })

    it('returns expired when already past', () => {
        const exp = new Date(now.getTime() - 1_000).toISOString()
        expect(computeCountdown(exp, now)).toEqual({ kind: 'expired' })
    })

    it('returns expired exactly at expiresAt', () => {
        const exp = now.toISOString()
        expect(computeCountdown(exp, now)).toEqual({ kind: 'expired' })
    })
})
