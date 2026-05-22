export type CountdownDisplay =
    | { kind: 'hours'; hours: number; minutes: number }
    | { kind: 'minutes'; value: number }
    | { kind: 'seconds'; value: number }
    | { kind: 'expired' }

export function computeCountdown(
    expiresAt: string | null | undefined,
    now: Date = new Date()
): CountdownDisplay | null {
    if (!expiresAt) return null
    const diffMs = new Date(expiresAt).getTime() - now.getTime()
    if (Number.isNaN(diffMs)) return null
    if (diffMs <= 0) return { kind: 'expired' }
    if (diffMs >= 3_600_000) {
        const totalMinutes = Math.ceil(diffMs / 60_000)
        return { kind: 'hours', hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 }
    }
    if (diffMs > 60_000) {
        return { kind: 'minutes', value: Math.ceil(diffMs / 60_000) }
    }
    return { kind: 'seconds', value: Math.ceil(diffMs / 1000) }
}
