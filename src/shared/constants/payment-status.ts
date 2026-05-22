export const paymentStatus = {
    PENDING: 1,
    PAID: 2,
    REFUNDED: 3,
    CANCELLED: 4,
    PARTIAL_PAID: 5,
    DEPOSIT_PAID: 6
} as const

export type PaymentStatus = (typeof paymentStatus)[keyof typeof paymentStatus]

export const paymentStatusColor = {
    PENDING: '#FACC15',
    PAID: '#22C55E',
    REFUNDED: '#EF4444',
    CANCELLED: '#9CA3AF',
    PARTIAL_PAID: '#F59E0B',
    DEPOSIT_PAID: '#10B981'
} as const

export const paymentStatusName = {
    PENDING: 'Pending',
    PAID: 'Paid',
    REFUNDED: 'Refunded',
    CANCELLED: 'Cancelled',
    PARTIAL_PAID: 'Partial Paid',
    DEPOSIT_PAID: 'Deposit Paid'
} as const

export const getPaymentStatusColor = (paymentStatusId: number): string => {
    switch (paymentStatusId) {
        case paymentStatus.PENDING:
            return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case paymentStatus.PAID:
            return 'bg-green-100 text-green-800 border-green-200'
        case paymentStatus.REFUNDED:
            return 'bg-red-100 text-red-800 border-red-200'
        case paymentStatus.CANCELLED:
            return 'bg-gray-100 text-gray-800 border-gray-200'
        case paymentStatus.PARTIAL_PAID:
            return 'bg-amber-100 text-amber-800 border-amber-200'
        case paymentStatus.DEPOSIT_PAID:
            return 'bg-emerald-100 text-emerald-800 border-emerald-200'
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200'
    }
}

export const getPaymentStatusBgClass = (paymentStatusId: number): string => {
    switch (paymentStatusId) {
        case paymentStatus.PENDING:
            return 'bg-yellow-100'
        case paymentStatus.PAID:
            return 'bg-green-100'
        case paymentStatus.REFUNDED:
            return 'bg-red-100'
        case paymentStatus.CANCELLED:
            return 'bg-gray-100'
        case paymentStatus.PARTIAL_PAID:
            return 'bg-amber-100'
        case paymentStatus.DEPOSIT_PAID:
            return 'bg-emerald-100'
        default:
            return 'bg-gray-100'
    }
}

export const getPaymentStatusText = (paymentStatusId: number): string => {
    switch (paymentStatusId) {
        case paymentStatus.PENDING:
            return 'Pending'
        case paymentStatus.PAID:
            return 'Paid'
        case paymentStatus.REFUNDED:
            return 'Refunded'
        case paymentStatus.CANCELLED:
            return 'Cancelled'
        case paymentStatus.PARTIAL_PAID:
            return 'Partial Paid'
        case paymentStatus.DEPOSIT_PAID:
            return 'Deposit Paid'
        default:
            return 'Pending'
    }
}

export const getPaymentStatusDisplay = (isPaymentIncomplete: boolean) => {
    return isPaymentIncomplete
        ? {
              text: 'Payment Incomplete',
              bgClass: 'bg-red-50 border-red-200 text-red-800',
              textColor: 'text-red-600',
              icon: '⚠️'
          }
        : {
              text: 'Payment Complete',
              bgClass: 'bg-green-50 border-green-200 text-green-800',
              textColor: 'text-green-600',
              icon: '✅'
          }
}

export const isPaymentStatusIncomplete = (paymentStatusId: number): boolean => {
    const incompletePaymentStatusIds: number[] = [
        paymentStatus.PENDING,
        paymentStatus.PARTIAL_PAID,
        paymentStatus.DEPOSIT_PAID
    ]
    return incompletePaymentStatusIds.includes(paymentStatusId)
}

export const isBookingPaymentIncomplete = (isPaymentIncomplete: boolean): boolean => {
    return isPaymentIncomplete === true
}
