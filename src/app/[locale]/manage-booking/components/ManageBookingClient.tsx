'use client'

import { useTranslations } from 'next-intl'
import React, { useCallback, useEffect, useState } from 'react'

import {
    OPEN_PRE_CHECKIN_BOOKING_GUEST_API_PATH_PREFIX,
    OPEN_PRE_CHECKIN_OCR_DOCUMENT_API_PATH,
    OPEN_PRE_CHECKIN_SEARCH_API_PATH,
    OPEN_PRE_CHECKIN_SEND_OTP_API_PATH,
    OPEN_PRE_CHECKIN_VERIFY_BOOKING_CODE_API_PATH,
    OPEN_PRE_CHECKIN_VERIFY_OTP_API_PATH
} from '@/constants/path'
import { getDataWithToken, postData } from '@/lib/api'
import { getApiErrorMessage } from '@/lib/error-utils'

import type {
    ManageBookingStep,
    PreCheckinBookingDetail,
    PreCheckinBookingItem,
    RoomGuestSlot,
    RoomGuestsState} from '../types/manage-booking-types'
import { GuestForm } from './GuestForm'
import { ScanDocumentModal } from './ScanDocumentModal'
import { OtpSendStep } from './steps/OtpSendStep'
import { OtpVerifyStep } from './steps/OtpVerifyStep'
import { ResultsStep } from './steps/ResultsStep'
import { SearchStep } from './steps/SearchStep'
import { SuccessStep } from './steps/SuccessStep'
import { VerifyBookingCodeStep } from './steps/VerifyBookingCodeStep'
import { ViewOnlyStep } from './steps/ViewOnlyStep'

export type {
    PreCheckinBookingDetail,
    PreCheckinBookingDetailRoom,
    PreCheckinBookingItem
} from '../types/manage-booking-types'

const _PRE_CHECKIN_TYPE_SURNAME = 1
const PRE_CHECKIN_TYPE_OTP_EMAIL = 2

interface ManageBookingClientProps {
    preCheckinType: number
}

