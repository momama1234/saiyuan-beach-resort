'use client'

import { Link } from '@/i18n/routing'
import { cn } from '@/lib/utils'

interface LogoProps {
    className?: string
    isNeedChangeColor?: boolean
}

const Logo = ({ className, isNeedChangeColor }: LogoProps) => {
    const color = isNeedChangeColor ? '#14302E' : '#ffffff'

    return (
        <Link href="/" className={cn('hidden xl:flex items-center absolute right-5 top-12 z-50 drop-shadow-lg', className)}>
            <svg
                viewBox="0 0 210 78"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Saiyuan Beach Resort"
                style={{ color }}
                className="w-[160px] h-auto"
            >
                <line x1="0" y1="1" x2="210" y2="1" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
                <text
                    x="105" y="42"
                    fontFamily="Georgia, 'Times New Roman', serif"
                    fontSize="32"
                    fill="currentColor"
                    fontStyle="italic"
                    textAnchor="middle"
                    letterSpacing="1"
                >Saiyuan</text>
                <line x1="18" y1="50" x2="192" y2="50" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
                <text
                    x="105" y="64"
                    fontFamily="Georgia, 'Times New Roman', serif"
                    fontSize="9.5"
                    fill="currentColor"
                    letterSpacing="5"
                    textAnchor="middle"
                >BEACH RESORT</text>
                <line x1="0" y1="77" x2="210" y2="77" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
            </svg>
        </Link>
    )
}

export default Logo
