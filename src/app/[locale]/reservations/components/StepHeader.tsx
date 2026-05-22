'use client'

import { useTranslations } from 'next-intl'
import React, { useMemo } from 'react'

import { useCurrentStep } from '@/features/reservation/stores/step-navigation-store'

export const StepHeader = (): React.JSX.Element => {
    const t = useTranslations('BookingSteps')
    const currentStep = useCurrentStep()

    const stepTitle = useMemo(() => {
        switch (currentStep) {
            case 1:
                return t('chooseRoom')
            case 2:
                return t('guestInformation')
            case 3:
                return t('confirmBooking')
            default:
                return t('chooseRoom')
        }
    }, [currentStep, t])

    const stepDescription = useMemo(() => {
        switch (currentStep) {
            case 1:
                return t('chooseRoomDescription')
            case 2:
                return t('guestInformationDescription')
            case 3:
                return t('confirmBookingDescription')
            default:
                return t('chooseRoomDescription')
        }
    }, [currentStep, t])

    return (
        <header className="mb-8 hidden text-center">
            <h1 className="mb-2 text-xl leading-tight font-medium tracking-tight text-[#0E7C86] uppercase">
                {stepTitle}
                <span className="mt-1 hidden text-lg text-gray-700 normal-case">{stepDescription}</span>
            </h1>
        </header>
    )
}
