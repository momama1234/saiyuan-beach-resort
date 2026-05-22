'use client'

import {
    AlertCircle,
    ArrowRight,
    Bell,
    Calendar,
    Car,
    CheckCircle,
    Clock,
    CreditCard,
    FileText,
    Home,
    Info,
    Key,
    Loader2,
    LucideIcon,
    Mail,
    MapPin,
    Phone,
    Shield,
    Star,
    Wifi
} from 'lucide-react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatPriceFixed2 } from '@/helpers/price'
import { getDataWithToken } from '@/lib/api'
import { BookingBullet, BookingStep } from '@/types/property-info'

const ICON_MAP: Record<string, LucideIcon> = {
    Mail,
    Phone,
    Calendar,
    Clock,
    MapPin,
    Info,
    CheckCircle,
    CreditCard,
    Key,
    Car,
    Wifi,
    Star,
    Bell,
    FileText,
    Shield
}

import { computeCountdown, type CountdownDisplay } from './countdown'

interface PaymentStatus {
    bookingId: number
    isPaid: boolean
    paymentStatus: string
    bookingStatus: string
    paymentUrl: string | null
    sessionId: string | null
    grandTotal: number
    providerPaymentStatus: string | null
}

interface Booking {
    id: number
    bookingId: number
    paymentId: number
    paymentStatus: string
    bookingStatus: BookingStatus
    grandTotal: number
    expiresAt?: string | null
    expiryWindow?: string | null
}

interface BookingStatus {
    id: number
    name: string
}

const BOOKING_STATUS_PENDING = 1
const BOOKING_STATUS_CANCELLED = 7
const POLL_INTERVAL_MS = 30_000
const MAX_POLL_ATTEMPTS = 30
interface ReservationSuccessProps {
    bookingSteps: BookingStep[]
    bookingBullets: BookingBullet[]
}

