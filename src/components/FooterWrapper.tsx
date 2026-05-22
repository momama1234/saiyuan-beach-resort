'use client'

import { usePathname } from 'next/navigation'

const BOOKING_PATHS = ['/reservations', '/contact-booking', '/manage-booking']

export default function FooterWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isBookingPage = BOOKING_PATHS.some((path) => pathname.includes(path))

    if (isBookingPage) return null

    return <>{children}</>
}
