'use client'

import { useTranslations } from 'next-intl'
import React from 'react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'

interface OccupancyWarningDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    totalCapacityAdults: number
    totalCapacityChildren: number
    guestAdults: number
    guestChildren: number
}

export function OccupancyWarningDialog({
    open,
    onOpenChange,
    onConfirm,
    totalCapacityAdults,
    totalCapacityChildren,
    guestAdults,
    guestChildren
}: OccupancyWarningDialogProps) {
    const t = useTranslations('chooseRoom.occupancyWarning')

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-sm:inset-0 max-sm:flex max-sm:h-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:flex-col max-sm:justify-center max-sm:rounded-none sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-[#0a6570]">{t('title')}</DialogTitle>
                </DialogHeader>

                <div className="space-y-3 text-sm text-gray-700">
                    <p>
                        {t('currentCapacity', {
                            totalAdults: totalCapacityAdults,
                            totalChildren: totalCapacityChildren
                        })}
                    </p>
                    <p className="font-medium text-gray-900">
                        {t('guestCount', {
                            adults: guestAdults,
                            children: guestChildren
                        })}
                    </p>
                    <p className="rounded-md bg-orange-50 px-3 py-2 text-[#0E7C86]">
                        {t('suggestion')}
                    </p>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('cancel')}
                    </Button>
                    <Button onClick={onConfirm} className="bg-[#0a6570] text-white hover:bg-[#0E7C86]">
                        {t('proceedAnyway')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
