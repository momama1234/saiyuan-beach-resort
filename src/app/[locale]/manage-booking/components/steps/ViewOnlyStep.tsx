'use client'

import React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { PreCheckinBookingItem } from '../../types/manage-booking-types'
import { BookingDetails } from '../BookingDetails'

export interface ViewOnlyStepProps {
    selectedBooking: PreCheckinBookingItem
    onBackToSearch: () => void
    title: string
    backToSearchLabel: string
    noticeText: string
}

export function ViewOnlyStep({
    selectedBooking,
    onBackToSearch,
    title,
    backToSearchLabel,
    noticeText
}: ViewOnlyStepProps) {
    return (
        <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{title}</CardTitle>
                <Button variant="outline" size="sm" onClick={onBackToSearch}>
                    {backToSearchLabel}
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <BookingDetails booking={selectedBooking} />
                <p className="text-sm text-gray-600">{noticeText}</p>
            </CardContent>
        </Card>
    )
}
