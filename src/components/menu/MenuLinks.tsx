'use client'

import { useTranslations } from 'next-intl'
import { JSX, memo } from 'react'

import { RoomClassWithSlug } from '@/types/room'

import MenuLink from './MenuLink'

// interface GalleryCategory {
//     id: number
//     name: string
//     label: string
//     description: string | null
//     displayOrder: number
//     isActive: boolean
// }

interface MenuLinksProps {
    isMobile?: boolean
    roomClasses: RoomClassWithSlug[]
    // galleryCategories: GalleryCategory[]
}

const MenuLinks = ({ isMobile, roomClasses }: MenuLinksProps): JSX.Element => {
    const menuTrans = useTranslations('Menu')

    return (
        <>
            <MenuLink
                text={menuTrans('hotelVillas')}
                items={[]} // Empty array to trigger submenu
                isMobile={isMobile}
                isHotelVillas={true}
                roomClasses={roomClasses}
            />
            <MenuLink
                text={menuTrans('gallery')}
                // galleryCategories={galleryCategories}
                isMobile={isMobile}
                href="/gallery"
            />
            <MenuLink text={menuTrans('videos')} isMobile={isMobile} href="/videos" />
            <MenuLink
                text={menuTrans('libong')}
                items={[menuTrans('history'), menuTrans('gettingHere'), menuTrans('libongGuideMap')]}
                isMobile={isMobile}
            />
            <MenuLink text={menuTrans('dining')} isMobile={isMobile} href="/dining" />
            <MenuLink
                text={menuTrans('activities')}
                items={[
                    menuTrans('travelTrangSea'),
                    menuTrans('kohRok'),
                    menuTrans('viewDugong'),
                    menuTrans('othersActivities')
                ]}
                isMobile={isMobile}
            />
            <MenuLink
                text={menuTrans('specialOffers')}
                isMobile={isMobile}
                href="/special-offers"
            />
            <MenuLink
                text={menuTrans('contact')}
                isMobile={isMobile}
                href="/contact"
                isLast={true}
            />
        </>
    )
}

MenuLinks.displayName = 'MenuLinks'

export default memo(MenuLinks)
