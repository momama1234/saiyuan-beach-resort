import { Metadata } from 'next'

import MenuWrapper from '@/components/menu/MenuWrapper'
import { getDataWithToken } from '@/lib/api'
import { PropertyInfo } from '@/types/property-info'

import ReservationSuccess from '../components/Success'

// Force dynamic rendering to prevent build-time API calls
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
    return { robots: { index: false, follow: false } }
}

const ReservationSuccessPage = async ({
    params
}: {
    params: Promise<{ locale: string }>
}): Promise<React.JSX.Element> => {
    const { locale } = await params
    const propertyInfo = await getDataWithToken<PropertyInfo>(`/open/property-info?locale=${locale}`)

    return (
        <div id="reservations-success" className="size-full">
            <MenuWrapper />
            <ReservationSuccess
                bookingSteps={propertyInfo?.bookingSteps ?? []}
                bookingBullets={propertyInfo?.bookingBullets ?? []}
            />
        </div>
    )
}

export default ReservationSuccessPage
