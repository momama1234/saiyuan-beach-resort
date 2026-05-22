'use client'

import { format, parseISO } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { Info, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useEffect, useRef, useState } from 'react'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle} from '@/components/ui/alert-dialog'
import { useAutoSelectRatePlan } from '@/features/reservation/hooks/useAutoSelectRatePlan'
import { useAutoSelectRoom } from '@/features/reservation/hooks/useAutoSelectRoom'
import { useReservationSessionReset } from '@/features/reservation/hooks/useReservationSessionReset'
import { BookingDetails, useBookingDetails, useBookingDetailsActions } from '@/features/reservation/stores/booking-details-store'
import {
    useAvailableRoomClasses,
    useRoomAvailabilityActions,
    useSoldOutRoomClasses
} from '@/features/reservation/stores/room-availability-store'
import { useRoomSelectionActions, useSelectedRooms, useSelectedRoomsByPlan } from '@/features/reservation/stores/room-selection-store'
import { useCurrentStep, useStepNavigationActions } from '@/features/reservation/stores/step-navigation-store'
import { buildReservationContextKey } from '@/features/reservation/utils/reservation-session'
import { getDataWithToken } from '@/lib/api'

import { BookingSummary } from './BookingSummary'
import { ConfirmationSummary } from './ConfirmationSummary'
import { GuestInfoStep } from './GuestInfoStep'
import { NavigationButtons } from './NavigationButtons'
import { PaymentCancelledModal } from './PaymentCancelledModal'
// Import components
import { ProgressIndicator } from './ProgressIndicator'
import { RoomSelectionGrid } from './RoomSelectionGrid'
import { StepHeader } from './StepHeader'

interface PaymentStatusResponse {
    paymentUrl: string | null
}

interface ReservationsProps {
    vatRate: number
    serviceCharge: number
    isIncludeVat: boolean
    checkInTime: string
    checkOutTime: string
    isDepositEnabled: boolean
    depositType: number
    policyCancellationNoticeDays: number
    initialBookingDetails?: Partial<BookingDetails>
    initialRatePlanId?: number
}

const DatesAdjustedToast = ({ checkIn, checkOut }: { checkIn: string; checkOut: string }) => {
    const [visible, setVisible] = React.useState(true)
    const tReservations = useTranslations('Reservations')

    useEffect(() => {
        const url = new URL(window.location.href)
        url.searchParams.delete('datesAdjusted')
        window.history.replaceState(null, '', url.toString())

        const timer = setTimeout(() => setVisible(false), 5000)
        return () => clearTimeout(timer)
    }, [])

    let formattedCheckIn = checkIn
    let formattedCheckOut = checkOut
    try {
        formattedCheckIn = format(parseISO(checkIn), 'MMM dd, yyyy')
        formattedCheckOut = format(parseISO(checkOut), 'MMM dd, yyyy')
    } catch { /* fall back to raw strings */ }

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.2 }}
                    className="fixed top-16 right-4 z-50 flex max-w-sm items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-lg"
                >
                    <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                    <p className="text-sm text-blue-800">
                        {tReservations('datesAdjusted', { checkIn: formattedCheckIn, checkOut: formattedCheckOut })}
                    </p>
                    <button
                        onClick={() => setVisible(false)}
                        className="ml-auto text-blue-400 hover:text-blue-600"
                        aria-label="Dismiss"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

