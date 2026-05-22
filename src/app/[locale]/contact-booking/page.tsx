import Footer from '@/components/Footer'
import { getDataWithToken } from '@/lib/api'
import { AvailableRoomClass } from '@/types/room-management'

import { ContactBookingClient } from './components/ContactBookingClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ContactBookingPageProps {
    searchParams: Promise<{
        checkIn?: string
        checkOut?: string
        adults?: string
        children?: string
        roomClassId?: string
    }>
}

const ContactBookingPage = async ({ searchParams }: ContactBookingPageProps): Promise<React.JSX.Element> => {
    const params = await searchParams
    // const propertyInfo = await getDataWithToken(`/open/property-info`)

    let initialRoomClasses: AvailableRoomClass[] = []
    if (params.checkIn && params.checkOut) {
        try {
            const searchParams = new URLSearchParams({
                checkIn: params.checkIn,
                checkOut: params.checkOut,
                adults: params.adults || '1',
                children: params.children || '0'
            })
            initialRoomClasses = await getDataWithToken<Array<AvailableRoomClass>>(
                `/open/room-class-available?${searchParams.toString()}`
            )
        } catch (error) {
            console.error('Error fetching initial room availability:', error)
        }
    }

    return (
        <>
            <ContactBookingClient
                initialSearchParams={{
                    checkIn: params.checkIn,
                    checkOut: params.checkOut,
                    adults: params.adults || '1',
                    children: params.children || '0',
                    roomClassId: params.roomClassId
                }}
                initialRoomClasses={initialRoomClasses}
            />
            <Footer />
        </>
    )
}

export default ContactBookingPage
