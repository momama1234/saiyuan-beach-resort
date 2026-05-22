'use client'

import { PENDING_BOOKING_WARNING_TIME_MS } from '@/shared/constants/pending-booking'
import { CountdownTimer as SharedCountdownTimer } from '@/ui/countdown-timer'
import { AlertCircle, Clock } from 'lucide-react'
import React from 'react'

interface CountdownTimerProps {
    timeRemaining: number
    onExpire?: () => void
    className?: string
}

export function CountdownTimer({ timeRemaining, onExpire, className = '' }: CountdownTimerProps) {
    return (
        <SharedCountdownTimer
            timeRemaining={timeRemaining}
            onExpire={onExpire}
            className={className}
            warningThresholdMs={PENDING_BOOKING_WARNING_TIME_MS}
            clockIcon={<Clock className="h-10 w-10" />}
            expiredIcon={<AlertCircle className="h-10 w-10" />}
        />
    )
}
