import { buildReservationContextKey, hasOtherSelectedRoomClasses } from '../reservation-session'

describe('reservation-session utils', () => {
    it('builds a stable reservation context key', () => {
        const key = buildReservationContextKey({
            checkIn: '2026-04-03',
            checkOut: '2026-04-04',
            adults: '2',
            children: '0',
            roomClassId: '17'
        })

        expect(key).toBe('2026-04-03|2026-04-04|2|0|17')
    })

    it('detects selections from other room classes', () => {
        expect(hasOtherSelectedRoomClasses({ 17: 1 }, 17)).toBe(false)
        expect(hasOtherSelectedRoomClasses({ 17: 1, 18: 2 }, 17)).toBe(true)
        expect(hasOtherSelectedRoomClasses({ 18: 0 }, 17)).toBe(false)
    })
})
