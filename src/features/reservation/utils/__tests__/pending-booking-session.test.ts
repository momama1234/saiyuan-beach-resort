import { cancelPendingBooking } from '../../api/pending-booking.api'
import { cancelPendingBookings } from '../pending-booking-session'

jest.mock('../../api/pending-booking.api', () => ({
    cancelPendingBooking: jest.fn().mockResolvedValue(undefined)
}))

const mockCancelPendingBooking = cancelPendingBooking as jest.MockedFunction<typeof cancelPendingBooking>

describe('pending-booking-session utils', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('cancels a batch of pending bookings', async () => {
        await cancelPendingBookings(['pending-1', 'pending-2'])

        expect(mockCancelPendingBooking).toHaveBeenCalledTimes(2)
        expect(mockCancelPendingBooking).toHaveBeenNthCalledWith(1, 'pending-1')
        expect(mockCancelPendingBooking).toHaveBeenNthCalledWith(2, 'pending-2')
    })

    it('does nothing when there are no pending bookings', async () => {
        await cancelPendingBookings([])

        expect(mockCancelPendingBooking).not.toHaveBeenCalled()
    })
})
