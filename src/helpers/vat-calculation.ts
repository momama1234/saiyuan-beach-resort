import { DEPOSIT_TYPE } from '@/shared/constants/payment'

/**
 * VAT and Tax Calculation Utilities
 * Imported from the main web app's booking store for consistency
 */

/**
 * Function to calculate tax amount based on a taxable base amount and VAT rate
 * @param taxableAmount - The amount subject to VAT
 * @param vatRate - VAT rate in percentage
 * @returns The tax amount
 */
export const calculateTaxAmount = (taxableAmount: number, vatRate: number): number => {
    // If VAT rate is 0, no tax calculation
    if (vatRate === 0) {
        return 0
    }

    return taxableAmount * (vatRate / 100)
}

/**
 * Function to calculate service charge based on room cost and service charge rate
 * @param roomCost - The room cost
 * @param serviceChargeRate - Service charge rate in percentage
 * @returns The service charge amount
 */
export const calculateServiceCharge = (roomCost: number, serviceChargeRate: number): number => {
    if (serviceChargeRate === 0) {
        return 0
    }

    return roomCost * (serviceChargeRate / 100)
}

/**
 * Function to calculate subtotal (before discount)
 * @param roomCost - The room cost
 * @param vatRate - VAT rate in percentage
 * @param serviceChargeRate - Service charge rate in percentage
 * @returns The subtotal amount
 */
export const calculateSubtotal = (
    roomCost: number,
    vatRate: number,
    serviceChargeRate: number = 0
): number => {
    const serviceCharge = calculateServiceCharge(roomCost, serviceChargeRate)
    const taxableAmount = roomCost + serviceCharge
    const taxAmount = calculateTaxAmount(taxableAmount, vatRate)

    return taxableAmount + taxAmount
}

/**
 * Function to calculate grand total
 * @param roomCost - The room cost
 * @param vatRate - VAT rate in percentage
 * @param serviceChargeRate - Service charge rate in percentage
 * @returns The grand total
 */
export const calculateGrandTotal = (
    roomCost: number,
    vatRate: number,
    serviceChargeRate: number
): number => {
    const subtotal = calculateSubtotal(roomCost, vatRate, serviceChargeRate)

    return subtotal
}

/**
 * Function to calculate discount amount
 * @param subtotal - The subtotal before discount
 * @param discountAmount - The discount amount (percentage or fixed)
 * @param isPercentage - Whether the discount is percentage (true) or fixed amount (false)
 * @returns The discount amount
 */
export const calculateDiscount = (subtotal: number, discountAmount: number, isPercentage: boolean): number => {
    if (discountAmount === 0) {
        return 0
    }

    if (isPercentage) {
        return subtotal * (discountAmount / 100)
    } else {
        return Math.min(discountAmount, subtotal) // Cannot discount more than subtotal
    }
}

/**
 * Interface for pricing breakdown
 */
export interface PricingBreakdown {
    roomCost: number
    taxAmount: number
    serviceCharge: number
    subtotal: number
    grandTotal: number
    isIncludeVat: boolean
    vatRate: number
    depositAmount: number
}

const formatVatRate = (vatRate: number): string => {
    const roundedRate = Number(vatRate.toFixed(2))
    return Number.isInteger(roundedRate) ? String(roundedRate) : String(roundedRate).replace(/\.?0+$/, '')
}

export const formatVatLabel = (isIncludeVat: boolean, vatRate: number): string =>
    `VAT ${isIncludeVat ? 'included' : 'excluded'} (${formatVatRate(vatRate)}%)`

/**
 * Function to calculate complete pricing breakdown
 * @param roomCost - The room cost
 * @param vatRate - VAT rate in percentage
 * @returns Complete pricing breakdown
 */
export const calculatePricingBreakdown = (
    roomCost: number,
    basePrice: number,
    vatRate: number,
    serviceChargeRate: number = 0,
    isDepositEnabled: boolean = false,
    depositType: number = 0,
    isIncludeVat: boolean = false
): PricingBreakdown => {
    const serviceCharge = calculateServiceCharge(roomCost, serviceChargeRate)
    const taxableAmount = roomCost + serviceCharge

    let taxAmount: number
    let grandTotal: number

    if (isIncludeVat) {
        // VAT is already baked into the price — back-calculate what portion is tax
        taxAmount = vatRate > 0 ? taxableAmount - taxableAmount / (1 + vatRate / 100) : 0
        grandTotal = taxableAmount
    } else {
        // VAT is added on top of the displayed price
        taxAmount = calculateTaxAmount(taxableAmount, vatRate)
        grandTotal = taxableAmount + taxAmount
    }

    let depositAmount = 0
    if (isDepositEnabled) {
        if (Number(depositType) === DEPOSIT_TYPE.ONE_NIGHT) {
            depositAmount = basePrice
        }
    }
    return {
        roomCost,
        taxAmount,
        serviceCharge,
        subtotal: grandTotal,
        grandTotal,
        isIncludeVat,
        vatRate,
        depositAmount
    }
}
