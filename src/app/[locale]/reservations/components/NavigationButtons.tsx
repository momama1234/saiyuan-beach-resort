import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { usePendingBookingSessionReset } from '@/features/reservation/hooks/usePendingBookingSessionReset'
import { useReservationNavigation } from '@/features/reservation/hooks/useReservationNavigation'
import { useBookingDetails } from '@/features/reservation/stores/booking-details-store'
import { useIsGuestInfoValid } from '@/features/reservation/stores/guest-info-store'
import { useIsSubmitting } from '@/features/reservation/stores/reservation-store'
import { useIsLoadingRoomAvailability } from '@/features/reservation/stores/room-availability-store'
import { useRoomSelectionActions, useTotalRooms } from '@/features/reservation/stores/room-selection-store'
import { useCurrentStep } from '@/features/reservation/stores/step-navigation-store'

import { ConfirmBookingDialog } from './ConfirmBookingDialog'
import { OccupancyWarningDialog } from './OccupancyWarningDialog'

export const NavigationButtons = memo(({ onError }: { onError?: (msg: string) => void }) => {
    const t = useTranslations('BookingSteps')

    // Confirmation dialog state
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [showBackConfirmDialog, setShowBackConfirmDialog] = useState(false)
    const [showOccupancyWarning, setShowOccupancyWarning] = useState(false)
    const [isConfirming, setIsConfirming] = useState(false)

    // Subscribe to Zustand stores
    const currentStep = useCurrentStep()
    const isLoading = useIsLoadingRoomAvailability()
    const isSubmitting = useIsSubmitting()
    const isGuestInfoValid = useIsGuestInfoValid()
    const totalRooms = useTotalRooms()
    const bookingDetails = useBookingDetails()
    const roomSelectionActions = useRoomSelectionActions()

    // Use navigation hook for handlers
    const { handleBack, handleNext } = useReservationNavigation({
        onReservationError: onError
    })
    const { resetPendingBookingSession } = usePendingBookingSessionReset()

    const { totalCapacityAdults, totalCapacityChildren } = useMemo(() => {
        const selected = roomSelectionActions.getSelectedRoomsList()
        return selected.reduce(
            (acc, { roomClass, quantity }) => ({
                totalCapacityAdults: acc.totalCapacityAdults + (roomClass.numberOfAdults ?? 0) * quantity,
                totalCapacityChildren: acc.totalCapacityChildren + (roomClass.numberOfChildren ?? 0) * quantity
            }),
            { totalCapacityAdults: 0, totalCapacityChildren: 0 }
        )
    }, [roomSelectionActions, totalRooms]) // eslint-disable-line react-hooks/exhaustive-deps

    // Compute step validity based on current step
    const isCurrentStepValid = (() => {
        switch (currentStep) {
            case 1:
                return totalRooms > 0
            case 2:
                return isGuestInfoValid
            case 3:
                return true
            default:
                return false
        }
    })()

    const getNextButtonText = (() => {
        switch (currentStep) {
            case 1:
                return t('next')
            case 2:
                return t('confirmBooking')
            case 3:
                return t('confirmAndBook')
            default:
                return t('next')
        }
    })()

    const guestAdults = parseInt(bookingDetails.adults || '0')
    const guestChildren = parseInt(bookingDetails.children || '0')

    const isOccupancyInsufficient =
        guestAdults > 0 &&
        totalCapacityAdults > 0 &&
        (totalCapacityAdults < guestAdults || (guestChildren > 0 && totalCapacityChildren < guestChildren))

    const handleNextClick = () => {
        if (currentStep === 1) {
            if (isOccupancyInsufficient) {
                setShowOccupancyWarning(true)
            } else {
                setShowConfirmDialog(true)
            }
        } else {
            handleNext()
        }
    }

    const handleConfirmContinue = async () => {
        setIsConfirming(true)
        try {
            await handleNext()
        } finally {
            setIsConfirming(false)
            setShowConfirmDialog(false)
        }
    }

    const handleOccupancyWarningConfirm = () => {
        setShowOccupancyWarning(false)
        setShowConfirmDialog(true)
    }

    const handleBackClick = () => {
        if (currentStep === 2) {
            setShowBackConfirmDialog(true)
            return
        }

        void handleBack()
    }

    const handleConfirmBack = () => {
        setShowBackConfirmDialog(false)
        void resetPendingBookingSession()
    }

    return (
        <>
            <div className="flex items-center justify-between ">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={handleBackClick}
                    className="flex cursor-pointer items-center gap-2 border-gray-200 px-4 text-gray-700 hover:bg-gray-100"
                    disabled={currentStep === 1 || isLoading || isSubmitting}>
                    <ChevronLeft className="h-4 w-4" />
                    {t('back')}
                </Button>

                <Button
                    onClick={handleNextClick}
                    size="lg"
                    disabled={isLoading || isSubmitting || !isCurrentStepValid}
                    className="flex cursor-pointer items-center gap-2 bg-[#0E7C86] px-4 text-white transition-colors duration-200 hover:bg-[#0a6570]">
                    {isSubmitting ? (
                        <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-orange-700"></div>
                            {t('booking')}
                        </>
                    ) : (
                        <>
                            {getNextButtonText}
                            <ChevronRight className="h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>

            <ConfirmBookingDialog
                open={showConfirmDialog}
                onOpenChange={(open) => { if (!isConfirming) setShowConfirmDialog(open) }}
                onConfirm={handleConfirmContinue}
                isLoading={isConfirming}
            />

            <ConfirmBookingDialog
                variant="back"
                open={showBackConfirmDialog}
                onOpenChange={setShowBackConfirmDialog}
                onConfirm={handleConfirmBack}
                isLoading={isLoading || isSubmitting}
            />
            <OccupancyWarningDialog
                open={showOccupancyWarning}
                onOpenChange={setShowOccupancyWarning}
                onConfirm={handleOccupancyWarningConfirm}
                totalCapacityAdults={totalCapacityAdults}
                totalCapacityChildren={totalCapacityChildren}
                guestAdults={guestAdults}
                guestChildren={guestChildren}
            />
        </>
    )
})

NavigationButtons.displayName = 'NavigationButtons'