export function ManageBookingClient({ preCheckinType }: ManageBookingClientProps) {
    const t = useTranslations('ManageBooking')
    const tCommon = useTranslations('Common')

    const [step, setStep] = useState<ManageBookingStep>(() =>
        preCheckinType === PRE_CHECKIN_TYPE_OTP_EMAIL ? 'search' : 'verify_booking_code'
    )
    const [query, setQuery] = useState('')
    const [bookings, setBookings] = useState<PreCheckinBookingItem[]>([])
    const [selectedBooking, setSelectedBooking] = useState<PreCheckinBookingItem | null>(null)
    const [bookingCode, setBookingCode] = useState('')
    const [lastNameForVerify, setLastNameForVerify] = useState('')
    const [emailForVerify, setEmailForVerify] = useState('')
    const [emailForOtp, setEmailForOtp] = useState('')
    const [otpCode, setOtpCode] = useState('')
    const [_verifyToken, setVerifyToken] = useState<string | null>(null)

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [_guestFirstName, setGuestFirstName] = useState('')
    const [_guestLastName, setGuestLastName] = useState('')
    const [_guestEmail, setGuestEmail] = useState('')
    const [_guestPhone, _setGuestPhone] = useState('')
    const [guestEstimatedArrival, setGuestEstimatedArrival] = useState('')
    const [guestSpecialRequests, setGuestSpecialRequests] = useState('')

    const [bookingDetail, setBookingDetail] = useState<PreCheckinBookingDetail | null>(null)
    const [_loadingBookingDetail, setLoadingBookingDetail] = useState(false)
    const [roomGuests, setRoomGuests] = useState<RoomGuestsState[]>([])

    const [scanModalOpen, setScanModalOpen] = useState(false)
    const [scanTarget, setScanTarget] = useState<{ roomIndex: number; guestIndex: number } | null>(null)
    const [scanDocumentType, setScanDocumentType] = useState<1 | 2>(1)
    const [scanFile, setScanFile] = useState<File | null>(null)
    const [scanLoading, setScanLoading] = useState(false)
    const [scanError, setScanError] = useState<string | null>(null)
    const [expandedGuestKeys, setExpandedGuestKeys] = useState<Record<string, boolean>>({})

    const isOtpFlow = preCheckinType === PRE_CHECKIN_TYPE_OTP_EMAIL

    const getGuestExpandKey = useCallback((roomIndex: number, guestIndex: number) => `${roomIndex}-${guestIndex}`, [])
    const isGuestExpanded = useCallback(
        (roomIndex: number, guestIndex: number) =>
            expandedGuestKeys[getGuestExpandKey(roomIndex, guestIndex)] ?? (roomIndex === 0 && guestIndex === 0),
        [expandedGuestKeys, getGuestExpandKey]
    )
    const setGuestExpanded = useCallback((roomIndex: number, guestIndex: number, open: boolean) => {
        setExpandedGuestKeys((prev) => ({ ...prev, [getGuestExpandKey(roomIndex, guestIndex)]: open }))
    }, [getGuestExpandKey])

    const buildRoomGuestsFromDetail = useCallback((detail: PreCheckinBookingDetail): RoomGuestsState[] => {
        return detail.bookingRooms.map((room, roomIndex) => {
            const { occupancy, bookingRoomGuests } = room
            const adults = Math.max(1, occupancy.numberOfAdults ?? 1)
            const children = occupancy.numberOfChildren ?? 0
            const infants = occupancy.numberOfInfants ?? 0
            const byType = {
                adult: bookingRoomGuests.filter((g) => g.guestType === 'adult'),
                child: bookingRoomGuests.filter((g) => g.guestType === 'child'),
                infant: bookingRoomGuests.filter((g) => g.guestType === 'infant')
            }
            const slots: RoomGuestSlot[] = []
            for (let i = 0; i < adults; i++) {
                const existing = byType.adult[i]
                slots.push({
                    firstName: existing?.firstName ?? '',
                    lastName: existing?.lastName ?? '',
                    email: existing?.email ?? '',
                    phone: existing?.mobilePhone ?? '',
                    guestType: 'adult',
                    isMainGuest: roomIndex === 0 && i === 0,
                    dateOfBirth: existing?.dateOfBirth ?? undefined,
                    addressLine: existing?.addressLine ?? undefined,
                    city: existing?.city ?? undefined,
                    documentNumber: existing?.documentNumber ?? undefined,
                    documentType: existing?.documentType ?? undefined
                })
            }
            for (let i = 0; i < children; i++) {
                const existing = byType.child[i]
                slots.push({
                    firstName: existing?.firstName ?? '',
                    lastName: existing?.lastName ?? '',
                    email: existing?.email ?? '',
                    phone: existing?.mobilePhone ?? '',
                    guestType: 'child',
                    isMainGuest: false,
                    dateOfBirth: existing?.dateOfBirth ?? undefined,
                    addressLine: existing?.addressLine ?? undefined,
                    city: existing?.city ?? undefined,
                    documentNumber: existing?.documentNumber ?? undefined,
                    documentType: existing?.documentType ?? undefined
                })
            }
            for (let i = 0; i < infants; i++) {
                const existing = byType.infant[i]
                slots.push({
                    firstName: existing?.firstName ?? '',
                    lastName: existing?.lastName ?? '',
                    email: existing?.email ?? '',
                    phone: existing?.mobilePhone ?? '',
                    guestType: 'infant',
                    isMainGuest: false,
                    dateOfBirth: existing?.dateOfBirth ?? undefined,
                    addressLine: existing?.addressLine ?? undefined,
                    city: existing?.city ?? undefined,
                    documentNumber: existing?.documentNumber ?? undefined,
                    documentType: existing?.documentType ?? undefined
                })
            }
            const roomLabel = [room.roomClassName, room.roomNumber ?? room.roomName].filter(Boolean).join(' – ') || room.roomClassName
            return {
                bookingRoomId: room.id,
                roomLabel,
                roomClassName: room.roomClassName,
                occupancy: { numberOfAdults: adults, numberOfChildren: children, numberOfInfants: infants },
                guests: slots
            }
        })
    }, [])

    useEffect(() => {
        if (step !== 'guest_form' || !selectedBooking) return
        let cancelled = false
        setLoadingBookingDetail(true)
        setError(null)
        getDataWithToken<PreCheckinBookingDetail>(
            `${OPEN_PRE_CHECKIN_BOOKING_GUEST_API_PATH_PREFIX}/${selectedBooking.id}`
        )
            .then((data) => {
                if (!cancelled) {
                    setBookingDetail(data)
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(getApiErrorMessage(err, tCommon('error')))
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoadingBookingDetail(false)
                }
            })
        return () => {
            cancelled = true
        }
    }, [step, selectedBooking?.id, tCommon])

    useEffect(() => {
        if (bookingDetail) {
            setRoomGuests(buildRoomGuestsFromDetail(bookingDetail))
        } else {
            setRoomGuests([])
        }
    }, [bookingDetail, buildRoomGuestsFromDetail])

    const handleSearch = useCallback(async () => {
        const q = query.trim()
        if (!q) return
        setIsLoading(true)
        setError(null)
        try {
            const result = await getDataWithToken<{ bookings?: PreCheckinBookingItem[] }>(
                `${OPEN_PRE_CHECKIN_SEARCH_API_PATH}?q=${encodeURIComponent(q)}`
            )
            const list = result?.bookings ?? (Array.isArray(result) ? result : [])
            setBookings(Array.isArray(list) ? list : [])
            setStep('results')
        } catch (err) {
            setError(getApiErrorMessage(err, tCommon('error')))
            setBookings([])
        } finally {
            setIsLoading(false)
        }
    }, [query, tCommon])

    const handleSelectBooking = useCallback(
        (booking: PreCheckinBookingItem) => {
            setSelectedBooking(booking)
            setGuestFirstName(booking.guestFirstName ?? '')
            setGuestLastName(booking.guestLastName ?? '')
            setGuestEmail(booking.guestEmail ?? emailForOtp)
            if (isOtpFlow) {
                setEmailForOtp(booking.guestEmail ?? emailForOtp)
                setStep('otp_send')
            } else {
                setStep('view_only')
            }
        },
        [isOtpFlow, emailForOtp]
    )

    const handleVerifyBookingCode = useCallback(async () => {
        const code = bookingCode.trim()
        const last = lastNameForVerify.trim()
        const em = emailForVerify.trim()
        if (!code) {
            setError(t('bookingCodeRequired'))
            return
        }
        if (!last && !em) {
            setError(t('lastNameOrEmailRequired'))
            return
        }
        setIsLoading(true)
        setError(null)
        try {
            const result = await postData<{
                verified: boolean
                bookingId: number
                booking: PreCheckinBookingItem
            }>(OPEN_PRE_CHECKIN_VERIFY_BOOKING_CODE_API_PATH, {
                bookingCode: code,
                ...(last ? { lastName: last } : {}),
                ...(em ? { email: em } : {})
            })
            if (result?.verified && result?.booking) {
                setSelectedBooking(result.booking)
                setGuestFirstName(result.booking.guestFirstName ?? '')
                setGuestLastName(result.booking.guestLastName ?? '')
                setGuestEmail(result.booking.guestEmail ?? '')
                setStep('guest_form')
            } else {
                setError(tCommon('error'))
            }
        } catch (err) {
            setError(getApiErrorMessage(err, tCommon('error')))
        } finally {
            setIsLoading(false)
        }
    }, [bookingCode, lastNameForVerify, emailForVerify, t, tCommon])

    const handleSendOtp = useCallback(async () => {
        if (!selectedBooking) return
        const email = (emailForOtp || selectedBooking.guestEmail || '').trim()
        if (!email) {
            setError('Email is required')
            return
        }
        setIsLoading(true)
        setError(null)
        try {
            await postData(OPEN_PRE_CHECKIN_SEND_OTP_API_PATH, {
                bookingId: selectedBooking.id,
                email
            })
            setStep('otp_verify')
        } catch (err) {
            setError(getApiErrorMessage(err, tCommon('error')))
        } finally {
            setIsLoading(false)
        }
    }, [selectedBooking, emailForOtp, tCommon])

    const handleVerifyOtp = useCallback(async () => {
        if (!selectedBooking || !otpCode.trim()) return
        const email = (emailForOtp || selectedBooking.guestEmail || '').trim()
        if (!email) return
        setIsLoading(true)
        setError(null)
        try {
            const result = await postData<{ verified?: boolean; token?: string }>(
                OPEN_PRE_CHECKIN_VERIFY_OTP_API_PATH,
                {
                    bookingId: selectedBooking.id,
                    email,
                    code: otpCode.trim()
                }
            )
            if (result?.verified && result?.token) {
                setVerifyToken(result.token)
                setStep('guest_form')
            } else {
                setError('Invalid or expired code')
            }
        } catch (err) {
            setError(getApiErrorMessage(err, tCommon('error')))
        } finally {
            setIsLoading(false)
        }
    }, [selectedBooking, emailForOtp, otpCode, tCommon])

    const updateRoomGuest = useCallback(
        (roomIndex: number, guestIndex: number, field: keyof RoomGuestSlot, value: string | boolean | number | undefined) => {
            setRoomGuests((prev) => {
                const next = prev.map((r, ri) => {
                    if (ri !== roomIndex) return r
                    return {
                        ...r,
                        guests: r.guests.map((g, gi) => {
                            if (gi !== guestIndex) return g
                            return { ...g, [field]: value }
                        })
                    }
                })
                return next
            })
        },
        []
    )

    const handleSubmitGuests = useCallback(async () => {
        if (!selectedBooking) return
        setIsLoading(true)
        setError(null)
        const path = `${OPEN_PRE_CHECKIN_BOOKING_GUEST_API_PATH_PREFIX}/${selectedBooking.id}/guests`
        const body = {
            rooms: roomGuests.map((r) => ({
                bookingRoomId: r.bookingRoomId,
                guests: r.guests
                    .filter((g) => g.firstName.trim() || g.lastName.trim() || g.email.trim())
                    .map((g) => ({
                        firstName: g.firstName.trim(),
                        lastName: g.lastName.trim(),
                        email: g.email.trim() || undefined,
                        phone: g.phone.trim() || undefined,
                        guestType: g.guestType,
                        isMainGuest: g.isMainGuest,
                        dateOfBirth: g.dateOfBirth?.trim() || undefined,
                        addressLine: g.addressLine?.trim() || undefined,
                        city: g.city?.trim() || undefined,
                        documentNumber: g.documentNumber?.trim() || undefined,
                        documentType: g.documentType != null ? g.documentType : undefined
                    }))
            })),
            guestEstimatedArrival: guestEstimatedArrival.trim() || undefined,
            guestSpecialRequests: guestSpecialRequests.trim() || undefined
        }
        try {
            await postData(path, body)
            setStep('success')
        } catch (err) {
            setError(getApiErrorMessage(err, tCommon('error')))
        } finally {
            setIsLoading(false)
        }
    }, [
        selectedBooking,
        roomGuests,
        guestEstimatedArrival,
        guestSpecialRequests,
        tCommon
    ])

    const handleBackToSearch = useCallback(() => {
        setStep(isOtpFlow ? 'search' : 'verify_booking_code')
        setQuery('')
        setBookings([])
        setSelectedBooking(null)
        setBookingDetail(null)
        setRoomGuests([])
        setBookingCode('')
        setLastNameForVerify('')
        setEmailForVerify('')
        setEmailForOtp('')
        setOtpCode('')
        setVerifyToken(null)
        setError(null)
    }, [isOtpFlow])

    const handleOpenScanModal = useCallback((roomIndex: number, guestIndex: number) => {
        setScanTarget({ roomIndex, guestIndex })
        setScanDocumentType(1)
        setScanFile(null)
        setScanError(null)
        setScanModalOpen(true)
    }, [])

    const handleCloseScanModal = useCallback(() => {
        setScanModalOpen(false)
        setScanTarget(null)
        setScanFile(null)
        setScanError(null)
    }, [])

    const handleScanUpload = useCallback(async () => {
        if (scanTarget == null || !scanFile) return
        const { roomIndex, guestIndex } = scanTarget
        setScanLoading(true)
        setScanError(null)
        const formData = new FormData()
        formData.append('file', scanFile)
        try {
            const result = await postData<{ success: boolean; data?: Record<string, string>; message?: string; error?: string }>(
                OPEN_PRE_CHECKIN_OCR_DOCUMENT_API_PATH,
                formData as unknown as object
            )
            if (result?.success && result?.data) {
                const d = result.data
                setRoomGuests((prev) =>
                    prev.map((r, ri) => {
                        if (ri !== roomIndex) return r
                        return {
                            ...r,
                            guests: r.guests.map((g, gi) => {
                                if (gi !== guestIndex) return g
                                return {
                                    ...g,
                                    firstName: d.firstName ?? g.firstName,
                                    lastName: d.lastName ?? g.lastName,
                                    dateOfBirth: d.date_of_birth ?? g.dateOfBirth,
                                    addressLine: d.address_line ?? g.addressLine,
                                    city: d.city ?? g.city,
                                    documentNumber: d.document_number ?? g.documentNumber,
                                    documentType: scanDocumentType
                                }
                            })
                        }
                    })
                )
                handleCloseScanModal()
            } else {
                setScanError(result?.message ?? result?.error ?? tCommon('error'))
            }
        } catch (err) {
            setScanError(getApiErrorMessage(err, tCommon('error')))
        } finally {
            setScanLoading(false)
        }
    }, [scanTarget, scanFile, scanDocumentType, handleCloseScanModal, tCommon])

    const searchPlaceholder = isOtpFlow ? t('searchPlaceholderEmail') : t('searchPlaceholderSurname')

    return (
        <div className="mt-[42px] min-h-screen w-full bg-white">
            <div className="mx-auto w-full max-w-2xl rounded-lg bg-white px-4 py-8 xl:px-6">
                <div className="mb-8">
                    <h1 className="mb-2 text-2xl font-bold text-[#0E7C86] xl:text-3xl">{t('title')}</h1>
                    <p className="text-gray-600">{t('description')}</p>
                </div>

                {error && (
                    <div
                        className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {step === 'search' && (
                    <SearchStep
                        query={query}
                        onQueryChange={setQuery}
                        onSearch={handleSearch}
                        isLoading={isLoading}
                        placeholder={searchPlaceholder}
                        title={t('selectBooking')}
                        searchButtonLabel={t('searchButton')}
                        searchingLabel={t('searching')}
                    />
                )}

                {step === 'verify_booking_code' && (
                    <VerifyBookingCodeStep
                        bookingCode={bookingCode}
                        onBookingCodeChange={setBookingCode}
                        lastName={lastNameForVerify}
                        onLastNameChange={setLastNameForVerify}
                        email={emailForVerify}
                        onEmailChange={setEmailForVerify}
                        onVerify={handleVerifyBookingCode}
                        isLoading={isLoading}
                        title={t('verifyWithBookingCode')}
                        description={t('verifyWithBookingCodeDescription')}
                        bookingCodeLabel={t('bookingCode')}
                        bookingCodePlaceholder={t('bookingCodePlaceholder')}
                        lastNameLabel={t('lastName')}
                        lastNamePlaceholder={t('searchPlaceholderSurname')}
                        emailLabel={t('email')}
                        emailPlaceholder={t('searchPlaceholderEmail')}
                        lastNameOrEmailHint={t('lastNameOrEmailHint')}
                        verifyButtonLabel={t('verifyBookingCode')}
                        verifyingLabel={t('verifying')}
                    />
                )}

                {step === 'results' && (
                    <ResultsStep
                        bookings={bookings}
                        onSelectBooking={handleSelectBooking}
                        onBackToSearch={handleBackToSearch}
                        title={t('selectBooking')}
                        backToSearchLabel={t('backToSearch')}
                        noResultsLabel={t('noResults')}
                    />
                )}

                {step === 'otp_send' && selectedBooking && (
                    <OtpSendStep
                        email={emailForOtp || selectedBooking.guestEmail || ''}
                        onEmailChange={setEmailForOtp}
                        onSend={handleSendOtp}
                        isLoading={isLoading}
                        title={t('sendOtp')}
                        backToSearchLabel={t('backToSearch')}
                        emailLabel={t('email')}
                        sendButtonLabel={t('sendOtp')}
                        sendingLabel={t('sendingOtp')}
                        onBack={() => setStep('results')}
                    />
                )}

                {step === 'otp_verify' && selectedBooking && (
                    <OtpVerifyStep
                        otpCode={otpCode}
                        onOtpCodeChange={setOtpCode}
                        onVerify={handleVerifyOtp}
                        isLoading={isLoading}
                        isCodeComplete={otpCode.length === 6}
                        title={t('enterOtp')}
                        description={t('otpSent')}
                        placeholder="000000"
                        verifyButtonLabel={t('verifyOtp')}
                        verifyingLabel={t('verifying')}
                    />
                )}

                {step === 'guest_form' && selectedBooking && (
                    <GuestForm
                        bookingDetail={bookingDetail}
                        roomGuests={roomGuests}
                        isGuestExpanded={isGuestExpanded}
                        setGuestExpanded={setGuestExpanded}
                        updateRoomGuest={updateRoomGuest}
                        guestEstimatedArrival={guestEstimatedArrival}
                        onGuestEstimatedArrivalChange={setGuestEstimatedArrival}
                        guestSpecialRequests={guestSpecialRequests}
                        onGuestSpecialRequestsChange={setGuestSpecialRequests}
                        onSubmit={handleSubmitGuests}
                        isLoading={isLoading}
                        onOpenScanModal={handleOpenScanModal}
                        onBackToSearch={handleBackToSearch}
                        isSubmitDisabled={
                            isLoading ||
                            roomGuests.length === 0 ||
                            !(roomGuests[0]?.guests[0]
                                ? roomGuests[0].guests[0].firstName.trim() &&
                                  roomGuests[0].guests[0].lastName.trim() &&
                                  roomGuests[0].guests[0].email.trim()
                                : false)
                        }
                    />
                )}

                {step === 'view_only' && selectedBooking && (
                    <ViewOnlyStep
                        selectedBooking={selectedBooking}
                        onBackToSearch={handleBackToSearch}
                        title={t('selectBooking')}
                        backToSearchLabel={t('backToSearch')}
                        noticeText={t('viewOnlyNotice')}
                    />
                )}

                {step === 'success' && (
                    <SuccessStep
                        onBackToSearch={handleBackToSearch}
                        title={t('successTitle')}
                        message={t('successMessage')}
                        backToSearchLabel={t('backToSearch')}
                    />
                )}

                <ScanDocumentModal
                    open={scanModalOpen}
                    onClose={handleCloseScanModal}
                    documentType={scanDocumentType}
                    onDocumentTypeChange={setScanDocumentType}
                    file={scanFile}
                    onFileChange={(file) => {
                        setScanFile(file)
                        setScanError(null)
                    }}
                    error={scanError}
                    loading={scanLoading}
                    onUpload={handleScanUpload}
                    title={t('scanDocument')}
                    selectDocumentTypeLabel={t('selectDocumentType')}
                    documentTypeIdCard={t('documentTypeIdCard')}
                    documentTypePassport={t('documentTypePassport')}
                    uploadImageLabel={t('uploadImage')}
                    cancelLabel={tCommon('cancel')}
                    uploadLabel={t('upload')}
                    uploadingLabel={t('uploading')}
                    closeAriaLabel={tCommon('close')}
                />
            </div>
        </div>
    )
}
