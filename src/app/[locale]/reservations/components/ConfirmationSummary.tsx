import { useTranslations } from 'next-intl'
import React from 'react'
import { useShallow } from 'zustand/shallow'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSelectedRoomsPricing } from '@/features/reservation/hooks/useSelectedRoomsPricing'
import { useBookingDetails, useBookingDetailsActions } from '@/features/reservation/stores/booking-details-store'
import { useGuestInfoStore } from '@/features/reservation/stores/guest-info-store'
import { useRoomSelectionActions } from '@/features/reservation/stores/room-selection-store'
import { formatPriceFixed2 } from '@/helpers/price'
import { formatVatLabel } from '@/helpers/vat-calculation'

interface ConfirmationSummaryProps {
    checkInTime: string
    checkOutTime: string
    isDepositEnabled: boolean
    policyCancellationNoticeDays: number
}

const formatTimeDisplay = (timeValue: string) => {
    if (!timeValue) return null

    // If it's already in HH:MM format, use it directly
    if (timeValue.match(/^\d{2}:\d{2}$/)) {
        return `${timeValue}`
    }

    // Legacy support for old dropdown values
    switch (timeValue) {
        case 'morning':
            return 'Morning (06:00 - 12:00)'
        case 'afternoon':
            return 'Afternoon (12:00 - 18:00)'
        case 'evening':
            return 'Evening (18:00 - 22:00)'
        case 'late':
            return 'Late (22:00 - 06:00)'
        default:
            return timeValue
    }
}

export function ConfirmationSummary({
    checkInTime,
    checkOutTime,
    isDepositEnabled: _isDepositEnabled,
    policyCancellationNoticeDays
}: ConfirmationSummaryProps) {
    // Subscribe to Zustand stores
    const guestInfo = useGuestInfoStore(
        useShallow((state) => ({
            firstName: state.firstName,
            lastName: state.lastName,
            email: state.email,
            phone: state.phone,
            specialRequests: state.specialRequests,
            estimatedArrival: state.estimatedArrival
        }))
    )
    const bookingDetails = useBookingDetails()
    const bookingDetailsActions = useBookingDetailsActions()
    const roomSelectionActions = useRoomSelectionActions()
    const roomsPricing = useSelectedRoomsPricing()

    // Compute derived values using Zustand actions
    const selectedRoomsList = roomSelectionActions.getSelectedRoomsList()
    const nights = bookingDetailsActions.calculateNights()
    const totalGuests = bookingDetailsActions.calculateTotalGuests()
    const formatDate = bookingDetailsActions.formatDate

    const formattedArrivalTime = formatTimeDisplay(guestInfo.estimatedArrival || '')
    const td = useTranslations('BookingReviewCard')
    const tg = useTranslations('GuestInfoForm')
    const t = useTranslations('ConfirmationSummary')

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

    // Booking details data array for mapping
    const bookingDetailsData = [
        { label: td('checkInDate'), value: formatDate(bookingDetails.checkInDate) },
        { label: td('checkOutDate'), value: formatDate(bookingDetails.checkOutDate) },
        { label: td('numberOfNights'), value: `${nights} ${td('nights')}` },
        { label: td('numberOfGuests'), value: `${totalGuests} ${td('guests')}` },
        {
            label: t('totalRooms'),
            value: `${roomsPricing.totalRooms} ${roomsPricing.totalRooms > 1 ? td('rooms') : td('room')}`
        }
    ]

    // Guest info data array for mapping
    const guestInfoData = [
        { label: tg('firstName'), value: guestInfo.firstName },
        { label: tg('email'), value: guestInfo.email },
        { label: tg('phone'), value: guestInfo.phone },
        ...(formattedArrivalTime ? [{ label: tg('estimatedArrival'), value: formattedArrivalTime }] : []),
        ...(guestInfo.specialRequests ? [{ label: tg('specialRequests'), value: guestInfo.specialRequests }] : [])
    ]

    // Terms and conditions data array
    const termsData = [
        t('termsAndConditionsContent'),
        t('termsAndConditionsContent2', { cancellationPolicy: policyCancellationNoticeDays || 7 }),
        t('termsAndConditionsContent3', { checkInTime: checkInTime, checkOutTime: checkOutTime }),
        t('termsAndConditionsContent4')
    ]

    return (
        <Card className="mb-6 border-none py-0 shadow-none">
            <CardHeader className="px-0">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#0E7C86]">
                    {t('title')}
                </CardTitle>
                <span className="text-sm font-light text-gray-500">{t('description')}</span>
            </CardHeader>
            <CardContent className="px-0">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="flex flex-col gap-6">
                        {/* Booking Details Summary */}
                        <div className="flex flex-col gap-1">
                            <h4 className="mb-2 text-[15px] font-medium text-gray-800">{t('bookingDetails')}</h4>
                            <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                {bookingDetailsData.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`flex justify-between p-3 text-sm text-gray-800 ${
                                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                        }`}>
                                        <span className="font-medium">{item.label}:</span>
                                        <span>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Guest Info Summary */}
                        <div className="hidden">
                            <h4 className="mb-2 text-[15px] font-medium text-gray-800">{tg('title')}</h4>
                            <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50/40">
                                {guestInfoData.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`flex justify-between p-3 text-sm text-gray-800 ${
                                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'
                                        }`}>
                                        <span className="font-medium">{item.label}:</span> {item.value}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* Selected Rooms Summary */}
                        <div>
                            <h4 className="mb-2 text-[15px] font-medium text-gray-700">{t('selectedRooms')}</h4>
                            <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                {selectedRoomsList.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`flex justify-between p-3 text-sm text-gray-800 ${
                                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'
                                        }`}>
                                        <span className="font-medium">{item.roomClass.name}</span>
                                        <span className="text-gray-600">x{item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Final Price Summary */}
                        <div>
                            <h4 className="mb-2 text-[15px] font-medium text-gray-700">{t('paymentSummary')}</h4>
                            <div className="rounded-lg border border-teal-600 bg-teal-50/40 p-4">
                                <div className="space-y-2 text-sm">
                                    {roomsPricing.rooms.map((room, index) => (
                                        <div key={index} className="flex justify-between">
                                            <span className="text-gray-600">
                                                {room.roomClass.name} x{room.quantity} ({nights} nights)
                                            </span>
                                            <span className="font-semibold text-teal-700">
                                                ฿{formatPriceFixed2(room.roomTotal)}
                                            </span>
                                        </div>
                                    ))}

                                    {/* VAT Breakdown */}
                                    {totalVat > 0 && (
                                        <div className="flex justify-between text-gray-600">
                                            <span>{vatLabel}</span>
                                            <span>฿{formatPriceFixed2(totalVat)}</span>
                                        </div>
                                    )}

                                    {totalServiceCharge > 0 && (
                                        <div className="flex justify-between text-gray-600">
                                            <span>{td('serviceCharge')}</span>
                                            <span>฿{formatPriceFixed2(totalServiceCharge)}</span>
                                        </div>
                                    )}

                                    <hr className="my-2 border-teal-600" />
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span className="text-gray-600">{t('totalPrice')}</span>
                                        <span className="text-teal-700">
                                            ฿{formatPriceFixed2(roomsPricing.grandTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50/40 text-xs">
                            <div className="bg-gray-100 p-4">
                                <p className="text-sm font-medium text-gray-800">{t('termsAndConditions')}</p>
                            </div>
                            {termsData.map((term, index) => (
                                <div key={index} className={`bg-white px-4 py-2 text-xs font-light text-gray-800`}>
                                    <span className="mr-2 inline-block h-1 w-1 rounded-full bg-gray-500"></span>
                                    {term}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
