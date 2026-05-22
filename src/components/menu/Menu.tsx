'use client'

import { Menu as MenuIcon, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import React from 'react'

import { Link } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import { RoomClassWithSlug } from '@/types/room'

import MenuLinks from './MenuLinks'

const ReservationSection = dynamic(
    () => import('./ReservationSection').then((m) => ({ default: m.ReservationSection })),
    { ssr: false }
)

interface GalleryCategory {
    id: number
    name: string
    label: string
    description: string | null
    displayOrder: number
    isActive: boolean
}

interface MenuProps {
    roomClasses: RoomClassWithSlug[]
    galleryCategories: GalleryCategory[]
}

const Menu = React.memo(
    ({ roomClasses, galleryCategories: _galleryCategories }: MenuProps): React.JSX.Element => {
        const [menuOpen, setMenuOpen] = useState(false)
        const t = useTranslations('Common')

        const handleToggleMenu = React.useCallback(() => {
            setMenuOpen((prev) => !prev)
        }, [])

        const handleCloseMenu = React.useCallback(() => {
            setMenuOpen(false)
        }, [])

        React.useEffect(() => {
            if (menuOpen) {
                document.body.style.overflow = 'hidden'
            } else {
                document.body.style.overflow = 'unset'
            }
            return () => {
                document.body.style.overflow = 'unset'
            }
        }, [menuOpen])

        return (
            <>
                <div className="fixed top-0 left-0 z-[150] flex h-[42px] w-full items-center border-b border-black/80 bg-black text-[.9em] font-semibold text-white md:text-[.9em] lg:bg-black/90">
                    <div className="flex flex-1 items-center lg:flex-none lg:shrink-0">
                        {/* hamburger menu */}
                        <button
                            className="flex h-[42px] w-[45px] cursor-pointer items-center justify-center px-3 lg:hidden"
                            onClick={handleToggleMenu}
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
                            {menuOpen ? (
                                <X className="h-6 w-6 text-[#0E7C86] transition-colors hover:text-[#0a6570]" />
                            ) : (
                                <MenuIcon className="h-6 w-6 text-[#0E7C86] transition-colors hover:text-[#0a6570]" />
                            )}
                        </button>

                        <span className="flex shrink-0 items-center justify-center px-2 text-center md:w-auto md:px-4">
                            <Link href="/">
                                <span className="font-cormorant text-xl font-semibold tracking-wide text-[#0E7C86]">
                                    Saiyuan Beach Resort
                                </span>
                            </Link>
                        </span>
                        <div
                            id="mobile-menu"
                            className={cn(
                                'fixed left-0 top-[42px] z-[150] flex h-[calc(100vh-42px)] w-[300px] flex-col gap-2 bg-black/90 p-4 overflow-y-auto xl:hidden',
                                menuOpen ? 'translate-x-0' : '-translate-x-full',
                                'transition-transform duration-300 ease-out'
                            )}>
                            <MenuLinks isMobile roomClasses={roomClasses} />
                        </div>
                    </div>

                    <div className="hidden flex-1 justify-start xl:flex xl:[&>*]:px-2 2xl:[&>*]:px-4">
                        <MenuLinks roomClasses={roomClasses} />
                    </div>

                    <div className="flex h-[42px] shrink-0 items-center">
                        <ReservationSection />
                    </div>
                </div>

                {/* Mobile menu overlay */}
                {menuOpen && <div className="fixed inset-0 z-[140] cursor-pointer bg-black/50 xl:hidden" onClick={handleCloseMenu} />}
            </>
        )
    },
    (prevProps, nextProps) => {
        // Custom comparison function
        if (prevProps.roomClasses.length !== nextProps.roomClasses.length) return false
        // เพิ่มการตรวจสอบ null/undefined สำหรับ galleryCategories
        const prevGalleryCategories = prevProps.galleryCategories || []
        const nextGalleryCategories = nextProps.galleryCategories || []
        if (prevGalleryCategories.length !== nextGalleryCategories.length) return false
        if (prevProps.roomClasses.some((room, idx) => room.id !== nextProps.roomClasses[idx]?.id)) return false
        if (prevGalleryCategories.some((cat, idx) => cat.id !== nextGalleryCategories[idx]?.id)) return false
        return true
    }
)

Menu.displayName = 'Menu'

export default Menu
