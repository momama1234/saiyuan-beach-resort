'use client'

import React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface SuccessStepProps {
    onBackToSearch: () => void
    title: string
    message: string
    backToSearchLabel: string
}

export function SuccessStep({
    onBackToSearch,
    title,
    message,
    backToSearchLabel
}: SuccessStepProps) {
    return (
        <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
                <CardTitle className="text-lg text-green-800">{title}</CardTitle>
                <p className="text-gray-700">{message}</p>
            </CardHeader>
            <CardContent>
                <Button onClick={onBackToSearch} variant="outline" className="w-full">
                    {backToSearchLabel}
                </Button>
            </CardContent>
        </Card>
    )
}
