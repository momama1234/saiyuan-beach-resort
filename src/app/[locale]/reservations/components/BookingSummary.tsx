import { format, parse, startOfDay } from 'date-fns'
import { Calendar as CalendarIcon, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo, useCallback, useState } from 'react'
import { DateRange } from 'react-day-picker'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import {
    Drawer,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle
} from '@/components/ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useBookingDetailsUpdate } from '@/features/reservation/hooks/useBookingDetailsUpdate'
import {
    useBookingDetailsActions,
    useHasBookingDetailsChanged,
    useTempBookingDetails
} from '@/features/reservation/stores/booking-details-store'
import { MAX_RESERVATION_ADULTS, MAX_RESERVATION_CHILDREN } from '@/lib/reservation-limits'

export const BookingSummary = memo(() => {
    const t = useTranslations('BookingSummary')
    const alertTrans = useTranslations('Reservations.alert')

    const tempBookingDetails = useTempBookingDetails()
    const bookingDetailsActions = useBookingDetailsActions()
    const hasChanges = useHasBookingDetailsChanged()
    const handleApplyChanges = useBookingDetailsUpdate()

    const [isUpdating, setIsUpdating] = useState(false)
    const [openCalendar, setOpenCalendar] = useState(false)
    const [openGuests, setOpenGuests] = useState(false)
    const [openDateDrawer, setOpenDateDrawer] = useState(false)
    const [openGuestDrawer, setOpenGuestDrawer] = useState(false)
    const [alertOpen, setAlertOpen] = useState(false)
    const [alertTitle, setAlertTitle] = useState('')
    const [alertDescription, setAlertDescription] = useState('')
    const todayStart = startOfDay(new Date())
    const thisMonth = new Date()
    const endMonth = new Date(thisMonth.getFullYear() + 3, 11, 31)

    const dateRange: DateRange | undefined = {
        from: tempBookingDetails.checkInDate
            ? parse(tempBookingDetails.checkInDate, 'yyyy-MM-dd', new Date())
            : undefined,
        to: tempBookingDetails.checkOutDate
            ? parse(tempBookingDetails.checkOutDate, 'yyyy-MM-dd', new Date())
            : undefined
    }

    const adults = parseInt(tempBookingDetails.adults) || 1
    const children = parseInt(tempBookingDetails.children) || 0

    const formatGuestSummaryShort = (): string => {
        const total = adults + children
        return `${total} ${total === 1 ? t('guest') : t('guests')}`
    }

    const handleSelectDateRange = (value: DateRange | undefined) => {
        if (value?.from) {
            bookingDetailsActions.updateTempBookingDetails('checkInDate', format(value.from, 'yyyy-MM-dd'))
        }
        if (value?.to) {
            bookingDetailsActions.updateTempBookingDetails('checkOutDate', format(value.to, 'yyyy-MM-dd'))
        }
    }

    const incrementAdults = () =>
        bookingDetailsActions.updateTempBookingDetails('adults', Math.min(adults + 1, MAX_RESERVATION_ADULTS).toString())
    const decrementAdults = () =>
        bookingDetailsActions.updateTempBookingDetails('adults', Math.max(adults - 1, 1).toString())
    const incrementChildren = () =>
        bookingDetailsActions.updateTempBookingDetails(
            'children',
            Math.min(children + 1, MAX_RESERVATION_CHILDREN).toString()
        )
    const decrementChildren = () =>
        bookingDetailsActions.updateTempBookingDetails('children', Math.max(children - 1, 0).toString())

    const applyChanges = useCallback(async (): Promise<boolean> => {
        try {
            setIsUpdating(true)
            await handleApplyChanges()
            return true
        } catch {
            setAlertTitle(alertTrans('title-daterange'))
            setAlertDescription(alertTrans('description-daterange'))
            setAlertOpen(true)
            return false
        } finally {
            setIsUpdating(false)
        }
    }, [handleApplyChanges, alertTrans])

    const handleApplyDesktop = useCallback(async () => {
        await applyChanges()
    }, [applyChanges])

    const handleApplyDateDrawer = useCallback(async () => {
        const success = await applyChanges()
        if (success) setOpenDateDrawer(false)
    }, [applyChanges])

    const handleApplyGuestDrawer = useCallback(async () => {
        const success = await applyChanges()
        if (success) setOpenGuestDrawer(false)
    }, [applyChanges])

    const calendarClassName =
        '[&_.rdp-day_range_end]:bg-[#0E7C86] [&_.rdp-day_range_end]:text-white [&_.rdp-day_range_middle]:bg-teal-50 [&_.rdp-day_range_middle]:text-orange-900 [&_.rdp-day_range_start]:bg-[#0E7C86] [&_.rdp-day_range_start]:text-white [&_.rdp-day_selected]:bg-[#0E7C86] [&_.rdp-day_selected]:text-white'

    return (
        <Card className="mb-6 border-none py-0 shadow-none">
            <CardContent className="p-0">
                {/* ── Desktop (md+): layout เดิม ── */}
                <div className="hidden md:block">
                    <div className="mb-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <h3 className="text-xl font-bold text-[#0E7C86] md:text-2xl">{t('bookingDetails')}</h3>
                        {hasChanges && (
                            <Button
                                onClick={handleApplyDesktop}
                                disabled={isUpdating}
                                size="sm"
                                className="bg-[#0a6570] px-6 font-semibold text-white hover:bg-[#0E7C86]">
                                {isUpdating ? t('updating') : t('updatePrices')}
                            </Button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-3 md:flex-row">
                            <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                                <PopoverTrigger asChild>
                                    <div id="calendar-button" className="flex flex-1 flex-col gap-3 sm:flex-row">
                                        <button className="flex flex-1 cursor-pointer flex-row items-center justify-between gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-all hover:border-orange-500 hover:bg-gray-50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none">
                                            <div className="flex flex-col items-start gap-1">
                                                <div className="text-gray-500">Check-in</div>
                                                <span className="text-lg font-medium">
                                                    {dateRange?.from
                                                        ? format(dateRange.from, 'MMM dd, yyyy')
                                                        : t('checkInDate')}
                                                </span>
                                            </div>
                                            <CalendarIcon size={26} className="flex-shrink-0 text-gray-500" />
                                        </button>
                                        <button className="flex flex-1 cursor-pointer flex-row items-center justify-between gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-all hover:border-orange-500 hover:bg-gray-50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none">
                                            <div className="flex flex-col items-start gap-1">
                                                <div className="text-gray-500">Check-out</div>
                                                <span className="text-lg font-medium">
                                                    {dateRange?.to
                                                        ? format(dateRange.to, 'MMM dd, yyyy')
                                                        : t('checkOutDate')}
                                                </span>
                                            </div>
                                            <CalendarIcon size={26} className="flex-shrink-0 text-gray-500" />
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
                                        startMonth={thisMonth}
                                        endMonth={endMonth}
                                        disabled={{ before: todayStart }}
                                        showOutsideDays={false}
                                        className={calendarClassName}
                                    />
                                </PopoverContent>
                            </Popover>

                            <Popover open={openGuests} onOpenChange={setOpenGuests}>
                                <PopoverTrigger asChild>
                                    <button className="flex cursor-pointer flex-row items-center justify-between gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-all hover:border-orange-500 hover:bg-gray-50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none sm:w-1/3">
                                        <div className="flex flex-col items-start gap-1">
                                            <div className="text-gray-500">Adults/Children</div>
                                            <span className="text-lg font-medium">
                                                {adults} {t('adults')}/{children} {t('children')}
                                            </span>
                                        </div>
                                        <Users size={26} className="flex-shrink-0 text-gray-500" />
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
                                                    <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14" />
                                                    </svg>
                                                </button>
                                                <span className="w-10 text-center text-base font-semibold text-white">{adults}</span>
                                                <button
                                                    onClick={incrementAdults}
                                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-200 text-[#0a6570] transition-all hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                                    disabled={adults >= MAX_RESERVATION_ADULTS}>
                                                    <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7 7V5" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-semibold text-white">{t('children')}</div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={decrementChildren}
                                                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-orange-200 text-[#0a6570] transition-all hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                                    disabled={children <= 0}>
                                                    <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14" />
                                                    </svg>
                                                </button>
                                                <span className="w-10 text-center text-base font-semibold text-white">{children}</span>
                                                <button
                                                    onClick={incrementChildren}
                                                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-orange-200 text-[#0a6570] transition-all hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                                    disabled={children >= MAX_RESERVATION_CHILDREN}>
                                                    <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7 7V5" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="hidden justify-end border-t border-gray-200 pt-2">
                                            <button
                                                onClick={() => setOpenGuests(false)}
                                                className="rounded-md px-4 py-2 text-sm font-medium text-[#0a6570] transition-colors hover:bg-orange-50 hover:text-[#0E7C86]">
                                                {t('close') || 'Close'}
                                            </button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {hasChanges && (
                            <div className="flex items-start gap-2 rounded-lg border border-teal-200 bg-orange-50 p-4 text-sm text-[#0E7C86]">
                                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#0a6570]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <span>{t('dateChangedNotice')}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Mobile (< md): 3 field boxes + drawers ── */}
                <div className="md:hidden">
                    {/* 3 separate field boxes */}
                    <div className="flex gap-2">
                        <button
                            data-testid="mobile-checkin-trigger"
                            onClick={() => setOpenDateDrawer(true)}
                            className="flex flex-1 flex-col items-start gap-0.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-left transition-all hover:border-[#0E7C86]">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                <CalendarIcon size={11} />
                                {t('checkIn')}
                            </span>
                            <span className="text-sm font-medium text-gray-800">
                                {dateRange?.from ? format(dateRange.from, 'MMM dd') : '—'}
                            </span>
                        </button>

                        <button
                            data-testid="mobile-checkout-trigger"
                            onClick={() => setOpenDateDrawer(true)}
                            className="flex flex-1 flex-col items-start gap-0.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-left transition-all hover:border-[#0E7C86]">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                <CalendarIcon size={11} />
                                {t('checkOut')}
                            </span>
                            <span className="text-sm font-medium text-gray-800">
                                {dateRange?.to ? format(dateRange.to, 'MMM dd') : '—'}
                            </span>
                        </button>

                        <button
                            data-testid="mobile-guest-trigger"
                            onClick={() => setOpenGuestDrawer(true)}
                            className="flex flex-1 flex-col items-start gap-0.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-left transition-all hover:border-[#0E7C86]">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Users size={11} />
                                {t('guestsLabel')}
                            </span>
                            <span className="text-sm font-medium whitespace-nowrap text-gray-800">
                                {formatGuestSummaryShort()}
                            </span>
                        </button>
                    </div>

                    {/* Date Picker Drawer */}
                    <Drawer open={openDateDrawer} onOpenChange={(open: boolean) => { if (!open) bookingDetailsActions.cancelBookingEdit(); setOpenDateDrawer(open) }}>
                        <DrawerContent className="max-h-[65vh] bg-white">
                            <DrawerHeader>
                                <DrawerTitle className="text-center text-base">
                                    {t('checkIn')} / {t('checkOut')}
                                </DrawerTitle>
                            </DrawerHeader>
                            <div className="overflow-y-auto px-2">
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={handleSelectDateRange}
                                    numberOfMonths={1}
                                    captionLayout="dropdown"
                                    startMonth={thisMonth}
                                    endMonth={endMonth}
                                    disabled={{ before: todayStart }}
                                    showOutsideDays={false}
                                    className={calendarClassName}
                                    classNames={{ range_middle: 'rounded-none !bg-teal-50' }}
                                />
                            </div>
                            <DrawerFooter>
                                <Button
                                    onClick={handleApplyDateDrawer}
                                    disabled={isUpdating || !hasChanges}
                                    className="w-full bg-[#0a6570] font-semibold text-white hover:bg-[#0E7C86]">
                                    {isUpdating ? t('updating') : t('updatePrices')}
                                </Button>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>

                    {/* Guest Picker Drawer */}
                    <Drawer open={openGuestDrawer} onOpenChange={(open: boolean) => { if (!open) bookingDetailsActions.cancelBookingEdit(); setOpenGuestDrawer(open) }}>
                        <DrawerContent className="bg-white">
                            <DrawerHeader>
                                <DrawerTitle className="text-center text-base">
                                    {t('adults')} / {t('children')}
                                </DrawerTitle>
                            </DrawerHeader>
                            <div className="space-y-5 px-4 pb-2">
                                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                                    <div className="text-sm font-semibold text-gray-800">{t('adults')}</div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={decrementAdults}
                                            className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-200 text-[#0a6570] transition-all hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-30"
                                            disabled={adults <= 1}>
                                            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14" />
                                            </svg>
                                        </button>
                                        <span className="w-10 text-center text-base font-semibold text-gray-900">{adults}</span>
                                        <button
                                            onClick={incrementAdults}
                                            className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-200 text-[#0a6570] transition-all hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-30"
                                            disabled={adults >= MAX_RESERVATION_ADULTS}>
                                            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7 7V5" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-semibold text-gray-800">{t('children')}</div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={decrementChildren}
                                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-orange-200 text-[#0a6570] transition-all hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-30"
                                            disabled={children <= 0}>
                                            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14" />
                                            </svg>
                                        </button>
                                        <span className="w-10 text-center text-base font-semibold text-gray-900">{children}</span>
                                        <button
                                            onClick={incrementChildren}
                                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-orange-200 text-[#0a6570] transition-all hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-30"
                                            disabled={children >= MAX_RESERVATION_CHILDREN}>
                                            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7 7V5" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <DrawerFooter>
                                <Button
                                    onClick={handleApplyGuestDrawer}
                                    disabled={isUpdating || !hasChanges}
                                    className="w-full bg-[#0a6570] font-semibold text-white hover:bg-[#0E7C86]">
                                    {isUpdating ? t('updating') : t('updatePrices')}
                                </Button>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>
                </div>
            </CardContent>
            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent className="z-[2147483647]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{alertTitle}</AlertDialogTitle>
                        <AlertDialogDescription>{alertDescription}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            className="w-full cursor-pointer bg-[#0E7C86] text-white transition-colors hover:bg-orange-200 hover:text-orange-800"
                            onClick={() => setAlertOpen(false)}>
                            OK
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    )
})

BookingSummary.displayName = 'BookingSummary'
