'use client'

import React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface SearchStepProps {
    query: string
    onQueryChange: (value: string) => void
    onSearch: () => void
    isLoading: boolean
    placeholder: string
    title: string
    searchButtonLabel: string
    searchingLabel: string
}

export function SearchStep({
    query,
    onQueryChange,
    onSearch,
    isLoading,
    placeholder,
    title,
    searchButtonLabel,
    searchingLabel
}: SearchStepProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') onSearch()
    }

    return (
        <Card className="border-gray-200">
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="h-11 w-full rounded-md border border-gray-300 px-4 text-base focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none"
                    aria-label={placeholder}
                />
                <Button
                    onClick={onSearch}
                    disabled={isLoading}
                    className="w-full bg-[#0E7C86] hover:bg-orange-800"
                >
                    {isLoading ? searchingLabel : searchButtonLabel}
                </Button>
            </CardContent>
        </Card>
    )
}
