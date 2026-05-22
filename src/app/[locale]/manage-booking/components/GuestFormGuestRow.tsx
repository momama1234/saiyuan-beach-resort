'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

import type { RoomGuestSlot, RoomGuestsState } from '../types/manage-booking-types'

export interface GuestFormGuestRowProps {
    guest: RoomGuestSlot
    room: RoomGuestsState
    roomIndex: number
    guestIndex: number
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onUpdateGuest: (
        roomIndex: number,
        guestIndex: number,
        field: keyof RoomGuestSlot,
        value: string | boolean | number | undefined
    ) => void
    onOpenScanModal: (roomIndex: number, guestIndex: number) => void
}

export function GuestFormGuestRow({
    guest,
    room,
    roomIndex,
    guestIndex,
    isOpen,
    onOpenChange,
    onUpdateGuest,
    onOpenScanModal
}: GuestFormGuestRowProps) {
    const t = useTranslations('ManageBooking')

    const guestLabel =
        (guest.guestType === 'adult' && `${t('adult') || 'Adult'} ${guestIndex + 1}`) ||
        (guest.guestType === 'child' &&
            `${t('child') || 'Child'} ${guestIndex - room.occupancy.numberOfAdults + 1}`) ||
        (guest.guestType === 'infant' &&
            `${t('infant') || 'Infant'} ${
                guestIndex -
                room.occupancy.numberOfAdults -
                room.occupancy.numberOfChildren +
                1
            }`) ||
        ''
    const guestSummary =
        [guest.firstName, guest.lastName].filter(Boolean).join(' ').trim() || guest.email || null

    return (
        <Collapsible open={isOpen} onOpenChange={onOpenChange}>
            <div className="rounded-md border border-gray-200 bg-white">
                <CollapsibleTrigger
                    className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-t-md p-3 text-left hover:bg-gray-50 focus:ring-2 focus:ring-[#0E7C86] focus:ring-offset-1 focus:outline-none"
                    aria-expanded={isOpen}
                >
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-700">
                            {guestLabel}
                            {guest.isMainGuest && (
                                <span className="ml-2 text-xs text-[#0E7C86]">
                                    ({t('primaryGuest') || 'Primary'})
                                </span>
                            )}
                        </p>
                        {!isOpen && guestSummary && (
                            <p className="mt-0.5 truncate text-xs text-gray-500">{guestSummary}</p>
                        )}
                    </div>
                    <span className="shrink-0 text-gray-500" aria-hidden>
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="grid gap-3 border-t border-gray-200 p-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-0.5 block text-xs font-medium text-gray-600">
                                {t('firstName')}
                            </label>
                            <input
                                type="text"
                                value={guest.firstName}
                                onChange={(e) => onUpdateGuest(roomIndex, guestIndex, 'firstName', e.target.value)}
                                className="h-10 w-full rounded border border-gray-300 px-3 text-sm focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none"
                                aria-label={`${guest.guestType} firstName`}
                            />
                        </div>
                        <div>
                            <label className="mb-0.5 block text-xs font-medium text-gray-600">
                                {t('lastName')}
                            </label>
                            <input
                                type="text"
                                value={guest.lastName}
                                onChange={(e) => onUpdateGuest(roomIndex, guestIndex, 'lastName', e.target.value)}
                                className="h-10 w-full rounded border border-gray-300 px-3 text-sm focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none"
                                aria-label={`${guest.guestType} lastName`}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="mb-0.5 block text-xs font-medium text-gray-600">
                                {t('email')}
                            </label>
                            <input
                                type="email"
                                value={guest.email}
                                onChange={(e) => onUpdateGuest(roomIndex, guestIndex, 'email', e.target.value)}
                                className="h-10 w-full rounded border border-gray-300 px-3 text-sm focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none"
                                aria-label={`${guest.guestType} email`}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="mb-0.5 block text-xs font-medium text-gray-600">
                                {t('phone')}
                            </label>
                            <input
                                type="tel"
                                value={guest.phone}
                                onChange={(e) => onUpdateGuest(roomIndex, guestIndex, 'phone', e.target.value)}
                                className="h-10 w-full rounded border border-gray-300 px-3 text-sm focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none"
                                aria-label={`${guest.guestType} phone`}
                            />
                        </div>
                        <div>
                            <label className="mb-0.5 block text-xs font-medium text-gray-600">
                                {t('dateOfBirth')}
                            </label>
                            <input
                                type="text"
                                placeholder="yyyy-MM-dd"
                                value={guest.dateOfBirth ?? ''}
                                onChange={(e) =>
                                    onUpdateGuest(roomIndex, guestIndex, 'dateOfBirth', e.target.value)
                                }
                                className="h-10 w-full rounded border border-gray-300 px-3 text-sm focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none"
                                aria-label={`${guest.guestType} dateOfBirth`}
                            />
                        </div>
                        <div>
                            <label className="mb-0.5 block text-xs font-medium text-gray-600">
                                {t('documentType')}
                            </label>
                            <select
                                value={guest.documentType ?? ''}
                                onChange={(e) => {
                                    const v = e.target.value
                                    onUpdateGuest(
                                        roomIndex,
                                        guestIndex,
                                        'documentType',
                                        v === '' ? undefined : Number(v)
                                    )
                                }}
                                className="h-10 w-full cursor-pointer rounded border border-gray-300 px-3 text-sm focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none"
                                aria-label={`${guest.guestType} documentType`}
                            >
                                <option value="">{t('documentTypePlaceholder')}</option>
                                <option value={1}>{t('documentTypeIdCard')}</option>
                                <option value={2}>{t('documentTypePassport')}</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="mb-0.5 block text-xs font-medium text-gray-600">
                                {t('documentNumber')}
                            </label>
                            <input
                                type="text"
                                value={guest.documentNumber ?? ''}
                                onChange={(e) =>
                                    onUpdateGuest(roomIndex, guestIndex, 'documentNumber', e.target.value)
                                }
                                className="h-10 w-full rounded border border-gray-300 px-3 text-sm focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none"
                                aria-label={`${guest.guestType} documentNumber`}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="mb-0.5 block text-xs font-medium text-gray-600">
                                {t('addressLine')}
                            </label>
                            <input
                                type="text"
                                value={guest.addressLine ?? ''}
                                onChange={(e) =>
                                    onUpdateGuest(roomIndex, guestIndex, 'addressLine', e.target.value)
                                }
                                className="h-10 w-full rounded border border-gray-300 px-3 text-sm focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none"
                                aria-label={`${guest.guestType} addressLine`}
                            />
                        </div>
                        <div>
                            <label className="mb-0.5 block text-xs font-medium text-gray-600">
                                {t('city')}
                            </label>
                            <input
                                type="text"
                                value={guest.city ?? ''}
                                onChange={(e) => onUpdateGuest(roomIndex, guestIndex, 'city', e.target.value)}
                                className="h-10 w-full rounded border border-gray-300 px-3 text-sm focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none"
                                aria-label={`${guest.guestType} city`}
                            />
                        </div>
                        <div className="flex items-end sm:col-span-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onOpenScanModal(roomIndex, guestIndex)}
                                className="border-teal-200 text-[#0E7C86] hover:bg-orange-50"
                                aria-label={t('scanDocument')}
                            >
                                {t('scanDocument')}
                            </Button>
                        </div>
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    )
}
