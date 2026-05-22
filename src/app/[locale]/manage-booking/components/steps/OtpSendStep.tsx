'use client'

import React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface OtpSendStepProps {
    email: string
    onEmailChange: (value: string) => void
    onSend: () => void
    isLoading: boolean
    title: string
    backToSearchLabel: string
    emailLabel: string
    sendButtonLabel: string
    sendingLabel: string
    onBack: () => void
}

export function OtpSendStep({
    email,
    onEmailChange,
    onSend,
    isLoading,
    title,
    backToSearchLabel,
    emailLabel,
    sendButtonLabel,
    sendingLabel,
    onBack
}: OtpSendStepProps) {
    return (
        <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{title}</CardTitle>
                <Button variant="outline" size="sm" onClick={onBack}>
                    {backToSearchLabel}
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    placeholder={emailLabel}
                    className="h-11 w-full rounded-md border border-gray-300 px-4 text-base focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none"
                    aria-label={emailLabel}
                />
                <Button
                    onClick={onSend}
                    disabled={isLoading}
                    className="w-full bg-[#0E7C86] hover:bg-orange-800"
                >
                    {isLoading ? sendingLabel : sendButtonLabel}
                </Button>
            </CardContent>
        </Card>
    )
}
