'use client'

import { calculateRatePlanDiscountPercent } from '@/shared/utils/rate-plan-discount'
import { addDays, format } from 'date-fns'
import { BedDouble, Check, ChevronDown, Lock, Maximize2, Minus, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBookingDetailsUpdate } from '@/features/reservation/hooks/useBookingDetailsUpdate'
import { useBookingDetailsActions } from '@/features/reservation/stores/booking-details-store'
import { useTotalRooms } from '@/features/reservation/stores/room-selection-store'
import { formatPrice } from '@/helpers/price'
import { getRoomCardImageUrls } from '@/lib/room-image-url'
import { cn } from '@/lib/utils'
import { AvailableRoomClass, PromotionAccent } from '@/types/room-management'

import { LosExtendModal } from './LosExtendModal'
import { LosUpsellBanner } from './LosUpsellBanner'
import RatePlanFeaturesDialog from './RatePlanFeaturesDialog'
import styles from './RoomCard.module.css'
import RoomImagesCarousel from './RoomCardSold/components/RoomImagesCarousel'
import RoomFeaturesDialog from './RoomFeaturesDialog'

const VISIBLE_RATE_PLAN_FEATURES = 4
const VISIBLE_ROOM_FEATURES = 4
const MULTI_ROOM_THRESHOLD = 1

