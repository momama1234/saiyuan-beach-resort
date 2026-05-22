import { calculateRatePlanDiscountPercent } from '@/shared/utils/rate-plan-discount'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { getNightsFromAPI } from '@/helpers/price'
import { calculatePricingBreakdown } from '@/helpers/vat-calculation'
import { AvailableRoomClass } from '@/types/room-management'

export interface BookingDetails {
    checkInDate: string
    checkOutDate: string
    adults: string
    children: string
    infants: string
}

export interface BookingDetailsState {
    bookingDetails: BookingDetails
    tempBookingDetails: BookingDetails
    vatRate: number
    serviceChargeRate: number
    isIncludeVat: boolean
    isDepositEnabled: boolean
    depositType: number
}

export interface BookingDetailsActions {
    updateBookingDetails: (_field: keyof BookingDetails, _value: string) => void
    updateTempBookingDetails: (_field: keyof BookingDetails, _value: string) => void
    setBookingDetails: (_details: BookingDetails) => void
    saveBookingChanges: () => BookingDetails
    cancelBookingEdit: () => void
    startEditingBooking: () => void
    calculateNights: () => number
    calculateTotalGuests: () => number
    formatDate: (_dateString: string | null) => string
    formatDateForInput: (_dateString: string) => string
    getPricingInfo: (
        _roomClass: AvailableRoomClass,
        _ratePlanId?: number,
        _occupancyOptionId?: number
    ) => {
        nights: number
        totalGuests: number
        totalPrice: number
        hasAPIPrice: boolean
        basePrice: AvailableRoomClass['basePrice']
        pricingBreakdown: ReturnType<typeof calculatePricingBreakdown>
        discountPercent: number
        originalRoomCost: number
    }
    getSearchParams: () => URLSearchParams
    initialize: (_params: {
        initialBookingDetails?: Partial<BookingDetails>
        vatRate?: number
        serviceChargeRate?: number
        isIncludeVat?: boolean
        isDepositEnabled?: boolean
        depositType?: number
    }) => void
}

export interface BookingDetailsStore extends BookingDetailsState {
    actions: BookingDetailsActions
}

const defaultBookingDetails: BookingDetails = {
    checkInDate: '',
    checkOutDate: '',
    adults: '2',
    children: '0',
    infants: '0'
}

