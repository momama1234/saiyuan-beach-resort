export interface CreateReservationResponse {
    bookingId: number
    paymentId: number | null
    paymentUrl: string | null
    sessionId: string | null
}
