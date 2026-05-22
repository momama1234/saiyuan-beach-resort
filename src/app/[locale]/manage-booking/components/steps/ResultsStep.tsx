'use client'

import React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { PreCheckinBookingItem } from '../../types/manage-booking-types'
import { BookingDetails } from '../BookingDetails'

export interface ResultsStepProps {
    bookings: PreCheckinBookingItem[]
    onSelectBooking: (booking: PreCheckinBookingItem) => void
    onBackToSearch: () => void
    title: string
    backToSearchLabel: string
    noResultsLabel: string
}

export function ResultsStep({
    bookings,
    onSelectBooking,
    onBackToSearch,
    title,
    backToSearchLabel,
    noResultsLabel
}: ResultsStepProps) {
    return (
        <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{title}</CardTitle>
                <Button variant="outline" size="sm" onClick={onBackToSearch}>
                    {backToSearchLabel}
                </Button>
            </CardHeader>
            <CardContent className="space-y-3">
                {bookings.length === 0 ? (
                    <p className="text-gray-600">{noResultsLabel}</p>
                ) : (
                    bookings.map((booking) => (
                        <BookingDetails
                            key={booking.id}
                            booking={booking}
                            asButton
                            onClick={() => onSelectBooking(booking)}
                        />
                    ))
                )}
            </CardContent>
        </Card>
    )
}