export const useBookingDetailsStore = create<BookingDetailsStore>()(
    devtools(
        (set, get) => ({
            // State
            bookingDetails: defaultBookingDetails,
            tempBookingDetails: defaultBookingDetails,
            vatRate: 0,
            serviceChargeRate: 0,
            isIncludeVat: false,
            isDepositEnabled: false,
            depositType: 0,

            // Actions
            actions: {
                initialize: (params) => {
                    const initialDetails = {
                        ...defaultBookingDetails,
                        ...(params.initialBookingDetails || {})
                    }
                    set(
                        {
                            bookingDetails: initialDetails,
                            tempBookingDetails: initialDetails,
                            vatRate: params.vatRate || 0,
                            serviceChargeRate: params.serviceChargeRate || 0,
                            isIncludeVat: params.isIncludeVat || false,
                            isDepositEnabled: params.isDepositEnabled || false,
                            depositType: params.depositType || 0
                        },
                        false,
                        'initialize'
                    )
                },

                updateBookingDetails: (field, value) => {
                    set(
                        (state) => ({
                            bookingDetails: {
                                ...state.bookingDetails,
                                [field]: value
                            }
                        }),
                        false,
                        `updateBookingDetails/${field}`
                    )
                },

                updateTempBookingDetails: (field, value) => {
                    set(
                        (state) => ({
                            tempBookingDetails: {
                                ...state.tempBookingDetails,
                                [field]: value
                            }
                        }),
                        false,
                        `updateTempBookingDetails/${field}`
                    )
                },

                setBookingDetails: (details) => {
                    set({ bookingDetails: details, tempBookingDetails: details }, false, 'setBookingDetails')
                },

                saveBookingChanges: () => {
                    const { tempBookingDetails } = get()

                    // Validate dates
                    const checkIn = new Date(tempBookingDetails.checkInDate)
                    const checkOut = new Date(tempBookingDetails.checkOutDate)

                    if (checkIn >= checkOut) {
                        throw new Error('Check-out date must be after check-in date')
                    }

                    const today = new Date()
                    today.setHours(0, 0, 0, 0)

                    const checkInDate = new Date(checkIn)
                    checkInDate.setHours(0, 0, 0, 0)

                    if (checkInDate < today) {
                        throw new Error('Check-in date must be in the future')
                    }

                    set({ bookingDetails: tempBookingDetails }, false, 'saveBookingChanges')
                    return tempBookingDetails
                },

                cancelBookingEdit: () => {
                    const { bookingDetails } = get()
                    set({ tempBookingDetails: bookingDetails }, false, 'cancelBookingEdit')
                },

                startEditingBooking: () => {
                    const { bookingDetails } = get()
                    set({ tempBookingDetails: bookingDetails }, false, 'startEditingBooking')
                },

                calculateNights: () => {
                    const { bookingDetails } = get()
                    if (!bookingDetails.checkInDate || !bookingDetails.checkOutDate) return 0
                    return Math.ceil(
                        (new Date(bookingDetails.checkOutDate).getTime() -
                            new Date(bookingDetails.checkInDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                    )
                },

                calculateTotalGuests: () => {
                    const { bookingDetails } = get()
                    return (
                        parseInt(bookingDetails.adults) +
                        parseInt(bookingDetails.children) +
                        parseInt(bookingDetails.infants)
                    )
                },

                formatDate: (dateString) => {
                    if (!dateString) return ''
                    return new Date(dateString).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    })
                },

                formatDateForInput: (dateString) => {
                    if (!dateString) return ''
                    const result = new Date(dateString).toISOString().split('T')[0]
                    return result || ''
                },

                getPricingInfo: (roomClass, ratePlanId, occupancyOptionId) => {
                    const { vatRate, serviceChargeRate, isIncludeVat, isDepositEnabled, depositType, actions } = get()
                    const totalGuests = actions.calculateTotalGuests()
                    const nights = getNightsFromAPI(roomClass) || actions.calculateNights()

                    let roomCost: number | null = null
                    let hasApiPriceData = false

                    // Find the selected or default rate plan
                    const plan =
                        roomClass.ratePlans && roomClass.ratePlans.length > 0
                            ? (ratePlanId ? roomClass.ratePlans.find((rp) => rp.id === ratePlanId) : undefined) ||
                              roomClass.ratePlans.find((rp) => rp.isDefault) ||
                              roomClass.ratePlans[0]
                            : undefined

                    // Priority 1: Use rate plan's daily prices from inventory (API-calculated per rate plan)
                    if (plan?.prices?.totalPrice != null && plan.prices.totalPrice > 0) {
                        roomCost = plan.prices.totalPrice
                        hasApiPriceData = true
                    }

                    // Priority 2 (fallback): Use rate plan occupancy rate × nights
                    if (roomCost === null && plan) {
                        const occupancy =
                            plan.occupancyOptions?.find((opt) => opt.id === occupancyOptionId) ||
                            plan.occupancyOptions?.find((opt) => opt.isDefault) ||
                            plan.occupancyOptions?.[0]

                        if (occupancy) {
                            const nightlyRate = Number(occupancy.rate) || 0
                            roomCost = nightlyRate * nights
                            hasApiPriceData = true
                        }
                    }

                    // Priority 3: fallback to 0
                    if (roomCost === null) {
                        roomCost = 0
                    }

                    // Auto-apply rate plan discount (LOS + advance booking, stacked, capped)
                    const { bookingDetails } = get()
                    const originalRoomCost = roomCost
                    let discountPercent = 0
                    if (plan?.discountRules && bookingDetails.checkInDate && roomCost > 0) {
                        discountPercent = calculateRatePlanDiscountPercent(
                            nights,
                            bookingDetails.checkInDate,
                            plan.discountRules
                        )
                        if (discountPercent > 0) {
                            roomCost = roomCost * (1 - discountPercent / 100)
                        }
                    }

                    const baseRateForDeposit = (() => {
                        if (roomClass.ratePlans && roomClass.ratePlans.length > 0) {
                            const plan =
                                (ratePlanId ? roomClass.ratePlans.find((rp) => rp.id === ratePlanId) : undefined) ||
                                roomClass.ratePlans.find((rp) => rp.isDefault) ||
                                roomClass.ratePlans[0]
                            const occ =
                                plan?.occupancyOptions?.find((opt) => opt.id === occupancyOptionId) ||
                                plan?.occupancyOptions?.find((opt) => opt.isDefault) ||
                                plan?.occupancyOptions?.[0]
                            return Number(occ?.rate || 0)
                        }
                        return Number(roomClass.basePrice || 0)
                    })()

                    const pricingBreakdown = calculatePricingBreakdown(
                        roomCost,
                        baseRateForDeposit,
                        vatRate,
                        serviceChargeRate,
                        isDepositEnabled,
                        depositType,
                        isIncludeVat
                    )

                    return {
                        nights,
                        totalGuests,
                        totalPrice: pricingBreakdown.grandTotal,
                        hasAPIPrice: hasApiPriceData,
                        basePrice: roomClass.basePrice,
                        pricingBreakdown,
                        discountPercent,
                        originalRoomCost
                    }
                },

                getSearchParams: () => {
                    const { bookingDetails } = get()
                    return new URLSearchParams({
                        checkIn: bookingDetails.checkInDate,
                        checkOut: bookingDetails.checkOutDate,
                        adults: bookingDetails.adults,
                        children: bookingDetails.children,
                        infants: bookingDetails.infants
                    })
                }
            }
        }),
        { name: 'BookingDetailsStore' }
    )
)

// Custom hooks for state
export const useBookingDetails = () => useBookingDetailsStore((state) => state.bookingDetails)
export const useTempBookingDetails = () => useBookingDetailsStore((state) => state.tempBookingDetails)
export const useVatRate = () => useBookingDetailsStore((state) => state.vatRate)
export const useServiceChargeRate = () => useBookingDetailsStore((state) => state.serviceChargeRate)
export const useIsIncludeVat = () => useBookingDetailsStore((state) => state.isIncludeVat)
export const useIsDepositEnabled = () => useBookingDetailsStore((state) => state.isDepositEnabled)
export const useDepositType = () => useBookingDetailsStore((state) => state.depositType)

// Custom hook for actions
export const useBookingDetailsActions = () => useBookingDetailsStore((state) => state.actions)

// Custom hook to check if booking details have changed
export const useHasBookingDetailsChanged = () =>
    useBookingDetailsStore((state) => {
        const { bookingDetails, tempBookingDetails } = state

        return (
            bookingDetails.checkInDate !== tempBookingDetails.checkInDate ||
            bookingDetails.checkOutDate !== tempBookingDetails.checkOutDate ||
            bookingDetails.adults !== tempBookingDetails.adults ||
            bookingDetails.children !== tempBookingDetails.children
        )
    })
