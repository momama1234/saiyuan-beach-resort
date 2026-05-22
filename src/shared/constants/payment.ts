export {
    paymentStatus,
    paymentStatusColor,
    paymentStatusName,
    getPaymentStatusBgClass,
    getPaymentStatusColor,
    getPaymentStatusDisplay,
    getPaymentStatusText,
    isPaymentStatusIncomplete,
    isBookingPaymentIncomplete
} from './payment-status'
export type { PaymentStatus } from './payment-status'

export const DEPOSIT_TYPE = {
    ONE_NIGHT: 1,
    HALF_PRICE: 2,
    FULL_PRICE: 3
}
