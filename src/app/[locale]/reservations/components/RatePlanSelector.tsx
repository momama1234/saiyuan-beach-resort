'use client'

import { Check, ChevronDown, ChevronUp, Users } from 'lucide-react'
import { useState } from 'react'

import { formatPrice } from '@/helpers/price'
import { cn } from '@/lib/utils'
import { OccupancyOption, RatePlan } from '@/types/room-management'

interface RatePlanSelectorProps {
    ratePlans: RatePlan[]
    selectedRatePlanId?: number
    selectedOccupancyId?: number
    onRatePlanSelect: (_ratePlanId: number, _occupancyOption: OccupancyOption) => void
    nights?: number
    totalGuests?: number
}

export const RatePlanSelector: React.FC<RatePlanSelectorProps> = ({
    ratePlans,
    selectedRatePlanId,
    selectedOccupancyId,
    onRatePlanSelect,
    nights = 1
}) => {
    const [expandedRatePlanId, setExpandedRatePlanId] = useState<number | null>(
        selectedRatePlanId || ratePlans.find((rp) => rp.isDefault)?.id || ratePlans[0]?.id || null
    )

    if (!ratePlans || ratePlans.length === 0) {
        return null
    }

    const toggleRatePlan = (ratePlanId: number) => {
        setExpandedRatePlanId(expandedRatePlanId === ratePlanId ? null : ratePlanId)
    }

    return (
        <div className="space-y-3">
            {ratePlans.map((ratePlan) => {
                const isExpanded = expandedRatePlanId === ratePlan.id
                const isSelected = selectedRatePlanId === ratePlan.id
                const occupancyOption = ratePlan.occupancyOptions[0]

                if (!occupancyOption) return null

                return (
                    <div
                        key={ratePlan.id}
                        className={cn(
                            'border rounded-lg transition-all',
                            isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-teal-200'
                        )}>
                        <button
                            type="button"
                            onClick={() => toggleRatePlan(ratePlan.id)}
                            className="flex w-full items-center justify-between p-4 text-left">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-medium text-gray-900">{ratePlan.name}</h4>
                                    {ratePlan.isDefault && (
                                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                                            Recommended
                                        </span>
                                    )}
                                    {isSelected && <Check className="h-4 w-4 text-[#0a6570]" />}
                                </div>
                                <div className="mt-1 text-sm text-gray-600">
                                    From{' '}
                                    <span className="font-semibold text-[#0a6570]">
                                        ฿{formatPrice(occupancyOption.rate)}
                                    </span>{' '}
                                    / night
                                </div>
                            </div>
                            {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                        </button>

                        {isExpanded && (
                            <div className="border-t border-gray-200 bg-white p-4">
                                <button
                                    type="button"
                                    onClick={() => onRatePlanSelect(ratePlan.id, occupancyOption)}
                                    className={cn(
                                        'w-full p-3 rounded-lg border transition-all text-left',
                                        selectedOccupancyId === occupancyOption.id && isSelected
                                            ? 'border-orange-500 bg-orange-50'
                                            : 'border-gray-200 hover:border-teal-200 hover:bg-gray-50'
                                    )}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Users className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {occupancyOption.occupancy}{' '}
                                                    {occupancyOption.occupancy === 1 ? 'Guest' : 'Guests'}
                                                </div>
                                                <div className="mt-0.5 text-xs text-gray-500">
                                                    ฿{formatPrice(occupancyOption.rate)} per night
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-[#0a6570]">
                                                ฿{formatPrice(occupancyOption.rate * nights)}
                                            </div>
                                            {nights > 1 && <div className="text-xs text-gray-500">{nights} nights</div>}
                                        </div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
