'use client'

import Image from 'next/image'

import { Link } from '@/i18n/routing'
import { cn } from '@/lib/utils'

interface LogoProps {
    className?: string
    isNeedChangeColor?: boolean
}

const Logo = ({ className }: LogoProps) => {
    return (
        <Link
            href="/"
            className={cn('hidden xl:flex items-center absolute right-5 top-10 z-50', className)}
            style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }}
        >
            <Image
                src="/images/logo-saiyuan.svg"
                alt="Saiyuan Beach Resort"
                width={170}
                height={78}
                priority
                unoptimized
            />
        </Link>
    )
}

export default Logo
