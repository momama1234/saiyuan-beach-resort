'use client'

import { useTranslations } from 'next-intl'
import React, { useEffect, useRef, useState } from 'react'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { CountdownTimer } from '@/features/reservation/components/CountdownTimer'
import { usePendingBooking } from '@/features/reservation/hooks/usePendingBooking'
import { usePendingBookingUnloadProtection } from '@/features/reservation/hooks/usePendingBookingUnloadProtection'
import { useSelectedRoomsPricing } from '@/features/reservation/hooks/useSelectedRoomsPricing'
import { useBookingDetails, useBookingDetailsActions } from '@/features/reservation/stores/booking-details-store'
import {
    usePendingBookingActions,
    usePendingBookingData,
    usePendingBookingIds
} from '@/features/reservation/stores/pending-booking-store'
import { useRoomSelectionActions } from '@/features/reservation/stores/room-selection-store'
import { useStepNavigationActions } from '@/features/reservation/stores/step-navigation-store'
import { cancelPendingBookings } from '@/features/reservation/utils/pending-booking-session'

import { BookingReviewCard } from './BookingReviewCard'
import { GuestInfoForm } from './GuestInfoForm'

interface GuestInfoStepProps {
    isDepositEnabled: boolean
    checkInTime: string
    checkOutTime: string
    policyCancellationNoticeDays: number
}

