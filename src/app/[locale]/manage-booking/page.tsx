import { Metadata } from 'next'

import Footer from '@/components/Footer'
import MenuWrapper from '@/components/menu/MenuWrapper'
import { OPEN_PROPERTY_INFO_API_PATH } from '@/constants/path'
import { getDataWithToken } from '@/lib/api'
import { PropertyInfo } from '@/types/property-info'

import { ManageBookingClient } from './components/ManageBookingClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = { robots: { index: false, follow: false } }

const ManageBookingPage = async (): Promise<React.JSX.Element> => {
    const propertyInfo = await getDataWithToken<PropertyInfo>(OPEN_PROPERTY_INFO_API_PATH)
    const preCheckinType = propertyInfo?.preCheckinType ?? 1

    return (
        <>
            <div className="w-full">
                <MenuWrapper />
                <ManageBookingClient preCheckinType={preCheckinType} />
            </div>
            <Footer />
        </>
    )
}

export default ManageBookingPage
