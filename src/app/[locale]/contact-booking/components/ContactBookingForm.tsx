'use client'

import { format, parse } from 'date-fns'
import { Calendar as CalendarIcon, Loader2, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useMemo, useState } from 'react'
import { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { getMinCheckInDate } from '@/lib/utils'
import { RoomSelection } from '@/types/booking'
import { AvailableRoomClass } from '@/types/room-management'

import { ContactRoomClassCard } from './ContactRoomClassCard'

interface BookingDetails {
    checkInDate: string
    checkOutDate: string
    adults: string
    children: string
    infants?: string
}

interface GuestInfo {
    firstName: string
    lastName: string
    email: string
    phone: string
    estimatedArrivalTime?: string
    customerMessage?: string
}

interface ContactBookingFormProps {
    bookingDetails: BookingDetails
    guestInfo: GuestInfo
    selectedRooms: RoomSelection
    roomClasses: AvailableRoomClass[]
    isLoading: boolean
    isSubmitting: boolean
    onUpdateBookingDetails: (details: Partial<BookingDetails>) => void
    onUpdateGuestInfo: (field: keyof GuestInfo, value: string) => void
    onUpdateRoomQuantity: (roomClassId: number, quantity: number) => void
    onFetchRoomAvailability: (params: {
        checkIn: string
        checkOut: string
        adults: string
        children: string
    }) => Promise<AvailableRoomClass[]>
    onSubmit: () => Promise<void>
}

export function ContactBookingForm({
    bookingDetails,
    guestInfo,
    selectedRooms,
    roomClasses,
    isLoading,
    isSubmitting,
    onUpdateBookingDetails,
    onUpdateGuestInfo,
    onUpdateRoomQuantity,
    onFetchRoomAvailability,
    onSubmit
}: ContactBookingFormProps) {
    const t = useTranslations('ContactBooking')
    const [openCalendar, setOpenCalendar] = useState(false)
    const [openGuests, setOpenGuests] = useState(false)
    const [hasDateChanges, setHasDateChanges] = useState(false)
    const minCheckInDate = getMinCheckInDate()

    const dateRange: DateRange | undefined = useMemo(() => {
        return {
            from: bookingDetails.checkInDate ? parse(bookingDetails.checkInDate, 'yyyy-MM-dd', new Date()) : undefined,
            to: bookingDetails.checkOutDate ? parse(bookingDetails.checkOutDate, 'yyyy-MM-dd', new Date()) : undefined
        }
    }, [bookingDetails.checkInDate, bookingDetails.checkOutDate])

    const adults = parseInt(bookingDetails.adults) || 1
    const children = parseInt(bookingDetails.children) || 0
    const infants = parseInt(bookingDetails.infants || '0') || 0

    const handleSelectDateRange = (value: DateRange | undefined) => {
        if (value?.from) {
            onUpdateBookingDetails({ checkInDate: format(value.from, 'yyyy-MM-dd') })
            setHasDateChanges(true)
        }
        if (value?.to) {
            onUpdateBookingDetails({ checkOutDate: format(value.to, 'yyyy-MM-dd') })
            setHasDateChanges(true)
        }
    }

    const handleApplyDateChanges = async () => {
        if (bookingDetails.checkInDate && bookingDetails.checkOutDate) {
            await onFetchRoomAvailability({
                checkIn: bookingDetails.checkInDate,
                checkOut: bookingDetails.checkOutDate,
                adults: bookingDetails.adults,
                children: bookingDetails.children
            })
            setHasDateChanges(false)
        }
    }

    const incrementAdults = () => {
        onUpdateBookingDetails({ adults: Math.min(adults + 1, 10).toString() })
        setHasDateChanges(true)
    }
    const decrementAdults = () => {
        onUpdateBookingDetails({ adults: Math.max(adults - 1, 1).toString() })
        setHasDateChanges(true)
    }
    const incrementChildren = () => {
        onUpdateBookingDetails({ children: Math.min(children + 1, 10).toString() })
        setHasDateChanges(true)
    }
    const decrementChildren = () => {
        onUpdateBookingDetails({ children: Math.max(children - 1, 0).toString() })
        setHasDateChanges(true)
    }
    const incrementInfants = () => {
        onUpdateBookingDetails({ infants: Math.min(infants + 1, 10).toString() })
    }
    const decrementInfants = () => {
        onUpdateBookingDetails({ infants: Math.max(infants - 1, 0).toString() })
    }

    const totalSelectedRooms = Object.values(selectedRooms).reduce((sum, qty) => sum + qty, 0)
    const isFormValid =
        bookingDetails.checkInDate &&
        bookingDetails.checkOutDate &&
        guestInfo.firstName &&
        guestInfo.lastName &&
        guestInfo.email &&
        totalSelectedRooms > 0

    return (
        <div className="space-y-6">
            <Card className="mb-6 border-none py-0 shadow-none">
                <CardContent className="p-0">
                    <div className="mb-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <h3 className="text-xl font-bold text-[#0E7C86] md:text-2xl">{t('bookingDetails')}</h3>
                        {hasDateChanges && bookingDetails.checkInDate && bookingDetails.checkOutDate && (
                            <Button
                                onClick={handleApplyDateChanges}
                                disabled={isLoading}
                                size="sm"
                                className="bg-[#0a6570] px-6 font-semibold text-white hover:bg-[#0E7C86]">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t('updating')}
                                    </>
                                ) : (
                                    t('updateAvailability')
                                )}
                            </Button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-3 md:flex-row">
                            <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                                <PopoverTrigger asChild>
                                    <div className="flex flex-1 flex-row gap-3">
                                        <button className="flex flex-1 cursor-pointer items-center justify-start gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-all hover:border-orange-500 hover:bg-gray-50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none">
                                            <CalendarIcon size={18} className="flex-shrink-0 text-[#0a6570]" />
                                            <span className="text-sm font-medium">
                                                {dateRange?.from
                                                    ? format(dateRange.from, 'MMM dd, yyyy')
                                                    : t('checkInDate')}
                                            </span>
                                        </button>
                                        <button className="flex flex-1 cursor-pointer items-center justify-start gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-all hover:border-orange-500 hover:bg-gray-50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none">
                                            <CalendarIcon size={18} className="flex-shrink-0 text-[#0a6570]" />
                                            <span className="text-sm font-medium">
                                                {dateRange?.to
                                                    ? format(dateRange.to, 'MMM dd, yyyy')
                                                    : t('checkOutDate')}
                                            </span>
                                        </button>
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto overflow-hidden rounded-xl border-0 bg-black/80 p-0 shadow-xl"
                                    align="start">
                                    <Calendar
                                        variant="header"
                                        mode="range"
                                        selected={dateRange}
                                        onSelect={handleSelectDateRange}
                                        numberOfMonths={2}
                                        captionLayout="dropdown"
                                        disabled={{ before: minCheckInDate }}
                                        showOutsideDays={false}
                                        className="[&_.rdp-day_range_end]:bg-[#0E7C86] [&_.rdp-day_range_end]:text-white [&_.rdp-day_range_middle]:bg-teal-50 [&_.rdp-day_range_middle]:text-orange-900 [&_.rdp-day_range_start]:bg-[#0E7C86] [&_.rdp-day_range_start]:text-white [&_.rdp-day_selected]:bg-[#0E7C86] [&_.rdp-day_selected]:text-white"
                                    />
                                </PopoverContent>
                            </Popover>

                            <Popover open={openGuests} onOpenChange={setOpenGuests}>
                                <PopoverTrigger asChild>
                                    <button className="flex cursor-pointer items-center justify-start gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 transition-all hover:border-orange-500 hover:bg-gray-50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none md:min-w-[200px]">
                                        <Users size={18} className="flex-shrink-0 text-[#0a6570]" />
                                        <span className="text-sm font-medium">
                                            {adults} {t('adults')}/{children} {t('children')}
                                            {infants > 0 && `/${infants} ${t('infants')}`}
                                        </span>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-80 rounded-lg border border-gray-200 bg-black/80 p-5 shadow-xl ring-0"
                                    align="end">
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                                            <div>
                                                <div className="text-sm font-semibold text-white">{t('adults')}</div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={decrementAdults}
                                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-200 text-[#0a6570] transition-all hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                                    disabled={adults <= 1}>
                                                    <svg
                                                        className="h-5 w-5"
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
                                                            strokeWidth="2"
                                                            d="M5 12h14"
                                                        />
                                                    </svg>
                                                </button>
                                                <span className="w-10 text-center text-base font-semibold text-white">
                                                    {adults}
                                                </span>
                                                <button
                                                    onClick={incrementAdults}
                                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-200 text-[#0a6570] transition-all hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                                    disabled={adults >= 10}>
                                                    <svg
                                                        className="h-5 w-5"
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
                                                            strokeWidth="2"
                                                            d="M5 12h14m-7 7V5"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                                            <div>
                                                <div className="text-sm font-semibold text-white">{t('children')}</div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={decrementChildren}
                                                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-orange-200 text-[#0a6570] transition-all hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                                    disabled={children <= 0}>
                                                    <svg
                                                        className="h-5 w-5"
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
                                                            strokeWidth="2"
                                                            d="M5 12h14"
                                                        />
                                                    </svg>
                                                </button>
                                                <span className="w-10 text-center text-base font-semibold text-white">
                                                    {children}
                                                </span>
                                                <button
                                                    onClick={incrementChildren}
                                                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-orange-200 text-[#0a6570] transition-all hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                                    disabled={children >= 10}>
                                                    <svg
                                                        className="h-5 w-5"
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
                                                            strokeWidth="2"
                                                            d="M5 12h14m-7 7V5"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-semibold text-white">{t('infants')}</div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={decrementInfants}
                                                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-orange-200 text-[#0a6570] transition-all hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                                    disabled={infants <= 0}>
                                                    <svg
                                                        className="h-5 w-5"
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
                                                            strokeWidth="2"
                                                            d="M5 12h14"
                                                        />
                                                    </svg>
                                                </button>
                                                <span className="w-10 text-center text-base font-semibold text-white">
                                                    {infants}
                                                </span>
                                                <button
                                                    onClick={incrementInfants}
                                                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-orange-200 text-[#0a6570] transition-all hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                                    disabled={infants >= 10}>
                                                    <svg
                                                        className="h-5 w-5"
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
                                                            strokeWidth="2"
                                                            d="M5 12h14m-7 7V5"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {bookingDetails.checkInDate && bookingDetails.checkOutDate && (
                <Card className="mb-6 border-none pt-0 pb-6 shadow-none">
                    <div className="mb-4 h-full w-full px-0">
                        <h3 className="text-lg font-semibold text-[#0E7C86]">{t('selectRooms')}</h3>
                    </div>
                    <CardContent className="px-0">
                        {isLoading ? (
                            <div className="py-12 text-center">
                                <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[#0a6570]" />
                                <p className="text-gray-600">{t('loadingRooms')}</p>
                            </div>
                        ) : roomClasses.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {roomClasses.map((roomClass) => (
                                    <ContactRoomClassCard
                                        key={roomClass.id}
                                        roomClass={roomClass}
                                        onUpdateQuantity={onUpdateRoomQuantity}
                                        selectedQuantity={selectedRooms[roomClass.id] || 0}
                                    />
                                ))}
                            </div>
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
            )}

            <Card className="mb-6 border-none px-0 py-0 shadow-none">
                <CardHeader className="px-0">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#0E7C86]">
                        {t('guestInformation')}
                    </CardTitle>
                    <span className="text-sm font-light text-gray-500">{t('guestInformationDescription')}</span>
                </CardHeader>
                <CardContent className="space-y-4 px-0">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">
                                {t('firstName')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="firstName"
                                type="text"
                                value={guestInfo.firstName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    onUpdateGuestInfo('firstName', e.target.value)
                                }
                                placeholder={t('enterFirstName')}
                                required
                                className="w-full rounded-md border border-gray-600 px-3 py-2 text-gray-700 placeholder:text-sm placeholder:font-light placeholder:text-gray-400 focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">
                                {t('lastName')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="lastName"
                                type="text"
                                value={guestInfo.lastName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    onUpdateGuestInfo('lastName', e.target.value)
                                }
                                placeholder={t('enterLastName')}
                                required
                                className="w-full rounded-md border border-gray-600 px-3 py-2 text-gray-700 placeholder:text-sm placeholder:font-light placeholder:text-gray-400 focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                                {t('email')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={guestInfo.email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    onUpdateGuestInfo('email', e.target.value)
                                }
                                placeholder="example@email.com"
                                required
                                className="w-full rounded-md border border-gray-600 px-3 py-2 text-gray-700 placeholder:text-sm placeholder:font-light placeholder:text-gray-400 focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                                {t('phone')}
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                value={guestInfo.phone}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    onUpdateGuestInfo('phone', e.target.value)
                                }
                                placeholder="08X-XXX-XXXX"
                                className="w-full rounded-md border border-gray-600 px-3 py-2 text-gray-700 placeholder:text-sm placeholder:font-light placeholder:text-gray-400 focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="estimatedArrival" className="mb-1 block text-sm font-medium text-gray-700">
                            {t('estimatedArrival')}
                            <span className="mb-2 ml-2 text-xs font-normal text-gray-500">
                                ({t('checkInTime')}: 14:00)
                            </span>
                        </label>
                        <select
                            id="estimatedArrival"
                            value={guestInfo.estimatedArrivalTime || ''}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                onUpdateGuestInfo('estimatedArrivalTime', e.target.value)
                            }
                            className="w-full cursor-pointer rounded-md border border-gray-600 bg-white px-3 py-2 text-gray-700 focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none">
                            <option value="">{t('selectTime') || 'Select time'}</option>
                            <option value="00:00">00:00 - 03:00</option>
                            <option value="03:01">03:01 - 06:00</option>
                            <option value="06:01">06:01 - 09:00</option>
                            <option value="09:01">09:01 - 12:00</option>
                            <option value="12:01">12:01 - 15:00</option>
                            <option value="15:01">15:01 - 18:00</option>
                            <option value="18:01">18:01 - 21:00</option>
                            <option value="21:01">21:01 - 23:59</option>
                        </select>
                        <div className="text-xs font-light text-gray-500">{t('noTimeProvided')}</div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="customerMessage" className="mb-1 block text-sm font-medium text-gray-700">
                            {t('customerMessage')}
                        </label>
                        <textarea
                            id="customerMessage"
                            value={guestInfo.customerMessage || ''}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                onUpdateGuestInfo('customerMessage', e.target.value)
                            }
                            placeholder={t('customerMessagePlaceholder')}
                            rows={4}
                            className="resize-vertical w-full rounded-md border border-gray-600 px-3 py-2 text-gray-700 placeholder:text-sm placeholder:font-light placeholder:text-gray-400 focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="sticky bottom-0 -mx-4 mt-8 border-t border-gray-200 bg-white px-4 pt-4 pb-4 xl:-mx-6 xl:px-6">
                <div className="flex justify-end gap-4">
                    <Button
                        onClick={onSubmit}
                        disabled={!isFormValid || isSubmitting}
                        className="bg-[#0a6570] px-8 py-2 font-semibold text-white hover:bg-[#0E7C86] disabled:cursor-not-allowed disabled:opacity-50">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('submitting')}
                            </>
                        ) : (
                            t('submitBooking')
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
