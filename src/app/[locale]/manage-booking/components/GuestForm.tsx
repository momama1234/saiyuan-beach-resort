'use client'

import { useTranslations } from 'next-intl'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { PreCheckinBookingDetail, RoomGuestSlot,RoomGuestsState } from '../types/manage-booking-types'
import { GuestFormGuestRow } from './GuestFormGuestRow'

export interface GuestFormProps {
    bookingDetail: PreCheckinBookingDetail | null
    roomGuests: RoomGuestsState[]
    isGuestExpanded: (roomIndex: number, guestIndex: number) => boolean
    setGuestExpanded: (roomIndex: number, guestIndex: number, open: boolean) => void
    updateRoomGuest: (
        roomIndex: number,
        guestIndex: number,
        field: keyof RoomGuestSlot,
        value: string | boolean | number | undefined
    ) => void
    guestEstimatedArrival: string
    onGuestEstimatedArrivalChange: (value: string) => void
    guestSpecialRequests: string
    onGuestSpecialRequestsChange: (value: string) => void
    onSubmit: () => void
    isLoading: boolean
    onOpenScanModal: (roomIndex: number, guestIndex: number) => void
    onBackToSearch: () => void
    isSubmitDisabled: boolean
}

export function GuestForm({
    bookingDetail,
    roomGuests,
    isGuestExpanded,
    setGuestExpanded,
    updateRoomGuest,
    guestEstimatedArrival,
    onGuestEstimatedArrivalChange,
    guestSpecialRequests,
    onGuestSpecialRequestsChange,
    onSubmit,
    isLoading,
    onOpenScanModal,
    onBackToSearch,
    isSubmitDisabled
}: GuestFormProps) {
    const t = useTranslations('ManageBooking')

    return (
        <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{t('guestFormTitle')}</CardTitle>
                <Button variant="outline" size="sm" onClick={onBackToSearch}>
                    {t('backToSearch')}
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {!bookingDetail ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="mb-2 size-8 animate-spin rounded-full border-2 border-orange-700 border-t-transparent" />
                        <p className="text-sm text-gray-500">
                            {t('loadingBookingDetail') || 'Loading booking details...'}
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-gray-500">{t('guestFormDescription')}</p>
                        {roomGuests.map((room, roomIndex) => (
                            <Card key={room.bookingRoomId} className="border-orange-100 bg-orange-50/30">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">
                                        {t('room') || 'Room'}: {room.roomLabel}
                                    </CardTitle>
                                    <p className="text-xs text-gray-500">
                                        {room.occupancy.numberOfAdults} {t('adults') || 'adults'},{' '}
                                        {room.occupancy.numberOfChildren} {t('children') || 'children'},{' '}
                                        {room.occupancy.numberOfInfants} {t('infants') || 'infants'}
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {room.guests.map((guest, guestIndex) => (
                                        <GuestFormGuestRow
                                            key={`${room.bookingRoomId}-${guestIndex}`}
                                            guest={guest}
                                            room={room}
                                            roomIndex={roomIndex}
                                            guestIndex={guestIndex}
                                            isOpen={isGuestExpanded(roomIndex, guestIndex)}
                                            onOpenChange={(open) =>
                                                setGuestExpanded(roomIndex, guestIndex, open)
                                            }
                                            onUpdateGuest={updateRoomGuest}
                                            onOpenScanModal={onOpenScanModal}
                                        />
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                        <div>
                            <label
                                htmlFor="guestEstimatedArrival"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                {t('estimatedArrival')}
                            </label>
                            <input
                                id="guestEstimatedArrival"
                                type="text"
                                value={guestEstimatedArrival}
                                onChange={(e) => onGuestEstimatedArrivalChange(e.target.value)}
                                className="h-11 w-full rounded-md border border-gray-300 px-4 focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="guestSpecialRequests"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                {t('specialRequests')}
                            </label>
                            <textarea
                                id="guestSpecialRequests"
                                value={guestSpecialRequests}
                                onChange={(e) => onGuestSpecialRequestsChange(e.target.value)}
                                rows={3}
                                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none"
                            />
                        </div>
                        <Button
                            onClick={onSubmit}
                            disabled={isSubmitDisabled}
                            className="w-full bg-[#0E7C86] hover:bg-orange-800"
                        >
                            {isLoading ? t('submitting') : t('submitGuest')}
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
