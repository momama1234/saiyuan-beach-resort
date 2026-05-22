const mockGetDataWithToken = jest.fn()

jest.mock('@/lib/api', () => ({
    getDataWithToken: mockGetDataWithToken
}))

describe('fetchPolicies', () => {
    beforeEach(() => {
        jest.resetModules()
        mockGetDataWithToken.mockReset()
        delete process.env.PROPERTY_ID
    })

    it('uses the configured property id when fetching policies', async () => {
        process.env.PROPERTY_ID = '42'
        mockGetDataWithToken.mockResolvedValue({
            cancellation: '',
            pet: '',
            refund: '',
            house_rules: '',
            checkin_checkout: '',
            privacy: ''
        })

        const { fetchPolicies } = await import('./api')

        await fetchPolicies('th')

        expect(mockGetDataWithToken).toHaveBeenCalledWith('/open/properties/42/policies?locale=th')
    })

    it('defaults to property id 1 when no property id is configured', async () => {
        mockGetDataWithToken.mockResolvedValue({
            cancellation: '',
            pet: '',
            refund: '',
            house_rules: '',
            checkin_checkout: '',
            privacy: ''
        })

        const { fetchPolicies } = await import('./api')

        await fetchPolicies('en-US')

        expect(mockGetDataWithToken).toHaveBeenCalledWith('/open/properties/1/policies?locale=en-US')
    })
})
