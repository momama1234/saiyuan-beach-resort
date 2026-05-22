'use client'

import { Check, X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import type { RatePlanFeature } from '@/types/room-management'

interface RatePlanFeaturesDialogProps {
    features: RatePlanFeature[]
    onOpenChange: (open: boolean) => void
    open: boolean
    ratePlanName: string
}

function RatePlanFeatureRow({ feature }: { feature: RatePlanFeature }) {
    return (
        <div className="flex items-start gap-2">
            {feature.image?.[0]?.url ? (
                <img
                    src={feature.image[0].url}
                    alt={feature.label}
                    width={16}
                    height={16}
                    className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-sm object-contain"
                    loading="lazy"
                    decoding="async"
                />
            ) : (
                <Check size={14} className="mt-0.5 flex-shrink-0 text-green-600" />
            )}
            <span className="text-sm text-gray-700">{feature.label}</span>
        </div>
    )
}

export default function RatePlanFeaturesDialog({
    features,
    onOpenChange,
    open,
    ratePlanName
}: RatePlanFeaturesDialogProps) {
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
                aria-labelledby="rate-plan-features-title"
                className="relative z-10 flex h-[520px] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between gap-3 border-b border-gray-200 p-4">
                    <h2 id="rate-plan-features-title" className="pr-2 text-lg font-bold text-gray-900">
                        {ratePlanName}
                    </h2>
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="flex-shrink-0 cursor-pointer rounded-full p-1 transition-colors hover:bg-gray-100"
                        aria-label="Close rate plan features">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="text-base font-semibold text-gray-900">Rate Plan Features</p>
                </div>

                <div
                    className="min-h-0 flex-1 overflow-y-auto px-4 py-3"
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#fdba74 #f3f4f6'
                    }}>
                    {features.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {features.map((feature) => (
                                <RatePlanFeatureRow key={feature.id} feature={feature} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No features listed.</p>
                    )}
                </div>

                <div className="border-t border-gray-200 bg-white p-4">
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
