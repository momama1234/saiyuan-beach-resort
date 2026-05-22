import type { Metadata } from 'next'

import Footer from '@/components/Footer'

import ContactBookingSuccessClient from '../components/ContactBookingSuccessClient'

export const metadata: Metadata = {
    robots: { index: false, follow: false }
}

export default function ContactBookingSuccessPage() {
    return (
        <>
            <ContactBookingSuccessClient />
            <Footer />
        </>
    )
}
