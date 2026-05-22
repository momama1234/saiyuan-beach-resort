'use client'

import React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface VerifyBookingCodeStepProps {
    bookingCode: string
    onBookingCodeChange: (value: string) => void
    lastName: string
    onLastNameChange: (value: string) => void
    email: string
    onEmailChange: (value: string) => void
    onVerify: () => void
    isLoading: boolean
    title: string
    description: string
    bookingCodeLabel: string
    bookingCodePlaceholder: string
    lastNameLabel: string
    lastNamePlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    lastNameOrEmailHint: string
    verifyButtonLabel: string
    verifyingLabel: string
}

export function VerifyBookingCodeStep({
    bookingCode,
    onBookingCodeChange,
    lastName,
    onLastNameChange,
    email,
    onEmailChange,
    onVerify,
    isLoading,
    title,
    description,
    bookingCodeLabel,
    bookingCodePlaceholder,
    lastNameLabel,
    lastNamePlaceholder,
    emailLabel,
    emailPlaceholder,
    lastNameOrEmailHint,
    verifyButtonLabel,
    verifyingLabel
}: VerifyBookingCodeStepProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') onVerify()
    }

    return (
        <Card className="border-gray-200">
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
                <p className="text-sm text-gray-500">{description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label htmlFor="bookingCode" className="mb-1 block text-sm font-medium text-gray-700">
                        {bookingCodeLabel} <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="bookingCode"
                        type="text"
                        value={bookingCode}
                        onChange={(e) => onBookingCodeChange(e.target.value.toUpperCase())}
                        onKeyDown={handleKeyDown}
                        placeholder={bookingCodePlaceholder}
                        className="h-11 w-full rounded-md border border-gray-300 px-4 font-mono text-base focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none"
                        aria-required="true"
                        aria-label={bookingCodeLabel}
                    />
                </div>
                <div>
                    <label htmlFor="lastNameForVerify" className="mb-1 block text-sm font-medium text-gray-700">
                        {lastNameLabel}
                    </label>
                    <input
                        id="lastNameForVerify"
                        type="text"
                        value={lastName}
                        onChange={(e) => onLastNameChange(e.target.value)}
                        placeholder={lastNamePlaceholder}
                        className="h-11 w-full rounded-md border border-gray-300 px-4 text-base focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none"
                        aria-label={lastNameLabel}
                    />
                </div>
                <div>
                    <label htmlFor="emailForVerify" className="mb-1 block text-sm font-medium text-gray-700">
                        {emailLabel}
                    </label>
                    <input
                        id="emailForVerify"
                        type="email"
                        value={email}
                        onChange={(e) => onEmailChange(e.target.value)}
                        placeholder={emailPlaceholder}
                        className="h-11 w-full rounded-md border border-gray-300 px-4 text-base focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none"
                        aria-label={emailLabel}
                    />
                    <p className="mt-1 text-xs text-gray-500">{lastNameOrEmailHint}</p>
                </div>
                <Button
                    onClick={onVerify}
                    disabled={isLoading}
                    className="w-full bg-[#0E7C86] hover:bg-orange-800"
                >
                    {isLoading ? verifyingLabel : verifyButtonLabel}
                </Button>
            </CardContent>
        </Card>
    )
}
