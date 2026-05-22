import { Check } from 'lucide-react'

import type { RoomFeature } from '@/types/room-management'

interface Props {
    features: RoomFeature[]
    maxItems?: number
}

export default function RoomFacilities({ features, maxItems = 4 }: Props) {
    const displayedFeatures = typeof maxItems === 'number' ? features.slice(0, maxItems) : features

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1.5 text-sm text-gray-700">
                {displayedFeatures.map((feature) => (
                    <div key={feature.name} className="flex items-start gap-2">
                        {feature.image?.[0]?.url ? (
                            <img
                                src={feature.image[0].url}
                                alt={feature.name}
                                width={16}
                                height={16}
                                className={`mt-0.5 h-4 w-4 flex-shrink-0 rounded-sm object-contain ${
                                    feature.isHighlighted ? 'ring-1 ring-orange-200' : ''
                                }`}
                                loading="lazy"
                                decoding="async"
                            />
                        ) : (
                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                        )}
                        <span className="truncate">{feature.name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function hasMoreFacilities(features: RoomFeature[], maxItems = 4): boolean {
    return features.length > maxItems
}
