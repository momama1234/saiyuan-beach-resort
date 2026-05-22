'use client'

import { addDays, format, isBefore, isEqual } from 'date-fns'
import { Calendar as CalendarIcon, Users, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { DateRange } from 'react-day-picker'

import LanguageSwitcher from '@/components/LanguageSwitcher'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useReservation } from '@/contexts/ReservationContext'
import { usePathname } from '@/i18n/routing'
import { MAX_RESERVATION_ADULTS, MAX_RESERVATION_CHILDREN } from '@/lib/reservation-limits'
import { getMinCheckInDate } from '@/lib/utils'
export const ReservationSection = () => {
    const t = useTranslations('Reservations')
    const c = useTranslations('Common')
    const pathname = usePathname()
    const locale = useLocale()
    const localePrefix = locale === 'en' ? '' : `/${locale}`
    const { reservationData, setDateRange, setAdults, setChildren } = useReservation()
    const [openCalendar, setOpenCalendar] = useState(false)
    const [openGuests, setOpenGuests] = useState(false)
    const [alertOpen, setAlertOpen] = useState(false)
    const [alertTitle, setAlertTitle] = useState('')
    const [alertDescription, setAlertDescription] = useState('')
    const minCheckInDate = getMinCheckInDate()
    const thisMonth = new Date()
    const endMonth = new Date(thisMonth.getFullYear() + 3, 11, 31)

    // Use context data
    const { dateRange, adults, children } = reservationData

    // Hide reservation section on reservations page
    if (pathname === '/reservations') {
        return null
    }

    // This function will be called when a date (or range) is selected
    const handleSelectDateRange = (value: DateRange | undefined) => {
        setDateRange(value)
    }

    const incrementAdults = () => setAdults(Math.min(adults + 1, MAX_RESERVATION_ADULTS))
    const decrementAdults = () => setAdults(Math.max(adults - 1, 1))
    const incrementChildren = () => setChildren(Math.min(children + 1, MAX_RESERVATION_CHILDREN))
    const decrementChildren = () => setChildren(Math.max(children - 1, 0))

    const handleReservation = () => {
        // Validation
        if (!dateRange?.from) {
            setAlertTitle(t('alert.title-checkin'))
            setAlertDescription(t('alert.description-checkin'))
            setAlertOpen(true)
            return
        }
        if (!dateRange?.to) {
            setAlertTitle(t('alert.title-checkout'))
            setAlertDescription(t('alert.description-checkout'))
            setAlertOpen(true)
            return
        }
        if (adults < 1) {
            setAlertTitle(t('alert.title-adults'))
            setAlertDescription(t('alert.description-adults'))
            setAlertOpen(true)
            return
        }

        // Check if check-out is after check-in
        if (dateRange.to && (isBefore(dateRange.to, dateRange.from) || isEqual(dateRange.to, dateRange.from))) {
            setAlertTitle(t('alert.title-daterange'))
            setAlertDescription(t('alert.description-daterange'))
            setAlertOpen(true)
            return
        }

        const params = new URLSearchParams()
        const { from, to } = dateRange

        if (from && to) {
            const checkInDate = format(from, 'yyyy-MM-dd')
            const checkOutDate = format(to, 'yyyy-MM-dd')

            params.set('checkIn', checkInDate)
            params.set('checkOut', checkOutDate)
            params.set('adults', adults.toString())
            params.set('children', children.toString())
            window.open(`${localePrefix}/reservations?${params.toString()}`, '_blank')
        }
    }

    const handleMobileReservation = () => {
        const today = new Date()
        const tomorrow = addDays(today, 1)

        const checkInDate = format(today, 'yyyy-MM-dd')
        const checkOutDate = format(tomorrow, 'yyyy-MM-dd')

        const params = new URLSearchParams()
        params.set('checkIn', checkInDate)
        params.set('checkOut', checkOutDate)
        params.set('adults', '2')
        params.set('children', '0')

        window.open(`${localePrefix}/reservations?${params.toString()}`, '_blank')
    }

    return (
        <>
            <div className="hidden h-[42px] divide-gray-300 rounded-none md:flex">
                <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                    <PopoverAnchor asChild>
                        <div className="flex">
                            <button
                                id="calendar-button-1"
                                type="button"
                                onClick={() => setOpenCalendar(!openCalendar)}
                                className="flex min-w-[120px] cursor-pointer items-center gap-1 border-r-1 border-r-gray-300 bg-white px-2 text-sm font-normal whitespace-nowrap text-neutral-800 transition-colors hover:bg-gray-100">
                                <CalendarIcon size={16} className="mr-1 text-neutral-800" />
                                {dateRange?.from ? format(dateRange.from, 'MMM dd, yyyy') : t('checkIn')}
                            </button>
                            <button
                                id="calendar-button-2"
                                type="button"
                                onClick={() => setOpenCalendar(!openCalendar)}
                                className="flex min-w-[120px] cursor-pointer items-center gap-1 border-r-1 border-r-gray-300 bg-white px-2 text-sm font-normal whitespace-nowrap text-neutral-800 transition-colors hover:bg-gray-100">
                                <CalendarIcon size={16} className="mr-1 text-neutral-800" />
                                {dateRange?.to ? format(dateRange.to, 'MMM dd, yyyy') : t('checkOut')}
                            </button>
                        </div>
                    </PopoverAnchor>
                    <PopoverContent className="-ml-[1px] w-auto overflow-hidden bg-black p-0 opacity-80" align="start">
                        <Calendar
                            variant="header"
                            mode="range"
                            selected={dateRange}
                            onSelect={handleSelectDateRange}
                            numberOfMonths={2}
                            captionLayout="dropdown"
                            startMonth={thisMonth}
                            endMonth={endMonth}
                            disabled={{ before: minCheckInDate }}
                            showOutsideDays={false}
                            className="[&_.rdp-day_range_end]:bg-[#0E7C86] [&_.rdp-day_range_end]:text-white [&_.rdp-day_range_middle]:bg-teal-50 [&_.rdp-day_range_middle]:text-orange-900 [&_.rdp-day_range_start]:bg-[#0E7C86] [&_.rdp-day_range_start]:text-white [&_.rdp-day_selected]:bg-[#0E7C86] [&_.rdp-day_selected]:text-white"
                        />
                    </PopoverContent>
                </Popover>

                <Popover open={openGuests} onOpenChange={setOpenGuests}>
                    <PopoverTrigger asChild>
                        <button className="flex cursor-pointer items-center justify-center gap-1 bg-white px-2 py-1 text-sm font-normal whitespace-nowrap text-neutral-800 transition-colors hover:bg-gray-100">
                            <Users size={16} className="mr-1 text-neutral-800" />
                            {adults} {t('adult')}
                            {adults !== 1 ? 's' : ''}/{children} {t('child')}
                            {children !== 1 ? '' : ''}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="relative w-80 border border-gray-600 bg-black/90 p-4 text-white"
                        align="start">
                        <div className="space-y-4">
                            {/* Adults */}
                            <div className="flex items-center justify-between border-b border-gray-600 pb-2">
                                <div>
                                    <div className="text-sm font-normal text-white">{t('adult')}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={decrementAdults}
                                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full font-bold text-white transition-colors"
                                        disabled={adults <= 1}>
                                        <svg
                                            className="h-6 w-6 text-gray-800 dark:text-white"
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
                                                d="M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                            />
                                        </svg>
                                    </button>
                                    <span className="w-8 text-center text-base font-normal text-white">{adults}</span>
                                    <button
                                        onClick={incrementAdults}
                                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full font-bold text-white transition-colors"
                                        disabled={adults >= MAX_RESERVATION_ADULTS}>
                                        <svg
                                            className="h-6 w-6 text-gray-800 dark:text-white"
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
                                                d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Children */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-normal text-white">{t('child')}</div>
                                    <div className="text-sm font-normal text-gray-300">{t('youngChild')}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={decrementChildren}
                                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full font-bold text-white transition-colors"
                                        disabled={children <= 0}>
                                        <svg
                                            className="h-6 w-6 text-gray-800 dark:text-white"
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
                                                d="M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                            />
                                        </svg>
                                    </button>
                                    <span className="w-8 text-center text-base font-normal text-white">{children}</span>
                                    <button
                                        onClick={incrementChildren}
                                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full font-bold text-white transition-colors"
                                        disabled={children >= MAX_RESERVATION_CHILDREN}>
                                        <svg
                                            className="h-6 w-6 text-gray-800 dark:text-white"
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
                                                d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="relative flex items-end justify-end">
                                <button
                                    type="button"
                                    onClick={() => setOpenGuests(false)}
                                    className="relative  inline-flex cursor-pointer items-center  justify-center rounded-md border border-white bg-black/60 px-3 py-1 text-xs text-white transition-colors hover:bg-white hover:text-black">
                                    <X className="h-4 w-4" />
                                    <span>{c('close')}</span>
                                </button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                <button
                    className="-ml-[1px] min-w-[120px] cursor-pointer bg-[#0E7C86] px-4 py-1 text-xs font-semibold whitespace-nowrap text-white hover:bg-[#0a6570]"
                    onClick={handleReservation}>
                    {t('title').toUpperCase()}
                </button>

                {/* Language Switcher */}
                <div className="flex items-center">
                    <LanguageSwitcher className="scale-75" />
                </div>
            </div>
            <button
                aria-label={t('title')}
                className="inline-flex h-[42px] w-[45px] cursor-pointer items-center justify-center bg-[#0E7C86] p-2 text-white md:hidden"
                onClick={handleMobileReservation}>
                <CalendarIcon size={20} className="items-center justify-center text-center text-white" />
            </button>

            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent className="z-[2147483647]">
                    <AlertDialogHeader>
                        <svg className="mb-6" width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_7080_13171)">
                                <path d="M60 30C60 13.4315 46.5685 0 30 0C13.4315 0 0 13.4315 0 30C0 46.5685 13.4315 60 30 60C46.5685 60 60 46.5685 60 30Z" fill="#CA3501"/>
                                <path d="M43.5316 23.2141C43.954 22.7123 44.2736 22.1322 44.4718 21.5069C44.6701 20.8817 44.7433 20.2235 44.6872 19.5699C44.6312 18.9164 44.4469 18.2803 44.145 17.6979C43.8431 17.1156 43.4294 16.5984 42.9276 16.1759C42.4258 15.7535 41.8457 15.434 41.2205 15.2357C40.5952 15.0374 39.937 14.9642 39.2835 15.0203C38.6299 15.0763 37.9938 15.2606 37.4115 15.5625C36.8291 15.8644 36.3119 16.2781 35.8895 16.7799L43.5316 23.2141ZM16.4684 23.2141C15.6152 22.2007 15.1995 20.8898 15.3127 19.5699C15.426 18.25 16.059 17.0292 17.0724 16.1759C18.0858 15.3227 19.3966 14.907 20.7165 15.0203C22.0364 15.1335 23.2573 15.7665 24.1105 16.7799L16.4684 23.2141ZM40.0737 38.7509C41.4785 36.8857 42.3361 34.666 42.5504 32.3408C42.7647 30.0155 42.3271 27.6765 41.2868 25.586C40.2465 23.4954 38.6445 21.7359 36.6603 20.5046C34.6762 19.2733 32.3884 18.6189 30.0533 18.6148C27.7182 18.6107 25.4281 19.257 23.4396 20.4812C21.4512 21.7055 19.8429 23.4593 18.7952 25.5462C17.7475 27.6331 17.3017 29.9705 17.5078 32.2965C17.7138 34.6225 18.5636 36.8452 19.9618 38.7154L16.1566 42.5167L18.6395 44.9996L22.4368 41.2022C24.615 42.8568 27.2739 43.7548 30.0092 43.7598C32.7445 43.7648 35.4066 42.8765 37.5908 41.2299L41.3605 44.9996L43.8434 42.5167L40.0737 38.7509ZM31.4171 36.8917H28.4566V34.768H31.4171V36.8917ZM31.4171 33.2917H28.4566V25.2628H31.4171V33.2917Z" fill="white"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_7080_13171">
                                    <rect width="60" height="60" fill="white"/>
                                </clipPath>
                            </defs>
                        </svg>

                        <AlertDialogTitle>{alertTitle}</AlertDialogTitle>
                        <AlertDialogDescription>{alertDescription}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            className="w-full cursor-pointer bg-[#0E7C86] px-4 text-white transition-colors hover:bg-orange-200 hover:text-orange-800"
                            onClick={() => setAlertOpen(false)}>
                            OK
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
