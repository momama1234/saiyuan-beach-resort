'use client'

import { CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useEffect } from 'react'

import { Button } from '@/components/ui/button'

export default function ContactBookingSuccessClient() {
    const t = useTranslations('ContactBooking')
    const router = useRouter()

    useEffect(() => {
        const originalBackground = document.body.style.backgroundColor
        document.body.style.backgroundColor = 'white'
        return () => {
            document.body.style.backgroundColor = originalBackground
        }
    }, [])

    return (
        <div className="mt-[42px] min-h-screen w-full bg-white">
            <div className="mx-auto w-full rounded-lg bg-white px-4 pt-6 pb-6 xl:w-[1024px] xl:px-6 xl:pt-12 xl:pb-12">
                <div className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="mb-6 h-16 w-16 text-green-600" />
                    <h1 className="mb-4 text-center text-2xl font-bold text-gray-900 xl:text-3xl">
                        {t('successTitle')}
                    </h1>
                    <p className="mb-8 max-w-md text-center text-gray-600">{t('successMessage')}</p>
                    <div className="flex gap-4">
                        <Button
                            onClick={() => router.push('/')}
                            className="bg-[#0a6570] px-8 py-2 font-semibold text-white hover:bg-[#0E7C86]">
                            {t('backToHome')}
                        </Button>
                        <Button onClick={() => router.push('/contact-booking')} variant="outline" className="px-8 py-2">
                            {t('submitAnother')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
