import { useEffect, useMemo, useRef, useState } from 'react'

interface TimeSelectorProps {
    value?: string
    onChange: (_time: string) => void
    disabled?: boolean
    id?: string
}

export function TimeSelector({ value, onChange, disabled = false, id = 'time-selector' }: TimeSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const timeOptions = useMemo(() => {
        return Array.from({ length: 24 * 4 }, (_, i) => {
            const totalMinutes = i * 15
            const h = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
            const m = String(totalMinutes % 60).padStart(2, '0')
            return `${h}:${m}`
        })
    }, [])

    useEffect(() => {
        const handleOutside = (e: MouseEvent | TouchEvent) => {
            if (!isOpen) return
            const el = containerRef.current
            if (el && !el.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleOutside)
        document.addEventListener('touchstart', handleOutside)
        return () => {
            document.removeEventListener('mousedown', handleOutside)
            document.removeEventListener('touchstart', handleOutside)
        }
    }, [isOpen])

    return (
        <div className="relative w-full" ref={containerRef}>
            <button
                type="button"
                id={id}
                onClick={() => setIsOpen((o) => !o)}
                disabled={disabled}
                className="h-11 w-full rounded-md border border-gray-300 px-4 text-left text-base text-gray-800 focus:border-[#0E7C86] focus:ring-[#0E7C86] focus:outline-none">
                {value || '--'}
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 z-10 mt-2 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                    <div className="max-h-56 overflow-y-auto">
                        {timeOptions.map((time) => (
                            <button
                                key={time}
                                type="button"
                                onClick={() => {
                                    onChange(time)
                                    setIsOpen(false)
                                }}
                                disabled={disabled}
                                className="flex h-11 w-full items-center px-3 text-left hover:bg-orange-50">
                                {time}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
