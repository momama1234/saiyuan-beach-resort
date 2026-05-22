'use client'

import React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface OtpVerifyStepProps {
    otpCode: string
    onOtpCodeChange: (value: string) => void
    onVerify: () => void
    isLoading: boolean
    isCodeComplete: boolean
    title: string
    description: string
    placeholder: string
    verifyButtonLabel: string
    verifyingLabel: string
}

export function OtpVerifyStep({
    otpCode,
    onOtpCodeChange,
    onVerify,
    isLoading,
    isCodeComplete,
    title,
    description,
    placeholder,
    verifyButtonLabel,
    verifyingLabel
}: OtpVerifyStepProps) {
    return (
        <Card className="border-gray-200">
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
                <p className="text-sm text-gray-500">{description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => onOtpCodeChange(e.target.value.replace(/\D/g, ''))}
                    placeholder={placeholder}
                    className="h-11 w-full rounded-md border border-gray-300 px-4 text-center text-lg tracking-widest focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none"
                    aria-label={title}
                />
                <Button
                    onClick={onVerify}
                    disabled={isLoading || !isCodeComplete}
                    className="w-full bg-[#0E7C86] hover:bg-orange-800"
                >
                    {isLoading ? verifyingLabel : verifyButtonLabel}
                </Button>
            </CardContent>
        </Card>
    )
}
