describe('pending-booking-store', () => {
    beforeEach(() => {
        jest.resetModules()
        sessionStorage.clear()
        localStorage.clear()
    })

    it('hydrates and persists pending state in sessionStorage only', async () => {
        const sessionState = {
            pendingBookingIds: ['session-pending-1'],
            pendingBookingData: [],
            isLocked: true,
            sessionId: 'session-tab'
        }
        const localState = {
            pendingBookingIds: ['local-pending-1'],
            pendingBookingData: [],
            isLocked: true,
            sessionId: 'local-tab'
        }

        sessionStorage.setItem('pending-booking-storage', JSON.stringify({ state: sessionState, version: 2 }))
        localStorage.setItem('pending-booking-storage', JSON.stringify({ state: localState, version: 2 }))

        const { usePendingBookingStore } = await import('../pending-booking-store')

        expect(usePendingBookingStore.getState().pendingBookingIds).toEqual(['session-pending-1'])
        expect(usePendingBookingStore.getState().sessionId).toBe('session-tab')

        usePendingBookingStore.setState({
            pendingBookingIds: ['updated-pending-1'],
            pendingBookingData: [],
            isLocked: true,
            sessionId: 'updated-tab'
        })

        expect(JSON.parse(sessionStorage.getItem('pending-booking-storage') ?? '{}')).toMatchObject({
            state: {
                pendingBookingIds: ['updated-pending-1'],
                pendingBookingData: [],
                isLocked: true,
                sessionId: 'updated-tab'
            },
            version: 2
        })
        expect(JSON.parse(localStorage.getItem('pending-booking-storage') ?? '{}')).toMatchObject({
            state: localState,
            version: 2
        })
    })
})