const ACCENT_STYLES: Record<PromotionAccent, { pill: string; border: string; badge: string }> = {
    primary:   { pill: 'bg-teal-50 text-[#0E7C86]', border: 'border-teal-200', badge: 'bg-[#0E7C86]' },
    secondary: { pill: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-400', badge: 'bg-emerald-500' },
}

interface RoomClassCardProps {
    roomClass: AvailableRoomClass
    checkIn: Date | null
    checkOut: Date | null
    adults?: string
    children?: string
    isEnabledSelected?: boolean
    hideRatePlanFeatures?: boolean
    className?: string
    onUpdateQuantity: (_roomClassId: number, _quantity: number) => void
    selectedQuantity: number
    onUpdatePlanQuantity?: (
        _roomClassId: number,
        _ratePlanId: number,
        _quantity: number,
        _occupancyOptionId?: number
    ) => void
    selectedQuantitiesByPlan?: Record<number, number>
    initialRatePlanId?: number
}

export const RoomClassCard: React.FC<RoomClassCardProps> = ({
    roomClass,
    checkIn,
    checkOut,
    isEnabledSelected = true,
    hideRatePlanFeatures = false,
    className,
    onUpdateQuantity,
    selectedQuantity,
    onUpdatePlanQuantity,
    selectedQuantitiesByPlan,
    initialRatePlanId
}) => {
    const t = useTranslations('chooseRoom')

    const [selectedRatePlanId, setSelectedRatePlanId] = useState<number | undefined>(() => {
        if (initialRatePlanId && roomClass.ratePlans?.some((rp) => rp.id === initialRatePlanId)) {
            return initialRatePlanId
        }
        return roomClass.ratePlans?.find((rp) => rp.isDefault)?.id
    })
    const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false)
    const [extendModalRatePlanId, setExtendModalRatePlanId] = useState<number | null>(null)
    const [pendingIncrease, setPendingIncrease] = useState<{
        ratePlanId: number
        nextQuantity: number
        occupancyOptionId?: number
        newTotal: number
    } | null>(null)
    const totalRooms = useTotalRooms()
    const [expandedRatePlanFeatures, setExpandedRatePlanFeatures] = useState<{
        features: NonNullable<AvailableRoomClass['ratePlans']>[number]['features']
        ratePlanName: string
    } | null>(null)
    const roomFeatures = roomClass.features ?? []
    const deepLinkedCardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = deepLinkedCardRef.current
        if (!el) return
        const id = requestAnimationFrame(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            if (styles.animatePromoPulse) {
                el.classList.add(styles.animatePromoPulse)
            }
        })
        return () => cancelAnimationFrame(id)
    }, [])

    const nights = useMemo(() => {
        if (checkIn && checkOut) {
            return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        }
        return 1
    }, [checkIn, checkOut])

    const nextLockedPromoRatePlanId = useMemo(() => {
        if (!roomClass.ratePlans) return null
        const locked = roomClass.ratePlans
            .filter((rp) => {
                const los = rp.discountRules?.losDiscounts ?? []
                if (!rp.promotion || los.length === 0) return false
                return nights < Math.min(...los.map((t) => t.minNights))
            })
            .sort((a, b) => {
                const aMin = Math.min(...a.discountRules!.losDiscounts.map((t) => t.minNights))
                const bMin = Math.min(...b.discountRules!.losDiscounts.map((t) => t.minNights))
                return aMin - bMin
            })
        return locked[0]?.id ?? null
    }, [roomClass.ratePlans, nights])

    const visibleRatePlanCount = useMemo(() => {
        if (!roomClass.ratePlans) return 0
        return roomClass.ratePlans.filter((rp) => {
            if (!rp.occupancyOptions[0]) return false
            const losDiscounts = rp.discountRules?.losDiscounts ?? []
            const promoMinNights =
                rp.promotion && losDiscounts.length > 0
                    ? Math.min(...losDiscounts.map((t) => t.minNights))
                    : null
            const isLockedPromo = promoMinNights != null && nights < promoMinNights
            const isNextLockedPromo = rp.id === nextLockedPromoRatePlanId
            return !(isLockedPromo && !isNextLockedPromo)
        }).length
    }, [roomClass.ratePlans, nights, nextLockedPromoRatePlanId])

    const isSingleRatePlanMode = visibleRatePlanCount === 1

    const fallbackPrice = roomClass.basePrice

    const totalSelectedAcrossPlans = selectedQuantitiesByPlan
        ? Object.values(selectedQuantitiesByPlan).reduce((s, v) => s + (v || 0), 0)
        : selectedQuantity
    const isClassSelected = isEnabledSelected && totalSelectedAcrossPlans > 0

    const sortedRatePlans = useMemo(() => {
        if (!roomClass.ratePlans) return []
        if (!initialRatePlanId) return roomClass.ratePlans
        return [...roomClass.ratePlans].sort(
            (a, b) => Number(b.id === initialRatePlanId) - Number(a.id === initialRatePlanId)
        )
    }, [roomClass.ratePlans, initialRatePlanId])

    const anyPromoIsRecommended = useMemo(
        () => sortedRatePlans.some((rp) => rp.promotion && (rp.id === initialRatePlanId || rp.isDefault)),
        [sortedRatePlans, initialRatePlanId]
    )

    const selectionBreakdown = useMemo(() => {
        if (!selectedQuantitiesByPlan || sortedRatePlans.length === 0) return ''
        return sortedRatePlans
            .filter((rp) => (selectedQuantitiesByPlan[rp.id] ?? 0) > 0)
            .map((rp) => `${selectedQuantitiesByPlan[rp.id]}× ${rp.name}`)
            .join(' + ')
    }, [sortedRatePlans, selectedQuantitiesByPlan])

    const totalSelectedPrice = useMemo(() => {
        if (!selectedQuantitiesByPlan) return 0
        return sortedRatePlans.reduce((sum, rp) => {
            const qty = selectedQuantitiesByPlan[rp.id] ?? 0
            if (qty === 0) return sum
            const hasApiPrice = rp.prices?.totalPrice != null && rp.prices.totalPrice > 0
            const basePrice = hasApiPrice
                ? rp.prices!.totalPrice
                : (rp.occupancyOptions[0]?.rate ?? 0) * (nights || 1)
            const discountPct =
                rp.discountRules && checkIn && nights > 0
                    ? calculateRatePlanDiscountPercent(nights, checkIn.toISOString(), rp.discountRules)
                    : 0
            return sum + qty * (discountPct > 0 ? basePrice * (1 - discountPct / 100) : basePrice)
        }, 0)
    }, [selectedQuantitiesByPlan, sortedRatePlans, nights, checkIn])

    const bookingDetailsActions = useBookingDetailsActions()
    const handleBookingDetailsUpdate = useBookingDetailsUpdate()

    const handleConfirmExtend = useCallback(
        async (nights: number, ratePlanId: number) => {
            if (!checkIn) return
            const newCheckOut = format(addDays(checkIn, nights), 'yyyy-MM-dd')
            bookingDetailsActions.updateTempBookingDetails('checkOutDate', newCheckOut)
            await handleBookingDetailsUpdate({ roomClassId: roomClass.id, ratePlanId })
            setExtendModalRatePlanId(null)
            requestAnimationFrame(() => {
                document
                    .getElementById(`count-room-package-${ratePlanId}`)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            })
        },
        [checkIn, bookingDetailsActions, handleBookingDetailsUpdate, roomClass.id]
    )

    const handleConfirmPendingIncrease = useCallback(() => {
        if (!pendingIncrease) return
        const { ratePlanId, nextQuantity, occupancyOptionId } = pendingIncrease
        if (onUpdatePlanQuantity) {
            onUpdatePlanQuantity(roomClass.id, ratePlanId, nextQuantity, occupancyOptionId)
        } else {
            handleQuantityChange(nextQuantity)
        }
        setPendingIncrease(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingIncrease, onUpdatePlanQuantity, roomClass.id])

    const handleQuantityChange = (newQuantity: number) => {
        const maxRooms = roomClass.availableRooms ?? roomClass.numberOfRooms ?? 0
        if (newQuantity >= 0 && newQuantity <= maxRooms) {
            onUpdateQuantity(roomClass.id, newQuantity)
        }
    }

    const handleRatePlanSelect = (ratePlanId: number) => {
        setSelectedRatePlanId(ratePlanId)
    }

    const handlePlanQuantityDecrease = (ratePlanId: number, currentQuantity: number, occupancyOptionId?: number) => {
        if (currentQuantity <= 0) return

        const nextQuantity = currentQuantity - 1

        if (onUpdatePlanQuantity) {
            onUpdatePlanQuantity(roomClass.id, ratePlanId, nextQuantity, occupancyOptionId)
            return
        }

        handleQuantityChange(nextQuantity)
        if (nextQuantity === 0 && selectedRatePlanId === ratePlanId) {
            setSelectedRatePlanId(undefined)
        }
    }

    const handlePlanQuantityIncrease = (
        ratePlanId: number,
        currentQuantity: number,
        remaining: number,
        occupancyOptionId?: number
    ) => {
        if (remaining <= 0) return

        const nextQuantity = currentQuantity > 0 ? currentQuantity + 1 : 1
        const newTotal = totalRooms + 1

        if (totalRooms <= MULTI_ROOM_THRESHOLD && newTotal > MULTI_ROOM_THRESHOLD) {
            setPendingIncrease({ ratePlanId, nextQuantity, occupancyOptionId, newTotal })
            return
        }

        if (onUpdatePlanQuantity) {
            onUpdatePlanQuantity(roomClass.id, ratePlanId, nextQuantity, occupancyOptionId)
            return
        }

        if (currentQuantity <= 0 && selectedRatePlanId !== ratePlanId) {
            handleRatePlanSelect(ratePlanId)
        }

        handleQuantityChange(nextQuantity)
    }

    const shouldWrapBedConfiguration = (roomClass.bedConfiguration?.length ?? 0) > 18

    return (
        <>
            <div
                role="region"
                aria-label={`Room: ${roomClass.name}`}
                className={cn(
                    'w-full overflow-hidden rounded-xl bg-stone-50',
                    isClassSelected ? 'border-2 border-teal-500' : 'border border-stone-200',
                    className
                )}>

                <div className="flex flex-col lg:flex-row">
                    {/* ── LEFT COLUMN: carousel + room name + amenities ── */}
                    <div className="flex-shrink-0 p-4 lg:w-[420px] lg:border-r lg:border-stone-200 lg:p-5">
                        <RoomImagesCarousel images={getRoomCardImageUrls(roomClass)} roomName={roomClass.name} />

                        <h2 className="mt-3 text-xl font-bold text-gray-900">{roomClass.name}</h2>

                        {(roomClass.roomSize || roomClass.bedConfiguration) && (
                            <div className="mt-1.5 grid grid-cols-1 gap-y-2 text-sm text-gray-500 sm:grid-cols-2 sm:gap-x-4">
                                {roomClass.roomSize && (
                                    <span className="flex min-w-0 items-start gap-1.5">
                                        <Maximize2 size={15} className="shrink-0 text-[#0E7C86]" />
                                        <span className="font-semibold whitespace-nowrap">
                                            Room size: {roomClass.roomSize} m²
                                        </span>
                                    </span>
                                )}
                                {roomClass.bedConfiguration && (
                                    <span
                                        className={cn(
                                            'flex min-w-0 items-start gap-1.5',
                                            shouldWrapBedConfiguration && 'sm:col-span-2'
                                        )}>
                                        <BedDouble size={15} className="shrink-0 text-[#0E7C86]" />
                                        <span className="leading-snug font-semibold">{roomClass.bedConfiguration}</span>
                                    </span>
                                )}
                            </div>
                        )}

                        {roomFeatures.length > 0 && (
                            <div className="mt-3">
                                <ul
                                    aria-label="Room amenities"
                                    className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    {roomFeatures.slice(0, VISIBLE_ROOM_FEATURES).map((feature, idx) => (
                                        <li
                                            key={`${feature.name}-${idx}`}
                                            className="flex items-start gap-2 text-sm text-gray-500">
                                            {feature.image?.[0]?.url ? (
                                                <img
                                                    src={feature.image[0].url}
                                                    alt={feature.name}
                                                    width={16}
                                                    height={16}
                                                    className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-sm object-contain"
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            ) : (
                                                <Check
                                                    size={14}
                                                    className="mt-0.5 flex-shrink-0 text-green-600"
                                                />
                                            )}
                                            <span>{feature.name}</span>
                                        </li>
                                    ))}
                                </ul>
                                {roomFeatures.length > VISIBLE_ROOM_FEATURES && (
                                    <button
                                        type="button"
                                        aria-haspopup="dialog"
                                        onClick={() => setIsFeatureModalOpen(true)}
                                        className="mt-2 flex cursor-pointer items-center gap-1 text-sm font-medium text-[#0a6570] hover:text-[#0E7C86]">
                                        <ChevronDown size={14} />
                                        <span>{t('showMoreFeatures')}</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT COLUMN: rate plans ── */}
                    <div className="flex-1 flex flex-col p-4 lg:p-5">
                        {!isSingleRatePlanMode && visibleRatePlanCount > 0 && (
                            <div className="mb-4 text-xs font-semibold tracking-widest text-gray-500 uppercase">
                                {t('ratePlansAvailable', { count: visibleRatePlanCount })}
                            </div>
                        )}

                        <div className="flex flex-1 flex-col gap-2">
                            {sortedRatePlans.length > 0 ? (
                                sortedRatePlans.map((ratePlan) => {
                                    const occupancyOption = ratePlan.occupancyOptions[0]
                                    if (!occupancyOption) return null

                                    const selectedQtyForPlan = selectedQuantitiesByPlan
                                        ? (selectedQuantitiesByPlan[ratePlan.id] ?? 0)
                                        : selectedRatePlanId === ratePlan.id
                                          ? selectedQuantity
                                          : 0
                                    const totalSelectedForClass = selectedQuantitiesByPlan
                                        ? Object.values(selectedQuantitiesByPlan).reduce((s, v) => s + (v || 0), 0)
                                        : selectedQuantity
                                    const capacity = (roomClass.availableRooms ?? roomClass.numberOfRooms ?? 0) || 0
                                    const remaining = Math.max(0, capacity - totalSelectedForClass)
                                    const isRatePlanSelected = selectedQtyForPlan > 0

                                    const ratePlanFeatures = ratePlan.features ?? []
                                    const visibleRatePlanFeatures = ratePlanFeatures.slice(0, VISIBLE_RATE_PLAN_FEATURES)
                                    const hiddenRatePlanFeaturesCount = Math.max(
                                        0,
                                        ratePlanFeatures.length - VISIBLE_RATE_PLAN_FEATURES
                                    )
                                    const ratePlanDescription = ratePlan.description?.trim()

                                    const promotion = ratePlan.promotion ?? null
                                    const accentStyle = promotion ? ACCENT_STYLES[promotion.accentColor] : null
                                    const isDeepLinked = initialRatePlanId === ratePlan.id

                                    const losDiscounts = ratePlan.discountRules?.losDiscounts ?? []
                                    const promoMinNights =
                                        promotion && losDiscounts.length > 0
                                            ? Math.min(...losDiscounts.map((t) => t.minNights))
                                            : null
                                    const isLockedPromo = promoMinNights != null && nights < promoMinNights
                                    const isNextLockedPromo = ratePlan.id === nextLockedPromoRatePlanId

                                    const hasApiPrice =
                                        ratePlan.prices?.totalPrice != null &&
                                        ratePlan.prices.totalPrice > 0
                                    const originalTotal = hasApiPrice
                                        ? ratePlan.prices!.totalPrice
                                        : occupancyOption.rate * nights
                                    const displayRate =
                                        hasApiPrice && nights > 0
                                            ? ratePlan.prices!.totalPrice / nights
                                            : occupancyOption.rate

                                    const discountPercent =
                                        ratePlan.discountRules && checkIn && nights > 0
                                            ? calculateRatePlanDiscountPercent(
                                                  nights,
                                                  checkIn.toISOString(),
                                                  ratePlan.discountRules
                                              )
                                            : 0
                                    const discountedTotal =
                                        discountPercent > 0
                                            ? originalTotal * (1 - discountPercent / 100)
                                            : originalTotal

                                    const showPromoPrice =
                                        promotion &&
                                        promotion.anchorTotal != null &&
                                        promotion.anchorTotal > discountedTotal
                                    const showLegacyDiscount = !promotion && discountPercent > 0

                                    const promoRawTotal = ratePlan.prices?.totalPrice ?? 0
                                    const promoDiscountPercent =
                                        ratePlan.discountRules && checkIn && nights > 0
                                            ? calculateRatePlanDiscountPercent(nights, checkIn.toISOString(), ratePlan.discountRules)
                                            : 0
                                    const promoDiscountedTotal =
                                        promoDiscountPercent > 0
                                            ? promoRawTotal * (1 - promoDiscountPercent / 100)
                                            : promoRawTotal
                                    const promoSavePercent =
                                        promotion?.anchorTotal && promotion.anchorTotal > promoDiscountedTotal
                                            ? Math.round(((promotion.anchorTotal - promoDiscountedTotal) / promotion.anchorTotal) * 100)
                                            : null

                                    if (isLockedPromo && !isNextLockedPromo) return null

                                    const showRecommendedBadge = anyPromoIsRecommended
                                        ? Boolean(promotion) && (isDeepLinked || ratePlan.isDefault)
                                        : isDeepLinked || ratePlan.isDefault

                                    /* ── Stepper shared between both modes ── */
                                    const stepper = (
                                        <div
                                            id={`count-room-package-${ratePlan.id}`}
                                            className="flex items-center gap-0 rounded-lg border border-gray-300 bg-white">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handlePlanQuantityDecrease(
                                                        ratePlan.id,
                                                        selectedQtyForPlan,
                                                        occupancyOption?.id
                                                    )
                                                }}
                                                disabled={selectedQtyForPlan === 0}
                                                className="cursor-pointer rounded-l-lg p-2 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                aria-label="Decrease quantity">
                                                <Minus size={16} className="text-gray-600" />
                                            </button>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                value={isRatePlanSelected ? selectedQtyForPlan : 0}
                                                onChange={(e) => {
                                                    e.stopPropagation()
                                                    if (isRatePlanSelected) {
                                                        const raw = parseInt(e.target.value) || 0
                                                        const maxAllowed = selectedQtyForPlan + remaining
                                                        const value = Math.min(raw, maxAllowed)
                                                        if (onUpdatePlanQuantity) {
                                                            onUpdatePlanQuantity(
                                                                roomClass.id,
                                                                ratePlan.id,
                                                                value,
                                                                occupancyOption?.id
                                                            )
                                                        } else {
                                                            handleQuantityChange(value)
                                                        }
                                                    }
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                disabled={!isRatePlanSelected}
                                                className="w-12 border-0 text-center text-sm font-semibold focus:ring-0 focus:outline-none disabled:opacity-50"
                                                aria-label="Room quantity"
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handlePlanQuantityIncrease(
                                                        ratePlan.id,
                                                        selectedQtyForPlan,
                                                        remaining,
                                                        occupancyOption?.id
                                                    )
                                                }}
                                                disabled={remaining <= 0}
                                                className="cursor-pointer rounded-r-lg p-2 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                aria-label="Increase quantity">
                                                <Plus size={16} className="text-gray-600" />
                                            </button>
                                        </div>
                                    )

                                    return (
                                        <React.Fragment key={ratePlan.id}>
                                            {isSingleRatePlanMode ? (
                                                /* ══ SINGLE PLAN MODE ══ */
                                                <div
                                                    ref={isDeepLinked ? deepLinkedCardRef : undefined}
                                                    className={cn(
                                                        isLockedPromo
                                                            ? 'rounded-xl border border-dashed border-amber-300 bg-amber-50/40 p-4'
                                                            : 'flex-1 flex flex-col space-y-6'
                                                    )}>
                                                    {/* Name + badge row */}
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="text-base font-bold text-gray-900 lg:text-lg">
                                                            {ratePlan.name}
                                                        </h3>
                                                        {showRecommendedBadge && !isLockedPromo && (
                                                            <span className="rounded-full bg-[#0E7C86] px-3 py-0.5 text-xs font-semibold text-white">
                                                                Recommended
                                                            </span>
                                                        )}
                                                        {!isLockedPromo && promotion && (
                                                            <span className={cn(
                                                                'rounded-full px-3 py-0.5 text-xs font-semibold text-white',
                                                                accentStyle!.badge
                                                            )}>
                                                                ✦ SPECIAL
                                                            </span>
                                                        )}
                                                        {isLockedPromo && (
                                                            <span className="flex items-center gap-1 rounded-full bg-amber-600 px-3 py-0.5 text-xs font-semibold text-white">
                                                                <Lock size={10} aria-hidden />
                                                                LOCKED
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="text-sm text-gray-500">
                                                        {t('onlyRatePlanAvailable')}
                                                    </div>

                                                    {!isLockedPromo && promotion && promoSavePercent != null && promoSavePercent > 0 && (
                                                        <span className={cn('rounded px-1.5 py-0.5 text-xs font-semibold', accentStyle!.pill)}>
                                                            Save {promoSavePercent}%
                                                        </span>
                                                    )}

                                                    {/* Features box */}
                                                    {!hideRatePlanFeatures && ratePlanFeatures.length > 0 ? (
                                                        <div className="rounded-lg border border-stone-200 bg-white p-3">
                                                            <ul className={cn('space-y-2', isLockedPromo && 'opacity-50')}>
                                                                {visibleRatePlanFeatures.map((feature) => (
                                                                    <li
                                                                        key={`${ratePlan.id}-${feature.id}`}
                                                                        className="flex items-center gap-2 text-sm text-gray-700">
                                                                        {feature.image?.[0]?.url ? (
                                                                            <img
                                                                                src={feature.image[0].url}
                                                                                alt={feature.label}
                                                                                width={16}
                                                                                height={16}
                                                                                className="h-4 w-4 flex-shrink-0 rounded-sm object-contain"
                                                                            />
                                                                        ) : (
                                                                            <Check
                                                                                size={14}
                                                                                className="flex-shrink-0 text-green-600"
                                                                            />
                                                                        )}
                                                                        {feature.label}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                            {hiddenRatePlanFeaturesCount > 0 && (
                                                                <button
                                                                    type="button"
                                                                    aria-haspopup="dialog"
                                                                    onClick={() =>
                                                                        setExpandedRatePlanFeatures({
                                                                            features: ratePlanFeatures,
                                                                            ratePlanName: ratePlan.name
                                                                        })
                                                                    }
                                                                    className="mt-2 flex cursor-pointer items-center gap-1 text-sm font-medium text-[#0a6570] hover:text-[#0E7C86]">
                                                                    <ChevronDown size={14} />
                                                                    <span>Show {hiddenRatePlanFeaturesCount} more</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : ratePlanDescription ? (
                                                        <div className="rounded-lg border border-stone-200 bg-white p-3 text-sm leading-6 whitespace-pre-line text-gray-700">
                                                            {ratePlanDescription}
                                                        </div>
                                                    ) : null}

                                                    {/* Occupancy */}
                                                    <div>
                                                        <div className="mb-1 text-xs font-semibold tracking-widest text-gray-400 uppercase">
                                                            OCCUPANCY
                                                        </div>
                                                        <div aria-label="Occupancy" className="text-sm text-gray-700">
                                                            Adults:{' '}
                                                            <span className="font-semibold text-gray-900">
                                                                {roomClass.numberOfAdults ?? 0}
                                                            </span>{' '}
                                                            Children:{' '}
                                                            <span className="font-semibold text-gray-900">
                                                                {roomClass.numberOfChildren ?? 0}
                                                            </span>{' '}
                                                            Infants:{' '}
                                                            <span className="font-semibold text-gray-900">
                                                                {roomClass.numberOfInfants ?? 0}
                                                            </span>{' '}
                                                            Pet:{' '}
                                                            <span className="font-semibold text-gray-900">
                                                                {roomClass.petAllowed ? 'Yes' : 'No'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Pricing */}
                                                    {isLockedPromo && promoMinNights != null ? (() => {
                                                        const pricePerNight = occupancyOption.rate
                                                        const lockTier = (losDiscounts.find((t) => t.minNights === promoMinNights) ?? losDiscounts[0])!
                                                        const lockOriginalTotal = pricePerNight * promoMinNights
                                                        const lockDiscountedTotal = lockOriginalTotal * (1 - lockTier.discountPercent / 100)
                                                        const lockSavings = Math.round(lockOriginalTotal - lockDiscountedTotal)

                                                        return (
                                                            <div>
                                                                <div className="text-sm font-medium text-amber-700">
                                                                    At {promoMinNights} nights
                                                                </div>
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className="text-sm text-gray-400 line-through">
                                                                        ฿{formatPrice(lockOriginalTotal)}
                                                                    </span>
                                                                    <span className="text-3xl font-bold text-amber-700">
                                                                        ฿{formatPrice(lockDiscountedTotal)}
                                                                    </span>
                                                                </div>
                                                                <div className="mt-0.5 text-xs font-medium text-amber-600">
                                                                    You&apos;d save ฿{formatPrice(lockSavings)}
                                                                </div>
                                                            </div>
                                                        )
                                                    })() : (
                                                        <div>
                                                            <div className="text-sm text-gray-600">
                                                                {nights} {nights === 1 ? 'night' : 'nights'} × ฿{formatPrice(displayRate)}
                                                            </div>
                                                            {showLegacyDiscount && (
                                                                <div className="text-sm text-gray-400 line-through">
                                                                    ฿{formatPrice(originalTotal)}
                                                                </div>
                                                            )}
                                                            <div className="flex items-baseline gap-2">
                                                                {showPromoPrice && (
                                                                    <span className="text-sm text-gray-400 line-through">
                                                                        ฿{formatPrice(promotion!.anchorTotal!)}
                                                                    </span>
                                                                )}
                                                                <span className="text-3xl font-bold text-[#0a6570]">
                                                                    ฿{formatPrice(discountedTotal)}
                                                                </span>
                                                                {showLegacyDiscount && (
                                                                    <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-semibold text-green-700">
                                                                        -{discountPercent}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="mt-0.5 text-xs text-gray-500">
                                                                {hasApiPrice
                                                                    ? 'Total select price for your dates'
                                                                    : 'Per night before taxes and fees'}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Controls */}
                                                    <div className="mt-auto border-t border-stone-100 pt-3">
                                                        {isLockedPromo ? (
                                                            <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
                                                                <Lock size={16} className="text-amber-500" aria-label="Locked — extend stay to unlock" />
                                                                Extend stay to unlock
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-between gap-3">
                                                                {roomClass.availableRooms !== undefined &&
                                                                    (roomClass.availableRooms || 0) < 3 ? (
                                                                        <div className="text-xs font-medium text-red-600">
                                                                            Only {roomClass.availableRooms} left!
                                                                        </div>
                                                                    ) : <div />}
                                                                {stepper}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                /* ══ MULTI PLAN MODE ══ */
                                                <div
                                                    ref={isDeepLinked ? deepLinkedCardRef : undefined}
                                                    className={cn(
                                                        'rounded-xl border bg-white p-3 lg:p-4 transition-colors',
                                                        isLockedPromo
                                                            ? 'border-dashed border-amber-300 bg-amber-50/40'
                                                            : isEnabledSelected && isRatePlanSelected
                                                              ? 'border-2 border-teal-500'
                                                              : promotion
                                                                ? cn(accentStyle!.border, 'hover:border-[#0E7C86]')
                                                                : 'border-stone-200 hover:border-[#0E7C86]'
                                                    )}>
                                                    {/* Top row: name + badge + price */}
                                                    <div className="mb-3 flex items-start justify-between gap-3">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="text-sm font-semibold text-gray-900">
                                                                {ratePlan.name}
                                                            </h3>
                                                            {showRecommendedBadge && !isLockedPromo && (
                                                                <span className="rounded-full bg-[#0E7C86] px-2.5 py-0.5 text-xs font-semibold text-white">
                                                                    Recommended
                                                                </span>
                                                            )}
                                                            {!isLockedPromo && promotion && (
                                                                <span className={cn(
                                                                    'rounded-full px-2.5 py-0.5 text-xs font-semibold text-white',
                                                                    accentStyle!.badge
                                                                )}>
                                                                    ✦ SPECIAL
                                                                </span>
                                                            )}
                                                            {isLockedPromo && (
                                                                <span className="flex items-center gap-1 rounded-full bg-amber-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                                                                    <Lock size={9} aria-hidden />
                                                                    LOCKED
                                                                </span>
                                                            )}
                                                            {!isLockedPromo && promotion && promoSavePercent != null && promoSavePercent > 0 && (
                                                                <span className={cn('rounded px-1.5 py-0.5 text-xs font-semibold', accentStyle!.pill)}>
                                                                    Save {promoSavePercent}%
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="shrink-0 text-xl font-bold text-[#0a6570]">
                                                            {isLockedPromo && promoMinNights != null ? (() => {
                                                                const pricePerNight = occupancyOption.rate
                                                                const lockTier = (losDiscounts.find((t) => t.minNights === promoMinNights) ?? losDiscounts[0])!
                                                                const lockDiscountedTotal = pricePerNight * promoMinNights * (1 - lockTier.discountPercent / 100)
                                                                return <span className="text-amber-700">฿{formatPrice(lockDiscountedTotal)}</span>
                                                            })() : (
                                                                <>
                                                                    {showPromoPrice && (
                                                                        <span className="mr-1.5 text-sm text-gray-400 line-through">
                                                                            ฿{formatPrice(promotion!.anchorTotal!)}
                                                                        </span>
                                                                    )}
                                                                    ฿{formatPrice(discountedTotal)}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Features */}
                                                    {!hideRatePlanFeatures && ratePlanFeatures.length > 0 ? (
                                                        <div className="mb-3">
                                                            <ul className={cn(
                                                                'grid grid-cols-2 gap-x-3 gap-y-1.5',
                                                                isLockedPromo && 'opacity-50'
                                                            )}>
                                                                {visibleRatePlanFeatures.map((feature) => (
                                                                    <li
                                                                        key={`${ratePlan.id}-${feature.id}`}
                                                                        className="flex items-center gap-1.5 text-xs text-gray-700">
                                                                        {feature.image?.[0]?.url ? (
                                                                            <img
                                                                                src={feature.image[0].url}
                                                                                alt={feature.label}
                                                                                width={14}
                                                                                height={14}
                                                                                className="h-3.5 w-3.5 flex-shrink-0 rounded-sm object-contain"
                                                                            />
                                                                        ) : (
                                                                            <Check
                                                                                size={12}
                                                                                className="flex-shrink-0 text-green-600"
                                                                            />
                                                                        )}
                                                                        {feature.label}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                            {hiddenRatePlanFeaturesCount > 0 && (
                                                                <button
                                                                    type="button"
                                                                    aria-haspopup="dialog"
                                                                    onClick={() =>
                                                                        setExpandedRatePlanFeatures({
                                                                            features: ratePlanFeatures,
                                                                            ratePlanName: ratePlan.name
                                                                        })
                                                                    }
                                                                    className="mt-1.5 flex cursor-pointer items-center gap-1 text-xs font-medium text-[#0a6570] hover:text-[#0E7C86]">
                                                                    <ChevronDown size={12} />
                                                                    <span>Show {hiddenRatePlanFeaturesCount} more</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : ratePlanDescription ? (
                                                        <div className="mb-3 text-xs leading-5 whitespace-pre-line text-gray-700">
                                                            {ratePlanDescription}
                                                        </div>
                                                    ) : null}

                                                    {/* Bottom action row */}
                                                    <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-3">
                                                        <div className={cn(
                                                            'text-sm',
                                                            isEnabledSelected && isRatePlanSelected
                                                                ? 'font-medium text-teal-600'
                                                                : 'text-gray-600'
                                                        )}>
                                                            {isLockedPromo && promoMinNights != null ? (
                                                                <span className="font-medium text-amber-700">
                                                                    At {promoMinNights} nights
                                                                </span>
                                                            ) : isEnabledSelected && isRatePlanSelected ? (
                                                                `${selectedQtyForPlan} ${selectedQtyForPlan === 1 ? 'room' : 'rooms'} · ฿${formatPrice(discountedTotal)}`
                                                            ) : (
                                                                `${nights} ${nights === 1 ? 'night' : 'nights'} × ฿${formatPrice(discountedTotal)}`
                                                            )}
                                                        </div>

                                                        {isLockedPromo ? (
                                                            <Lock size={18} className="text-amber-400" aria-label="Locked — extend stay to unlock" />
                                                        ) : isEnabledSelected && isRatePlanSelected ? (
                                                            stepper
                                                        ) : isEnabledSelected ? (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handlePlanQuantityIncrease(
                                                                        ratePlan.id,
                                                                        0,
                                                                        remaining,
                                                                        occupancyOption?.id
                                                                    )
                                                                }}
                                                                disabled={remaining <= 0}
                                                                className="shrink-0 cursor-pointer rounded-full border border-orange-500 px-5 py-1.5 text-sm font-medium text-[#0a6570] transition-colors hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50">
                                                                Select
                                                            </button>
                                                        ) : null}
                                                    </div>

                                                    {roomClass.availableRooms !== undefined &&
                                                        (roomClass.availableRooms || 0) < 3 && (
                                                            <div className="mt-2 text-xs font-medium text-red-600">
                                                                Only {roomClass.availableRooms} rooms left!
                                                            </div>
                                                        )}
                                                </div>
                                            )}

                                            {(() => {
                                                if (!losDiscounts.length || !checkIn) return null

                                                const pricePerNight = hasApiPrice
                                                    ? ratePlan.prices!.totalPrice / nights
                                                    : occupancyOption.rate

                                                return (
                                                    <>
                                                        <LosUpsellBanner
                                                            losDiscounts={losDiscounts}
                                                            currentNights={nights}
                                                            pricePerNight={pricePerNight}
                                                            onPreview={() => setExtendModalRatePlanId(ratePlan.id)}
                                                        />
                                                        <LosExtendModal
                                                            open={extendModalRatePlanId === ratePlan.id}
                                                            ratePlan={ratePlan}
                                                            occupancyOption={occupancyOption}
                                                            checkIn={checkIn}
                                                            onConfirm={(n) => handleConfirmExtend(n, ratePlan.id)}
                                                            onClose={() => setExtendModalRatePlanId(null)}
                                                        />
                                                    </>
                                                )
                                            })()}
                                        </React.Fragment>
                                    )
                                })
                            ) : (
                                <div className="rounded-xl border border-stone-200 bg-white p-8 text-center">
                                    <div className="mb-2 text-sm text-gray-500">No rate plans available</div>
                                    <div className="text-xl font-bold text-[#0a6570]">
                                        ฿{formatPrice(Number(fallbackPrice || 0))}
                                    </div>
                                    <div className="text-xs text-gray-500">Base price per night</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── SELECTION SUMMARY FOOTER ── */}
                {totalSelectedAcrossPlans > 0 && (
                    <div
                        aria-label="Selection summary"
                        className="flex items-center justify-between gap-4 bg-teal-700 px-5 py-3">
                        <div className="flex flex-wrap items-center gap-x-2 text-sm text-white">
                            <span className="flex items-center gap-1.5 text-base font-semibold">
                                <Check size={16} />
                                {totalSelectedAcrossPlans} {t('roomsSelected')}
                            </span>
                            {selectionBreakdown && (
                                <>
                                    <span aria-hidden className="opacity-60">·</span>
                                    <span className="font-medium">{selectionBreakdown}</span>
                                </>
                            )}
                        </div>
                        {totalSelectedPrice > 0 && (
                            <div className="shrink-0 font-bold text-white">
                                ฿{formatPrice(totalSelectedPrice)}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <RoomFeaturesDialog
                bedConfiguration={roomClass.bedConfiguration}
                features={roomFeatures}
                open={isFeatureModalOpen}
                onOpenChange={setIsFeatureModalOpen}
                roomName={roomClass.name}
                roomSize={roomClass.roomSize}
            />
            <RatePlanFeaturesDialog
                features={expandedRatePlanFeatures?.features ?? []}
                open={Boolean(expandedRatePlanFeatures)}
                onOpenChange={(open) => {
                    if (!open) {
                        setExpandedRatePlanFeatures(null)
                    }
                }}
                ratePlanName={expandedRatePlanFeatures?.ratePlanName ?? ''}
            />

            <Dialog open={pendingIncrease !== null} onOpenChange={(open) => { if (!open) setPendingIncrease(null) }}>
                <DialogContent className="max-sm:inset-0 max-sm:flex max-sm:h-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:flex-col max-sm:justify-center max-sm:rounded-none sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[#0a6570]">Confirm Multi-Room Booking</DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-gray-700">
                        <p>
                            You&apos;ve selected {pendingIncrease?.newTotal} rooms in total. Please confirm you&apos;d like to book more than {MULTI_ROOM_THRESHOLD} room.
                        </p>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setPendingIncrease(null)} className="cursor-pointer hover:bg-gray-100">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmPendingIncrease} className="cursor-pointer bg-[#0a6570] text-white hover:bg-[#0E7C86]">
                            I understand
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
