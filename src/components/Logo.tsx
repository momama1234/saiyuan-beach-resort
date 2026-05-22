'use client'

import { Link } from '@/i18n/routing'
import { cn } from '@/lib/utils'

interface LogoProps {
    className?: string
    isNeedChangeColor?: boolean
}

const Logo = ({ className, isNeedChangeColor }: LogoProps) => {
    const textColor = isNeedChangeColor ? 'text-[#14302E]' : 'text-[#0E7C86]'

    return (
        <Link href="/" className={cn('hidden xl:flex items-center gap-3 absolute right-4 top-14 z-50', className)}>
            <span
                className={cn(
                    'font-cormorant text-2xl font-semibold tracking-wide leading-tight',
                    textColor
                )}>
                Saiyuan
                <span className="block text-sm font-light tracking-widest uppercase opacity-80">Beach Resort</span>
            </span>
        </Link>
    )
}

export default Logo
