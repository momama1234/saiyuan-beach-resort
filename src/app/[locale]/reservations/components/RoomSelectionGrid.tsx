import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { useBookingDetails } from '@/features/reservation/stores/booking-details-store'
import { useAvailableRoomClasses } from '@/features/reservation/stores/room-availability-store'
import { useSoldOutRoomClasses } from '@/features/reservation/stores/room-availability-store'
import { useIsLoadingRoomAvailability } from '@/features/reservation/stores/room-availability-store'
import { useSelectedRooms } from '@/features/reservation/stores/room-selection-store'
import { useSelectedRoomsByPlan } from '@/features/reservation/stores/room-selection-store'
import { useRoomSelectionActions } from '@/features/reservation/stores/room-selection-store'
import type { AvailableRoomClass } from '@/types/room-management'

import { RoomClassCard } from './RoomCard'
import RoomCardSoldContainer from './RoomCardSoldContainer'

interface RoomSelectionGridProps {
    initialRatePlanId?: number
}

export function RoomSelectionGrid({ initialRatePlanId }: RoomSelectionGridProps) {
    const t = useTranslations('BookingSteps')
    const searchParams = useSearchParams()
    const priorityRoomClassId = Number(searchParams.get('roomClassId')) || undefined
    const urlRatePlanId = Number(searchParams.get('ratePlanId')) || undefined

    // Subscribe to stores
    const roomClasses = useAvailableRoomClasses()
    const soldOutRoomClasses = useSoldOutRoomClasses()
    const selectedRooms = useSelectedRooms()
    const selectedRoomsByPlan = useSelectedRoomsByPlan()
    const bookingDetails = useBookingDetails()
    const isLoading = useIsLoadingRoomAvailability()

    // Get actions from store
    const roomSelectionActions = useRoomSelectionActions()

    const availableRoomsList = (() => {
        if (initialRatePlanId) {
            return [...roomClasses].sort((a, b) => {
                const aHas = a.ratePlans?.some((rp) => rp.id === initialRatePlanId) ? 0 : 1
                const bHas = b.ratePlans?.some((rp) => rp.id === initialRatePlanId) ? 0 : 1
                return aHas - bHas
            })
        }
        if (priorityRoomClassId) {
            return [...roomClasses].sort((a, b) => {
                const aFirst = a.id === priorityRoomClassId ? 0 : 1
                const bFirst = b.id === priorityRoomClassId ? 0 : 1
                return aFirst - bFirst
            })
        }
        return roomClasses
    })()
    const oursoldRooms = soldOutRoomClasses || []

    if (isLoading) {
        return (
            <Card className="mb-6">
                <CardContent className="p-8 text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-teal-600"></div>
                    <p className="text-gray-600">Searching for available rooms...</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <Card className="mb-6 border-none pt-0 pb-6 shadow-none">
                <div className="h-full w-full px-0">
                    <h3 className="text-lg font-semibold text-[#0E7C86]">{t('chooseRoom')}</h3>
                </div>
                <CardContent className="flex flex-col flex-wrap gap-4 px-0 lg:flex-nowrap">
                    {availableRoomsList.length > 0 ? (
                        availableRoomsList.map((roomClass: AvailableRoomClass) => {
                            const effectiveRatePlanId =
                                priorityRoomClassId && roomClass.id === priorityRoomClassId
                                    ? urlRatePlanId
                                    : initialRatePlanId
                            return (
                                <RoomClassCard
                                    key={roomClass.id}
                                    roomClass={roomClass}
                                    checkIn={bookingDetails.checkInDate ? new Date(bookingDetails.checkInDate) : null}
                                    checkOut={bookingDetails.checkOutDate ? new Date(bookingDetails.checkOutDate) : null}
                                    onUpdateQuantity={roomSelectionActions.updateRoomQuantity}
                                    selectedQuantity={selectedRooms[roomClass.id] || 0}
                                    onUpdatePlanQuantity={roomSelectionActions.updatePlanQuantity}
                                    selectedQuantitiesByPlan={Object.fromEntries(
                                        Object.entries(selectedRoomsByPlan?.[roomClass.id] || {}).map(([rpId, sel]) => [
                                            Number(rpId),
                                            sel?.quantity || 0
                                        ])
                                    )}
                                    initialRatePlanId={effectiveRatePlanId}
                                />
                            )
                        })
                    ) : (
                        <div className="col-span-full rounded-md border border-dashed border-gray-200 px-4 py-8 text-center">
                            <svg
                                className="mx-auto mb-4 h-[42px] w-[42px] text-gray-400"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="none"
                                viewBox="0 0 24 24">
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="M18 18V6h-5v12h5Zm0 0h2M4 18h2.5m3.5-5.5V12M6 6l7-2v16l-7-2V6Z"></path>
                            </svg>
                            <p className="text-gray-500">{t('noAvailableRooms')}</p>
                            <p className="mt-2 text-sm text-gray-500">
                                {t('pleaseTryChangingTheDatesOrNumberOfGuests')}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {oursoldRooms.length > 0 && <RoomCardSoldContainer roomsSold={oursoldRooms} title="Our sold rooms" />}
        </>
    )
}
