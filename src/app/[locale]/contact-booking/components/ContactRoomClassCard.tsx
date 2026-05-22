'use client'

import { Check, Minus, Plus } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import React from 'react'

import { getRoomCoverImageUrl } from '@/lib/room-image-url'
import { cn } from '@/lib/utils'
import { AvailableRoomClass } from '@/types/room-management'

interface ContactRoomClassCardProps {
    roomClass: AvailableRoomClass
    selectedQuantity: number
    onUpdateQuantity: (roomClassId: number, quantity: number) => void
    className?: string
}

export const ContactRoomClassCard: React.FC<ContactRoomClassCardProps> = ({
    roomClass,
    selectedQuantity,
    onUpdateQuantity,
    className
}) => {
    const t = useTranslations('ContactBooking')

    const isSelected = selectedQuantity > 0
    const maxRooms = roomClass.numberOfRooms || 0

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 0 && newQuantity <= maxRooms) {
            onUpdateQuantity(roomClass.id, newQuantity)
        }
    }

    const handleSelect = () => {
        if (isSelected) {
            handleQuantityChange(0)
        } else {
            handleQuantityChange(1)
        }
    }

    return (
        <div
            role="region"
            aria-label={`Room: ${roomClass.name}`}
            className={cn(
                'bg-white rounded-lg border transition-all hover:shadow-md',
                isSelected ? 'border-green-600 bg-green-50 shadow-sm' : 'border-gray-200 hover:border-orange-500',
                className
            )}>
            <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
                <Image
                    src={getRoomCoverImageUrl(roomClass)}
                    alt={`${roomClass.name} - Hotel room`}
                    fill
                    className="object-cover"
                />
                {isSelected && (
                    <div className="absolute top-2 right-2 rounded-full bg-green-600 p-1 text-white">
                        <Check size={16} />
                    </div>
                )}
            </div>

            <div className="p-4">
                <h3 className="mb-2 line-clamp-1 text-base font-semibold text-gray-900">{roomClass.name}</h3>

                {roomClass.description && (
                    <p className="mb-3 line-clamp-2 text-xs text-gray-600">{roomClass.description}</p>
                )}

                <div className="mb-3 flex items-center gap-3 text-xs text-gray-600">
                    {roomClass.numberOfAdults !== null && roomClass.numberOfAdults !== undefined && (
                        <span>
                            <span className="font-semibold text-gray-900">{roomClass.numberOfAdults}</span>{' '}
                            {t('adults')}
                        </span>
                    )}
                    {roomClass.numberOfChildren !== null && roomClass.numberOfChildren !== undefined && (
                        <span>
                            <span className="font-semibold text-gray-900">{roomClass.numberOfChildren}</span>{' '}
                            {t('children')}
                        </span>
                    )}
                </div>

                {roomClass.features && roomClass.features.length > 0 && (
                    <div className="mb-3">
                        <ul className="space-y-1">
                            {roomClass.features.slice(0, 3).map((feature, index) => (
                                <li key={index} className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <Check size={12} className="flex-shrink-0 text-green-600" />
                                    <span className="line-clamp-1">{feature.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {roomClass.availableRooms !== undefined && (
                    <div className="mb-3 text-xs text-gray-600">
                        <span className="font-semibold text-gray-900">{roomClass.availableRooms}</span>{' '}
                        {t('availableRooms') || 'available'}
                        {roomClass.availableRooms < 3 && roomClass.availableRooms > 0 && (
                            <span className="ml-2 font-medium text-red-600">
                                {t('limitedAvailability') || 'Limited'}
                            </span>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    {isSelected ? (
                        <>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-green-700">
                                    {selectedQuantity}{' '}
                                    {selectedQuantity === 1 ? t('room') || 'room' : t('rooms') || 'rooms'}{' '}
                                    {t('selected') || 'selected'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleQuantityChange(selectedQuantity - 1)}
                                    disabled={selectedQuantity === 0}
                                    className="flex-1 rounded-md border border-gray-300 p-1.5 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    aria-label="Decrease quantity">
                                    <Minus size={14} className="mx-auto text-gray-600" />
                                </button>

                                <input
                                    type="number"
                                    min="0"
                                    max={maxRooms}
                                    value={selectedQuantity}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value) || 0
                                        handleQuantityChange(value)
                                    }}
                                    className="w-12 rounded-md border border-gray-300 py-1.5 text-center text-sm font-semibold focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                    aria-label="Room quantity"
                                />

                                <button
                                    type="button"
                                    onClick={() => handleQuantityChange(selectedQuantity + 1)}
                                    disabled={selectedQuantity >= maxRooms}
                                    className="flex-1 rounded-md border border-gray-300 p-1.5 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    aria-label="Increase quantity">
                                    <Plus size={14} className="mx-auto text-gray-600" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={handleSelect}
                            className={cn(
                                'w-full py-2 rounded-md font-medium text-sm transition-colors',
                                isSelected
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-[#0a6570] text-white hover:bg-[#0E7C86]'
                            )}>
                            {t('select') || 'SELECT'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
