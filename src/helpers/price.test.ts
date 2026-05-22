import { formatPrice, formatPriceFixed2 } from './price'

describe('price helpers', () => {
    it('formats prices with up to 2 decimals for general display', () => {
        expect(formatPrice(4500)).toBe('4,500')
        expect(formatPrice(18341.576)).toBe('18,341.58')
    })

    it('formats prices with exactly 2 decimals for totals', () => {
        expect(formatPriceFixed2(4500)).toBe('4,500.00')
        expect(formatPriceFixed2(18341.576)).toBe('18,341.58')
        expect(formatPriceFixed2(1090.833)).toBe('1,090.83')
    })
})