const Reservations = ({
    vatRate,
    serviceCharge,
    isIncludeVat,
    checkInTime,
    checkOutTime,
    isDepositEnabled,
    depositType,
    policyCancellationNoticeDays,
    initialBookingDetails,
    initialRatePlanId
}: ReservationsProps): React.JSX.Element => {
    const tBookingSteps = useTranslations('BookingSteps')
    const tAlertMessages = useTranslations('Reservations.alert')
    const queryParams = useSearchParams()
    const router = useRouter()
    const [showDatesAdjustedToast] = React.useState(() => queryParams.get('datesAdjusted') === 'true')

    // Payment-cancelled modal state (driven by ?payment_cancelled=1&booking_id=X from Stripe cancel_url)
    const cancelledBookingId = (() => {
        if (queryParams.get('payment_cancelled') !== '1') return null
        const raw = queryParams.get('booking_id')
        if (!raw) return null
        const n = Number(raw)
        return Number.isFinite(n) && n > 0 ? n : null
    })()
    const [paymentCancelledModalDismissed, setPaymentCancelledModalDismissed] = useState(false)
    const [resumePaymentUrl, setResumePaymentUrl] = useState<string | null>(null)
    const paymentCancelledModalOpen = cancelledBookingId !== null && !paymentCancelledModalDismissed

    useEffect(() => {
        if (!cancelledBookingId) return
        let cancelled = false
        void (async () => {
            try {
                const status = await getDataWithToken<PaymentStatusResponse>(
                    `/open/reservation/by-booking/${cancelledBookingId}/payment-status`
                )
                if (!cancelled) setResumePaymentUrl(status?.paymentUrl ?? null)
            } catch {
                if (!cancelled) setResumePaymentUrl(null)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [cancelledBookingId])

    const handleResumePayment = () => {
        if (resumePaymentUrl) window.open(resumePaymentUrl, '_blank', 'noopener,noreferrer')
    }

    const handleClosePaymentCancelledModal = () => {
        setPaymentCancelledModalDismissed(true)
        const params = new URLSearchParams(queryParams.toString())
        params.delete('payment_cancelled')
        params.delete('booking_id')
        const next = params.toString()
        router.replace(next ? `?${next}` : '?')
    }

    // Alert state
    const [alertOpen, setAlertOpen] = React.useState(false)
    const [alertMessage, setAlertMessage] = React.useState('')
    const [alertTitle, setAlertTitle] = React.useState('')
    const [alertErrorType, setAlertErrorType] = React.useState<'room_conflict' | 'generic'>('generic')

    const handleReservationError = (errorMsg: string) => {
        const isKey = errorMsg.startsWith('alert.')

        // Check for room conflict error pattern
        const roomConflictMatch = errorMsg.match(/Not enough rooms available for room class (\d+)/)
        if (roomConflictMatch) {
            const roomClassId = Number(roomConflictMatch[1])
            const allRoomClasses = [...roomClasses, ...soldOutRoomClasses]
            const roomClass = allRoomClasses.find((rc) => rc.id === roomClassId)
            const roomName = roomClass?.name ?? `Room Class ${roomClassId}`

            setAlertErrorType('room_conflict')
            setAlertTitle('Room Unavailable')
            setAlertMessage(`${roomName} doesn't have enough availability for your selected dates.`)
            setAlertOpen(true)
            return
        }

        setAlertErrorType('generic')
        let message = errorMsg
        let title = 'Error'

        if (isKey) {
            const keyPath = errorMsg.replace('alert.', '')
            message = tAlertMessages(keyPath as 'ip-abuse.hourly' | 'ip-abuse.daily')
            title = tAlertMessages('title-session-expired')
            if (errorMsg.includes('ip-abuse')) {
                title = tBookingSteps('chooseRoom')
            }
        }

        setAlertTitle(title)
        setAlertMessage(message)
        setAlertOpen(true)
    }

    // Store hooks
    const bookingDetails = useBookingDetails()
    const { initialize } = useBookingDetailsActions()
    const currentStep = useCurrentStep()
    const stepNavigationActions = useStepNavigationActions()
    const roomSelectionActions = useRoomSelectionActions()
    const roomClasses = useAvailableRoomClasses()
    const soldOutRoomClasses = useSoldOutRoomClasses()
    const selectedRooms = useSelectedRooms()
    const selectedRoomsByPlan = useSelectedRoomsByPlan()
    const roomAvailabilityActions = useRoomAvailabilityActions()
    const { resetReservationSession } = useReservationSessionReset()
    const previousReservationContextKeyRef = useRef<string | null>(null)

    const reservationContextKey = buildReservationContextKey({
        checkIn: queryParams.get('checkIn') || '',
        checkOut: queryParams.get('checkOut') || '',
        adults: queryParams.get('adults') || '',
        children: queryParams.get('children') || '',
        roomClassId: queryParams.get('roomClassId') || ''
    })

    // Set body background to white when component mounts
    useEffect(() => {
        // Store original background color
        const originalBackground = document.body.style.backgroundColor

        // Set body background to white
        document.body.style.backgroundColor = 'white'

        // Cleanup function to restore original background
        return () => {
            document.body.style.backgroundColor = originalBackground
        }
    }, [])

    // Initialize booking details store on mount
    useEffect(() => {
        initialize({
            initialBookingDetails,
            vatRate,
            serviceChargeRate: serviceCharge,
            isIncludeVat,
            isDepositEnabled,
            depositType
        })
    }, []) // Only run once on mount

    // Reset reservation session state when the reservation context changes
    useEffect(() => {
        if (previousReservationContextKeyRef.current === null) {
            previousReservationContextKeyRef.current = reservationContextKey
            return
        }

        if (previousReservationContextKeyRef.current !== reservationContextKey) {
            void resetReservationSession()
        }

        previousReservationContextKeyRef.current = reservationContextKey
    }, [reservationContextKey, resetReservationSession])

    // Load room availability on mount and when query params change
    useEffect(() => {
        if (queryParams.toString()) {
            roomAvailabilityActions.fetchAvailableRooms(queryParams)
        }
    }, [queryParams, roomAvailabilityActions])

    // Sync room classes to room selection store
    useEffect(() => {
        roomSelectionActions.setRoomClasses(roomClasses)
    }, [roomClasses, roomSelectionActions])

    useAutoSelectRoom({
        queryParams,
        roomClasses,
        selectedRooms,
        updateRoomQuantity: roomSelectionActions.updateRoomQuantity,
        updatePlanQuantity: roomSelectionActions.updatePlanQuantity,
        resetReservationSession
    })

    // Auto-select rate plan when initialRatePlanId is provided (e.g. from promotion deep-link)
    const autoSelectNights = React.useMemo(() => {
        const ci = bookingDetails.checkInDate
        const co = bookingDetails.checkOutDate
        if (!ci || !co) return 0
        return Math.max(0, Math.ceil((new Date(co).getTime() - new Date(ci).getTime()) / (1000 * 60 * 60 * 24)))
    }, [bookingDetails.checkInDate, bookingDetails.checkOutDate])

    useAutoSelectRatePlan({
        initialRatePlanId,
        roomClasses,
        nights: autoSelectNights,
        selectedRoomsByPlan,
        updatePlanQuantity: roomSelectionActions.updatePlanQuantity
    })

    return (
        <>
            {/* <Carousel images={backgroundImages} /> */}
            {/* Content Overlay - Centered */}
            <div className="mt-[42px] h-screen w-full bg-white">
                <div className="mx-auto w-full rounded-lg bg-white px-4 pt-6 pb-6 xl:w-[1024px] xl:px-6 xl:pt-12 xl:pb-12">
                    {/* Progress Indicator */}
                    <div className="mb-8">
                        <ProgressIndicator />
                    </div>

                    {/* Header */}
                    <StepHeader />

                    {/* Step 1: Room Selection */}
                    {currentStep === 1 && (
                        <>
                            <div className="mb-6">
                                <BookingSummary />
                            </div>
                            <div className="mb-6">
                                <RoomSelectionGrid initialRatePlanId={initialRatePlanId} />
                            </div>
                        </>
                    )}

                    {/* Step 2: Guest Info & Booking Review */}
                    {currentStep === 2 && (
                        <GuestInfoStep
                            isDepositEnabled={isDepositEnabled}
                            checkInTime={checkInTime}
                            checkOutTime={checkOutTime}
                            policyCancellationNoticeDays={policyCancellationNoticeDays}
                        />
                    )}

                    {/* Step 3: Final Confirmation */}
                    {currentStep === 3 && roomSelectionActions.getSelectedRoomsList().length > 0 && (
                        <div className="mb-6">
                            <ConfirmationSummary
                                checkInTime={checkInTime}
                                checkOutTime={checkOutTime}
                                policyCancellationNoticeDays={policyCancellationNoticeDays}
                                isDepositEnabled={isDepositEnabled}
                            />
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="sticky bottom-0 z-50 -mx-4 mt-8 border-t border-gray-200 bg-white px-4 pt-4 pb-4 xl:-mx-6 xl:px-6">
                        <NavigationButtons onError={handleReservationError} />
                    </div>
                </div>
            </div>

            {showDatesAdjustedToast && (
                <DatesAdjustedToast
                    checkIn={queryParams.get('checkIn') ?? ''}
                    checkOut={queryParams.get('checkOut') ?? ''}
                />
            )}

            <PaymentCancelledModal
                open={paymentCancelledModalOpen}
                bookingId={cancelledBookingId}
                paymentUrl={resumePaymentUrl}
                onResume={handleResumePayment}
                onClose={handleClosePaymentCancelledModal}
            />

            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent className="z-[2147483647]">
                    <AlertDialogHeader>
                        <svg width="60" height="61" viewBox="0 0 60 61" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M59.4243 53.8426L53.9066 44.2881L52.1643 41.27V8.3959C52.1629 7.54341 51.8234 6.72629 51.2203 6.12381C50.6171 5.52133 49.7996 5.1827 48.9471 5.18221H43.5201V2.30465C43.5201 1.01248 42.17 0 40.4462 0C38.7245 0 37.3759 1.01248 37.3759 2.30502V5.18258H29.1525V2.30502C29.1525 1.01248 27.8039 0 26.0821 0C24.3603 0 23.0083 1.01248 23.0083 2.30502V5.18258H14.7885V2.30502C14.7885 1.01248 13.4383 0 11.7146 0C9.99294 0 8.64433 1.01248 8.64433 2.30502V5.18258H3.21728C2.36478 5.18307 1.54728 5.5217 0.944134 6.12417C0.340987 6.72665 0.00144511 7.54377 0 8.39627V52.0937C0.00098487 52.9467 0.340268 53.7644 0.943416 54.3676C1.54656 54.9707 2.36432 55.3099 3.21728 55.3109H29.3904C29.2954 55.9242 29.3339 56.5508 29.5035 57.1478C29.673 57.7448 29.9695 58.2982 30.3726 58.77C30.7758 59.2419 31.2761 59.6211 31.8394 59.8816C32.4027 60.1422 33.0156 60.2781 33.6362 60.2799H55.7074C56.4609 60.2802 57.2012 60.0822 57.8538 59.7056C58.5064 59.329 59.0483 58.7873 59.4251 58.1348C59.8019 57.4823 60.0001 56.742 60 55.9886C59.9999 55.2351 59.8013 54.495 59.4243 53.8426ZM24.984 2.33777C25.0623 2.22006 25.4513 1.97572 26.0821 1.97572C26.7129 1.97572 27.0992 2.21957 27.1768 2.3369V5.18221H24.984V2.33777ZM10.6202 2.3369C10.6976 2.21957 11.0849 1.97572 11.7149 1.97572C12.3449 1.97572 12.7348 2.21994 12.8131 2.33777V5.18221H10.6202V2.3369ZM39.3517 2.3369C39.429 2.21957 39.8164 1.97572 40.4464 1.97572C41.0765 1.97572 41.4664 2.22006 41.5448 2.33777V5.18221H39.3515L39.3517 2.3369Z" fill="#F3F5F9"/>
                            <path d="M59.4243 53.8424L53.9066 44.288L48.3887 34.7302C48.0117 34.0782 47.4697 33.5368 46.8173 33.1605C46.1649 32.7841 45.425 32.5859 44.6718 32.5859C43.9186 32.5859 43.1786 32.7841 42.5262 33.1605C41.8738 33.5368 41.3319 34.0782 40.9548 34.7302L35.437 44.2885L29.9229 53.8424C29.546 54.4946 29.3475 55.2344 29.3472 55.9875C29.3469 56.7407 29.5448 57.4807 29.9212 58.1331C30.2975 58.7855 30.8389 59.3273 31.491 59.7041C32.1432 60.0809 32.883 60.2795 33.6361 60.2797H55.7074C56.4609 60.2801 57.2011 60.082 57.8537 59.7055C58.5064 59.3289 59.0483 58.7871 59.4251 58.1346C59.8018 57.4821 60.0001 56.7419 60 55.9884C59.9998 55.235 59.8013 54.4948 59.4243 53.8424Z" fill="#FFDF40"/>
                            <path d="M29.9229 53.8422L31.3565 51.3581H3.21728C2.36479 51.3576 1.54729 51.019 0.944142 50.4166C0.340991 49.8141 0.00144517 48.997 0 48.1445V52.0934C0.00098487 52.9463 0.340268 53.7641 0.943416 54.3672C1.54656 54.9703 2.36432 55.3096 3.21728 55.3105H29.3904C29.4784 54.7931 29.6587 54.2957 29.9229 53.8422Z" fill="#E1E6F0"/>
                            <path d="M31.3564 51.3585L35.4371 44.2887L40.9549 34.7305C41.332 34.0784 41.8739 33.5371 42.5263 33.1607C43.1787 32.7843 43.9187 32.5862 44.6719 32.5862C45.4251 32.5862 46.165 32.7843 46.8175 33.1607C47.4699 33.5371 48.0118 34.0784 48.3888 34.7305L52.1644 41.2707V15.7891H26.0803V51.3585H31.3564Z" fill="#E1E6F0"/>
                            <path d="M12.53 40.5957H7.86646C7.59368 40.5957 7.37256 40.8168 7.37256 41.0896V45.2013C7.37256 45.4741 7.59368 45.6952 7.86646 45.6952H12.53C12.8027 45.6952 13.0239 45.4741 13.0239 45.2013V41.0896C13.0239 40.8168 12.8027 40.5957 12.53 40.5957Z" fill="#4D5E80"/>
                            <path d="M12.53 20.4648H7.86646C7.59368 20.4648 7.37256 20.686 7.37256 20.9587V25.0704C7.37256 25.3432 7.59368 25.5643 7.86646 25.5643H12.53C12.8027 25.5643 13.0239 25.3432 13.0239 25.0704V20.9587C13.0239 20.686 12.8027 20.4648 12.53 20.4648Z" fill="#4D5E80"/>
                            <path d="M12.53 30.5283H7.86646C7.59368 30.5283 7.37256 30.7494 7.37256 31.0222V35.1374C7.37256 35.4101 7.59368 35.6313 7.86646 35.6313H12.53C12.8027 35.6313 13.0239 35.4101 13.0239 35.1374V31.0222C13.0239 30.7494 12.8027 30.5283 12.53 30.5283Z" fill="#4D5E80"/>
                            <path d="M23.1169 30.5283H18.457C18.1843 30.5283 17.9631 30.7494 17.9631 31.0222V35.1374C17.9631 35.4101 18.1843 35.6313 18.457 35.6313H23.1169C23.3897 35.6313 23.6108 35.4101 23.6108 35.1374V31.0222C23.6108 30.7494 23.3897 30.5283 23.1169 30.5283Z" fill="#4D5E80"/>
                            <path d="M33.7075 20.4648H29.0439C28.7712 20.4648 28.55 20.686 28.55 20.9587V25.0704C28.55 25.3432 28.7712 25.5643 29.0439 25.5643H33.7075C33.9802 25.5643 34.2014 25.3432 34.2014 25.0704V20.9587C34.2014 20.686 33.9802 20.4648 33.7075 20.4648Z" fill="#445775"/>
                            <path d="M44.298 20.4648H39.6345C39.3618 20.4648 39.1406 20.686 39.1406 20.9587V25.0704C39.1406 25.3432 39.3618 25.5643 39.6345 25.5643H44.298C44.5708 25.5643 44.7919 25.3432 44.7919 25.0704V20.9587C44.7919 20.686 44.5708 20.4648 44.298 20.4648Z" fill="#445775"/>
                            <path d="M33.7075 30.5283H29.0439C28.7712 30.5283 28.55 30.7494 28.55 31.0222V35.1374C28.55 35.4101 28.7712 35.6313 29.0439 35.6313H33.7075C33.9802 35.6313 34.2014 35.4101 34.2014 35.1374V31.0222C34.2014 30.7494 33.9802 30.5283 33.7075 30.5283Z" fill="#445775"/>
                            <path d="M23.1169 20.4648H18.457C18.1843 20.4648 17.9631 20.686 17.9631 20.9587V25.0704C17.9631 25.3432 18.1843 25.5643 18.457 25.5643H23.1169C23.3897 25.5643 23.6108 25.3432 23.6108 25.0704V20.9587C23.6108 20.686 23.3897 20.4648 23.1169 20.4648Z" fill="#4D5E80"/>
                            <path d="M23.1169 40.5957H18.457C18.1843 40.5957 17.9631 40.8168 17.9631 41.0896V45.2013C17.9631 45.4741 18.1843 45.6952 18.457 45.6952H23.1169C23.3897 45.6952 23.6108 45.4741 23.6108 45.2013V41.0896C23.6108 40.8168 23.3897 40.5957 23.1169 40.5957Z" fill="#4D5E80"/>
                            <path d="M48.9471 5.18262H3.21728C2.36478 5.18311 1.54728 5.52174 0.944134 6.12421C0.340987 6.72668 0.00144511 7.5438 0 8.3963V15.7887H52.1643V8.3963C52.1629 7.54381 51.8234 6.72669 51.2203 6.12422C50.6171 5.52174 49.7996 5.18311 48.9471 5.18262Z" fill="#EC4C36"/>
                            <path d="M48.9471 5.18262H26.0803V15.7898H52.1644V8.39742C52.1633 7.54471 51.8239 6.72729 51.2207 6.12457C50.6175 5.52185 49.7998 5.18308 48.9471 5.18262Z" fill="#D1311B"/>
                            <path d="M26.0803 51.3584V55.3098H29.3904C29.4785 54.7928 29.6588 54.2957 29.9229 53.8425L31.3564 51.3584H26.0803Z" fill="#BEC7D3"/>
                            <path d="M26.082 8.56855C25.4512 8.56855 25.0622 8.32421 24.984 8.2065V2.33777C25.0622 2.22006 25.4512 1.97572 26.082 1.97572C26.7129 1.97572 27.0991 2.21957 27.1768 2.3369V5.18221H29.1525V2.30465C29.1525 1.01248 27.8039 0 26.082 0C24.3602 0 23.0083 1.01248 23.0083 2.30502V8.23924C23.0083 9.53179 24.3585 10.5443 26.082 10.5443C26.2127 10.5457 26.3424 10.5213 26.4635 10.4723C26.5846 10.4233 26.6948 10.3508 26.7878 10.2589C26.8807 10.167 26.9544 10.0576 27.0048 9.93703C27.0551 9.81645 27.081 9.68708 27.081 9.55641C27.081 9.42574 27.0551 9.29637 27.0048 9.17579C26.9544 9.05521 26.8807 8.94582 26.7878 8.85394C26.6948 8.76206 26.5846 8.68953 26.4635 8.64055C26.3424 8.59156 26.2127 8.56709 26.082 8.56855ZM11.7146 8.56855C11.0846 8.56855 10.6975 8.32458 10.6199 8.20724V2.3369C10.6973 2.21957 11.0846 1.97572 11.7146 1.97572C12.3446 1.97572 12.7345 2.21994 12.8128 2.33777V5.18221H14.7885V2.30465C14.7885 1.01248 13.4383 0 11.7146 0C9.9929 0 8.64429 1.01248 8.64429 2.30502V8.23924C8.64429 9.53179 9.9929 10.5443 11.7146 10.5443C11.9747 10.5414 12.2231 10.436 12.406 10.2511C12.5889 10.0661 12.6914 9.8165 12.6914 9.55641C12.6914 9.29631 12.5889 9.04671 12.406 8.86177C12.2231 8.67683 11.9747 8.57147 11.7146 8.56855Z" fill="#4D5E80"/>
                            <path d="M40.4463 8.56855C39.8162 8.56855 39.4292 8.32458 39.3515 8.20724V2.3369C39.4288 2.21957 39.8162 1.97572 40.4463 1.97572C41.0763 1.97572 41.4662 2.22006 41.5446 2.33777V5.18221H43.5202V2.30465C43.5202 1.01248 42.1701 0 40.4463 0C38.7246 0 37.376 1.01248 37.376 2.30502V8.23924C37.376 9.53179 38.7246 10.5443 40.4463 10.5443C40.7063 10.5414 40.9548 10.436 41.1377 10.2511C41.3205 10.0661 41.4231 9.8165 41.4231 9.55641C41.4231 9.29631 41.3205 9.04671 41.1377 8.86177C40.9548 8.67683 40.7063 8.57147 40.4463 8.56855ZM26.0823 0V1.97572C26.7122 1.97572 27.0993 2.21957 27.1769 2.3369V5.18221H29.1526V2.30465C29.1526 1.01248 27.804 0 26.0823 0ZM27.0701 9.55635C27.07 9.29438 26.966 9.04315 26.7807 8.85791C26.5955 8.67267 26.3442 8.56858 26.0823 8.56855V10.5443C26.3443 10.5442 26.5955 10.4401 26.7808 10.2549C26.966 10.0696 27.0701 9.81834 27.0701 9.55635Z" fill="#445775"/>
                            <path d="M53.9065 44.2885L48.3887 34.7303C48.0295 34.0894 47.508 33.5543 46.8767 33.1787C46.2454 32.803 45.5263 32.5999 44.7917 32.5898V60.2798H55.7074C56.4608 60.2801 57.2011 60.0821 57.8537 59.7055C58.5063 59.3289 59.0483 58.7871 59.425 58.1346C59.8018 57.4821 60.0001 56.7419 59.9999 55.9885C59.9998 55.235 59.8013 54.4948 59.4243 53.8425L53.9065 44.2885Z" fill="#FFBE40"/>
                            <path d="M47.3756 40.8488L47.0375 47.4587C46.9736 48.771 45.9345 49.7999 44.6717 49.7999C43.4135 49.7999 42.3745 48.7717 42.306 47.4591L41.9676 40.8482C41.9507 40.505 42.0045 40.1619 42.1256 39.8404C42.2468 39.5188 42.4327 39.2256 42.6719 38.9789C42.9292 38.707 43.2393 38.4905 43.5831 38.3425C43.927 38.1945 44.2974 38.1182 44.6717 38.1182C45.046 38.1182 45.4164 38.1945 45.7603 38.3425C46.1041 38.4905 46.4141 38.707 46.6715 38.9789C46.9107 39.2256 47.0967 39.519 47.2179 39.8407C47.339 40.1623 47.3927 40.5055 47.3756 40.8488ZM44.6717 52.0337C44.2029 52.0337 43.7447 52.1727 43.355 52.4331C42.9652 52.6935 42.6615 53.0637 42.4821 53.4967C42.3027 53.9298 42.2558 54.4063 42.3472 54.8661C42.4387 55.3258 42.6644 55.7481 42.9958 56.0796C43.3273 56.411 43.7496 56.6367 44.2093 56.7282C44.6691 56.8196 45.1456 56.7727 45.5787 56.5933C46.0117 56.4139 46.3819 56.1102 46.6423 55.7204C46.9027 55.3307 47.0417 54.8724 47.0417 54.4037C47.041 53.7754 46.7911 53.1729 46.3467 52.7286C45.9024 52.2843 45.3 52.0344 44.6717 52.0337Z" fill="#EC4C36"/>
                            <path d="M47.0417 54.4035C47.0407 53.7963 46.8068 53.2126 46.3882 52.7728C45.9696 52.333 45.3982 52.0705 44.7917 52.0395V56.7673C45.3981 56.7363 45.9695 56.4739 46.3881 56.0341C46.8068 55.5943 47.0407 55.0107 47.0417 54.4035ZM44.7917 49.7936C45.9995 49.7304 46.9757 48.7286 47.0375 47.4585L47.3756 40.8486C47.3927 40.5053 47.339 40.1621 47.2179 39.8404C47.0967 39.5188 46.9107 39.2254 46.6715 38.9787C46.1789 38.4611 45.5055 38.1539 44.7917 38.1211V49.7936Z" fill="#D1311B"/>
                        </svg>

                        <AlertDialogTitle>{alertTitle || 'Error'}</AlertDialogTitle>
                        <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        {alertErrorType === 'room_conflict' ? (
                            <>
                                <AlertDialogAction
                                    className="cursor-pointer bg-[#0a6570] px-4 text-white transition-colors hover:bg-orange-200 hover:text-orange-800"
                                    onClick={() => {
                                        stepNavigationActions.setCurrentStep(1)
                                        setAlertOpen(false)
                                    }}>
                                    Adjust Selection
                                </AlertDialogAction>
                                <AlertDialogAction
                                    className="cursor-pointer bg-[#0a6570] px-4 text-white transition-colors hover:bg-orange-200 hover:text-orange-800"
                                    onClick={() => {
                                        stepNavigationActions.setCurrentStep(1)
                                        setAlertOpen(false)
                                    }}>
                                    Change Dates
                                </AlertDialogAction>
                                <AlertDialogCancel>Dismiss</AlertDialogCancel>
                            </>
                        ) : (
                            <AlertDialogAction
                                className="cursor-pointer bg-[#0a6570] px-4 text-white transition-colors hover:bg-orange-200 hover:text-orange-800"
                                onClick={() => setAlertOpen(false)}>
                                OK
                            </AlertDialogAction>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default Reservations
