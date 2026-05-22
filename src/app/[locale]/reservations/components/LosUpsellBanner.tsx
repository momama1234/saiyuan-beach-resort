'use client'

import { formatPrice } from '@/helpers/price'

interface LosDiscountTier {
    minNights: number
    discountPercent: number
}

interface LosUpsellBannerProps {
    losDiscounts: LosDiscountTier[]
    currentNights: number
    pricePerNight: number
    onPreview: () => void
}

export function LosUpsellBanner({ losDiscounts, currentNights, pricePerNight, onPreview }: LosUpsellBannerProps) {
    const nextTier = losDiscounts
        .filter((t) => t.minNights > currentNights)
        .sort((a, b) => a.minNights - b.minNights)[0]

    if (!nextTier) {
        return null
    }

    const nightsMore = nextTier.minNights - currentNights
    const savings = Math.round(pricePerNight * nextTier.minNights * (nextTier.discountPercent / 100))

    return (
        <div className="mt-2">
            <div className="flex flex-col gap-2 rounded-lg border border-dashed border-orange-200 bg-orange-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-orange-800">
                        Stay {nightsMore} more {nightsMore === 1 ? 'night' : 'nights'} to save ฿{formatPrice(savings)}
                    </p>
                    <p className="text-xs text-[#0a6570]">Unlocks at {nextTier.minNights}-night minimum stay</p>
                </div>
                <button
                    type="button"
                    onClick={() => onPreview()}
                    className="shrink-0 rounded-md bg-[#0E7C86] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0a6570]">
                    Extend to {nextTier.minNights} nights →
                </button>
            </div>
        </div>
    )
}
