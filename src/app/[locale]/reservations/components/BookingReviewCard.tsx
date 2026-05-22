import { useTranslations } from 'next-intl'
import React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPriceFixed2 } from '@/helpers/price'
import { formatVatLabel } from '@/helpers/vat-calculation'
import { cn } from '@/lib/utils'
import { AvailableRoomClass } from '@/types/room-management'

interface BookingDetails {
    checkInDate: string
    checkOutDate: string
    adults: string
    children: string
    infants: string
}

interface RoomPricingDetail {
    roomClass: AvailableRoomClass
    ratePlanId: number
    quantity: number
    pricePerRoom: number
    roomTotal: number
    nights: number
    pricingBreakdown: {
        roomCost: number
        taxAmount: number
        serviceCharge: number
        subtotal: number
        grandTotal: number
        isIncludeVat: boolean
        vatRate: number
        depositAmount: number
    }
}

interface BookingReviewCardProps {
    bookingDetails: BookingDetails
    nights: number
    totalGuests: number
    roomsPricing: {
        rooms: RoomPricingDetail[]
        grandTotal: number
        totalRooms: number
    }
    formatDate: (_dateString: string | null) => string
    isDepositEnabled: boolean
    checkInTime: string
    checkOutTime: string
    policyCancellationNoticeDays: number
}

export function BookingReviewCard({
    bookingDetails,
    nights,
    totalGuests,
    roomsPricing,
    formatDate,
    isDepositEnabled: _isDepositEnabled,
    checkInTime,
    checkOutTime,
    policyCancellationNoticeDays
}: BookingReviewCardProps) {
    const t = useTranslations('BookingReviewCard')
    const tc = useTranslations('ConfirmationSummary')
    const termsData = [
        tc('termsAndConditionsContent'),
        tc('termsAndConditionsContent2', { cancellationPolicy: policyCancellationNoticeDays || 7 }),
        tc('termsAndConditionsContent3', { checkInTime: checkInTime, checkOutTime: checkOutTime }),
        tc('termsAndConditionsContent4')
    ]

    const totalVat = roomsPricing.rooms.reduce(
        (sum, room) => sum + room.pricingBreakdown.taxAmount * room.quantity,
        0
    )
    const totalServiceCharge = roomsPricing.rooms.reduce(
        (sum, room) => sum + room.pricingBreakdown.serviceCharge * room.quantity,
        0
    )
    const firstPricingBreakdown = roomsPricing.rooms[0]?.pricingBreakdown
    const vatLabel = firstPricingBreakdown
        ? formatVatLabel(firstPricingBreakdown.isIncludeVat, firstPricingBreakdown.vatRate)
        : formatVatLabel(false, 0)

    return (
        <Card className="w-full border border-gray-200 px-3 py-3 shadow-none xl:max-w-[420px]">
            <CardHeader className="px-0">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#0E7C86]">
                    {t('title')}
                </CardTitle>
                <span className="text-sm font-light text-gray-500">{t('description')}</span>
            </CardHeader>
            <CardContent className="px-0">
                <div className="space-y-3">
                    <div>
                        <h4 className="mb-2 text-base font-medium text-[#0E7C86]">{t('priceDetails')}</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="rounded-md border border-gray-200 px-4 py-2">
                            <div className="flex justify-between py-1">
                                <span>{t('checkInDate')}:</span>
                                <span>{formatDate(bookingDetails.checkInDate)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span>{t('checkOutDate')}:</span>
                                <span>{formatDate(bookingDetails.checkOutDate)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span>{t('numberOfNights')}:</span>
                                <span>
                                    {nights} {t('nights')}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span>{t('numberOfGuests')}:</span>
                                <span>
                                    {totalGuests} {t('guests')}
                                </span>
                            </div>
                            </div>

                            {roomsPricing.rooms.map((room, index) => {
                                const ratePlanName =
                                    room.roomClass.ratePlans?.find((rp) => rp.id === room.ratePlanId)?.name ||
                                    t('ratePlan')
                                return (
                                    <div key={index} className="space-y-1">
                                        <div className="flex justify-between py-1">
                                            <span className="text-sm font-semibold">
                                                {ratePlanName} x{room.quantity} ({room.nights} {t('nights')}):
                                            </span>
                                            <span className="text-sm">฿{formatPriceFixed2(room.roomTotal)}</span>
                                        </div>
                                    </div>
                                )
                            })}

                            {/* VAT Breakdown */}
                            {totalVat > 0 && (
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>{vatLabel}:</span>
                                    <span>฿{formatPriceFixed2(totalVat)}</span>
                                </div>
                            )}

                            {totalServiceCharge > 0 && (
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>{t('serviceCharge')}</span>
                                    <span>฿{formatPriceFixed2(totalServiceCharge)}</span>
                                </div>
                            )}

                            <hr className="my-3 border-gray-300" />
                            <div className="flex justify-between text-base font-semibold">
                                <span>{t('totalPrice')}:</span>
                                <span className="text-green-600">฿{formatPriceFixed2(roomsPricing.grandTotal)}</span>
                            </div>
                            {/*noPaymentRequired*/}
                            <div className="text-xs text-gray-500">{t('noPaymentRequired')}</div>
                        </div>
                    </div>
                </div>
                {/* Terms and Conditions */}

                <hr className="my-3 border-gray-300" />
                <div className="mt-4 overflow-hidden rounded-lg bg-gray-50/40 text-xs">
                    <div className="">
                        <p className="text-sm font-medium text-gray-800">{t('termsAndConditions')}</p>
                    </div>
                    {termsData.map((term, index) => (
                        <div
                            key={index}
                            className={cn(
                                'px-1.5 py-1.5 text-gray-800 text-xs font-light',
                                index % 2 === 0 ? 'bg-white' : 'bg-white'
                            )}>
                            <span className="mr-2 inline-block h-1 w-1 rounded-full bg-gray-500"></span>
                            {term}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
