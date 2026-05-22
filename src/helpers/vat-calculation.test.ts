import {
    calculatePricingBreakdown,
    calculateServiceCharge,
    calculateTaxAmount,
    formatVatLabel
} from './vat-calculation'

describe('vat-calculation', () => {
    it('calculates service charge before VAT for a net room price', () => {
        const roomCost = 1000
        const vatRate = 7
        const serviceChargeRate = 10

        expect(calculateTaxAmount(roomCost, vatRate)).toBe(70)
        expect(calculateServiceCharge(roomCost, serviceChargeRate)).toBe(100)

        const breakdown = calculatePricingBreakdown(roomCost, roomCost, vatRate, serviceChargeRate)

        expect(breakdown.taxAmount).toBeCloseTo(77, 2)
        expect(breakdown.serviceCharge).toBe(100)
        expect(breakdown.subtotal).toBe(1177)
        expect(breakdown.grandTotal).toBe(1177)
        expect(breakdown.isIncludeVat).toBe(false)
    })

    it('calculates the same breakdown for values that already represent a net room price', () => {
        const roomCost = 1000
        const vatRate = 7
        const serviceChargeRate = 10

        expect(calculateTaxAmount(roomCost, vatRate)).toBeCloseTo(70, 2)
        expect(calculateServiceCharge(roomCost, serviceChargeRate)).toBe(100)

        const breakdown = calculatePricingBreakdown(roomCost, roomCost, vatRate, serviceChargeRate)

        expect(breakdown.taxAmount).toBeCloseTo(77, 2)
        expect(breakdown.serviceCharge).toBe(100)
        expect(breakdown.subtotal).toBe(1177)
        expect(breakdown.grandTotal).toBe(1177)
    })

    it('back-calculates VAT from the price when isIncludeVat is true', () => {
        const roomCost = 1000
        const vatRate = 7
        const serviceChargeRate = 10

        const breakdown = calculatePricingBreakdown(roomCost, roomCost, vatRate, serviceChargeRate, false, 0, true)

        // taxableAmount = 1000 + 100 = 1100; VAT embedded = 1100 - 1100/1.07 ≈ 71.96
        expect(breakdown.taxAmount).toBeCloseTo(71.96, 1)
        expect(breakdown.serviceCharge).toBe(100)
        // grandTotal must NOT add VAT on top — it stays at taxableAmount
        expect(breakdown.grandTotal).toBe(1100)
        expect(breakdown.subtotal).toBe(1100)
        expect(breakdown.isIncludeVat).toBe(true)
    })

    it('formats the VAT label with include mode and rate', () => {
        expect(formatVatLabel(true, 7)).toBe('VAT included (7%)')
        expect(formatVatLabel(false, 10)).toBe('VAT excluded (10%)')
    })
})
