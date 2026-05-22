import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type GuestInfoState = {
    firstName: string
    lastName: string
    email: string
    phone: string
    estimatedArrival?: string
    specialRequests?: string
}

export const defaultInitState: GuestInfoState = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: undefined,
    estimatedArrival: undefined
}

export type GuestInfoActions = {
    setFirstName: (_firstName: string) => void
    setLastName: (_lastName: string) => void
    setEmail: (_email: string) => void
    setPhone: (_phone: string) => void
    setSpecialRequests: (_specialRequests?: string) => void
    setEstimatedArrival: (_estimatedArrival?: string) => void
    setGuestInfo: (_guestInfo: Partial<GuestInfoState>) => void
    updateGuestInfo: (_field: keyof GuestInfoState, _value: string) => void
    setIsGuestInfoValid: (_isValid: boolean) => void
    resetGuestInfo: () => void
}

export interface GuestInfoStore extends GuestInfoState {
    isGuestInfoValid: boolean
    actions: GuestInfoActions
}

export const useGuestInfoStore = create<GuestInfoStore>()(
    devtools(
        (set) => ({
            ...defaultInitState,
            isGuestInfoValid: false,

            actions: {
                setFirstName: (firstName: string) => set({ firstName }, false, 'setFirstName'),
                setLastName: (lastName: string) => set({ lastName }, false, 'setLastName'),
                setEmail: (email: string) => set({ email }, false, 'setEmail'),
                setPhone: (phone: string) => set({ phone }, false, 'setPhone'),
                setSpecialRequests: (specialRequests: string) => set({ specialRequests }, false, 'setSpecialRequests'),
                setEstimatedArrival: (estimatedArrival: string) =>
                    set({ estimatedArrival }, false, 'setEstimatedArrival'),

                setGuestInfo: (guestInfo: Partial<GuestInfoState>) => set(guestInfo, false, 'setGuestInfo'),

                updateGuestInfo: (field, value) => {
                    set({ [field]: value }, false, `updateGuestInfo/${field}`)
                },

                setIsGuestInfoValid: (isValid: boolean) => {
                    set({ isGuestInfoValid: isValid }, false, 'setIsGuestInfoValid')
                },

                resetGuestInfo: () => {
                    set({ ...defaultInitState, isGuestInfoValid: false }, false, 'resetGuestInfo')
                }
            }
        }),
        { name: 'GuestInfoStore' }
    )
)

// Custom hooks for state
export const useFirstName = () => useGuestInfoStore((state) => state.firstName)
export const useLastName = () => useGuestInfoStore((state) => state.lastName)
export const useEmail = () => useGuestInfoStore((state) => state.email)
export const usePhone = () => useGuestInfoStore((state) => state.phone)
export const useSpecialRequests = () => useGuestInfoStore((state) => state.specialRequests)
export const useEstimatedArrival = () => useGuestInfoStore((state) => state.estimatedArrival)

// Custom hook for validation state
export const useIsGuestInfoValid = () => useGuestInfoStore((state) => state.isGuestInfoValid)

// Custom hook for actions
export const useGuestInfoActions = () => useGuestInfoStore((state) => state.actions)
