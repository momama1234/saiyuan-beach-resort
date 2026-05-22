'use client'

import { calculateRatePlanDiscountPercent } from '@/shared/utils/rate-plan-discount'
import { addDays, format, isAfter, isBefore } from 'date-fns'
import { Check } from 'lucide-react'
import { useState } from 'react'

import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { formatPrice } from '@/helpers/price'
import { AvailableRoomClass } from '@/types/room-management'

type RatePlan = NonNullable<AvailableRoomClass['ratePlans']>[number]
type OccupancyOption = RatePlan['occupancyOptions'][number]

interface LosExtendModalProps {
    open: boolean
    ratePlan: RatePlan
    occupancyOption: OccupancyOption
    checkIn: Date
    onConfirm: (nights: number) => Promise<void>
    onClose: () => void
}

export function LosExtendModal({ open, ratePlan, occupancyOption, checkIn, onConfirm, onClose }: LosExtendModalProps) {
    const losDiscounts = ratePlan.discountRules?.losDiscounts ?? []
    const losMinNights = Math.min(...losDiscounts.map((t) => t.minNights))
    const minCheckOut = addDays(checkIn, losMinNights)

    const [selectedCheckOut, setSelectedCheckOut] = useState<Date>(minCheckOut)
    const [isConfirming, setIsConfirming] = useState(false)

    const nights = Math.round((selectedCheckOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const discountPercent = ratePlan.discountRules
        ? calculateRatePlanDiscountPercent(nights, checkIn.toISOString(), ratePlan.discountRules)
        : 0
    const rawTotal = occupancyOption.rate * nights
    const discountedTotal = discountPercent > 0 ? rawTotal * (1 - discountPercent / 100) : rawTotal
    const savings = Math.round(rawTotal - discountedTotal)

    const getTierForDate = (date: Date) =>
        losDiscounts.find((t) => format(addDays(checkIn, t.minNights), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))

    const handleConfirm = async () => {
        setIsConfirming(true)
        try {
            await onConfirm(nights)
        } finally {
            setIsConfirming(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="flex h-dvh w-full flex-col gap-0 overflow-hidden rounded-none p-0 top-0 left-0 translate-x-0 translate-y-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:h-auto sm:max-w-sm sm:rounded-lg md:max-w-2xl">
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row">

                    {/* ── Left: Calendar ── */}
                    <div className="flex-1 p-5">
                        <DialogTitle className="mb-4 text-base font-semibold text-gray-900">Choose check-out date</DialogTitle>

                        {/* Check-in / Check-out bar */}
                        <div className="mb-4 flex items-stretch gap-0 overflow-hidden rounded-xl border border-gray-200">
                            <div className="flex-1 px-3 py-2.5">
                                <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Check-in</p>
                                <p className="mt-0.5 text-sm font-bold text-gray-800">{format(checkIn, 'MMM d, yyyy')}</p>
                            </div>
                            <div className="flex items-center bg-gray-50 px-2">
                                <div className="flex flex-col items-center gap-0.5">
                                    <div className="h-px w-5 bg-gray-300" />
                                    <span className="text-[10px] font-bold text-[#0E7C86]">
                                        {nights} {nights === 1 ? 'night' : 'nights'}
                                    </span>
                                    <div className="h-px w-5 bg-gray-300" />
                                </div>
                            </div>
                            <div className="flex-1 border-l border-gray-200 bg-teal-50/40 px-3 py-2.5">
                                <p className="text-[10px] font-semibold tracking-widest text-[#E0A458] uppercase">Check-out</p>
                                <p className="mt-0.5 text-sm font-bold text-[#0a6570]">
                                    {format(selectedCheckOut, 'MMM d, yyyy')}
                                </p>
                            </div>
                        </div>

                        {/* Calendar */}
                        <Calendar
                            mode="single"
                            selected={selectedCheckOut}
                            onSelect={(date) => date && setSelectedCheckOut(date)}
                            disabled={{ before: minCheckOut }}
                            defaultMonth={minCheckOut}
                            modifiers={{ checkIn }}
                            modifiersClassNames={{ checkIn: 'cursor-default' }}
                            components={{
                                DayButton: ({ day, modifiers, ...props }) => {
                                    const tier = getTierForDate(day.date)
                                    const d = format(day.date, 'yyyy-MM-dd')
                                    const isCheckIn = d === format(checkIn, 'yyyy-MM-dd')
                                    const isCheckOut = d === format(selectedCheckOut, 'yyyy-MM-dd')
                                    const isInRange = isAfter(day.date, checkIn) && isBefore(day.date, selectedCheckOut)
                                    return (
                                        <div className="relative w-full">
                                            <CalendarDayButton
                                                day={day}
                                                modifiers={modifiers}
                                                {...props}
                                                className={isCheckIn ? 'font-bold text-[#0E7C86] opacity-100' : undefined}
                                            />
                                            {/* Range bar */}
                                            {isCheckIn && (
                                                <span className="pointer-events-none absolute right-0 bottom-0 left-1/2 h-1 bg-orange-400" />
                                            )}
                                            {isInRange && (
                                                <span className="pointer-events-none absolute right-0 bottom-0 left-0 h-1 bg-orange-400" />
                                            )}
                                            {isCheckOut && (
                                                <span className="pointer-events-none absolute right-1/2 bottom-0 left-0 h-1 bg-orange-400" />
                                            )}
                                            {tier && (
                                                <span className="pointer-events-none absolute top-0 right-0 rounded-bl bg-[#0E7C86] px-0.5 text-[7px] leading-[1.4] font-bold text-white">
                                                    -{tier.discountPercent}%
                                                </span>
                                            )}
                                        </div>
                                    )
                                }
                            }}
                        />

                        {/* Tier legend */}
                        {losDiscounts.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 border-t border-dashed border-gray-100 pt-2">
                                {losDiscounts.map((tier) => (
                                    <span key={tier.minNights} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                        <span className="inline-block h-1.5 w-1.5 rounded-sm bg-[#0E7C86]" />
                                        {tier.minNights}+ nights = {tier.discountPercent}% off
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Right: Summary panel ── */}
                    <div className="flex flex-col border-t border-gray-100 bg-gray-50 p-5 md:w-60 md:border-t-0 md:border-l">
                        <div className="flex-1 space-y-5">

                            {/* Rate plan name */}
                            <div>
                                <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Rate plan</p>
                                <p className="mt-0.5 text-sm font-semibold text-gray-900">{ratePlan.name}</p>
                            </div>

                            {/* Price breakdown */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Price</p>
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex justify-between text-gray-600">
                                        <span>{nights} nights × ฿{formatPrice(occupancyOption.rate)}</span>
                                        <span className="font-medium text-gray-800">฿{formatPrice(rawTotal)}</span>
                                    </div>
                                    {discountPercent > 0 && (
                                        <div className="flex justify-between text-green-700">
                                            <span>Discount ({discountPercent}%)</span>
                                            <span className="font-medium">−฿{formatPrice(savings)}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-gray-200 pt-1.5">
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-xs font-semibold text-gray-700">Total</span>
                                            <span className="text-xl font-bold text-[#0a6570]">
                                                ฿{formatPrice(Math.round(discountedTotal))}
                                            </span>
                                        </div>
                                        {savings > 0 && (
                                            <p className="mt-0.5 text-right text-[10px] font-semibold text-green-600">
                                                Save ฿{formatPrice(savings)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Features */}
                            {(ratePlan.features ?? []).slice(0, 3).length > 0 && (
                                <div className="space-y-1.5">
                                    {(ratePlan.features ?? []).slice(0, 3).map((f) => (
                                        <div key={f.id} className="flex items-center gap-1.5 text-xs text-gray-600">
                                            <Check size={11} className="shrink-0 text-green-500" />
                                            {f.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Actions — desktop only (mobile uses sticky footer below) */}
                        <div className="mt-5 hidden flex-col gap-2 md:flex">
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={isConfirming}
                                className="w-full rounded-lg bg-[#0E7C86] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a6570] disabled:opacity-50">
                                {isConfirming ? 'Extending...' : `Select — ${nights} nights`}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-white">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sticky footer — mobile only */}
                <div className="flex flex-col gap-2 border-t border-gray-100 bg-white p-4 md:hidden" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isConfirming}
                        className="w-full rounded-lg bg-[#0E7C86] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a6570] disabled:opacity-50">
                        {isConfirming ? 'Extending...' : `Select — ${nights} nights`}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-white">
                        Cancel
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
