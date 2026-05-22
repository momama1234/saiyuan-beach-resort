'use client'

import { AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'

interface PaymentCancelledModalProps {
    open: boolean
    bookingId: number | null
    paymentUrl: string | null
    onResume: () => void
    onClose: () => void
}

export function PaymentCancelledModal({
    open,
    bookingId,
    paymentUrl,
    onResume,
    onClose
}: PaymentCancelledModalProps) {
    const t = useTranslations('PaymentCancelled')

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) onClose()
            }}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader className="items-center text-center">
                    <AlertTriangle className="h-12 w-12 text-amber-500" />
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>
                        {bookingId ? t('descriptionWithId', { bookingId }) : t('description')}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-row justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        {t('close')}
                    </Button>
                    {paymentUrl ? (
                        <Button onClick={onResume} className="bg-[#0E7C86] text-white hover:bg-[#0a6570]">
                            {t('resumePayment')}
                        </Button>
                    ) : null}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
