'use client'

import { DotIcon } from 'lucide-react'
import React from 'react'

import { Link } from '@/i18n/routing'
import { cn, createSlugFromName } from '@/lib/utils'

interface GalleryCategory {
    id: number
    name: string
    label: string
    description: string | null
    displayOrder: number
    isActive: boolean
}

interface SubMenuProps {
    title: string
    items?: string[]
    galleryCategories?: GalleryCategory[]
    isMobile?: boolean
    showTitle?: boolean
}

// Function to generate proper URLs for menu items
const getMenuItemUrl = (title: string, item: string): string => {
    // const normalizeForUrl = (text: string) =>
    //     text
    //         .toLowerCase()
    //         .replace(/\s+/g, '-')
    //         .replace(/[&]/g, '-')
    //         .replace(/[^a-z0-9-]/g, '')
    //         .replace(/-+/g, '-')
    //         .replace(/^-|-$/g, '')

    // Handle both English and Thai titles
    const titleUpper = title.toUpperCase()

    // Libong menu items
    if (titleUpper === 'LIBONG' || title === 'เกาะลิบง') {
        switch (item) {
            case 'History':
            case 'ประวัติศาสตร์':
                return '/libong/history'
            case 'Getting Here':
            case 'การเดินทางมา':
                return '/libong/getting-here'
            case 'Libong Guide Map':
            case 'แผนที่ท่องเที่ยวเกาะลิบง':
                return '/libong/libong-guide-map'
            default:
                return '#'
        }
    }

    // Gallery menu items
    if (titleUpper === 'GALLERY' || title === 'รูปภาพ') {
        switch (item) {
            case 'Resort & Beach':
            case 'รีสอร์ทและชายหาด':
                return '/gallery/resort-and-beach'
            case 'Restaurant':
            case 'ร้านอาหาร':
                return '/gallery/restaurant'
            case 'Swimming Pool':
            case 'สระว่ายน้ำ':
                return '/gallery/swimming-pool'
            default:
                return '/gallery'
        }
    }

    // Activities menu items
    if (titleUpper === 'ACTIVITIES' || title === 'กิจกรรม') {
        switch (item) {
            case 'Travel Trang Sea':
            case 'ท่องเที่ยวทะเลตรัง':
                return `/activities/travel-trang-sea`
            case 'Koh Rok':
            case 'เกาะรอก':
                return `/activities/koh-rok`
            case 'View Dugong':
            case 'ชมพะยูน':
                return `/activities/view-dugong`
            case 'Others Activities':
            case 'กิจกรรมอื่นๆ':
                return `/activities/other-activities`
            default:
                return `/activities`
        }
    }

    return '#'
}

export const SubMenu = React.memo(
    ({ title, items, galleryCategories, isMobile, showTitle = false }: SubMenuProps): React.JSX.Element => {
        // If galleryCategories is provided, use it; otherwise fall back to items
        const displayItems = React.useMemo(() => {
            if (galleryCategories && galleryCategories.length > 0) {
                return galleryCategories.map((cat) => ({
                    label: cat.label,
                    url: `/gallery/${createSlugFromName(cat.name)}`,
                    id: cat.id
                }))
            }
            return (items || []).map((item) => ({
                label: item,
                url: getMenuItemUrl(title, item),
                id: item
            }))
        }, [galleryCategories, items, title])

        return (
            <div
                className={cn(
                    isMobile
                        ? 'flex flex-col pl-4 pt-2 space-y-2'
                        : 'absolute left-0 top-full z-[200] hidden min-w-[280px] flex-col bg-black/90 py-2 group-hover:flex'
                )}>
                <div className={cn('flex flex-col px-0 xl:px-4', !isMobile && 'max-h-[300px] overflow-y-auto')}>
                    {showTitle && (
                        <h3 className="border-b border-orange-500/30 py-2 text-[1em] font-bold text-[#0E7C86]">
                            {title}
                        </h3>
                    )}
                    {displayItems.map((item, index) => (
                        <Link
                            key={typeof item.id === 'number' ? item.id : `${item.label}-${index}`}
                            href={item.url}
                            className={cn(
                                'py-2',
                                isMobile ? 'text-[.85em] text-white/80' : 'text-[.9em] text-white',
                                'transition-colors hover:text-[#0a6570] font-light'
                            )}>
                            <DotIcon className="inline-block h-6 w-6 text-white xl:hidden" />
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>
        )
    },
    (prevProps, nextProps) => {
        // Custom comparison function for better memoization
        if (prevProps.title !== nextProps.title) return false
        if (prevProps.isMobile !== nextProps.isMobile) return false
        if (prevProps.showTitle !== nextProps.showTitle) return false
        if (prevProps.items?.length !== nextProps.items?.length) return false
        if (prevProps.items && nextProps.items) {
            if (prevProps.items.some((item, idx) => item !== nextProps.items?.[idx])) return false
        }
        if (prevProps.galleryCategories?.length !== nextProps.galleryCategories?.length) return false
        if (prevProps.galleryCategories && nextProps.galleryCategories) {
            if (prevProps.galleryCategories.some((cat, idx) => cat.id !== nextProps.galleryCategories?.[idx]?.id))
                return false
        }
        return true
    }
)

SubMenu.displayName = 'SubMenu'
