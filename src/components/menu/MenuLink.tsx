'use client'

import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import React from 'react'

import { Link } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import { RoomClassWithSlug } from '@/types/room'

import HotelVillasSubmenu from './HotelVillasSubmenu'
import { SubMenu } from './SubMenu'

interface GalleryCategory {
    id: number
    name: string
    label: string
    description: string | null
    displayOrder: number
    isActive: boolean
}

interface MenuLinkProps {
    text: string
    items?: string[]
    isMobile?: boolean
    isLast?: boolean
    isHotelVillas?: boolean
    roomClasses?: RoomClassWithSlug[]
    galleryCategories?: GalleryCategory[]
    href?: string
}

const MenuLink = ({
    text,
    items,
    isMobile,
    isLast = false,
    isHotelVillas = false,
    roomClasses = [],
    galleryCategories = [],
    href
}: MenuLinkProps): React.JSX.Element => {
    const [isSubMenuOpen, setIsSubMenuOpen] = useState(false)

    const handleToggleSubMenu = React.useCallback(() => {
        setIsSubMenuOpen((prev) => !prev)
    }, [])

    // Determine if this should be a link and/or has submenu
    const hasSubMenu = React.useMemo(() => {
        return (
            (items && items.length > 0) ||
            (isHotelVillas && roomClasses.length > 0) ||
            (galleryCategories && galleryCategories.length > 0)
        )
    }, [items, isHotelVillas, roomClasses.length, galleryCategories.length])

    const shouldBeLink = !!href

    return (
        <div
            id={`menu-link-${text.toLowerCase().replace(/ /g, '-')}`}
            className={cn(
                'group relative',
                isMobile ? 'border-b border-white/10 pb-2 last:border-b-0' : 'flex items-center',
                !isMobile &&
                    !isLast &&
                    "after:content-[''] after:absolute after:right-[-1px] after:top-1/2 after:-translate-y-1/2 after:h-4 after:w-[1px] after:bg-[#7d7d7d]"
            )}>
            {isMobile ? (
                // Mobile: Handle both link and submenu
                <button
                    type="button"
                    className="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent p-0 pr-4 text-left"
                    onClick={hasSubMenu ? handleToggleSubMenu : undefined}>
                    {shouldBeLink ? (
                        <Link href={href} className="flex-1">
                            <span className="text-[.9em] font-semibold text-white hover:text-[#0a6570]">{text}</span>
                        </Link>
                    ) : (
                        <span className="flex-1 text-[.9em] font-semibold text-white hover:text-[#0a6570]">
                            {text}
                        </span>
                    )}
                    {hasSubMenu && (
                        <span className="pointer-events-none ml-2">
                            {isSubMenuOpen ? (
                                <Minus className="h-4 w-4 text-white/80" />
                            ) : (
                                <Plus className="h-4 w-4 text-white/80" />
                            )}
                        </span>
                    )}
                </button>
            ) : (
                // Desktop: Hover behavior
                <div className="flex items-center">
                    {shouldBeLink ? (
                        <Link href={href} className="cursor-pointer py-2.5">
                            <span className="relative cursor-pointer text-sm font-normal whitespace-nowrap hover:text-[#0a6570]">
                                {text}
                            </span>
                        </Link>
                    ) : (
                        <span className="relative cursor-default text-sm font-normal whitespace-nowrap hover:text-[#0a6570]">
                            {text}
                        </span>
                    )}
                </div>
            )}

            {hasSubMenu &&
                (!isMobile || isSubMenuOpen) &&
                (isHotelVillas ? (
                    <HotelVillasSubmenu isMobile={isMobile} roomClasses={roomClasses} />
                ) : galleryCategories && galleryCategories.length > 0 ? (
                    <SubMenu title={text} galleryCategories={galleryCategories} isMobile={isMobile} showTitle={false} />
                ) : (
                    <SubMenu title={text} items={items || []} isMobile={isMobile} showTitle={false} />
                ))}
        </div>
    )
}

MenuLink.displayName = 'MenuLink'

export default MenuLink
