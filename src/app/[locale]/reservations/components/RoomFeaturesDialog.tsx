'use client'

import { BedIcon, Check, Maximize2, X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/utils'
import type { RoomFeature } from '@/types/room-management'

interface RoomFeaturesDialogProps {
    bedConfiguration?: string | null
    features: RoomFeature[]
    onOpenChange: (open: boolean) => void
    open: boolean
    roomName: string
    roomSize?: number | null
}

function RoomFeatureRow({ feature }: { feature: RoomFeature }) {
    return (
        <div className="flex items-start gap-2">
            {feature.image?.[0]?.url ? (
                <img
                    src={feature.image[0].url}
                    alt={feature.name}
                    width={16}
                    height={16}
                    className={cn(
                        'mt-0.5 h-4 w-4 flex-shrink-0 rounded-sm object-contain',
                        feature.isHighlighted ? 'ring-1 ring-orange-200' : 'opacity-90'
                    )}
                    loading="lazy"
                    decoding="async"
                />
            ) : (
                <Check size={14} className="mt-0.5 flex-shrink-0 text-green-600" />
            )}
            <span className="text-sm text-gray-700">{feature.name}</span>
        </div>
    )
}

export default function RoomFeaturesDialog({
    bedConfiguration,
    features,
    onOpenChange,
    open,
    roomName,
    roomSize
}: RoomFeaturesDialogProps) {
    useEffect(() => {
        if (!open) return
        const scrollY = window.scrollY
        const prev = { overflow: document.body.style.overflow, position: document.body.style.position, top: document.body.style.top, width: document.body.style.width }
        document.body.style.overflow = 'hidden'
        document.body.style.position = 'fixed'
        document.body.style.top = `-${scrollY}px`
        document.body.style.width = '100%'
        return () => {
            document.body.style.overflow = prev.overflow
            document.body.style.position = prev.position
            document.body.style.top = prev.top
            document.body.style.width = prev.width
            window.scrollTo(0, scrollY)
        }
    }, [open])

    if (!open) return null

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="room-features-title"
                className="relative z-10 flex h-[600px] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex-shrink-0 border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <h2 id="room-features-title" className="pr-2 text-lg font-bold text-gray-900">
                            {roomName}
                        </h2>
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="flex-shrink-0 cursor-pointer rounded-full p-1 transition-colors hover:bg-gray-100"
                            aria-label="Close room features">
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="mb-1 text-base font-semibold text-gray-900">Room photos and details</p>
                    <div className="flex items-center gap-4 text-sm text-gray-700">
                        {roomSize ? (
                            <div className="flex items-center gap-1.5">
                                <Maximize2 className="h-4 w-4 text-[#0E7C86]" />
                                <span>Room size: {roomSize} m²</span>
                            </div>
                        ) : null}
                        {bedConfiguration ? (
                            <div className="flex items-center gap-1.5">
                                <BedIcon className="h-4 w-4 text-[#0E7C86]" />
                                <span>{bedConfiguration}</span>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div
                    className="min-h-0 flex-1 overflow-y-auto px-4 py-3"
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#fdba74 #f3f4f6'
                    }}>
                    <h3 className="mb-2 text-base font-semibold text-gray-900">Room Features</h3>

                    {features.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {features.map((feature) => (
                                <RoomFeatureRow key={feature.name} feature={feature} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No features listed.</p>
                    )}
                </div>

                <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="w-full cursor-pointer rounded-lg bg-[#0E7C86] py-3 font-semibold text-white transition-colors hover:bg-[#0a6570]">
                        Close
                    </button>
                </div>
            </div>
        </div>
    )

    return createPortal(modalContent, document.body)
}
