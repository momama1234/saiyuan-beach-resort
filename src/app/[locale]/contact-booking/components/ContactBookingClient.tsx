'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useEffect } from 'react'

import { useContactBookingFlow } from '@/hooks/useContactBookingFlow'
import { AvailableRoomClass } from '@/types/room-management'

import { ContactBookingForm } from './ContactBookingForm'

interface InitialSearchParams {
    checkIn?: string
    checkOut?: string
    adults?: string
    children?: string
    roomClassId?: string
}

interface ContactBookingClientProps {
    initialSearchParams: InitialSearchParams
    initialRoomClasses: AvailableRoomClass[]
}

export function ContactBookingClient({ initialSearchParams, initialRoomClasses }: ContactBookingClientProps) {
    const t = useTranslations('ContactBooking')
    const router = useRouter()

    const {
        bookingDetails,
        guestInfo,
        selectedRooms,
        roomClasses,
        isLoading,
        isSubmitting,
        updateBookingDetails,
        updateGuestInfo,
        updateRoomQuantity,
        fetchRoomAvailability,
        submitContactBooking
    } = useContactBookingFlow()

    useEffect(() => {
        if (initialSearchParams.checkIn && initialSearchParams.checkOut) {
            updateBookingDetails({
                checkInDate: initialSearchParams.checkIn,
                checkOutDate: initialSearchParams.checkOut,
                adults: initialSearchParams.adults || '1',
                children: initialSearchParams.children || '0'
            })

            if (initialRoomClasses.length > 0) {
                if (initialSearchParams.roomClassId) {
                    const roomId = parseInt(initialSearchParams.roomClassId, 10)
                    if (!isNaN(roomId)) {
                        setTimeout(() => {
                            updateRoomQuantity(roomId, 1)
                        }, 100)
                    }
                }
            } else {
                fetchRoomAvailability({
                    checkIn: initialSearchParams.checkIn,
                    checkOut: initialSearchParams.checkOut,
                    adults: initialSearchParams.adults || '1',
                    children: initialSearchParams.children || '0'
                }).then(() => {
                    if (initialSearchParams.roomClassId) {
                        const roomId = parseInt(initialSearchParams.roomClassId, 10)
                        if (!isNaN(roomId)) {
                            updateRoomQuantity(roomId, 1)
                        }
                    }
                })
            }
        }
    }, [])

    useEffect(() => {
        const originalBackground = document.body.style.backgroundColor
        document.body.style.backgroundColor = 'white'
        return () => {
            document.body.style.backgroundColor = originalBackground
        }
    }, [])

    const handleSubmit = async () => {
        try {
            await submitContactBooking()
            router.push('/contact-booking/success')
        } catch (error) {
            console.error('Error submitting contact booking:', error)
        }
    }

    const displayRoomClasses = roomClasses.length > 0 ? roomClasses : initialRoomClasses

    return (
        <div className="mt-[42px] min-h-screen w-full bg-white">
            <div className="mx-auto w-full rounded-lg bg-white px-4 pt-6 pb-6 xl:w-[1024px] xl:px-6 xl:pt-12 xl:pb-12">
                <div className="mb-8">
                    <h1 className="mb-2 text-2xl font-bold text-[#0E7C86] xl:text-3xl">{t('title')}</h1>
                    <p className="text-gray-600">{t('description')}</p>
                </div>

                <ContactBookingForm
                    bookingDetails={bookingDetails}
                    guestInfo={guestInfo}
                    selectedRooms={selectedRooms}
                    roomClasses={displayRoomClasses}
                    isLoading={isLoading}
                    isSubmitting={isSubmitting}
                    onUpdateBookingDetails={updateBookingDetails}
                    onUpdateGuestInfo={updateGuestInfo}
                    onUpdateRoomQuantity={updateRoomQuantity}
                    onFetchRoomAvailability={fetchRoomAvailability}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    )
}
