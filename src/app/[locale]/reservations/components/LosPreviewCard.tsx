'use client'

import { calculateRatePlanDiscountPercent } from '@/shared/utils/rate-plan-discount'
import { Check, X } from 'lucide-react'
import { useState } from 'react'

import { formatPrice } from '@/helpers/price'
import { AvailableRoomClass } from '@/types/room-management'

type RatePlan = NonNullable<AvailableRoomClass['ratePlans']>[number]
type OccupancyOption = RatePlan['occupancyOptions'][number]

interface LosPreviewCardProps {
    ratePlan: RatePlan
    previewNights: number
    occupancyOption: OccupancyOption
    checkIn: Date | null
    onConfirm: () => Promise<void>
    onClose: () => void
}

export function LosPreviewCard({
    ratePlan,
    previewNights,
    occupancyOption,
    checkIn,
    onConfirm,
    onClose
}: LosPreviewCardProps) {
    const [isConfirming, setIsConfirming] = useState(false)

    const discountPercent =
        ratePlan.discountRules && checkIn && previewNights > 0
            ? calculateRatePlanDiscountPercent(
                  previewNights,
                  checkIn.toISOString(),
                  ratePlan.discountRules
              )
            : 0

    const rawTotal = occupancyOption.rate * previewNights
    const discountedTotal = discountPercent > 0 ? rawTotal * (1 - discountPercent / 100) : rawTotal
    const discountedPerNight = previewNights > 0 ? discountedTotal / previewNights : occupancyOption.rate
    const discountSavings = Math.round(rawTotal - discountedTotal)

    const features = (ratePlan.features ?? []).slice(0, 4)

    const handleConfirm = async () => {
        setIsConfirming(true)
        try {
            await onConfirm()
        } finally {
            setIsConfirming(false)
        }
    }

    return (
        <div className="mt-2 rounded-lg border-2 border-teal-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                    <div className="mb-0.5 text-xs font-semibold tracking-wider text-[#0E7C86] uppercase">
                        Preview — {previewNights} nights
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">{ratePlan.name}</h4>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="shrink-0 rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                    <X size={16} />
                </button>
            </div>

            {features.length > 0 && (
                <ul className="mb-3 space-y-1.5">
                    {features.map((feature) => (
                        <li key={feature.id} className="flex items-center gap-2 text-xs text-gray-600">
                            {feature.image?.[0]?.url ? (
                                <img
                                    src={feature.image[0].url}
                                    alt={feature.label}
                                    width={14}
                                    height={14}
                                    className="h-3.5 w-3.5 flex-shrink-0 rounded-sm object-contain"
                                />
                            ) : (
                                <Check size={12} className="flex-shrink-0 text-green-600" />
                            )}
                            {feature.label}
                        </li>
                    ))}
                </ul>
            )}

            <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-xs text-gray-500">
                    {previewNights} nights × ฿{formatPrice(Math.round(discountedPerNight))}
                </span>
                <span className="text-xl font-bold text-[#0a6570]">฿{formatPrice(Math.round(discountedTotal))}</span>
                {discountSavings > 0 && (
                    <span className="rounded bg-teal-50 px-1.5 py-0.5 text-xs font-semibold text-[#0E7C86]">
                        Save ฿{formatPrice(discountSavings)}
                    </span>
                )}
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isConfirming}
                    className="flex-1 rounded-md bg-[#0E7C86] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0a6570] disabled:opacity-50">
                    {isConfirming ? 'Extending...' : `Select & extend to ${previewNights} nights`}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50">
                    Cancel
                </button>
            </div>
        </div>
    )
}
