import { addDays, differenceInDays, format, isBefore, parseISO, startOfDay } from 'date-fns'
import { redirect } from 'next/navigation'

import MenuWrapper from '@/components/menu/MenuWrapper'
import { OPEN_PROPERTY_INFO_API_PATH } from '@/constants/path'
import { BookingDetails } from '@/features/reservation/stores/booking-details-store'
import { parseRatePlanIdParam } from '@/features/reservation/utils/search-params'
import { getDataWithToken } from '@/lib/api'
import { generateSEOMetadata, getAlternateLocales, SEO_CONFIG } from '@/lib/seo'
import { getMinCheckInDate } from '@/lib/utils'
import { PropertyInfo } from '@/types/property-info'

import Reservations from './components/Reservations'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const config = SEO_CONFIG.reservations[locale as keyof typeof SEO_CONFIG.reservations] || SEO_CONFIG.reservations.en

    return generateSEOMetadata({
        ...config,
        canonical: locale === 'en' ? '/reservations' : `/${locale}/reservations`,
        locale,
        alternateLocales: getAlternateLocales('/reservations')
    })
}

// Force dynamic rendering to prevent build-time API calls
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ReservationsPageProps {
    params: Promise<{ locale: string }>
    searchParams: Promise<{
        checkIn?: string
        checkOut?: string
        adults?: string
        children?: string
        infants?: string
        datesAdjusted?: string
        ratePlanId?: string
    }>
}

const ReservationsPage = async ({ searchParams, params }: ReservationsPageProps): Promise<React.JSX.Element> => {
    const { locale } = await params
    let propertyInfo: PropertyInfo | null = null
    try {
        propertyInfo = await getDataWithToken<PropertyInfo>(OPEN_PROPERTY_INFO_API_PATH)
    } catch {
        // Use fallback values if property info fails to load
    }
    const rawParams = await searchParams

    const corrected = correctPastCheckIn(rawParams)
    if (corrected) {
        const query = new URLSearchParams({
            checkIn: corrected.checkIn,
            checkOut: corrected.checkOut,
            ...(rawParams.adults && { adults: rawParams.adults }),
            ...(rawParams.children && { children: rawParams.children }),
            ...(rawParams.infants && { infants: rawParams.infants }),
            ...(rawParams.ratePlanId && { ratePlanId: rawParams.ratePlanId }),
            datesAdjusted: 'true'
        })
        redirect(`/${locale}/reservations?${query.toString()}`)
    }

    const initialBookingDetails = parseBookingDetailsFromParams(rawParams)
    const initialRatePlanId = parseRatePlanIdParam(rawParams.ratePlanId)

    return (
        <div id="reservations" className="w-full">
            <MenuWrapper />
            <Reservations
                vatRate={propertyInfo?.vatRate ?? 0}
                serviceCharge={propertyInfo?.serviceCharge ?? 0}
                isIncludeVat={propertyInfo?.isIncludeVat ?? false}
                checkInTime={propertyInfo?.checkInTime ?? '14:00'}
                checkOutTime={propertyInfo?.checkOutTime ?? '12:00'}
                isDepositEnabled={propertyInfo?.isDepositEnabled ?? false}
                depositType={propertyInfo?.depositType ?? 0}
                policyCancellationNoticeDays={propertyInfo?.policyCancellationNoticeDays ?? 0}
                initialBookingDetails={initialBookingDetails}
                initialRatePlanId={initialRatePlanId}
            />
        </div>
    )
}

export default ReservationsPage

const isValidDateString = (str: string): boolean => {
    try {
        return !isNaN(parseISO(str).getTime())
    } catch {
        return false
    }
}

/**
 * If checkIn/checkOut are invalid formats, or checkIn is in the past, return corrected dates.
 * Returns null if no correction is needed.
 */
const correctPastCheckIn = (params: {
    checkIn?: string
    checkOut?: string
}): { checkIn: string; checkOut: string } | null => {
    if (!params.checkIn && !params.checkOut) return null

    const minCheckIn = getMinCheckInDate()

    const checkInValid = !!params.checkIn && isValidDateString(params.checkIn)
    const checkOutValid = !!params.checkOut && isValidDateString(params.checkOut)

    if ((params.checkIn && !checkInValid) || (params.checkOut && !checkOutValid)) {
        const anchor = checkInValid ? startOfDay(parseISO(params.checkIn!)) : minCheckIn
        return {
            checkIn: format(anchor, 'yyyy-MM-dd'),
            checkOut: format(addDays(anchor, 7), 'yyyy-MM-dd')
        }
    }

    if (!params.checkIn) return null

    const checkInDate = startOfDay(parseISO(params.checkIn))
    if (!isBefore(checkInDate, minCheckIn)) return null

    const originalDuration = params.checkOut
        ? Math.max(1, differenceInDays(parseISO(params.checkOut), parseISO(params.checkIn)))
        : 1

    return {
        checkIn: format(minCheckIn, 'yyyy-MM-dd'),
        checkOut: format(addDays(minCheckIn, originalDuration), 'yyyy-MM-dd')
    }
}

/**
 * Parse booking details from URL query parameters
 * Maps URL params (checkIn, checkOut) to BookingDetails format (checkInDate, checkOutDate)
 */
const parseBookingDetailsFromParams = (params: {
    checkIn?: string
    checkOut?: string
    adults?: string
    children?: string
    infants?: string
}): Partial<BookingDetails> => {
    return {
        ...(params.checkIn && { checkInDate: params.checkIn }),
        ...(params.checkOut && { checkOutDate: params.checkOut }),
        ...(params.adults && { adults: params.adults }),
        ...(params.children && { children: params.children }),
        ...(params.infants && { infants: params.infants })
    }
}