export const GuestInfoStep = ({
    isDepositEnabled,
    checkInTime,
    checkOutTime,
    policyCancellationNoticeDays
}: GuestInfoStepProps): React.JSX.Element => {
    const translate = useTranslations('Reservations')

    // Subscribe to stores
    const bookingDetails = useBookingDetails()
    const bookingDetailsActions = useBookingDetailsActions()
    const roomSelectionActions = useRoomSelectionActions()
    const stepNavigationActions = useStepNavigationActions()

    // Pending booking state (now arrays)
    const pendingBookingIds = usePendingBookingIds()
    const pendingBookingData = usePendingBookingData()
    const pendingBookingActions = usePendingBookingActions()
    const [alertOpen, setAlertOpen] = useState(false)
    const hasHandledExpiredSession = useRef(false)

    // Use first pending booking for countdown (all bookings have same expiration)
    const firstPendingBookingId = pendingBookingIds[0] || null
    const { timeRemaining, isExpired, error } = usePendingBooking(firstPendingBookingId)
    usePendingBookingUnloadProtection()

    // Get selected rooms list
    const selectedRoomsList = roomSelectionActions.getSelectedRoomsList()

    // Calculate derived values
    const nights = bookingDetailsActions.calculateNights()
    const totalGuests = bookingDetailsActions.calculateTotalGuests()
    const formatDate = bookingDetailsActions.formatDate

    // Get rooms pricing using the custom hook
    const roomsPricing = useSelectedRoomsPricing()

    useEffect(() => {
        if (!isExpired) {
            hasHandledExpiredSession.current = false
        }
    }, [isExpired])

    // Handle expiration or not found - redirect back to room selection
    useEffect(() => {
        const isNotFound = error === 'PENDING_BOOKING_NOT_FOUND'
        // If 404 (Not Found), clear immediately without alert
        if (isNotFound) {
            pendingBookingActions.clearPendingBooking()
            stepNavigationActions.setCurrentStep(1)
            return
        }

        if (!isExpired || alertOpen || hasHandledExpiredSession.current) {
            return
        }

        hasHandledExpiredSession.current = true
        let isUnmounted = false

        const releaseExpiredPendingBookings = async () => {
            await cancelPendingBookings(pendingBookingIds)

            if (!isUnmounted) {
                setAlertOpen(true)
            }
        }

        void releaseExpiredPendingBookings()

        return () => {
            isUnmounted = true
        }
    }, [isExpired, alertOpen, error, pendingBookingIds, pendingBookingActions, stepNavigationActions])

    if (selectedRoomsList.length === 0) {
        return <></>
    }

    return (
        <div className="mb-8 flex flex-col gap-6">
            {/* Countdown Timer - show if any pending bookings exist and time is valid */}
            {pendingBookingData.length > 0 && timeRemaining > 0 && (
                <CountdownTimer timeRemaining={timeRemaining} className="sticky top-4 z-10" />
            )}

            <div className="flex flex-col gap-6 xl:flex-row">
                <GuestInfoForm />
                <BookingReviewCard
                    bookingDetails={bookingDetails}
                    nights={nights}
                    totalGuests={totalGuests}
                    roomsPricing={roomsPricing}
                    formatDate={formatDate}
                    isDepositEnabled={isDepositEnabled}
                    checkInTime={checkInTime}
                    checkOutTime={checkOutTime}
                    policyCancellationNoticeDays={policyCancellationNoticeDays}
                />
            </div>

            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent className="z-[2147483647]">
                    <AlertDialogHeader>
                        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_7080_13171)">
                                <path
                                    d="M60 30C60 13.4315 46.5685 0 30 0C13.4315 0 0 13.4315 0 30C0 46.5685 13.4315 60 30 60C46.5685 60 60 46.5685 60 30Z"
                                    fill="#CA3501"
                                />
                                <path
                                    d="M43.5316 23.2141C43.954 22.7123 44.2736 22.1322 44.4718 21.5069C44.6701 20.8817 44.7433 20.2235 44.6872 19.5699C44.6312 18.9164 44.4469 18.2803 44.145 17.6979C43.8431 17.1156 43.4294 16.5984 42.9276 16.1759C42.4258 15.7535 41.8457 15.434 41.2205 15.2357C40.5952 15.0374 39.937 14.9642 39.2835 15.0203C38.6299 15.0763 37.9938 15.2606 37.4115 15.5625C36.8291 15.8644 36.3119 16.2781 35.8895 16.7799L43.5316 23.2141ZM16.4684 23.2141C15.6152 22.2007 15.1995 20.8898 15.3127 19.5699C15.426 18.25 16.059 17.0292 17.0724 16.1759C18.0858 15.3227 19.3966 14.907 20.7165 15.0203C22.0364 15.1335 23.2573 15.7665 24.1105 16.7799L16.4684 23.2141ZM40.0737 38.7509C41.4785 36.8857 42.3361 34.666 42.5504 32.3408C42.7647 30.0155 42.3271 27.6765 41.2868 25.586C40.2465 23.4954 38.6445 21.7359 36.6603 20.5046C34.6762 19.2733 32.3884 18.6189 30.0533 18.6148C27.7182 18.6107 25.4281 19.257 23.4396 20.4812C21.4512 21.7055 19.8429 23.4593 18.7952 25.5462C17.7475 27.6331 17.3017 29.9705 17.5078 32.2965C17.7138 34.6225 18.5636 36.8452 19.9618 38.7154L16.1566 42.5167L18.6395 44.9996L22.4368 41.2022C24.615 42.8568 27.2739 43.7548 30.0092 43.7598C32.7445 43.7648 35.4066 42.8765 37.5908 41.2299L41.3605 44.9996L43.8434 42.5167L40.0737 38.7509ZM31.4171 36.8917H28.4566V34.768H31.4171V36.8917ZM31.4171 33.2917H28.4566V25.2628H31.4171V33.2917Z"
                                    fill="white"
                                />
                            </g>
                            <defs>
                                <clipPath id="clip0_7080_13171">
                                    <rect width="60" height="60" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>

                        <AlertDialogTitle>{translate('alert.title-session-expired')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {translate('alert.description-session-expired')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            className="w-full cursor-pointer bg-[#0E7C86] px-4 text-white transition-colors hover:bg-orange-200 hover:text-orange-800"
                            onClick={() => {
                                setAlertOpen(false)
                                pendingBookingActions.clearPendingBooking()
                                stepNavigationActions.setCurrentStep(1)
                            }}>
                            OK
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
