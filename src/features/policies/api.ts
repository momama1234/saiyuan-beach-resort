import { getDataWithToken } from '@/lib/api'

export interface PoliciesResponse {
    cancellation: string
    pet: string
    refund: string
    house_rules: string
    checkin_checkout: string
    privacy: string
}

const PROPERTY_ID = process.env.PROPERTY_ID || '1'

export async function fetchPolicies(locale: string): Promise<PoliciesResponse> {
    try {
        return await getDataWithToken<PoliciesResponse>(
            `/open/properties/${PROPERTY_ID}/policies?locale=${encodeURIComponent(locale)}`
        )
    } catch (error) {
        console.error('Failed to fetch property policies', error)
        // Defensive: return empty content so the page still renders.
        return {
            cancellation: '',
            pet: '',
            refund: '',
            house_rules: '',
            checkin_checkout: '',
            privacy: ''
        }
    }
}
