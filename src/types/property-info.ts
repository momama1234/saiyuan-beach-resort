export interface BookingStep {
    icon: string
    title: string
    description: string
    order: number
}

export interface BookingBullet {
    text: string
    order: number
}

export interface PropertyInfo {
    name: string
    description: string
    faviconUrl: string | null
    vatRate: number
    serviceCharge?: number | null
    isIncludeVat: boolean
    checkInTime: string
    checkOutTime: string
    isDepositEnabled: boolean
    depositType: number
    policyCancellationNoticeDays?: number
    isContactBooking?: boolean
    isDirectBooking?: boolean
    /** 1 = SURNAME (search by surname), 2 = OTP_EMAIL (verify by OTP to email) */
    preCheckinType?: number
    phone?: string | null
    email?: string | null
    address?: string | null
    facebookUrl?: string | null
    instagramUrl?: string | null
    lineUrl?: string | null
    tiktokUrl?: string | null
    telegramUrl?: string | null
    whatsappUrl?: string | null
    xUrl?: string | null
    bookingSteps?: BookingStep[]
    bookingBullets?: BookingBullet[]
}
