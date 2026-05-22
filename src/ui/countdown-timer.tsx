import React, { useEffect, useState } from 'react'

export interface CountdownTimerProps {
    timeRemaining: number
    onExpire?: () => void
    className?: string
    warningThresholdMs?: number
    label?: string
    warningText?: string
    expiredText?: string
    clockIcon?: React.ReactNode
    expiredIcon?: React.ReactNode
}

/**
 * Shared countdown timer component for lock/session style timers.
 */
export function CountdownTimer({
    timeRemaining,
    onExpire,
    className = '',
    warningThresholdMs = 2 * 60 * 1000,
    label = 'Time remaining',
    warningText = 'Hurry up!',
    expiredText = 'Time expired',
    clockIcon,
    expiredIcon
}: CountdownTimerProps) {
    const [hasWarned, setHasWarned] = useState(false)

    const minutes = Math.floor(timeRemaining / 60000)
    const seconds = Math.floor((timeRemaining % 60000) / 1000)

    const isWarning = timeRemaining <= warningThresholdMs && timeRemaining > 0
    const isExpired = timeRemaining <= 0

    useEffect(() => {
        if (isExpired && onExpire) {
            onExpire()
        }
    }, [isExpired, onExpire])

    useEffect(() => {
        if (isWarning && !hasWarned) {
            const timer = setTimeout(() => {
                setHasWarned((prev) => (prev ? prev : true))
            }, 0)

            return () => clearTimeout(timer)
        }
    }, [isWarning, hasWarned])

    if (isExpired) {
        return (
            <div
                className={`flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 ${className}`}>
                <span aria-hidden="true" className="text-sm">
                    {expiredIcon ?? '!'}
                </span>
                <span className="font-semibold">{expiredText}</span>
            </div>
        )
    }

    return (
        <div
            className={`flex items-center gap-2 rounded-lg border py-3 px-5 ${
                isWarning ? 'animate-pulse border-teal-200 bg-orange-50 text-[#0E7C86]' : 'bg-teal-50 text-teal-700'
            } ${className}`}>
            <span aria-hidden="true" className="text-base">
                {clockIcon ?? 'o'}
            </span>
            <div className="flex flex-row justify-between items-center w-full">
                <span className="text-sm font-medium opacity-75">{label}</span>
                <div className="flex gap-2 items-center">
                    <span className="font-mono text-xl font-bold">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </span>
                    {isWarning && <span className="ml-auto text-md font-medium">{warningText}</span>}
                </div>
            </div>
        </div>
    )
}
