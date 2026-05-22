import { useTranslations } from 'next-intl'
import React, { memo } from 'react'

import { useCurrentStep } from '@/features/reservation/stores/step-navigation-store'
import { cn } from '@/lib/utils'

interface ProgressIndicatorProps {
    steps?: Array<{ label: string; description?: string }>
}

export const ProgressIndicator = memo(({ steps }: ProgressIndicatorProps) => {
    const t = useTranslations('BookingSteps')
    const currentStep = useCurrentStep()

    const defaultSteps = [{ label: t('chooseRoom') }, { label: t('guestInformation') }, { label: t('confirmBooking') }]

    const finalSteps = steps || defaultSteps
    return (
        <div className="mb-8">
            <div
                id="progress-indicator"
                className="flex flex-row items-start justify-center space-x-2 md:items-center md:space-x-4">
                {finalSteps.map((step, index) => {
                    const stepNumber = index + 1
                    const isActive = currentStep >= stepNumber
                    const isLast = stepNumber === finalSteps.length // Use finalSteps.length instead of totalSteps

                    return (
                        <React.Fragment key={stepNumber}>
                            <div
                                className={cn(
                                    isActive ? 'text-[#0E7C86]' : 'text-gray-700',
                                    'flex flex-col items-center space-y-2 md:flex-row md:space-x-2'
                                )}>
                                <div
                                    className={cn(
                                        isActive ? 'border-teal-200 ' : 'border-gray-300 ',
                                        'p-1 border-2 rounded-full'
                                    )}>
                                    <div
                                        className={cn(
                                            isActive
                                                ? 'bg-[#0E7C86] border-orange-700 text-white'
                                                : 'bg-gray-900 text-white',
                                            'xl:w-9 xl:h-9 w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium'
                                        )}>
                                        {stepNumber}
                                    </div>
                                </div>
                                <span
                                    className={cn(
                                        isActive ? ' font-medium' : 'font-normal',
                                        'text-xs md:text-base text-center md:text-left'
                                    )}>
                                    {step.label}
                                </span>
                            </div>
                            {!isLast && (
                                <div
                                    className={cn(
                                        currentStep >= stepNumber + 1 ? 'bg-[#0E7C86]' : 'bg-gray-700',
                                        'h-px w-9 mt-4 md:mt-0'
                                    )}></div>
                            )}
                        </React.Fragment>
                    )
                })}
            </div>
        </div>
    )
})

ProgressIndicator.displayName = 'ProgressIndicator'