export default function ReservationSuccess({ bookingSteps, bookingBullets }: ReservationSuccessProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const bookingId = searchParams.get('booking_id')
    const paymentId = searchParams.get('payment_id')
    const [booking, setBooking] = useState<Booking | null>(null)
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
    const [bookingLoaded, setBookingLoaded] = useState(false)
    const [paymentLoaded, setPaymentLoaded] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [checkingPayment, setCheckingPayment] = useState(false)
    const [countdown, setCountdown] = useState<CountdownDisplay | null>(null)
    const loading = !bookingLoaded || !paymentLoaded
    const t = useTranslations('ReservationSuccess')
    const locale = useLocale()
    // ฟังก์ชันสำหรับตรวจสอบสถานะการจ่ายเงิน
    const checkPaymentStatus = async () => {
        const hasPaymentId = paymentId && paymentId !== 'undefined' && paymentId !== 'null'
        const hasBookingId = bookingId && bookingId !== 'undefined' && bookingId !== 'null'
        if (!hasPaymentId && !hasBookingId) return

        const url = hasPaymentId
            ? `/open/reservation/${paymentId}/payment-status`
            : `/open/reservation/by-booking/${bookingId}/payment-status`

        try {
            setCheckingPayment(true)
            const response = await getDataWithToken<PaymentStatus>(url)

            setPaymentStatus(response)
            setError(null)

            // ถ้าจ่ายแล้ว — backend ก็เพิ่ง flip booking → CONFIRMED ในคำขอเดียวกัน
            // ดึง booking ใหม่เพื่อให้ UI แสดง CONFIRMED ทันที (ไม่ต้องรอ user refresh)
            if (response?.isPaid && hasBookingId) {
                try {
                    const fresh = await getDataWithToken<Booking>(`/open/reservation/${bookingId}`)
                    setBooking(fresh)
                } catch {
                    // ไม่สำคัญพอจะเปลี่ยนสถานะ overall — เก็บ booking เดิมไว้
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : t('errorCheckingPaymentStatus'))
        } finally {
            setCheckingPayment(false)
            setPaymentLoaded(true)
        }
    }

    // One-shot booking fetch on mount. No polling — paymentStatus drives "is paid"
    // and the booking endpoint is called once to populate the rest of the details.
    useEffect(() => {
        if (!bookingId || bookingId === 'undefined' || bookingId === 'null') {
            setBookingLoaded(true)
            return
        }
        let cancelled = false
        ;(async () => {
            try {
                const result = await getDataWithToken<Booking>(`/open/reservation/${bookingId}`)
                if (cancelled) return
                setBooking(result)
                setError(null)
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to fetch booking')
            } finally {
                if (!cancelled) setBookingLoaded(true)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [bookingId])

    // One-shot fetch of paymentStatus on mount. No polling — guest can hit the
    // "Check Status" button to refresh manually if needed.
    useEffect(() => {
        const hasPaymentId = paymentId && paymentId !== 'undefined' && paymentId !== 'null'
        const hasBookingId = bookingId && bookingId !== 'undefined' && bookingId !== 'null'
        if (!hasPaymentId && !hasBookingId) {
            setPaymentLoaded(true)
            return
        }
        checkPaymentStatus()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paymentId, bookingId])

    // Tick the countdown every second while expiresAt is set.
    useEffect(() => {
        if (!booking?.expiresAt) {
            setCountdown(null)
            return
        }
        const tick = () => setCountdown(computeCountdown(booking.expiresAt))
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [booking?.expiresAt])

    // Auto-poll booking status after countdown expires so the page
    // automatically transitions to the "Booking expired" view once
    // the backend cron cancels the booking.
    useEffect(() => {
        if (countdown?.kind !== 'expired') return
        if (!bookingId || bookingId === 'undefined' || bookingId === 'null') return
        // Already cancelled — nothing to poll for
        if (booking?.bookingStatus?.id === BOOKING_STATUS_CANCELLED) return

        let attempts = 0
        let cancelled = false

        const poll = async () => {
            if (cancelled || attempts >= MAX_POLL_ATTEMPTS) return
            attempts++
            try {
                const fresh = await getDataWithToken<Booking>(`/open/reservation/${bookingId}`)
                if (cancelled) return
                setBooking(fresh)
                // Backend has cancelled the booking — stop polling
                if (fresh?.bookingStatus?.id === BOOKING_STATUS_CANCELLED) {
                    cancelled = true
                }
            } catch {
                // Silently retry on next tick
            }
        }

        // Poll immediately, then every POLL_INTERVAL_MS
        void poll()
        const id = setInterval(poll, POLL_INTERVAL_MS)
        return () => {
            cancelled = true
            clearInterval(id)
        }
    }, [countdown?.kind, bookingId, booking?.bookingStatus?.id])

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

    const handlePayNow = () => {
        if (paymentStatus?.paymentUrl) {
            window.open(paymentStatus.paymentUrl, '_self')
        }
    }

    const handleGoHome = () => {
        router.push('/')
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-6">
                <div className="text-center">
                    <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-teal-600" />
                    <p className="text-gray-600">{t('checkingBookingStatus')}</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-6">
                <Card className="max-w-md">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                        <h2 className="mb-2 text-xl font-semibold text-gray-900">Error</h2>
                        <p className="mb-4 text-gray-600">{error || t('unableToLoadBookingInformation')}</p>
                        <Button onClick={handleGoHome} className="bg-teal-600 hover:bg-teal-700">
                            Back to Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (booking?.bookingStatus?.id === BOOKING_STATUS_CANCELLED) {
        const expiryWindow = booking?.expiryWindow ?? '30 minutes'
        return (
            <div className="flex min-h-screen items-center justify-center bg-white p-6">
                <Card className="max-w-md">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                        <h2 className="mb-2 text-xl font-semibold text-gray-900">Booking expired</h2>
                        <p className="mb-4 text-gray-600">
                            Your booking was cancelled because payment was not completed within {expiryWindow}. Please
                            book again.
                        </p>
                        <Button onClick={handleGoHome} className="bg-teal-600 hover:bg-teal-700">
                            Search availability
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <>
            <div className="mt-[42px] min-h-screen w-full bg-white">
                <div className="mx-auto w-full rounded-lg bg-white px-4 pt-6 pb-6 md:pt-12 xl:w-[1024px] xl:px-6 xl:pb-12">
                    {/* Status Header */}
                    <div className="mb-8 text-center">
                        <div className="mb-4 flex justify-center">
                            {paymentStatus?.isPaid ? (
                                <CheckCircle className="h-16 w-16 text-green-700" />
                            ) : (
                                <Image src="/images/booking-complete.svg" alt="Saiyuan Beach Resort" width={91} height={38} />
                            )}
                        </div>
                        <h1 className="mb-2 text-3xl font-bold text-[#0E7C86]">
                            {paymentStatus?.isPaid === true ? t('subtitle') : t('subtitle2')}
                        </h1>
                        <p className="text-gray-800">{t('description')}</p>
                    </div>

                    {/* Payment Status Card */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 pt-4 pl-4">
                                {paymentStatus?.isPaid === true ? (
                                    <>
                                        <CheckCircle className="h-6 w-6 text-green-700" strokeWidth={1.5} />
                                        <span className="text-xl text-green-700">{t('subtitle4')}</span>
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="h-6 w-6 text-yellow-600" strokeWidth={1.5} />
                                        <span className="text-xl text-yellow-600">{t('subtitle3')}</span>
                                    </>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Expiry countdown — hidden once payment is paid, regardless of booking polling lag */}
                            {countdown &&
                                countdown.kind !== 'expired' &&
                                booking?.bookingStatus?.id === BOOKING_STATUS_PENDING &&
                                !paymentStatus?.isPaid && (
                                    <div className="rounded-md border border-teal-200 bg-orange-50 p-3 text-center">
                                        <p className="font-semibold text-[#0E7C86]">
                                            ⚠ Your booking will expire in{' '}
                                            {countdown.kind === 'hours'
                                                ? `${countdown.hours} hour${countdown.hours === 1 ? '' : 's'}${countdown.minutes > 0 ? ` ${countdown.minutes} minute${countdown.minutes === 1 ? '' : 's'}` : ''}`
                                                : countdown.kind === 'minutes'
                                                  ? `${countdown.value} minute${countdown.value === 1 ? '' : 's'}`
                                                  : `${countdown.value} second${countdown.value === 1 ? '' : 's'}`}
                                        </p>
                                    </div>
                                )}
                            {/* Booking Details */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-medium text-gray-600 uppercase">{t('bookingId')}</p>
                                    <p className="text-lg font-semibold text-gray-800">#{booking?.id}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-600 uppercase">{t('amount')}</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        ฿{new Intl.NumberFormat(locale).format(booking?.grandTotal ?? 0)}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-600 uppercase">{t('bookingStatus')}</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        {booking?.bookingStatus?.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-600 uppercase">{t('PaymentStatus')}</p>
                                    <p
                                        className={`text-lg  font-medium ${
                                            paymentStatus?.isPaid === true ? 'text-green-700' : 'text-[#0E7C86]'
                                        }`}>
                                        {paymentStatus?.isPaid === true ? t('subtitle4') : t('subtitle3')}
                                    </p>
                                </div>
                            </div>

                            {/* Manual mode (Pay at front desk) */}
                            {paymentStatus && !paymentStatus.isPaid && !paymentStatus.paymentUrl ? (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                                    <h4 className="mb-2 font-semibold text-gray-800">{t('payAtFrontDesk')}</h4>
                                    <p className="text-sm text-gray-800">
                                        {t('payAtFrontDeskDescription', {
                                            amount: `฿${formatPriceFixed2(booking?.grandTotal ?? 0)}`
                                        })}
                                    </p>
                                </div>
                            ) : null}

                            {/* Payment Action */}
                            {paymentStatus && !paymentStatus.isPaid && paymentStatus.paymentUrl && (
                                <div className="border-t pt-5">
                                    <div className="flex flex-col items-end gap-1.5">
                                        <button
                                            onClick={handlePayNow}
                                            className="group inline-flex cursor-pointer items-center gap-2.5 rounded-lg bg-[#0E7C86] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#0a6570] hover:shadow-md">
                                            <CreditCard className="h-4 w-4" />
                                            <span>
                                                {t('payNow')} — ฿{formatPriceFixed2(booking?.grandTotal ?? 0)}
                                            </span>
                                            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                        </button>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                            <Shield className="h-2.5 w-2.5" />
                                            <span>Secured by Stripe</span>
                                        </div>
                                    </div>
                                    {checkingPayment && (
                                        <p className="mt-2 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                {t('checkingBookingStatus')}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Success Message */}
                            {paymentStatus?.isPaid === true && (
                                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                    <h4 className="mb-2 font-semibold text-gray-800">{t('subtitle')}</h4>
                                    <p className="text-sm text-gray-800">{t('bookingAndPaymentAreComplete')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Next Steps */}
                    {bookingSteps.length > 0 && (
                        <Card className="mb-6">
                            <CardHeader>
                                <div className="px-5 pt-3 text-xl font-semibold text-gray-800">{t('nextSteps')}</div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    {bookingSteps.map((step, index) => {
                                        const IconComponent = ICON_MAP[step.icon] ?? Info
                                        return (
                                            <div key={index} className="flex items-start gap-3">
                                                <IconComponent
                                                    className="mt-0.5 h-5 w-5 text-teal-700"
                                                    strokeWidth={1.5}
                                                />
                                                <div>
                                                    <p className="text-md font-semibold text-gray-800">{step.title}</p>
                                                    <p className="text-sm text-gray-800">{step.description}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Important Information */}
                                {bookingBullets.length > 0 && (
                                    <div className="border-t border-t-gray-200 bg-white/10 p-4">
                                        <h4 className="mb-2 font-semibold text-gray-800">
                                            {t('importantInformation')}
                                        </h4>
                                        <ul className="space-y-1 text-sm text-gray-800">
                                            {bookingBullets.map((bullet, index) => (
                                                <li key={index}>• {bullet.text}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Important Information standalone (when no steps but bullets exist) */}
                    {bookingSteps.length === 0 && bookingBullets.length > 0 && (
                        <Card className="mb-6">
                            <CardContent className="p-6">
                                <h4 className="mb-2 font-semibold text-gray-800">{t('importantInformation')}</h4>
                                <ul className="space-y-1 text-sm text-gray-800">
                                    {bookingBullets.map((bullet, index) => (
                                        <li key={index}>• {bullet.text}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Button
                            onClick={handleGoHome}
                            size="lg"
                            className="flex cursor-pointer items-center gap-2 bg-teal-700 px-4 text-white hover:bg-teal-600">
                            <Home className="h-4 w-4" />
                            {t('backToHome')}
                        </Button>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        disabled
                                        className="flex cursor-not-allowed items-center gap-2 border border-gray-200 bg-gray-100 px-4 text-gray-400">
                                        <Calendar className="h-4 w-4" />
                                        {t('viewMyBookings')}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Coming Soon</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        {paymentStatus && !paymentStatus.isPaid && (
                            <Button
                                onClick={checkPaymentStatus}
                                variant="outline"
                                size="lg"
                                disabled={checkingPayment}
                                className="flex cursor-pointer items-center gap-2 border border-gray-200 bg-white text-gray-700">
                                {checkingPayment ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <CreditCard className="h-4 w-4" />
                                )}
                                {t('checkPayment')}
                            </Button>
                        )}
                    </div>

                    {/* Footer Note */}
                    <div className="mt-8 text-center text-base text-gray-800">
                        <p>{t('ifYouDonReceiveTheConfirmationEmailWithin30')}</p>
                    </div>
                </div>
            </div>
        </>
    )
}
